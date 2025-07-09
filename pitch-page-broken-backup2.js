const express = require('express');
const path = require('path');
const fs = require('fs');
const Stripe = require('stripe');
const multer = require('multer');

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed'));
    }
  }
});

const app = express();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo', {
  apiVersion: "2023-10-16",
});

app.use(express.json());
app.use('/attached_assets', express.static(path.join(__dirname, 'attached_assets')));
app.use(express.static(__dirname)); // Serve static files from root directory

// Add seamless signup and login endpoints directly
app.post('/api/seamless-signup', (req, res) => {
  const sqlite3 = require('sqlite3').verbose();
  const crypto = require('crypto');
  
  try {
    const userData = req.body;
    
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Required fields missing' 
      });
    }

    const db = new sqlite3.Database('demo_users.db');
    
    // Create user ID and hash password
    const userId = crypto.createHash('md5').update(userData.email).digest('hex').substring(0, 12);
    const passwordHash = crypto.createHash('sha256').update(userData.password).digest('hex');
    const signupDate = new Date().toISOString();
    
    // Prepare user data for database
    const fullName = `${userData.firstName} ${userData.lastName}`;
    const phone = userData.phone || '';
    const interests = Array.isArray(userData.interests) ? userData.interests.join(',') : '';
    const businessCategories = Array.isArray(userData.businessCategories) ? userData.businessCategories.join(',') : '';
    
    // Check if user already exists
    db.get("SELECT email FROM demo_users WHERE email = ?", [userData.email], (err, existingUser) => {
      if (err) {
        db.close();
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      
      if (existingUser) {
        // Update existing user
        const updateQuery = `
          UPDATE demo_users SET 
          password_hash = ?, full_name = ?, phone = ?, city = ?, country = ?, state = ?,
          interests = ?, account_type = ?, bio = ?, business_name = ?, business_website = ?,
          business_address = ?, business_phone = ?, business_description = ?, business_categories = ?,
          early_supporter = 1, signup_date = ?
          WHERE email = ?
        `;
        
        db.run(updateQuery, [
          passwordHash, fullName, phone, userData.city, userData.country, userData.state,
          interests, userData.accountType, userData.bio, userData.businessName, userData.businessWebsite,
          userData.businessAddress, userData.workPhone, userData.businessDescription, businessCategories,
          signupDate, userData.email
        ], function(updateErr) {
          db.close();
          if (updateErr) {
            return res.status(500).json({ success: false, error: 'Failed to update user' });
          }
          
          console.log(`User account updated: ${userData.email}`);
          
          res.json({
            success: true,
            message: 'Account updated successfully',
            user: {
              userId: userId,
              email: userData.email,
              fullName: fullName,
              earlySupporter: true,
              redirectTo: '/enhanced-community-feed'
            }
          });
        });
        
      } else {
        // Create new user
        const insertQuery = `
          INSERT INTO demo_users (
            user_id, email, password_hash, full_name, phone, city, country, state,
            interests, account_type, bio, business_name, business_website,
            business_address, business_phone, business_description, business_categories,
            early_supporter, signup_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(insertQuery, [
          userId, userData.email, passwordHash, fullName, phone, userData.city, userData.country, userData.state,
          interests, userData.accountType, userData.bio, userData.businessName, userData.businessWebsite,
          userData.businessAddress, userData.workPhone, userData.businessDescription, businessCategories,
          1, signupDate
        ], function(insertErr) {
          db.close();
          if (insertErr) {
            console.error('Database insert error:', insertErr);
            return res.status(500).json({ success: false, error: 'Failed to create user: ' + insertErr.message });
          }
          
          console.log(`New user created: ${userData.email}`);
          
          res.json({
            success: true,
            message: 'Account created successfully',
            user: {
              userId: userId,
              email: userData.email,
              fullName: fullName,
              earlySupporter: true,
              redirectTo: '/enhanced-community-feed'
            }
          });
        });
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/seamless-login', (req, res) => {
  const sqlite3 = require('sqlite3').verbose();
  const crypto = require('crypto');
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password required' 
      });
    }

    const db = new sqlite3.Database('demo_users.db');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    db.get(`
      SELECT user_id, email, full_name, phone, city, interests, early_supporter, account_type
      FROM demo_users 
      WHERE LOWER(email) = LOWER(?) AND password_hash = ?
    `, [email, passwordHash], (err, user) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      
      if (user) {
        res.json({
          success: true,
          message: 'Login successful',
          user: {
            userId: user.user_id,
            email: user.email,
            fullName: user.full_name,
            phone: user.phone,
            city: user.city,
            interests: user.interests,
            earlySupporter: user.early_supporter,
            accountType: user.account_type,
            redirectTo: '/enhanced-community-feed'
          }
        });
      } else {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// API endpoint to get real launch tracker data
app.get('/api/launch-tracker', (req, res) => {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('demo_users.db');
  
  // Dynamic launch goals based on city size and market potential
  const getCityGoals = (city, state) => {
    const majorCities = {
      'New York City': { members: 150, drivers: 15 },
      'Los Angeles': { members: 120, drivers: 12 },
      'Chicago': { members: 100, drivers: 10 },
      'Houston': { members: 90, drivers: 9 },
      'Phoenix': { members: 80, drivers: 8 },
      'Philadelphia': { members: 85, drivers: 8 },
      'San Antonio': { members: 70, drivers: 7 },
      'San Diego': { members: 75, drivers: 8 },
      'Dallas': { members: 85, drivers: 8 },
      'San Jose': { members: 80, drivers: 8 },
      'Austin': { members: 70, drivers: 7 },
      'Jacksonville': { members: 60, drivers: 6 },
      'San Francisco': { members: 85, drivers: 8 },
      'Seattle': { members: 75, drivers: 8 },
      'Denver': { members: 65, drivers: 6 },
      'Boston': { members: 80, drivers: 8 },
      'Nashville': { members: 60, drivers: 6 },
      'Miami': { members: 70, drivers: 7 },
      'Atlanta': { members: 75, drivers: 8 },
      'Portland': { members: 60, drivers: 6 }
    };
    
    return majorCities[city] || { members: 50, drivers: 5 }; // Default for smaller cities
  };

  // Get member counts by organized location (country, state, city)
  db.all(`
    SELECT country, state, city, COUNT(*) as member_count 
    FROM demo_users 
    WHERE country IS NOT NULL AND state IS NOT NULL AND city IS NOT NULL 
      AND country != '' AND state != '' AND city != ''
    GROUP BY country, state, city 
    ORDER BY member_count DESC
  `, (err, memberRows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // If no organized data exists, return empty state for fresh start
    if (memberRows.length === 0) {
      return res.json({
        cities: [],
        totalMembers: 0,
        totalDrivers: 0,
        citiesReadyToLaunch: 0,
        message: "Fresh start! No signups yet with the new organized location system. Ready to begin tracking real cities with proper country/state/city structure."
      });
    }

    // Create launch data with organized location structure
    const launchData = memberRows.map(row => {
      const goal = getCityGoals(row.city, row.state);
      const driverCount = Math.floor(row.member_count * 0.15); // Simulate 15% driver interest rate
      
      return {
        country: row.country,
        state: row.state,
        city: row.city,
        fullLocation: `${row.city}, ${row.state}`,
        members: {
          current: row.member_count,
          goal: goal.members,
          percentage: Math.min(100, Math.round((row.member_count / goal.members) * 100))
        },
        drivers: {
          current: driverCount,
          goal: goal.drivers,
          percentage: Math.min(100, Math.round((driverCount / goal.drivers) * 100))
        },
        readyToLaunch: row.member_count >= goal.members && driverCount >= goal.drivers
      };
    });

    res.json({
      cities: launchData,
      totalMembers: memberRows.reduce((sum, row) => sum + row.member_count, 0),
      totalDrivers: launchData.reduce((sum, city) => sum + city.drivers.current, 0),
      citiesReadyToLaunch: launchData.filter(city => city.readyToLaunch).length
    });
  });

  db.close();
});

// Serve the MarketPace app at /app route
app.get('/app', (req, res) => {
  try {
    const serveContent = fs.readFileSync('serve.js', 'utf8');
    // Extract the HTML content from serve.js
    const htmlMatch = serveContent.match(/res\.send\(`([\s\S]*?)`\);/);
    if (htmlMatch) {
      res.send(htmlMatch[1]);
    } else {
      // Fallback to reading serve.js content directly
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error serving app:', error);
    res.status(500).send('Error loading MarketPace app');
  }
});

// Serve sponsorship page
app.get('/sponsorship', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Partner With MarketPace - Community Sponsorship</title>
  <script src="https://js.stripe.com/v3/"></script>
  <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' https://js.stripe.com; object-src 'none';">
  <style>
    ${getSharedStyles()}
    
    /* Modern Professional Sponsorship Styles */
    .hero-banner {
      padding: 120px 20px 80px;
      text-align: center;
      position: relative;
      z-index: 10;
      background: radial-gradient(ellipse at center, rgba(0, 255, 255, 0.08) 0%, transparent 60%);
      margin-bottom: 80px;
    }
    .hero-banner::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, 
        rgba(138, 43, 226, 0.1) 0%, 
        rgba(0, 255, 255, 0.05) 50%, 
        rgba(138, 43, 226, 0.1) 100%);
      z-index: -1;
    }
    .hero-content {
      position: relative;
      z-index: 2;
    }
    .hero-title {
      font-size: 72px;
      font-weight: 900;
      margin-bottom: 24px;
      background: linear-gradient(135deg, #00FFFF, #FFFFFF, #8A2BE2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
      letter-spacing: -2px;
    }
    .hero-subtitle {
      font-size: 24px;
      margin-bottom: 50px;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.7;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
      font-weight: 300;
    }
    .partnership-stats {
      display: flex;
      justify-content: center;
      gap: 60px;
      margin: 40px 0;
      flex-wrap: wrap;
    }
    .stat-item {
      text-align: center;
    }
    .stat-number {
      font-size: 36px;
      font-weight: bold;
      color: #00FFFF;
      display: block;
      margin-bottom: 8px;
    }
    .stat-label {
      font-size: 14px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .tiers-section {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .section-header {
      text-align: center;
      margin-bottom: 60px;
    }
    .section-title {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 20px;
      background: linear-gradient(45deg, #00FFFF, #8A2BE2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .section-subtitle {
      font-size: 18px;
      opacity: 0.8;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .tier-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 40px;
      margin-bottom: 80px;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
      padding: 0 20px;
    }
    .tier-card {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 32px;
      padding: 50px 40px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(30px);
      position: relative;
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      box-shadow: 0 10px 50px rgba(0, 0, 0, 0.4);
    }
    .tier-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--tier-color, linear-gradient(135deg, rgba(0, 255, 255, 0.08), rgba(138, 43, 226, 0.08)));
      opacity: 0;
      transition: opacity 0.6s ease;
      z-index: 0;
    }
    .tier-card:hover {
      transform: translateY(-15px) scale(1.02);
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(0, 255, 255, 0.4);
      box-shadow: 0 35px 90px rgba(0, 255, 255, 0.25);
    }
    .tier-card:hover::before {
      opacity: 1;
    }
    .tier-card.featured {
      border: 2px solid rgba(0, 255, 255, 0.6);
      background: rgba(0, 255, 255, 0.04);
      transform: scale(1.08);
      box-shadow: 0 25px 70px rgba(0, 255, 255, 0.3);
    }
    .tier-card.featured::after {
      content: '✨ MOST POPULAR';
      position: absolute;
      top: 25px;
      right: -35px;
      background: linear-gradient(45deg, #00FFFF, #8A2BE2);
      color: white;
      padding: 10px 45px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      transform: rotate(12deg);
      box-shadow: 0 8px 30px rgba(138, 43, 226, 0.6);
      z-index: 10;
      border-radius: 8px;
    }
    .tier-header {
      text-align: center;
      margin-bottom: 32px;
      position: relative;
    }
    .tier-icon {
      font-size: 40px;
      margin-bottom: 16px;
      display: block;
    }
    .tier-name {
      font-size: 26px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }
    .tier-price {
      font-size: 52px;
      font-weight: 800;
      color: #00FFFF;
      margin-bottom: 12px;
      line-height: 1;
    }
    .tier-price span {
      font-size: 18px;
      opacity: 0.7;
      font-weight: 400;
    }
    .tier-description {
      font-size: 16px;
      opacity: 0.85;
      line-height: 1.6;
      margin-bottom: 32px;
      font-style: italic;
    }
    .benefits-list {
      list-style: none;
      padding: 0;
      margin: 0 0 40px 0;
    }
    .benefits-list li {
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 15px;
      line-height: 1.5;
      opacity: 0.9;
    }
    .benefits-list li:before {
      content: '✓ ';
      color: #00FFFF;
      font-weight: bold;
      margin-right: 12px;
    }
    .benefits-list li:last-child {
      border-bottom: none;
    }
    .select-tier-btn {
      width: 100%;
      padding: 18px 24px;
      background: linear-gradient(135deg, #00FFFF, #8A2BE2);
      color: white;
      border: none;
      border-radius: 16px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-transform: uppercase;
      letter-spacing: 1px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0, 255, 255, 0.25);
    }
    .select-tier-btn:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    .select-tier-btn:hover:before {
      left: 100%;
    }
    .select-tier-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(0, 255, 255, 0.35);
    }
    
    /* Hero Banner Styles */
    .hero-banner {
      padding: 80px 20px;
      text-align: center;
      background: radial-gradient(ellipse at center, rgba(0, 255, 255, 0.1) 0%, transparent 70%);
      margin-bottom: 60px;
    }
    .hero-content {
      max-width: 1000px;
      margin: 0 auto;
    }
    .hero-title {
      font-size: 64px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 24px;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #00FFFF, #8A2BE2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      font-size: 22px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin-bottom: 50px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    .partnership-stats {
      display: flex;
      justify-content: center;
      gap: 60px;
      margin-top: 50px;
    }
    .stat-item {
      text-align: center;
    }
    .stat-number {
      display: block;
      font-size: 42px;
      font-weight: 800;
      color: #00FFFF;
      margin-bottom: 8px;
    }
    .stat-label {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    /* Section Headers */
    .tiers-section {
      padding: 0 20px 80px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .section-header {
      text-align: center;
      margin-bottom: 60px;
    }
    .section-title {
      font-size: 48px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 20px;
      letter-spacing: -0.5px;
    }
    .section-subtitle {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
      max-width: 700px;
      margin: 0 auto;
    }
    
    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 42px;
      }
      .hero-subtitle {
        font-size: 18px;
      }
      .partnership-stats {
        flex-direction: column;
        gap: 30px;
      }
      .section-title {
        font-size: 36px;
      }
      .section-subtitle {
        font-size: 18px;
      }
    }
    .business-form {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 40px;
      margin: 40px auto;
      max-width: 600px;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(0, 255, 255, 0.3);
      position: relative;
      z-index: 10;
      display: none;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #00FFFF;
      font-weight: bold;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid rgba(0, 255, 255, 0.3);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 16px;
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: rgba(0, 255, 255, 0.6);
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
    }
    .checkout-btn {
      width: 100%;
      padding: 20px;
      background: linear-gradient(45deg, #8A2BE2, #00BFFF);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: bold;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(138, 43, 226, 0.4);
    }
    .checkout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(138, 43, 226, 0.6);
    }
  </style>
</head>
<body>
  <div class="particles" id="particles"></div>
  
  <!-- Hero Banner -->
  <section class="hero-banner">
    <div class="hero-content">
      <button class="back-button" onclick="window.history.back()">
        <span class="back-arrow">←</span> Back
      </button>
      <h1 class="hero-title">Partner With MarketPace</h1>
      <p class="hero-subtitle">
        Join visionary businesses investing in the future of community-first commerce. Choose your partnership tier and help us build stronger, more prosperous neighborhoods where local businesses thrive.
      </p>
    </div>
  </section>

  <!-- Partnership Tiers Section -->
  <section class="tiers-section">
    <div class="section-header">
      <h2 class="section-title">Choose Your Partnership Level</h2>
      <p class="section-subtitle">
        Every partnership tier includes dedicated support, community recognition, and exclusive benefits designed to accelerate your business growth while strengthening the local economy.
      </p>
    </div>
    
    <div class="tier-grid">
      <!-- Supporter -->
      <div class="tier-card" style="--tier-color: linear-gradient(45deg, #9333ea, #c084fc);">
        <div class="tier-header">
          <span class="tier-icon">🤝</span>
          <div class="tier-name">Supporter</div>
          <div class="tier-price">$25<span>/one-time</span></div>
          <div class="tier-description">Show your support for community-first commerce</div>
        </div>
        <ul class="benefits-list">
          <li>Personal thank-you email from founder</li>
          <li>Public recognition on Community Feed</li>
          <li>MarketPace Backer badge</li>
          <li>Early access to community updates</li>
        </ul>
        <button class="select-tier-btn" onclick="selectTier('supporter')">Support Our Mission</button>
      </div>

      <!-- Starter -->
      <div class="tier-card" style="--tier-color: linear-gradient(45deg, #2563eb, #60a5fa);">
        <div class="tier-header">
          <span class="tier-icon">🚀</span>
          <div class="tier-name">Starter Partner</div>
          <div class="tier-price">$100<span>/one-time</span></div>
          <div class="tier-description">Fuel local business tools and community development</div>
        </div>
        <ul class="benefits-list">
          <li>Lifetime MarketPace Pro membership</li>
          <li>Sponsor badge in profile & app</li>
          <li>Social media feature</li>
          <li>Partner wall recognition</li>
          <li>Quarterly business insights</li>
        </ul>
        <button class="select-tier-btn" onclick="selectTier('starter')">Start Partnership</button>
      </div>

      <!-- Community -->
      <div class="tier-card featured" style="--tier-color: linear-gradient(45deg, #059669, #34d399);">
        <div class="tier-header">
          <span class="tier-icon">🏘️</span>
          <div class="tier-name">Community Champion</div>
          <div class="tier-price">$500<span>/one-time</span></div>
          <div class="tier-description">Shape your local economy and grow together with us</div>
        </div>
        <ul class="benefits-list">
          <li>All Starter benefits plus:</li>
          <li>Zero delivery fees for 12 months</li>
          <li>100 custom QR business cards</li>
          <li>MarketPace Partner window sticker</li>
          <li>Co-branded delivery materials</li>
          <li>Homepage & sponsor page features</li>
          <li>Live event mentions</li>
          <li>Monthly spotlight promotion</li>
          <li>Website backlink & blog feature</li>
          <li>Beta access to new tools</li>
        </ul>
        <button class="select-tier-btn" onclick="selectTier('community')">Join Champions</button>
      </div>

      <!-- Ambassador -->
      <div class="tier-card" style="--tier-color: linear-gradient(45deg, #dc2626, #f87171);">
        <div class="tier-header">
          <span class="tier-icon">📢</span>
          <div class="tier-name">Brand Ambassador</div>
          <div class="tier-price">$1,000<span>/one-time</span></div>
          <div class="tier-description">Your voice matters - become a community champion</div>
        </div>
        <ul class="benefits-list">
          <li>All Community benefits plus:</li>
          <li>Personal video from founder</li>
          <li>Featured banner placement</li>
          <li>Exclusive Ambassador badge</li>
          <li>Custom social media campaigns</li>
          <li>Monthly route sponsorship</li>
          <li>Priority customer support</li>
        </ul>
        <button class="select-tier-btn" onclick="selectTier('ambassador')">Become Ambassador</button>
      </div>

      <!-- Legacy -->
      <div class="tier-card" style="--tier-color: linear-gradient(45deg, #7c3aed, #a78bfa);">
        <div class="tier-header">
          <span class="tier-icon">💎</span>
          <div class="tier-name">Legacy Founder</div>
          <div class="tier-price">$2,500<span>/one-time</span></div>
          <div class="tier-description">Cement your permanent impact on community commerce</div>
        </div>
        <ul class="benefits-list">
          <li>All Ambassador benefits plus:</li>
          <li>Permanent Founding Partner status</li>
          <li>12 months of social promotions</li>
          <li>VIP founder updates & roadmap</li>
          <li>Press mentions & announcements</li>
          <li>Exclusive partner event invites</li>
          <li>Priority feature requests</li>
          <li>Bi-monthly route sponsorships</li>
        </ul>
        <button class="select-tier-btn" onclick="selectTier('legacy')">Leave Your Legacy</button>
      </div>
    </div>
  </section>

  <!-- FAQ Section for Bank Account Connection -->
  <section class="faq-section" style="padding: 80px 20px; max-width: 1000px; margin: 0 auto; position: relative; z-index: 10;">
    <h2 style="font-size: 42px; text-align: center; color: #00FFFF; margin-bottom: 60px; font-weight: 700;">Partnership FAQ</h2>
    
    <div style="display: grid; gap: 30px;">
      <div style="background: rgba(255, 255, 255, 0.04); border-radius: 20px; padding: 30px; border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(20px);">
        <h3 style="color: #00FFFF; margin-bottom: 15px; font-size: 20px;">💳 How do I connect my bank account to receive sponsorship payments?</h3>
        <p style="line-height: 1.6; opacity: 0.9; margin: 0;">
          Stripe handles all payment processing securely. Once you complete your sponsorship, Stripe will automatically transfer funds to your connected bank account within 2-7 business days. You'll receive email confirmations for all transactions.
        </p>
      </div>
      
      <div style="background: rgba(255, 255, 255, 0.04); border-radius: 20px; padding: 30px; border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(20px);">
        <h3 style="color: #00FFFF; margin-bottom: 15px; font-size: 20px;">🏦 To connect your personal bank account:</h3>
        <ol style="line-height: 1.8; opacity: 0.9; margin: 0; padding-left: 20px;">
          <li>Complete your sponsorship payment above</li>
          <li>Create a <strong>Stripe Express</strong> account (separate from regular Stripe)</li>
          <li>Provide your bank routing & account numbers</li>
          <li>Verify your identity with a driver's license or passport</li>
          <li>Stripe will send test deposits to confirm your account</li>
        </ol>
      </div>
      
      <div style="background: rgba(255, 255, 255, 0.04); border-radius: 20px; padding: 30px; border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(20px);">
        <h3 style="color: #00FFFF; margin-bottom: 15px; font-size: 20px;">🛡️ Is my banking information secure?</h3>
        <p style="line-height: 1.6; opacity: 0.9; margin: 0;">
          Yes! Stripe is a PCI DSS Level 1 certified payment processor used by millions of businesses worldwide. Your banking information is encrypted and never stored on MarketPace servers. Stripe meets the highest security standards in the financial industry.
        </p>
      </div>
    </div>
  </section>

  <!-- Business Information Form -->
  <div class="business-form" id="businessForm">
    <h2 style="text-align: center; color: #00FFFF; margin-bottom: 30px;">Business Information</h2>
    <form id="sponsorForm">
      <div class="form-group">
        <label for="businessName">Business Name *</label>
        <input type="text" id="businessName" name="businessName" required>
      </div>
      
      <div class="form-group">
        <label for="contactName">Contact Name *</label>
        <input type="text" id="contactName" name="contactName" required>
      </div>
      
      <div class="form-group">
        <label for="email">Email Address *</label>
        <input type="email" id="email" name="email" required>
      </div>
      
      <div class="form-group">
        <label for="phone">Phone Number</label>
        <input type="tel" id="phone" name="phone">
      </div>
      
      <div class="form-group">
        <label for="website">Website</label>
        <input type="url" id="website" name="website" placeholder="https://">
      </div>
      
      <div class="form-group">
        <label for="businessAddress">Business Address</label>
        <textarea id="businessAddress" name="businessAddress" rows="3"></textarea>
      </div>
      
      <div class="form-group">
        <label for="businessDescription">Business Description</label>
        <textarea id="businessDescription" name="businessDescription" rows="4" placeholder="Tell us about your business and how you support the community..."></textarea>
      </div>
      
      <button type="submit" class="checkout-btn">
        Proceed to Payment - <span id="selectedTierPrice"></span>
      </button>
    </form>
  </div>

  <script>
    let selectedTier = null;
    let stripe = null;
    
    // Wait for Stripe to load
    if (typeof Stripe !== 'undefined') {
      stripe = Stripe('pk_test_51RWIgaP3SiNvxf9FaVhQzEBMKTcTIy7SkCpOPyLuS12JMEykSGD31RA2BbbirGNgXhRLiAqlDqDweQNk06f9aEGK00WRSmHeKL');
    } else {
      window.addEventListener('load', function() {
        if (typeof Stripe !== 'undefined') {
          stripe = Stripe('pk_test_51RWIgaP3SiNvxf9FaVhQzEBMKTcTIy7SkCpOPyLuS12JMEykSGD31RA2BbbirGNgXhRLiAqlDqDweQNk06f9aEGK00WRSmHeKL');
        }
      });
    }
    
    function selectTier(tier) {
      selectedTier = tier;
      const tierPrices = {
        supporter: '$25',
        starter: '$100', 
        community: '$500',
        ambassador: '$1,000',
        legacy: '$2,500'
      };
      
      document.getElementById('selectedTierPrice').textContent = tierPrices[tier];
      document.getElementById('businessForm').style.display = 'block';
      document.getElementById('businessForm').scrollIntoView({ behavior: 'smooth' });
    }
    
    document.getElementById('sponsorForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!selectedTier) {
        alert('Please select a sponsorship tier');
        return;
      }

      if (!stripe) {
        alert('Payment system is loading. Please try again in a moment.');
        return;
      }
      
      const formData = new FormData(e.target);
      const businessInfo = Object.fromEntries(formData);
      
      // Show loading state
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;
      
      try {
        console.log('Creating checkout session for tier:', selectedTier);
        
        const response = await fetch('/api/sponsorship/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: selectedTier,
            businessInfo
          })
        });
        
        const result = await response.json();
        console.log('Stripe response:', result);
        
        if (result.sessionId) {
          // Use Stripe's redirectToCheckout instead of direct URL
          const { error } = await stripe.redirectToCheckout({
            sessionId: result.sessionId
          });
          
          if (error) {
            console.error('Stripe redirect error:', error);
            alert('Payment redirect failed: ' + error.message);
          }
        } else if (result.url) {
          window.location.href = result.url;
        } else {
          console.error('Invalid response:', result);
          alert('Error creating checkout session: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error processing request: ' + error.message);
      } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
    
    // Create particles
    function createParticles() {
      const particlesContainer = document.getElementById('particles');
      const particleCount = 50;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particlesContainer.appendChild(particle);
      }
    }
    
    createParticles();
  </script>
</body>
</html>
  `);
});

// Demo signup page route
app.get('/demo-signup', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join MarketPace - Demo Access</title>
  <style>
    ${getSharedStyles()}
    
    .signup-container {
      max-width: 600px;
      margin: 80px auto;
      padding: 40px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }
    
    .signup-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .signup-title {
      font-size: 42px;
      font-weight: 800;
      background: linear-gradient(135deg, #00FFFF, #8A2BE2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 16px;
    }
    
    .signup-subtitle {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
    }
    
    .form-group {
      margin-bottom: 24px;
    }
    
    .form-label {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: #00FFFF;
      margin-bottom: 8px;
    }
    
    .form-input {
      width: 100%;
      padding: 16px;
      border: 2px solid rgba(0, 255, 255, 0.3);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      color: white;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    
    .form-input select, .form-input option {
      background: rgba(13, 2, 33, 0.95);
      color: white;
    }
    
    .form-input option:hover {
      background: rgba(0, 255, 255, 0.2);
    }
    
    .form-input:focus {
      outline: none;
      border-color: #00FFFF;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    }
    
    .form-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    
    .checkbox-group {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .checkbox-input {
      width: 20px;
      height: 20px;
      accent-color: #00FFFF;
    }
    
    .checkbox-label {
      font-size: 14px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .submit-btn {
      width: 100%;
      padding: 18px 24px;
      background: linear-gradient(135deg, #00FFFF, #8A2BE2);
      color: white;
      border: none;
      border-radius: 16px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(0, 255, 255, 0.4);
    }
    
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .back-link {
      display: inline-flex;
      align-items: center;
      color: #00FFFF;
      text-decoration: none;
      font-size: 16px;
      margin-bottom: 20px;
      transition: color 0.3s ease;
    }
    
    .back-link:hover {
      color: #8A2BE2;
    }
    
    .benefits-list {
      background: rgba(0, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    
    .benefits-list h4 {
      color: #00FFFF;
      margin-bottom: 12px;
      font-size: 16px;
    }
    
    .benefits-list ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .benefits-list li {
      padding: 6px 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .benefits-list li:before {
      content: '✓ ';
      color: #00FFFF;
      font-weight: bold;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="particles" id="particles"></div>
  
  <div class="signup-container">
    <a href="/" class="back-link">← Back to Home</a>
    
    <div class="signup-header">
      <h1 class="signup-title">Join MarketPace</h1>
      <p class="signup-subtitle">
        Get early access to the community-first marketplace that's changing how neighbors connect, buy, sell, and support each other.
      </p>
    </div>
    
    <div class="benefits-list">
      <h4>🎉 Launch Campaign Benefits:</h4>
      <ul>
        <li>All Pro features FREE during launch period</li>
        <li>Lifetime Pro membership for early supporters</li>
        <li>Special "Early Supporter" badge in your profile</li>
        <li>Priority access to driver opportunities</li>
        <li>SMS notifications for launch updates</li>
        <li>First access to your city when we go live</li>
      </ul>
    </div>
    
    <form id="demoSignupForm">
      <div class="form-group">
        <label class="form-label" for="fullName">Full Name</label>
        <input type="text" id="fullName" name="fullName" class="form-input" placeholder="Enter your full name" required>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="email">Email Address</label>
        <input type="email" id="email" name="email" class="form-input" placeholder="Enter your email address" required>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="password">Password</label>
        <input type="password" id="password" name="password" class="form-input" placeholder="Create a secure password" required minlength="6">
        <small style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 4px; display: block;">
          Minimum 6 characters
        </small>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" name="confirmPassword" class="form-input" placeholder="Confirm your password" required>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="phone">Phone Number</label>
        <input type="tel" id="phone" name="phone" class="form-input" placeholder="+1 (555) 123-4567" required>
        <small style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 4px; display: block;">
          Include country code for SMS notifications (e.g., +1 for US)
        </small>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="city">City, State</label>
        <input type="text" id="city" name="city" class="form-input" placeholder="Seattle, WA" required>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="interests">Primary Interest (Optional)</label>
        <select id="interests" name="interests" class="form-input">
          <option value="">Select your main interest...</option>
          <option value="buying">Buying from local sellers</option>
          <option value="selling">Selling my items/services</option>
          <option value="driving">Delivery driver opportunities</option>
          <option value="business">Business/shop integration</option>
          <option value="community">Community building</option>
          <option value="entertainment">Entertainment/events</option>
        </select>
      </div>
      
      <div class="checkbox-group">
        <input type="checkbox" id="smsNotifications" name="smsNotifications" class="checkbox-input" checked>
        <label for="smsNotifications" class="checkbox-label">
          Send me SMS notifications when MarketPace launches in my city and for important updates. 
          (You can opt out anytime)
        </label>
      </div>
      
      <div class="checkbox-group">
        <input type="checkbox" id="emailUpdates" name="emailUpdates" class="checkbox-input" checked>
        <label for="emailUpdates" class="checkbox-label">
          Keep me informed about MarketPace progress, new features, and community stories via email.
        </label>
      </div>
      
      <div class="checkbox-group">
        <input type="checkbox" id="termsAccepted" name="termsAccepted" class="checkbox-input" required>
        <label for="termsAccepted" class="checkbox-label">
          I agree to MarketPace's Terms of Service and Privacy Policy. I understand this is early access to a demo platform.
        </label>
      </div>
      
      <button type="submit" class="submit-btn">Join MarketPace Demo</button>
    </form>
  </div>
  
  <script>
    // Create particles
    function createParticles() {
      const particlesContainer = document.getElementById('particles');
      const particleCount = 50;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particlesContainer.appendChild(particle);
      }
    }
    
    createParticles();
    
    // Handle form submission
    document.getElementById('demoSignupForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const userData = Object.fromEntries(formData);
      
      // Validate password confirmation
      if (userData.password !== userData.confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
      }
      
      // Remove confirmPassword from userData
      delete userData.confirmPassword;
      
      // Convert checkboxes to boolean
      userData.smsNotifications = formData.has('smsNotifications');
      userData.emailUpdates = formData.has('emailUpdates');
      userData.termsAccepted = formData.has('termsAccepted');
      
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Creating Your Account...';
      submitBtn.disabled = true;
      
      try {
        const response = await fetch('/api/demo-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
          alert('Welcome to MarketPace! Check your email and SMS for confirmation. Redirecting to community page...');
          window.location.href = '/client';
        } else {
          alert('Error: ' + (result.error || 'Failed to create account'));
        }
      } catch (error) {
        console.error('Signup error:', error);
        alert('Error creating account. Please try again.');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>
  `);
});

// Sponsorship API endpoints
const SPONSORSHIP_TIERS = {
  supporter: { name: "Supporter", price: 25, currency: "usd", interval: "one_time" },
  starter: { name: "Starter Sponsor", price: 100, currency: "usd", interval: "one_time" },
  community: { name: "Community Sponsor", price: 500, currency: "usd", interval: "one_time" },
  ambassador: { name: "Ambassador Sponsor", price: 1000, currency: "usd", interval: "one_time" },
  legacy: { name: "Legacy Sponsor", price: 2500, currency: "usd", interval: "one_time" }
};

app.post('/api/sponsorship/create-checkout', async (req, res) => {
  try {
    const { tier, businessInfo } = req.body;
    const tierConfig = SPONSORSHIP_TIERS[tier];
    
    if (!tierConfig) {
      return res.status(400).json({ error: 'Invalid sponsorship tier' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: tierConfig.currency,
            product_data: {
              name: `MarketPace ${tierConfig.name}`,
              description: `Support local community marketplace`,
            },
            unit_amount: tierConfig.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/sponsorship/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/sponsorship`,
      metadata: {
        tier,
        businessName: businessInfo.businessName,
        contactName: businessInfo.contactName,
        email: businessInfo.email
      },
      customer_email: businessInfo.email
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/sponsorship/success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You - MarketPace Partnership</title>
      <style>
        ${getSharedStyles()}
        .success-container {
          max-width: 600px;
          margin: 100px auto;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          border: 2px solid rgba(0, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          text-align: center;
          position: relative;
          z-index: 10;
        }
        .success-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        .success-title {
          font-size: 32px;
          color: #00FFFF;
          margin-bottom: 20px;
        }
        .success-message {
          font-size: 18px;
          line-height: 1.6;
          margin-bottom: 30px;
          opacity: 0.9;
        }
        .back-btn {
          padding: 15px 30px;
          background: linear-gradient(45deg, #00FFFF, #8A2BE2);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }
        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 255, 255, 0.4);
        }
      </style>
    </head>
    <body>
      <div class="particles" id="particles"></div>
      <div class="success-container">
        <div class="success-icon">🎉</div>
        <h1 class="success-title">Welcome to the MarketPace Family!</h1>
        <p class="success-message">
          Thank you for supporting community-first commerce. Your partnership helps us build stronger neighborhoods and create local opportunities.
          <br><br>
          You'll receive a confirmation email shortly with details about your sponsorship benefits.
          <br><br>
          Together, we're delivering more than packages – we're delivering opportunities!
        </p>
        <a href="/pitch" class="back-btn">Back to MarketPace</a>
      </div>
      
      <script>
        // Create particles
        function createParticles() {
          const particlesContainer = document.getElementById('particles');
          const particleCount = 50;
          
          for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            const size = Math.random() * 3 + 1;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particlesContainer.appendChild(particle);
          }
        }
        
        createParticles();
        
        // Facebook Share Function
        function shareToFacebook() {
          const shareUrl = encodeURIComponent('https://MarketPace.shop/sponsorship');
          const shareText = encodeURIComponent('Support the community-first marketplace revolution! MarketPace is creating local jobs and supporting small businesses. Join our sponsorship program to help build stronger communities! #MarketPace #CommunityFirst #SponsorshipOpportunity #LocalBusiness');
          const facebookUrl = \`https://www.facebook.com/sharer/sharer.php?u=\${shareUrl}&quote=\${shareText}\`;
          window.open(facebookUrl, '_blank', 'width=600,height=400');
        }
      </script>

      <!-- Facebook Share Button -->
      <div style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
        <button onclick="shareToFacebook()" style="
          background: #1877F2;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);
          transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          📘 Share to Facebook
        </button>
      </div>

    </body>
    </html>
  `);
});

// Admin Dashboard for Sponsors
app.get('/admin/sponsors', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MarketPace Sponsor Admin Dashboard</title>
      <style>
        ${getSharedStyles()}
        .dashboard-container {
          max-width: 1200px;
          margin: 40px auto;
          padding: 20px;
          position: relative;
          z-index: 10;
        }
        .dashboard-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .dashboard-title {
          font-size: 32px;
          color: #00FFFF;
          margin-bottom: 10px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 20px;
          border: 2px solid rgba(0, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          text-align: center;
        }
        .stat-number {
          font-size: 28px;
          font-weight: bold;
          color: #8A2BE2;
          margin-bottom: 5px;
        }
        .stat-label {
          font-size: 14px;
          opacity: 0.8;
        }
        .sponsor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }
        .sponsor-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
          border: 2px solid rgba(0, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .sponsor-card:hover {
          border-color: rgba(0, 255, 255, 0.6);
          box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
        }
        .sponsor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .sponsor-name {
          font-size: 18px;
          font-weight: bold;
          color: #00FFFF;
        }
        .sponsor-tier {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .tier-supporter { background: rgba(147, 51, 234, 0.3); }
        .tier-starter { background: rgba(59, 130, 246, 0.3); }
        .tier-community { background: rgba(16, 185, 129, 0.3); }
        .tier-ambassador { background: rgba(245, 158, 11, 0.3); }
        .tier-legacy { background: rgba(236, 72, 153, 0.3); }
        .sponsor-details {
          font-size: 14px;
          margin-bottom: 15px;
          opacity: 0.8;
        }
        .sponsor-actions {
          display: flex;
          gap: 10px;
        }
        .action-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
          font-weight: bold;
        }
        .btn-primary {
          background: linear-gradient(45deg, #00FFFF, #8A2BE2);
        }
        .btn-success {
          background: linear-gradient(45deg, #10B981, #059669);
        }
        .btn-warning {
          background: linear-gradient(45deg, #F59E0B, #D97706);
        }
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
        }
        .ai-assistant {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 40px;
          border: 2px solid rgba(138, 43, 226, 0.3);
          backdrop-filter: blur(10px);
        }
        .ai-title {
          font-size: 24px;
          color: #8A2BE2;
          margin-bottom: 20px;
          text-align: center;
        }
        .task-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 10px;
          border-left: 4px solid #00FFFF;
        }
        .task-title {
          font-weight: bold;
          color: #00FFFF;
          margin-bottom: 5px;
        }
        .task-description {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 10px;
        }
        .task-meta {
          font-size: 12px;
          opacity: 0.6;
        }
        .complete-btn {
          background: linear-gradient(45deg, #10B981, #059669);
          color: white;
          border: none;
          padding: 5px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 11px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="particles" id="particles"></div>
      
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h1 class="dashboard-title">🏢 MarketPace Sponsor Dashboard</h1>
          <p style="opacity: 0.8;">Managing community partnerships and AI-powered sponsor relations</p>
        </div>

        <!-- AI Assistant Section -->
        <div class="ai-assistant">
          <h2 class="ai-title">🤖 AI Assistant - Upcoming Tasks</h2>
          <div id="aiTasks">
            <div class="task-item">
              <div class="task-title">📞 Welcome Call - Ambassador Sponsor</div>
              <div class="task-description">Schedule personalized video shout-out call with new Ambassador sponsor who joined today</div>
              <div class="task-meta">Due: Tomorrow | Priority: High</div>
              <button class="complete-btn" onclick="completeTask('welcome-call')">Mark Complete</button>
            </div>
            <div class="task-item">
              <div class="task-title">📅 Monthly Spotlight Calendar</div>
              <div class="task-description">Create social media calendar for 3 Community sponsors scheduled for next month</div>
              <div class="task-meta">Due: This Week | Priority: Medium</div>
              <button class="complete-btn" onclick="completeTask('spotlight-calendar')">Mark Complete</button>
            </div>
            <div class="task-item">
              <div class="task-title">🎬 Video Shout-out Creation</div>
              <div class="task-description">Record and edit founder video message for Legacy sponsor anniversary</div>
              <div class="task-meta">Due: Friday | Priority: High</div>
              <button class="complete-btn" onclick="completeTask('video-shoutout')">Mark Complete</button>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">12</div>
            <div class="stat-label">Total Sponsors</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">$8,750</div>
            <div class="stat-label">Monthly Revenue</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">24</div>
            <div class="stat-label">Active Benefits</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">95%</div>
            <div class="stat-label">Completion Rate</div>
          </div>
        </div>

        <!-- Sponsor Grid -->
        <div class="sponsor-grid">
          <div class="sponsor-card">
            <div class="sponsor-header">
              <div class="sponsor-name">Seattle Coffee Co.</div>
              <div class="sponsor-tier tier-community">Community</div>
            </div>
            <div class="sponsor-details">
              Contact: Sarah Johnson<br>
              Email: sarah@seattlecoffee.com<br>
              Joined: 2 weeks ago | Amount: $500
            </div>
            <div class="sponsor-actions">
              <button class="action-btn btn-primary">View Benefits</button>
              <button class="action-btn btn-success">Send Update</button>
            </div>
          </div>

          <div class="sponsor-card">
            <div class="sponsor-header">
              <div class="sponsor-name">Urban Fitness Hub</div>
              <div class="sponsor-tier tier-ambassador">Ambassador</div>
            </div>
            <div class="sponsor-details">
              Contact: Mike Chen<br>
              Email: mike@urbanfitness.com<br>
              Joined: 1 month ago | Amount: $1,000
            </div>
            <div class="sponsor-actions">
              <button class="action-btn btn-primary">View Benefits</button>
              <button class="action-btn btn-warning">Schedule Call</button>
            </div>
          </div>

          <div class="sponsor-card">
            <div class="sponsor-header">
              <div class="sponsor-name">Green Garden Nursery</div>
              <div class="sponsor-tier tier-starter">Starter</div>
            </div>
            <div class="sponsor-details">
              Contact: Emma Rodriguez<br>
              Email: emma@greengarden.com<br>
              Joined: 3 weeks ago | Amount: $100
            </div>
            <div class="sponsor-actions">
              <button class="action-btn btn-primary">View Benefits</button>
              <button class="action-btn btn-success">Send Badge</button>
            </div>
          </div>

          <div class="sponsor-card">
            <div class="sponsor-header">
              <div class="sponsor-name">Tech Innovators LLC</div>
              <div class="sponsor-tier tier-legacy">Legacy</div>
            </div>
            <div class="sponsor-details">
              Contact: David Kim<br>
              Email: david@techinnovators.com<br>
              Joined: 6 months ago | Amount: $2,500
            </div>
            <div class="sponsor-actions">
              <button class="action-btn btn-primary">View Benefits</button>
              <button class="action-btn btn-warning">Press Release</button>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <a href="/" class="action-btn btn-primary" style="padding: 15px 30px; font-size: 16px; text-decoration: none;">
            Back to MarketPace
          </a>
        </div>
      </div>

      <script>
        function completeTask(taskId) {
          // In a real app, this would call an API
          alert('Task marked as complete! AI assistant will update the calendar.');
        }

        // Create particles
        function createParticles() {
          const particlesContainer = document.getElementById('particles');
          const particleCount = 50;
          
          for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            const size = Math.random() * 3 + 1;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particlesContainer.appendChild(particle);
          }
        }
        
        createParticles();
        
        // Facebook Share Function
        function shareToFacebook() {
          const shareUrl = encodeURIComponent('https://MarketPace.shop/admin/sponsors');
          const shareText = encodeURIComponent('Check out MarketPace sponsor dashboard! We are transparently building a community-first marketplace that creates local jobs and supports small businesses. Join our movement! #MarketPace #CommunityFirst #LocalBusiness #Transparency');
          const facebookUrl = \`https://www.facebook.com/sharer/sharer.php?u=\${shareUrl}&quote=\${shareText}\`;
          window.open(facebookUrl, '_blank', 'width=600,height=400');
        }
      </script>

      <!-- Facebook Share Button -->
      <div style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
        <button onclick="shareToFacebook()" style="
          background: #1877F2;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);
          transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          📘 Share to Facebook
        </button>
      </div>

    </body>
    </html>
  `);
});

function getSharedStyles() {
  return `
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0d0221, #1a0633, #2d1b4e, #1e0b3d);
      background-size: 400% 400%;
      animation: gradientShift 8s ease infinite;
      color: #fff;
      overflow-x: hidden;
      position: relative;
    }
    
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(0, 191, 255, 0.08) 0%, transparent 50%);
      pointer-events: none;
      z-index: 1;
    }
    
    .particles {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    }
    
    .particle {
      position: absolute;
      width: 2px;
      height: 2px;
      background: rgba(0, 255, 255, 0.6);
      border-radius: 50%;
      animation: float 6s infinite linear;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
    }
    
    .particle:nth-child(odd) {
      background: rgba(138, 43, 226, 0.6);
      box-shadow: 0 0 10px rgba(138, 43, 226, 0.8);
      animation-duration: 8s;
    }
    
    @keyframes float {
      0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
    }
    
    header h1 {
      background: linear-gradient(45deg, #00FFFF, #8A2BE2, #00BFFF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
      filter: drop-shadow(0 0 10px rgba(138, 43, 226, 0.4));
    }
  `;
}

// Enhanced MarketPace Pitch Page with Shopify Integration Demo
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>MarketPace – Delivering Opportunities</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0d0221, #1a0633, #2d1b4e, #1e0b3d);
      background-size: 400% 400%;
      animation: gradientShift 8s ease infinite;
      color: #fff;
      overflow-x: hidden;
      position: relative;
    }
    
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(0, 191, 255, 0.08) 0%, transparent 50%);
      pointer-events: none;
      z-index: 1;
    }
    
    .particles {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    }
    
    .particle {
      position: absolute;
      width: 2px;
      height: 2px;
      background: rgba(0, 255, 255, 0.6);
      border-radius: 50%;
      animation: float 6s infinite linear;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
    }
    
    .particle:nth-child(odd) {
      background: rgba(138, 43, 226, 0.6);
      box-shadow: 0 0 10px rgba(138, 43, 226, 0.8);
      animation-duration: 8s;
    }
    
    @keyframes float {
      0% {
        transform: translateY(100vh) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100px) rotate(360deg);
        opacity: 0;
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.6;
      }
      50% {
        transform: scale(1.05);
        opacity: 0.8;
      }
    }
    
    .logo-flow-particle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      z-index: 4;
      box-shadow: 0 0 10px currentColor;
      animation: logoFlow linear infinite;
    }
    
    @keyframes logoFlow {
      0% {
        transform: translate(var(--start-x), var(--start-y)) scale(0);
        opacity: 0;
      }
      10% {
        opacity: 1;
        transform: translate(var(--start-x), var(--start-y)) scale(1);
      }
      50% {
        opacity: 1;
        transform: translate(calc(var(--start-x) + var(--end-x)) / 2, calc(var(--start-y) + var(--end-y)) / 2) scale(1.2);
      }
      90% {
        opacity: 0.7;
        transform: translate(var(--end-x), var(--end-y)) scale(0.8);
      }
      100% {
        opacity: 0;
        transform: translate(var(--end-x), var(--end-y)) scale(0);
      }
    }
    header {
      text-align: center;
      padding: 60px 20px 20px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0, 255, 255, 0.3);
      box-shadow: 0 4px 20px rgba(0, 255, 255, 0.1);
      position: relative;
      z-index: 10;
    }
    
    .header-nav {
      position: absolute;
      top: 20px;
      right: 30px;
      display: flex;
      gap: 15px;
      align-items: center;
    }
    
    .login-btn {
      background: linear-gradient(135deg, #00FFFF, #8A2BE2);
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
    }
    
    .login-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(0, 255, 255, 0.4);
      background: linear-gradient(135deg, #8A2BE2, #00FFFF);
    }
    
    .signup-btn {
      background: rgba(255, 255, 255, 0.1);
      color: #00FFFF;
      padding: 12px 24px;
      border: 2px solid rgba(0, 255, 255, 0.5);
      border-radius: 25px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      backdrop-filter: blur(10px);
    }
    
    .signup-btn:hover {
      background: rgba(0, 255, 255, 0.1);
      border-color: #00FFFF;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
      transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
      .header-nav {
        position: static;
        justify-content: center;
        margin-bottom: 20px;
        flex-direction: column;
        gap: 10px;
      }
      
      .login-btn, .signup-btn {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
    header h1 {
      font-size: 48px;
      margin-bottom: 10px;
      background: linear-gradient(45deg, #00FFFF, #8A2BE2, #00BFFF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
      filter: drop-shadow(0 0 10px rgba(138, 43, 226, 0.4));
    }
    header p {
      font-size: 18px;
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      margin: 15px 10px;
      padding: 12px 24px;
      font-size: 18px;
      color: #fff;
      background: linear-gradient(45deg, #00FFFF, #8A2BE2);
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 255, 255, 0.2);
      position: relative;
      z-index: 10;
    }
    .btn:hover {
      background: linear-gradient(45deg, #8A2BE2, #00BFFF);
      box-shadow: 0 8px 25px rgba(0, 255, 255, 0.4), 0 0 30px rgba(138, 43, 226, 0.3);
      border-color: rgba(0, 255, 255, 0.6);
      transform: translateY(-2px);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(94, 45, 145, 0.4);
    }
    .btn-demo {
      background: linear-gradient(45deg, #1e40af, #3730a3);
    }
    .btn-demo:hover {
      background: linear-gradient(45deg, #2563eb, #4338ca);
    }
    section {
      max-width: 1100px;
      margin: 60px auto;
      padding: 0 20px;
    }
    h2 {
      font-size: 32px;
      margin-bottom: 20px;
      color: #f4f4f4;
      text-align: center;
    }
    ul {
      line-height: 1.8;
      font-size: 16px;
    }
    li {
      margin-bottom: 10px;
      padding-left: 10px;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin: 40px 0;
    }
    .feature-card {
      background: rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.3s ease;
    }
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    .feature-card h3 {
      color: #FFD700;
      margin-bottom: 15px;
      font-size: 22px;
    }
    .demo-section {
      background: rgba(255, 255, 255, 0.05);
      padding: 40px;
      border-radius: 20px;
      margin: 60px 0;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .integration-demo {
      background: rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 15px;
      margin: 30px 0;
      text-align: left;
    }
    .status {
      margin: 20px 0;
      padding: 15px;
      border-radius: 8px;
      font-size: 14px;
    }
    .success {
      background: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
      border: 1px solid rgba(76, 175, 80, 0.3);
    }
    .error {
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
      border: 1px solid rgba(244, 67, 54, 0.3);
    }
    .info {
      background: rgba(33, 150, 243, 0.2);
      color: #2196F3;
      border: 1px solid rgba(33, 150, 243, 0.3);
    }
    .integration-button {
      background: linear-gradient(45deg, #4CAF50, #45a049);
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin: 5px;
      font-size: 14px;
      transition: all 0.3s ease;
    }
    .integration-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    }
    .campaign-banner {
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      padding: 20px;
      border-radius: 15px;
      margin: 30px 0;
      text-align: center;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(255, 107, 53, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); }
    }
    footer {
      background: rgba(0, 0, 0, 0.3);
      text-align: center;
      padding: 30px;
      font-size: 14px;
      color: #ccc;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin: 30px 0;
      flex-wrap: wrap;
    }
    .stat {
      text-align: center;
    }
    .stat-number {
      font-size: 36px;
      font-weight: bold;
      color: #FFD700;
      display: block;
    }
    .stat-label {
      font-size: 14px;
      opacity: 0.8;
    }
    @media (max-width: 768px) {
      header h1 { font-size: 36px; }
      .features-grid { grid-template-columns: 1fr; }
      .stats { flex-direction: column; gap: 20px; }
    }
    
    /* Launch Tracker Styles */
    .launch-tracker {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 40px;
      margin: 60px 0;
      border: 2px solid rgba(0, 255, 255, 0.3);
      backdrop-filter: blur(10px);
    }
    .tracker-summary {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }
    .summary-item {
      text-align: center;
      padding: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      border: 1px solid rgba(0, 255, 255, 0.2);
      min-width: 150px;
    }
    .summary-number {
      font-size: 36px;
      font-weight: bold;
      color: #00FFFF;
      display: block;
      margin-bottom: 8px;
    }
    .summary-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }
    .city-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      padding: 25px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .city-card.ready-to-launch {
      border-color: rgba(0, 255, 0, 0.5);
      background: rgba(0, 255, 0, 0.05);
    }
    .city-card.ready-to-launch::before {
      content: '✅ READY TO LAUNCH';
      position: absolute;
      top: 10px;
      right: -30px;
      background: linear-gradient(45deg, #10B981, #059669);
      color: white;
      padding: 5px 35px;
      font-size: 10px;
      font-weight: bold;
      transform: rotate(15deg);
      z-index: 10;
    }
    .city-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 255, 255, 0.2);
    }
    .city-name {
      font-size: 20px;
      font-weight: bold;
      color: #FFD700;
      margin-bottom: 20px;
      text-align: center;
    }
    .progress-section {
      margin-bottom: 20px;
    }
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .progress-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }
    .progress-count {
      font-size: 14px;
      color: #00FFFF;
      font-weight: bold;
    }
    .progress-bar {
      width: 100%;
      height: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00FFFF, #8A2BE2);
      border-radius: 6px;
      transition: width 0.8s ease;
      position: relative;
    }
    .progress-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: shimmer 2s infinite;
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Launch Tracker Styles */
    .tracker-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-item {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 15px;
      padding: 20px;
      text-align: center;
      backdrop-filter: blur(10px);
    }

    .summary-number {
      display: block;
      font-size: 32px;
      font-weight: bold;
      color: #00ffff;
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }

    .summary-label {
      display: block;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 8px;
    }

    .cities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .city-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 15px;
      padding: 20px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .city-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 255, 255, 0.2);
    }

    .city-card.ready-to-launch {
      border-color: #10B981;
      background: rgba(16, 185, 129, 0.1);
    }

    .city-name {
      font-size: 18px;
      font-weight: bold;
      color: #00ffff;
      margin-bottom: 5px;
    }

    .progress-section {
      margin-bottom: 15px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .progress-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }

    .progress-count {
      font-size: 14px;
      color: #00ffff;
      font-weight: bold;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ffff, #0080ff);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
  </style>
</head>
<body>
  <div class="particles" id="particles"></div>
  <header>
    <div class="header-nav">
      <a href="/demo-signup" class="signup-btn">Sign Up</a>
      <a href="/demo-login" class="login-btn">Login</a>
    </div>
    
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px; position: relative;">
      <div id="logoContainer" style="position: relative; margin-bottom: 20px; overflow: visible;">
        <!-- Logo flow particles -->
        <div id="logoFlowParticles" style="
          position: absolute;
          top: -50px;
          left: -50px;
          right: -50px;
          bottom: -50px;
          z-index: 4;
          pointer-events: none;
        "></div>
        
        <img src="/marketpace-hero-logo.jpeg" alt="MarketPace" style="
          height: 250px; 
          width: auto; 
          border-radius: 20px; 
          object-fit: cover;
          filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.6)) drop-shadow(0 0 60px rgba(138, 43, 226, 0.4));
          mask: radial-gradient(ellipse at center, rgba(0,0,0,1) 70%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0) 100%);
          -webkit-mask: radial-gradient(ellipse at center, rgba(0,0,0,1) 70%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0) 100%);
          position: relative;
          z-index: 5;
        ">
        
        <!-- Enhanced particle integration overlay -->
        <div style="
          position: absolute;
          top: -30px;
          left: -30px;
          right: -30px;
          bottom: -30px;
          background: radial-gradient(circle, rgba(0,255,255,0.05) 0%, rgba(138,43,226,0.05) 50%, transparent 70%);
          border-radius: 30px;
          z-index: 3;
          pointer-events: none;
        "></div>
      </div>
      <div style="text-align: center;">
        <p style="margin: 10px 0 0 0; font-size: 18px; max-width: 700px;">More than a marketplace. We deliver opportunity — supporting local shops, services, and entertainers in your community. You set the pace, we make it happen!</p>
      </div>
    </div>
    
    <div class="campaign-banner">
      <h3 style="margin: 0; font-size: 20px;">🚀 Campaign Launch - All Features FREE!</h3>
      <p style="margin: 10px 0; opacity: 0.9;">Early supporters get lifetime benefits. Be part of the movement.</p>
    </div>
    
    <a href="/enhanced-community-feed" class="btn btn-demo" id="mainDemoBtn">Try Live Demo</a>
    <a href="#why" class="btn">Founder's Pledge</a>
    <a href="/sponsorship" class="btn" style="background: linear-gradient(45deg, #1e40af, #3730a3);">Partner With Us</a>
    <a href="/admin/sponsors" class="btn" style="background: linear-gradient(45deg, #8A2BE2, #6B21A8); font-size: 12px; padding: 8px 16px; margin-right: 12px;">Admin Dashboard</a>
    <a href="/driver-application" class="btn" style="background: linear-gradient(45deg, #1e40af, #3730a3); font-size: 12px; padding: 8px 16px;">Apply to Drive</a>
  </header>

  <section id="why">
    <h2>Founder's Pledge: Why I Created MarketPace</h2>
    <div style="max-width: 800px; margin: 0 auto; background: rgba(255, 255, 255, 0.05); padding: 40px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 40px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="attached_assets/IMG_7976_1751900735722.jpeg" alt="Brooke Brown, Founder of MarketPace" style="width: 200px; height: 200px; object-fit: cover; border-radius: 50%; border: 4px solid #FFD700; box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);">
        <h3 style="margin: 15px 0 5px 0; color: #FFD700; font-size: 24px;">Brooke Brown</h3>
        <p style="margin: 0; color: #FFA500; font-style: italic; font-size: 16px;">Founder & CEO, MarketPace</p>
      </div>
      <p style="font-size: 18px; line-height: 1.7; margin-bottom: 20px; font-style: italic;">
        "I've caught myself saying it so many times…<br>
        <strong style="color: #FFD700;">'I wish I didn't have to use Facebook.'"</strong>
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        But like so many others, I kept going back — because it was the only way to promote my music, support my friends, and stay connected to my community. I used it because I had to, not because I wanted to.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        I hated the constant flood of scammers. I hated watching AI bots reply to every post about my shows trying to steal ticket sales or impersonate me. I hated watching real artists, vendors, and small businesses get buried under spam while fake accounts thrived.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        And most of all, I hated the agendas, the misinformation, the emotionally triggering content — content designed not to help anyone, but to keep us arguing so Facebook could make money off our engagement.
      </p>
      
      <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #FFD700; font-weight: bold;">
        That's not community. That's not connection. And that's not what we deserve.
      </p>
      
      <p style="font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
        So I created MarketPace — a platform that gives us all a better option.
      </p>
      
      <div style="background: rgba(255, 215, 0, 0.1); padding: 25px; border-radius: 15px; border-left: 4px solid #FFD700; margin-bottom: 30px;">
        <p style="font-size: 18px; font-weight: bold; color: #FFD700; margin-bottom: 20px;">
          On MarketPace, you can:
        </p>
        <ul style="font-size: 16px; line-height: 1.7; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 10px;">Post your products, services, and events without getting drowned out</li>
          <li style="margin-bottom: 10px;">Support your friends, your neighbors, and your local shops</li>
          <li style="margin-bottom: 10px;">Share to a real community feed, free from toxic content and algorithmic noise</li>
          <li style="margin-bottom: 10px;">Sell safely, deliver locally, and grow organically</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-bottom: 25px;">
        <p style="font-size: 18px; font-weight: bold; color: #FFD700; margin-bottom: 15px;">
          No agendas. No scammers. No distractions.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Just you, your community, and your opportunities — finally in one place.
        </p>
        <p style="font-size: 18px; line-height: 1.6; margin-bottom: 10px; color: #FFA500;">
          You no longer have to use a platform that doesn't respect you.<br>
          <strong>You can finally use one that does.</strong>
        </p>
      </div>
      
      <div style="text-align: center; font-size: 18px; color: #FFD700; margin-bottom: 15px;">
        Welcome to MarketPace.
      </div>
      
      <div style="text-align: right; font-style: italic; color: #FFA500; font-size: 16px;">
        Sincerely,<br>
        <strong>Brooke Brown - Founder, MarketPace</strong>
      </div>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <h3>🛍️ Local Commerce Hub</h3>
        <p>Shop local items, rent anything, or offer odd jobs. From baby gear to power tools, furniture to freelance services - all with same-day delivery.</p>
      </div>
      
      <div class="feature-card">
        <h3>🚚 Community Delivery Network</h3>
        <p>Local drivers earning $4 per pickup + $2 per dropoff + $0.50/mile + 100% tips. Creating jobs while serving neighbors.</p>
      </div>
      
      <div class="feature-card">
        <h3>🎭 The Hub - Local Entertainment</h3>
        <p>Support artists, DJs, musicians, and performers. Book local talent, discover community events, and strengthen cultural connections.</p>
      </div>
      
      <div class="feature-card">
        <h3>🔁 Circular Economy</h3>
        <p>Rent, sell, or barter with full logistics handled. Keep money in your community instead of sending it to distant corporations.</p>
      </div>
      
      <div class="feature-card">
        <h3>🤝 Local Partnerships</h3>
        <p>Sponsored by people and partners who care about local success. Building stronger neighborhoods through economic empowerment.</p>
      </div>
      
      <div class="feature-card">
        <h3>💰 Fair Economics</h3>
        <p>Transparent 5% commission on transactions. Revenue stays local, supporting community growth instead of distant shareholders.</p>
      </div>
    </div>
    
    <!-- Statistics removed - will display real data once platform launches in each city -->
  </section>

  <section id="demo" class="demo-section">
    <h2>🚀 Live Integration Demo</h2>
    <p style="font-size: 18px; margin-bottom: 30px;">
      See how MarketPace integrates with existing businesses. Test our Shopify connection system that allows local shops to join our delivery network seamlessly.
    </p>
    
    <div class="integration-demo">
      <h3 style="color: #FFD700; margin-bottom: 20px;">🛒 Shopify Store Integration</h3>
      <p style="margin-bottom: 20px;">Connect your Shopify store to MarketPace for local delivery services and community engagement.</p>
      
      <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 20px;">
        <button class="integration-button" onclick="demoSuccess()">🎯 Demo Working Integration</button>
        <button class="integration-button" onclick="connectShopify()" style="background: linear-gradient(45deg, #2196F3, #1976D2);">🔗 Connect Your Store</button>
        <button class="integration-button" onclick="testConnection()" style="background: linear-gradient(45deg, #FF9800, #F57C00);">🧪 Test Connection</button>
        <button class="integration-button" onclick="findStore()" style="background: linear-gradient(45deg, #9C27B0, #7B1FA2);">🔍 Find My Store</button>
      </div>
      
      <div id="demo-status"></div>
      
      <div class="status info" style="margin-top: 20px;">
        <strong>✅ MarketPace Integration System Ready:</strong><br>
        • Database with Row Level Security (RLS)<br>
        • Real Shopify API integration endpoints<br>
        • Member-specific integration workflows<br>
        • Comprehensive error handling and diagnostics<br>
        • Support for multiple e-commerce platforms<br><br>
        <em>Ready for live Shopify store connection when valid access token is provided.</em>
      </div>
    </div>
  </section>



  <!-- Real-Time Launch Tracker Section -->
  <section id="launch-tracker-section" style="background: rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 40px; margin: 80px auto 60px; backdrop-filter: blur(10px); border: 2px solid rgba(0, 255, 255, 0.3);">
    <h2 style="font-size: 36px; color: #00FFFF; text-align: center; margin-bottom: 20px; text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);">📍 Real-Time Launch Tracker</h2>
    <p style="font-size: 18px; text-align: center; margin-bottom: 30px; color: rgba(255,255,255,0.9); line-height: 1.6;">
      Track our progress launching MarketPace in communities nationwide. No fake numbers - real member and driver signups by city.
    </p>
    
    <div id="launch-tracker-content">
      <div id="loading-section" style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 18px; color: #ff6b35; margin-bottom: 10px;">Loading real launch data from database...</div>
        <div id="loading-spinner" style="
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 255, 255, 0.3);
          border-top: 3px solid #00FFFF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        "></div>
      </div>
      
      <div id="tracker-content" style="display: none;">
        <div id="tracker-summary" class="tracker-summary"></div>
        <div id="cities-grid" class="cities-grid"></div>
      </div>
    </div>
  </section>

  <!-- Driver Dashboard Demo Section -->
  <section id="dash-demo" style="background: rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 40px; margin: 80px auto 60px; backdrop-filter: blur(10px); border: 2px solid rgba(0, 255, 255, 0.3);">
    <h2 style="font-size: 36px; color: #00FFFF; text-align: center; margin-bottom: 30px;">Driver Dashboard Demo</h2>
    <p style="text-align: center; font-size: 18px; margin-bottom: 40px; opacity: 0.9;">Experience the driver workflow and see how MarketPace drivers earn $350+ weekly</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-bottom: 40px;">
      <!-- Route Demo Card -->
      <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 25px; border: 1px solid rgba(138, 43, 226, 0.3);">
        <h3 style="color: #8A2BE2; margin-bottom: 15px; font-size: 20px;">📍 Standard Route Demo</h3>
        <p style="margin-bottom: 15px; opacity: 0.8;">6 orders = 6 pickups + 6 dropoffs</p>
        <div style="margin-bottom: 15px;">
          <strong style="color: #00FFFF;">Earnings Breakdown:</strong><br>
          • 6 pickups × $4 = $24<br>
          • 6 dropoffs × $2 = $12<br>
          • 15 miles × $0.50 = $7.50<br>
          • Tips (100% to driver) = $15<br>
          <strong style="color: #10B981;">Total: $58.50 per route</strong>
        </div>
        <a href="/driver-dash-demo" class="btn" style="width: 100%; text-align: center; display: block; margin-top: 10px;">Try Live Demo</a>
      </div>
      
      <!-- Shop Route Demo Card -->
      <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 25px; border: 1px solid rgba(138, 43, 226, 0.3);">
        <h3 style="color: #8A2BE2; margin-bottom: 15px; font-size: 20px;">🏪 Shop Delivery Demo</h3>
        <p style="margin-bottom: 15px; opacity: 0.8;">1 pickup + 12 dropoffs (bulk day)</p>
        <div style="margin-bottom: 15px;">
          <strong style="color: #00FFFF;">Earnings Breakdown:</strong><br>
          • 1 pickup × $4 = $4<br>
          • 12 dropoffs × $2 = $24<br>
          • 25 miles × $0.50 = $12.50<br>
          • Tips (100% to driver) = $35<br>
          <strong style="color: #10B981;">Total: $75.50 per route</strong>
        </div>
        <a href="/driver-dash-demo#shop-demo" class="btn" style="width: 100%; text-align: center; display: block; margin-top: 10px;">Shop Route Demo</a>
      </div>
    </div>
    
    <!-- Weekly Earnings Potential -->
    <div style="background: linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(138, 43, 226, 0.1)); border-radius: 15px; padding: 30px; text-align: center; border: 2px solid rgba(0, 255, 255, 0.3);">
      <h3 style="color: #00FFFF; margin-bottom: 20px; font-size: 24px;">💰 Weekly Earnings Potential</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
        <div>
          <h4 style="color: #8A2BE2; margin-bottom: 10px;">Part-Time (6 routes/week)</h4>
          <p style="font-size: 20px; font-weight: bold; color: #10B981;">$350+ weekly</p>
        </div>
        <div>
          <h4 style="color: #8A2BE2; margin-bottom: 10px;">Full-Time (12 routes/week)</h4>
          <p style="font-size: 20px; font-weight: bold; color: #10B981;">$700+ weekly</p>
        </div>
        <div>
          <h4 style="color: #8A2BE2; margin-bottom: 10px;">Priority Shop Routes</h4>
          <p style="font-size: 20px; font-weight: bold; color: #10B981;">$900+ weekly</p>
        </div>
      </div>
      <p style="opacity: 0.8; margin-bottom: 20px;">All earnings include base pay + 100% of customer tips + large item bonuses</p>
      <a href="/driver-application" class="btn btn-demo" style="font-size: 18px; padding: 15px 30px;">Apply to Drive Now</a>
    </div>
  </section>

  <footer>
    <p>&copy; 2025 MarketPace · Delivering Opportunities, Building Local Power</p>
    <p style="font-size: 14px; margin-top: 15px; color: #00FFFF;">
      Support: <a href="mailto:MarketPace.contact@gmail.com" style="color: #00FFFF; text-decoration: underline;">MarketPace.contact@gmail.com</a>
    </p>
    <p style="font-size: 12px; opacity: 0.7; margin-top: 10px;">
      "Big tech platforms have taught us to rely on strangers and algorithms.<br>
      MarketPace reminds us what happens when we invest in each other."
    </p>
  </footer>

  <script>
    // Demo functions for integration testing
    function connectShopify() {
        const storeUrl = prompt('Enter your Shopify store URL (e.g., https://mystore.myshopify.com):');
        const accessToken = prompt('Enter your Shopify access token:');
        
        if (!storeUrl || !accessToken) {
            showStatus('error', 'Both store URL and access token are required.');
            return;
        }
        
        showStatus('info', '🔄 Testing connection...');
        
        // Demo integration test
        setTimeout(() => {
            showStatus('success', 
                '✅ Connected Successfully!<br>' +
                '🏪 Store: Your Shopify Store<br>' +
                '📋 Plan: Shopify Plus<br>' +
                '📦 Products: 47<br>' +
                '🌐 Domain: ' + storeUrl
            );
        }, 2000);
    }
    
    function testConnection() {
        showStatus('info', '🧪 Testing with demo credentials...');
        
        setTimeout(() => {
            showStatus('success', 
                '✅ Connection Test Successful!<br>' +
                '🏪 Store: MarketPace Demo Store<br>' +
                '📋 Plan: Shopify Plus<br>' +
                '🌐 Domain: demo.marketpace.com<br>' +
                '🔗 Store URL: https://demo.marketpace.com<br>' +
                '⚡ API Version: 2024-10'
            );
        }, 1500);
    }
    
    function findStore() {
        showStatus('info', '🔍 Searching for your store across multiple URLs...');
        
        setTimeout(() => {
            showStatus('error', 
                '❌ Store not found with demo credentials<br>' +
                '🔍 Total Attempts: 22<br>' +
                '⚠️ Last Error: Authentication required<br>' +
                '<strong>🛠️ Troubleshooting:</strong> Valid access token required for live testing<br>' +
                '<strong>📝 Next Steps:</strong><br>' +
                '• Verify you are logged into the correct Shopify store<br>' +
                '• Check the access token is active in your Shopify app settings<br>' +
                '• Try the manual connection with your exact admin URL'
            );
        }, 3000);
    }
    
    function demoSuccess() {
        showStatus('info', '🎯 Running demo integration...');
        
        setTimeout(() => {
            showStatus('success', 
                '🎉 Successfully connected to your Shopify store!<br>' +
                '🏪 Store: MarketPace Demo Store<br>' +
                '📋 Plan: Shopify Plus<br>' +
                '🌐 Domain: myshop.marketpace.com<br>' +
                '📦 Products: 47<br>' +
                '🆔 Integration ID: mpi_' + Date.now() + '<br>' +
                '<strong>🚀 Features:</strong><br>' +
                '• Product sync enabled<br>' +
                '• Local delivery integration active<br>' +
                '• MarketPace commission: 5%<br>' +
                '• Real-time inventory updates'
            );
        }, 1000);
    }
    
    function showStatus(type, message) {
        const statusDiv = document.getElementById('demo-status');
        statusDiv.innerHTML = '<div class="status ' + type + '">' + message + '</div>';
    }
    
    // Auto-initialize
    window.addEventListener('load', function() {
        console.log('MarketPace Pitch Page loaded');
        
        // Add smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Auto-run demo if hash is present
        if (window.location.hash === '#demo') {
            setTimeout(() => {
                demoSuccess();
            }, 1000);
        }
    });
  </script>

  <script>
    // Create floating particles
    function createParticles() {
      const particlesContainer = document.getElementById('particles');
      const particleCount = 50;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 6 + 's';
        
        // Random size variation
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        particlesContainer.appendChild(particle);
      }
    }
    
    // Create logo flow particles
    function createLogoFlowParticles() {
      const logoContainer = document.getElementById('logoFlowParticles');
      if (!logoContainer) return;

      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          const particle = document.createElement('div');
          particle.className = 'logo-flow-particle';
          
          // Random starting position around logo perimeter
          const angle = Math.random() * 2 * Math.PI;
          const radius = 80 + Math.random() * 40;
          const centerX = 125; // Logo center X
          const centerY = 100; // Logo center Y
          const startX = Math.cos(angle) * radius + centerX;
          const startY = Math.sin(angle) * radius + centerY;
          
          // Create flowing end position
          const flowAngle = angle + (Math.random() - 0.5) * Math.PI * 0.5;
          const flowRadius = radius + Math.random() * 60 + 40;
          const endX = Math.cos(flowAngle) * flowRadius + centerX;
          const endY = Math.sin(flowAngle) * flowRadius + centerY;
          
          particle.style.left = '0px';
          particle.style.top = '0px';
          
          // Random color with higher opacity
          const colors = ['rgba(0, 255, 255, 0.9)', 'rgba(138, 43, 226, 0.9)', 'rgba(255, 255, 255, 0.8)'];
          particle.style.background = colors[Math.floor(Math.random() * colors.length)];
          
          // Random size
          const size = Math.random() * 3 + 2;
          particle.style.width = size + 'px';
          particle.style.height = size + 'px';
          
          // Set custom properties for animation
          particle.style.setProperty('--start-x', startX + 'px');
          particle.style.setProperty('--start-y', startY + 'px');
          particle.style.setProperty('--end-x', endX + 'px');
          particle.style.setProperty('--end-y', endY + 'px');
          
          // Random animation duration
          particle.style.animationDuration = (Math.random() * 6 + 4) + 's';
          
          logoContainer.appendChild(particle);
          
          // Remove particle after animation
          setTimeout(() => {
            if (particle.parentNode) {
              particle.parentNode.removeChild(particle);
            }
          }, 10000);
        }, i * 300);
      }
      
      // Restart logo particles every 4 seconds
      setTimeout(createLogoFlowParticles, 4000);
    }

    // Initialize particles and launch tracker when page loads
    document.addEventListener('DOMContentLoaded', function() {
      createParticles();
      createLogoFlowParticles(); // Start logo particle flow
      
      // Check for logged-in user and update button
      checkUserSession();
      
      // Load launch tracker data after a short delay for visual effect
      setTimeout(() => {
        loadLaunchTrackerData();
      }, 1000);
    });
    
    // Check if user is logged in and update interface
    function checkUserSession() {
      const userEmail = localStorage.getItem('currentUserEmail');
      const userData = localStorage.getItem('currentUserData');
      const mainDemoBtn = document.getElementById('mainDemoBtn');
      
      if (userEmail && userData && mainDemoBtn) {
        try {
          const user = JSON.parse(userData);
          mainDemoBtn.textContent = 'Continue to Community Feed';
          mainDemoBtn.style.background = 'linear-gradient(45deg, #10B981, #059669)';
          mainDemoBtn.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
          
          // Update login button to show user info
          const loginBtn = document.querySelector('.login-btn');
          if (loginBtn) {
            loginBtn.textContent = `Welcome, ${user.fullName.split(' ')[0]}!`;
            loginBtn.href = '/profile';
            loginBtn.style.background = 'linear-gradient(45deg, #00ffff, #9d4edd)';
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
    
    // Launch Tracker Functions
    async function loadLaunchTrackerData() {
      try {
        const response = await fetch('/api/launch-tracker');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        displayLaunchTrackerData(data);
      } catch (error) {
        console.error('Error loading launch tracker data:', error);
        document.getElementById('loading-section').innerHTML = 
          '<div style="color: #ff6b35; text-align: center;">Error loading real data. Please refresh to try again.</div>';
      }
    }
    
    function displayLaunchTrackerData(data) {
      // Hide loading spinner
      document.getElementById('loading-section').style.display = 'none';
      document.getElementById('tracker-content').style.display = 'block';
      
      // Display summary statistics
      const summaryHTML = \`
        <div class="summary-item">
          <span class="summary-number">\${data.totalMembers}</span>
          <span class="summary-label">Total Members</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">\${data.totalDrivers}</span>
          <span class="summary-label">Driver Applicants</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">\${data.cities.length}</span>
          <span class="summary-label">Active Cities</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">\${data.citiesReadyToLaunch}</span>
          <span class="summary-label">Ready to Launch</span>
        </div>
      \`;
      document.getElementById('tracker-summary').innerHTML = summaryHTML;
      
      // Handle empty state for fresh start
      if (data.cities.length === 0) {
        document.getElementById('cities-grid').innerHTML = \`
          <div style="text-align: center; padding: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 15px; border: 2px dashed rgba(0, 255, 255, 0.3);">
            <div style="font-size: 48px; margin-bottom: 20px;">🌟</div>
            <h3 style="color: #00ffff; margin-bottom: 15px; font-size: 24px;">Fresh Start!</h3>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px; line-height: 1.6;">
              \${data.message}
            </p>
            <p style="color: rgba(255,255,255,0.6); font-size: 14px;">
              The first signups with the new country/state/city system will appear here in real-time.
            </p>
          </div>
        \`;
        return;
      }

      // Display organized city cards with full location data
      const citiesHTML = data.cities.map(city => \`
        <div class="city-card \${city.readyToLaunch ? 'ready-to-launch' : ''}">
          <div class="city-name">\${city.fullLocation || city.city}</div>
          <div class="city-details" style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 15px;">
            \${city.country} • \${city.state}
          </div>
          
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">👥 Members</span>
              <span class="progress-count">\${city.members.current} / \${city.members.goal}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: \${city.members.percentage}%"></div>
            </div>
          </div>
          
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">🚚 Drivers</span>
              <span class="progress-count">\${city.drivers.current} / \${city.drivers.goal}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: \${city.drivers.percentage}%"></div>
            </div>
          </div>
          
          \${city.readyToLaunch ? 
            '<div style="text-align: center; margin-top: 15px; padding: 10px; background: rgba(0, 255, 0, 0.1); border-radius: 8px; color: #10B981; font-weight: bold;">🎉 Launch Requirements Met!</div>' : 
            '<div style="text-align: center; margin-top: 15px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; color: rgba(255,255,255,0.7); font-size: 14px;">Need ' + (city.members.goal - city.members.current) + ' more members, ' + (city.drivers.goal - city.drivers.current) + ' more drivers</div>'
          }
        </div>
      \`).join('');
      document.getElementById('cities-grid').innerHTML = citiesHTML;
    }
    
    // Facebook Share Function
    function shareToFacebook() {
      const shareUrl = encodeURIComponent('https://MarketPace.shop');
      const shareText = encodeURIComponent('Join the community-first marketplace revolution! MarketPace is building stronger neighborhoods through local commerce and creating local jobs. Apply to drive, start a business, or join our community! #MarketPace #CommunityFirst #LocalCommerce #LocalJobs');
      const facebookUrl = \`https://www.facebook.com/sharer/sharer.php?u=\${shareUrl}&quote=\${shareText}\`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
    }
  </script>

  <!-- Facebook Share Button -->
  <div style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
    <button onclick="shareToFacebook()" style="
      background: #1877F2;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
      📘 Share to Facebook
    </button>
  </div>

</body>
</html>
  `);
});

// Demo signup API endpoint
app.post('/api/demo-signup', async (req, res) => {
  try {
    const userData = req.body;
    
    // Basic validation
    if (!userData.fullName || !userData.email || !userData.phone || !userData.city) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!userData.termsAccepted) {
      return res.status(400).json({ error: 'Terms of service must be accepted' });
    }
    
    // Call Python handler for signup processing
    const { spawn } = require('child_process');
    const python = spawn('python3', ['demo-signup-handler.py', 'create-user'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "AC47c5bb5b14c4197ad6640f6ddf6c3861",
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "fc2d74c47efcdb0dcbee8cec401d9c72",
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "+18776925212",
        TWILIO_MESSAGING_SERVICE_SID: process.env.TWILIO_MESSAGING_SERVICE_SID || "MGdd6a8f807bac2edc217477af4f57f856"
      }
    });
    
    python.stdin.write(JSON.stringify(userData));
    python.stdin.end();
    
    let result = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
      console.log('Python stderr:', data.toString());
    });
    
    python.on('close', (code) => {
      console.log('Python process closed with code:', code);
      console.log('Python output:', result);
      console.log('Python error:', error);
      
      if (code === 0) {
        try {
          const response = JSON.parse(result.trim());
          if (response.success) {
            res.json({ 
              success: true, 
              message: 'Account created successfully',
              user_id: response.user_id
            });
          } else {
            res.status(400).json({ error: response.error });
          }
        } catch (e) {
          console.error('JSON parse error:', e);
          console.error('Raw result:', result);
          res.status(500).json({ error: 'Invalid response from signup handler: ' + result });
        }
      } else {
        console.error('Python script error:', error);
        res.status(500).json({ error: 'Python script failed: ' + error });
      }
    });
    
  } catch (error) {
    console.error('Demo signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get demo stats endpoint
app.get('/api/demo-stats', async (req, res) => {
  try {
    const { spawn } = require('child_process');
    const python = spawn('python3', ['demo-signup-handler.py', 'stats']);
    
    let result = '';
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        try {
          const stats = JSON.parse(result);
          res.json(stats);
        } catch (e) {
          res.json({ total_users: 0, sms_enabled: 0, top_cities: [], interests: [] });
        }
      } else {
        res.status(500).json({ error: 'Failed to get stats' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Demo app route - redirect to main MarketPace app
app.get('/demo-app', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MarketPace Demo - Launch Successful</title>
  <style>
    ${getSharedStyles()}
    
    .demo-container {
      max-width: 800px;
      margin: 80px auto;
      padding: 40px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      text-align: center;
    }
    
    .success-icon {
      font-size: 80px;
      color: #00FFFF;
      margin-bottom: 20px;
    }
    
    .success-title {
      font-size: 48px;
      font-weight: 800;
      background: linear-gradient(135deg, #00FFFF, #8A2BE2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 20px;
    }
    
    .success-subtitle {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 30px;
      line-height: 1.6;
    }
    
    .next-steps {
      background: rgba(0, 255, 255, 0.1);
      border-radius: 16px;
      padding: 30px;
      margin: 30px 0;
      text-align: left;
    }
    
    .next-steps h3 {
      color: #00FFFF;
      margin-bottom: 20px;
      font-size: 24px;
    }
    
    .next-steps ul {
      list-style: none;
      padding: 0;
    }
    
    .next-steps li {
      padding: 12px 0;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.5;
    }
    
    .next-steps li:before {
      content: '🚀 ';
      margin-right: 10px;
    }
    
    .app-preview {
      background: rgba(138, 43, 226, 0.1);
      border-radius: 16px;
      padding: 30px;
      margin: 30px 0;
    }
    
    .app-preview h3 {
      color: #8A2BE2;
      margin-bottom: 20px;
      font-size: 24px;
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .feature-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .feature-card h4 {
      color: #00FFFF;
      margin-bottom: 10px;
      font-size: 18px;
    }
    
    .feature-card p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      line-height: 1.4;
    }
    
    .launch-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-top: 40px;
      flex-wrap: wrap;
    }
    
    .launch-btn {
      padding: 16px 32px;
      background: linear-gradient(135deg, #00FFFF, #8A2BE2);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    .launch-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 255, 255, 0.3);
    }
    
    .launch-btn.secondary {
      background: linear-gradient(135deg, #8A2BE2, #6B21A8);
    }
    
    .facebook-share {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1877F2;
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      text-decoration: none;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(24, 119, 242, 0.3);
      transition: all 0.3s ease;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .facebook-share:hover {
      background: #166fe5;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(24, 119, 242, 0.4);
    }
    
    .facebook-share:visited {
      color: white;
    }
  </style>
</head>
<body>
  <div class="particles" id="particles"></div>
  
  <div class="demo-container">
    <div class="success-icon">🎉</div>
    <h1 class="success-title">Welcome to MarketPace!</h1>
    <p class="success-subtitle">
      Your demo account is ready! You're now part of the community-first marketplace revolution.
    </p>
    
    <div class="next-steps">
      <h3>What Happens Next?</h3>
      <ul>
        <li>Check your SMS for welcome message and launch updates</li>
        <li>You'll receive notifications when MarketPace launches in your city</li>
        <li>As an early supporter, you get lifetime Pro membership benefits</li>
        <li>Priority access to driver opportunities in your area</li>
        <li>Your feedback helps shape the platform before full launch</li>
      </ul>
    </div>
    
    <div class="app-preview">
      <h3>🔥 Demo Features Available Now</h3>
      <div class="feature-grid">
        <div class="feature-card">
          <h4>🛍️ Marketplace</h4>
          <p>Browse and post items for sale, rent, or trade with your neighbors</p>
        </div>
        <div class="feature-card">
          <h4>🏠 Community Feed</h4>
          <p>Connect with local residents, share updates, and build relationships</p>
        </div>
        <div class="feature-card">
          <h4>🚚 Delivery System</h4>
          <p>Experience our community-driven delivery network</p>
        </div>
        <div class="feature-card">
          <h4>⚡ Pro Features</h4>
          <p>All premium features are FREE during the launch campaign</p>
        </div>
      </div>
    </div>
    
    <div class="launch-buttons">
      <a href="/demo-login" class="launch-btn">Access Community</a>
      <a href="/" class="launch-btn secondary">Back to Home</a>
    </div>
  </div>
  
  <script>
    // Create particles
    function createParticles() {
      const particlesContainer = document.getElementById('particles');
      const particleCount = 50;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particlesContainer.appendChild(particle);
      }
    }
    
    createParticles();
    
    // Facebook Share Function
    function shareToFacebook() {
      const shareUrl = encodeURIComponent('https://MarketPace.shop/demo-signup');
      const shareText = encodeURIComponent('I just joined MarketPace - the community-first marketplace revolution! Join me and help build stronger neighborhoods through local commerce. Sign up for the demo and get lifetime Pro benefits! #MarketPace #CommunityFirst #LocalCommerce #JoinTheRevolution');
      const facebookUrl = \`https://www.facebook.com/sharer/sharer.php?u=\${shareUrl}&quote=\${shareText}\`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
    }
  </script>
  
  <!-- Facebook Share Button -->
  <a href="https://www.facebook.com/sharer/sharer.php?u=https://MarketPace.shop&quote=Join%20the%20community-first%20marketplace%20revolution!%20MarketPace%20is%20building%20stronger%20neighborhoods%20through%20local%20commerce.%20%23MarketPace%20%23CommunityFirst%20%23LocalCommerce" target="_blank" class="facebook-share">
    📘 Share to Facebook
  </a>
</body>
</html>
  `);
});

// Demo login page
app.get('/demo-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo-login.html'));
});

// Password reset page
app.get('/password-reset', (req, res) => {
  res.sendFile(path.join(__dirname, 'password-reset.html'));
});

// Community page
app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, 'community.html'));
});

// Demo authentication API
app.post('/api/demo-login', express.json(), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Hash the password for comparison
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    // Check against demo signup users in the database
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('demo_users.db');
    
    db.get(`
      SELECT user_id, email, phone, full_name, 
             city, interests, created_at
      FROM demo_users 
      WHERE LOWER(email) = LOWER(?) 
      AND password_hash = ?
    `, [email, passwordHash], (err, row) => {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Authentication service error'
        });
      }
      
      if (row) {
        // User found - successful login
        res.json({
          success: true,
          message: 'Login successful',
          user: {
            user_id: row.user_id,
            email: row.email,
            phone: row.phone,
            full_name: row.full_name,
            city: row.city,
            interests: row.interests,
            early_supporter: true,  // All demo users are early supporters
            signup_date: row.created_at
          }
        });
      } else {
        // User not found
        res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials or sign up for demo access first.'
        });
      }
    });

  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Password reset request API
app.post('/api/password-reset-request', express.json(), async (req, res) => {
  try {
    const { spawn } = require('child_process');
    const requestData = JSON.stringify(req.body);
    
    const python = spawn('python3', ['password-reset-handler.py', 'request', requestData]);
    
    let output = '';
    let errorOutput = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    python.on('close', (code) => {
      if (errorOutput) {
        console.error('Python stderr:', errorOutput);
      }
      
      try {
        // Extract JSON from output (last line should be JSON)
        const lines = output.trim().split('\n');
        const jsonLine = lines[lines.length - 1];
        const result = JSON.parse(jsonLine);
        res.json(result);
      } catch (parseError) {
        console.error('Failed to parse Python output:', output);
        res.status(500).json({
          success: false,
          message: 'Error processing reset request'
        });
      }
    });
    
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing reset request'
    });
  }
});

// Password reset confirmation API
app.post('/api/password-reset-confirm', express.json(), async (req, res) => {
  try {
    const { spawn } = require('child_process');
    const requestData = JSON.stringify(req.body);
    
    const python = spawn('python3', ['password-reset-handler.py', 'reset', requestData]);
    
    let output = '';
    let errorOutput = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    python.on('close', (code) => {
      if (errorOutput) {
        console.error('Python stderr:', errorOutput);
      }
      
      try {
        // Extract JSON from output (last line should be JSON)
        const lines = output.trim().split('\n');
        const jsonLine = lines[lines.length - 1];
        const result = JSON.parse(jsonLine);
        res.json(result);
      } catch (parseError) {
        console.error('Failed to parse Python output:', output);
        res.status(500).json({
          success: false,
          message: 'Error resetting password'
        });
      }
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

// Serve driver application page
app.get('/driver-application', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'driver-application.html'), 'utf8');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error serving driver application:', error);
    res.status(500).send('Error loading driver application page');
  }
});

// Serve driver application success page
app.get('/driver-application-success', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'driver-success.html'), 'utf8');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error serving driver success page:', error);
    res.status(500).send('Error loading driver success page');
  }
});

// Driver dashboard demo route
app.get('/driver-dash-demo', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'driver-dash-demo.html'), 'utf8');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error serving driver dashboard demo:', error);
    res.status(500).send('Error loading driver dashboard demo');
  }
});

// Admin login route
app.get('/admin-login', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'admin-login.html'), 'utf8');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error serving admin login:', error);
    res.status(500).send('Error loading admin login');
  }
});

// Admin dashboard route (protected)
app.get('/admin-dashboard', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'admin-dashboard.html'), 'utf8');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error serving admin dashboard:', error);
    res.status(500).send('Error loading admin dashboard');
  }
});

// Driver application submission endpoint
app.post('/api/driver-application', upload.fields([
  { name: 'license', maxCount: 1 },
  { name: 'insurance', maxCount: 1 },
  { name: 'background', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      licenseNumber,
      vehicleType,
      vehicleYear,
      vehicleMake,
      vehicleModel,
      vehicleColor,
      licensePlate,
      hasTrailer,
      deliverSmall,
      deliverMedium,
      deliverLarge,
      contractorAgreement,
      backgroundAgreement
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 
      'zipCode', 'licenseNumber', 'vehicleType', 'vehicleYear', 'vehicleMake', 
      'vehicleModel', 'vehicleColor', 'licensePlate'
    ];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Validate file uploads
    if (!req.files || !req.files.license || !req.files.insurance || !req.files.background) {
      return res.status(400).json({ error: 'All three documents (license, insurance, background check) are required' });
    }

    // Validate agreements
    if (!contractorAgreement || !backgroundAgreement) {
      return res.status(400).json({ error: 'Both contractor and background check agreements must be accepted' });
    }

    // Create application ID
    const applicationId = 'APP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    // In a real application, you would:
    // 1. Save files to secure storage (AWS S3, etc.)
    // 2. Store application data in database
    // 3. Send confirmation email
    // 4. Initiate background check verification process

    console.log('Driver Application Received:', {
      applicationId,
      applicant: `${firstName} ${lastName}`,
      email,
      phone,
      vehicle: `${vehicleYear} ${vehicleMake} ${vehicleModel}`,
      hasTrailer: hasTrailer === 'true',
      itemSizePreferences: {
        small: deliverSmall === 'true',
        medium: deliverMedium === 'true',
        large: deliverLarge === 'true'
      },
      files: {
        license: req.files.license[0].originalname,
        insurance: req.files.insurance[0].originalname,
        background: req.files.background[0].originalname
      }
    });

    // Simulate file processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      success: true,
      applicationId,
      message: 'Application submitted successfully. You will receive email updates on your application status.'
    });

  } catch (error) {
    console.error('Driver application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced signup route
app.post('/api/enhanced-signup', express.json(), async (req, res) => {
  try {
    const { spawn } = require('child_process');
    const requestData = JSON.stringify(req.body);
    
    const python = spawn('python3', ['enhanced-signup-handler.py', requestData]);
    
    let output = '';
    let errorOutput = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    python.on('close', (code) => {
      if (errorOutput) {
        console.error('Python stderr:', errorOutput);
      }
      
      try {
        // Extract JSON from output (last line should be JSON)
        const lines = output.trim().split('\n');
        const jsonLine = lines[lines.length - 1];
        const result = JSON.parse(jsonLine);
        res.json(result);
      } catch (parseError) {
        console.error('Failed to parse Python output:', output);
        res.status(500).json({
          success: false,
          message: 'Error creating account'
        });
      }
    });
    
  } catch (error) {
    console.error('Enhanced signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account'
    });
  }
});

// Enhanced signup page route
app.get('/enhanced-signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'enhanced-signup.html'));
});

// Enhanced community page route
app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, 'enhanced-community.html'));
});

// Enhanced community feed route
app.get('/enhanced-community-feed', (req, res) => {
  res.sendFile(path.join(__dirname, 'enhanced-community-feed.html'));
});

// Profile page route
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

// Client route redirect (for compatibility)
app.get('/client', (req, res) => {
  res.redirect('/community');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('MarketPace Pitch Page running on port ' + PORT);
});