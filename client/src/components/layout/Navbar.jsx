// client/src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import {
  Briefcase,
  Search,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  Menu,
  PlusCircle,
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Loader2
} from 'lucide-react';

export function Navbar({ onMobileMenuToggle }) {
  const { currentUser, role, isAuthenticated, isLoading, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, conversations } = useMarketplace();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.isRead).length;
  const unreadMessages = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsProfileMenuOpen(false);
    await logout();
    setIsLoggingOut(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'freelancer') return '/dashboard/freelancer';
    if (role === 'admin') return '/admin';
    return '/dashboard/client';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Logo & Nav Links */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Skill<span className="text-primary-600 dark:text-primary-400">Hire</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/projects"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  location.pathname.startsWith('/projects')
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                Find Work
              </Link>
              <Link
                to="/freelancers"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  location.pathname.startsWith('/freelancers')
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                Find Freelancers
              </Link>
              <Link
                to="/categories"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  location.pathname === '/categories'
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                Categories
              </Link>
            </nav>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-sm">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search skills, projects, or talent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {/* Right: Actions, Theme, Auth, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isLoading ? (
              /* Loading state */
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              </div>
            ) : isAuthenticated ? (
              <>
                {/* Messages icon */}
                <Link
                  to="/messages"
                  aria-label="Messages"
                  className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
                  )}
                </Link>

                {/* Notifications dropdown trigger */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    aria-label="Notifications"
                    className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifs > 0 && (
                      <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 bg-rose-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft-lg p-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 px-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                        <Link
                          to="/notifications"
                          onClick={() => setIsNotifOpen(false)}
                          className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          View All ({notifications.length})
                        </Link>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 my-1">
                        {notifications.slice(0, 4).map((n) => (
                          <Link
                            key={n.id}
                            to={n.link || '/notifications'}
                            onClick={() => setIsNotifOpen(false)}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                              !n.isRead ? 'bg-primary-50/40 dark:bg-primary-950/20' : ''
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-primary-600 mt-1 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{n.title}</p>
                              <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-[11px] mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary CTA (Role aware) */}
                {role === 'client' && (
                  <Link to="/dashboard/client/projects/new" className="hidden sm:block">
                    <Button variant="primary" size="sm" icon={PlusCircle}>
                      Post Project
                    </Button>
                  </Link>
                )}

                {role === 'freelancer' && (
                  <Link to="/projects" className="hidden sm:block">
                    <Button variant="subtle" size="sm">
                      Find Projects
                    </Button>
                  </Link>
                )}

                {role === 'admin' && (
                  <Link to="/admin" className="hidden sm:block">
                    <Button variant="subtle" size="sm">
                      Admin Panel
                    </Button>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                  >
                    <Avatar
                      src={currentUser?.avatar}
                      name={currentUser?.name}
                      size="sm"
                      isOnline={true}
                    />
                    <div className="hidden xl:block text-left text-xs">
                      <span className="font-bold text-slate-900 dark:text-white block leading-tight truncate max-w-[120px]">
                        {currentUser?.name}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize block">
                        {role}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft-lg p-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                        <Badge variant="primary" size="sm" className="mt-1.5 capitalize">
                          {role} Account
                        </Badge>
                      </div>

                      <div className="space-y-0.5 text-xs">
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>Dashboard</span>
                        </Link>

                        {role === 'freelancer' && currentUser?.id && (
                          <Link
                            to={`/freelancers/${currentUser.id}`}
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            <span>Public Profile</span>
                          </Link>
                        )}

                        {role !== 'admin' && (
                          <Link
                            to={`/dashboard/${role}/settings`}
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-400" />
                            <span>Settings</span>
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left disabled:opacity-50"
                        >
                          {isLoggingOut ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4" />
                          )}
                          <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}