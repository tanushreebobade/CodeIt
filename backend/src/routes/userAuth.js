const express = require("express");
const authRouter = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  adminRegister,
  checkSession,
  getProfile,
  deleteProfile,
} = require("../controllers/userAuthent");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { authRateLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validateMiddleware");
const { registerSchema, loginSchema } = require("../validators/authValidator");

authRouter.post("/register", authRateLimiter, validate(registerSchema), register);
authRouter.post("/login", authRateLimiter, validate(loginSchema), login);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);
authRouter.post("/admin/register", adminMiddleware, validate(registerSchema), adminRegister);

authRouter.get("/check", userMiddleware, checkSession);
authRouter.get("/profile", userMiddleware, getProfile);
authRouter.delete("/deleteProfile", userMiddleware, deleteProfile);

module.exports = authRouter;
