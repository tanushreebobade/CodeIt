const BaseRepository = require("./BaseRepository");
const User = require("../models/user");
const localDb = require("../config/localDb");

class UserRepository extends BaseRepository {
  constructor() {
    super(User, "user");
  }

  async findUserById(id) {
    return await this.findById(id);
  }

  async findUserByEmail(emailId) {
    return await this.findOne({ emailId });
  }

  async addSolvedProblem(userId, problemId) {
    if (this.isMongoConnected()) {
      try {
        return await this.model.findByIdAndUpdate(
          userId,
          { $addToSet: { problemSolved: problemId } },
          { returnDocument: "after" }
        );
      } catch (err) {
        console.warn("Mongo addSolvedProblem failed, using localDb:", err.message);
      }
    }
    return localDb.addSolvedProblem(userId, problemId);
  }

  async getUserProfileWithStats(userId) {
    if (this.isMongoConnected()) {
      try {
        return await this.model
          .findById(userId)
          .select("-password")
          .populate("problemSolved", "title difficulty tags");
      } catch (err) {
        console.warn("Mongo getUserProfileWithStats failed, using localDb:", err.message);
      }
    }
    const user = localDb.findUserById(userId);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = new UserRepository();
