import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {initializeDatabase} from "./utils/database";
import {authenticateToken} from "./utils/middleware";
import {authController, dailyGameStatController, gameController} from "./controllers";
import {PORT} from "./constants";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

initializeDatabase()
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.status(200).json({
    title: "WLDLE API",
    description: "Welcome to the WLDLE API. Use the endpoints to interact with the game."
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({status: "OK"});
});

app.post("/auth/login", authController.login);
app.post("/auth/refresh", authController.refreshToken);
app.post("/auth/logout", authenticateToken, authController.logout);

app.post("/games/filter", gameController.getGames);
app.get("/games/:gameId", gameController.getGame);
app.get("/games/:gameId/progress/:address", gameController.getPlayerProgress);
app.post("/games/:gameId/guess", authenticateToken, gameController.makeGuess);

app.post("/daily-stats", dailyGameStatController.recordAndGetStats);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 