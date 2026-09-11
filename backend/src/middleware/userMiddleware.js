const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/UserRepository");
const redisClient = require("../config/redis");

const userMiddleware = async (req, res, next) => {
  try {
    // get jwt token from cookie
    const { token } = req.cookies;
    if (!token) throw new Error("Token is missing");

    const payload = jwt.verify(token, process.env.JWT_KEY);
    const { _id } = payload;

    if (!_id) {
      throw new Error("Invalid token");
    }

    const result = await userRepository.findUserById(_id);
    if (!result) {
      throw new Error("User does not exist");
    }

    // check if token was revoked in redis
    try {
      if (redisClient && redisClient.isOpen) {
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) throw new Error("Token has been revoked");
      }
    } catch (redisErr) {
      if (redisErr.message === "Token has been revoked") throw redisErr;
    }

    // attach user context to request
    req.result = result;
    next();
  } catch (err) {
    res.status(401).send("Error: " + err.message);
  }
};

module.exports = userMiddleware;
