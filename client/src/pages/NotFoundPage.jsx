import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Briefcase, ArrowLeft, Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 mx-auto flex items-center justify-center font-black text-2xl shadow-soft">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            The page or marketplace resource you are looking for might have been moved or removed.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="primary" size="md" icon={Home}>
              Back to Home
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="outline" size="md" icon={Search}>
              Browse Projects
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
