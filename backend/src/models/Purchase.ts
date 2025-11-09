// models/Purchase.ts
import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      min: 0,
      required: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    firstPurchase: {          
      type: Boolean,
      default: false,
    },
    purchaseIp: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ helpful index: who already had a firstPurchase
purchaseSchema.index(
  { buyerId: 1, firstPurchase: 1 },     // ✅ camelCase here too
  { unique: true, partialFilterExpression: { firstPurchase: true } }
);

export default mongoose.model("Purchase", purchaseSchema);
