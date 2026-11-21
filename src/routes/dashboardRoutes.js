
import { Router } from "express";

import {
  protect,
  restrictTo,
} from "../middleware/authMiddleware.js";

import {
  getDashboardSummary,
} from "../controllers/dashboardController.js";

const router = Router();

router.use(protect, restrictTo("admin"));
router.get("/summary", getDashboardSummary);

export default router;
