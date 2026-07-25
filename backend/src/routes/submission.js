const express = require("express");
const submissionRouter = express.Router();

const userMiddleware = require("../middleware/userMiddleware");
const { runCode, submitCode } = require("../controllers/userSubmission");

submissionRouter.post("/run/:id", userMiddleware, runCode);

submissionRouter.post("/submit/:id", userMiddleware, submitCode);

module.exports = submissionRouter;
