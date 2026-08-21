import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import {
  Briefcase,
  LayoutDashboard,
  FolderPlus,
  Folders,
  FileCheck2,
  Users,
  MessageSquare,
  CreditCard,
  Star,
  Settings,
  Sun,
  Moon,
  Search,
  Menu,
  X,
  LogOut,
  ChevronRight,
  DollarSign,
  UserCheck,
  Shield,
  FileText
} from 'lucide-react';

export function DashboardLayout({ children, roleType = 'client' }) {
  const { currentUser, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isClient = roleType === 'client';

  const clientNav = [
    { label: 'Dashboard', path: '/dashboard/client', icon: LayoutDashboard },
    { label: 'Post a Project', path: '/dashboard/client/projects/new', icon: FolderPlus },
    { label: 'My Projects', path: '/dashboard/client/projects', icon: Folders },
    { label: 'Contracts & Workspace', path: '/dashboard/client/contracts', icon: FileCheck2 },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Payments & Escrow', path: '/dashboard/client/payments', icon: CreditCard },
    { label: 'Reviews', path: '/dashboard/client/reviews', icon: Star },
    { label: 'Settings', path: '/dashboard/client/settings', icon: Settings },
  ];

  const freelancerNav = [
    { label: 'Dashboard', path: '/dashboard/freelancer', icon: LayoutDashboard },
    { label: 'Find Work', path: '/projects', icon: Search },
    { label: 'My Proposals', path: '/dashboard/freelancer/proposals', icon: FileText },
    { label: 'Active Contracts', path: '/dashboard/freelancer/contracts', icon: FileCheck2 },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Earnings & Payouts', path: '/dashboard/freelancer/earnings', icon: DollarSign },
    { label: 'Client Reviews', path: '/dashboard/freelancer/reviews', icon: Star },
    { label: 'Profile Settings', path: '/dashboard/freelancer/settings', icon: Settings },
  ];

  const navItems = isClient ? clientNav : freelancerNav;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-soft">
                <Briefcase className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                Skill<span className="text-primary-600 dark:text-primary-400">Hire</span>
              </span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Persona Chip */}
          <div className="p-4 mx-4 my-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <Avatar src={currentUser?.avatar} name={currentUser?.name} size="sm" isOnline={true} />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                {currentUser?.name}
              </span>
              <span className="text-[10px] text-slate-400 capitalize block">
                {role} account
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <Link
            to="/projects"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <span>Public Marketplace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>SkillHire</span>
              <span>/</span>
              <span className="capitalize">{role} Dashboard</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold capitalize">
                {location.pathname.split('/').pop().replace(/-/g, ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/messages"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>

            <Link
              to="/notifications"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
            </Link>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            <Link to={isClient ? '/dashboard/client/settings' : '/dashboard/freelancer/settings'} className="flex items-center gap-2">
              <Avatar src={currentUser?.avatar} name={currentUser?.name} size="sm" isOnline={true} />
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
