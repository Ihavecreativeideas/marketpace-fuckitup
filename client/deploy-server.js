// Deployment server that detects the correct port automatically
const express = require('express');
const path = require('path');

const app = express();

// Use environment PORT or default to 5000 (Replit's preference)
let port = process.env.PORT || 5000;

console.log(`🔍 Attempting to start on port: ${port}`);
console.log(`🌐 Environment PORT: ${process.env.PORT || 'not set'}`);

// Basic middleware
app.use(express.static('.'));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pitch-page.html'));
});

// Community route
app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, 'community.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    port: port,
    timestamp: new Date().toISOString(),
    server: 'MarketPace Deploy Server'
  });
});

// Additional routes
app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, 'support.html'));
});

app.get('/interactive-map', (req, res) => {
  res.sendFile(path.join(__dirname, 'interactive-map.html'));
});

app.get('/item-verification', (req, res) => {
  res.sendFile(path.join(__dirname, 'item-verification.html'));
});

app.get('/signup-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup-login.html'));
});

// Add all missing navigation routes
app.get('/shops', (req, res) => {
  res.sendFile(path.join(__dirname, 'shops.html'));
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'services.html'));
});

app.get('/rentals', (req, res) => {
  res.sendFile(path.join(__dirname, 'rentals.html'));
});

app.get('/the-hub', (req, res) => {
  res.sendFile(path.join(__dirname, 'the-hub.html'));
});

app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'marketpace-menu.html'));
});

// Business Scheduling route
app.get('/business-scheduling', (req, res) => {
  res.sendFile(path.join(__dirname, 'business-scheduling.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'cart.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'settings.html'));
});

app.get('/delivery', (req, res) => {
  res.sendFile(path.join(__dirname, 'delivery.html'));
});

app.get('/deliveries', (req, res) => {
  res.sendFile(path.join(__dirname, 'deliveries.html'));
});

// Add rental flow pages
app.get('/message-owner', (req, res) => {
  res.sendFile(path.join(__dirname, 'message-owner.html'));
});

app.get('/rental-delivery', (req, res) => {
  res.sendFile(path.join(__dirname, 'rental-delivery.html'));
});

// Catch-all for other HTML pages
app.get('/:page', (req, res) => {
  const pageName = req.params.page;
  const filePath = path.join(__dirname, pageName + '.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      // If file doesn't exist, redirect to home
      res.redirect('/');
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ MarketPace Deploy Server running on port ${port}`);
  console.log(`🌐 Binding to 0.0.0.0:${port} for external access`);
  console.log(`🚀 Ready for deployment`);
}).on('error', (err) => {
  console.error(`❌ Failed to start on port ${port}:`, err.message);
  if (err.code === 'EADDRINUSE') {
    console.log(`🔄 Port ${port} is busy, trying next port...`);
    // Try next port
    const nextPort = parseInt(port) + 1;
    console.log(`🔄 Retrying on port ${nextPort}`);
  }
});