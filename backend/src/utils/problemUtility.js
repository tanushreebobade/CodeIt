const executionService = require("../services/execution/executionService");
const codeExecutionEngine = require("../services/execution/CodeExecutionEngine");

const executeCode = (code, language, stdin = "") => {
  return executionService.execute(code, language, stdin);
};

module.exports = {
  executeCode,
  getLanguageById: codeExecutionEngine.getLanguageById,
};
