import express from "express";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(express.static("client/dist"));

const port = process.env.PORT || 8000;

registerRoutes(app).then((server) => {
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
});
