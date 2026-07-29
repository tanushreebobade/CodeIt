const { GoogleGenAI } = require("@google/genai");
const { asyncHandler } = require("../middleware/errorHandler");
const { AppError } = require("../errors/AppError");

const solveDoubt = asyncHandler(async (req, res) => {
  const { messages, title, description, testCases, startCode } = req.body;

  if (!process.env.GEMINI_KEY) {
    throw new AppError('Gemini API key is not configured on the server', 500);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: messages,
    config: {
      systemInstruction: `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems on CodeIt. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title || 'N/A'}
[PROBLEM_DESCRIPTION]: ${description || 'N/A'}
[EXAMPLES]: ${JSON.stringify(testCases || [])}
[startCode]: ${JSON.stringify(startCode || [])}

## YOUR CAPABILITIES:
1. **Hint Provider**: Give step-by-step hints without revealing the complete solution immediately
2. **Code Reviewer**: Debug and fix code submissions with detailed explanations
3. **Solution Guide**: Provide optimal solutions with detailed explanations when requested
4. **Complexity Analyzer**: Explain time and space complexity trade-offs
5. **Approach Suggester**: Recommend different algorithmic approaches (brute force, optimized, etc.)
6. **Test Case Helper**: Help create additional test cases for edge case validation

## INTERACTION GUIDELINES:
- Respond in clear, markdown-formatted text with code blocks where appropriate.
- Keep explanations structured and easy to digest.
- ALWAYS restrict your responses strictly to the context of the current DSA problem.
- If asked about non-DSA topics, politely refuse and redirect the user back to the problem.
`
    },
  });

  res.status(200).json({
    success: true,
    message: response.text
  });
});

module.exports = solveDoubt;
