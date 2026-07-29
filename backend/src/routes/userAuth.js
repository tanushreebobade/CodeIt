const express = require("express");
const authRouter = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  adminRegister,
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
authRouter.post("/logout", userMiddleware, logout);
authRouter.post("/admin/register", adminMiddleware, validate(registerSchema), adminRegister);

authRouter.get("/profile", userMiddleware, getProfile);
authRouter.delete("/deleteProfile", userMiddleware, deleteProfile);

authRouter.get('/check', userMiddleware, (req, res) => {
  const reply = {
    firstName: req.result.firstName,
    emailId: req.result.emailId,
    _id: req.result._id,
    role: req.result.role,
  };

  res.status(200).json({
    user: reply,
    message: "Valid User"
  });
});

module.exports = authRouter;
