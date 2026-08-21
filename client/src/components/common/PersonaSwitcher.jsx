import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Users, Shield, Briefcase, UserCheck, Eye, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PersonaSwitcher() {
  const { currentUser, role, switchRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const personas = [
    {
      role: 'client',
      name: 'Sarah Connor',
      sub: 'VP of Product @ Nexus Innovations',
      icon: Briefcase,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
      dashboardPath: '/dashboard/client'
    },
    {
      role: 'freelancer',
      name: 'Rahul Sharma',
      sub: 'Senior Full Stack & AI Engineer',
      icon: UserCheck,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
      dashboardPath: '/dashboard/freelancer'
    },
    {
      role: 'admin',
      name: 'Alex Sterling',
      sub: 'Platform Operations Director',
      icon: Shield,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60',
      dashboardPath: '/admin'
    },
    {
      role: 'guest',
      name: 'Guest Visitor',
      sub: 'Public Marketplace Browsing',
      icon: Eye,
      color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
      dashboardPath: '/'
    }
  ];

  const handleSelect = (p) => {
    switchRole(p.role);
    toast.success('Switched Persona', `Active profile: ${p.name} (${p.role.toUpperCase()})`);
    if (p.role !== 'guest') {
      navigate(p.dashboardPath);
    } else {
      navigate('/');
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 left-5 z-40">
      <div className="relative">
        {/* Toggle Pill */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/90 dark:bg-slate-800/90 text-white rounded-full shadow-soft-lg backdrop-blur-md border border-slate-700/80 hover:bg-slate-800 text-xs font-semibold transition-all hover:scale-105"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Role: <span className="capitalize text-primary-300 font-bold">{role}</span></span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-12 left-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft-lg p-2 flex flex-col gap-1 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick Persona Switcher</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Test complete marketplace workflows</p>
            </div>

            {personas.map((p) => {
              const Icon = p.icon;
              const isCurrent = role === p.role;
              return (
                <button
                  key={p.role}
                  onClick={() => handleSelect(p)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${p.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">{p.sub}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
