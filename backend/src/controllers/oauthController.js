const axios = require("axios");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const env = require("../config/env");
const userRepository = require("../repositories/UserRepository");
const authService = require("../services/auth/AuthService");
const { setAuthCookies } = require("../utils/cookies");

// sanitize name to fit user schema constraints
function sanitizeName(str, defaultVal = "Coder") {
  if (!str || typeof str !== "string") return defaultVal;
  const cleaned = str.trim().replace(/[^a-zA-Z0-9_\s-]/g, "");
  if (cleaned.length < 3) {
    return (cleaned + defaultVal).slice(0, 20);
  }
  return cleaned.slice(0, 20);
}

// helper: get frontend URL from env
function getFrontendUrl() {
  return env.frontendUrl;
}

// default callback urls point at this backend when not configured explicitly
function getCallbackUrl(provider) {
  const configured = provider === "google" ? env.google.callbackUrl : env.github.callbackUrl;
  if (configured) return configured;
  return `http://localhost:${env.port}/auth/${provider}/callback`;
}

function stateCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    path: "/",
  };
}

const googleAuth = (req, res) => {
  const clientId = env.google.clientId;
  const redirectUri = getCallbackUrl("google");
  const frontendUrl = getFrontendUrl();

  if (!clientId || !env.google.clientSecret) {
    console.warn("Google OAuth Warning: GOOGLE_CLIENT_ID is missing in backend .env");
    return res.redirect(`${frontendUrl}/login?error=` + encodeURIComponent("Google Login is currently unavailable. Please sign in using Email & Password."));
  }

  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("oauth_state", state, stateCookieOptions());

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent("openid profile email")}` +
    `&state=${encodeURIComponent(state)}` +
    `&prompt=select_account`;

  return res.redirect(googleAuthUrl);
};

const googleCallback = async (req, res) => {
  const { code, state, error } = req.query;
  const savedState = req.cookies?.oauth_state;
  const frontendUrl = getFrontendUrl();
  res.clearCookie("oauth_state");

  if (error) {
    return res.redirect(`${frontendUrl}/login?error=` + encodeURIComponent(`Google Auth Error: ${error}`));
  }

  if (!state || state !== savedState) {
    return res.redirect(`${frontendUrl}/login?error=` + encodeURIComponent("Invalid OAuth state parameter."));
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=` + encodeURIComponent("Authorization code missing from Google response."));
  }

  try {
    const redirectUri = getCallbackUrl("google");

    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: env.google.clientId,
      client_secret: env.google.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { email, given_name, family_name, name } = userRes.data;

    if (!email) {
      return res.redirect(`${frontendUrl}/login?error=` + encodeURIComponent("Could not retrieve email from Google profile."));
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await userRepository.findUserByEmail(normalizedEmail);
    if (!user) {
      const rawFirstName = given_name || (name ? name.split(" ")[0] : "GoogleUser");
      const rawLastName = family_name || (name && name.split(" ").length > 1 ? name.split(" ").slice(1).join(" ") : "Coder");

      const randomPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
      user = await userRepository.create({
        firstName: sanitizeName(rawFirstName, "Google"),
        lastName: sanitizeName(rawLastName, "Coder"),
        emailId: normalizedEmail,
        password: randomPassword,
        role: "user",
      });
    }

    const { accessToken: jwtAccessToken, refreshToken: jwtRefreshToken } = authService.generateTokens(user);

    setAuthCookies(res, { accessToken: jwtAccessToken, refreshToken: jwtRefreshToken });

    return res.redirect(`${frontendUrl}/`);
  } catch (err) {
    console.error("Google OAuth Error:", err.response?.data || err.message);
    const errMsg = err.response?.data?.error_description || err.message || "Google authentication failed";
    return res.redirect(`${frontendUrl}/login?error=` + encodeURIComponent(errMsg));
  }
};

const githubAuth = (req, res) => {
  const clientId = env.github.clientId;
  const redirectUri = getCallbackUrl("github");
  const frontendUrl = getFrontendUrl();

  if (!clientId || !env.github.clientSecret) {
    console.warn("GitHub OAuth Warning: GITHUB_CLIENT_ID is missing in backend .env");
    return res.redirect(`${frontendUrl}/login?error=` + encodeURIComponent("GitHub Login is currently unavailable. Please sign in using Email & Password."));
  }

  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("oauth_state", state, stateCookieOptions());

  const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent("user:email read:user")}` +
    `&state=${encodeURIComponent(state)}`;

  return res.redirect(githubAuthUrl);
};

const githubCallback = async (req, res) => {
  const { code, state, error } = req.query;
  const savedState = req.cookies?.oauth_state;
  const frontendUrl = getFrontendUrl();
  res.clearCookie("oauth_state");

  if (error) {
    return res.redirect(`${frontendUrl}/login?error=` + encodeURIComponent(`GitHub Auth Error: ${error}`));
  }

  if (!state || state !== savedState) {
    return res.redirect(`${frontendUrl}/login?error=` + encodeURIComponent("Invalid OAuth state parameter."));
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=` + encodeURIComponent("Authorization code missing from GitHub response."));
  }

  try {
    const redirectUri = getCallbackUrl("github");

    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: env.github.clientId,
        client_secret: env.github.clientSecret,
        code,
        redirect_uri: redirectUri,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      return res.redirect(`${frontendUrl}/login?error=` + encodeURIComponent(tokenRes.data.error_description || "Failed to obtain access token from GitHub."));
    }

    const profileRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "CodeIt-App",
      },
    });

    const profile = profileRes.data;
    let email = profile.email;

    // fetch secondary emails if primary email is private
    if (!email) {
      try {
        const emailsRes = await axios.get("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "CodeIt-App",
          },
        });

        if (Array.isArray(emailsRes.data) && emailsRes.data.length > 0) {
          const primaryEmail = emailsRes.data.find((e) => e.primary && e.verified);
          email = primaryEmail ? primaryEmail.email : emailsRes.data[0].email;
        }
      } catch (e) {
        console.warn("Could not fetch GitHub secondary emails:", e.message);
      }
    }

    if (!email) {
      email = `${profile.login}@users.noreply.github.com`;
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await userRepository.findUserByEmail(normalizedEmail);
    if (!user) {
      const rawFirstName = (profile.name ? profile.name.split(" ")[0] : profile.login) || "GitHubUser";
      const rawLastName = profile.name && profile.name.split(" ").length > 1 ? profile.name.split(" ").slice(1).join(" ") : "Coder";

      const randomPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
      user = await userRepository.create({
        firstName: sanitizeName(rawFirstName, "GitHub"),
        lastName: sanitizeName(rawLastName, "Coder"),
        emailId: normalizedEmail,
        password: randomPassword,
        role: "user",
      });
    }

    const { accessToken: jwtAccessToken, refreshToken: jwtRefreshToken } = authService.generateTokens(user);

    setAuthCookies(res, { accessToken: jwtAccessToken, refreshToken: jwtRefreshToken });

    return res.redirect(`${frontendUrl}/`);
  } catch (err) {
    console.error("GitHub OAuth Error:", err.response?.data || err.message);
    const errMsg = err.response?.data?.error_description || err.message || "GitHub authentication failed";
    return res.redirect(`${frontendUrl}/login?error=` + encodeURIComponent(errMsg));
  }
};

module.exports = {
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
};
