const { executeCode } = require("../execution/executionService");

const evaluateSubmission = async (code, language, hiddenTestCases) => {
  const results = [];

  let passedCount = 0;
  let status = "Accepted";
  let errorMessage = "";
  let runtime = 0;
  let memory = 0;

  for (const testCase of hiddenTestCases) {
    const result = await executeCode(code, language, testCase.input);

    runtime = Number(result.cpuTime) || 0;
    memory = Number(result.memory) || 0;

    const output = result.output?.trim() || "";
    const lowerOutput = output.toLowerCase();

    // Check for compilation errors
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

    // Check for runtime exceptions
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

    // Check for execution timeouts
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

    // Match exact expected output
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
    runtime,
    memory,
    passedCount,
    results,
  };
};

module.exports = {
  evaluateSubmission,
};