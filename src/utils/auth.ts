import jwt from 'jsonwebtoken';
import { verifyMessage } from 'viem';
import { SIGN_MESSAGE, JWT_ACCESS_TOKEN_EXPIRY, JWT_REFRESH_TOKEN_EXPIRY, JWT_SECRET } from '../constants';
import dotenv from 'dotenv';

dotenv.config();

export const verifySignature = async (address: string, signature: string): Promise<boolean> => {
  try {
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message: SIGN_MESSAGE,
      signature: signature as `0x${string}`,
    });
    return isValid;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

export const generateAccessToken = (address: string): string => {
  return jwt.sign({ address }, JWT_SECRET, { expiresIn: JWT_ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = (address: string): string => {
  return jwt.sign({ address }, JWT_SECRET, { expiresIn: JWT_REFRESH_TOKEN_EXPIRY });
};

export const verifyAccessToken = (token: string): { address: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { address: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): { address: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { address: string };
    return decoded;
  } catch (error) {
    return null;
  }
}; 