const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");
const { JDOODLE_LANGUAGE_MAP } = require("../../constants/executionConstants");
const { BadRequestError, InternalServerError } = require("../../errors/AppError");

const getLanguageById = (language) => {
  if (!language) return null;
  return JDOODLE_LANGUAGE_MAP[language.toLowerCase()] || null;
};

// local compiler runner for g++, gcc, python
const runLocalCompiler = (code, language, stdin = "") => {
  const lang = (language || "").toLowerCase();
  const tmpDir = os.tmpdir();
  const id = `${Date.now()}_${Math.random().toString(36).substring(7)}`;

  if (lang.includes("cpp") || lang.includes("c++") || lang === "c") {
    const isCpp = lang.includes("cpp") || lang.includes("c++");
    const compiler = isCpp ? "g++" : "gcc";
    const srcFile = path.join(tmpDir, `code_${id}.${isCpp ? "cpp" : "c"}`);
    const exeFile = path.join(tmpDir, `code_${id}.exe`);

    try {
      fs.writeFileSync(srcFile, code, "utf8");
      const compile = spawnSync(compiler, [srcFile, "-o", exeFile, "-O2"], {
        timeout: 10000,
        encoding: "utf8",
      });

      if (compile.status !== 0 || compile.error) {
        const errText = compile.stderr || compile.error?.message || "Compilation failed";
        return {
          output: errText.trim(),
          statusCode: 400,
          memory: 0,
          cpuTime: 0,
          error: "Compilation Error",
          raw: { error: errText },
        };
      }

      const run = spawnSync(exeFile, [], {
        input: stdin,
        timeout: 5000,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });

      if (run.error && run.error.code === "ETIMEDOUT") {
        return {
          output: "Time Limit Exceeded (TLE)",
          statusCode: 408,
          memory: 0,
          cpuTime: 5.0,
          error: "Time Limit Exceeded",
          raw: { error: "Time Limit Exceeded" },
        };
      }

      const stdout = run.stdout ? run.stdout.trim() : "";
      const stderr = run.stderr ? run.stderr.trim() : "";

      return {
        output: stdout || stderr || "",
        statusCode: run.status === 0 ? 200 : 400,
        memory: 15000,
        cpuTime: 0.02,
        error: run.status !== 0 ? (stderr || "Runtime Error") : null,
        raw: { output: stdout, error: stderr },
      };
    } catch (err) {
      return {
        output: err.message,
        statusCode: 500,
        error: err.message,
        raw: { error: err.message },
      };
    } finally {
      try { if (fs.existsSync(srcFile)) fs.unlinkSync(srcFile); } catch (e) { }
      try { if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile); } catch (e) { }
    }
  }

  if (lang.includes("python") || lang === "py") {
    const pyFile = path.join(tmpDir, `code_${id}.py`);
    try {
      fs.writeFileSync(pyFile, code, "utf8");
      const run = spawnSync("python", [pyFile], {
        input: stdin,
        timeout: 5000,
        encoding: "utf8",
      });

      if (run.error && run.error.code === "ETIMEDOUT") {
        return {
          output: "Time Limit Exceeded (TLE)",
          statusCode: 408,
          memory: 0,
          cpuTime: 5.0,
          error: "Time Limit Exceeded",
        };
      }

      const stdout = run.stdout ? run.stdout.trim() : "";
      const stderr = run.stderr ? run.stderr.trim() : "";

      return {
        output: stdout || stderr || "",
        statusCode: run.status === 0 ? 200 : 400,
        memory: 12000,
        cpuTime: 0.03,
        error: run.status !== 0 ? (stderr || "Runtime Error") : null,
        raw: { output: stdout, error: stderr },
      };
    } catch (err) {
      return {
        output: err.message,
        statusCode: 500,
        error: err.message,
      };
    } finally {
      try { if (fs.existsSync(pyFile)) fs.unlinkSync(pyFile); } catch (e) { }
    }
  }

  return null;
};

const runJsVm = (code, stdin = "") => {
  try {
    const vm = require("vm");
    let capturedOutput = "";
    const sandbox = {
      console: {
        log: (...args) => { capturedOutput += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + "\n"; },
        error: (...args) => { capturedOutput += args.join(' ') + "\n"; }
      },
      readline: () => stdin,
      input: stdin
    };
    const context = vm.createContext(sandbox);
    const evalResult = vm.runInContext(code, context, { timeout: 3000 });

    if (!capturedOutput.trim()) {
      if (evalResult !== undefined && evalResult !== null) {
        capturedOutput = typeof evalResult === 'object' ? JSON.stringify(evalResult) : String(evalResult);
      } else {
        const funcs = Object.keys(sandbox).filter(k => typeof sandbox[k] === 'function' && k !== 'readline');
        if (funcs.length > 0) {
          try {
            let parsedArgs = [];
            if (stdin.includes("\n")) {
              parsedArgs = stdin.split("\n").map(s => {
                try { return JSON.parse(s.trim()); } catch (e) { return s.trim(); }
              });
            } else if (stdin.trim()) {
              try {
                parsedArgs = [JSON.parse(stdin.trim())];
              } catch (e) {
                parsedArgs = [stdin.trim()];
              }
            }
            const res = sandbox[funcs[0]](...parsedArgs);
            if (res !== undefined && res !== null) {
              capturedOutput = typeof res === 'object' ? JSON.stringify(res) : String(res);
            }
          } catch (e) { }
        }
      }
    }

    return {
      output: capturedOutput.trim(),
      statusCode: 200,
      memory: 12000,
      cpuTime: 0.04,
      error: null,
      raw: { output: capturedOutput.trim() }
    };
  } catch (e) {
    return {
      output: e.message || "Runtime Error",
      statusCode: 400,
      memory: 0,
      cpuTime: 0.01,
      error: e.message,
      raw: { error: e.message }
    };
  }
};

// global daily credit tracker for JDoodle API (max 20 credits per day)
let globalCreditTracker = {
  dateStr: new Date().toISOString().slice(0, 10),
  usedCredits: 0,
  isLimitReached: false,
  MAX_DAILY_CREDITS: 20,
};

const checkAndResetDailyCredits = () => {
  const today = new Date().toISOString().slice(0, 10);
  if (globalCreditTracker.dateStr !== today) {
    globalCreditTracker.dateStr = today;
    globalCreditTracker.usedCredits = 0;
    globalCreditTracker.isLimitReached = false;
  }
};

const execute = async (code, language, stdin = "") => {
  const langLower = (language || "").toLowerCase();

  // check if global 20 credits daily limit is exhausted
  checkAndResetDailyCredits();
  if (globalCreditTracker.isLimitReached || globalCreditTracker.usedCredits >= globalCreditTracker.MAX_DAILY_CREDITS) {
    throw new BadRequestError(
      `Daily execution limit reached for code engine (${globalCreditTracker.MAX_DAILY_CREDITS}/${globalCreditTracker.MAX_DAILY_CREDITS} credits used). Credits reset at 12:00 AM UTC (5:30 AM IST). Please try again later.`
    );
  }

  // Try local native compiler first to save credits if available
  const localRes = runLocalCompiler(code, language, stdin);
  if (localRes) {
    globalCreditTracker.usedCredits++;
    return localRes;
  }

  // 3. Try js vm execution locally
  if (langLower === "javascript" || langLower === "nodejs" || langLower === "js") {
    globalCreditTracker.usedCredits++;
    return runJsVm(code, stdin);
  }

  const config = getLanguageById(language);

  // fallback if jdoodle credentials missing
  if (!process.env.JDOODLE_CLIENT_ID || !process.env.JDOODLE_CLIENT_SECRET) {
    if (!config && !language) {
      throw new BadRequestError(`Unsupported Language: ${language}`);
    }
    return {
      output: `[Dev Mode Output for input: ${stdin}]\nSet JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET in backend/.env for multi-language execution.`,
      statusCode: 200,
      memory: 15400,
      cpuTime: 0.05,
      error: null,
      raw: { output: stdin }
    };
  }

  if (!config) {
    throw new BadRequestError(`Unsupported Language: ${language}`);
  }

  try {
    globalCreditTracker.usedCredits++;
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: code,
      language: config.language,
      versionIndex: config.versionIndex,
      stdin,
    });

    const data = response.data;

    if (data.error && data.error.toLowerCase().includes("daily limit reached")) {
      globalCreditTracker.isLimitReached = true;
      globalCreditTracker.usedCredits = globalCreditTracker.MAX_DAILY_CREDITS;
      throw new BadRequestError(
        `Daily execution limit reached for code engine (${globalCreditTracker.MAX_DAILY_CREDITS}/${globalCreditTracker.MAX_DAILY_CREDITS} credits used). Credits reset at 12:00 AM UTC (5:30 AM IST). Please try again later.`
      );
    }

    return {
      output: data.output || "",
      statusCode: data.statusCode,
      memory: Number(data.memory) || 0,
      cpuTime: Number(data.cpuTime) || 0,
      error: data.error || null,
      raw: data,
    };
  } catch (err) {
    if (err instanceof BadRequestError) {
      throw err;
    }

    console.error("JDoodle Execution Error Status:", err.response?.status);
    console.error("JDoodle Response Data:", JSON.stringify(err.response?.data, null, 2));

    const errDataStr = err.response?.data?.error || err.message || "";
    if (errDataStr.toLowerCase().includes("daily limit reached") || err.response?.status === 429) {
      globalCreditTracker.isLimitReached = true;
      globalCreditTracker.usedCredits = globalCreditTracker.MAX_DAILY_CREDITS;
      throw new BadRequestError(
        `Daily execution limit reached for code engine (${globalCreditTracker.MAX_DAILY_CREDITS}/${globalCreditTracker.MAX_DAILY_CREDITS} credits used). Credits reset at 12:00 AM UTC (5:30 AM IST). Please try again later.`
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
  globalCreditTracker,
};
