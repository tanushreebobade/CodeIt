const Joi = require("joi");

// Schema for testcase inputs and outputs
const testCaseSchema = Joi.object({
  input: Joi.string().required().messages({
    "string.empty": "Test case input is required",
  }),
  output: Joi.string().required().messages({
    "string.empty": "Test case output is required",
  }),
  explanation: Joi.string().allow("", null).optional(),
});

const startCodeSchema = Joi.object({
  language: Joi.string().valid("cpp", "java", "python", "javascript").required(),
  initialCode: Joi.string().required(),
});

const referenceSolutionSchema = Joi.object({
  language: Joi.string().valid("cpp", "java", "python", "javascript").required(),
  completeCode: Joi.string().required(),
});

// Schema for admin problem creation payload
const createProblemSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.empty": "Problem title is required",
    "string.min": "Problem title must be at least 3 characters long",
  }),
  description: Joi.string().trim().required().messages({
    "string.empty": "Problem description is required",
  }),
  difficulty: Joi.string().valid("easy", "medium", "hard").lowercase().required().messages({
    "any.only": "Difficulty must be easy, medium, or hard",
    "string.empty": "Difficulty is required",
  }),
  tags: Joi.array()
    .items(
      Joi.string().valid(
        "array",
        "linkedList",
        "tree",
        "graph",
        "dp",
        "string",
        "math",
        "greedy",
        "binarySearch",
        "heap",
        "stack",
        "queue",
        "recursion",
        "backtracking",
        "hashmap",
        "twoPointers",
        "slidingWindow"
      )
    )
    .optional(),
  companyTags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  hints: Joi.array().items(Joi.string().trim()).optional(),
  editorial: Joi.string().allow("", null).optional(),
  examples: Joi.array().items(testCaseSchema).optional(),
  constraints: Joi.string().allow("", null).optional(),
  status: Joi.string().valid("draft", "published").default("published"),
  visibleTestCases: Joi.array().items(testCaseSchema).optional(),
  hiddenTestCases: Joi.array().items(testCaseSchema).optional(),
  startCode: Joi.array().items(startCodeSchema).optional(),
  referenceSolution: Joi.array().items(referenceSolutionSchema).optional(),
  isPremium: Joi.boolean().optional(),
});

// Schema for partial problem updates
const updateProblemSchema = createProblemSchema.fork(
  ["title", "description", "difficulty"],
  (schema) => schema.optional()
);

module.exports = {
  createProblemSchema,
  updateProblemSchema,
};
