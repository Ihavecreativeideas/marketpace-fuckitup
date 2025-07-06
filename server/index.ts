import express from "express";
import cors from "cors";
import helmet from "helmet";
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

const port = process.env.PORT || 5000;

registerRoutes(app).then((server) => {
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
});
