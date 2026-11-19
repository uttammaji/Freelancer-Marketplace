// client/src/components/upload/ImagePreview.jsx
import React, { useState, useEffect } from 'react';
import { X, ZoomIn, CheckCircle2, Trash2 } from 'lucide-react';

export function ImagePreview({ 
  src, 
  alt = 'Preview',
  onRemove = null,
  isUploaded = false,
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [blurUrl, setBlurUrl] = useState(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  useEffect(() => {
    // Clean up object URL on unmount
    return () => {
      if (src?.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
    };
  }, [src]);

  return (
    <>
      <div className={`relative group ${sizeClasses[size]}`}>
        {/* Main image */}
        <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {/* Blur placeholder */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse" />
          )}
          
          <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'
            }`}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              aria-label="Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-rose-400 hover:bg-white/30 transition-colors"
                aria-label="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Uploaded badge */}
        {isUploaded && (
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-contain rounded-2xl"
            />
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}