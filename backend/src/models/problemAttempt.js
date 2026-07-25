const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemAttemptSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    problemId: {
      type: Schema.Types.ObjectId,
      ref: "problem",
      required: true,
    },

    runAttempts: {
      type: Number,
      default: 5,
    },

    submitAttempts: {
      type: Number,
      default: 1,
    },

    solved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

problemAttemptSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model("ProblemAttempt", problemAttemptSchema);