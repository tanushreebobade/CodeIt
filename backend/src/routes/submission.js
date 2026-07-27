const express = require("express");
const submissionRouter = express.Router();

const userMiddleware = require("../middleware/userMiddleware");
const {
  runCode,
  submitCode,
  getUserSubmissions,
  getSubmissionById,
} = require("../controllers/userSubmission");

submissionRouter.post("/run/:id", userMiddleware, runCode);
submissionRouter.post("/submit/:id", userMiddleware, submitCode);

submissionRouter.get("/user/history", userMiddleware, getUserSubmissions);
submissionRouter.get("/detail/:id", userMiddleware, getSubmissionById);

module.exports = submissionRouter;
