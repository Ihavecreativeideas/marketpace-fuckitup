// Minimal test server to isolate connectivity issues
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>MarketPace Test</title></head>
    <body>
      <h1>MarketPace Server Test</h1>
      <p>Server is running on port ${PORT}</p>
      <p>External connectivity test successful!</p>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', port: PORT, timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('External connectivity test active');
});