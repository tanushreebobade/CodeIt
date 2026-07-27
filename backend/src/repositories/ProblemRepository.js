const BaseRepository = require("./BaseRepository");
const Problem = require("../models/problem");

class ProblemRepository extends BaseRepository {
  constructor() {
    super(Problem);
  }

  async findProblemById(id) {
    return await this.findById(id);
  }

  async findProblemsWithFilters({ difficulty, tags, search, page = 1, limit = 10 }) {
    const filter = {};

    if (difficulty) {
      filter.difficulty = difficulty.toLowerCase();
    }

    if (tags) {
      const tagArray = typeof tags === "string" ? tags.split(",") : tags;
      filter.tags = { $in: tagArray };
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await this.count(filter);
    const problems = await this.model
      .find(filter)
      .select("_id title difficulty tags acceptedCount submissionCount isPremium createdAt")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    return {
      problems,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async incrementSubmissionCount(id, isAccepted = false) {
    // Only bump accepted count when the submission passes all tests
    const inc = { submissionCount: 1 };
    if (isAccepted) {
      inc.acceptedCount = 1;
    }
    return await this.model.findByIdAndUpdate(
      id,
      { $inc: inc },
      { returnDocument: "after" }
    );
  }
}

module.exports = new ProblemRepository();
