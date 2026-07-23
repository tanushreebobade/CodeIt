const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");

// Register User
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

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

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

//login user
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

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    // Set cookie
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

    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.send("Logged Out Succesfully");
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

// Admin Register
const adminRegister = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, emailId, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    //

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

module.exports = {
  register,
  login,
  logout,
  adminRegister,
};
