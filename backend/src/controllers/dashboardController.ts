import { Request, Response } from "express";
import Referral from "../models/Referral";
import Ledger from "../models/Ledger";
import User from "../models/User";

export const getDashboard = async (req: Request, res: Response) => {
  console.log(" Incoming dashboard request");
  console.log("Headers:", req.headers);
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID" });
    }

    console.log("📊 Dashboard requested by user:", userId);

    const [totalReferred, converted, user, lifetime] = await Promise.all([
      Referral.countDocuments({ referrerId: userId }),
      Referral.countDocuments({ referrerId: userId, status: "converted" }),
      User.findById(userId).select("referralCode credits"),
      Ledger.aggregate([
        { $match: { userId } },
        { $group: { _id: null, sum: { $sum: "$delta" } } },
      ]),
    ]);

    const data = {
      totalReferred,
      convertedUsers: converted,
      totalCreditsBalance: user?.credits || 0,
      totalCreditsEarned: lifetime[0]?.sum || 0,
      referralLink: `${process.env.PUBLIC_APP_URL || "http://localhost:3001"}/register?r=${user?.referralCode}`,
    };

    console.log("✅ Dashboard data:", data);
    res.json(data);
  } catch (err: any) {
    console.error(" Dashboard error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
