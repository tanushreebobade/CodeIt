const { executeCode } = require("../utils/problemUtility");
const problemRepository = require("../repositories/ProblemRepository");

// Create problem
const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
  } = req.body;

  try {
    // Validate reference solutions against visible and hidden test cases
    for (const { language, completeCode } of referenceSolution) {
      for (const testCase of visibleTestCases) {
        const result = await executeCode(
          completeCode,
          language,
          testCase.input,
        );

        if (result.output?.trim() !== testCase.output.trim()) {
          return res.status(400).json({
            success: false,
            message: "Reference Solution Failed on Visible Test Case",
          });
        }
      }

      for (const testCase of hiddenTestCases) {
        const result = await executeCode(
          completeCode,
          language,
          testCase.input,
        );

        if (result.output?.trim() !== testCase.output.trim()) {
          return res.status(400).json({
            success: false,
            message: "Reference Solution Failed on Hidden Test Case",
          });
        }
      }
    }

    const problem = await problemRepository.create({
      title,
      description,
      difficulty,
      tags,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolution,
      problemCreator: req.result._id,
    });

    return res.status(201).json({
      success: true,
      message: "Problem Created Successfully",
      problem,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Error creating problem",
      error: err.message,
    });
  }
};

// Get all problems with pagination, search, and filters
const getAllProblem = async (req, res) => {
  try {
    const { page, limit, difficulty, tags, search } = req.query;
    const result = await problemRepository.findProblemsWithFilters({
      page,
      limit,
      difficulty,
      tags,
      search,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching problems",
      error: err.message,
    });
  }
};

// Get problem by ID
const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await problemRepository.findProblemById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      problem,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching problem",
      error: err.message,
    });
  }
};

// Update problem
const updateProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedProblem = await problemRepository.updateById(id, req.body);

    if (!updatedProblem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      problem: updatedProblem,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error updating problem",
      error: err.message,
    });
  }
};

// Delete problem
const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProblem = await problemRepository.deleteById(id);

    if (!deletedProblem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error deleting problem",
      error: err.message,
    });
  }
};

module.exports = {
  createProblem,
  getAllProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
};
