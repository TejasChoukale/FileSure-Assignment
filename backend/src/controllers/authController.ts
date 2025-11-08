import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User";
import Referral from "../models/Referral";
import { getClientIp } from "../utils/getClientIp";
import { generateReferralCode } from "../utils/generateReferralCode";

/** ---------- JWT TOKEN HELPER ---------- */
function signToken(userId: string) {
  const secret = process.env.JWT_SECRET || "dev_secret"; // fallback for safety
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
}

/** ---------- REGISTER USER ---------- */
export const register = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;
    const referredByQuery = (req.query.r as string) || null; // ?r=CODE

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password required" });
    }

    // Check if user already exists
    const exists = await User.findOne({ email }).session(session);
    if (exists) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password and generate referral code
    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode(String(name || email || "user"));
    const signupIp = getClientIp(req);

    // ✅ Create a new user (strongly typed, no TS undefined issue)
    const newUser = new User({
      name,
      email,
      passwordHash,
      referralCode,
      signupIp,
      referredBy: referredByQuery || null,
    });

    await newUser.save({ session });

    // Handle referral if exists
    if (referredByQuery) {
      const referrer = await User.findOne({ referralCode: referredByQuery }).session(session);
      if (referrer && String(referrer._id) !== String(newUser._id)) {
        await Referral.create(
          [
            {
              referrerId: referrer._id,
              referredId: newUser._id,
              status: "pending",
            },
          ],
          { session }
        ).catch(() => {});

        console.log(`🎁 Referral recorded: ${referrer.name} → ${newUser.name}`);
      } else {
        console.log("⚠️ Invalid or self-referral skipped");
      }
    }

    await session.commitTransaction();

    // ✅ Generate JWT (no undefined risk)
    const token = signToken(newUser._id.toString());

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referralCode,
      },
    });
  } catch (e: any) {
    await session.abortTransaction();
    console.error("Registration error:", e.message);
    if (e?.code === 11000)
      return res.status(409).json({ error: "Duplicate key (email/referralCode)" });
    return res.status(500).json({ error: e?.message || "Server error" });
  } finally {
    session.endSession();
  }
};

/** ---------- LOGIN USER ---------- */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user._id.toString());
  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
    },
  });
};

/** ---------- CURRENT USER INFO ---------- */
export const me = async (req: Request, res: Response) => {
  const u = (req as any).user; // set by protect middleware
  return res.json({
    id: u._id,
    email: u.email,
    referralCode: u.referralCode,
  });
};
