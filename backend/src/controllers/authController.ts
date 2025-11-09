import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User";
import Referral from "../models/Referral";
import { getClientIp } from "../utils/getClientIp";
import { generateReferralCode } from "../utils/generateReferralCode";

/** ---------- JWT TOKEN HELPER (no null) ---------- */
function signToken(userId: string) {
  const secret: string = process.env.JWT_SECRET ?? "dev_secret";
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
}

/** ---------- REGISTER USER ---------- */
export const register = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = req.body as { name?: string; email?: string; password?: string };

    // normalize referral code from query (?r=CODE)
    const referredByQueryRaw = req.query?.r;
    const referredByQuery: string | null =
      typeof referredByQueryRaw === "string" && referredByQueryRaw.length > 0
        ? referredByQueryRaw
        : null;

    if (!body?.name || !body?.email || !body?.password) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Name, email, and password required" });
    }

    // explicit narrow to satisfy TS strict
    const name = String(body.name);
    const email = String(body.email);
    const password = String(body.password);

    // check if user already exists
    const exists = await User.findOne({ email }).session(session);
    if (exists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ error: "Email already registered" });
    }

    // hash password and generate referral code
    const passwordHash: string = await bcrypt.hash(password, 10);
    const referralCode: string = generateReferralCode(name || email || "user");

    // normalize IP to string|null
    const signupIp: string | null = getClientIp(req) ?? null;

    // Build create doc
    const createDoc: {
      name: string;
      email: string;
      passwordHash: string;
      referralCode: string;
      signupIp: string | null;
      referredBy?: string;
    } = {
      name,
      email,
      passwordHash,
      referralCode,
      signupIp,
    };
    
    if (referredByQuery) {
      createDoc.referredBy = referredByQuery;
    }

    // ✅ Create user with insertMany instead of create with array
    const userDocs = await User.insertMany([createDoc], { session, ordered: true });

    // Handle referral if exists
    if (referredByQuery) {
      const referrer = await User.findOne({ referralCode: referredByQuery }).session(session);
      if (referrer && String(referrer._id) !== String(userDocs[0]._id)) {
        // ✅ Use insertMany for referral too
        await Referral.insertMany(
          [{
            referrerId: referrer._id,
            referredId: userDocs[0]._id,
            status: "pending"
          }],
          { session, ordered: true }
        ).catch((err) => {
          console.error("Referral creation error:", err);
        });
        console.log(`🎁 Referral recorded: ${referrer.name} → ${userDocs[0].name}`);
      } else {
        console.log("⚠️ Invalid or self-referral skipped");
      }
    }

    await session.commitTransaction();
    session.endSession();

    // generate JWT
    const token = signToken(String(userDocs[0]._id));

    return res.status(201).json({
      token,
      user: {
        id: userDocs[0]._id,
        name: userDocs[0].name,
        email: userDocs[0].email,
        referralCode: userDocs[0].referralCode,
      },
    });
  } catch (e: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Registration error:", e?.message || e);
    if (e?.code === 11000) {
      return res.status(409).json({ error: "Duplicate key (email/referralCode)" });
    }
    return res.status(500).json({ error: e?.message || "Server error" });
  }
};

/** ---------- LOGIN USER ---------- */
export const login = async (req: Request, res: Response) => {
  try {
    const body = req.body as { email?: string; password?: string };

    if (!body?.email || !body?.password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // explicit narrow for TS
    const email = String(body.email);
    const password = String(body.password);

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(String(user._id));
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
      },
    });
  } catch (e: any) {
    console.error("Login error:", e?.message || e);
    return res.status(500).json({ error: "Server error" });
  }
};

/** ---------- CURRENT USER INFO ---------- */
export const me = async (req: Request, res: Response) => {
  try {
    const u = (req as any).user; // set by protect middleware
    return res.json({
      id: String(u._id),
      name: u.name,
      email: u.email,
      referralCode: u.referralCode,
    });
  } catch (e: any) {
    console.error("Me error:", e?.message || e);
    return res.status(500).json({ error: "Server error" });
  }
};