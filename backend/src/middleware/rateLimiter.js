const { TooManyRequestsError } = require("../errors/AppError");

// In memory sliding window rate limiter
const createRateLimiter = ({ windowMs = 60 * 1000, max = 10, message = "Too many requests, please try again later." }) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.headers["x-forwarded-for"] || "global";
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const timestamps = requests.get(key);

    // Filter out timestamps older than windowMs
    const validTimestamps = timestamps.filter((time) => now - time < windowMs);

    if (validTimestamps.length >= max) {
      return res.status(429).json({
        success: false,
        error: "TOO_MANY_REQUESTS",
        message,
      });
    }

    validTimestamps.push(now);
    requests.set(key, validTimestamps);

    next();
  };
};

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: "Too many login/register attempts from this IP. Please try again after 15 minutes.",
});

const submissionRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: "Too many code execution attempts. Please wait a minute before running code again.",
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  submissionRateLimiter,
};
