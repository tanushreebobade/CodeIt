const env = require("../../config/env");
const userRepository = require("../../repositories/UserRepository");
const validate = require("../../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../../config/redis");
const { BadRequestError, UnauthorizedError, ConflictError } = require("../../errors/AppError");

const BCRYPT_ROUNDS = 10;

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      env.jwtSecret,
      { expiresIn: env.accessTokenTtl }
    );
  }

  generateTokens(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = jwt.sign(
      { _id: user._id, type: "refresh" },
      env.jwtSecret,
      { expiresIn: env.refreshTokenTtl }
    );

    return { accessToken, refreshToken };
  }

  async createAccount(userData, role) {
    validate(userData);
    const { emailId, password } = userData;
    const normalizedEmail = emailId.trim().toLowerCase();

    const existingUser = await userRepository.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError("An account with this email already exists. Please sign in.");
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await userRepository.create({
      ...userData,
      emailId: normalizedEmail,
      password: hashedPassword,
      role,
    });

    const tokens = this.generateTokens(user);
    return { user, ...tokens };
  }

  async registerUser(userData) {
    return this.createAccount(userData, "user");
  }

  async registerAdmin(adminData) {
    return this.createAccount(adminData, "admin");
  }

  async loginUser(emailId, password) {
    if (!emailId || !password) {
      throw new BadRequestError("Email and password are required.");
    }

    const normalizedEmail = emailId.trim().toLowerCase();
    const user = await userRepository.findUserByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedError("No account found with this email. Please sign up.");
    }

    let isMatch = false;
    if (user.password && (user.password.startsWith("$2b$") || user.password.startsWith("$2a$"))) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // legacy plain-text password: verify and upgrade to a bcrypt hash
      isMatch = user.password === password;
      if (isMatch) {
        const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await userRepository.updateById(user._id, { password: hashed });
      }
    }

    if (!isMatch) {
      throw new UnauthorizedError("Incorrect password. Please try again.");
    }

    const tokens = this.generateTokens(user);
    return { user, ...tokens };
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.jwtSecret);
    } catch (err) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    if (decoded.type !== "refresh") {
      throw new UnauthorizedError("Invalid refresh token type");
    }

    const user = await userRepository.findUserById(decoded._id);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return { accessToken: this.generateAccessToken(user), user };
  }

  async logoutUser(token) {
    if (!token) return;
    try {
      if (redisClient && redisClient.isOpen) {
        const payload = jwt.decode(token);
        if (payload && payload.exp) {
          await redisClient.set(`token:${token}`, "Blocked");
          await redisClient.expireAt(`token:${token}`, payload.exp);
        }
      }
    } catch (err) {
      console.error("Logout blacklist error:", err.message);
    }
  }
}

module.exports = new AuthService();
