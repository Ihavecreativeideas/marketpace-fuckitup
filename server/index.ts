import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { registerRoutes } from "./routes";
import { registerAdminRoutes } from "./adminRoutes";

const app = express();

// Privacy compliant security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
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

// Admin login page
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-login.html'));
});

// Admin dashboard (existing)
app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-dashboard.html'));
});

// Dedicated admin pages
app.get('/admin-drivers.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-drivers.html'));
});

app.get('/admin-campaigns.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-campaigns.html'));
});

app.get('/admin-promotions.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-promotions.html'));
});

app.get('/admin-routes.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-routes.html'));
});

app.get('/admin-content.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-content.html'));
});

app.get('/admin-integrations.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-integrations.html'));
});

const port = process.env.PORT || 5000;

// Register admin routes
registerAdminRoutes(app);

registerRoutes(app).then((server) => {
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
});
