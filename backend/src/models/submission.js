const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const submissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      required: true,
      enum: ["cpp", "c", "java", "javascript", "python"],
    },

    status: {
      type: String,
      required: true,
      enum: [
        "Pending",
        "Accepted",
        "Wrong Answer",
        "Compilation Error",
        "Runtime Error",
        "Time Limit Exceeded",
      ],
      default: "Pending",
    },

    runtime: {
      type: Number,
      default: 0,
    },

    memory: {
      type: Number,
      default: 0,
    },

    errorMessage: {
      type: String,
      default: "",
    },

    testCasesPassed: {
      type: Number,
      default: 0,
    },

    totalTestCases: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ userId: 1, problemId: 1 });

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;