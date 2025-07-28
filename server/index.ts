import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from client/
app.use(express.static(path.join(__dirname, '../client')));

// Fallback route for any unknown URL — send index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});