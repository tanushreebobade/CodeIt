const executionService = require("../services/execution/executionService");
const codeExecutionEngine = require("../services/execution/CodeExecutionEngine");

const executeCode = (code, language, stdin = "", options = {}) => {
  return executionService.execute(code, language, stdin, options);
};

module.exports = {
  executeCode,
  getLanguageById: codeExecutionEngine.getLanguageById,
};
