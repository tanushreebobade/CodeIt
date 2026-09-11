const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { ONLINE_COMPILER_LANGUAGE_MAP } = require("../../constants/executionConstants");
const { BadRequestError, InternalServerError } = require("../../errors/AppError");

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

function parseCppSolutionMethod(code) {
  const classMatch = code.match(/class\s+Solution\s*\{([\s\S]*?)\};/);
  const body = classMatch ? classMatch[1] : code;

  const regex = /([A-Za-z0-9_:<>\s\*\&]+?)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{/;
  const match = body.match(regex);
  if (!match) return null;

  let returnType = match[1].replace(/^(public|private|protected)\s*:\s*/i, '').trim();

  return {
    returnType,
    funcName: match[2].trim(),
    paramsStr: match[3].trim(),
  };
}

// wrap solution class if main function is missing
function wrapCppIfNeeded(code) {
  if (/\bint\s+main\s*\(/i.test(code) || /\bvoid\s+main\s*\(/i.test(code)) {
    return code;
  }
  if (!/\bclass\s+Solution\b/.test(code)) {
    return code;
  }

  const parsed = parseCppSolutionMethod(code);
  if (!parsed) return code;

  const { returnType, funcName, paramsStr } = parsed;
  const params = paramsStr ? paramsStr.split(',').map(p => p.trim()) : [];
  const isBoolReturn = returnType.includes('bool');

  let driver = `\n\n#include <iostream>\n#include <sstream>\n#include <string>\n#include <vector>\n#include <unordered_map>\n#include <algorithm>\n#include <cctype>\nusing namespace std;\n`;
  driver += `\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    cout << boolalpha;\n    Solution sol;\n`;
  driver += `    string rawInput, line;\n    while (getline(cin, line)) { rawInput += line + " "; }\n`;

  if (params.length === 2 && (params[0].includes('vector<int>') || params[0].includes('vector <int>')) && params[1].includes('int')) {
    driver += `    vector<int> allNums;\n    string temp = "";\n    for (char c : rawInput) {\n        if (isdigit(c) || c == '-') {\n            temp += c;\n        } else {\n            if (!temp.empty()) {\n                if (temp != "-") allNums.push_back(stoi(temp));\n                temp = "";\n            }\n        }\n    }\n    if (!temp.empty() && temp != "-") allNums.push_back(stoi(temp));\n`;
    driver += `    vector<int> arg1;\n    int arg2 = 0;\n    if (allNums.size() >= 2) {\n        arg2 = allNums.back();\n        allNums.pop_back();\n        if (allNums.size() > 1 && allNums[0] == (int)allNums.size() - 1) {\n            allNums.erase(allNums.begin());\n        }\n        arg1 = allNums;\n    }\n`;
    
    if (returnType.includes('vector')) {
      driver += `    auto res = sol.${funcName}(arg1, arg2);\n    for (size_t i = 0; i < res.size(); i++) cout << (i == 0 ? "" : " ") << res[i];\n`;
    } else if (isBoolReturn) {
      driver += `    cout << (sol.${funcName}(arg1, arg2) ? "true" : "false");\n`;
    } else {
      driver += `    cout << sol.${funcName}(arg1, arg2);\n`;
    }
  } else if (params.length === 1 && (params[0].includes('vector<int>') || params[0].includes('vector <int>'))) {
    driver += `    vector<int> arg1;\n    string temp = "";\n    for (char c : rawInput) {\n        if (isdigit(c) || c == '-') {\n            temp += c;\n        } else {\n            if (!temp.empty()) {\n                if (temp != "-") arg1.push_back(stoi(temp));\n                temp = "";\n            }\n        }\n    }\n    if (!temp.empty() && temp != "-") arg1.push_back(stoi(temp));\n`;
    
    if (returnType === 'void') {
      driver += `    sol.${funcName}(arg1);\n`;
    } else if (returnType.includes('vector')) {
      driver += `    auto res = sol.${funcName}(arg1);\n    for (size_t i = 0; i < res.size(); i++) cout << (i == 0 ? "" : " ") << res[i];\n`;
    } else if (isBoolReturn) {
      driver += `    cout << (sol.${funcName}(arg1) ? "true" : "false");\n`;
    } else {
      driver += `    cout << sol.${funcName}(arg1);\n`;
    }
  } else if (params.length === 1 && params[0].includes('string')) {
    driver += `    string arg1 = "";\n    for (char c : rawInput) { if (c != '"' && c != '\\'' && c != '[' && c != ']' && c != ' ') arg1 += c; }\n`;
    if (isBoolReturn) {
      driver += `    cout << (sol.${funcName}(arg1) ? "true" : "false");\n`;
    } else {
      driver += `    cout << sol.${funcName}(arg1);\n`;
    }
  } else {
    driver += `    vector<int> arg1;\n    string temp = "";\n    for (char c : rawInput) {\n        if (isdigit(c) || c == '-') {\n            temp += c;\n        } else {\n            if (!temp.empty()) {\n                if (temp != "-") arg1.push_back(stoi(temp));\n                temp = "";\n            }\n        }\n    }\n    if (!temp.empty() && temp != "-") arg1.push_back(stoi(temp));\n`;
    if (isBoolReturn) {
      driver += `    cout << (sol.${funcName}(arg1) ? "true" : "false");\n`;
    } else {
      driver += `    cout << sol.${funcName}(arg1);\n`;
    }
  }

  driver += `    return 0;\n}\n`;

  return code + driver;
}

function wrapPythonIfNeeded(code) {
  if (/\bif\s+__name__\s*==\s*['"]__main__['"]/.test(code)) {
    return code;
  }
  if (!/\bclass\s+Solution\b/.test(code)) {
    return code;
  }
  const driver = `\n\nimport sys, re\nif __name__ == "__main__":
    raw = sys.stdin.read().strip()
    sol = Solution()
    nums = [int(x) for x in re.findall(r'-?\\d+', raw)]
    for attr in dir(sol):
        if not attr.startswith('__') and callable(getattr(sol, attr)):
            try:
                res = getattr(sol, attr)(nums)
                if isinstance(res, bool):
                    print("true" if res else "false")
                elif res is not None:
                    print(res)
                break
            except Exception as e:
                pass
`;
  return code + driver;
}

const wrapCodeIfNeeded = (code, language) => {
  const langKey = String(language).toLowerCase();
  if (langKey === "cpp" || langKey === "c++" || langKey === "c") {
    return wrapCppIfNeeded(code);
  }
  if (langKey === "python" || langKey === "py") {
    return wrapPythonIfNeeded(code);
  }
  return code;
};

const execute = async (code, language, stdin = "") => {
  const compilerLang = getLanguageById(language);

  if (!compilerLang) {
    throw new BadRequestError(`Unsupported Language: ${language}`);
  }

  const apiKey = process.env.ONLINE_COMPILER_API_KEY;
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

    return {
      output: outputText,
      statusCode: isSuccess ? 200 : 400,
      memory: Number(data.memory) || 0,
      cpuTime: parseFloat(data.time) || parseFloat(data.total) || 0,
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
