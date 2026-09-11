const express = require("express");
const app = express();
require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");
const main = require("./config/db");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/userAuth");
const oauthRouter = require("./routes/oauthRoute");
const redisClient = require("./config/redis");
const problemRouter = require("./routes/problemCreate");
const submissionRouter = require("./routes/submission");
const profileRouter = require("./routes/userProfile");
const leaderboardRouter = require("./routes/leaderboard");
const videoRouter = require("./routes/videoCreator");
const aiRouter = require("./routes/aiChatting");
const { errorHandler } = require("./middleware/errorHandler");

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());
app.use(cookieParser());

app.use("/user", authRouter);
app.use("/auth", oauthRouter);
app.use("/profile", profileRouter);
app.use("/problem", problemRouter);
app.use("/submission", submissionRouter);
app.use("/leaderboard", leaderboardRouter);
app.use("/video", videoRouter);
app.use("/ai", aiRouter);

app.use(errorHandler);

const InitalizeConnection = async () => {
  const port = process.env.PORT || 3000;

  try {
    await main();
    console.log("MongoDB Connected successfully");
    const seedInitialProblemsIfEmpty = require("./config/seedProblems");
    await seedInitialProblemsIfEmpty();
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
  }

  try {
    await redisClient.connect();
    console.log("Redis Connected successfully");
  } catch (err) {
    console.warn("Redis Connection Failed (continuing without Redis):", err.message);
    try {
      await redisClient.disconnect();
    } catch (e) {
      // ignore
    }
  }

  app.listen(port, () => {
    console.log("Server listening at port number: " + port);
  });
};

InitalizeConnection();