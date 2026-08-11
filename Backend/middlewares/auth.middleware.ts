import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/users.model";
import type { IUser } from "../models/users.model";

interface JwtPayload {
  userId: string;
  role: string;
  name: string;
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as JwtPayload;
    const user = (await User.findById(decoded.userId).select("-password")) as IUser | null;
    if (!user) {
      res.status(401).json({ message: "Unauthorized User" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
