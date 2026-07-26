const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },

    lastName: {
      type: String,
      minLength: 3,
      maxLength: 20,
    },

    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      immutable: true,
    },

    age: {
      type: Number,
      min: 6,
      max: 80,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    problemSolved: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "problem",
        },
      ],
      default: [],
    },

    problemAttempts: [
      {
        problemId: {
          type: Schema.Types.ObjectId,
          ref: "Problem",
          required: true,
        },

        runAttempts: {
          type: Number,
          default: 2,
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
    ],

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);

module.exports = User;