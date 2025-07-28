const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

console.log('Starting simple test server...');
console.log('Client directory:', path.join(__dirname, '../client'));

// Serve static files from client/
app.use(express.static(path.join(__dirname, '../client')));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date() });
});

// Fallback route for any unknown URL — send index.html
app.use((req, res) => {
  console.log('Fallback route hit for:', req.url);
  const indexPath = path.join(__dirname, '../client/index.html');
  console.log('Sending index.html from:', indexPath);
  res.sendFile(indexPath);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Simple test server running on port ${port}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, '../client')}`);
});