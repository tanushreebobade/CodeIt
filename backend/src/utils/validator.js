const validator = require("validator");

const validate = (data) => {
  const mandatoryFields = ["firstName", "emailId", "password"];

  const isAllowed = mandatoryFields.every((key) => key in data && data[key]);

  if (!isAllowed) {
    throw new Error("Missing required fields: First Name, Email, Password");
  }

  if (!validator.isEmail(data.emailId)) {
    throw new Error("Please enter a valid email address");
  }

  if (data.password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  return true;
};

module.exports = validate;