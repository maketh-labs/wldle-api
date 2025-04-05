import {DataSource} from "typeorm";
import {Game, GameGuess, User, DailyGameStat} from "../models";
import {DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USERNAME, NODE_ENV} from "src/constants";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: DB_HOST || "localhost",
  port: Number(DB_PORT) || 3306,
  username: DB_USERNAME || "root",
  password: DB_PASSWORD || "password",
  database: DB_DATABASE || "wldle",
  entities: [User, Game, GameGuess, DailyGameStat],
  synchronize: false,
  logging: NODE_ENV !== "production",
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connection initialized");
  } catch (error) {
    console.error("Error initializing database connection:", error);
    throw error;
  }
};