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
    // Sanitize original filename
    const sanitizedBase = file.originalname
      .replace(/[^a-zA-Z0-9.]/g, '-')
      .toLowerCase()
      .replace(/\.[^.]+$/, '');
    
    // Get extension
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Generate unique suffix
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // Combine
    const finalName = `${sanitizedBase}-${uniqueSuffix}${ext}`;
    
    cb(null, finalName);
  }
});

// File filter for images (MORE LENIENT - accepts MIME OR extension)
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/octet-stream',
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedMime = allowedMimeTypes.includes(file.mimetype);
  const isAllowedExt = allowedExtensions.includes(ext);

  if (isAllowedMime || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new AppError(`File type "${file.mimetype}" not allowed. Only JPEG, PNG, GIF, WebP allowed`, 400));
  }
};

// File filter for documents (MORE LENIENT)
const documentFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/octet-stream',
  ];

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedMime = allowedMimeTypes.includes(file.mimetype);
  const isAllowedExt = allowedExtensions.includes(ext);

  if (isAllowedMime || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new AppError(`File type "${file.mimetype}" not allowed. Only PDF, DOC, TXT, ZIP allowed`, 400));
  }
};

// Single image upload (avatar)
export const uploadSingleImage = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
}).single('image');

// Single file upload (document)
export const uploadSingleFile = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter
}).single('file');

// Multiple images upload (portfolio)
export const uploadMultipleImages = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
}).array('images', 10);

// Multiple files upload
export const uploadMultipleFiles = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter
}).array('files', 5);