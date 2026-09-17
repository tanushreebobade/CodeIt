// usage: node scripts/createAdmin.js <email> <password> [firstName]
// creates (or promotes) an admin account in the configured database
const path = require("path");
process.chdir(path.join(__dirname, ".."));
const env = require("../src/config/env");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const connectDatabase = require("../src/config/db");
const userRepository = require("../src/repositories/UserRepository");

async function main() {
  const [email, password, firstName = "Admin"] = process.argv.slice(2);
  if (!email || !password) {
    console.error("usage: node scripts/createAdmin.js <email> <password> [firstName]");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("password must be at least 8 characters");
    process.exit(1);
  }

  try {
    await connectDatabase();
    console.log(`connected to ${env.mongoUri}`);
  } catch (err) {
    console.warn("mongodb unavailable, using local json store:", err.message);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await userRepository.findUserByEmail(normalizedEmail);
  if (existing) {
    await userRepository.updateById(existing._id, { role: "admin" });
    console.log(`promoted ${normalizedEmail} to admin`);
  } else {
    await userRepository.create({
      firstName,
      lastName: "",
      emailId: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: "admin",
    });
    console.log(`created admin ${normalizedEmail}`);
  }
  await mongoose.disconnect().catch(() => {});
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
