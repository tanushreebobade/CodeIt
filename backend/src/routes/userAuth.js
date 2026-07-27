const express = require("express");
const authRouter = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  adminRegister,
  getProfile,
} = require("../controllers/userAuthent");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { authRateLimiter } = require("../middleware/rateLimiter");

authRouter.post("/register", authRateLimiter, register);
authRouter.post("/login", authRateLimiter, login);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", userMiddleware, logout);
authRouter.post("/admin/register", adminMiddleware, adminRegister);

authRouter.get("/profile", userMiddleware, getProfile);

module.exports = authRouter;
