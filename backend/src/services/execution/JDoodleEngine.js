const axios = require("axios");
const { JDOODLE_LANGUAGE_MAP } = require("../../constants/executionConstants");
const { BadRequestError, InternalServerError } = require("../../errors/AppError");

const getLanguageById = (language) => {
  if (!language) return null;
  return JDOODLE_LANGUAGE_MAP[language.toLowerCase()] || null;
};

const execute = async (code, language, stdin = "") => {
  const config = getLanguageById(language);

  if (!config) {
    throw new BadRequestError(`Unsupported Language: ${language}`);
  }

  try {
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: code,
      language: config.language,
      versionIndex: config.versionIndex,
      stdin,
    });

    const data = response.data;
    return {
      output: data.output || "",
      statusCode: data.statusCode,
      memory: Number(data.memory) || 0,
      cpuTime: Number(data.cpuTime) || 0,
      error: data.error || null,
      raw: data,
    };
  } catch (err) {
    console.error("JDoodle Execution Error Status:", err.response?.status);
    console.error("JDoodle Response Data:", JSON.stringify(err.response?.data, null, 2));

    if (err.response?.data?.error) {
      throw new BadRequestError(`Execution engine error: ${err.response.data.error}`);
    }

    throw new InternalServerError("Code execution engine failed to respond");
  }
};

module.exports = {
  execute,
  getLanguageById,
};
