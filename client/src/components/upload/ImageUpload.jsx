// client/src/components/upload/ImageUpload.jsx
import React, { useEffect } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { DragDropZone } from './DragDropZone';
import { ImagePreview } from './ImagePreview';
import { UploadProgress } from './UploadProgress';
import { Button } from '../common/Button';
import { Trash2 } from 'lucide-react';

export function ImageUpload({
  folder = 'general',
  transformation = 'none',
  maxFiles = 1,
  autoUpload = true,
  onUploadComplete = null,
  onUploadError = null,
  className = '',
}) {
  const {
    files,
    isUploading,
    progress,
    error,
    uploadedUrls,
    handleFiles,
    handleUploadAll,
    removeFile,
    clearFiles,
    retryUpload,
  } = useImageUpload({
    folder,
    transformation,
    maxFiles,
    autoUpload,
  });

  // Notify parent on upload complete
  useEffect(() => {
    if (uploadedUrls.length > 0 && onUploadComplete) {
      onUploadComplete(uploadedUrls);
    }
  }, [uploadedUrls, onUploadComplete]);

  // Notify parent on error
  useEffect(() => {
    if (error && onUploadError) {
      onUploadError(error);
    }
  }, [error, onUploadError]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload zone */}
      {files.length === 0 && (
        <DragDropZone
          onFilesSelect={handleFiles}
          maxFiles={maxFiles}
          disabled={isUploading}
        />
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {files.map((fileData, index) => (
              <ImagePreview
                key={index}
                src={fileData.previewUrl}
                alt={`Preview ${index + 1}`}
                isUploaded={uploadedUrls.length > index}
                onRemove={() => removeFile(index)}
                size="lg"
              />
            ))}
          </div>

          {/* Upload progress */}
          {isUploading && (
            <UploadProgress
              progress={progress}
              status="uploading"
            />
          )}

          {/* Success state */}
          {!isUploading && uploadedUrls.length > 0 && (
            <UploadProgress
              progress={100}
              status="success"
            />
          )}

          {/* Error state */}
          {!isUploading && error && (
            <UploadProgress
              progress={0}
              status="error"
              error={error}
              onRetry={retryUpload}
            />
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {files.length > 0 && !isUploading && !error && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFiles}
                icon={Trash2}
              >
                Clear
              </Button>
            )}

            {files.length > 1 && !isUploading && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleUploadAll}
              >
                Upload All ({files.length})
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}