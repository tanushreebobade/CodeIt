const Joi = require("joi");

// Schema for user signup payload
const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters long",
  }),
  lastName: Joi.string().trim().max(50).allow("", null),
  emailId: Joi.string().trim().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email address is required",
  }),
  password: Joi.string().min(8).max(100).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "string.empty": "Password is required",
  }),
  age: Joi.number().integer().min(10).max(120).optional(),
});

// Schema for user login payload
const loginSchema = Joi.object({
  emailId: Joi.string().trim().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email address is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
