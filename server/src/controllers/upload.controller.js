// server/src/controllers/upload.controller.js
import cloudinary from "../config/cloudinary.config.js";
import { AppError, asyncHandler } from "../middleware/error.middleware.js";

import fs from "fs";
import path from "path";

// @desc    Upload image (avatar, portfolio, general)
// @route   POST /api/upload/image
// @access  Private
export const uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    throw new AppError("Please provide an image file", 400);
  }

  const { folder = "general", transformation = "none" } = req.body;

  const allowedFolders = [
    "avatars",
    "portfolio",
    "projects",
    "proposals",
    "general",
  ];
  if (!allowedFolders.includes(folder)) {
    throw new AppError("Invalid upload folder", 400);
  }

  const uploadOptions = {
    folder: `skillhire/${folder}`,
    resource_type: "image",
  };

  if (transformation === "avatar") {
    uploadOptions.transformation = [
      { width: 300, height: 300, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ];
  } else if (transformation === "portfolio") {
    uploadOptions.transformation = [
      { width: 1200, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ];
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      req.file.path,
      uploadOptions,
    );

    // Check dimensions
    if (result.width < 100 || result.height < 100) {
     // Delete from Cloudinary if too small
      await cloudinary.uploader.destroy(result.public_id);
      // Delete local file
      fs.unlinkSync(req.file.path);
      throw new AppError("Image too small. Minimum 100x100 pixels required", 400);
    }

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    // Clean up local file on error
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw new AppError(`Upload failed: ${error.message}`, 500);
  }
});

// @desc    Upload document/file (PDF, DOC, etc.)
// @route   POST /api/upload/file
// @access  Private
export const uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    throw new AppError("Please provide a file", 400);
  }

  const { folder = "documents" } = req.body;

  // Validate folder name
  const allowedFolders = [
    "documents",
    "attachments",
    "deliverables",
    "general",
  ];
  if (!allowedFolders.includes(folder)) {
    throw new AppError("Invalid upload folder", 400);
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `skillhire/${folder}`,
      resource_type: "auto", // Auto-detect file type
    });

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        type: result.resource_type,
      },
    });
  } catch (error) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw new AppError(`Upload failed: ${error.message}`, 500);
  }
});

// @desc    Upload multiple images (portfolio)
// @route   POST /api/upload/images
// @access  Private
export const uploadMultipleImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError("Please provide images", 400);
  }

  const { folder = "portfolio" } = req.body;

  try {
    const uploadPromises = req.files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: `skillhire/${folder}`,
        resource_type: "image",
        transformation: [
          { width: 1200, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
    });

    const results = await Promise.all(uploadPromises);

    // Check dimensions for all uploaded images
    for (const result of results) {
      if (result.width < 100 || result.height < 100) {
        // Delete ALL uploaded images from Cloudinary
        await Promise.all(
          results.map(r => cloudinary.uploader.destroy(r.public_id))
        );
        throw new AppError(
          "One or more images are too small. Minimum 100x100 pixels required",
          400,
        );
      }
    }

    // Delete local files after upload
    req.files.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    const images = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    }));

    res.status(200).json({
      success: true,
      message: `${images.length} images uploaded successfully`,
      images,
    });
  } catch (error) {
    req.files.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    throw new AppError(`Upload failed: ${error.message}`, 500);
  }
});

// @desc    Delete image/file from Cloudinary
// @route   DELETE /api/upload/
// @access  Private
export const deleteUpload = asyncHandler(async (req, res, next) => {
  const { publicId } = req.body;

  if (!publicId) {
    throw new AppError("Please provide public ID", 400);
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.status(200).json({
        success: true,
        message: "File deleted successfully",
      });
    } else {
      throw new AppError("Failed to delete file", 400);
    }
  } catch (error) {
    throw new AppError(`Delete failed: ${error.message}`, 500);
  }
});

// @desc    Get upload signature for client-side direct uploads
// @route   POST /api/upload/signature
// @access  Private
export const getUploadSignature = asyncHandler(async (req, res, next) => {
  const { folder = "general" } = req.body;

  const timestamp = Math.round(new Date().getTime() / 1000);

  const params = {
    timestamp,
    folder: `skillhire/${folder}`,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET || cloudinary.config().api_secret,
  );

  res.status(200).json({
    success: true,
    signature,
    timestamp,
    cloudName: cloudinary.config().cloud_name,
    apiKey: cloudinary.config().api_key,
  });
});
