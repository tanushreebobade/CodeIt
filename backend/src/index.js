const express = require("express");
const app = express();
require("dotenv").config();
const main = require("./config/db");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/userAuth");
const redisClient = require("./config/redis");
const problemRouter = require("./routes/problemCreate");
const submissionRouter = require("./routes/submission");
const { errorHandler } = require("./middleware/errorHandler");

app.use(express.json());
app.use(cookieParser());

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submissionRouter);

// Centralized Global Error Handler
app.use(errorHandler);

const InitalizeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log("DB & Redis Connected successfully");

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log("Server listening at port number: " + port);
    });
  } catch (err) {
    console.error("Initialization Error: ", err);
  }
};

InitalizeConnection();
