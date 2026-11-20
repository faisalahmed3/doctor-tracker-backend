
import express from "express";
import rateLimit from "express-rate-limit";

import {
  login,
  logout,
  getMe,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validate.js";

import { loginSchema } from "../validators/authValidator.js";

const router = express.Router();

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

// POST /api/v1/auth/login
router.post(
  "/login",
  loginLimiter,
  validateBody(loginSchema),
  login
);

// POST /api/v1/auth/logout
router.post("/logout", logout);

// GET /api/v1/auth/me
router.get("/me", protect, getMe);

export default router;
