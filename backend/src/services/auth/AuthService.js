const userRepository = require("../../repositories/UserRepository");
const validate = require("../../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../../config/redis");
const { BadRequestError, UnauthorizedError } = require("../../errors/AppError");

class AuthService {
  generateTokens(user) {
    const payload = {
      _id: user._id,
      emailId: user.emailId,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_KEY, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { _id: user._id, type: "refresh" },
      process.env.JWT_KEY,
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  }

  async registerUser(userData) {
    validate(userData);
    const { firstName, emailId, password } = userData;

    const existingUser = await userRepository.findUserByEmail(emailId);
    if (existingUser) {
      throw new BadRequestError("User with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      ...userData,
      password: hashedPassword,
      role: "user",
    });

    const tokens = this.generateTokens(user);
    return { user, ...tokens };
  }

  async registerAdmin(adminData) {
    validate(adminData);
    const { emailId, password } = adminData;

    const existingUser = await userRepository.findUserByEmail(emailId);
    if (existingUser) {
      throw new BadRequestError("User with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      ...adminData,
      password: hashedPassword,
      role: "admin",
    });

    const tokens = this.generateTokens(user);
    return { user, ...tokens };
  }

  async loginUser(emailId, password) {
    if (!emailId || !password) {
      throw new BadRequestError("Email and password are required.");
    }

    const user = await userRepository.findUserByEmail(emailId);
    if (!user) {
      throw new BadRequestError("User does not exist with this email. Please sign up.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestError("Invalid password. Please try again.");
    }

    const tokens = this.generateTokens(user);
    return { user, ...tokens };
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh Token is required");
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_KEY);
      if (decoded.type !== "refresh") {
        throw new UnauthorizedError("Invalid Refresh Token type");
      }

      const user = await userRepository.findUserById(decoded._id);
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      const newAccessToken = jwt.sign(
        { _id: user._id, emailId: user.emailId, role: user.role },
        process.env.JWT_KEY,
        { expiresIn: "15m" }
      );

      return { accessToken: newAccessToken };
    } catch (err) {
      throw new UnauthorizedError("Invalid or expired Refresh Token");
    }
  }

  async logoutUser(token) {
    if (!token) return;
    try {
      const payload = jwt.decode(token);
      if (payload && payload.exp) {
        await redisClient.set(`token:${token}`, "Blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp);
      }
    } catch (err) {
      console.error("Logout blacklist error:", err.message);
    }
  }
}

module.exports = new AuthService();
