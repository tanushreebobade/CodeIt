const validator = require("validator");

const { BadRequestError } = require("../errors/AppError");

const validate = (data) => {
  const mandatoryFields = ["firstName", "emailId", "password"];

  const isAllowed = mandatoryFields.every((key) => key in data && data[key]);

  if (!isAllowed) {
    throw new BadRequestError("Missing required fields: First Name, Email, Password");
  }

  if (!validator.isEmail(data.emailId)) {
    throw new BadRequestError("Please enter a valid email address");
  }

  if (data.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  return true;
};

module.exports = validate;