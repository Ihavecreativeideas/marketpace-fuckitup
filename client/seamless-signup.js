const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email transporter setup (using environment variables)
const emailTransporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'marketpace.contact@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'demo_password'
  }
});

// POST route for seamless signup
router.post('/api/seamless-signup', (req, res) => {
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
          if (updateErr) {
            db.close();
            return res.status(500).json({ success: false, error: 'Failed to update user' });
          }
          
          // Send welcome email and return success
          sendWelcomeEmail(userData);
          db.close();
          
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
            early_supporter, signup_date, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(insertQuery, [
          userId, userData.email, passwordHash, fullName, phone, userData.city, userData.country, userData.state,
          interests, userData.accountType, userData.bio, userData.businessName, userData.businessWebsite,
          userData.businessAddress, userData.workPhone, userData.businessDescription, businessCategories,
          1, signupDate, signupDate
        ], function(insertErr) {
          if (insertErr) {
            db.close();
            return res.status(500).json({ success: false, error: 'Failed to create user' });
          }
          
          // Send welcome email and return success
          sendWelcomeEmail(userData);
          db.close();
          
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

// POST route for seamless login
router.post('/api/seamless-login', (req, res) => {
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

function sendWelcomeEmail(userData) {
  const mailOptions = {
    from: 'MarketPace <marketpace.contact@gmail.com>',
    to: userData.email,
    subject: '🎉 Welcome to MarketPace - Your Account is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #0d0221, #1a0633); color: white; padding: 40px; border-radius: 15px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00FFFF; font-size: 32px; margin: 0;">Welcome to MarketPace!</h1>
          <p style="color: #FFD700; font-size: 18px; margin: 10px 0;">🌟 Early Supporter - Lifetime Pro Benefits</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 25px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #00FFFF; margin-bottom: 15px;">Hello ${userData.firstName}!</h2>
          <p style="line-height: 1.6;">
            Your MarketPace account has been successfully created. You're now part of our community-first marketplace platform where you can buy, sell, rent, and connect with your local community.
          </p>
        </div>
        
        <div style="background: rgba(255, 215, 0, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #FFD700; margin: 20px 0;">
          <h3 style="color: #FFD700; margin-bottom: 10px;">🔒 Security Notice</h3>
          <p style="margin-bottom: 15px;">
            If you did not create this account, please contact us immediately at 
            <a href="mailto:MarketPace.contact@gmail.com" style="color: #00FFFF;">MarketPace.contact@gmail.com</a>
          </p>
          <p style="margin: 0;">
            <strong>If you did create this account:</strong> Welcome to MarketPace! You can now access all features of our platform.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://marketpace.shop/enhanced-community-feed" 
             style="background: linear-gradient(45deg, #00FFFF, #8A2BE2); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; display: inline-block;">
            🚀 Start Exploring MarketPace
          </a>
        </div>
        
        <div style="text-align: center; font-size: 14px; opacity: 0.8; margin-top: 30px;">
          <p>&copy; 2025 MarketPace · Delivering Opportunities, Building Local Power</p>
          <p>Support: <a href="mailto:MarketPace.contact@gmail.com" style="color: #00FFFF;">MarketPace.contact@gmail.com</a></p>
        </div>
      </div>
    `
  };
  
  // Send email (will fail gracefully if not configured)
  emailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Email send failed:', error.message);
    } else {
      console.log('Welcome email sent:', info.response);
    }
  });
}

module.exports = router;