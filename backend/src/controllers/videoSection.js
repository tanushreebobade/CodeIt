const cloudinary = require('cloudinary').v2;
const Problem = require("../models/problem");
const SolutionVideo = require("../models/solutionVideo");
const { asyncHandler } = require("../middleware/errorHandler");
const { AppError } = require("../errors/AppError");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateUploadSignature = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  const userId = req.result._id;

  const problem = await Problem.findById(problemId);
  if (!problem) {
    throw new AppError('Problem not found', 404);
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const publicId = `codeit-solutions/${problemId}/${userId}_${timestamp}`;

  const uploadParams = {
    timestamp: timestamp,
    public_id: publicId,
  };

  const signature = cloudinary.utils.api_sign_request(
    uploadParams,
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    signature,
    timestamp,
    public_id: publicId,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
  });
});

const saveVideoMetadata = asyncHandler(async (req, res) => {
  const {
    problemId,
    cloudinaryPublicId,
    secureUrl,
    duration,
  } = req.body;

  const userId = req.result._id;

  const cloudinaryResource = await cloudinary.api.resource(
    cloudinaryPublicId,
    { resource_type: 'video' }
  );

  if (!cloudinaryResource) {
    throw new AppError('Video not found on Cloudinary', 400);
  }

  const existingVideo = await SolutionVideo.findOne({
    problemId,
    userId,
    cloudinaryPublicId
  });

  if (existingVideo) {
    throw new AppError('Video solution already exists for this problem', 409);
  }

  const thumbnailUrl = cloudinary.image(cloudinaryResource.public_id, { resource_type: "video" });

  const videoSolution = await SolutionVideo.create({
    problemId,
    userId,
    cloudinaryPublicId,
    secureUrl,
    duration: cloudinaryResource.duration || duration,
    thumbnailUrl
  });

  res.status(201).json({
    success: true,
    message: 'Video solution saved successfully',
    videoSolution: {
      id: videoSolution._id,
      thumbnailUrl: videoSolution.thumbnailUrl,
      duration: videoSolution.duration,
      uploadedAt: videoSolution.createdAt
    }
  });
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  const video = await SolutionVideo.findOneAndDelete({ problemId });

  if (!video) {
    throw new AppError('Video solution not found', 404);
  }

  await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
    resource_type: 'video',
    invalidate: true
  });

  res.json({
    success: true,
    message: 'Video solution deleted successfully'
  });
});

module.exports = {
  generateUploadSignature,
  saveVideoMetadata,
  deleteVideo
};
