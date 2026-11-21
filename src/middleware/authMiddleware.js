
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { AUTH_COOKIE_NAME } from "../utils/authCookie.js";

export const protect = async (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    throw new AppError(
      "You are not authenticated. Please log in.",
      401
    );
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(
      "Your session is invalid or expired. Please log in again.",
      401
    );
  }

  if (!decoded?.sub) {
    throw new AppError("Invalid authentication token.", 401);
  }

  const user = await User.findById(decoded.sub)
    .select("name email role isActive");

  if (!user || !user.isActive) {
    throw new AppError(
      "Your account is unavailable. Please log in again.",
      401
    );
  }

  req.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  next();
};

export const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new AppError(
      "You do not have permission to perform this action.",
      403
    );
  }

  next();
};
