const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/UserRepository");
const redisClient = require("../config/redis");

const adminMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error("Token is missing");

    const payload = jwt.verify(token, process.env.JWT_KEY);
    const { _id } = payload;

    if (!_id) {
      throw new Error("Invalid token");
    }

    // verify user has admin role
    if (payload.role !== "admin") {
      throw new Error("Admin access required");
    }

    const result = await userRepository.findUserById(_id);
    if (!result) {
      throw new Error("User does not exist");
    }

    try {
      if (redisClient && redisClient.isOpen) {
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) throw new Error("Token has been revoked");
      }
    } catch (redisErr) {
      if (redisErr.message === "Token has been revoked") throw redisErr;
    }

    // attach admin user context
    req.result = result;
    next();
  } catch (err) {
    res.status(401).send("Error: " + err.message);
  }
};

module.exports = adminMiddleware;
