const env = require("../../config/env");
const localEngine = require("./LocalExecutionEngine");
const onlineEngine = require("./CodeExecutionEngine");
const { BadRequestError, AppError } = require("../../errors/AppError");
const { SUPPORTED_LANGUAGES } = require("../../constants/executionConstants");

// picks the best available engine for a language:
// 1. local compilers / runtimes installed on the server (free, fast)
// 2. onlinecompiler.io when ONLINE_COMPILER_API_KEY is configured
class ExecutionService {
  getEngineFor(language) {
    if (localEngine.supports(language)) return { name: "local", engine: localEngine };
    if (env.onlineCompilerApiKey && onlineEngine.getLanguageById(language)) {
      return { name: "online", engine: onlineEngine };
    }
    return null;
  }

  isLanguageSupported(language) {
    return Boolean(this.getEngineFor(language));
  }

  availableLanguages() {
    const local = new Set(localEngine.availableLanguages());
    if (env.onlineCompilerApiKey) {
      Object.values(SUPPORTED_LANGUAGES).forEach((lang) => local.add(lang));
    }
    return Array.from(local);
  }

  async execute(code, language, stdin = "", { userId } = {}) {
    if (!code || !language) {
      throw new BadRequestError("Both 'code' and 'language' are required for execution.");
    }

    const normalized = localEngine.normalizeLanguage(language);
    if (!normalized) {
      throw new BadRequestError(`Unsupported language: ${language}`);
    }

    const selected = this.getEngineFor(normalized);
    if (!selected) {
      throw new AppError(
        `Code execution for "${normalized}" is not available on this server. Install the compiler/runtime (g++, python, java, node) or configure ONLINE_COMPILER_API_KEY.`,
        503
      );
    }

    if (selected.name === "online") {
      // paid api: enforce the daily credit limits
      onlineEngine.checkAndConsumeUserCredit(userId || "anonymous");
    }

    return await selected.engine.execute(code, normalized, stdin);
  }
}

const executionService = new ExecutionService();

module.exports = {
  execute: (code, language, stdin = "", options = {}) => executionService.execute(code, language, stdin, options),
  isLanguageSupported: (language) => executionService.isLanguageSupported(language),
  availableLanguages: () => executionService.availableLanguages(),
  ExecutionService,
};
