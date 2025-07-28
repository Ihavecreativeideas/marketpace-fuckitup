import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Static serve from client folder
app.use(express.static(path.join(__dirname, '../client')));

// Fallback to index.html (avoiding problematic parameterized routes)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});