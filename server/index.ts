import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

// Security and CORS middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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

// Admin login page
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-login.html'));
});

// Admin dashboard (existing)
app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-dashboard.html'));
});

const port = process.env.PORT || 5000;

registerRoutes(app).then((server) => {
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
});
