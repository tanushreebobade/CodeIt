const BaseRepository = require("./BaseRepository");
const User = require("../models/user");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findUserById(id) {
    return await this.findById(id);
  }

  async findUserByEmail(emailId) {
    return await this.findOne({ emailId });
  }

  async addSolvedProblem(userId, problemId) {
    // Avoid duplicate problem IDs if solved multiple times
    return await this.model.findByIdAndUpdate(
      userId,
      { $addToSet: { problemSolved: problemId } },
      { returnDocument: "after" }
    );
  }

  async getUserProfileWithStats(userId) {
    return await this.model
      .findById(userId)
      .select("-password")
      .populate("problemSolved", "title difficulty tags");
  }
}

module.exports = new UserRepository();
