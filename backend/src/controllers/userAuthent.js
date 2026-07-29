const authService = require("../services/auth/AuthService");
const userRepository = require("../repositories/UserRepository");
const submissionRepository = require("../repositories/SubmissionRepository");
const { asyncHandler } = require("../middleware/errorHandler");

// Register user
const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

  res.cookie("token", accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    token: accessToken,
    user: {
      _id: user._id,
      firstName: user.firstName,
      emailId: user.emailId,
      role: user.role,
    },
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { emailId, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(emailId, password);

  res.cookie("token", accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "Login Successfully",
    token: accessToken,
    user: {
      _id: user._id,
      firstName: user.firstName,
      emailId: user.emailId,
      role: user.role,
    },
  });
});

// Refresh Access Token
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const { accessToken } = await authService.refreshAccessToken(token);

  res.cookie("token", accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    token: accessToken,
  });
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    await authService.logoutUser(token);
  }
  // Clear both access token and refresh token cookies
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  return res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});
// Register Admin
const adminRegister = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await authService.registerAdmin(req.body);

  res.cookie("token", accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    message: "User Registered Successfully",
    token: accessToken,
  });
});

// Get user profile & statistics
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.result._id;
  const user = await userRepository.getUserProfileWithStats(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const stats = await submissionRepository.getSubmissionStatsByUser(userId);

  const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
  if (user.problemSolved && Array.isArray(user.problemSolved)) {
    user.problemSolved.forEach((problem) => {
      if (problem.difficulty && difficultyCounts[problem.difficulty] !== undefined) {
        difficultyCounts[problem.difficulty]++;
      }
    });
  }

  return res.status(200).json({
    success: true,
    user,
    stats: {
      ...stats,
      totalSolved: user.problemSolved.length,
      difficultyCounts,
    },
  });
});

// Delete User Profile & Cascade Cleanups
const deleteProfile = asyncHandler(async (req, res) => {
  const userId = req.result._id;

  await userRepository.deleteById(userId);

  const Submission = require("../models/submission");
  await Submission.deleteMany({ userId });

  const SolutionVideo = require("../models/solutionVideo");
  await SolutionVideo.deleteMany({ userId });

  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.cookie("refreshToken", null, { expires: new Date(Date.now()) });

  return res.status(200).json({
    success: true,
    message: "Profile and associated data deleted successfully",
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  adminRegister,
  getProfile,
  deleteProfile,
};
