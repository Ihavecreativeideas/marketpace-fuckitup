const express = require('express');
const path = require('path');

const app = express();

// Serve static files from client/
app.use(express.static(path.join(__dirname, '../client')));

// Fallback route for any unknown URL — send index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

module.exports = app;