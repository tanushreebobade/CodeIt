const axios = require("axios");
const fs = require("fs");
const path = require("path");
const env = require("../../config/env");
const { ONLINE_COMPILER_LANGUAGE_MAP } = require("../../constants/executionConstants");
const { BadRequestError, InternalServerError } = require("../../errors/AppError");
const { wrapCppIfNeeded, wrapPythonIfNeeded, wrapJavaScriptIfNeeded, wrapJavaIfNeeded } = require("./codeDrivers");

const GLOBAL_COUNTER_FILE = path.join(__dirname, "../../../data/global_counter.json");
const MAX_GLOBAL_EXECUTIONS = 5000;

const getGlobalExecutionCount = () => {
  try {
    if (fs.existsSync(GLOBAL_COUNTER_FILE)) {
      const data = JSON.parse(fs.readFileSync(GLOBAL_COUNTER_FILE, "utf-8"));
      return Number(data.totalExecutions) || 0;
    }
  } catch (err) {
    console.error("Error reading global counter file:", err.message);
  }
  return 0;
};

const checkAndIncrementGlobalCounter = () => {
  const currentCount = getGlobalExecutionCount();
  if (currentCount >= MAX_GLOBAL_EXECUTIONS) {
    throw new BadRequestError(
      `Global platform execution limit reached (${MAX_GLOBAL_EXECUTIONS}/${MAX_GLOBAL_EXECUTIONS} total runs & submissions completed). Code execution and submission are permanently disabled for all users.`
    );
  }

  const newCount = currentCount + 1;
  try {
    const dir = path.dirname(GLOBAL_COUNTER_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      GLOBAL_COUNTER_FILE,
      JSON.stringify({ totalExecutions: newCount, updatedAt: new Date().toISOString() }, null, 2)
    );
  } catch (err) {
    console.error("Error writing global counter file:", err.message);
  }
  return newCount;
};

const getLanguageById = (language) => {
  if (!language) return null;
  const key = String(language).toLowerCase();
  return ONLINE_COMPILER_LANGUAGE_MAP[key] || null;
};

// user daily credit tracker
const userCreditTracker = new Map();

const checkAndConsumeUserCredit = (userId = "default_user") => {
  checkAndIncrementGlobalCounter();

  const today = new Date().toISOString().slice(0, 10);
  const key = `${userId}_${today}`;
  const used = userCreditTracker.get(key) || 0;
  if (used >= 20) {
    throw new BadRequestError(
      "Daily execution limit reached (20/20 credits used). Credits reset at 12:00 AM UTC (5:30 AM IST). Please try again tomorrow."
    );
  }
  userCreditTracker.set(key, used + 1);
};

const wrapCodeIfNeeded = (code, language) => {
  const langKey = String(language).toLowerCase();
  if (langKey === "cpp" || langKey === "c++") return wrapCppIfNeeded(code);
  if (langKey === "python" || langKey === "py") return wrapPythonIfNeeded(code);
  if (langKey === "javascript" || langKey === "js" || langKey === "nodejs") return wrapJavaScriptIfNeeded(code);
  if (langKey === "java") return wrapJavaIfNeeded(code).code;
  return code;
};

const execute = async (code, language, stdin = "") => {
  const compilerLang = getLanguageById(language);

  if (!compilerLang) {
    throw new BadRequestError(`Unsupported Language: ${language}`);
  }

  const apiKey = env.onlineCompilerApiKey;
  if (!apiKey) {
    throw new InternalServerError("ONLINE_COMPILER_API_KEY is not configured in environment.");
  }

  const finalCode = wrapCodeIfNeeded(code, language);

  try {
    const response = await axios.post(
      "https://api.onlinecompiler.io/api/run-code-sync/",
      {
        compiler: compilerLang,
        code: finalCode,
        input: stdin || "",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey,
          "x-api-key": apiKey,
        },
        timeout: 15000,
      }
    );

    const data = response.data;

    if (data.error && data.error.toLowerCase().includes("daily limit reached")) {
      throw new BadRequestError(
        "Daily execution limit reached for code engine (20/20 credits used). Credits reset at 12:00 AM UTC (5:30 AM IST). Please try again later."
      );
    }

    const outputText = data.output !== undefined ? data.output : (data.stdout || "");
    const errorText = data.error || data.stderr || null;
    const isSuccess = data.status === "success" || data.exit_code === 0;
    const lowerErr = String(errorText || outputText || "").toLowerCase();
    let status = isSuccess ? "success" : "runtime_error";
    if (!isSuccess && (lowerErr.includes("error:") || lowerErr.includes("compilation"))) status = "compile_error";
    if (lowerErr.includes("time limit") || lowerErr.includes("timed out")) status = "time_limit";

    return {
      status,
      output: outputText,
      statusCode: isSuccess ? 200 : status === "time_limit" ? 408 : 400,
      memory: Number(data.memory) || 0,
      // api reports seconds; normalise to milliseconds like the local engine
      cpuTime: Math.round((parseFloat(data.time) || parseFloat(data.total) || 0) * 1000),
      error: errorText,
      raw: data,
    };
  } catch (err) {
    if (err instanceof BadRequestError || err instanceof InternalServerError) {
      throw err;
    }

    console.error("OnlineCompiler Execution Error Status:", err.response?.status);
    console.error("OnlineCompiler Response Data:", JSON.stringify(err.response?.data, null, 2));

    const errDataStr = err.response?.data?.error || err.response?.data?.message || err.message || "";
    if (errDataStr.toLowerCase().includes("daily limit reached") || err.response?.status === 429) {
      throw new BadRequestError(
        "Daily execution limit reached for code engine (20/20 credits used). Credits reset at 12:00 AM UTC (5:30 AM IST). Please try again later."
      );
    }

    if (err.response?.data?.error) {
      throw new BadRequestError(`Execution engine error: ${err.response.data.error}`);
    }

    throw new InternalServerError("Code execution engine failed to respond");
  }
};

module.exports = {
  execute,
  getLanguageById,
  checkAndConsumeUserCredit,
  userCreditTracker,
  getGlobalExecutionCount,
  MAX_GLOBAL_EXECUTIONS,
};
