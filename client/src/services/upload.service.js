// client/src/services/upload.service.js
import api from './api';

/**
 * Upload image to backend (server upload)
 */
export const uploadImage = async (file, folder = 'general', transformation = 'none') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);
  formData.append('transformation', transformation);

  const response = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * Upload file to backend (server upload)
 */
export const uploadFile = async (file, folder = 'documents') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await api.post('/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * Upload multiple images to backend
 */
export const uploadMultipleImages = async (files, folder = 'portfolio') => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  formData.append('folder', folder);

  const response = await api.post('/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * Get upload signature for direct upload
 */
export const getUploadSignature = async (folder = 'general') => {
  const response = await api.post('/upload/signature', { folder });
  return response.data;
};

/**
 * Delete uploaded file from Cloudinary
 */
export const deleteUpload = async (publicId) => {
  const response = await api.delete('/upload', { data: { publicId } });
  return response.data;
};

/**
 * Direct upload to Cloudinary using signature
 */
export const directUploadToCloudinary = async (file, folder = 'general', onProgress) => {
  try {
    // 1. Get signature from backend
    const signatureData = await getUploadSignature(folder);
    
    if (!signatureData.success) {
      throw new Error('Failed to get upload signature');
    }

    // 2. Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    formData.append('api_key', signatureData.apiKey);
    formData.append('folder', `skillhire/${folder}`);

    // 3. Upload directly to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;
    
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return {
      success: true,
      image: {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        size: data.bytes,
        width: data.width,
        height: data.height,
      },
    };
  } catch (error) {
    console.error('Direct upload failed:', error);
    throw error;
  }
};
