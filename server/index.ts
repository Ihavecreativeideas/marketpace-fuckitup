import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { config } from "dotenv";
import { registerRoutes } from "./routes";
import { registerAdminRoutes } from "./adminRoutes";
import { registerSponsorshipRoutes } from "./sponsorshipRoutes";
import integrationRoutes from "./integrations";

// Load environment variables
config();

const app = express();

// Privacy compliant security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"], // CRITICAL FIX: Allow onclick handlers
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:", "https://images.unsplash.com"],
      connectSrc: ["'self'", "https:", "https://api.stripe.com", "https://checkout.stripe.com"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://checkout.stripe.com", "https://js.stripe.com"],
      formAction: ["'self'", "https://checkout.stripe.com"],
    },
  },
  // Add privacy sandbox headers
  crossOriginEmbedderPolicy: false,
  // Enable privacy sandbox features
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: [
    'http://localhost:8083',
    'https://localhost:8083',
    'exp://localhost:8083',
    'exp://172.31.128.31:8083',
    /^https:\/\/.*\.replit\.dev$/,
    /^https:\/\/.*\.replit\.app$/,
    /^exp:\/\/.*$/,
    /^https:\/\/.*\.spock\.replit\.dev$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Privacy-Sandbox']
}));

// Privacy compliance middleware
app.use((req, res, next) => {
  // Set proper security headers for privacy compliance
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Privacy sandbox headers
  res.setHeader('Interest-Cohort', '()');
  res.setHeader('Sec-CH-UA', '()');
  
  // For cross-site cookies (when needed)
  if (req.headers.cookie) {
    res.setHeader('Set-Cookie', req.headers.cookie + '; SameSite=None; Secure');
  }
  
  next();
});

app.use(express.json());
app.use(express.static("client/dist"));
app.use(express.static(path.join(__dirname, '../')));

// Main landing page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../pitch-page.html'));
});

// Facebook integration demo route
app.get('/facebook-demo', (req, res) => {
  res.sendFile(path.join(__dirname, '../facebook-integration-demo.html'));
});

// Policy and legal pages
app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, '../privacy-policy.html'));
});

app.get('/terms-of-service', (req, res) => {
  res.sendFile(path.join(__dirname, '../terms-of-service.html'));
});

app.get('/data-deletion', (req, res) => {
  res.sendFile(path.join(__dirname, '../data-deletion.html'));
});

// Community feed route
app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, '../community.html'));
});

// Sign up/login route  
app.get('/signup-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../signup-login.html'));
});

// The Hub route
app.get('/the-hub', (req, res) => {
  res.sendFile(path.join(__dirname, '../the-hub.html'));
});

// Shops route
app.get('/shops', (req, res) => {
  res.sendFile(path.join(__dirname, '../shops.html'));
});

// Delivery route
app.get('/delivery', (req, res) => {
  res.sendFile(path.join(__dirname, '../delivery.html'));
});

// Services route
app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, '../services.html'));
});

// Profile route
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../profile.html'));
});

// Platform integrations route
app.get('/platform-integrations', (req, res) => {
  res.sendFile(path.join(__dirname, '../platform-integrations.html'));
});

// Food ordering page
app.get('/food-ordering', (req, res) => {
  res.sendFile(path.join(__dirname, '../food-ordering.html'));
});

// Uber Eats OAuth Demo page
app.get('/uber-eats-oauth-demo', (req, res) => {
  res.sendFile(path.join(__dirname, '../uber-eats-oauth-demo.html'));
});

// Button test page route
app.get('/button-test', (req, res) => {
  res.sendFile(path.join(__dirname, '../button-test.html'));
});

// Admin dashboard route
app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-dashboard.html'));
});

// Admin login route
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-login.html'));
});

// Driver application route
app.get('/driver-application', (req, res) => {
  res.sendFile(path.join(__dirname, '../driver-application.html'));
});

// Simple button test route
app.get('/simple-test', (req, res) => {
  res.sendFile(path.join(__dirname, '../simple-button-test.html'));
});

// Debug button test route
app.get('/debug-buttons', (req, res) => {
  res.sendFile(path.join(__dirname, '../debug-buttons.html'));
});

// Cart route
app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, '../cart.html'));
});

// Checkout route
app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, '../checkout.html'));
});

// Seamless signup API endpoint
app.post('/api/seamless-signup', async (req, res) => {
  const { email, password, phone } = req.body;
  
  if (!email || !password || !phone) {
    return res.status(400).json({ success: false, message: 'Email, password, and phone are required' });
  }
  
  try {
    // In a real app, you would:
    // 1. Hash the password
    // 2. Store user in database
    // 3. Send verification SMS
    
    console.log(`New user signup: ${email}, ${phone}`);
    
    res.json({ 
      success: true, 
      message: 'Account created successfully',
      user: { email, phone, loggedIn: true }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Honor System Delivery Endpoints
app.post('/api/delivery/size', async (req, res) => {
  const { orderId, size, quantity } = req.body;
  
  if (!orderId || !size || !quantity) {
    return res.status(400).json({ success: false, message: 'Order ID, size, and quantity are required' });
  }
  
  try {
    // Calculate delivery fee based on honor system rules
    let deliveryFee = 0;
    if (size === 'medium' || size === 'large' || size === 'bulk') {
      deliveryFee = 25;
    }
    
    // In a real app, save to database
    console.log(`Delivery size update: Order ${orderId}, Size: ${size}, Quantity: ${quantity}, Fee: $${deliveryFee}`);
    
    res.json({ 
      success: true, 
      message: 'Delivery size updated successfully',
      deliveryFee,
      yourShare: deliveryFee / 2
    });
  } catch (error) {
    console.error('Delivery size update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/delivery/honesty-rating', async (req, res) => {
  const { raterId, ratedUserId, orderId, honestyScore, comment } = req.body;
  
  if (!raterId || !ratedUserId || !orderId || !honestyScore) {
    return res.status(400).json({ success: false, message: 'Rater ID, rated user ID, order ID, and honesty score are required' });
  }
  
  try {
    // In a real app, save honesty rating to database
    console.log(`Honesty rating: ${raterId} rated ${ratedUserId} ${honestyScore} stars for order ${orderId}`);
    
    res.json({ 
      success: true, 
      message: 'Honesty rating submitted successfully',
      rating: { honestyScore, comment }
    });
  } catch (error) {
    console.error('Honesty rating error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/delivery/pricing-rules', (req, res) => {
  res.json({
    success: true,
    rules: {
      small: { fee: 0, description: "Fits in garbage bag - No extra fee" },
      medium: { fee: 25, description: "Larger than garbage bag - +$25 oversized fee" },
      large: { fee: 25, description: "Furniture, appliances - +$25 oversized fee" },
      bulk: { fee: 25, description: "Large bulk delivery - +$25 oversized fee" }
    },
    splitPolicy: "50/50 between buyer and seller",
    commission: "5% platform fee on oversized charges (excluding tips)"
  });
});

// Seamless login API endpoint
app.post('/api/seamless-login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  
  try {
    // In a real app, you would:
    // 1. Verify password hash
    // 2. Check user exists in database
    
    console.log(`User login: ${email}`);
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: { email, loggedIn: true }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Forgot password API endpoint
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  
  // In a real app, you would:
  // 1. Check if email exists in database
  // 2. Generate a secure reset token
  // 3. Send email with reset link
  
  // For demo purposes, we'll just respond with success
  console.log(`Password reset requested for: ${email}`);
  
  res.json({ 
    success: true, 
    message: 'Password reset email sent if account exists' 
  });
});

// Facebook OAuth routes
app.get('/api/auth/facebook', (req, res) => {
  const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5000/api/auth/facebook/callback')}&scope=email,public_profile&response_type=code`;
  res.redirect(facebookAuthUrl);
});

app.get('/api/auth/facebook/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect('/signup-login?error=facebook_auth_failed');
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5000/api/auth/facebook/callback')}&code=${code}`);
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return res.redirect('/signup-login?error=facebook_token_failed');
    }
    
    // Get user info
    const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`);
    const userData = await userResponse.json();
    
    // Store user session
    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      provider: 'facebook',
      loggedIn: true,
      loginTime: Date.now()
    };
    
    // In a real app, you would store this in a secure session
    // For demo purposes, we'll redirect with user data
    res.redirect(`/community?user=${encodeURIComponent(JSON.stringify(user))}`);
    
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.redirect('/signup-login?error=facebook_auth_error');
  }
});

// Google OAuth routes
app.get('/api/auth/google', (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback')}&scope=openid email profile&response_type=code`;
  res.redirect(googleAuthUrl);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect('/signup-login?error=google_auth_failed');
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return res.redirect('/signup-login?error=google_token_failed');
    }
    
    // Get user info
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`);
    const userData = await userResponse.json();
    
    // Store user session
    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      provider: 'google',
      loggedIn: true,
      loginTime: Date.now()
    };
    
    // In a real app, you would store this in a secure session
    // For demo purposes, we'll redirect with user data
    res.redirect(`/community?user=${encodeURIComponent(JSON.stringify(user))}`);
    
  } catch (error) {
    console.error('Google auth error:', error);
    res.redirect('/signup-login?error=google_auth_error');
  }
});

// Admin login page
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-login.html'));
});

// Admin dashboard (existing route for compatibility)
app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-dashboard.html'));
});

// New Admin Dashboard Data API
app.get('/api/admin/dashboard-data', (req, res) => {
  // In a real app, this would fetch from database
  const dashboardData = {
    totalUsers: 2847,
    totalBusinesses: 89,
    totalDrivers: 342,
    totalRevenue: 4250,
    analytics: {
      pageViews: 23487,
      transactions: 156,
      deliveries: 234,
      conversionRate: 12.5
    },
    drivers: {
      pending: 23,
      active: 89,
      completedRoutes: 156,
      poolBalance: 562.50
    },
    funds: {
      commission: 2140,
      protection: 940,
      damage: 562.50,
      sustainability: 315
    },
    sponsors: {
      bronze: 3,
      silver: 5,
      gold: 2,
      platinum: 2
    }
  };
  
  res.json(dashboardData);
});

const port = process.env.PORT || 5000;

// Register admin routes
registerAdminRoutes(app);

// Register sponsorship routes
registerSponsorshipRoutes(app);

// Register integration routes
app.use('/api/integrations', integrationRoutes);

registerRoutes(app).then((server) => {
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
});
