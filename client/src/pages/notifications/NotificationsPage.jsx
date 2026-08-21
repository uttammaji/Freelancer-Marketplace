import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Bell,
  Check,
  CheckCheck,
  FileCheck2,
  DollarSign,
  Star,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useMarketplace();
  const toast = useToast();

  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.isRead;
    return n.type === activeFilter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'proposal': return <Sparkles className="w-4 h-4 text-primary-500" />;
      case 'contract': return <FileCheck2 className="w-4 h-4 text-emerald-500" />;
      case 'payment': return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'review': return <Star className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleMarkAll = () => {
    markAllNotificationsAsRead();
    toast.success('Marked as Read', 'All notifications have been marked as read.');
  };

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
            Real-time updates regarding proposals, contract milestones, escrow releases, and reviews
          </p>
        </div>

        <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAll}>
          Mark All as Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-850/60 rounded-xl overflow-x-auto text-xs font-semibold">
        {['all', 'unread', 'proposal', 'contract', 'payment', 'review'].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
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
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
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
                  <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.link && (
                  <Link
                    to={notif.link}
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
    </div>
  );
}
