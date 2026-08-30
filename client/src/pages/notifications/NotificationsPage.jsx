// client/src/pages/notifications/NotificationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMyNotifications, markAsRead, markAllAsRead } from '../../services/notification.service';
import { onReceiveNotification } from '../../services/socket.service';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import {
  Bell,
  CheckCheck,
  FileCheck2,
  DollarSign,
  Star,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Loader2,
  Check
} from 'lucide-react';

export function NotificationsPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Fetch notifications from backend
  const fetchNotifications = useCallback(async (page = 1, filter = 'all') => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20 };
      
      if (filter === 'unread') {
        params.read = 'false';
      } else if (filter !== 'all') {
        params.type = filter;
      }

      const response = await getMyNotifications(params);
      
      if (response.success) {
        setNotifications(response.notifications);
        setTotalPages(response.totalPages || 1);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(currentPage, activeFilter);
    }
  }, [isAuthenticated, currentPage, activeFilter, fetchNotifications]);

  // ✅ Listen for real-time notifications
  useEffect(() => {
    const unsubscribe = onReceiveNotification((data) => {
      if (data?.notification) {
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Optional: Show toast
        // toast.success(data.notification.title, data.notification.message);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'proposal': return <Sparkles className="w-4 h-4 text-primary-500" />;
      case 'contract': return <FileCheck2 className="w-4 h-4 text-emerald-500" />;
      case 'payment': return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'review': return <Star className="w-4 h-4 text-purple-500" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  // ✅ Handle mark single as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // ✅ Handle mark all as read
  const handleMarkAll = async () => {
    try {
      const response = await markAllAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success('Marked as Read', 'All notifications have been marked as read.');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.isRead;
    return n.type === activeFilter;
  });

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">Notifications Feed</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notifications`
              : 'You are all caught up!'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAll}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-850/60 rounded-xl overflow-x-auto text-xs font-semibold">
        {['all', 'unread', 'proposal', 'contract', 'payment', 'review'].map(f => (
          <button
            key={f}
            onClick={() => {
              setActiveFilter(f);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg capitalize whitespace-nowrap transition-all ${
              activeFilter === f
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {f === 'all' ? 'All Notifications' : f}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                !notif.isRead
                  ? 'bg-primary-50/30 dark:bg-primary-950/20 border-primary-200/80 dark:border-primary-800/80 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {notif.title}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    {notif.isRead ? (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-primary-600" />
                    )}
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.link && (
                  <Link
                    to={notif.link}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline mt-2"
                  >
                    <span>Take Action</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are all caught up! Updates regarding bids and contracts will appear here."
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}