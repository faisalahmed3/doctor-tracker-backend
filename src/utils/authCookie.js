
export const AUTH_COOKIE_NAME = "doctor_tracker_token";

const configuredSameSite = (
  process.env.COOKIE_SAME_SITE || "lax"
).toLowerCase();

const sameSite = ["strict", "lax", "none"].includes(
  configuredSameSite
)
  ? configuredSameSite
  : "lax";

const secure =
  process.env.NODE_ENV === "production" ||
  sameSite === "none";

export const authCookieOptions = {
  httpOnly: true,
  secure,
  sameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const clearAuthCookieOptions = {
  httpOnly: true,
  secure,
  sameSite,
  path: "/",
};
