const { executeCode } = require("../utils/problemUtility");
const Problem = require("../models/problem");

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

    const problem = await Problem.create({
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

const getAllProblem = async (req, res) => {
  try {
    const problems = await Problem.find().select("_id title difficulty tags");

    return res.status(200).json({
      success: true,
      problems,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching problems",
      error: err.message,
    });
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await Problem.findById(id);

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

const updateProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

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

const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProblem = await Problem.findByIdAndDelete(id);

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
