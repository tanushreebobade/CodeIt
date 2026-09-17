const problemRepository = require("../../repositories/ProblemRepository");
const { executeCode } = require("../../utils/problemUtility");
const { normalizeOutput, classifyFailure } = require("../submission/SubmissionService");
const { BadRequestError, NotFoundError } = require("../../errors/AppError");

const PROBLEM_FIELDS = [
  "title",
  "description",
  "difficulty",
  "tags",
  "companyTags",
  "hints",
  "editorial",
  "examples",
  "constraints",
  "status",
  "visibleTestCases",
  "hiddenTestCases",
  "startCode",
  "referenceSolution",
  "isPremium",
];

const pickProblemFields = (data) => {
  const picked = {};
  PROBLEM_FIELDS.forEach((field) => {
    if (data[field] !== undefined) picked[field] = data[field];
  });
  if (picked.difficulty) picked.difficulty = String(picked.difficulty).toLowerCase();
  if (Array.isArray(picked.hints)) picked.hints = picked.hints.map((h) => String(h).trim()).filter(Boolean);
  if (Array.isArray(picked.startCode)) {
    picked.startCode = picked.startCode.filter((s) => s && s.language && s.initialCode && s.initialCode.trim());
  }
  if (Array.isArray(picked.referenceSolution)) {
    picked.referenceSolution = picked.referenceSolution.filter((s) => s && s.language && s.completeCode && s.completeCode.trim());
  }
  return picked;
};

class ProblemService {
  // runs every reference solution against every test case and throws on mismatch
  async verifyReferenceSolutions(referenceSolution, visibleTestCases = [], hiddenTestCases = []) {
    if (!Array.isArray(referenceSolution) || referenceSolution.length === 0) return;

    const allCases = [
      ...(visibleTestCases || []).map((tc) => ({ ...tc, kind: "visible" })),
      ...(hiddenTestCases || []).map((tc) => ({ ...tc, kind: "hidden" })),
    ];

    for (const { language, completeCode } of referenceSolution) {
      if (!completeCode || !completeCode.trim()) continue;
      for (const testCase of allCases) {
        const result = await executeCode(completeCode, language, testCase.input || "");
        const failure = classifyFailure(result);
        if (failure) {
          throw new BadRequestError(
            `Reference solution (${language}) failed with ${failure} on ${testCase.kind} test case (input: ${testCase.input}): ${result.error || result.output || ""}`.trim()
          );
        }
        if (normalizeOutput(result.output) !== normalizeOutput(testCase.output)) {
          throw new BadRequestError(
            `Reference solution (${language}) produced "${normalizeOutput(result.output)}" but expected "${normalizeOutput(testCase.output)}" on ${testCase.kind} test case (input: ${testCase.input})`
          );
        }
      }
    }
  }

  async createProblem(problemData, creatorId) {
    const data = pickProblemFields(problemData);

    if (!data.title || !data.description || !data.difficulty) {
      throw new BadRequestError("Title, description, and difficulty are required.");
    }

    await this.verifyReferenceSolutions(data.referenceSolution, data.visibleTestCases, data.hiddenTestCases);

    return await problemRepository.create({
      ...data,
      problemCreator: creatorId,
    });
  }

  async getAllProblems(queryFilters) {
    return await problemRepository.findProblemsWithFilters(queryFilters);
  }

  async getProblemById(id) {
    const problem = await problemRepository.findProblemById(id);
    if (!problem) {
      throw new NotFoundError("Problem not found");
    }
    return problem;
  }

  async updateProblem(id, updateData) {
    const existing = await problemRepository.findProblemById(id);
    if (!existing) {
      throw new NotFoundError("Problem not found");
    }

    const data = pickProblemFields(updateData);
    if (Object.keys(data).length === 0) {
      throw new BadRequestError("No updatable fields were provided.");
    }

    // verify reference solutions against the test cases that will be stored
    const visible = data.visibleTestCases ?? existing.visibleTestCases ?? [];
    const hidden = data.hiddenTestCases ?? existing.hiddenTestCases ?? [];
    if (data.referenceSolution) {
      await this.verifyReferenceSolutions(data.referenceSolution, visible, hidden);
    }

    const updated = await problemRepository.updateById(id, data);
    if (!updated) {
      throw new NotFoundError("Problem not found");
    }
    return updated;
  }

  async deleteProblem(id) {
    const deleted = await problemRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError("Problem not found");
    }
    return deleted;
  }
}

module.exports = new ProblemService();
