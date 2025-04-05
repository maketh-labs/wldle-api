import {UserRepository} from "./UserRepository";
import {GameRepository} from "./GameRepository";
import {GameGuessRepository} from "./GameGuessRepository";
import {DailyGameStatRepository} from "./DailyGameStatRepository";

export const userRepository = new UserRepository();
export const gameRepository = new GameRepository();
export const gameGuessRepository = new GameGuessRepository();
export const dailyGameStatRepository = new DailyGameStatRepository();