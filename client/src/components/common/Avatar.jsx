import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function Avatar({
  src,
  alt = 'User Avatar',
  name = '',
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl', '2xl'
  isOnline,
  isVerified,
  className = ''
}) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg font-semibold',
    '2xl': 'w-24 h-24 text-2xl font-bold'
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizes[size] || sizes.md} rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-sm`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${sizes[size] || sizes.md} rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white flex items-center justify-center font-medium shadow-sm`}
        >
          {getInitials(name || alt)}
        </div>
      )}

      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-slate-900 ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
          } ${size === 'xs' || size === 'sm' ? 'w-2 h-2' : size === 'lg' || size === 'xl' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'}`}
        />
      )}

      {isVerified && (
        <span className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm text-primary-600 dark:text-primary-400">
          <CheckCircle2 className={`${size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} fill="currentColor" stroke="white" />
        </span>
      )}
    </div>
  );
}
