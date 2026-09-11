const mongoose = require("mongoose");

// disable buffering so queries fail fast when mongodb is down
mongoose.set("bufferCommands", false);

async function main() {
  const uri = process.env.DB_CONNECT_STRING || "mongodb://127.0.0.1:27017/codeit";
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 2000,
  });
}

module.exports = main;
