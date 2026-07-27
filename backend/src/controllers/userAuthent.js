const User = require("../models/user");
const userRepository = require("../repositories/UserRepository");
const submissionRepository = require("../repositories/SubmissionRepository");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");

// Register user
const register = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, emailId, password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "user";

    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: "user" },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 },
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Registration successful",
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) {
      throw new Error("Invalid Credentials");
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("Invalid Credentials");
    }

    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 },
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login Successfully",
    });
  } catch (err) {
    res.status(401).send("Error: " + err.message);
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    const payload = jwt.decode(token);

    // Blacklist token in Redis until it expires
    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.send("Logged Out Succesfully");
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

// Admin register
const adminRegister = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, emailId, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...req.body,
      role: "admin",
    });

    const token = jwt.sign(
      {
        _id: user._id,
        emailId: user.emailId,
        role: user.role,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
    res.status(201).send("User Registered Successfully");
  } catch (err) {
    res.status(400).send("Error: " + err);
  }
};

// Get user profile & statistics
const getProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await userRepository.getUserProfileWithStats(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const stats = await submissionRepository.getSubmissionStatsByUser(userId);

    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    if (user.problemSolved && Array.isArray(user.problemSolved)) {
      user.problemSolved.forEach((problem) => {
        if (problem.difficulty && difficultyCounts[problem.difficulty] !== undefined) {
          difficultyCounts[problem.difficulty]++;
        }
      });
    }

    return res.status(200).json({
      success: true,
      user,
      stats: {
        ...stats,
        totalSolved: user.problemSolved.length,
        difficultyCounts,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: err.message,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  adminRegister,
  getProfile,
};
