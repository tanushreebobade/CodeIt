const BaseRepository = require("./BaseRepository");
const ProblemAttempt = require("../models/problemAttempt");

class AttemptRepository extends BaseRepository {
  constructor() {
    super(ProblemAttempt);
  }

  async findOrCreateAttempt(userId, problemId) {
    let attempt = await this.findOne({ userId, problemId });

    if (!attempt) {
      attempt = await this.create({
        userId,
        problemId,
        runAttempts: 5,
        submitAttempts: 1,
        solved: false,
      });
    }

    return attempt;
  }

  async decrementRunAttempt(userId, problemId) {
    const attempt = await this.findOrCreateAttempt(userId, problemId);
    if (attempt.runAttempts > 0) {
      attempt.runAttempts -= 1;
      await attempt.save();
    }
    return attempt;
  }

  async decrementSubmitAttempt(userId, problemId) {
    const attempt = await this.findOrCreateAttempt(userId, problemId);
    if (attempt.submitAttempts > 0) {
      attempt.submitAttempts -= 1;
      await attempt.save();
    }
    return attempt;
  }

  async markSolved(userId, problemId) {
    return await this.model.findOneAndUpdate(
      { userId, problemId },
      { solved: true },
      { new: true, upsert: true }
    );
  }
}

module.exports = new AttemptRepository();
