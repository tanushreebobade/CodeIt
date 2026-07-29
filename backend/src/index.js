const express = require("express");
const app = express();
require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");
const main = require("./config/db");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/userAuth");
const redisClient = require("./config/redis");
const problemRouter = require("./routes/problemCreate");
const submissionRouter = require("./routes/submission");
const profileRouter = require("./routes/userProfile");
const leaderboardRouter = require("./routes/leaderboard");
const videoRouter = require("./routes/videoCreator");
const aiRouter = require("./routes/aiChatting");
const { errorHandler } = require("./middleware/errorHandler");

// CORS Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Helmet 
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());
app.use(cookieParser());

app.use("/user", authRouter); // Cleaned duplicate
app.use("/profile", profileRouter);
app.use("/problem", problemRouter);
app.use("/submission", submissionRouter);
app.use("/leaderboard", leaderboardRouter);
app.use("/video", videoRouter);
app.use("/ai", aiRouter);

// Centralized Global Error Handler
app.use(errorHandler);

const InitalizeConnection = async () => {
  const port = process.env.PORT || 3000;

  try {
    await main();
    console.log("MongoDB Connected successfully");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
  }

  try {
    await redisClient.connect();
    console.log("Redis Connected successfully");
  } catch (err) {
    console.error("Redis Connection Error:", err.message);
  }

  app.listen(port, () => {
    console.log("Server listening at port number: " + port);
  });
};

InitalizeConnection();