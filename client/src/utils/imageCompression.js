// client/src/utils/imageCompression.js
import imageCompression from 'browser-image-compression';

/**
 * Compress image before upload
 * @param {File} file - Original image file
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed file
 */
export const compressImage = async (file, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 0.5,           // Max 500KB
    maxWidthOrHeight: 800,    // Max 800px
    useWebWorker: true,       // Non-blocking
    initialQuality: 0.8,      // 80% quality
    // Removed fileType to keep original format
  };

  try {
    const compressedFile = await imageCompression(file, {
      ...defaultOptions,
      ...options,
    });
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Return original if compression fails
  }
};

/**
 * Validate image file
 * @param {File} file - Image file
 * @returns {Object} { isValid, error }
 */
export const validateImage = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file type (more lenient)
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/octet-stream', // Some browsers send this
  ];

  // Also check by extension
  const ext = file.name?.split('.').pop()?.toLowerCase();
  const allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

  if (!allowedTypes.includes(file.type) && !allowedExt.includes(ext)) {
    return { 
      isValid: false, 
      error: 'Invalid file type. Only JPEG, PNG, GIF, WebP, or SVG allowed.' 
    };
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'File too large. Maximum 5MB allowed.' 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Create local preview URL
 * @param {File} file - Image file
 * @returns {string} Preview URL
 */
export const createPreviewUrl = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revoke preview URL
 * @param {string} url - Preview URL
 */
export const revokePreviewUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Get image dimensions
 * @param {File} file - Image file
 * @returns {Promise<Object>} { width, height }
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Create blur placeholder for progressive loading
 * @param {File} file - Image file
 * @returns {Promise<string>} Tiny blur URL
 */
export const createBlurPlaceholder = async (file) => {
  try {
    const tinyFile = await imageCompression(file, {
      maxSizeMB: 0.001,
      maxWidthOrHeight: 10,
      useWebWorker: true,
      initialQuality: 0.1,
    });
    return URL.createObjectURL(tinyFile);
  } catch (error) {
    return null;
  }
};