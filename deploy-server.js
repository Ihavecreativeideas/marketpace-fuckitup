// Deployment server that detects the correct port automatically
const express = require('express');
const path = require('path');

const app = express();

// Use environment PORT or default to 3000
let port = process.env.PORT || 3000;

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

app.get('/signup-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup-login.html'));
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