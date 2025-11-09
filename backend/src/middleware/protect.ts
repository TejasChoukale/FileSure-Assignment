import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Not authorized, no token" });
    }

    const secret: string = process.env.JWT_SECRET ?? "dev_secret";
    const decoded: any = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select(
      "_id name email referralCode"
    );

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    (req as any).user = user; // attach user
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
