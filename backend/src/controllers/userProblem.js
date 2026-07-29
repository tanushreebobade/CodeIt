const problemService = require("../services/problem/ProblemService");
const SolutionVideo = require("../models/solutionVideo");
const User = require("../models/user");
const Submission = require("../models/submission");
const { asyncHandler } = require("../middleware/errorHandler");

// Create problem
const createProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.createProblem(req.body, req.result._id);
  return res.status(201).send("Problem Saved Successfully");
});

// Get all problems
const getAllProblem = asyncHandler(async (req, res) => {
  const { page, limit, difficulty, tags, companyTags, search } = req.query;

  // If query parameters are passed, use paginated service
  if (page || limit || difficulty || tags || companyTags || search) {
    const result = await problemService.getAllProblems({
      page,
      limit,
      difficulty,
      tags,
      companyTags,
      search,
    });
    return res.status(200).json(result);
  }

  // Default: return raw array of problems for frontend catalog compatibility
  const Problem = require("../models/problem");
  const problems = await Problem.find({}).select('_id title difficulty tags');
  return res.status(200).json(problems);
});

// Get problem by ID (with video solution if available)
const getProblemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const problem = await problemService.getProblemById(id);

  if (!problem) {
    return res.status(404).json({ error: "Problem not found" });
  }

  const video = await SolutionVideo.findOne({ problemId: id });
  const problemObj = problem.toObject ? problem.toObject() : problem;

  if (video) {
    return res.status(200).json({
      ...problemObj,
      secureUrl: video.secureUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
    });
  }

  return res.status(200).json(problemObj);
});

// Update problem
const updateProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const problem = await problemService.updateProblem(id, req.body);

  return res.status(200).json(problem);
});

// Delete problem
const deleteProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await problemService.deleteProblem(id);

  return res.status(200).send("Successfully Deleted");
});

// Solved problems by user
const solvedAllProblembyUser = asyncHandler(async (req, res) => {
  const userId = req.result._id;

  const user = await User.findById(userId).populate({
    path: "problemSolved",
    select: "_id title difficulty tags",
  });

  return res.status(200).json(user?.problemSolved || []);
});

// User submission history for a specific problem
const submittedProblem = asyncHandler(async (req, res) => {
  const userId = req.result._id;
  const problemId = req.params.pid;

  const submissions = await Submission.find({ userId, problemId }).sort({ createdAt: -1 });

  return res.status(200).json(submissions || []);
});

module.exports = {
  createProblem,
  getAllProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
  solvedAllProblembyUser,
  submittedProblem,
};
