// client/src/components/settings/SettingsLayout.jsx
import React from 'react';
import { 
  User, 
  Shield, 
  Phone, 
  Mail, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export function SettingsLayout({ 
  activeTab, 
  onTabChange, 
  children,
  role = 'freelancer'
}) {
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal information' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password and account security' },
    { id: 'phone', label: 'Phone', icon: Phone, description: 'Verify and manage phone number' },
    { id: 'email', label: 'Email', icon: Mail, description: 'Manage email address' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              
              {/* Status indicators */}
              {tab.id === 'phone' && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
        {children}
      </div>
    </div>
  );
}