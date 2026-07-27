const problemRepository = require("../../repositories/ProblemRepository");
const { executeCode } = require("../../utils/problemUtility");
const { BadRequestError, NotFoundError } = require("../../errors/AppError");

class ProblemService {
  async createProblem(problemData, creatorId) {
    const {
      title,
      description,
      difficulty,
      tags,
      companyTags,
      hints,
      editorial,
      examples,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolution,
    } = problemData;

    if (!title || !description || !difficulty) {
      throw new BadRequestError("Title, description, and difficulty are required.");
    }

    // Validate reference solutions against visible and hidden test cases
    if (referenceSolution && Array.isArray(referenceSolution)) {
      for (const { language, completeCode } of referenceSolution) {
        if (visibleTestCases) {
          for (const testCase of visibleTestCases) {
            const result = await executeCode(completeCode, language, testCase.input);
            if (result.output?.trim() !== testCase.output.trim()) {
              throw new BadRequestError(`Reference solution failed on visible testcase (input: ${testCase.input})`);
            }
          }
        }

        if (hiddenTestCases) {
          for (const testCase of hiddenTestCases) {
            const result = await executeCode(completeCode, language, testCase.input);
            if (result.output?.trim() !== testCase.output.trim()) {
              throw new BadRequestError(`Reference solution failed on hidden testcase (input: ${testCase.input})`);
            }
          }
        }
      }
    }

    return await problemRepository.create({
      title,
      description,
      difficulty,
      tags,
      companyTags,
      hints,
      editorial,
      examples,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolution,
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
    const updated = await problemRepository.updateById(id, updateData);
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
