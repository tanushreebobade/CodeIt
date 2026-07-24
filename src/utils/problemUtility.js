const axios = require("axios");
const languageMap = {
  cpp: {
    language: "cpp17",
    versionIndex: "2",
  },

  "c++": {
    language: "cpp17",
    versionIndex: "2",
  },

  java: {
    language: "java",
    versionIndex: "4",
  },

  javascript: {
    language: "nodejs",
    versionIndex: "5",
  },

  python: {
    language: "python3",
    versionIndex: "5",
  },
};

const getLanguageById = (language) => {
  return languageMap[language.toLowerCase()] || null;
};
const executeCode = async (code, language, stdin = "") => {
  const config = getLanguageById(language);

  if (!config) {
    throw new Error("Unsupported Language");
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

    return response.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    throw err;
  }
};
module.exports = {
  getLanguageById,
  executeCode,
};
