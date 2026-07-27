const { execute: executeCode } = require("../execution/executionService");
const submissionRepository = require("../../repositories/SubmissionRepository");
const attemptRepository = require("../../repositories/AttemptRepository");
const problemRepository = require("../../repositories/ProblemRepository");
const userRepository = require("../../repositories/UserRepository");

const evaluateSubmission = async (code, language, hiddenTestCases) => {
  const results = [];

  let passedCount = 0;
  let status = "Accepted";
  let errorMessage = "";
  let maxRuntime = 0;
  let maxMemory = 0;

  for (const testCase of hiddenTestCases) {
    const result = await executeCode(code, language, testCase.input);

    const currentRuntime = Number(result.cpuTime) || 0;
    const currentMemory = Number(result.memory) || 0;

    // Track peak usage across all test cases
    if (currentRuntime > maxRuntime) maxRuntime = currentRuntime;
    if (currentMemory > maxMemory) maxMemory = currentMemory;

    const output = result.output?.trim() || "";
    const lowerOutput = output.toLowerCase();

    // Check compilation errors
    if (
      lowerOutput.includes("error:") ||
      lowerOutput.includes("compilation failed") ||
      lowerOutput.includes("syntaxerror")
    ) {
      status = "Compilation Error";
      errorMessage = output;

      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        output,
        passed: false,
      });

      break;
    }

    // Check runtime exceptions
    if (
      output.includes("Segmentation fault") ||
      output.includes("Runtime Error") ||
      output.includes("Exception") ||
      output.includes("Traceback") ||
      output.includes("Floating point exception")
    ) {
      status = "Runtime Error";
      errorMessage = output;

      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        output,
        passed: false,
      });

      break;
    }

    // Check execution timeouts
    if (
      result.statusCode === 408 ||
      output.includes("Time Limit Exceeded") ||
      output.includes("Execution Timed Out")
    ) {
      status = "Time Limit Exceeded";
      errorMessage = output;

      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        output,
        passed: false,
      });

      break;
    }

    const expectedOutput = testCase.output.trim();

    if (output === expectedOutput) {
      passedCount++;

      results.push({
        input: testCase.input,
        expectedOutput,
        output,
        passed: true,
      });
    } else {
      status = "Wrong Answer";

      results.push({
        input: testCase.input,
        expectedOutput,
        output,
        passed: false,
      });

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
  const evalResult = await evaluateSubmission(code, language, hiddenTestCases);
  const isAccepted = evalResult.status === "Accepted";

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

  // Update user attempt and mark solved if accepted
  let attempt = await attemptRepository.decrementSubmitAttempt(userId, problemId);
  if (isAccepted) {
    attempt = await attemptRepository.markSolved(userId, problemId);
    await userRepository.addSolvedProblem(userId, problemId);
  }

  // Update overall problem submission stats
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
};