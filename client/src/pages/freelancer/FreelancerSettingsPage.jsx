// client/src/pages/freelancer/FreelancerSettingsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { UploadProgress } from '../../components/upload/UploadProgress';
import { 
  DollarSign, 
  MapPin, 
  Save, 
  Loader2, 
  Briefcase, 
  GraduationCap, 
  Camera,
  Trash2,
  Languages,
  Mail,
  Clock,
  User
} from 'lucide-react';

export function FreelancerSettingsPage() {
  const { 
    currentUser, 
    profile, 
    fetchProfile, 
    saveProfile, 
    isProfileLoading,
    uploadAvatar,
    removeAvatar,
    isAvatarUploading
  } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Form state - Professional
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [experienceYears, setExperienceYears] = useState(0);
  const [skillsInput, setSkillsInput] = useState('');
  
  // Form state - Location
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  
  // Form state - Availability
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  
  // Form state - Languages
  const [languagesInput, setLanguagesInput] = useState('');
  
  // Form state - Education
  const [educationInput, setEducationInput] = useState('');
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

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
      setSkillsInput(p.skills?.map(s => typeof s === 'string' ? s : s.name).join(', ') || '');
      setLanguagesInput(p.languages?.map(l => `${l.name} (${l.level})`).join(', ') || '');
      setEducationInput(p.education?.map(e => `${e.institution} - ${e.degree}`).join(', ') || '');
      
      calculateCompletion(p);
    }
  };

  const calculateCompletion = (p) => {
    let score = 0;
    if (p.headline) score += 15;
    if (p.bio) score += 20;
    if (p.hourlyRate > 0) score += 10;
    if (p.experienceYears > 0) score += 5;
    if (p.location?.country) score += 10;
    if (p.location?.city) score += 5;
    if (p.skills?.length > 0) score += 15;
    if (p.languages?.length > 0) score += 10;
    if (p.education?.length > 0) score += 10;
    setCompletionPercentage(score);
  };

  // Avatar handlers
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarError(null);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    const result = await uploadAvatar(file);

    URL.revokeObjectURL(previewUrl);
    setAvatarPreview(null);

    if (result.success) {
      toast.success('Avatar Updated', 'Your profile photo has been updated.');
    } else {
      setAvatarError(result.error);
      toast.error('Upload Failed', result.error);
    }

    e.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    const result = await removeAvatar();
    
    if (result.success) {
      toast.success('Avatar Removed', 'Your profile photo has been removed.');
    } else {
      toast.error('Remove Failed', result.error);
    }
  };

  // Drag & Drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setAvatarError(null);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      const result = await uploadAvatar(file);

      URL.revokeObjectURL(previewUrl);
      setAvatarPreview(null);

      if (result.success) {
        toast.success('Avatar Updated', 'Your profile photo has been updated.');
      } else {
        setAvatarError(result.error);
        toast.error('Upload Failed', result.error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    // Valid language levels matching model enum
    const validLevels = ['basic', 'conversational', 'fluent', 'native'];

    // Parse languages with validation and typo correction
    const languages = languagesInput.split(',').map(l => {
      const trimmed = l.trim();
      if (!trimmed) return null;
      
      const match = trimmed.match(/^(.+?)\s*\((.+)\)$/);
      
      let name = trimmed;
      let level = 'conversational';
      
      if (match) {
        name = match[1].trim();
        const parsedLevel = match[2].trim().toLowerCase();
        
        // Fix common typos
        const levelMap = {
          'fluennt': 'fluent',
          'fluently': 'fluent',
          'natve': 'native',
          'nativ': 'native',
          'conversation': 'conversational',
          'basicc': 'basic',
        };
        
        level = levelMap[parsedLevel] || (validLevels.includes(parsedLevel) ? parsedLevel : 'conversational');
      }
      
      return { name, level };
    }).filter(Boolean);

    // Parse education
    const education = educationInput.split(',').map(e => {
      const trimmed = e.trim();
      if (!trimmed) return null;
      
      const parts = trimmed.split('-');
      return {
        institution: parts[0]?.trim() || '',
        degree: parts[1]?.trim() || '',
        field: '',
      };
    }).filter(e => e && e.institution);

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
      skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
      languages,
      education
    };

    const result = await saveProfile(profileData);
    setIsSaving(false);

    if (result.success) {
      toast.success('Profile Saved', 'Your freelancer profile has been updated successfully.');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">Talent Profile Configuration</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Freelancer Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete your profile to increase visibility and trust
          </p>
        </div>

        {/* Completion indicator */}
        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="w-10 h-10 rounded-full flex items-center justify-center relative">
              <svg className="w-10 h-10 rotate-[-90deg]">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle 
                  cx="20" cy="20" r="16" fill="none" 
                  stroke="#10b981" strokeWidth="3" 
                  strokeDasharray={`${completionPercentage * 1.005} 100.5`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                {completionPercentage}%
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Profile Completion</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500">Add more details to improve</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Professional Identity Card */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Professional Identity
          </h3>

          {/* Avatar with Drag & Drop */}
          <div 
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex items-center gap-5 p-4 rounded-2xl transition-all ${
              isDragging 
                ? 'bg-primary-50 dark:bg-primary-950/40 border-2 border-dashed border-primary-400' 
                : ''
            }`}
          >
            <div className="relative group">
              <Avatar 
                src={avatarPreview || currentUser?.avatar} 
                name={currentUser?.name} 
                size="xl" 
                isOnline={availabilityStatus === 'available'} 
              />
              
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isAvatarUploading}
                className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                aria-label="Upload profile photo"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {currentUser?.name}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Mail className="w-3 h-3" /> {currentUser?.email}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3" /> @{currentUser?.username}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isDragging ? 'Drop image here!' : 'Drag & drop or click to upload photo'}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Camera}
                  onClick={handleAvatarClick}
                  disabled={isAvatarUploading}
                  isLoading={isAvatarUploading}
                >
                  {isAvatarUploading ? 'Uploading...' : 'Change Photo'}
                </Button>

                {currentUser?.avatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={handleRemoveAvatar}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {isAvatarUploading && <UploadProgress progress={50} status="uploading" />}
          {avatarError && <UploadProgress progress={0} status="error" error={avatarError} />}

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

          <Input
            label="Languages (e.g., English (fluent), Hindi (native))"
            placeholder="English (fluent), Hindi (native)"
            value={languagesInput}
            onChange={(e) => setLanguagesInput(e.target.value)}
            icon={Languages}
          />

          <Input
            label="Education (e.g., IIT Kharagpur - B.Tech)"
            placeholder="IIT Kharagpur - B.Tech"
            value={educationInput}
            onChange={(e) => setEducationInput(e.target.value)}
            icon={GraduationCap}
          />

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
              icon={Clock}
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