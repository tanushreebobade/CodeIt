const express = require("express");
const profileRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const {
  getMyProfile,
  getMyStats,
  getUserStatsById,
  updateMyProfile,
} = require("../controllers/userProfile");

profileRouter.get("/me", userMiddleware, getMyProfile);
profileRouter.get("/stats", userMiddleware, getMyStats);
profileRouter.get("/stats/:userId", getUserStatsById);
profileRouter.put("/update", userMiddleware, updateMyProfile);

module.exports = profileRouter;
