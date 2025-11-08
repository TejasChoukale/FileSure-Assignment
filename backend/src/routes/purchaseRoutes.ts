import { Router } from "express";
import { createPurchase } from "../controllers/purchaseController";
import { protect } from "../middleware/protect";

const router = Router();
router.post("/", protect, createPurchase); // POST /api/purchase
export default router;
