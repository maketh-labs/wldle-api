import { Request, Response } from "express";
import { authService } from "../services";
import { verifyAccessToken } from "../utils/auth";

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { address, signature } = req.body;

      if (!address || !signature) {
        return res.status(400).json({ error: "Address and signature are required" });
      }

      const { accessToken, refreshToken } = await authService.authenticate(address, signature);

      return res.status(200).json({ accessToken, refreshToken });
    } catch (error: any) {
      console.error("Login error:", error);
      return res.status(401).json({ error: error.message || "Authentication failed" });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token is required" });
      }

      const tokens = await authService.refreshToken(refreshToken);

      return res.status(200).json(tokens);
    } catch (error: any) {
      console.error("Refresh token error:", error);
      return res.status(401).json({ error: error.message || "Token refresh failed" });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Authorization header is required" });
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);

      if (!decoded) {
        return res.status(401).json({ error: "Invalid token" });
      }

      await authService.logout(decoded.address);

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error: any) {
      console.error("Logout error:", error);
      return res.status(500).json({ error: error.message || "Logout failed" });
    }
  }
} 