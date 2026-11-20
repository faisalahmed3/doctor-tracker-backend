
import { loginUser } from "../services/authService.js";

import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  clearAuthCookieOptions,
} from "../utils/authCookie.js";

// Login
export const login = async (req, res) => {
  const { token, user } = await loginUser(req.body);

  res.cookie(
    AUTH_COOKIE_NAME,
    token,
    authCookieOptions
  );

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      user,
    },
  });
};

// Logout
export const logout = (req, res) => {
  res.clearCookie(
    AUTH_COOKIE_NAME,
    clearAuthCookieOptions
  );

  res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
};

// Get logged-in user
export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};
