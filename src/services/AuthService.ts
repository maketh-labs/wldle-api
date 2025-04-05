import { userRepository } from "../repositories";
import { verifySignature, generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/auth";

export class AuthService {
  async authenticate(address: string, signature: string) {
    // Verify the signature
    const isValid = await verifySignature(address, signature);
    if (!isValid) {
      throw new Error("Invalid signature");
    }

    // Find or create the user
    const user = await userRepository.findOrCreate(address);

    // Generate tokens
    const accessToken = generateAccessToken(address);
    const refreshToken = generateRefreshToken(address);

    // Save refresh token to the database
    await userRepository.updateRefreshToken(address, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    // Verify the refresh token
    const payload = verifyRefreshToken(token);
    if (!payload) {
      throw new Error("Invalid refresh token");
    }

    const { address } = payload;

    // Check if the refresh token is valid in the database
    const user = await userRepository.findByAddress(address);
    if (!user || user.refreshToken !== token) {
      throw new Error("Invalid refresh token");
    }

    // Generate new tokens
    const accessToken = generateAccessToken(address);
    const refreshToken = generateRefreshToken(address);

    // Save new refresh token to the database
    await userRepository.updateRefreshToken(address, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(address: string) {
    // Remove refresh token from the database
    await userRepository.updateRefreshToken(address, null);
  }
} 