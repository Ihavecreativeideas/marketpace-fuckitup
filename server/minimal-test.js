const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from client folder
app.use(express.static(path.join(__dirname, '../client')));

// Fallback to index.html for all routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});