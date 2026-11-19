import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger', 'subtle', 'teal'
  size = 'md', // 'sm', 'md', 'lg', 'icon'
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  // Shared tactile button treatment used across public, dashboard, and admin screens
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl tracking-[0.01em] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-y-px';

  const variants = {
    primary:
      'bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 active:from-primary-800 active:to-primary-900 text-white shadow-odoo hover:shadow-soft focus:ring-primary-500 dark:focus:ring-offset-slate-900',
    secondary:
      'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 focus:ring-slate-400',
    outline:
      'border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 bg-white/70 dark:bg-slate-900/70 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 focus:ring-primary-500',
    ghost:
      'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    subtle:
      'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950/40 dark:text-primary-300 dark:hover:bg-primary-900/40 focus:ring-primary-400',
    teal:
      'bg-accent-600 hover:bg-accent-700 active:bg-accent-800 text-white shadow-sm focus:ring-accent-500 dark:focus:ring-offset-slate-900',
  };

  const sizes = {
    sm:   'text-xs px-3.5 py-1.5 gap-1.5',
    md:   'text-sm px-4 py-2.5 gap-2',
    lg:   'text-sm px-6 py-3 gap-2.5',
    icon: 'p-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
      {!isLoading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
    </button>
  );
}
