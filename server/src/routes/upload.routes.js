// server/src/routes/upload.routes.js
import express from 'express';
import {
  uploadImage,
  uploadFile,
  uploadMultipleImages,
  deleteUpload,
  getUploadSignature
} from '../controllers/upload.controller.js';
import {
  uploadSingleImage,
  uploadSingleFile,
  uploadMultipleImages as multerMultipleImages
} from '../middleware/upload.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// Upload image (avatar, portfolio single)
router.post('/image', uploadSingleImage, uploadImage);

// Upload file (document, PDF)
router.post('/file', uploadSingleFile, uploadFile);

// Upload multiple images (portfolio)
router.post('/images', multerMultipleImages, uploadMultipleImages);

// Get upload signature (for direct upload)
router.post('/signature', getUploadSignature);

// Delete uploaded file
router.delete('/', deleteUpload);

export default router;