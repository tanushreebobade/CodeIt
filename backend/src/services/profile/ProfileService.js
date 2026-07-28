const userRepository = require("../../repositories/UserRepository");
const submissionRepository = require("../../repositories/SubmissionRepository");
const { NotFoundError } = require("../../errors/AppError");

class ProfileService {
  // Fetch sanitized user profile details
  async getUserProfile(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User profile not found");
    }

    const { password, refreshToken, ...userProfile } = user.toObject ? user.toObject() : user;
    return userProfile;
  }

  // Aggregate user solved counts by difficulty and calculate acceptance rate
  async getUserStats(userId) {
    const user = await userRepository.getUserProfileWithStats(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const submissionStats = await submissionRepository.getSubmissionStatsByUser(userId);

    // Count solved problems per difficulty level
    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    if (user.problemSolved && Array.isArray(user.problemSolved)) {
      user.problemSolved.forEach((problem) => {
        if (problem.difficulty && difficultyCounts[problem.difficulty] !== undefined) {
          difficultyCounts[problem.difficulty]++;
        }
      });
    }

    const totalSolved = user.problemSolved ? user.problemSolved.length : 0;
    const totalSubmissions = submissionStats.totalSubmissions || 0;
    const acceptedSubmissions = submissionStats.acceptedSubmissions || 0;
    const acceptanceRate =
      totalSubmissions > 0
        ? parseFloat(((acceptedSubmissions / totalSubmissions) * 100).toFixed(2))
        : 0;

    return {
      userId,
      totalSolved,
      difficultyCounts,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate,
      recentSubmissions: submissionStats.recentSubmissions || [],
    };
  }

  // Sanitize and apply user profile updates
  async updateProfile(userId, updateData) {
    const allowedFields = ["firstName", "lastName", "age"];
    const filteredUpdate = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdate[key] = updateData[key];
      }
    });

    const updatedUser = await userRepository.updateById(userId, filteredUpdate);
    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    const { password, refreshToken, ...userProfile } = updatedUser.toObject
      ? updatedUser.toObject()
      : updatedUser;
    return userProfile;
  }
}

module.exports = new ProfileService();
