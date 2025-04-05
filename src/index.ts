import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./utils/database";
import { authenticateToken } from "./utils/middleware";
import { authController, gameController } from "./controllers";
import { PORT } from "./constants";

dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase()
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Auth Routes
app.post("/auth/login", authController.login);
app.post("/auth/refresh", authController.refreshToken);
app.post("/auth/logout", authenticateToken, authController.logout);

// Game Routes
app.get("/games/:gameId", gameController.getGame);
app.get("/games/:gameId/progress", authenticateToken, gameController.getPlayerProgress);
app.post("/games/:gameId/guess", authenticateToken, gameController.makeGuess);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 