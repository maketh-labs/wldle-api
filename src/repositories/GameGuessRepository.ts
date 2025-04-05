import { AppDataSource } from "../utils/database";
import { GameGuess } from "../models";
import { checksumAddress } from "viem";
export class GameGuessRepository {
  private repository = AppDataSource.getRepository(GameGuess);

  async create(guessData: Partial<GameGuess>): Promise<GameGuess> {
    const gameGuess = this.repository.create({
      ...guessData,
      player: guessData.player ? checksumAddress(guessData.player as `0x${string}`) : undefined
    });
    return this.repository.save(gameGuess);
  }

  async getGuessesByGameAndPlayer(gameId: string, player: string): Promise<GameGuess[]> {
    return this.repository.find({
      where: { gameId, player: checksumAddress(player as `0x${string}`) },
      order: { tryNumber: 'ASC' }
    });
  }

  async countGuessesByGameAndPlayer(gameId: string, player: string): Promise<number> {
    return this.repository.count({
      where: { gameId, player: checksumAddress(player as `0x${string}`) }
    });
  }

  async getLastGuessForPlayer(gameId: string, player: string): Promise<GameGuess | null> {
    return this.repository.findOne({
      where: { gameId, player: checksumAddress(player as `0x${string}`) },
      order: { tryNumber: 'DESC' }
    });
  }
} 