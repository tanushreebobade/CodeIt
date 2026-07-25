const Problem = require("../models/problem");
const ProblemAttempt = require("../models/problemAttempt");
const { executeCode } = require("../utils/problemUtility");
const Submission = require("../models/submission");

//run code
const runCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required",
      });
    }

    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const user = req.result;

    // Find users attempt record
    let attempt = await ProblemAttempt.findOne({
      userId: user._id,
      problemId: id,
    });

    // First time opening this problem
    if (!attempt) {
      attempt = await ProblemAttempt.create({
        userId: user._id,
        problemId: id,
        runAttempts: 2,
        submitAttempts: 1,
        solved: false,
      });
    }

    // Problem already solved
    if (attempt.solved) {
      return res.status(403).json({
        success: false,
        message: "Problem already solved.",
      });
    }

    // Run attempts finished
    if (attempt.runAttempts <= 0) {
      return res.status(403).json({
        success: false,
        message: "No run attempts remaining.",
      });
    }

    // Decrease run attempts
    attempt.runAttempts--;
    await attempt.save();

    // Execute visible test cases
    const results = [];

    for (const testCase of problem.visibleTestCases) {
      const result = await executeCode(code, language, testCase.input);
      //debugging
      console.log(JSON.stringify(result, null, 2));

      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        output: result.output?.trim() || "",
        passed: result.output?.trim() === testCase.output.trim(),
        error: result.error || null,
      });
    }

    return res.status(200).json({
      success: true,
      runAttemptsLeft: attempt.runAttempts,
      submitAttemptsLeft: attempt.submitAttempts,
      results,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error running code",
      error: err.message,
    });
  }
};

//submit code
const submitCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required",
      });
    }

    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const user = req.result;

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

    if (attempt.solved) {
      return res.status(403).json({
        success: false,
        message: "Problem already solved.",
      });
    }

    if (attempt.submitAttempts <= 0) {
      return res.status(403).json({
        success: false,
        message: "No submission attempts remaining.",
      });
    }

    // Hidden Test Cases Execute
    const results = [];

    let passedCount = 0;

    let status = "Accepted";
    let errorMessage = "";
    let runtime = 0;
    let memory = 0;

    for (const testCase of problem.hiddenTestCases) {
      const result = await executeCode(code, language, testCase.input);

      console.log("JDoodle Response:");
      console.log(JSON.stringify(result, null, 2));

      runtime = Number(result.cpuTime) || 0;
      memory = Number(result.memory) || 0;
      const output = result.output?.trim() || "";
      const lowerOutput = output.toLowerCase();

      // Compilation Error
      //temp
      console.log("OUTPUT:", output);
      console.log("LOWER:", lowerOutput);
      console.log("Contains error:", lowerOutput.includes("error:"));
      //
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
      // Runtime Error
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

      // Time Limit Exceeded
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

      // Wrong Answer / Accepted
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

    // Decrease submit attempts
    attempt.submitAttempts--;

    // Accepted
    if (status === "Accepted") {
      attempt.solved = true;

      const alreadySolved = user.problemSolved.some(
        (id) => id.toString() === problem._id.toString(),
      );

      if (!alreadySolved) {
        user.problemSolved.push(problem._id);
      }

      problem.acceptedCount++;
    }

    // Every submission
    problem.submissionCount++;

    await attempt.save();
    await user.save();
    await problem.save();

    // Save Submission
    const submission = await Submission.create({
      userId: user._id,
      problemId: problem._id,
      code,
      language,
      status,
      runtime,
      memory,
      errorMessage,
      testCasesPassed: passedCount,
      totalTestCases: problem.hiddenTestCases.length,
    });

    return res.status(200).json({
      success: true,
      message: status,
      submission,
      submitAttemptsLeft: attempt.submitAttempts,
      runAttemptsLeft: attempt.runAttempts,
      results,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error submitting code",
      error: err.message,
    });
  }
};

module.exports = {
  runCode,
  submitCode,
};
