import { worldchain, worldchainSepolia } from "viem/chains";
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'JWT_SECRET',
  'RESOLVER_PRIVATE_KEY',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'DEV_DUEL_CONTRACT_ADDRESS',
  'MAIN_DUEL_CONTRACT_ADDRESS',
  'DEV_RPC_URL',
  'MAIN_RPC_URL',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not set`);
  }
});

export const NODE_ENV = process.env.NODE_ENV || 'development';

export const ENV: 'main' | 'dev' = NODE_ENV === 'production' ? 'main' : 'dev';
export const CHAIN = ENV === 'main' ? worldchain : worldchainSepolia;

export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';
export const RESOLVER_PRIVATE_KEY = process.env.RESOLVER_PRIVATE_KEY || '';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || 3306;
export const DB_USERNAME = process.env.DB_USERNAME || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
export const DB_DATABASE = process.env.DB_DATABASE || 'wldle';
export const CONTRACT_ADDRESSES = {
  dev: {
    duel: process.env.DEV_DUEL_CONTRACT_ADDRESS,
  },
  main: {
    duel: process.env.MAIN_DUEL_CONTRACT_ADDRESS,
  }
};
export const RPC_URLS = {
  dev: process.env.DEV_RPC_URL,
  main: process.env.MAIN_RPC_URL,
};

export const JWT_ACCESS_TOKEN_EXPIRY = '1h';
export const JWT_REFRESH_TOKEN_EXPIRY = '14d';
export const SIGN_MESSAGE = 'Sign in to wldle';
export const MAX_TRIES = 6;
