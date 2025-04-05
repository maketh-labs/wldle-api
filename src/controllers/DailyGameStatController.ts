import {Request, Response} from "express";
import {dailyGameStatService} from "../services";

export class DailyGameStatController {
  async recordAndGetStats(req: Request, res: Response) {
    try {
      const {id, tryNumber} = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({error: "ID is required and must be a string"});
      }

      if (id.length > 200) {
        return res.status(400).json({error: "ID must be 200 characters or less"});
      }

      if (!tryNumber || ![1, 2, 3, 4, 5, 6, 7].includes(Number(tryNumber))) {
        return res.status(400).json({error: "Try number must be one of: 1, 2, 3, 4, 5, 6, 7"});
      }

      // Record the try
      await dailyGameStatService.recordTry(id, Number(tryNumber));

      // Get all stats for the player
      const stats = await dailyGameStatService.getPlayerStats(id);

      // Format the response
      const formattedStats = stats.reduce((acc, stat) => {
        acc[`try${stat.tryNumber}`] = stat.count;
        return acc;
      }, {} as Record<string, number>);

      return res.status(200).json({
        id,
        stats: formattedStats
      });
    } catch (error: any) {
      console.error("Daily game stats error:", error);
      return res.status(400).json({error: error.message || "Failed to record daily game statistics"});
    }
  }
} 