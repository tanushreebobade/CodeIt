const { execute: executeCode } = require("../execution/executionService");
const submissionRepository = require("../../repositories/SubmissionRepository");
const attemptRepository = require("../../repositories/AttemptRepository");
const problemRepository = require("../../repositories/ProblemRepository");
const userRepository = require("../../repositories/UserRepository");
const leaderboardService = require("../leaderboard/LeaderboardService");
const { EXECUTION_STATUS } = require("../../constants/executionConstants");

// normalises program output so trailing whitespace / CRLF differences don't fail a test
const normalizeOutput = (text) =>
  String(text ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .trim();

// maps an engine result to a verdict; null means the program ran fine
const classifyFailure = (result) => {
  const status = result.status;
  if (status === "compile_error") return EXECUTION_STATUS.COMPILATION_ERROR;
  if (status === "time_limit" || result.statusCode === 408) return EXECUTION_STATUS.TIME_LIMIT_EXCEEDED;
  if (status === "runtime_error") return EXECUTION_STATUS.RUNTIME_ERROR;
  if (status === "engine_error") return EXECUTION_STATUS.RUNTIME_ERROR;

  // engines without a structured status: fall back to output sniffing
  if (!status) {
    const text = `${result.output || ""}\n${result.error || ""}`.toLowerCase();
    if (text.includes("error:") || text.includes("compilation failed") || text.includes("syntaxerror")) {
      return EXECUTION_STATUS.COMPILATION_ERROR;
    }
    if (text.includes("time limit exceeded") || text.includes("execution timed out")) {
      return EXECUTION_STATUS.TIME_LIMIT_EXCEEDED;
    }
    if (
      text.includes("segmentation fault") ||
      text.includes("runtime error") ||
      text.includes("exception") ||
      text.includes("traceback")
    ) {
      return EXECUTION_STATUS.RUNTIME_ERROR;
    }
  }
  return null;
};

const evaluateSubmission = async (code, language, hiddenTestCases, { userId } = {}) => {
  const results = [];

  let passedCount = 0;
  let status = EXECUTION_STATUS.ACCEPTED;
  let errorMessage = "";
  let maxRuntime = 0;
  let maxMemory = 0;

  for (const testCase of hiddenTestCases) {
    const result = await executeCode(code, language, testCase.input || "", { userId });

    const currentRuntime = Number(result.cpuTime) || 0;
    const currentMemory = Number(result.memory) || 0;

    // track peak usage across all test cases
    if (currentRuntime > maxRuntime) maxRuntime = currentRuntime;
    if (currentMemory > maxMemory) maxMemory = currentMemory;

    const output = normalizeOutput(result.output);
    const expectedOutput = normalizeOutput(testCase.output);
    const failure = classifyFailure(result);

    if (failure) {
      status = failure;
      errorMessage = result.error || output || failure;
      results.push({
        input: testCase.input,
        expectedOutput,
        output,
        error: result.error || null,
        passed: false,
      });
      break;
    }

    if (output === expectedOutput) {
      passedCount++;
      results.push({ input: testCase.input, expectedOutput, output, passed: true });
    } else {
      status = EXECUTION_STATUS.WRONG_ANSWER;
      results.push({ input: testCase.input, expectedOutput, output, passed: false });
      break;
    }
  }

  return {
    status,
    errorMessage,
    runtime: maxRuntime,
    memory: maxMemory,
    passedCount,
    results,
  };
};

const processSubmission = async ({ userId, problemId, code, language, hiddenTestCases }) => {
  const evalResult = await evaluateSubmission(code, language, hiddenTestCases, { userId });
  const isAccepted = evalResult.status === EXECUTION_STATUS.ACCEPTED;

  const submission = await submissionRepository.createSubmission({
    userId,
    problemId,
    code,
    language,
    status: evalResult.status,
    runtime: evalResult.runtime,
    memory: evalResult.memory,
    errorMessage: evalResult.errorMessage,
    testCasesPassed: evalResult.passedCount,
    totalTestCases: hiddenTestCases.length,
  });

  // update user attempt and mark solved if accepted
  let attempt = await attemptRepository.decrementSubmitAttempt(userId, problemId);
  if (isAccepted) {
    attempt = await attemptRepository.markSolved(userId, problemId);
    await userRepository.addSolvedProblem(userId, problemId);
    // update redis leaderboard score asynchronously
    leaderboardService.updateUserScore(userId, 1).catch((err) => {
      console.error("Leaderboard score update async error:", err.message);
    });
  }

  // update overall problem submission stats
  await problemRepository.incrementSubmissionCount(problemId, isAccepted);

  return {
    submission,
    evalResult,
    attempt,
  };
};

module.exports = {
  evaluateSubmission,
  processSubmission,
  normalizeOutput,
  classifyFailure,
};
