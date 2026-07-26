const jdoodleEngine = require("./JDoodleEngine");
const { BadRequestError } = require("../../errors/AppError");

//Execution Engine Abstraction Layer

class ExecutionService {
  constructor() {
    this.providers = {
      jdoodle: jdoodleEngine,
    };
  }

  getProvider(providerName = process.env.EXECUTION_PROVIDER || "jdoodle") {
    const provider = this.providers[providerName.toLowerCase()];
    if (!provider) {
      throw new BadRequestError(`Execution provider '${providerName}' is not supported.`);
    }
    return provider;
  }

  async execute(code, language, stdin = "") {
    if (!code || !language) {
      throw new BadRequestError("Both 'code' and 'language' are required for execution.");
    }
    const provider = this.getProvider();
    return await provider.execute(code, language, stdin);
  }
}

const executionService = new ExecutionService();

module.exports = {
  execute: (code, language, stdin = "") => executionService.execute(code, language, stdin),
  ExecutionService,
};
