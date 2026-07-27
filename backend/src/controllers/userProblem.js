const problemService = require("../services/problem/ProblemService");
const { asyncHandler } = require("../middleware/errorHandler");

// Create problem
const createProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.createProblem(req.body, req.result._id);
  return res.status(201).json({
    success: true,
    message: "Problem Created Successfully",
    problem,
  });
});

// Get all problems with pagination, search, and filters
const getAllProblem = asyncHandler(async (req, res) => {
  const { page, limit, difficulty, tags, companyTags, search } = req.query;
  const result = await problemService.getAllProblems({
    page,
    limit,
    difficulty,
    tags,
    companyTags,
    search,
  });

  return res.status(200).json({
    success: true,
    ...result,
  });
});

// Get problem by ID
const getProblemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const problem = await problemService.getProblemById(id);

  return res.status(200).json({
    success: true,
    problem,
  });
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

module.exports = {
  createProblem,
  getAllProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
};
