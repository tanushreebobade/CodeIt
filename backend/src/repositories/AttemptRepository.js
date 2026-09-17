const mongoose = require("mongoose");
const BaseRepository = require("./BaseRepository");
const ProblemAttempt = require("../models/problemAttempt");
const localDb = require("../config/localDb");
const env = require("../config/env");

function isValidObjectId(id) {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(String(id));
}

class AttemptRepository extends BaseRepository {
  constructor() {
    super(ProblemAttempt, "attempt");
  }

  async findOrCreateAttempt(userId, problemId) {
    if (this.isMongoConnected() && isValidObjectId(userId) && isValidObjectId(problemId)) {
      try {
        let attempt = await this.findOne({ userId, problemId });
        if (!attempt) {
          attempt = await this.create({
            userId,
            problemId,
            runAttempts: env.freeRunAttempts,
            submitAttempts: env.freeSubmitAttempts,
            solved: false,
          });
        }
        return attempt;
      } catch (err) {
        console.warn("Mongo findOrCreateAttempt failed, using localDb:", err.message);
      }
    }
    return localDb.findOrCreateAttempt(userId, problemId);
  }

  async decrementRunAttempt(userId, problemId) {
    if (this.isMongoConnected() && isValidObjectId(userId) && isValidObjectId(problemId)) {
      try {
        const updated = await this.model.findOneAndUpdate(
          { userId, problemId, runAttempts: { $gt: 0 } },
          { $inc: { runAttempts: -1 } },
          { returnDocument: "after" }
        );
        if (updated) return updated;
        const attempt = await this.findOrCreateAttempt(userId, problemId);
        if (attempt && typeof attempt.save === "function" && attempt.runAttempts > 0) {
          attempt.runAttempts -= 1;
          await attempt.save();
        }
        return attempt;
      } catch (err) {
        console.warn("Mongo decrementRunAttempt failed, using localDb:", err.message);
      }
    }
    return localDb.decrementRunAttempt(userId, problemId);
  }

  async decrementSubmitAttempt(userId, problemId) {
    if (this.isMongoConnected() && isValidObjectId(userId) && isValidObjectId(problemId)) {
      try {
        const updated = await this.model.findOneAndUpdate(
          { userId, problemId, submitAttempts: { $gt: 0 } },
          { $inc: { submitAttempts: -1 } },
          { returnDocument: "after" }
        );
        if (updated) return updated;
        const attempt = await this.findOrCreateAttempt(userId, problemId);
        if (attempt && typeof attempt.save === "function" && attempt.submitAttempts > 0) {
          attempt.submitAttempts -= 1;
          await attempt.save();
        }
        return attempt;
      } catch (err) {
        console.warn("Mongo decrementSubmitAttempt failed, using localDb:", err.message);
      }
    }
    return localDb.decrementSubmitAttempt(userId, problemId);
  }

  async markSolved(userId, problemId) {
    if (this.isMongoConnected() && isValidObjectId(userId) && isValidObjectId(problemId)) {
      try {
        return await this.model.findOneAndUpdate(
          { userId, problemId },
          {
            $set: { solved: true },
            $setOnInsert: { runAttempts: env.freeRunAttempts, submitAttempts: env.freeSubmitAttempts },
          },
          { returnDocument: "after", upsert: true }
        );
      } catch (err) {
        console.warn("Mongo markSolved failed, using localDb:", err.message);
      }
    }
    return localDb.markSolved(userId, problemId);
  }
}

module.exports = new AttemptRepository();
