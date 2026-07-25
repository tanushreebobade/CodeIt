const express = require("express");

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  createProblem,
  getAllProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require("../controllers/userProblem");

// Create
problemRouter.post("/create", adminMiddleware, createProblem);
//get
problemRouter.get("/getAllProblem", getAllProblem);
//get problem by id
problemRouter.get("/getProblemById/:id", getProblemById);
//update problem
problemRouter.put("/updateProblem/:id", adminMiddleware, updateProblem);
//delete problem
problemRouter.delete("/deleteProblem/:id", adminMiddleware, deleteProblem);
//run code

module.exports = problemRouter;

// updateProblem,
// deleteProblem,
// getProblemById,
// unsolvedAllProblemByUser,
// submittedProblem,
