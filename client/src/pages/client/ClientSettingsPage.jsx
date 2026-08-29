// client/src/pages/client/ClientSettingsPage.jsx
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
  Building, 
  MapPin, 
  Globe, 
  Save, 
  Loader2, 
  Factory, 
  Camera,
  Trash2,
  Mail,
  Users,
  Briefcase,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export function ClientSettingsPage() {
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

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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
      
      // Calculate completion
      calculateCompletion(p);
    }
  };

  const calculateCompletion = (p) => {
    let score = 0;
    if (p.companyName) score += 25;
    if (p.industry) score += 15;
    if (p.website) score += 15;
    if (p.bio) score += 25;
    if (p.location?.country) score += 10;
    if (p.location?.city) score += 10;
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
      toast.success('Avatar Updated', 'Your company logo has been updated.');
    } else {
      setAvatarError(result.error);
      toast.error('Upload Failed', result.error);
    }

    e.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    const result = await removeAvatar();
    
    if (result.success) {
      toast.success('Avatar Removed', 'Your company logo has been removed.');
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
        toast.success('Avatar Updated', 'Your company logo has been updated.');
      } else {
        setAvatarError(result.error);
        toast.error('Upload Failed', result.error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName.trim()) {
      toast.warning('Company Name Required', 'Please enter your company name.');
      return;
    }

    if (!bio.trim()) {
      toast.warning('Bio Required', 'Please enter a company bio.');
      return;
    }

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
      {/* Header with completion */}
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">Account Administration</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Company & Client Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete your company profile to attract better freelancers
          </p>
        </div>

        {/* Completion indicator */}
        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800">
            <div className="w-10 h-10 rounded-full flex items-center justify-center relative">
              <svg className="w-10 h-10 rotate-[-90deg]">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle 
                  cx="20" cy="20" r="16" fill="none" 
                  stroke="#4F46E5" strokeWidth="3" 
                  strokeDasharray={`${completionPercentage * 1.005} 100.5`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-primary-700 dark:text-primary-400">
                {completionPercentage}%
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-primary-700 dark:text-primary-400">Profile Completion</p>
              <p className="text-[10px] text-primary-600 dark:text-primary-500">Add more details to improve</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Profile Card with Drag & Drop */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Company Profile
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
                name={companyName || currentUser?.name} 
                size="xl" 
                isOnline={true} 
              />
              
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isAvatarUploading}
                className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                aria-label="Upload logo"
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
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isDragging ? 'Drop logo here!' : 'Drag & drop or click to upload company logo'}
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
                  {isAvatarUploading ? 'Uploading...' : 'Change Logo'}
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
                <Briefcase className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {profile.projectsPosted || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Projects Posted</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {profile.totalHired || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Freelancers Hired</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                <CreditCard className="w-6 h-6 text-purple-600 mx-auto mb-2" />
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