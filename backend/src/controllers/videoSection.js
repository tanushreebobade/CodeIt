const crypto = require("crypto");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const env = require("../config/env");
const problemRepository = require("../repositories/ProblemRepository");
const SolutionVideo = require("../models/solutionVideo");
const { asyncHandler } = require("../middleware/errorHandler");
const { AppError, BadRequestError, NotFoundError, ConflictError } = require("../errors/AppError");

const cloudinaryConfigured = Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

const requireMongo = () => {
  if (!(mongoose.connection && mongoose.connection.readyState === 1)) {
    throw new AppError("Video solutions require a MongoDB connection.", 503);
  }
};

const isValidHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (err) {
    return false;
  }
};

const generateUploadSignature = asyncHandler(async (req, res) => {
  if (!cloudinaryConfigured) {
    throw new AppError("Cloudinary is not configured on the server. Attach an external video URL instead.", 503);
  }

  const { problemId } = req.params;
  const userId = req.result._id;

  const problem = await problemRepository.findProblemById(problemId);
  if (!problem) {
    throw new NotFoundError("Problem not found");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const publicId = `codeit-solutions/${problemId}/${userId}_${timestamp}`;

  const uploadParams = {
    timestamp: timestamp,
    public_id: publicId,
  };

  const signature = cloudinary.utils.api_sign_request(uploadParams, env.cloudinary.apiSecret);

  res.json({
    signature,
    timestamp,
    public_id: publicId,
    api_key: env.cloudinary.apiKey,
    cloud_name: env.cloudinary.cloudName,
    upload_url: `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/video/upload`,
  });
});

// saves either a cloudinary upload (cloudinaryPublicId) or an external url (youtube / mp4)
const saveVideoMetadata = asyncHandler(async (req, res) => {
  requireMongo();

  const { problemId, cloudinaryPublicId, secureUrl, duration, thumbnailUrl } = req.body;
  const userId = req.result._id;

  if (!problemId || !mongoose.Types.ObjectId.isValid(String(problemId))) {
    throw new BadRequestError("A valid problemId is required");
  }

  const problem = await problemRepository.findProblemById(problemId);
  if (!problem) {
    throw new NotFoundError("Problem not found");
  }

  let videoData;

  if (cloudinaryPublicId) {
    if (!cloudinaryConfigured) {
      throw new AppError("Cloudinary is not configured on the server.", 503);
    }
    const cloudinaryResource = await cloudinary.api.resource(cloudinaryPublicId, { resource_type: "video" });
    if (!cloudinaryResource) {
      throw new BadRequestError("Video not found on Cloudinary");
    }
    videoData = {
      provider: "cloudinary",
      cloudinaryPublicId,
      secureUrl: secureUrl || cloudinaryResource.secure_url,
      duration: cloudinaryResource.duration || duration || 0,
      thumbnailUrl: cloudinary.image(cloudinaryResource.public_id, { resource_type: "video" }),
    };
  } else {
    if (!secureUrl || !isValidHttpUrl(secureUrl)) {
      throw new BadRequestError("A valid video URL (YouTube or direct video link) is required");
    }
    videoData = {
      provider: "external",
      cloudinaryPublicId: `external:${crypto.createHash("sha1").update(secureUrl).digest("hex")}`,
      secureUrl: secureUrl.trim(),
      duration: Number(duration) || 0,
      thumbnailUrl: thumbnailUrl || "",
    };
  }

  // one video per problem: replace an existing one
  const existing = await SolutionVideo.findOne({ problemId });
  if (existing) {
    if (existing.cloudinaryPublicId === videoData.cloudinaryPublicId) {
      throw new ConflictError("This video is already attached to the problem");
    }
    if (existing.provider === "cloudinary" && cloudinaryConfigured) {
      try {
        await cloudinary.uploader.destroy(existing.cloudinaryPublicId, { resource_type: "video", invalidate: true });
      } catch (err) {
        console.warn("Cloudinary cleanup failed:", err.message);
      }
    }
    await SolutionVideo.deleteOne({ _id: existing._id });
  }

  const videoSolution = await SolutionVideo.create({
    problemId,
    userId,
    ...videoData,
  });

  res.status(201).json({
    success: true,
    message: "Video solution saved successfully",
    videoSolution: {
      id: videoSolution._id,
      secureUrl: videoSolution.secureUrl,
      thumbnailUrl: videoSolution.thumbnailUrl,
      duration: videoSolution.duration,
      uploadedAt: videoSolution.createdAt,
    },
  });
});

const deleteVideo = asyncHandler(async (req, res) => {
  requireMongo();
  const { problemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(String(problemId))) {
    throw new BadRequestError("A valid problemId is required");
  }

  const video = await SolutionVideo.findOneAndDelete({ problemId });

  if (!video) {
    throw new NotFoundError("Video solution not found");
  }

  if (video.provider === "cloudinary" && cloudinaryConfigured) {
    try {
      await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: "video", invalidate: true });
    } catch (err) {
      console.warn("Cloudinary delete failed:", err.message);
    }
  }

  res.json({
    success: true,
    message: "Video solution deleted successfully",
  });
});

module.exports = {
  generateUploadSignature,
  saveVideoMetadata,
  deleteVideo,
};
