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
}

module.exports = new UserRepository();
