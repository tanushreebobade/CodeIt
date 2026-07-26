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

problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.get("/getAllProblem", getAllProblem);
problemRouter.get("/getProblemById/:id", getProblemById);
problemRouter.put("/updateProblem/:id", adminMiddleware, updateProblem);
problemRouter.delete("/deleteProblem/:id", adminMiddleware, deleteProblem);

module.exports = problemRouter;
