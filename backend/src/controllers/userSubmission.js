const Problem = require("../models/problem");
const ProblemAttempt = require("../models/problemAttempt");
const Submission = require("../models/submission");
const { executeCode } = require("../utils/problemUtility");
const SubmissionService = require("../services/submission/SubmissionService");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../errors/AppError");
const { asyncHandler } = require("../middleware/errorHandler");

const runCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, language } = req.body;

  if (!code || !language) {
    throw new BadRequestError("Code and language are required");
  }

  const problem = await Problem.findById(id);
  if (!problem) {
    throw new NotFoundError("Problem not found");
  }

  const user = req.result;

  // Find or initialize attempt record
  let attempt = await ProblemAttempt.findOne({
    userId: user._id,
    problemId: id,
  });

  if (!attempt) {
    attempt = await ProblemAttempt.create({
      userId: user._id,
      problemId: id,
      runAttempts: 2,
      submitAttempts: 1,
      solved: false,
    });
  }

  // Check attempt limits
  if (attempt.solved) {
    throw new ForbiddenError("Problem already solved.");
  }

  if (attempt.runAttempts <= 0) {
    throw new ForbiddenError("No run attempts remaining.");
  }

  attempt.runAttempts--;
  await attempt.save();

  // Run visible test cases
  const results = [];

  for (const testCase of problem.visibleTestCases) {
    const result = await executeCode(code, language, testCase.input);
    const formattedOutput = result.output?.trim() || "";

    results.push({
      input: testCase.input,
      expectedOutput: testCase.output,
      output: formattedOutput,
      passed: formattedOutput === testCase.output.trim(),
      error: result.error || null,
    });
  }

  return res.status(200).json({
    success: true,
    runAttemptsLeft: attempt.runAttempts,
    submitAttemptsLeft: attempt.submitAttempts,
    results,
  });
});

const submitCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, language } = req.body;

  if (!code || !language) {
    throw new BadRequestError("Code and language are required");
  }

  const problem = await Problem.findById(id);
  if (!problem) {
    throw new NotFoundError("Problem not found");
  }

  const user = req.result;

  // Find or initialize attempt record
  let attempt = await ProblemAttempt.findOne({
    userId: user._id,
    problemId: id,
  });

  if (!attempt) {
    attempt = await ProblemAttempt.create({
      userId: user._id,
      problemId: id,
      runAttempts: 2,
      submitAttempts: 1,
      solved: false,
    });
  }

  if (attempt.submitAttempts <= 0) {
    throw new ForbiddenError("No submit attempts remaining.");
  }

  attempt.submitAttempts--;

  // Evaluate code against hidden test cases
  const evalResult = await SubmissionService.evaluateSubmission(
    code,
    language,
    problem.hiddenTestCases
  );

  if (evalResult.status === "Accepted") {
    attempt.solved = true;
  }

  await attempt.save();

  // Record submission history
  const submission = await Submission.create({
    userId: user._id,
    problemId: id,
    code,
    language,
    status: evalResult.status,
    runtime: evalResult.runtime,
    memory: evalResult.memory,
    errorMessage: evalResult.errorMessage,
    testCasesPassed: evalResult.passedCount,
    totalTestCases: problem.hiddenTestCases.length,
  });

  return res.status(200).json({
    success: true,
    submission,
    submitAttemptsLeft: attempt.submitAttempts,
    solved: attempt.solved,
  });
});

module.exports = {
  runCode,
  submitCode,
};
