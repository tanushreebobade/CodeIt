const express = require("express");
const leaderboardRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { getGlobalLeaderboard, getMyRank } = require("../controllers/leaderboard");

leaderboardRouter.get("/global", getGlobalLeaderboard);
leaderboardRouter.get("/me", userMiddleware, getMyRank);

module.exports = leaderboardRouter;
