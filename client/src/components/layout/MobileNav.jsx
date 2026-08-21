import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import {
  Briefcase,
  Search,
  X,
  User,
  LayoutDashboard,
  Folders,
  FileCheck2,
  DollarSign,
  Star,
  Settings,
  LogOut,
  Sun,
  Moon,
  MessageSquare,
  PlusCircle
} from 'lucide-react';

export function MobileNav({ isOpen, onClose }) {
  const { currentUser, role, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  if (!isOpen) return null;

  const getDashboardPath = () => {
    if (role === 'freelancer') return '/dashboard/freelancer';
    if (role === 'admin') return '/admin';
    return '/dashboard/client';
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <Link to="/" onClick={onClose} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">SkillHire</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User profile if auth */}
          {isAuthenticated && (
            <div className="py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <Avatar src={currentUser?.avatar} name={currentUser?.name} size="md" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentUser?.name}</h4>
                <p className="text-xs text-slate-400 capitalize">{role} Account</p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="py-4 space-y-1 text-sm font-semibold">
            <Link
              to="/projects"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span>Find Work</span>
            </Link>
            <Link
              to="/freelancers"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span>Find Freelancers</span>
            </Link>
            <Link
              to="/categories"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span>Categories</span>
            </Link>
            <Link
              to="/how-it-works"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span>How It Works</span>
            </Link>

            {isAuthenticated && (
              <>
                <div className="pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
                  Workspace
                </div>
                <Link
                  to={getDashboardPath()}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/40"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/messages"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Messages</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Footer & Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500">Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" onClick={onClose}>
                <Button variant="outline" size="sm" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={onClose}>
                <Button variant="primary" size="sm" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
