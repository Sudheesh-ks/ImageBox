import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../constants/status.constants";
import User from "../models/userModel";
import { verifyAccessToken } from "../utils/jwt.util";

const authMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: "Missing or malformed token" });
      }

      const token = authHeader.split(" ")[1];

      const decoded = verifyAccessToken(token);

      const user = await User.findById(decoded.id);
      if (!user) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: "User not found" });
      }

      (req as any).userId = user._id;
      next();
    } catch (error: any) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Invalid or expired token" });
    }
  };
};

export default authMiddleware;
