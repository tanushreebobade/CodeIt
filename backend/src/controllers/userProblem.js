const mongoose = require("mongoose");
const problemService = require("../services/problem/ProblemService");
const problemRepository = require("../repositories/ProblemRepository");
const submissionRepository = require("../repositories/SubmissionRepository");
const userRepository = require("../repositories/UserRepository");
const SolutionVideo = require("../models/solutionVideo");
const { asyncHandler } = require("../middleware/errorHandler");
const { NotFoundError } = require("../errors/AppError");

const isMongoReady = () => mongoose.connection && mongoose.connection.readyState === 1;

// set of problem ids that have a video solution attached
const getVideoProblemIds = async () => {
  if (!isMongoReady()) return new Set();
  try {
    const videos = await SolutionVideo.find({}).select("problemId").lean();
    return new Set(videos.map((v) => String(v.problemId)));
  } catch (err) {
    return new Set();
  }
};

const findVideoForProblem = async (id) => {
  if (!isMongoReady() || !mongoose.Types.ObjectId.isValid(String(id))) return null;
  try {
    return await SolutionVideo.findOne({ problemId: id }).lean();
  } catch (err) {
    return null;
  }
};

// Create problem
const createProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.createProblem(req.body, req.result._id);
  return res.status(201).json({
    success: true,
    message: "Problem saved successfully",
    problem,
  });
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
  const [problems, videoIds] = await Promise.all([
    problemRepository.findAllForCatalog(),
    getVideoProblemIds(),
  ]);

  const list = problems.map((p) => {
    const plain = p.toObject ? p.toObject() : p;
    return {
      _id: plain._id,
      title: plain.title,
      difficulty: plain.difficulty,
      tags: plain.tags || [],
      companyTags: plain.companyTags || [],
      isPremium: Boolean(plain.isPremium),
      acceptedCount: plain.acceptedCount || 0,
      submissionCount: plain.submissionCount || 0,
      hasVideo: videoIds.has(String(plain._id)),
      createdAt: plain.createdAt,
    };
  });

  return res.status(200).json(list);
});

// Get problem by ID (with video solution if available)
const getProblemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const problem = await problemService.getProblemById(id);

  const problemObj = problem.toObject ? problem.toObject() : { ...problem };
  // never leak reference solutions or hidden inputs to non-admin clients
  const isAdmin = req.result && req.result.role === "admin";
  if (!isAdmin) {
    delete problemObj.referenceSolution;
    delete problemObj.hiddenTestCases;
  }

  const video = await findVideoForProblem(id);
  if (video) {
    problemObj.secureUrl = video.secureUrl;
    problemObj.thumbnailUrl = video.thumbnailUrl;
    problemObj.duration = video.duration;
    problemObj.hasVideo = true;
  } else {
    problemObj.hasVideo = false;
  }

  return res.status(200).json(problemObj);
});

// Update problem
const updateProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const problem = await problemService.updateProblem(id, req.body);

  return res.status(200).json({
    success: true,
    message: "Problem updated successfully",
    problem,
  });
});

// Delete problem
const deleteProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await problemService.deleteProblem(id);

  return res.status(200).json({
    success: true,
    message: "Problem deleted successfully",
  });
});

// Solved problems by user
const solvedAllProblembyUser = asyncHandler(async (req, res) => {
  const userId = req.result._id;

  const user = await userRepository.getUserProfileWithStats(userId);
  if (!user) throw new NotFoundError("User not found");

  return res.status(200).json(user.problemSolved || []);
});

// User submission history for a specific problem
const submittedProblem = asyncHandler(async (req, res) => {
  const userId = req.result._id;
  const problemId = req.params.pid;

  const submissions = await submissionRepository.getSubmissionsByUserAndProblem(userId, problemId);

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
