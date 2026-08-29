// client/src/components/upload/DragDropZone.jsx
import React, { useState, useRef } from 'react';
import { Upload, Image, FileText } from 'lucide-react';

export function DragDropZone({ 
  onFilesSelect, 
  accept = 'image/*',
  maxFiles = 1,
  disabled = false,
  children,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesSelect(files);
    }
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      onFilesSelect(files);
    }
    // Reset input
    e.target.value = '';
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      const files = [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        onFilesSelect(files);
      }
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onClick={handleClick}
      className={`
        relative w-full p-6 sm:p-8 border-2 border-dashed rounded-2xl cursor-pointer
        transition-all duration-200 text-center
        ${isDragging 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 scale-[1.02]' 
          : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleInputChange}
        className="hidden"
      />

      {children || (
        <div className="space-y-3">
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-all ${
            isDragging 
              ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 scale-110' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            {accept === 'image/*' ? (
              <Image className="w-6 h-6" />
            ) : (
              <FileText className="w-6 h-6" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {isDragging ? 'Drop it here!' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {accept === 'image/*' 
                ? 'Supports JPEG, PNG, GIF, WebP (max 5MB)'
                : 'Supports PDF, DOC, TXT (max 10MB)'
              }
            </p>
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-xs font-bold">
            <Upload className="w-3.5 h-3.5" />
            Browse Files
          </span>
        </div>
      )}
    </div>
  );
}