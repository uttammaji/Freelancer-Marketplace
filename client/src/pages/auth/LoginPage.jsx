import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Briefcase, Lock, Mail, ArrowRight, UserCheck, Shield, Sparkles } from 'lucide-react';

export function LoginPage() {
  const { login, switchRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Input Required', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(email, password);
      setIsLoading(false);
      toast.success('Welcome Back!', 'Logged in successfully.');
      navigate('/dashboard/client');
    }, 600);
  };

  const handleQuickLogin = (roleName, targetPath) => {
    switchRole(roleName);
    toast.success('Quick Demo Login', `Logged in as ${roleName.toUpperCase()}`);
    navigate(targetPath);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-8 rounded-3xl shadow-soft-lg">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-soft">
              <Briefcase className="w-5 h-5 stroke-[2.2]" />
            </div>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign in to SkillHire
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your details or use instant demo personas below
          </p>
        </div>

        {/* 1-Click Demo Persona Logins */}
        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" /> Instant Demo Personas
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('client', '/dashboard/client')}
              className="p-2 text-center bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
            >
              <Briefcase className="w-4 h-4 mx-auto text-primary-600 dark:text-primary-400 mb-1" />
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Client</span>
              <span className="text-[10px] text-slate-400 block truncate">Sarah C.</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('freelancer', '/dashboard/freelancer')}
              className="p-2 text-center bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
            >
              <UserCheck className="w-4 h-4 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Freelancer</span>
              <span className="text-[10px] text-slate-400 block truncate">Rahul S.</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin', '/admin')}
              className="p-2 text-center bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
            >
              <Shield className="w-4 h-4 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Admin</span>
              <span className="text-[10px] text-slate-400 block truncate">Alex S.</span>
            </button>
          </div>
        </div>

        {/* Traditional Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        {/* Social Sign-in */}
        <div className="space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-xs text-slate-400 uppercase font-semibold">
              Or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleQuickLogin('client', '/dashboard/client')}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
            </svg>
            <span>Google Workspace</span>
          </button>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
