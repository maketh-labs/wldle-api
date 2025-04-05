import {NextFunction, Request, Response} from "express";
import {verifyAccessToken} from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: {
        address: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({error: "Authorization header required"});
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({error: "Invalid or expired token"});
  }

  req.user = {address: decoded.address};
  next();
};