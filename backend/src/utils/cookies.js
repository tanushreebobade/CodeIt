const env = require("../config/env");

// cookie options — cross-domain safe for Render + Vercel in production
const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  maxAge: maxAgeMs,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  path: "/",
});

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  if (accessToken) res.cookie("token", accessToken, getCookieOptions(env.accessTokenMaxAgeMs));
  if (refreshToken) res.cookie("refreshToken", refreshToken, getCookieOptions(env.refreshTokenMaxAgeMs));
};

const clearAuthCookies = (res) => {
  const { maxAge, ...options } = getCookieOptions(0);
  res.clearCookie("token", options);
  res.clearCookie("refreshToken", options);
};

// public view of a user document
const serializeUser = (user) => {
  if (!user) return null;
  const plain = user.toObject ? user.toObject() : { ...user };
  return {
    _id: plain._id,
    firstName: plain.firstName,
    lastName: plain.lastName || "",
    emailId: plain.emailId,
    role: plain.role || "user",
    age: plain.age,
    problemSolved: plain.problemSolved || [],
    createdAt: plain.createdAt,
  };
};

module.exports = { getCookieOptions, setAuthCookies, clearAuthCookies, serializeUser };
