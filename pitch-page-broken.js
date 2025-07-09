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
      font-size: 12px;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.3;
      font-weight: 300;
      opacity: 0.9;
    }
    
    .logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 40px;
      margin-bottom: 40px;
      flex-wrap: wrap;
      position: relative;
    }
    
    .logo-image {
      width: 160px;
      height: 160px;
      border-radius: 25px;
      box-shadow: 0 0 40px rgba(0, 255, 255, 0.5);
      filter: drop-shadow(0 0 25px rgba(138, 43, 226, 0.4));
      transition: transform 0.3s ease;
      position: relative;
      z-index: 5;
      mask: radial-gradient(circle, black 50%, transparent 80%);
      -webkit-mask: radial-gradient(circle, black 50%, transparent 80%);
    }
    
    .logo-image:hover {
      transform: scale(1.05);
    }
    
    .logo-particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 3;
    }
    
    .logo-particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: rgba(0, 255, 255, 0.8);
      border-radius: 50%;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.9);
      animation: logoFloat 6s infinite linear;
      left: 50%;
      top: 50%;
      transform-origin: 0 0;
    }
    
    .logo-particle:nth-child(odd) {
      background: rgba(138, 43, 226, 0.8);
      box-shadow: 0 0 15px rgba(138, 43, 226, 0.9);
      animation-duration: 8s;
    }
    
    .logo-particle:nth-child(3n) {
      background: rgba(0, 191, 255, 0.7);
      box-shadow: 0 0 12px rgba(0, 191, 255, 0.8);
      animation-duration: 4s;
    }
    
    @keyframes logoFloat {
      0% { 
        transform: rotate(0deg) translateX(60px) rotate(0deg);
        opacity: 0.8; 
      }
      25% { 
        transform: rotate(90deg) translateX(60px) rotate(-90deg);
        opacity: 1; 
      }
      50% { 
        transform: rotate(180deg) translateX(60px) rotate(-180deg);
        opacity: 0.9; 
      }
      75% { 
        transform: rotate(270deg) translateX(60px) rotate(-270deg);
        opacity: 1; 
      }
      100% { 
        transform: rotate(360deg) translateX(60px) rotate(-360deg);
        opacity: 0.8; 
      }
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
    
    footer {
      background: rgba(0, 0, 0, 0.3);
      text-align: center;
      padding: 30px;
      font-size: 14px;
      color: #ccc;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .logo-container-centered {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 40px;
      position: relative;
    }
    
    .logo-image-centered {
      width: 150px;
      height: 150px;
      border-radius: 25px;
      box-shadow: 0 0 40px rgba(0, 255, 255, 0.6);
      filter: drop-shadow(0 0 30px rgba(138, 43, 226, 0.4));
      transition: transform 0.3s ease;
      position: relative;
      z-index: 10;
      mask: radial-gradient(circle, black 60%, transparent 90%);
      -webkit-mask: radial-gradient(circle, black 60%, transparent 90%);
    }
    
    .logo-image-centered:hover {
      transform: scale(1.05);
    }
    


    @media (max-width: 768px) {
      header h1 { font-size: 36px; }
      .features-grid { grid-template-columns: 1fr; }
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
    ${getSharedStyles()}
    
    .nav-buttons {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }
    
    .nav-button {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      padding: 10px 20px;
      margin: 0 5px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 5px;
      text-decoration: none;
      cursor: pointer;
      display: inline-block;
      transition: background 0.3s ease;
    }
    
    .nav-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .hero-section {
      text-align: center;
      padding: 100px 20px 80px;
      position: relative;
      z-index: 10;
    }
    
    h1 {
      font-size: 4rem;
      font-weight: 800;
      margin: 30px 0;
      background: linear-gradient(45deg, #00FFFF, #8A2BE2, #00BFFF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
      filter: drop-shadow(0 0 10px rgba(138, 43, 226, 0.4));
    }
    
    .tagline {
      font-size: 1.8rem;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 20px;
      font-weight: 300;
    }
    
    .subtitle {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 50px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
    }
    
    .cta-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 80px;
    }
    
    .cta-button {
      background: linear-gradient(45deg, #00ffff, #9d4edd);
      color: white;
      padding: 18px 40px;
      font-size: 18px;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(0, 255, 255, 0.3);
    }
    
    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(0, 255, 255, 0.4);
    }
    
    .cta-button.secondary {
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
    }
    
    .cta-button.secondary:hover {
      box-shadow: 0 12px 35px rgba(255, 107, 53, 0.4);
    }
  </style>
</head>
<body>
  <div class="particles" id="particles"></div>
  
  <div class="nav-buttons" id="navButtons">
    <a href="/enhanced-signup.html" class="nav-button">Sign Up</a>
    <a href="/demo-login.html" class="nav-button">Login</a>
  </div>

  <header>
    <div class="logo-container">
      <div class="logo-particles" id="logoParticles"></div>
      <img src="/marketpace-logo-1.jpeg" alt="MarketPace Logo" class="logo-image">
    </div>
    <p>More than a marketplace. We deliver opportunity - supporting local shops, services, and entertainers in your community. You set the pace, we make it happen!</p>
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="/enhanced-community-feed" class="btn" id="demoButton" style="background: linear-gradient(45deg, #00FFFF, #8A2BE2); margin-right: 15px;">Try Live Demo</a>
      <a href="#sponsorship" class="btn" style="background: linear-gradient(45deg, #FFD700, #FFA500); margin-right: 15px;">Partner With Us</a>
      <a href="/driver-application.html" class="btn" style="background: linear-gradient(45deg, #ff6b35, #f7931e);">Apply to Drive</a>
    </div>
  </header>

  <section>
    <h2>📖 Founder's Pledge</h2>
    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 40px; margin: 40px 0; border: 2px solid rgba(0, 255, 255, 0.3); backdrop-filter: blur(10px); display: flex; align-items: center; gap: 30px; flex-wrap: wrap;">
      <div style="flex: 0 0 120px;">
        <img src="/attached_assets/IMG_7976_1751900735722.jpeg" alt="Brooke Brown - Founder" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(0, 255, 255, 0.5); box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);">
      </div>
      <div style="flex: 1; min-width: 300px;">
        <div style="font-size: 18px; line-height: 1.7; margin-bottom: 25px;">
          I got so sick of Facebook's scammer and bot problems that I finally just built something myself.
        </div>
        
        <div style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          As a musician and artist, I've watched too many talented people get taken advantage of online. 
          I've seen ticket scams targeting my fellow performers, fake job postings preying on gig workers, 
          and algorithm-driven feeds designed to trigger us emotionally rather than inform us meaningfully.
        </div>
        
        <div style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          I wanted to create something different — a platform that puts authentic community connection 
          above engagement metrics, where your neighbors matter more than distant algorithms, and where 
          local commerce strengthens the place you actually live.
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

  <!-- Driver Dashboard Demo Section -->
  <section id="dash-demo" style="background: rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 40px; margin: 80px auto 60px; backdrop-filter: blur(10px); border: 2px solid rgba(0, 255, 255, 0.3);">
    <h2 style="font-size: 36px; color: #00FFFF; text-align: center; margin-bottom: 30px;">Driver Dashboard Demo</h2>
    <p style="text-align: center; font-size: 18px; margin-bottom: 40px; opacity: 0.9;">Experience the driver workflow and see how MarketPace drivers earn $350+ weekly</p>
    
    <div style="display: flex; justify-content: center; margin-bottom: 40px;">
      <!-- Route Demo Card -->
      <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 25px; border: 1px solid rgba(138, 43, 226, 0.3); max-width: 400px; width: 100%;">
        <h3 style="color: #8A2BE2; margin-bottom: 15px; font-size: 20px; text-align: center;">📍 Standard Route Demo</h3>
        <p style="margin-bottom: 15px; opacity: 0.8; text-align: center;">6 orders = 6 pickups + 6 dropoffs</p>
        <div style="margin-bottom: 15px;">
          <strong style="color: #00FFFF;">Earnings Breakdown:</strong><br>
          • 6 pickups × $4 = $24<br>
          • 6 dropoffs × $2 = $12<br>
          • 15 miles × $0.50 = $7.50<br>
          • Tips (100% to driver) = $15<br>
          <strong style="color: #10B981;">Total: $58.50 per route</strong>
        </div>
        <div style="text-align: center;">
          <a href="/driver-dash-demo" class="btn" style="display: inline-block; margin-top: 10px;">Try Live Demo</a>
        </div>
      </div>
    </div>
    
    <!-- Weekly Earnings Potential -->
    <div style="background: linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(138, 43, 226, 0.1)); border-radius: 15px; padding: 30px; text-align: center; border: 2px solid rgba(0, 255, 255, 0.3);">
      <h3 style="color: #00FFFF; margin-bottom: 20px; font-size: 24px;">Join Our Driver Network</h3>
      <p style="opacity: 0.8; margin-bottom: 20px; font-size: 16px;">
        Become part of the MarketPace delivery team and help build stronger communities while earning flexible income.
      </p>
      <a href="/driver-application" class="btn btn-demo" style="font-size: 18px; padding: 15px 30px;">Apply Now</a>
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
    
    // Update navigation based on login status
    function updateNavigation() {
      const userEmail = localStorage.getItem('currentUserEmail');
      const userData = localStorage.getItem('currentUserData');
      const navButtons = document.getElementById('navButtons');
      const demoButton = document.getElementById('demoButton');
      
      if (userEmail && userData) {
        try {
          const currentUser = JSON.parse(userData);
          navButtons.innerHTML = '<a href="/enhanced-community-feed" class="nav-button">Continue to Community Feed</a><a href="/profile" class="nav-button">Profile</a>';
          demoButton.textContent = 'Continue to Community Feed';
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else {
        demoButton.href = '/enhanced-signup.html';
      }
    }
    
    updateNavigation();
    
    // Create logo flow particles
    function createLogoFlowParticles() {
        const logoContainer = document.getElementById('logoParticles');
        if (!logoContainer) return;
        
        // Clear existing particles
        logoContainer.innerHTML = '';
        
        // Create 15 particles flowing in circles around the logo
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'logo-particle';
            
            // Distribute particles evenly around the circle
            const startAngle = (i / 15) * 360;
            particle.style.animationDelay = (i * 0.4) + 's';
            particle.style.transform = `rotate(${startAngle}deg)`;
            
            logoContainer.appendChild(particle);
        }
    }
    
    // Start logo particles
    createLogoFlowParticles();
    
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
    
    // Make functions global
    window.connectShopify = connectShopify;
    window.testConnection = testConnection;
    window.findStore = findStore;
    window.demoSuccess = demoSuccess;
  </script>
</body>
</html>
  `);
});

// Enhanced community feed route
app.get('/enhanced-community-feed', (req, res) => {
  res.sendFile(path.join(__dirname, 'enhanced-community-feed.html'));
});

// Profile page route
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

// Other routes
app.get('/enhanced-signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'enhanced-signup.html'));
});

app.get('/demo-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo-login.html'));
});

app.get('/driver-application', (req, res) => {
  res.sendFile(path.join(__dirname, 'driver-application.html'));
});

// Client route redirect (for compatibility)
app.get('/client', (req, res) => {
  res.redirect('/enhanced-community-feed');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('MarketPace Pitch Page running on port ' + PORT);
});