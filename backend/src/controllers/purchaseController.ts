import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Referral from "../models/Referral";
import Ledger from "../models/Ledger";
import Purchase from "../models/Purchase";

function getClientIp(req: Request) {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || (req.socket as any)?.remoteAddress
      || null;
}

export const createPurchase = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const buyerId = (req as any).user._id;
    const { amount } = req.body;

    
    const idempotencyKey = String(
      req.get("Idempotency-Key") ||
      req.header("idempotency-key") ||
      (req.headers["idempotency-key"] as string) ||
      req.body?.idempotencyKey ||
      ""
    ).trim();

    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    if (!idempotencyKey) return res.status(400).json({ error: "Idempotency-Key header is required." });

    // Dedup check – USE the correct field name
    const existing = await Purchase.findOne({ idempotencyKey }).session(session);
    if (existing) {
      await session.commitTransaction();
      return res.json({ ok: true, purchase: existing, deduped: true });
    }

    const buyer = await User.findById(buyerId).session(session);
    if (!buyer) throw new Error("Buyer not found");

    const purchaseIp = getClientIp(req);

    // Has a first purchase already happened? – USE correct field name
    const firstPurchaseAlready = await Purchase.findOne({ buyerId, firstPurchase: true }).session(session);
    const isFirstPurchase = !firstPurchaseAlready;

    // Create purchase – USE correct field names
    const [purchase] = await Purchase.create([{
      buyerId,
      amount,
      idempotencyKey,
      firstPurchase: isFirstPurchase,
      purchaseIp,
    }], { session });

    let credited = false;

    if (isFirstPurchase && buyer.referredBy) {
      const referrer = await User.findOne({ referralCode: buyer.referredBy }).session(session);
      const referral = referrer
        ? await Referral.findOne({ referrerId: referrer._id, referredId: buyer._id }).session(session)
        : null;

      // simple fraud flag
      let reasonFlag: string | null = null;
      if (buyer.signupIp && purchaseIp && buyer.signupIp === purchaseIp) {
        const minutesSinceSignup = (Date.now() - new Date(buyer.createdAt!).getTime()) / 60000;
        if (minutesSinceSignup < 2) reasonFlag = "SUSPECT_IP";
      }

      if (referrer && referral && referral.status === "pending") {
        referrer.credits += 2;
        buyer.credits += 2;

        await Ledger.create([
          { userId: referrer._id, delta: +2, reason: "REFERRER_CREDIT", refId: String(purchase._id) },
          { userId: buyer._id,    delta: +2, reason: "REFERRED_CREDIT", refId: String(purchase._id) },
        ], { session });

        referral.status = reasonFlag ? "blocked" : "converted";
        if (reasonFlag) referral.reasonFlag = reasonFlag;

        await Promise.all([
          referrer.save({ session }),
          buyer.save({ session }),
          referral.save({ session }),
        ]);

        credited = !reasonFlag;
      }
    }

    await session.commitTransaction();
    return res.json({ ok: true, purchase, credited, firstPurchase: isFirstPurchase });

  } catch (err: any) {
    await session.abortTransaction();
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  } finally {
    session.endSession();
  }
};
