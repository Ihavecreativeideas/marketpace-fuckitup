// Alternative entry point for deployment
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Create a simple proxy server
const app = express();

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', server: 'MarketPace Proxy' });
});

// Proxy all requests to the clean server
app.use((req, res) => {
  const targetUrl = `http://localhost:5000${req.url}`;
  console.log(`Proxying ${req.method} ${req.url} to clean server`);
  
  // Simple redirect approach
  res.redirect(302, '/');
});

// Start the clean server first
console.log('🚀 Starting MarketPace Clean Server...');
const serverProcess = spawn('npx', ['tsx', 'server/clean-server.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Start proxy server on a different port if needed
if (PORT !== '5000') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔄 Proxy server running on port ${PORT}`);
    console.log(`🎯 Forwarding to clean server on port 5000`);
  });
}