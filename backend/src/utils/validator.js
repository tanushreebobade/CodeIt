const validator = require("validator");

const validate = (data) => {
    const mandatoryFields = ["firstName", "emailId", "password"];

    const isAllowed = mandatoryFields.every((key) => key in data);

    if (!isAllowed) {
        throw new Error("Missing required fields: firstName, emailId, password");
    }

    if (!validator.isEmail(data.emailId)) {
        throw new Error("Invalid email format");
    }

    if (
        !validator.isStrongPassword(data.password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
    ) {
        throw new Error(
            "Password is too weak. Use at least 8 characters with uppercase, lowercase, number and symbol"
        );
    }

    return true;
};

module.exports = validate;