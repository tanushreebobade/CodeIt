const express = require("express");
const submissionRouter = express.Router();

const userMiddleware = require("../middleware/userMiddleware");
const { submissionRateLimiter } = require("../middleware/rateLimiter");
const {
  runCode,
  submitCode,
  getUserSubmissions,
  getSubmissionById,
} = require("../controllers/userSubmission");

submissionRouter.post("/run/:id", userMiddleware, submissionRateLimiter, runCode);
submissionRouter.post("/submit/:id", userMiddleware, submissionRateLimiter, submitCode);

submissionRouter.get("/user/history", userMiddleware, getUserSubmissions);
submissionRouter.get("/detail/:id", userMiddleware, getSubmissionById);

module.exports = submissionRouter;
