// user model
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },

    lastName: {
      type: String,
      trim: true,
      maxLength: 50,
      default: "",
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
      max: 120,
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
          ref: "Problem",
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

const User = mongoose.models.User || mongoose.model("User", userSchema);
if (!mongoose.models.user) {
  mongoose.model("user", userSchema);
}

module.exports = User;