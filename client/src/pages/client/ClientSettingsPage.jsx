// client/src/pages/client/ClientSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Building, Mail, MapPin, Globe, Save, Loader2, Factory, Building2, Briefcase } from 'lucide-react';

export function ClientSettingsPage() {
  const { currentUser, profile, fetchProfile, saveProfile, isProfileLoading } = useAuth();
  const toast = useToast();

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const result = await fetchProfile();
    
    if (result.success && result.data.profile) {
      const p = result.data.profile;
      setCompanyName(p.companyName || '');
      setIndustry(p.industry || '');
      setWebsite(p.website || '');
      setBio(p.bio || '');
      setCountry(p.location?.country || '');
      setState(p.location?.state || '');
      setCity(p.location?.city || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!companyName.trim()) {
      toast.warning('Company Name Required', 'Please enter your company name.');
      return;
    }

    if (!bio.trim()) {
      toast.warning('Bio Required', 'Please enter a company bio.');
      return;
    }

    // Validate website URL (optional)
    if (website && !website.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      toast.warning('Invalid Website', 'Please enter a valid website URL.');
      return;
    }

    setIsSaving(true);

    const profileData = {
      companyName,
      industry,
      website,
      bio,
      location: {
        country,
        state,
        city
      }
    };

    const result = await saveProfile(profileData);
    setIsSaving(false);

    if (result.success) {
      toast.success('Profile Saved', 'Your client profile has been updated successfully.');
      await fetchProfile();
    } else {
      toast.error('Save Failed', result.error);
    }
  };

  // Loading state
  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <Badge variant="primary" size="sm" className="mb-2">Account Administration</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Company & Client Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your company profile and organization details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Profile Card */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Company Profile
          </h3>

          <div className="flex items-center gap-5">
            <Avatar src={currentUser?.avatar} name={companyName || currentUser?.name} size="xl" isOnline={true} />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser?.name}</p>
              <p className="text-xs text-slate-400">{currentUser?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              placeholder="Tech Solutions Pvt Ltd"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              icon={Building}
              required
            />

            <Input
              label="Industry"
              placeholder="Software Development"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              icon={Factory}
            />
          </div>

          <Input
            label="Company Website"
            placeholder="https://techsolutions.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            icon={Globe}
          />

          <Textarea
            label="Company Bio & Overview"
            placeholder="Tell freelancers about your company, products, and culture..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            required
          />
        </div>

        {/* Location Card */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Country"
              placeholder="India"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              icon={MapPin}
            />
            <Input
              label="State"
              placeholder="Maharashtra"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <Input
              label="City"
              placeholder="Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>

        {/* Company Stats (Read-only) */}
        {profile && (
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              Company Statistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {profile.projectsPosted || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Projects Posted</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {profile.totalHired || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Freelancers Hired</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${profile.totalSpent?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Spent</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" icon={Save} isLoading={isSaving} className="font-bold shadow-md">
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}