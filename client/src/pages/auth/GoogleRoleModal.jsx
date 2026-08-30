// client/src/pages/auth/GoogleRoleModal.jsx
import React from 'react';
import { Briefcase, UserCheck, Loader2 } from 'lucide-react';

export function GoogleRoleModal({ isOpen, onSelectRole, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-soft-lg space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Welcome to SkillHire!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose how you want to use SkillHire
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onSelectRole('client')}
            disabled={isLoading}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-all text-left disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                I'm a Client
              </h3>
              <p className="text-xs text-slate-400">
                I want to hire talent for my projects
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectRole('freelancer')}
            disabled={isLoading}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all text-left disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                I'm a Freelancer
              </h3>
              <p className="text-xs text-slate-400">
                I want to work and earn on projects
              </p>
            </div>
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Setting up your account...
          </div>
        )}
      </div>
    </div>
  );
}