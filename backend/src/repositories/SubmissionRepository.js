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
}

module.exports = new SubmissionRepository();
