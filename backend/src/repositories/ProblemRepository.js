const BaseRepository = require("./BaseRepository");
const Problem = require("../models/problem");
const localDb = require("../config/localDb");

class ProblemRepository extends BaseRepository {
  constructor() {
    super(Problem, "problem");
  }

  async findProblemById(id) {
    return await this.findById(id);
  }

  async findProblemsWithFilters({ difficulty, tags, companyTags, search, page = 1, limit = 10 }) {
    if (this.isMongoConnected()) {
      try {
        const filter = { status: "published" };
        if (difficulty) filter.difficulty = difficulty.toLowerCase();
        if (tags) {
          const tagArray = typeof tags === "string" ? tags.split(",") : tags;
          filter.tags = { $in: tagArray };
        }
        if (companyTags) {
          const companyArray = typeof companyTags === "string"
            ? companyTags.split(",").map((c) => c.trim().toLowerCase())
            : companyTags;
          filter.companyTags = { $in: companyArray };
        }
        if (search) filter.title = { $regex: search, $options: "i" };

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 10);
        const skip = (pageNum - 1) * limitNum;

        const total = await this.count(filter);
        const problems = await this.model
          .find(filter)
          .select("_id title difficulty tags companyTags acceptedCount submissionCount isPremium createdAt")
          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 });

        return {
          problems,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        };
      } catch (err) {
        console.warn("Mongo findProblemsWithFilters failed, using localDb:", err.message);
      }
    }

    let problems = localDb.getProblems();
    if (difficulty && difficulty !== "all") {
      problems = problems.filter((p) => p.difficulty?.toLowerCase() === difficulty.toLowerCase());
    }
    if (tags && tags !== "All") {
      problems = problems.filter((p) => p.tags?.some((t) => t.toLowerCase() === tags.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      problems = problems.filter((p) => p.title?.toLowerCase().includes(q));
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;
    const paginated = problems.slice(skip, skip + limitNum);

    return {
      problems: paginated,
      total: problems.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(problems.length / limitNum) || 1,
    };
  }

  async incrementSubmissionCount(id, isAccepted = false) {
    if (this.isMongoConnected()) {
      try {
        const inc = { submissionCount: 1 };
        if (isAccepted) inc.acceptedCount = 1;
        return await this.model.findByIdAndUpdate(
          id,
          { $inc: inc },
          { returnDocument: "after" }
        );
      } catch (err) {
        console.warn("Mongo incrementSubmissionCount failed:", err.message);
      }
    }
    const prob = localDb.findProblemById(id);
    if (prob) {
      prob.submissionCount = (prob.submissionCount || 0) + 1;
      if (isAccepted) prob.acceptedCount = (prob.acceptedCount || 0) + 1;
    }
    return prob;
  }
}

module.exports = new ProblemRepository();
