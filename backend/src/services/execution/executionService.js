const codeExecutionEngine = require("./CodeExecutionEngine");
const { BadRequestError } = require("../../errors/AppError");

// execution service wrapper
class ExecutionService {
  constructor() {
    this.provider = codeExecutionEngine;
  }

  getProvider() {
    return this.provider;
  }

  async execute(code, language, stdin = "") {
    if (!code || !language) {
      throw new BadRequestError("Both 'code' and 'language' are required for execution.");
    }
    return await this.provider.execute(code, language, stdin);
  }
}

const executionService = new ExecutionService();

module.exports = {
  execute: (code, language, stdin = "") => executionService.execute(code, language, stdin),
  ExecutionService,
};
