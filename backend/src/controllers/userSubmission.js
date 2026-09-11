const problemRepository = require("../repositories/ProblemRepository");
const attemptRepository = require("../repositories/AttemptRepository");
const submissionRepository = require("../repositories/SubmissionRepository");
const { executeCode } = require("../utils/problemUtility");
const { checkAndConsumeUserCredit } = require("../services/execution/CodeExecutionEngine");
const SubmissionService = require("../services/submission/SubmissionService");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../errors/AppError");
const { asyncHandler } = require("../middleware/errorHandler");

// run code against visible test cases for quick feedback
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
  checkAndConsumeUserCredit(user._id);

  const attempt = await attemptRepository.findOrCreateAttempt(user._id, id);

  // Check if free user reached run limit for this problem (Pro/Admin users get unlimited)
  if (user.role !== "pro" && user.role !== "admin" && attempt && attempt.runAttempts <= 0) {
    return res.status(429).json({
      success: false,
      isLimitReached: true,
      message: "Daily free execution limit reached for this problem! Upgrade to Pro for unlimited execution.",
      runAttemptsLeft: 0,
      submitAttemptsLeft: attempt.submitAttempts || 0,
    });
  }

  const updatedAttempt = await attemptRepository.decrementRunAttempt(user._id, id);

  const results = [];
  const testCases = problem.visibleTestCases && problem.visibleTestCases.length > 0
    ? problem.visibleTestCases
    : [{ input: "", output: "" }];

  for (const testCase of testCases) {
    const result = await executeCode(code, language, testCase.input || "");
    const formattedOutput = result.output?.trim() || "";

    results.push({
      input: testCase.input || "",
      expectedOutput: testCase.output || "",
      output: formattedOutput,
      passed: testCase.output ? formattedOutput === testCase.output.trim() : true,
      error: result.error || null,
    });
  }

  return res.status(200).json({
    success: true,
    runAttemptsLeft: user.role === "pro" || user.role === "admin" ? 999 : (updatedAttempt?.runAttempts ?? 0),
    submitAttemptsLeft: user.role === "pro" || user.role === "admin" ? 999 : (updatedAttempt?.submitAttempts ?? 0),
    results,
  });
});

// submit code against hidden test cases
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
  checkAndConsumeUserCredit(user._id);

  const attempt = await attemptRepository.findOrCreateAttempt(user._id, id);

  // Check if free user reached submit limit for this problem (Pro/Admin users get unlimited)
  if (user.role !== "pro" && user.role !== "admin" && attempt && attempt.submitAttempts <= 0) {
    return res.status(429).json({
      success: false,
      isLimitReached: true,
      message: "Free submission limit reached for this problem! Upgrade to Pro for unlimited submissions.",
      runAttemptsLeft: attempt.runAttempts || 0,
      submitAttemptsLeft: 0,
    });
  }

  const hiddenCases = problem.hiddenTestCases && problem.hiddenTestCases.length > 0
    ? problem.hiddenTestCases
    : (problem.visibleTestCases || [{ input: "", output: "" }]);

  const { submission, attempt: updatedAttempt } = await SubmissionService.processSubmission({
    userId: user._id,
    problemId: id,
    code,
    language,
    hiddenTestCases: hiddenCases,
  });

  return res.status(200).json({
    success: true,
    submission,
    runAttemptsLeft: user.role === "pro" || user.role === "admin" ? 999 : (updatedAttempt?.runAttempts ?? 0),
    submitAttemptsLeft: user.role === "pro" || user.role === "admin" ? 999 : (updatedAttempt?.submitAttempts ?? 0),
    solved: updatedAttempt?.solved ?? false,
  });
});

// fetch paginated user submission history
const getUserSubmissions = asyncHandler(async (req, res) => {
  const user = req.result;
  const { problemId, status, page, limit } = req.query;

  const result = await submissionRepository.getUserSubmissionsPaginated(
    user._id,
    { problemId, status, page, limit }
  );

  return res.status(200).json({
    success: true,
    ...result,
  });
});

// Get submission detail by ID
const getSubmissionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.result;

  const submission = await submissionRepository.getSubmissionWithDetails(id, user._id);
  if (!submission) {
    throw new NotFoundError("Submission not found");
  }

  return res.status(200).json({
    success: true,
    submission,
  });
});

module.exports = {
  runCode,
  submitCode,
  getUserSubmissions,
  getSubmissionById,
};
