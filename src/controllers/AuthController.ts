import {Request, Response} from "express";
import {authService} from "../services";

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const {payload, nonce} = req.body;

      if (!payload || !nonce) {
        return res.status(400).json({error: "Payload and nonce are required"});
      }

      const {accessToken, refreshToken} = await authService.authenticate(payload, nonce);

      return res.status(200).json({accessToken, refreshToken});
    } catch (error: any) {
      console.error("Login error:", error);
      return res.status(401).json({error: error.message || "Authentication failed"});
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const {refreshToken} = req.body;

      if (!refreshToken) {
        return res.status(400).json({error: "Refresh token is required"});
      }

      const tokens = await authService.refreshToken(refreshToken);

      return res.status(200).json(tokens);
    } catch (error: any) {
      console.error("Refresh token error:", error);
      return res.status(401).json({error: error.message || "Token refresh failed"});
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const address = req.user?.address;

      if (!address) {
        return res.status(401).json({error: "User not authenticated"});
      }

      await authService.logout(address);

      return res.status(200).json({message: "Logged out successfully"});
    } catch (error: any) {
      console.error("Logout error:", error);
      return res.status(500).json({error: error.message || "Logout failed"});
    }
  }
} 