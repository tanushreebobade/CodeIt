// Base class for all application specific errors
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
//Client-side error
class BadRequestError extends AppError {
  constructor(message = "Bad Request", details = null) {
    super(message, 400, details);
  }
}
// Authentication required
class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized Access", details = null) {
    super(message, 401, details);
  }
}
// User doesn't have permission to perform the action
class ForbiddenError extends AppError {
  constructor(message = "Forbidden Access", details = null) {
    super(message, 403, details);
  }
}
// Requested resource doesn't exist
class NotFoundError extends AppError {
  constructor(message = "Resource Not Found", details = null) {
    super(message, 404, details);
  }
}

// Resource already exists or conflicts with current state
class ConflictError extends AppError {
  constructor(message = "Resource Conflict", details = null) {
    super(message, 409, details);
  }
}
// Unexpected server-side error
class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", details = null) {
    super(message, 500, details);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
