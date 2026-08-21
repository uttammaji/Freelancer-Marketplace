import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'primary', 'success'
  isLoading = false
}) {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <div className="p-3 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full"><AlertTriangle className="w-6 h-6" /></div>;
      case 'success':
        return <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full"><CheckCircle2 className="w-6 h-6" /></div>;
      default:
        return <div className="p-3 bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 rounded-full"><Info className="w-6 h-6" /></div>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={false}>
      <div className="flex flex-col items-center text-center p-2">
        {getIcon()}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{message}</p>
        <div className="flex items-center gap-3 w-full mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
