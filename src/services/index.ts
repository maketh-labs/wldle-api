import {AuthService} from "./AuthService";
import {GameService} from "./GameService";
import {DailyGameStatService} from "./DailyGameStatService";

export const authService = new AuthService();
export const gameService = new GameService();
export const dailyGameStatService = new DailyGameStatService();