const BaseRepository = require("./BaseRepository");
const Submission = require("../models/submission");

class SubmissionRepository extends BaseRepository {
  constructor() {
    super(Submission);
  }

  async createSubmission(submissionData) {
    return await this.create(submissionData);
  }

  async getSubmissionsByUserAndProblem(userId, problemId) {
    return await this.find(
      { userId, problemId },
      null,
      { sort: { createdAt: -1 } }
    );
  }

  async getSubmissionsByUser(userId) {
    return await this.find(
      { userId },
      null,
      { sort: { createdAt: -1 } }
    );
  }

  async getUserSubmissionsPaginated(userId, { problemId, status, page = 1, limit = 10 }) {
    const filter = { userId };

    if (problemId) {
      filter.problemId = problemId;
    }

    if (status) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await this.count(filter);
    const submissions = await this.model
      .find(filter)
      .populate("problemId", "title difficulty")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return {
      submissions,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async getSubmissionWithDetails(submissionId, userId) {
    return await this.model
      .findOne({ _id: submissionId, userId })
      .populate("problemId", "title difficulty description tags");
  }

  async getSubmissionStatsByUser(userId) {
    const totalSubmissions = await this.count({ userId });
    const acceptedSubmissions = await this.count({ userId, status: "Accepted" });

    return {
      totalSubmissions,
      acceptedSubmissions,
      accuracyRate: totalSubmissions > 0 
        ? Math.round((acceptedSubmissions / totalSubmissions) * 100) 
        : 0,
    };
  }
}

module.exports = new SubmissionRepository();
