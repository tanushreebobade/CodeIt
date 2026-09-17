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
    if (this.isMongoConnected() && this.isValidObjectId(userId) && this.isValidObjectId(problemId)) {
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

  // user without password, with solved problems populated (title/difficulty/tags)
  async getUserProfileWithStats(userId) {
    if (this.isMongoConnected() && this.isValidObjectId(userId)) {
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

  // all users with solved problems populated, used by the leaderboard
  async findAllWithSolvedProblems() {
    if (this.isMongoConnected()) {
      try {
        return await this.model
          .find({})
          .select("firstName lastName emailId problemSolved role createdAt")
          .populate("problemSolved", "difficulty")
          .lean();
      } catch (err) {
        console.warn("Mongo findAllWithSolvedProblems failed, using localDb:", err.message);
      }
    }
    return localDb.getUsers();
  }
}

module.exports = new UserRepository();
