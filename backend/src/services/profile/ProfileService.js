const userRepository = require("../../repositories/UserRepository");
const submissionRepository = require("../../repositories/SubmissionRepository");
const { NotFoundError, BadRequestError } = require("../../errors/AppError");

class ProfileService {
  async getUserProfile(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User profile not found");
    }

    const { password, refreshToken, problemAttempts, ...userProfile } = user.toObject ? user.toObject() : user;
    return userProfile;
  }

  async getUserStats(userId) {
    const user = await userRepository.getUserProfileWithStats(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const submissionStats = await submissionRepository.getSubmissionStatsByUser(userId);

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

  async updateProfile(userId, updateData) {
    const allowedFields = ["firstName", "lastName", "age"];
    const filteredUpdate = {};

    Object.keys(updateData || {}).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdate[key] = updateData[key];
      }
    });

    if (typeof filteredUpdate.firstName === "string") {
      filteredUpdate.firstName = filteredUpdate.firstName.trim();
      if (filteredUpdate.firstName.length < 2 || filteredUpdate.firstName.length > 50) {
        throw new BadRequestError("First name must be between 2 and 50 characters");
      }
    }
    if (typeof filteredUpdate.lastName === "string") {
      filteredUpdate.lastName = filteredUpdate.lastName.trim().slice(0, 50);
    }
    if (filteredUpdate.age !== undefined && filteredUpdate.age !== null && filteredUpdate.age !== "") {
      const age = Number(filteredUpdate.age);
      if (!Number.isInteger(age) || age < 6 || age > 120) {
        throw new BadRequestError("Age must be a whole number between 6 and 120");
      }
      filteredUpdate.age = age;
    } else {
      delete filteredUpdate.age;
    }
    if (Object.keys(filteredUpdate).length === 0) {
      throw new BadRequestError("Nothing to update");
    }

    const updatedUser = await userRepository.updateById(userId, filteredUpdate);
    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    const { password, refreshToken, problemAttempts, ...userProfile } = updatedUser.toObject
      ? updatedUser.toObject()
      : updatedUser;
    return userProfile;
  }
}

module.exports = new ProfileService();
