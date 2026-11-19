import React from 'react';
import { Link } from 'react-router-dom';
import { timeAgo } from '../../utils/formatters';
import { FileText, CheckCircle, DollarSign, MessageSquare, AlertCircle } from 'lucide-react';

export function ActivityFeed({ activities = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case 'proposal':
        return <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl"><FileText className="w-3.5 h-3.5" /></div>;
      case 'contract':
      case 'hire':
        return <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl"><CheckCircle className="w-3.5 h-3.5" /></div>;
      case 'payment':
        return <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl"><DollarSign className="w-3.5 h-3.5" /></div>;
      case 'message':
        return <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl"><MessageSquare className="w-3.5 h-3.5" /></div>;
      default:
        return <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl"><AlertCircle className="w-3.5 h-3.5" /></div>;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((item, idx) => (
        <div key={item.id || idx} className="flex items-start gap-3 text-xs">
          {getIcon(item.type)}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-slate-900 dark:text-slate-100 font-medium leading-snug">
              {item.title}
            </p>
            {item.description && (
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
            )}
            <span className="text-[11px] text-slate-400 block mt-1">{item.timestamp || timeAgo(item.createdAt)}</span>
          </div>
          {item.link && (
            <Link to={item.link} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline shrink-0 self-center">
              View
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
