const authService = require("../services/auth/AuthService");
const userRepository = require("../repositories/UserRepository");
const submissionRepository = require("../repositories/SubmissionRepository");
const { asyncHandler } = require("../middleware/errorHandler");
const { setAuthCookies, clearAuthCookies, serializeUser } = require("../utils/cookies");
const { NotFoundError } = require("../errors/AppError");

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

  setAuthCookies(res, { accessToken, refreshToken });

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    token: accessToken,
    user: serializeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { emailId, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(emailId, password);

  setAuthCookies(res, { accessToken, refreshToken });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token: accessToken,
    user: serializeUser(user),
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const { accessToken, user } = await authService.refreshAccessToken(token);

  setAuthCookies(res, { accessToken });

  return res.status(200).json({
    success: true,
    token: accessToken,
    user: serializeUser(user),
  });
});

const logout = asyncHandler(async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    await authService.logoutUser(token);
  }

  clearAuthCookies(res);
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

const adminRegister = asyncHandler(async (req, res) => {
  const { user } = await authService.registerAdmin(req.body);

  // the calling admin stays signed in; do not overwrite their cookies
  return res.status(201).json({
    success: true,
    message: "Admin account created successfully",
    user: serializeUser(user),
  });
});

// current user with populated solved problems (used by the frontend session check)
const checkSession = asyncHandler(async (req, res) => {
  const user = await userRepository.getUserProfileWithStats(req.result._id);
  return res.status(200).json({
    success: true,
    user: serializeUser(user || req.result),
    message: "Valid User",
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.result._id;
  const user = await userRepository.getUserProfileWithStats(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const stats = await submissionRepository.getSubmissionStatsByUser(userId);

  const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
  const solved = Array.isArray(user.problemSolved) ? user.problemSolved : [];
  solved.forEach((problem) => {
    const difficulty = problem && problem.difficulty ? String(problem.difficulty).toLowerCase() : null;
    if (difficulty && difficultyCounts[difficulty] !== undefined) {
      difficultyCounts[difficulty]++;
    }
  });

  return res.status(200).json({
    success: true,
    user: serializeUser(user),
    stats: {
      ...stats,
      totalSolved: solved.length,
      difficultyCounts,
    },
  });
});

const deleteProfile = asyncHandler(async (req, res) => {
  const userId = req.result._id;

  await submissionRepository.deleteByUser(userId);
  await userRepository.deleteById(userId);

  clearAuthCookies(res);

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
  checkSession,
  getProfile,
  deleteProfile,
};
