const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    tags: [
      {
        type: String,
        enum: [
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
          "slidingWindow",
        ],
      },
    ],

    constraints: {
      type: String,
      default: "",
    },

    visibleTestCases: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
          default: "",
        },
      },
    ],

    hiddenTestCases: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
      },
    ],

    startCode: [
      {
        language: {
          type: String,
          enum: ["cpp", "java", "python", "javascript"],
          required: true,
        },
        initialCode: {
          type: String,
          required: true,
        },
      },
    ],

    referenceSolution: [
      {
        language: {
          type: String,
          enum: ["cpp", "java", "python", "javascript"],
          required: true,
        },
        completeCode: {
          type: String,
          required: true,
        },
      },
    ],

    problemCreator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    acceptedCount: {
      type: Number,
      default: 0,
    },

    submissionCount: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Problem = mongoose.model("problem", problemSchema);

module.exports = Problem;
