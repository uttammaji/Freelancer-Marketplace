// client/src/pages/client/ClientSettingsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { SettingsLayout } from '../../components/settings/SettingsLayout';
import { ChangePasswordModal } from '../../components/settings/ChangePasswordModal';
import { PhoneVerificationModal } from '../../components/settings/PhoneVerificationModal';
import { EmailChangeModal } from '../../components/settings/EmailChangeModal';
import { LocationSelect } from '../../components/settings/LocationSelect';
import { 
  Building, Globe, Save, Loader2, Factory,
  Camera, Trash2, Mail, User, Shield, Phone,
  CheckCircle2, AlertCircle
} from 'lucide-react';

export function ClientSettingsPage() {
  const { 
    currentUser, profile, fetchProfile, saveProfile, isProfileLoading,
    uploadAvatar, removeAvatar, isAvatarUploading,
    changeUsername,
  } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('profile');

  // Modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState({ country: '', state: '', city: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUsernameSaving, setIsUsernameSaving] = useState(false);

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
      setUsername(currentUser?.username || '');
      setLocation(p.location || { country: '', state: '', city: '' });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !bio.trim()) {
      toast.warning('Required Fields', 'Company name and bio are required.');
      return;
    }

    if (website && !website.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      toast.warning('Invalid Website', 'Please enter a valid website URL.');
      return;
    }

    setIsSaving(true);
    const profileData = {
      companyName, industry, website, bio, location,
    };
    const result = await saveProfile(profileData);
    setIsSaving(false);

    if (result.success) {
      toast.success('Profile Saved', 'Your company profile has been updated.');
    } else {
      toast.error('Save Failed', result.error);
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) return;
    setIsUsernameSaving(true);
    const result = await changeUsername(username);
    setIsUsernameSaving(false);
    if (result.success) {
      toast.success('Username Updated', `@${result.data.user.username}`);
    } else {
      toast.error('Update Failed', result.error);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = await uploadAvatar(file);
    if (result.success) {
      toast.success('Logo Updated', 'Company logo updated.');
    } else {
      toast.error('Upload Failed', result.error);
    }
    e.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    const result = await removeAvatar();
    if (result.success) toast.success('Logo Removed', 'Company logo removed.');
    else toast.error('Remove Failed', result.error);
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* ============ PROFILE TAB ============ */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Logo & Username Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Company Logo & Username</h3>
            
            <div className="flex items-center gap-5">
              <div className="relative group">
                <Avatar src={currentUser?.avatar} name={companyName || currentUser?.name} size="xl" isOnline={true} />
                <button onClick={handleAvatarClick} className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={Camera} onClick={handleAvatarClick} isLoading={isAvatarUploading}>
                    Change Logo
                  </Button>
                  {currentUser?.avatar && (
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={handleRemoveAvatar} className="text-rose-600">
                      Remove
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      label="Username"
                      placeholder="your_username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      icon={User}
                    />
                  </div>
                  <Button variant="primary" size="sm" onClick={handleSaveUsername} isLoading={isUsernameSaving} className="mt-5">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Company Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Company Name" placeholder="Tech Solutions Pvt Ltd" value={companyName} onChange={(e) => setCompanyName(e.target.value)} icon={Building} required />
              <Input label="Industry" placeholder="Software Development" value={industry} onChange={(e) => setIndustry(e.target.value)} icon={Factory} />
            </div>

            <Input label="Company Website" placeholder="https://techsolutions.com" value={website} onChange={(e) => setWebsite(e.target.value)} icon={Globe} />

            <Textarea label="Company Bio" placeholder="Tell freelancers about your company..." value={bio} onChange={(e) => setBio(e.target.value)} rows={4} required />
          </div>

          {/* Location Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <LocationSelect value={location} onChange={setLocation} />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button variant="primary" size="lg" icon={Save} onClick={handleSaveProfile} isLoading={isSaving}>
              Save Profile
            </Button>
          </div>
        </div>
      )}

      {/* ============ SECURITY TAB ============ */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h3>
                  <p className="text-xs text-slate-400">Update your account password</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(true)}>
                Change Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============ PHONE TAB ============ */}
      {activeTab === 'phone' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-8 h-8 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Phone Number</h3>
                  {currentUser?.isPhoneVerified ? (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified: +91 {currentUser?.phone?.slice(-4)}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Not verified
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsPhoneModalOpen(true)}>
                {currentUser?.isPhoneVerified ? 'Change Phone' : 'Verify Phone'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============ EMAIL TAB ============ */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-primary-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email Address</h3>
                  <p className="text-xs text-slate-400">{currentUser?.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEmailModalOpen(true)}>
                Change Email
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
      <PhoneVerificationModal isOpen={isPhoneModalOpen} onClose={() => setIsPhoneModalOpen(false)} isChanging={currentUser?.isPhoneVerified} />
      <EmailChangeModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </SettingsLayout>
  );
}