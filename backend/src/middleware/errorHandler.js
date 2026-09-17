const env = require("../config/env");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = err.details || null;

  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = "Validation Error";
    details = Object.values(err.errors).map((e) => e.message);
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for field: ${field}`;
  }

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Malformed JSON in request body";
  }

  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large";
  }

  if (err.message && err.message.includes("buffering timed out")) {
    statusCode = 503;
    message = "Database is currently connecting. Please try again in a moment.";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired";
  }

  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${statusCode}: ${message}`);
    console.error(err);
  } else if (!env.isProduction) {
    console.warn(`[WARN] ${req.method} ${req.originalUrl} - ${statusCode}: ${message}`);
  }

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(!env.isProduction && statusCode >= 500 && { stack: err.stack }),
  });
};

// json 404 for unknown api routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

// wraps async controller functions to forward errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
