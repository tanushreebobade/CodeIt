// central place for environment configuration.
// supports the documented names (MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, ...)
// as well as the legacy names some modules used (DB_CONNECT_STRING, JWT_KEY, GEMINI_KEY, ...)
require("dotenv").config();

const PLACEHOLDER_PATTERN = /^(your_|<|changeme|replace)/i;

const pick = (...names) => {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return undefined;
};

// returns undefined for values that still look like .env.example placeholders
const pickReal = (...names) => {
  const value = pick(...names);
  if (!value || PLACEHOLDER_PATTERN.test(value)) return undefined;
  return value;
};

const isProduction = (pick("NODE_ENV") || "development") === "production";

const jwtSecret = pick("JWT_SECRET", "JWT_KEY") || "codeit_dev_only_jwt_secret_change_me";
if (isProduction && !pick("JWT_SECRET", "JWT_KEY")) {
  console.warn("[config] JWT_SECRET is not set. Using an insecure default secret!");
}

const env = {
  isProduction,
  port: Number(pick("PORT")) || 5000,
  frontendUrl: pick("FRONTEND_URL") || "http://localhost:5173",

  mongoUri: (() => {
    const uri = pickReal("MONGODB_URI", "DB_CONNECT_STRING", "MONGO_URI");
    // the .env.example template uri still contains <username>/<password> placeholders
    if (!uri || /<\w+>|cluster\.mongodb\.net/i.test(uri)) {
      if (uri) console.warn("[config] MONGODB_URI looks like a placeholder; using local MongoDB at mongodb://127.0.0.1:27017/codeit");
      return "mongodb://127.0.0.1:27017/codeit";
    }
    return uri;
  })(),

  jwtSecret,
  accessTokenTtl: pick("JWT_ACCESS_EXPIRES_IN") || "15m",
  refreshTokenTtl: pick("JWT_EXPIRES_IN", "JWT_REFRESH_EXPIRES_IN") || "7d",
  accessTokenMaxAgeMs: 15 * 60 * 1000,
  refreshTokenMaxAgeMs: 7 * 24 * 60 * 60 * 1000,

  geminiApiKey: pickReal("GEMINI_API_KEY", "GEMINI_KEY"),
  geminiModel: pick("GEMINI_MODEL") || "gemini-3.6-flash",

  redisHost: pick("REDIS_HOST"),
  redisPort: Number(pick("REDIS_PORT")) || 6379,
  redisPassword: pickReal("REDIS_PASSWORD", "REDIS_PASS"),

  onlineCompilerApiKey: pickReal("ONLINE_COMPILER_API_KEY"),

  google: {
    clientId: pickReal("GOOGLE_CLIENT_ID"),
    clientSecret: pickReal("GOOGLE_CLIENT_SECRET"),
    callbackUrl: pick("GOOGLE_CALLBACK_URL"),
  },
  github: {
    clientId: pickReal("GITHUB_CLIENT_ID"),
    clientSecret: pickReal("GITHUB_CLIENT_SECRET"),
    callbackUrl: pick("GITHUB_CALLBACK_URL"),
  },

  cloudinary: {
    cloudName: pickReal("CLOUDINARY_CLOUD_NAME"),
    apiKey: pickReal("CLOUDINARY_API_KEY"),
    apiSecret: pickReal("CLOUDINARY_API_SECRET"),
  },

  // optional bootstrap admin account created on startup if it does not exist
  admin: {
    email: pickReal("ADMIN_EMAIL"),
    password: pickReal("ADMIN_PASSWORD"),
    firstName: pick("ADMIN_FIRST_NAME") || "Admin",
  },

  // free-tier limits per problem
  freeRunAttempts: Number(pick("FREE_RUN_ATTEMPTS")) || 10,
  freeSubmitAttempts: Number(pick("FREE_SUBMIT_ATTEMPTS")) || 5,
};

module.exports = env;
