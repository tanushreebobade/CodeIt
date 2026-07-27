const BaseRepository = require("./BaseRepository");
const Problem = require("../models/problem");

class ProblemRepository extends BaseRepository {
  constructor() {
    super(Problem);
  }

  async findProblemById(id) {
    return await this.findById(id);
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
