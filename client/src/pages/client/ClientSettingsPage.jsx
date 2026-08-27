import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Building, Mail, MapPin, Globe, Bell, Shield, Save } from 'lucide-react';

export function ClientSettingsPage() {
  const { currentUser, updateProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(currentUser?.name || 'Sarah Connor');
  const [company, setCompany] = useState(currentUser?.company || 'Nexus Innovations');
  const [email, setEmail] = useState(currentUser?.email || 'sarah@nexusinnovations.io');
  const [title, setTitle] = useState(currentUser?.title || 'VP of Product Engineering');
  const [location, setLocation] = useState(currentUser?.location || 'San Francisco, CA, USA');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [escrowNotifs, setEscrowNotifs] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateProfile({
        name,
        company,
        email,
        title,
        location,
        bio
      });
      setIsSaving(false);
      toast.success('Settings Saved', 'Your client profile has been updated.');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <Badge variant="primary" size="sm" className="mb-2">Account Administration</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Company & Client Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your organization profile, billing contact, and notification triggers
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Company Profile
          </h3>

          <div className="flex items-center gap-5">
            <Avatar src={currentUser?.avatar} name={name} size="xl" isOnline={true} />
            <div>
              <Button variant="outline" size="sm">
                Change Logo / Avatar
              </Button>
              <p className="text-[11px] text-slate-400 mt-1">JPG, GIF or PNG. 1MB max.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              icon={Building}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Professional Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label="Billing Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />
          </div>

          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            icon={MapPin}
          />

          <Textarea
            label="Company Bio & Overview"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell freelancers about your company, products, and culture..."
            rows={4}
          />
        </div>

        {/* Notifications Card */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Notification Preferences
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Email Proposal Alerts</span>
                <span className="text-slate-400">Receive instant alerts when freelancers submit proposals.</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Milestone Delivery Notifications</span>
                <span className="text-slate-400">Alerts when specialists upload code deliverables for review.</span>
              </div>
              <input
                type="checkbox"
                checked={escrowNotifs}
                onChange={(e) => setEscrowNotifs(e.target.checked)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" icon={Save} isLoading={isSaving} className="font-bold shadow-md">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
