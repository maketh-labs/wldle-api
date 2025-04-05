import {AuthController} from "./AuthController";
import {GameController} from "./GameController";
import {DailyGameStatController} from "./DailyGameStatController";

export const authController = new AuthController();
export const gameController = new GameController();
export const dailyGameStatController = new DailyGameStatController();