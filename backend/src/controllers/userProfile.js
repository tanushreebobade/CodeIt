const profileService = require("../services/profile/ProfileService");
const { asyncHandler } = require("../middleware/errorHandler");

const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.result._id;
  const profile = await profileService.getUserProfile(userId);
  return res.status(200).json({
    success: true,
    user: profile,
  });
});

const getMyStats = asyncHandler(async (req, res) => {
  const userId = req.result._id;
  const stats = await profileService.getUserStats(userId);
  return res.status(200).json({
    success: true,
    stats,
  });
});

const getUserStatsById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const stats = await profileService.getUserStats(userId);
  return res.status(200).json({
    success: true,
    stats,
  });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.result._id;
  const updatedUser = await profileService.updateProfile(userId, req.body);
  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

module.exports = {
  getMyProfile,
  getMyStats,
  getUserStatsById,
  updateMyProfile,
};
