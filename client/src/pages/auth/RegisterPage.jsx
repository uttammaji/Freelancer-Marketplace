import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Briefcase, UserCheck, Mail, Lock, User, Check, Sparkles } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [roleSelection, setRoleSelection] = useState('client'); // 'client' or 'freelancer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.warning('Fields Required', 'Please complete all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      toast.warning('Terms Required', 'Please agree to the Terms of Service.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      register({
        name,
        email,
        role: roleSelection
      });
      setIsLoading(false);
      toast.success('Account Created! 🎉', `Welcome to SkillHire as a ${roleSelection === 'client' ? 'Client' : 'Freelancer'}.`);
      navigate(roleSelection === 'client' ? '/dashboard/client' : '/dashboard/freelancer');
    }, 700);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-8 rounded-3xl shadow-soft-lg">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-soft">
              <Briefcase className="w-5 h-5 stroke-[2.2]" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Join SkillHire
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose your account objective to get started
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setRoleSelection('client')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              roleSelection === 'client'
                ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 text-primary-900 dark:text-white shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              {roleSelection === 'client' && <Check className="w-4 h-4 text-primary-600" />}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              I want to hire freelancers
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Post projects & hire top talent
            </p>
          </div>

          <div
            onClick={() => setRoleSelection('freelancer')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              roleSelection === 'freelancer'
                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-white shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {roleSelection === 'freelancer' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              I want to work as freelancer
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Find jobs & earn with escrow
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Sarah Connor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={User}
            required
          />

          <Input
            label="Work Email"
            type="email"
            placeholder="sarah@nexusinnovations.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              required
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400 pt-1">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 mt-0.5"
            />
            <span>
              I agree to the SkillHire <a href="#" className="text-primary-600 dark:text-primary-400 underline">Terms of Service</a> and <a href="#" className="text-primary-600 dark:text-primary-400 underline">Privacy Policy</a>.
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-md"
            isLoading={isLoading}
          >
            Create My {roleSelection === 'client' ? 'Client' : 'Freelancer'} Account
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
