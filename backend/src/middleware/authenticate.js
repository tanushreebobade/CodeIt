const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userRepository = require("../repositories/UserRepository");
const redisClient = require("../config/redis");
const { UnauthorizedError, ForbiddenError } = require("../errors/AppError");

// extracts the access token from the cookie or the Authorization header
const getTokenFromRequest = (req) => {
  if (req.cookies && req.cookies.token) return req.cookies.token;
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return null;
};

const isTokenRevoked = async (token) => {
  try {
    if (redisClient && redisClient.isOpen) {
      const isBlocked = await redisClient.exists(`token:${token}`);
      return Boolean(isBlocked);
    }
  } catch (err) {
    // redis is optional; never block the request because of it
  }
  return false;
};

// verifies the jwt, loads the user and attaches it as req.result
const authenticate = async (req) => {
  const token = getTokenFromRequest(req);
  if (!token) throw new UnauthorizedError("Please sign in to continue");

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new UnauthorizedError("Session expired. Please sign in again");
    }
    throw new UnauthorizedError("Invalid authentication token");
  }

  if (!payload || !payload._id || payload.type === "refresh") {
    throw new UnauthorizedError("Invalid authentication token");
  }

  if (await isTokenRevoked(token)) {
    throw new UnauthorizedError("Session has been signed out");
  }

  const user = await userRepository.findUserById(payload._id);
  if (!user) throw new UnauthorizedError("User account no longer exists");

  return user;
};

const userMiddleware = async (req, res, next) => {
  try {
    req.result = await authenticate(req);
    next();
  } catch (err) {
    next(err);
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await authenticate(req);
    if (user.role !== "admin") {
      throw new ForbiddenError("Admin access required");
    }
    req.result = user;
    next();
  } catch (err) {
    next(err);
  }
};

// attaches the user when a valid token is present, but never rejects the request
const optionalAuth = async (req, res, next) => {
  try {
    if (getTokenFromRequest(req)) {
      req.result = await authenticate(req);
    }
  } catch (err) {
    req.result = undefined;
  }
  next();
};

module.exports = { userMiddleware, adminMiddleware, optionalAuth, authenticate };
