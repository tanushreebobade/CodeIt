const { BadRequestError } = require("../errors/AppError");

// Validate request payload against Joi schema
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    if (!schema) return next();

    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join("; ");
      return next(new BadRequestError(`Validation Error: ${errorMessage}`, error.details));
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
