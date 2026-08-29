// client/src/pages/freelancer/FreelancerSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { DollarSign, MapPin, Save, Loader2, Briefcase, GraduationCap, Languages } from 'lucide-react';

export function FreelancerSettingsPage() {
  const { currentUser, profile, fetchProfile, saveProfile, isProfileLoading } = useAuth();
  const toast = useToast();

  // Form state
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [experienceYears, setExperienceYears] = useState(0);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [skillsInput, setSkillsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const result = await fetchProfile();
    
    if (result.success && result.data.profile) {
      const p = result.data.profile;
      setHeadline(p.headline || '');
      setBio(p.bio || '');
      setHourlyRate(p.hourlyRate || 0);
      setExperienceYears(p.experienceYears || 0);
      setCountry(p.location?.country || '');
      setState(p.location?.state || '');
      setCity(p.location?.city || '');
      setAvailabilityStatus(p.availability?.status || 'available');
      setHoursPerWeek(p.availability?.hoursPerWeek || 40);
      setSkillsInput(p.skills?.map(s => s.name || s).join(', ') || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!headline.trim()) {
      toast.warning('Headline Required', 'Please enter your professional headline.');
      return;
    }

    if (!bio.trim()) {
      toast.warning('Bio Required', 'Please enter your professional bio.');
      return;
    }

    if (hourlyRate < 0) {
      toast.warning('Invalid Rate', 'Hourly rate must be positive.');
      return;
    }

    setIsSaving(true);

    const profileData = {
      headline,
      bio,
      hourlyRate: Number(hourlyRate),
      experienceYears: Number(experienceYears),
      location: {
        country,
        state,
        city
      },
      availability: {
        status: availabilityStatus,
        hoursPerWeek: Number(hoursPerWeek)
      },
      skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean)
    };

    const result = await saveProfile(profileData);
    setIsSaving(false);

    if (result.success) {
      toast.success('Profile Saved', 'Your freelancer profile has been updated successfully.');
      // Reload profile to get updated data
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
        <Badge variant="primary" size="sm" className="mb-2">Talent Profile Configuration</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Freelancer Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Adjust your professional headline, hourly rate, availability, and background
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Professional Identity
          </h3>

          <div className="flex items-center gap-5">
            <Avatar src={currentUser?.avatar} name={currentUser?.name} size="xl" isOnline={true} />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser?.name}</p>
              <p className="text-xs text-slate-400">{currentUser?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Professional Headline"
              placeholder="Senior Full Stack MERN Developer"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              icon={Briefcase}
              required
            />

            <Input
              label="Hourly Rate ($/hr)"
              type="number"
              min="0"
              placeholder="30"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              icon={DollarSign}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Experience (Years)"
              type="number"
              min="0"
              placeholder="5"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              icon={GraduationCap}
            />

            <Input
              label="Skills (comma separated)"
              placeholder="React, Node.js, MongoDB"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
            />
          </div>

          <Textarea
            label="Professional Bio"
            placeholder="Describe your skills, experience, and what you specialize in..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
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
              placeholder="West Bengal"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <Input
              label="City"
              placeholder="Kolkata"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>

        {/* Availability Card */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Availability
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <Input
              label="Hours Per Week"
              type="number"
              min="0"
              max="168"
              placeholder="40"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" icon={Save} isLoading={isSaving} className="font-bold shadow-md">
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}