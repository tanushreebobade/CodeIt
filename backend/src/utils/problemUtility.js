const executionService = require("../services/execution/executionService");
const jdoodleEngine = require("../services/execution/JDoodleEngine");

const executeCode = (code, language, stdin = "") => {
  return executionService.execute(code, language, stdin);
};

module.exports = {
  executeCode,
  getLanguageById: jdoodleEngine.getLanguageById,
};
