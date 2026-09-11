const EXECUTION_STATUS = Object.freeze({
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  COMPILATION_ERROR: "Compilation Error",
  RUNTIME_ERROR: "Runtime Error",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
  MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
});

// supported languages
const SUPPORTED_LANGUAGES = Object.freeze({
  CPP: "cpp",
  C: "c",
  JAVA: "java",
  JAVASCRIPT: "javascript",
  PYTHON: "python",
});

// onlinecompiler.io language identifier mapping
const ONLINE_COMPILER_LANGUAGE_MAP = Object.freeze({
  cpp: "g++-15",
  "c++": "g++-15",
  c: "gcc-15",
  java: "openjdk-25",
  javascript: "typescript-deno",
  nodejs: "typescript-deno",
  js: "typescript-deno",
  python: "python-3.14",
  py: "python-3.14",
});

module.exports = {
  EXECUTION_STATUS,
  SUPPORTED_LANGUAGES,
  ONLINE_COMPILER_LANGUAGE_MAP,
};
