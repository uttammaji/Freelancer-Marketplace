import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { DollarSign, MapPin, Mail, Sparkles, Save, Check } from 'lucide-react';

export function FreelancerSettingsPage() {
  const { currentUser, updateProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(currentUser?.name || 'Rahul Sharma');
  const [title, setTitle] = useState(currentUser?.title || 'Senior Full Stack & AI Engineer');
  const [email, setEmail] = useState(currentUser?.email || 'rahul.sharma@devstack.io');
  const [hourlyRate, setHourlyRate] = useState(65);
  const [location, setLocation] = useState(currentUser?.location || 'Bengaluru, India');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateProfile({
        name,
        title,
        email,
        hourlyRate,
        location,
        bio
      });
      setIsSaving(false);
      toast.success('Profile Updated', 'Your freelancer settings have been saved.');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <Badge variant="primary" size="sm" className="mb-2">Talent Profile Configuration</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Freelancer Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Adjust your public hourly rate, professional title, availability badge, and background
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Public Presence
          </h3>

          <div className="flex items-center gap-5">
            <Avatar src={currentUser?.avatar} name={name} size="xl" isOnline={isAvailable} />
            <div>
              <Button variant="outline" size="sm">
                Change Avatar Photo
              </Button>
              <p className="text-[11px] text-slate-400 mt-1">Professional portrait recommended.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Professional Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hourly Rate ($/hr)"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              icon={DollarSign}
              required
            />
            <Input
              label="Location / Timezone"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              icon={MapPin}
              required
            />
          </div>

          <Textarea
            label="Professional Bio & Summary"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
          />

          {/* Availability Status */}
          <div className="p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Available for New Projects</span>
              <span className="text-[11px] text-slate-400">Display green "Available" badge on your marketplace card.</span>
            </div>
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-5 w-5"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" icon={Save} isLoading={isSaving} className="font-bold shadow-md">
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
