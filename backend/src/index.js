const env = require("./config/env");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const connectDatabase = require("./config/db");
const redisClient = require("./config/redis");
const seedInitialProblemsIfEmpty = require("./config/seedProblems");
const { seedAdminIfConfigured } = require("./config/seedProblems");

const authRouter = require("./routes/userAuth");
const oauthRouter = require("./routes/oauthRoute");
const problemRouter = require("./routes/problemCreate");
const submissionRouter = require("./routes/submission");
const profileRouter = require("./routes/userProfile");
const leaderboardRouter = require("./routes/leaderboard");
const videoRouter = require("./routes/videoCreator");
const aiRouter = require("./routes/aiChatting");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const executionService = require("./services/execution/executionService");

const app = express();

// ---------------------------------------------------------------- cors ----
const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    env.frontendUrl,
    ...(process.env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()),
  ].filter(Boolean)
);

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow same-origin / server-to-server requests without an Origin header
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      // in development accept any localhost / lan origin so vite previews work
      if (!env.isProduction && /^https?:\/\/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.)/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// -------------------------------------------------------------- routes ----
app.get(["/", "/health", "/api/health"], (req, res) => {
  res.json({
    success: true,
    service: "codeit-api",
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "mongodb" : "local-json-fallback",
    redis: redisClient.isOpen ? "connected" : "disabled",
    ai: Boolean(env.geminiApiKey),
    executionLanguages: executionService.availableLanguages(),
    uptime: Math.round(process.uptime()),
  });
});

app.use("/user", authRouter);
app.use("/auth", oauthRouter);
app.use("/profile", profileRouter);
app.use("/problem", problemRouter);
app.use("/submission", submissionRouter);
app.use("/leaderboard", leaderboardRouter);
app.use("/video", videoRouter);
app.use("/ai", aiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

// ------------------------------------------------------------- startup ----
const initializeConnection = async () => {
  try {
    await connectDatabase();
    console.log(`MongoDB connected (${mongoose.connection.name})`);
    await seedInitialProblemsIfEmpty();
    await seedAdminIfConfigured();
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.warn("Continuing with the local JSON data store in backend/data");
  }

  if (redisClient.isEnabled) {
    try {
      await redisClient.connect();
      console.log("Redis connected");
    } catch (err) {
      console.warn("Redis connection failed (continuing without Redis):", err.message);
      try {
        await redisClient.disconnect();
      } catch (e) {
        // ignore
      }
    }
  }

  const languages = executionService.availableLanguages();
  if (languages.length === 0) {
    console.warn("No code execution engine available: install g++/python/java or set ONLINE_COMPILER_API_KEY");
  } else {
    console.log(`Code execution available for: ${languages.join(", ")}`);
  }
  if (!env.geminiApiKey) {
    console.warn("GEMINI_API_KEY not set: the AI Tutor endpoint will return 503");
  }

  const server = app.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });

  const shutdown = () => {
    console.log("Shutting down...");
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

initializeConnection();

module.exports = app;
