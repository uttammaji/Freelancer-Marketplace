// client/src/components/upload/UploadProgress.jsx
import React from 'react';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

export function UploadProgress({ 
  progress = 0, 
  status = 'idle', // 'idle' | 'uploading' | 'success' | 'error'
  error = null,
  onRetry = null,
  onCancel = null,
}) {
  const statusConfig = {
    idle: {
      icon: null,
      color: 'bg-slate-200',
      textColor: 'text-slate-500',
    },
    uploading: {
      icon: Loader2,
      color: 'bg-primary-600',
      textColor: 'text-primary-600',
      label: `Uploading... ${Math.round(progress)}%`,
    },
    success: {
      icon: CheckCircle2,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      label: 'Upload complete',
    },
    error: {
      icon: XCircle,
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      label: error || 'Upload failed',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="w-full space-y-2">
      {/* Progress bar */}
      <div className="relative w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${config.color}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status info */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${config.textColor} ${status === 'uploading' ? 'animate-spin' : ''}`} />}
          <span className={`font-semibold ${config.textColor}`}>
            {config.label || 'Ready to upload'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {status === 'error' && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-primary-600 hover:underline font-semibold"
            >
              Retry
            </button>
          )}
          {status === 'uploading' && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-rose-600 hover:underline font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}