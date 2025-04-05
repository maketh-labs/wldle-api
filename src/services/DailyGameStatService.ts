import {dailyGameStatRepository} from "../repositories";
import {DailyGameStat} from "../models";

export class DailyGameStatService {
  async recordTry(playId: string, tryNumber: number): Promise<DailyGameStat> {
    if (!playId || typeof playId !== 'string' || playId.length > 200) {
      throw new Error("Invalid play ID. Must be a string with max length of 200 characters.");
    }

    if (!tryNumber || ![1, 2, 3, 4, 5, 6, 7].includes(tryNumber)) {
      throw new Error("Invalid try number. Must be one of: 1, 2, 3, 4, 5, 6, 7.");
    }

    return dailyGameStatRepository.createOrIncrement(playId, tryNumber);
  }

  async getPlayerStats(playId: string): Promise<DailyGameStat[]> {
    if (!playId || typeof playId !== 'string' || playId.length > 200) {
      throw new Error("Invalid play ID. Must be a string with max length of 200 characters.");
    }

    return dailyGameStatRepository.getAllStatsByPlayId(playId);
  }
} 