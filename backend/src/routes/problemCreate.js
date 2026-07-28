const express = require("express");
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const validate = require("../middleware/validateMiddleware");
const { createProblemSchema, updateProblemSchema } = require("../validators/problemValidator");
const {
  createProblem,
  getAllProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require("../controllers/userProblem");

problemRouter.post("/create", adminMiddleware, validate(createProblemSchema), createProblem);
problemRouter.get("/getAllProblem", getAllProblem);
problemRouter.get("/getProblemById/:id", getProblemById);
problemRouter.put("/updateProblem/:id", adminMiddleware, validate(updateProblemSchema), updateProblem);
problemRouter.delete("/deleteProblem/:id", adminMiddleware, deleteProblem);

module.exports = problemRouter;

