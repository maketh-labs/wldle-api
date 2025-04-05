import {gameGuessRepository, gameRepository} from "../repositories";
import {account, getGameFromChain, signGameResult} from "../utils/blockchain";
import {getRandomWord, playWordle} from "../utils/wordle";
import {MAX_TRIES} from "../constants";
import {Game} from "../models";
import {Address, zeroAddress} from "viem";

export class GameService {
  async getGameById(gameId: string): Promise<Game> {
    try {
      const gameDataFromChain = await getGameFromChain(gameId);

      const game = await gameRepository.findOrCreate(gameId, gameDataFromChain);

      return game;
    } catch (error) {
      console.error('Error getting game:', error);
      throw new Error('Failed to get game');
    }
  }

  async getGamesByIdList(gameIds: string[]): Promise<Game[]> {
    return gameRepository.findByGameIdList(gameIds);
  }

  async validateGameForPlay(gameId: string, playerAddress: string): Promise<Game> {
    const game = await this.getGameById(gameId);

    if (game.settled) {
      throw new Error('Game is already settled');
    }

    if (game.resolver.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error('Invalid resolver');
    }

    if (Number(game.fee) < 100) {
      throw new Error('Fee is too low');
    }

    const isPlayer1 = game.player1.toLowerCase() === playerAddress.toLowerCase();
    const isPlayer2 = game.player2?.toLowerCase() === playerAddress.toLowerCase();

    if (!isPlayer1 && !isPlayer2) {
      throw new Error('You are not a player in this game');
    }

    if ((isPlayer1 && game.player1Completed) || (isPlayer2 && game.player2Completed)) {
      throw new Error('You have already completed this game');
    }

    if (!game.answer) {
      const answer = getRandomWord();
      await gameRepository.update(gameId, {answer});
      game.answer = answer;
    }

    return game;
  }

  async makeGuess(gameId: string, playerAddress: string, guess: string): Promise<any> {
    const game = await this.validateGameForPlay(gameId, playerAddress);

    const guessesMade = await gameGuessRepository.countGuessesByGameAndPlayer(gameId, playerAddress);
    if (guessesMade >= MAX_TRIES) {
      throw new Error(`You have already made ${MAX_TRIES} guesses`);
    }

    if (!game.answer) {
      throw new Error('Game does not have a valid answer');
    }

    const result = playWordle(game.answer, guess);

    const previousGuesses = await gameGuessRepository.getGuessesByGameAndPlayer(gameId, playerAddress);
    const alreadySolved = previousGuesses.some(g => g.pattern.solved);
    if (alreadySolved) {
      throw new Error('You have already solved this puzzle');
    }

    const isPlayer1 = game.player1.toLowerCase() === playerAddress.toLowerCase();
    await gameGuessRepository.create({
      gameId,
      player: playerAddress,
      guess,
      pattern: result,
      tryNumber: guessesMade + 1
    });

    if (result.solved || guessesMade + 1 >= MAX_TRIES) {
      const allGuesses = await gameGuessRepository.getGuessesByGameAndPlayer(gameId, playerAddress);

      const greenCount = allGuesses.reduce((sum, g) =>
        sum + g.pattern.pattern.filter(p => p === 'green').length, 0);

      const blueCount = allGuesses.reduce((sum, g) =>
        sum + g.pattern.pattern.filter(p => p === 'blue').length, 0);

      await gameRepository.updatePlayerCompletion(
        gameId,
        isPlayer1,
        result.solved ? guessesMade + 1 : 0,
        greenCount,
        blueCount
      );

      const updatedGame = await this.getGameById(gameId);
      if (updatedGame.player1Completed && updatedGame.player2Completed) {
        await this.determineWinner(gameId);
      }
    }

    return {
      gameId,
      guess,
      pattern: result.pattern,
      solved: result.solved,
      tryNumber: guessesMade + 1
    };
  }

  async determineWinner(gameId: string): Promise<string> {
    const game = await this.getGameById(gameId);

    if (!game.player1Completed || !game.player2Completed) {
      throw new Error('Both players must complete the game to determine a winner');
    }

    let winner: Address = zeroAddress; // Default to draw (zero address)

    // Rule 1: If one player solved and the other didn't
    if (game.player1Tries && !game.player2Tries) {
      winner = game.player1 as `0x${string}`;
    } else if (!game.player1Tries && game.player2Tries) {
      winner = game.player2 as `0x${string}`;
    }
    // Rule 2: Both solved, compare number of tries
    else if (game.player1Tries && game.player2Tries) {
      if (game.player1Tries < game.player2Tries) {
        winner = game.player1 as `0x${string}`;
      } else if (game.player2Tries < game.player1Tries) {
        winner = game.player2 as `0x${string}`;
      }
      // Rule 3-5: Same tries, compare green and blue counts
      else {
        if (game.player1Green !== undefined && game.player2Green !== undefined) {
          if (game.player1Green! > game.player2Green!) {
            winner = game.player1 as `0x${string}`;
          } else if (game.player2Green! > game.player1Green!) {
            winner = game.player2 as `0x${string}`;
          } else if (game.player1Blue !== undefined && game.player2Blue !== undefined) {
            if (game.player1Blue! > game.player2Blue!) {
              winner = game.player1 as `0x${string}`;
            } else if (game.player2Blue! > game.player1Blue!) {
              winner = game.player2 as `0x${string}`;
            }
          }
        }
      }
    }

    const signature = await signGameResult(gameId, winner);

    await gameRepository.updateWinner(gameId, winner, signature);

    return winner;
  }

  async getPlayerProgress(gameId: string, playerAddress: string): Promise<any> {
    const game = await this.getGameById(gameId);

    const isPlayer1 = game.player1.toLowerCase() === playerAddress.toLowerCase();
    const isPlayer2 = game.player2?.toLowerCase() === playerAddress.toLowerCase();

    if (!isPlayer1 && !isPlayer2) {
      throw new Error('You are not a player in this game');
    }

    const guesses = await gameGuessRepository.getGuessesByGameAndPlayer(gameId, playerAddress);

    return {
      gameId,
      completed: isPlayer1 ? game.player1Completed : game.player2Completed,
      guesses: guesses.map(g => ({
        guess: g.guess,
        pattern: g.pattern.pattern,
        solved: g.pattern.solved,
        tryNumber: g.tryNumber
      })),
      remainingTries: MAX_TRIES - guesses.length,
      winner: game.winner
    };
  }
}