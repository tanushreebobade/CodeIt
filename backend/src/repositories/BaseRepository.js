class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, projection = null, options = {}) {
    return await this.model.findById(id, projection, options);
  }

  async findOne(filter, projection = null, options = {}) {
    return await this.model.findOne(filter, projection, options);
  }

  async find(filter = {}, projection = null, options = {}) {
    return await this.model.find(filter, projection, options);
  }

  async create(data) {
    return await this.model.create(data);
  }

  async updateById(id, updateData, options = { returnDocument: "after", runValidators: true }) {
    return await this.model.findByIdAndUpdate(id, updateData, options);
  }

  async updateOne(filter, updateData, options = {}) {
    return await this.model.updateOne(filter, updateData, options);
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteOne(filter) {
    return await this.model.deleteOne(filter);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }
}

module.exports = BaseRepository;
