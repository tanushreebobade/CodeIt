const mongoose = require("mongoose");
const env = require("./env");

// disable buffering so queries fail fast when mongodb is down
mongoose.set("bufferCommands", false);

async function main() {
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 4000,
  });
}

module.exports = main;
