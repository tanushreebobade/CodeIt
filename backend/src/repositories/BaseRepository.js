const mongoose = require("mongoose");
const localDb = require("../config/localDb");

class BaseRepository {
  constructor(model, entityType = "generic") {
    this.model = model;
    this.entityType = entityType;
  }

  isMongoConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  isValidObjectId(id) {
    if (!id) return false;
    return mongoose.Types.ObjectId.isValid(String(id));
  }

  async findById(id, projection = null, options = {}) {
    if (this.isMongoConnected() && this.isValidObjectId(id)) {
      try {
        return await this.model.findById(id, projection, options);
      } catch (err) {
        console.warn("Mongo findById failed, using localDb:", err.message);
      }
    }
    if (this.entityType === "user") return localDb.findUserById(id);
    if (this.entityType === "problem") return localDb.findProblemById(id);
    return null;
  }

  async findOne(filter, projection = null, options = {}) {
    if (this.isMongoConnected()) {
      try {
        // If filter has _id, check validity first
        if (filter && filter._id && !this.isValidObjectId(filter._id)) {
          // Skip Mongo findOne if _id is not a valid ObjectId
        } else {
          return await this.model.findOne(filter, projection, options);
        }
      } catch (err) {
        console.warn("Mongo findOne failed, using localDb:", err.message);
      }
    }
    if (this.entityType === "user") {
      if (filter.emailId) return localDb.findUserByEmail(filter.emailId);
      if (filter._id) return localDb.findUserById(filter._id);
    }
    if (this.entityType === "problem") {
      if (filter._id) return localDb.findProblemById(filter._id);
    }
    return null;
  }

  async find(filter = {}, projection = null, options = {}) {
    if (this.isMongoConnected()) {
      try {
        return await this.model.find(filter, projection, options);
      } catch (err) {
        console.warn("Mongo find failed, using localDb:", err.message);
      }
    }
    if (this.entityType === "user") {
      let users = localDb.getUsers();
      if (filter._id && filter._id.$in) {
        const idSet = new Set(filter._id.$in.map(String));
        users = users.filter((u) => idSet.has(String(u._id)));
      }
      return users;
    }
    if (this.entityType === "problem") return localDb.getProblems();
    if (this.entityType === "submission") {
      let subs = localDb.getSubmissions();
      if (filter.userId) subs = subs.filter((s) => String(s.userId) === String(filter.userId));
      if (filter.problemId) subs = subs.filter((s) => String(s.problemId) === String(filter.problemId));
      return subs;
    }
    return [];
  }

  async create(data) {
    if (this.isMongoConnected()) {
      try {
        return await this.model.create(data);
      } catch (err) {
        console.warn("Mongo create failed, using localDb:", err.message);
      }
    }
    if (this.entityType === "user") return localDb.createUser(data);
    if (this.entityType === "problem") return localDb.createProblem(data);
    if (this.entityType === "submission") return localDb.createSubmission(data);
    if (this.entityType === "attempt") return localDb.findOrCreateAttempt(data.userId, data.problemId);
    return data;
  }

  async updateById(id, updateData, options = { returnDocument: "after", runValidators: true }) {
    if (this.isMongoConnected() && this.isValidObjectId(id)) {
      try {
        return await this.model.findByIdAndUpdate(id, updateData, options);
      } catch (err) {
        console.warn("Mongo updateById failed, using localDb:", err.message);
      }
    }
    if (this.entityType === "user") return localDb.updateUser(id, updateData);
    return null;
  }

  async count(filter = {}) {
    if (this.isMongoConnected()) {
      try {
        return await this.model.countDocuments(filter);
      } catch (err) {
        console.warn("Mongo count failed, using localDb:", err.message);
      }
    }
    if (this.entityType === "user") return localDb.getUsers().length;
    if (this.entityType === "problem") return localDb.getProblems().length;
    if (this.entityType === "submission") {
      let subs = localDb.getSubmissions();
      if (filter.userId) subs = subs.filter((s) => String(s.userId) === String(filter.userId));
      if (filter.status) subs = subs.filter((s) => s.status === filter.status);
      return subs.length;
    }
    return 0;
  }
}

module.exports = BaseRepository;
