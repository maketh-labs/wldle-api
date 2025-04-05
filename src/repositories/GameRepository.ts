import {AppDataSource} from "../utils/database";
import {Game} from "../models";
import {checksumAddress} from "viem";

export class GameRepository {
  private repository = AppDataSource.getRepository(Game);

  async findByGameId(gameId: string): Promise<Game | null> {
    return this.repository.findOneBy({gameId});
  }

  async create(gameData: Partial<Game>): Promise<Game> {
    const game = this.repository.create({
      ...gameData,
      player1: gameData.player1 ? checksumAddress(gameData.player1 as `0x${string}`) : undefined,
      player2: gameData.player2 ? checksumAddress(gameData.player2 as `0x${string}`) : undefined
    });
    return this.repository.save(game);
  }

  async update(gameId: string, gameData: Partial<Game>): Promise<void> {
    await this.repository.update({gameId}, {
      ...gameData,
      player1: gameData.player1 ? checksumAddress(gameData.player1 as `0x${string}`) : undefined,
      player2: gameData.player2 ? checksumAddress(gameData.player2 as `0x${string}`) : undefined
    });
  }

  async findOrCreate(gameId: string, gameData: Partial<Game>): Promise<Game> {
    const game = await this.findByGameId(gameId);
    if (game) {
      // Update only if settled is false
      if (!game.settled) {
        await this.update(gameId, gameData);
        return this.findByGameId(gameId) as Promise<Game>;
      }
      return game;
    }

    return this.create({gameId, ...gameData});
  }

  async updatePlayerCompletion(
    gameId: string,
    isPlayer1: boolean,
    tries: number,
    green: number,
    blue: number
  ): Promise<void> {
    if (isPlayer1) {
      await this.update(gameId, {
        player1Completed: true,
        player1Tries: tries,
        player1Green: green,
        player1Blue: blue
      });
    } else {
      await this.update(gameId, {
        player2Completed: true,
        player2Tries: tries,
        player2Green: green,
        player2Blue: blue
      });
    }
  }

  async updateWinner(gameId: string, winner: string, signature: string): Promise<void> {
    await this.update(gameId, {winner, signature});
  }
}