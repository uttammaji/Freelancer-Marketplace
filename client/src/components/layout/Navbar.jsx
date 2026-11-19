// client/src/components/layout/Navbar.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { onReceiveNotification } from '../../services/socket.service';
import { getMyNotifications } from '../../services/notification.service';
import { getMyConversations } from '../../services/message.service';
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
  Loader2,
  ChevronDown,
} from 'lucide-react';

export function Navbar({ onMobileMenuToggle }) {
  const { currentUser, role, isAuthenticated, isLoading, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Track scroll to add subtle shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getMyNotifications({ limit: 5 });
      if (response.success) {
        setNotifications(response.notifications || []);
        setUnreadNotifs(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  const fetchUnreadMessages = useCallback(async () => {
    try {
      const response = await getMyConversations();
      if (response.success) {
        const totalUnread = (response.conversations || []).reduce(
          (sum, c) => sum + (c.unreadCount || 0), 0
        );
        setUnreadMessages(totalUnread);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadMessages();
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadMessages]);

  useEffect(() => {
    const unsubscribe = onReceiveNotification((data) => {
      if (data?.notification) {
        setNotifications(prev => [data.notification, ...prev].slice(0, 5));
        setUnreadNotifs(prev => prev + 1);
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const navLinkClass = (active) =>
    `relative px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 rounded-xl ${
      active
        ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40'
        : 'text-slate-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
    }`;

  return (
    <header
      className={`glass-surface sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 transition-shadow duration-200 ${
        isScrolled ? 'shadow-soft' : ''
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-[72px] gap-4">

          {/* ── Logo ── */}
          <div className="flex items-center gap-6 lg:gap-8 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-odoo group-hover:bg-primary-700 transition-colors">
                <Briefcase className="w-4.5 h-4.5 stroke-[2.2]" style={{ width: '18px', height: '18px' }} />
              </div>
              <span
                className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                style={{ fontFamily: "'Manrope', 'DM Sans', sans-serif" }}
              >
                Skill<span className="text-primary-600 dark:text-primary-400">Hire</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-0.5">
              <Link
                to="/projects"
                className={navLinkClass(location.pathname.startsWith('/projects'))}
              >
                Find Work
              </Link>
              <Link
                to="/freelancers"
                className={navLinkClass(location.pathname.startsWith('/freelancers'))}
              >
                Find Talent
              </Link>
              <Link
                to="/categories"
                className={navLinkClass(location.pathname === '/categories')}
              >
                Categories
              </Link>
              <Link
                to="/how-it-works"
                className={navLinkClass(location.pathname === '/how-it-works')}
              >
                How It Works
              </Link>
            </nav>
          </div>

          {/* ── Search Bar ── */}
          <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-sm">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search skills, talent, projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500 transition-all"
              />
            </form>
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark
                ? <Sun className="w-4.5 h-4.5 text-amber-400" style={{ width: '18px', height: '18px' }} />
                : <Moon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
              }
            </button>

            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : isAuthenticated ? (
              <>
                {/* Messages */}
                <Link
                  to="/messages"
                  aria-label="Messages"
                  className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <MessageSquare className="w-[18px] h-[18px]" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1 right-1 px-1 min-w-[14px] h-[14px] bg-primary-600 text-[9px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                      {unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <div className="relative" ref={notifMenuRef}>
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    aria-label="Notifications"
                    className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Bell className="w-[18px] h-[18px]" />
                    {unreadNotifs > 0 && (
                      <span className="absolute top-1 right-1 px-1 min-w-[14px] h-[14px] bg-rose-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-soft-lg p-3 z-50 animate-fade-in">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 px-1 mb-1">
                        <span
                          className="text-sm font-bold text-slate-900 dark:text-white"
                          style={{ fontFamily: "'Nunito Sans', Inter, sans-serif" }}
                        >
                          Notifications
                        </span>
                        <Link
                          to="/notifications"
                          onClick={() => setIsNotifOpen(false)}
                          className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        >
                          View All
                        </Link>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <Link
                              key={n._id}
                              to={n.link || '/notifications'}
                              onClick={() => setIsNotifOpen(false)}
                              className={`flex items-start gap-3 p-2.5 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                                !n.isRead ? 'bg-primary-50/50 dark:bg-primary-950/20' : ''
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full bg-primary-600 mt-1.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white line-clamp-1 text-xs">{n.title}</p>
                                <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-[11px] mt-0.5">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <p className="text-center text-sm text-slate-400 py-6">No notifications yet</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Project CTA */}
                {role === 'client' && (
                  <Link to="/dashboard/client/projects/new" className="hidden sm:block">
                    <Button variant="primary" size="sm" icon={PlusCircle}>Post Project</Button>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Avatar src={currentUser?.avatar} name={currentUser?.name} size="sm" />
                    <div className="hidden xl:block text-left">
                      <span className="text-xs font-bold block leading-tight truncate max-w-[120px] text-slate-900 dark:text-white">
                        {currentUser?.name}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize block">{role}</span>
                    </div>
                    <ChevronDown className="hidden xl:block w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-soft-lg p-2 z-50 animate-fade-in">
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p
                          className="text-sm font-bold truncate text-slate-900 dark:text-white"
                          style={{ fontFamily: "'Nunito Sans', Inter, sans-serif" }}
                        >
                          {currentUser?.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                        <Badge variant="primary" size="sm" className="mt-1.5 capitalize">{role} Account</Badge>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Dashboard
                        </Link>
                        {role !== 'admin' && (
                          <Link
                            to={`/dashboard/${role}/settings`}
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-400" />
                            Settings
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left disabled:opacity-50 transition-colors"
                        >
                          {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                          {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

export default Navbar;