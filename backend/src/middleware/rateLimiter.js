// in-memory sliding window rate limiter
const createRateLimiter = ({ windowMs = 60 * 1000, max = 10, message = "Too many requests, please try again later." }) => {
  const requests = new Map();

  // periodically drop stale entries so the map does not grow forever
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requests) {
      const valid = timestamps.filter((time) => now - time < windowMs);
      if (valid.length === 0) requests.delete(key);
      else requests.set(key, valid);
    }
  }, windowMs);
  if (typeof cleanup.unref === "function") cleanup.unref();

  return (req, res, next) => {
    const key = req.ip || req.headers["x-forwarded-for"] || "global";
    const now = Date.now();

    const timestamps = requests.get(key) || [];
    const validTimestamps = timestamps.filter((time) => now - time < windowMs);

    if (validTimestamps.length >= max) {
      const retryAfter = Math.ceil((windowMs - (now - validTimestamps[0])) / 1000);
      res.set("Retry-After", String(retryAfter));
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
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many login/register attempts from this IP. Please try again after 15 minutes.",
});

const submissionRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: "Too many code execution attempts. Please wait a minute before running code again.",
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  submissionRateLimiter,
};
