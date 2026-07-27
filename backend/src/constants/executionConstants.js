const EXECUTION_STATUS = Object.freeze({
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  COMPILATION_ERROR: "Compilation Error",
  RUNTIME_ERROR: "Runtime Error",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
  MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
});
//languages 
const SUPPORTED_LANGUAGES = Object.freeze({
  CPP: "cpp",
  C: "c",
  JAVA: "java",
  JAVASCRIPT: "javascript",
  PYTHON: "python",
});

//version
const JDOODLE_LANGUAGE_MAP = Object.freeze({
  cpp: { language: "cpp17", versionIndex: "2" },
  "c++": { language: "cpp17", versionIndex: "2" },
  c: { language: "c", versionIndex: "5" },
  java: { language: "java", versionIndex: "4" },
  javascript: { language: "nodejs", versionIndex: "5" },
  python: { language: "python3", versionIndex: "5" },
});

module.exports = {
  EXECUTION_STATUS,
  SUPPORTED_LANGUAGES,
  JDOODLE_LANGUAGE_MAP,
};
