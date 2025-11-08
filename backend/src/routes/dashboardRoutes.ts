import { Router } from "express";
import { protect } from "../middleware/protect";
import { getDashboard } from "../controllers/dashboardController";

const router = Router();
router.get("/", protect, getDashboard);
export default router;
