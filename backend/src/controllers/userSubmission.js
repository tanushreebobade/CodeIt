const env = require("../config/env");
const problemRepository = require("../repositories/ProblemRepository");
const attemptRepository = require("../repositories/AttemptRepository");
const submissionRepository = require("../repositories/SubmissionRepository");
const { executeCode } = require("../utils/problemUtility");
const executionService = require("../services/execution/executionService");
const SubmissionService = require("../services/submission/SubmissionService");
const { BadRequestError, NotFoundError } = require("../errors/AppError");
const { asyncHandler } = require("../middleware/errorHandler");

const MAX_CODE_LENGTH = 100 * 1000;
const MAX_INPUT_LENGTH = 20 * 1000;

const isUnlimitedUser = (user) => user.role === "pro" || user.role === "admin";

const attemptsPayload = (user, attempt) => ({
  runAttemptsLeft: isUnlimitedUser(user) ? null : (attempt?.runAttempts ?? env.freeRunAttempts),
  submitAttemptsLeft: isUnlimitedUser(user) ? null : (attempt?.submitAttempts ?? env.freeSubmitAttempts),
  runAttemptsTotal: env.freeRunAttempts,
  submitAttemptsTotal: env.freeSubmitAttempts,
  unlimited: isUnlimitedUser(user),
});

const validateCodePayload = ({ code, language }) => {
  if (!code || !language) {
    throw new BadRequestError("Code and language are required");
  }
  if (typeof code !== "string" || code.length > MAX_CODE_LENGTH) {
    throw new BadRequestError("Code is too long (max 100KB)");
  }
  if (!executionService.isLanguageSupported(language)) {
    throw new BadRequestError(
      `Language "${language}" is not supported on this server. Available: ${executionService.availableLanguages().join(", ") || "none"}`
    );
  }
};

// run code against visible test cases (or a custom input) for quick feedback
const runCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, language, customInput } = req.body;

  validateCodePayload({ code, language });

  const problem = await problemRepository.findProblemById(id);
  if (!problem) {
    throw new NotFoundError("Problem not found");
  }

  const user = req.result;
  const attempt = await attemptRepository.findOrCreateAttempt(user._id, id);

  // free users get a limited number of runs per problem
  if (!isUnlimitedUser(user) && attempt && attempt.runAttempts <= 0) {
    return res.status(429).json({
      success: false,
      isLimitReached: true,
      message: "Free run limit reached for this problem. Upgrade to Pro for unlimited execution.",
      ...attemptsPayload(user, attempt),
    });
  }

  const updatedAttempt = await attemptRepository.decrementRunAttempt(user._id, id);

  const useCustomInput = typeof customInput === "string" && customInput.trim() !== "";
  if (useCustomInput && customInput.length > MAX_INPUT_LENGTH) {
    throw new BadRequestError("Custom input is too long (max 20KB)");
  }

  const testCases = useCustomInput
    ? [{ input: customInput, output: null }]
    : problem.visibleTestCases && problem.visibleTestCases.length > 0
      ? problem.visibleTestCases
      : [{ input: "", output: null }];

  const results = [];
  let overallStatus = "Accepted";

  for (const testCase of testCases) {
    const result = await executeCode(code, language, testCase.input || "", { userId: user._id });
    const output = SubmissionService.normalizeOutput(result.output);
    const failure = SubmissionService.classifyFailure(result);
    const hasExpected = testCase.output !== null && testCase.output !== undefined;
    const expected = hasExpected ? SubmissionService.normalizeOutput(testCase.output) : null;
    const passed = !failure && (hasExpected ? output === expected : true);

    if (failure) overallStatus = failure;
    else if (!passed && overallStatus === "Accepted") overallStatus = "Wrong Answer";

    results.push({
      input: testCase.input || "",
      expectedOutput: expected,
      output,
      passed,
      status: failure || (passed ? "Passed" : "Wrong Answer"),
      error: result.error || null,
      runtime: Number(result.cpuTime) || 0,
      memory: Number(result.memory) || 0,
    });

    // no point running further cases after a compile error
    if (failure === "Compilation Error") break;
  }

  return res.status(200).json({
    success: true,
    mode: useCustomInput ? "custom" : "samples",
    status: overallStatus,
    ...attemptsPayload(user, updatedAttempt),
    results,
  });
});

// submit code against hidden test cases
const submitCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, language } = req.body;

  validateCodePayload({ code, language });

  const problem = await problemRepository.findProblemById(id);
  if (!problem) {
    throw new NotFoundError("Problem not found");
  }

  const user = req.result;
  const attempt = await attemptRepository.findOrCreateAttempt(user._id, id);

  if (!isUnlimitedUser(user) && attempt && attempt.submitAttempts <= 0) {
    return res.status(429).json({
      success: false,
      isLimitReached: true,
      message: "Free submission limit reached for this problem. Upgrade to Pro for unlimited submissions.",
      ...attemptsPayload(user, attempt),
    });
  }

  const hiddenCases = [
    ...(problem.visibleTestCases || []),
    ...(problem.hiddenTestCases || []),
  ].filter((tc) => tc && tc.output !== undefined && tc.output !== null);

  if (hiddenCases.length === 0) {
    throw new BadRequestError("This problem has no test cases configured yet.");
  }

  const { submission, attempt: updatedAttempt, evalResult } = await SubmissionService.processSubmission({
    userId: user._id,
    problemId: id,
    code,
    language,
    hiddenTestCases: hiddenCases,
  });

  const submissionObj = submission && submission.toObject ? submission.toObject() : submission;

  return res.status(200).json({
    success: true,
    submission: {
      ...submissionObj,
      // only expose the failing case details, never all hidden inputs
      failedCase: evalResult.status === "Accepted" ? null : evalResult.results[evalResult.results.length - 1] || null,
    },
    ...attemptsPayload(user, updatedAttempt),
    solved: updatedAttempt?.solved ?? evalResult.status === "Accepted",
  });
});

// remaining attempts for the current user on a problem
const getAttemptStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.result;
  const attempt = await attemptRepository.findOrCreateAttempt(user._id, id);
  return res.status(200).json({
    success: true,
    solved: attempt?.solved ?? false,
    ...attemptsPayload(user, attempt),
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

// languages the execution engine can currently run
const getSupportedLanguages = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    languages: executionService.availableLanguages(),
  });
});

module.exports = {
  runCode,
  submitCode,
  getAttemptStatus,
  getUserSubmissions,
  getSubmissionById,
  getSupportedLanguages,
};
