const problemRepository = require("../repositories/ProblemRepository");
const attemptRepository = require("../repositories/AttemptRepository");
const { executeCode } = require("../utils/problemUtility");
const SubmissionService = require("../services/submission/SubmissionService");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../errors/AppError");
const { asyncHandler } = require("../middleware/errorHandler");


//run code
const runCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, language } = req.body;

  if (!code || !language) {
    throw new BadRequestError("Code and language are required");
  }

  const problem = await problemRepository.findProblemById(id);
  if (!problem) {
    throw new NotFoundError("Problem not found");
  }

  const user = req.result;

  const attempt = await attemptRepository.findOrCreateAttempt(user._id, id);

  if (attempt.solved) {
    throw new ForbiddenError("Problem already solved.");
  }

  if (attempt.runAttempts <= 0) {
    throw new ForbiddenError("No run attempts remaining.");
  }

  const updatedAttempt = await attemptRepository.decrementRunAttempt(user._id, id);

  // Execute against visible test cases for quick feedback
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
    runAttemptsLeft: updatedAttempt.runAttempts,
    submitAttemptsLeft: updatedAttempt.submitAttempts,
    results,
  });
});

//submit code
const submitCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, language } = req.body;

  if (!code || !language) {
    throw new BadRequestError("Code and language are required");
  }

  const problem = await problemRepository.findProblemById(id);
  if (!problem) {
    throw new NotFoundError("Problem not found");
  }

  const user = req.result;

  const attempt = await attemptRepository.findOrCreateAttempt(user._id, id);

  if (attempt.submitAttempts <= 0) {
    throw new ForbiddenError("No submit attempts remaining.");
  }

  // Full submission evaluation against hidden test cases
  const { submission, attempt: updatedAttempt } = await SubmissionService.processSubmission({
    userId: user._id,
    problemId: id,
    code,
    language,
    hiddenTestCases: problem.hiddenTestCases,
  });

  return res.status(200).json({
    success: true,
    submission,
    submitAttemptsLeft: updatedAttempt.submitAttempts,
    solved: updatedAttempt.solved,
  });
});

module.exports = {
  runCode,
  submitCode,
};
