const env = require("../config/env");
const { asyncHandler } = require("../middleware/errorHandler");
const { AppError, BadRequestError } = require("../errors/AppError");

// models tried in order when the configured one is unavailable for this api key
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];
const MAX_HISTORY = 30;
const MAX_MESSAGE_CHARS = 8000;

let genAiClient = null;
const getClient = () => {
  if (!genAiClient) {
    const { GoogleGenAI } = require("@google/genai");
    genAiClient = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }
  return genAiClient;
};

// accepts either gemini-style {role, parts:[{text}]} or simple {role, text} messages
const normalizeMessages = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new BadRequestError("messages must be a non-empty array");
  }
  const normalized = messages
    .map((msg) => {
      const role = msg.role === "user" ? "user" : "model";
      let text = "";
      if (Array.isArray(msg.parts)) {
        text = msg.parts.map((p) => (p && typeof p.text === "string" ? p.text : "")).join("\n");
      } else if (typeof msg.text === "string") {
        text = msg.text;
      } else if (typeof msg.content === "string") {
        text = msg.content;
      }
      text = text.trim().slice(0, MAX_MESSAGE_CHARS);
      return text ? { role, parts: [{ text }] } : null;
    })
    .filter(Boolean)
    .slice(-MAX_HISTORY);

  // gemini requires the conversation to start with a user turn
  while (normalized.length && normalized[0].role !== "user") normalized.shift();
  if (normalized.length === 0) {
    throw new BadRequestError("At least one user message is required");
  }
  return normalized;
};

const isModelNotFound = (err) => {
  const message = String(err?.message || "").toLowerCase();
  return err?.status === 404 || message.includes("not found") || message.includes("is not supported");
};

const solveDoubt = asyncHandler(async (req, res) => {
  const { messages, title, description, testCases, startCode, userCurrentCode, language } = req.body;

  if (!env.geminiApiKey) {
    throw new AppError("The AI Tutor is not configured on this server (missing GEMINI_API_KEY).", 503);
  }

  const contents = normalizeMessages(messages);

  const systemInstruction = `
You are an expert Data Structures and Algorithms (DSA) tutor helping users solve coding problems on CodeIt. Your role is strictly limited to DSA-related assistance.

## CURRENT PROBLEM CONTEXT
[PROBLEM_TITLE]: ${title || "N/A"}
[PROBLEM_DESCRIPTION]: ${description || "N/A"}
[EXAMPLES]: ${JSON.stringify(testCases || [])}
[STARTER_CODE]: ${JSON.stringify(startCode || [])}
[USER_LANGUAGE]: ${language || "unknown"}
[USER_CURRENT_CODE]:
${userCurrentCode ? String(userCurrentCode).slice(0, 6000) : "(empty)"}

## YOUR CAPABILITIES
1. Hint Provider: give step-by-step hints without revealing the complete solution immediately
2. Code Reviewer: debug and fix code submissions with detailed explanations
3. Solution Guide: provide optimal solutions with detailed explanations when explicitly requested
4. Complexity Analyzer: explain time and space complexity trade-offs
5. Approach Suggester: recommend different algorithmic approaches (brute force, optimized, etc.)
6. Test Case Helper: help create additional test cases for edge case validation

## INTERACTION GUIDELINES
- Respond in clear markdown with code blocks where appropriate.
- Keep explanations structured, concise and easy to digest.
- Always restrict responses strictly to the current DSA problem.
- If asked about non-DSA topics, politely refuse and redirect the user back to the problem.
`;

  const ai = getClient();
  const modelsToTry = [env.geminiModel, ...FALLBACK_MODELS.filter((m) => m !== env.geminiModel)];

  let lastError = null;
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction },
      });
      const text = typeof response.text === "function" ? response.text() : response.text;
      if (!text) throw new Error("Empty response from model");
      return res.status(200).json({ success: true, model, message: text });
    } catch (err) {
      lastError = err;
      if (!isModelNotFound(err)) break;
      console.warn(`Gemini model "${model}" unavailable, trying next fallback:`, err.message);
    }
  }

  const status = lastError?.status || lastError?.response?.status;
  if (status === 429) {
    throw new AppError("The AI Tutor is rate limited right now. Please try again in a minute.", 429);
  }
  if (status === 400 || status === 401 || status === 403) {
    throw new AppError("The AI Tutor rejected the request. Check that GEMINI_API_KEY is valid.", 502);
  }
  console.error("Gemini error:", lastError?.message || lastError);
  throw new AppError("The AI Tutor is temporarily unavailable. Please try again shortly.", 502);
});

module.exports = solveDoubt;
