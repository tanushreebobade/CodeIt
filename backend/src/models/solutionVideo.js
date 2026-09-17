const mongoose = require('mongoose');
const { Schema } = mongoose;

const videoSchema = new Schema({
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // 'cloudinary' for signed uploads, 'external' for youtube / direct video links
  provider: {
    type: String,
    enum: ['cloudinary', 'external'],
    default: 'cloudinary'
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
    unique: true
  },
  secureUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number,
    default: 0
  },
}, {
  timestamps: true
});

const SolutionVideo = mongoose.models.solutionVideo || mongoose.model("solutionVideo", videoSchema);

module.exports = SolutionVideo;
