const BaseRepository = require("./BaseRepository");
const Submission = require("../models/submission");
const localDb = require("../config/localDb");

class SubmissionRepository extends BaseRepository {
  constructor() {
    super(Submission, "submission");
  }

  async createSubmission(submissionData) {
    return await this.create(submissionData);
  }

  async getSubmissionsByUserAndProblem(userId, problemId) {
    if (this.isMongoConnected() && this.isValidObjectId(userId) && this.isValidObjectId(problemId)) {
      try {
        return await this.model.find({ userId, problemId }).sort({ createdAt: -1 }).limit(50);
      } catch (err) {
        console.warn("Mongo getSubmissionsByUserAndProblem failed, using localDb:", err.message);
      }
    }
    return localDb
      .getSubmissions()
      .filter((s) => String(s.userId) === String(userId) && String(s.problemId) === String(problemId));
  }

  async getSubmissionsByUser(userId) {
    return await this.find({ userId });
  }

  async getUserSubmissionsPaginated(userId, { problemId, status, page = 1, limit = 10 }) {
    if (this.isMongoConnected() && this.isValidObjectId(userId) && (!problemId || this.isValidObjectId(problemId))) {
      try {
        const filter = { userId };
        if (problemId) filter.problemId = problemId;
        if (status) filter.status = status;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
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
          totalPages: Math.ceil(total / limitNum) || 1,
        };
      } catch (err) {
        console.warn("Mongo getUserSubmissionsPaginated failed, using localDb:", err.message);
      }
    }

    let subs = localDb.getSubmissions().filter((s) => String(s.userId) === String(userId));
    if (problemId) subs = subs.filter((s) => String(s.problemId) === String(problemId));
    if (status) subs = subs.filter((s) => s.status === status);

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;
    const paginated = subs.slice(skip, skip + limitNum);

    return {
      submissions: paginated,
      total: subs.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(subs.length / limitNum) || 1,
    };
  }

  async getSubmissionWithDetails(submissionId, userId) {
    if (this.isMongoConnected() && this.isValidObjectId(submissionId) && this.isValidObjectId(userId)) {
      try {
        return await this.model
          .findOne({ _id: submissionId, userId })
          .populate("problemId", "title difficulty description tags");
      } catch (err) {
        console.warn("Mongo getSubmissionWithDetails failed, using localDb:", err.message);
      }
    }
    const subs = localDb.getSubmissions();
    return subs.find((s) => String(s._id) === String(submissionId) && String(s.userId) === String(userId)) || null;
  }

  async deleteByUser(userId) {
    if (this.isMongoConnected() && this.isValidObjectId(userId)) {
      try {
        return await this.model.deleteMany({ userId });
      } catch (err) {
        console.warn("Mongo deleteByUser failed:", err.message);
      }
    }
    return null;
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
