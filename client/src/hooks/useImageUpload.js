// client/src/hooks/useImageUpload.js
import { useState, useCallback } from 'react';
import { compressImage, validateImage, createPreviewUrl, revokePreviewUrl } from '../utils/imageCompression';
import { uploadImage, directUploadToCloudinary } from '../services/upload.service';

export function useImageUpload(options = {}) {
  const {
    folder = 'general',
    transformation = 'none',
    useDirectUpload = true, // Use signed direct upload by default
    maxFiles = 1,
    autoUpload = true,
  } = options;

  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  /**
   * Validate and prepare file
   */
  const prepareFile = async (file) => {
    // Validate
    const validation = validateImage(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Compress
    const compressedFile = await compressImage(file);
    
    // Create preview
    const previewUrl = createPreviewUrl(compressedFile);
    
    return { file: compressedFile, previewUrl };
  };

  /**
   * Handle file selection
   */
  const handleFiles = useCallback(async (selectedFiles) => {
    setError(null);
    
    const fileArray = Array.from(selectedFiles).slice(0, maxFiles);
    
    try {
      // Prepare all files
      const preparedFiles = await Promise.all(
        fileArray.map(file => prepareFile(file))
      );

      setFiles(preparedFiles);

      // Auto upload if enabled
      if (autoUpload && preparedFiles.length > 0) {
        await handleUpload(preparedFiles[0].file);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [maxFiles, autoUpload]);

  /**
   * Upload single file
   */
  const handleUpload = async (file) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      let result;

      if (useDirectUpload) {
        // Direct upload to Cloudinary with signature
        result = await directUploadToCloudinary(file, folder);
      } else {
        // Server upload
        result = await uploadImage(file, folder, transformation);
      }

      if (result.success) {
        setUploadedUrls(prev => [...prev, result.image.url]);
        setProgress(100);
        return result;
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Upload multiple files
   */
  const handleUploadAll = async () => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const uploadPromises = files.map(async (fileData, index) => {
        const result = await handleUpload(fileData.file);
        setProgress(((index + 1) / files.length) * 100);
        return result;
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Remove file
   */
  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      revokePreviewUrl(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  /**
   * Clear all files
   */
  const clearFiles = () => {
    files.forEach(fileData => revokePreviewUrl(fileData.previewUrl));
    setFiles([]);
    setUploadedUrls([]);
    setProgress(0);
    setError(null);
  };

  /**
   * Retry upload
   */
  const retryUpload = async () => {
    if (files.length > 0) {
      await handleUpload(files[0].file);
    }
  };

  return {
    files,
    isUploading,
    progress,
    error,
    uploadedUrls,
    handleFiles,
    handleUpload,
    handleUploadAll,
    removeFile,
    clearFiles,
    retryUpload,
  };
}