const { executeCode } = require("../utils/problemUtility");
const Problem = require("../models/problem");

//create problems
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
    // Validate all reference solutions
    for (const { language, completeCode } of referenceSolution) {
      // Visible Test Cases
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

      // Hidden Test Cases
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

//getallprb
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
module.exports = {
  createProblem,
  getAllProblem,
};
