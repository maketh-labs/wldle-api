import {MiniAppWalletAuthSuccessPayload, verifySiweMessage} from '@worldcoin/minikit-js';
import {userRepository} from "../repositories";
import {generateAccessToken, generateRefreshToken, verifyRefreshToken} from "../utils/auth";

export class AuthService {
  async authenticate(payload: MiniAppWalletAuthSuccessPayload, nonce: string) {
    try {
      const validMessage = await verifySiweMessage(payload, nonce)
      if (!validMessage.isValid) {
        throw new Error("Invalid signature");
      }

      const address = validMessage.siweMessageData.address as `0x${string}`

      if (!address) {
        throw new Error("signature should be from a valid address");
      }

      const user = await userRepository.findOrCreate(address);

      const accessToken = generateAccessToken(address);
      const refreshToken = generateRefreshToken(address);

      await userRepository.updateRefreshToken(address, refreshToken);

      return {accessToken, refreshToken};
    } catch (error) {
      throw new Error("Invalid signature");
    }
  }

  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);
    if (!payload) {
      throw new Error("Invalid refresh token");
    }

    const {address} = payload;

    const user = await userRepository.findByAddress(address);
    if (!user || user.refreshToken !== token) {
      throw new Error("Invalid refresh token");
    }

    const accessToken = generateAccessToken(address);
    const refreshToken = generateRefreshToken(address);

    await userRepository.updateRefreshToken(address, refreshToken);

    return {accessToken, refreshToken};
  }

  async logout(address: string) {
    await userRepository.updateRefreshToken(address, null);
  }
} 