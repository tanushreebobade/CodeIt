const leaderboardService = require("../services/leaderboard/LeaderboardService");
const { asyncHandler } = require("../middleware/errorHandler");

const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const data = await leaderboardService.getGlobalLeaderboard(page, limit);
  return res.status(200).json({
    success: true,
    ...data,
  });
});

const getMyRank = asyncHandler(async (req, res) => {
  const userId = req.result._id;
  const userRank = await leaderboardService.getUserRank(userId);
  return res.status(200).json({
    success: true,
    userId,
    ...userRank,
  });
});

module.exports = {
  getGlobalLeaderboard,
  getMyRank,
};
