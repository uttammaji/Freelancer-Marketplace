// server/src/middleware/upload.middleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from './error.middleware.js';

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // 1. Sanitize original filename
    const sanitizedBase = file.originalname
      .replace(/[^a-zA-Z0-9.]/g, '-')
      .toLowerCase()
      .replace(/\.[^.]+$/, ''); // Remove extension
    
    // 2. Get extension
    const ext = path.extname(file.originalname).toLowerCase();
    
    // 3. Generate unique suffix
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // 4. Combine: sanitizedName-uniqueSuffix.ext
    const finalName = `${sanitizedBase}-${uniqueSuffix}${ext}`;
    
    // 5. Single callback with final name
    cb(null, finalName);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|gif|webp/;
  const allowedMime = /image\/(jpeg|jpg|png|gif|webp)/;
  
  const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMime.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed (JPEG, PNG, GIF, WebP)', 400));
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedExt = /pdf|doc|docx|txt|zip|rar/;
  const allowedMime = /application\/(pdf|msword|zip)|text\/plain/;
  
  const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMime.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('Only document files are allowed (PDF, DOC, TXT, ZIP)', 400));
  }
};

// Single image upload (avatar)
export const uploadSingleImage = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
}).single('image');

// Single file upload (document)
export const uploadSingleFile = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: documentFilter
}).single('file');

// Multiple images upload (portfolio)
export const uploadMultipleImages = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB each
  fileFilter: imageFilter
}).array('images', 10); // Max 10 images

// Multiple files upload
export const uploadMultipleFiles = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB each
  fileFilter: documentFilter
}).array('files', 5); // Max 5 files