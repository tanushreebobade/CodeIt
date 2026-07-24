const express = require("express");

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  createProblem,getAllProblem
} = require("../controllers/userProblem");

// Create
problemRouter.post("/create", adminMiddleware, createProblem);
//get
 problemRouter.get("/getAllProblem", getAllProblem);
module.exports = problemRouter;


  // updateProblem,
  // deleteProblem,
  // getProblemById,
  // unsolvedAllProblemByUser,
  // submittedProblem,