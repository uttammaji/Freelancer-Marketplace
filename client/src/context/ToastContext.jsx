// client/src/context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

// Constants
const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 5;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Remove single toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Remove all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Add toast with auto-remove
  const addToast = useCallback(({ title, message, type = 'info', duration = DEFAULT_DURATION }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setToasts(prev => {
      // Limit max toasts
      const updated = [...prev, { id, title, message, type, duration }];
      return updated.slice(-MAX_TOASTS);
    });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  // Toast API
  const toast = useMemo(() => ({
    success: (title, message, duration) => addToast({ title, message, type: 'success', duration }),
    error: (title, message, duration) => addToast({ title, message, type: 'error', duration }),
    info: (title, message, duration) => addToast({ title, message, type: 'info', duration }),
    warning: (title, message, duration) => addToast({ title, message, type: 'warning', duration }),
  }), [addToast]);

  // Get icon based on type
  const getIcon = useCallback((type) => {
    const iconClass = 'w-5 h-5 shrink-0';
    switch (type) {
      case 'success':
        return <CheckCircle2 className={`${iconClass} text-emerald-500`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-rose-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-amber-500`} />;
      default:
        return <Info className={`${iconClass} text-primary-500`} />;
    }
  }, []);

  // Get border color based on type
  const getBorderColor = useCallback((type) => {
    switch (type) {
      case 'success':
        return 'border-l-emerald-500';
      case 'error':
        return 'border-l-rose-500';
      case 'warning':
        return 'border-l-amber-500';
      default:
        return 'border-l-primary-500';
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast, clearAllToasts }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-soft-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${getBorderColor(t.type)} text-slate-900 dark:text-slate-100`}
            >
              {getIcon(t.type)}
              
              <div className="flex-1 min-w-0">
                {t.title && (
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t.title}
                  </h4>
                )}
                {t.message && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words">
                    {t.message}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg shrink-0"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

// Also export full context for advanced usage
export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}