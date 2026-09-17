const express = require("express");
const submissionRouter = express.Router();

const userMiddleware = require("../middleware/userMiddleware");
const { submissionRateLimiter } = require("../middleware/rateLimiter");
const {
  runCode,
  submitCode,
  getAttemptStatus,
  getUserSubmissions,
  getSubmissionById,
  getSupportedLanguages,
} = require("../controllers/userSubmission");

submissionRouter.get("/languages", getSupportedLanguages);

submissionRouter.post("/run/:id", userMiddleware, submissionRateLimiter, runCode);
submissionRouter.post("/submit/:id", userMiddleware, submissionRateLimiter, submitCode);
submissionRouter.get("/attempts/:id", userMiddleware, getAttemptStatus);

submissionRouter.get("/user/history", userMiddleware, getUserSubmissions);
submissionRouter.get("/detail/:id", userMiddleware, getSubmissionById);

module.exports = submissionRouter;
