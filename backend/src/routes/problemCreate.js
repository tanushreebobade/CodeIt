const express = require("express");
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const userMiddleware = require("../middleware/userMiddleware");
const validate = require("../middleware/validateMiddleware");
const { createProblemSchema, updateProblemSchema } = require("../validators/problemValidator");
const {
  createProblem,
  getAllProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
  solvedAllProblembyUser,
  submittedProblem,
} = require("../controllers/userProblem");

// Create / Update / Delete
problemRouter.post("/create", adminMiddleware, validate(createProblemSchema), createProblem);
problemRouter.put("/update/:id", adminMiddleware, validate(updateProblemSchema), updateProblem);
problemRouter.put("/updateProblem/:id", adminMiddleware, validate(updateProblemSchema), updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);
problemRouter.delete("/deleteProblem/:id", adminMiddleware, deleteProblem);

// Read / Fetch Problem Endpoints
problemRouter.get("/getAllProblem", userMiddleware, getAllProblem);
problemRouter.get("/problemById/:id", userMiddleware, getProblemById);
problemRouter.get("/getProblemById/:id", userMiddleware, getProblemById);
problemRouter.get("/problemSolvedByUser", userMiddleware, solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem);

module.exports = problemRouter;
