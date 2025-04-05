import {AppDataSource} from "../utils/database";
import {DailyGameStat} from "../models";

export class DailyGameStatRepository {
  private repository = AppDataSource.getRepository(DailyGameStat);

  async findByPlayIdAndTryNumber(playId: string, tryNumber: number): Promise<DailyGameStat | null> {
    return this.repository.findOne({
      where: {
        playId,
        tryNumber
      }
    });
  }

  async createOrIncrement(playId: string, tryNumber: number): Promise<DailyGameStat> {
    const existing = await this.findByPlayIdAndTryNumber(playId, tryNumber);

    if (existing) {
      // Increment count and save
      existing.count += 1;
      return this.repository.save(existing);
    } else {
      // Create new entry
      const newStat = this.repository.create({
        playId,
        tryNumber,
        count: 1
      });
      return this.repository.save(newStat);
    }
  }

  async getAllStatsByPlayId(playId: string): Promise<DailyGameStat[]> {
    return this.repository.find({
      where: {
        playId
      },
      order: {
        tryNumber: 'ASC'
      }
    });
  }
} 