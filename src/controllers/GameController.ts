import {Request, Response} from "express";
import {gameService} from "../services";

export class GameController {
  async getGame(req: Request, res: Response) {
    try {
      const {gameId} = req.params;

      if (!gameId) {
        return res.status(400).json({error: "Game ID is required"});
      }

      const game = await gameService.getGameById(gameId);

      return res.status(200).json({
        gameId: game.gameId,
        player1: game.player1,
        player2: game.player2,
        resolver: game.resolver,
        amount: game.amount,
        fee: game.fee,
        token: game.token,
        settled: game.settled,
        player1Completed: game.player1Completed,
        player2Completed: game.player2Completed,
        winner: game.winner,
        signature: game.signature
      });
    } catch (error: any) {
      console.error("Get game error:", error);
      return res.status(500).json({error: error.message || "Failed to get game"});
    }
  }

  async getPlayerProgress(req: Request, res: Response) {
    try {
      const {gameId} = req.params;
      const address = req.user?.address;

      if (!gameId) {
        return res.status(400).json({error: "Game ID is required"});
      }

      if (!address) {
        return res.status(401).json({error: "User not authenticated"});
      }

      const progress = await gameService.getPlayerProgress(gameId, address);

      return res.status(200).json(progress);
    } catch (error: any) {
      console.error("Get player progress error:", error);
      return res.status(500).json({error: error.message || "Failed to get player progress"});
    }
  }

  async makeGuess(req: Request, res: Response) {
    try {
      const {gameId} = req.params;
      const {guess} = req.body;
      const address = req.user?.address;

      if (!gameId || !guess) {
        return res.status(400).json({error: "Game ID and guess are required"});
      }

      if (!address) {
        return res.status(401).json({error: "User not authenticated"});
      }

      const result = await gameService.makeGuess(gameId, address, guess);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Make guess error:", error);
      return res.status(400).json({error: error.message || "Failed to make guess"});
    }
  }
} 