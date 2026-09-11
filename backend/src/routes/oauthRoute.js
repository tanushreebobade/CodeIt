const express = require("express");
const oauthRouter = express.Router();
const {
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
} = require("../controllers/oauthController");

oauthRouter.get("/google", googleAuth);
oauthRouter.get("/google/callback", googleCallback);
oauthRouter.get("/github", githubAuth);
oauthRouter.get("/github/callback", githubCallback);

module.exports = oauthRouter;
