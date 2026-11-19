// client/src/pages/client/ClientSettingsPage.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { SettingsLayout } from '../../components/settings/SettingsLayout';
import { ChangePasswordModal } from '../../components/settings/ChangePasswordModal';
import { PhoneVerificationModal } from '../../components/settings/PhoneVerificationModal';
import { EmailChangeModal } from '../../components/settings/EmailChangeModal';
import { LocationSelect } from '../../components/settings/LocationSelect';
import {
  Building,
  Globe,
  Save,
  Loader2,
  Factory,
  Camera,
  Trash2,
  Mail,
  User,
  Shield,
  Phone,
  CheckCircle2,
  AlertCircle,
  AtSign,
  RefreshCw,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const NAME_MAX = 80;
const BIO_MAX = 500;
const USERNAME_MIN = 3;
const USERNAME_MAX = 24;
const USERNAME_REGEX = /^[a-z0-9_]+$/;

const INITIAL_PROFILE_FORM = {
  companyName: '',
  industry: '',
  website: '',
  bio: '',
  location: { country: '', state: '', city: '' },
};

const INITIAL_USERNAME = '';

/**
 * Accept http://, https://, or bare domains.
 * Rejects localhost and bare IPs — those aren't real company websites.
 */
function isValidWebsite(url) {
  if (!url) return true;
  const trimmed = url.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    return Boolean(parsed.hostname) && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

const slugifyUsername = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ClientSettingsPage() {
  const {
    currentUser,
    fetchProfile,
    saveProfile,
    isProfileLoading,
    uploadAvatar,
    removeAvatar,
    isAvatarUploading,
    changeUsername,
  } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  /* ---------------- UI state ---------------- */
  const [activeTab, setActiveTab] = useState('profile');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  /* ---------------- Profile form state ---------------- */
  const [form, setForm] = useState(INITIAL_PROFILE_FORM);
  const [initialForm, setInitialForm] = useState(INITIAL_PROFILE_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  /* ---------------- Username state ---------------- */
  const [username, setUsername] = useState(INITIAL_USERNAME);
  const [initialUsername, setInitialUsername] = useState(INITIAL_USERNAME);
  const [usernameError, setUsernameError] = useState(null);
  const [isUsernameSaving, setIsUsernameSaving] = useState(false);

  /* ---------------- Derived: dirty flags ---------------- */
  const isProfileDirty = useMemo(() => {
    return (
      form.companyName !== initialForm.companyName ||
      form.industry !== initialForm.industry ||
      form.website !== initialForm.website ||
      form.bio !== initialForm.bio ||
      form.location?.country !== initialForm.location?.country ||
      form.location?.state !== initialForm.location?.state ||
      form.location?.city !== initialForm.location?.city
    );
  }, [form, initialForm]);

  const isUsernameDirty = useMemo(
    () => username !== initialUsername,
    [username, initialUsername]
  );

  const isAnythingDirty = isProfileDirty || isUsernameDirty;

  /* ---------------- Load profile ---------------- */
  const loadProfile = useCallback(async () => {
    try {
      const result = await fetchProfile();
      if (result?.success && result.data?.profile) {
        const p = result.data.profile;
        const loaded = {
          companyName: p.companyName || '',
          industry: p.industry || '',
          website: p.website || '',
          bio: p.bio || '',
          location: {
            country: p.location?.country || '',
            state: p.location?.state || '',
            city: p.location?.city || '',
          },
        };
        setForm(loaded);
        setInitialForm(loaded);
      }

      const loadedUsername = currentUser?.username || '';
      setUsername(loadedUsername);
      setInitialUsername(loadedUsername);
    } catch (error) {
      console.error('[ClientSettings] load profile failed:', error);
      toast.error('Load Failed', 'Could not load your profile.');
    }
  }, [fetchProfile, currentUser?.username, toast]);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- Unsaved-changes guard ---------------- */
  useEffect(() => {
    if (!isAnythingDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isAnythingDirty]);

  /* ---------------- Form helpers ---------------- */
  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFieldError = useCallback((key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  /* ---------------- Validation ---------------- */
  const validateForm = useCallback(() => {
    const next = {};

    const name = form.companyName.trim();
    if (!name) next.companyName = 'Company name is required.';
    else if (name.length > NAME_MAX)
      next.companyName = `Maximum ${NAME_MAX} characters.`;

    const bio = form.bio.trim();
    if (!bio) next.bio = 'Bio is required.';
    else if (bio.length > BIO_MAX)
      next.bio = `Maximum ${BIO_MAX} characters.`;
    else if (bio.length < 20)
      next.bio = 'Tell freelancers a bit more — at least 20 characters.';

    if (form.website && !isValidWebsite(form.website)) {
      next.website = 'Enter a valid website URL.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  /* ---------------- Save profile ---------------- */
  const handleSaveProfile = useCallback(
    async (e) => {
      e?.preventDefault?.();

      if (!isProfileDirty) return;

      if (!validateForm()) {
        toast.error('Invalid Form', 'Please fix the highlighted fields.');
        setTouched({
          companyName: true,
          bio: true,
          website: true,
        });
        return;
      }

      setIsSaving(true);
      try {
        const payload = {
          companyName: form.companyName.trim(),
          industry: form.industry.trim(),
          website: form.website.trim(),
          bio: form.bio.trim(),
          location: form.location,
        };

        const result = await saveProfile(payload);
        if (result?.success) {
          setInitialForm({ ...form });
          setTouched({});
          toast.success('Profile Saved', 'Your company profile has been updated.');
        } else {
          toast.error('Save Failed', result?.error || 'Could not save profile.');
        }
      } catch (error) {
        console.error('[ClientSettings] save failed:', error);
        toast.error('Save Failed', 'Something went wrong. Try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [isProfileDirty, validateForm, form, saveProfile, toast]
  );

  /* ---------------- Save username ---------------- */
  const handleSaveUsername = useCallback(async () => {
    if (!isUsernameDirty) return;

    const value = username.trim();
    if (value.length < USERNAME_MIN) {
      setUsernameError(`At least ${USERNAME_MIN} characters.`);
      return;
    }
    if (value.length > USERNAME_MAX) {
      setUsernameError(`Maximum ${USERNAME_MAX} characters.`);
      return;
    }
    if (!USERNAME_REGEX.test(value)) {
      setUsernameError('Only lowercase letters, numbers, and underscores.');
      return;
    }

    setUsernameError(null);
    setIsUsernameSaving(true);
    try {
      const result = await changeUsername(value);
      if (result?.success) {
        setInitialUsername(value);
        toast.success('Username Updated', `@${value}`);
      } else {
        toast.error('Update Failed', result?.error || 'Could not update username.');
      }
    } catch (error) {
      console.error('[ClientSettings] username update failed:', error);
      toast.error('Update Failed', 'Something went wrong. Try again.');
    } finally {
      setIsUsernameSaving(false);
    }
  }, [isUsernameDirty, username, changeUsername, toast]);

  /* ---------------- Avatar actions ---------------- */
  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // reset input so re-selecting the same file works
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File Too Large', 'Please choose an image under 5 MB.');
        return;
      }
      if (!/^image\//.test(file.type)) {
        toast.error('Invalid File', 'Please choose an image file.');
        return;
      }

      try {
        const result = await uploadAvatar(file);
        if (result?.success) {
          toast.success('Logo Updated', 'Company logo updated.');
        } else {
          toast.error('Upload Failed', result?.error || 'Could not upload logo.');
        }
      } catch (error) {
        console.error('[ClientSettings] avatar upload failed:', error);
        toast.error('Upload Failed', 'Something went wrong. Try again.');
      }
    },
    [uploadAvatar, toast]
  );

  const handleRemoveAvatar = useCallback(async () => {
    try {
      const result = await removeAvatar();
      if (result?.success) {
        toast.success('Logo Removed', 'Company logo removed.');
      } else {
        toast.error('Remove Failed', result?.error || 'Could not remove logo.');
      }
    } catch (error) {
      console.error('[ClientSettings] avatar remove failed:', error);
      toast.error('Remove Failed', 'Something went wrong. Try again.');
    }
  }, [removeAvatar, toast]);

  /* ---------------- Render: initial loading ---------------- */
  if (isProfileLoading && !initialForm.companyName) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-3"
            aria-hidden="true"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading your profile…
          </p>
        </div>
      </div>
    );
  }

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* ============ PROFILE TAB ============ */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6" noValidate>
          {/* Logo & Username Card */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <header className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Company Logo & Username
              </h2>
              {isAnythingDirty && (
                <Badge variant="warning" size="sm" dot>
                  Unsaved changes
                </Badge>
              )}
            </header>

            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              {/* Avatar */}
              <div className="relative group shrink-0 self-start">
                <Avatar
                  src={currentUser?.avatar}
                  name={form.companyName || currentUser?.name}
                  size="xl"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isAvatarUploading}
                  className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100
                             focus-visible:opacity-100 focus:outline-none focus-visible:ring-2
                             focus-visible:ring-white transition-opacity flex items-center justify-center
                             disabled:cursor-not-allowed"
                  aria-label="Change company logo"
                >
                  {isAvatarUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" aria-hidden="true" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" aria-hidden="true" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>

              {/* Actions + username */}
              <div className="space-y-4 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Camera}
                    onClick={handleAvatarClick}
                    isLoading={isAvatarUploading}
                  >
                    Change Logo
                  </Button>
                  {currentUser?.avatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={handleRemoveAvatar}
                      className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      Remove
                    </Button>
                  )}
                  <span className="text-[11px] text-slate-400 ml-auto">
                    PNG, JPG · max 5 MB
                  </span>
                </div>

                {/* Username row */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex-1 min-w-0">
                    <Input
                      label="Username"
                      placeholder="your_username"
                      value={username}
                      onChange={(e) => {
                        setUsername(slugifyUsername(e.target.value));
                        if (usernameError) setUsernameError(null);
                      }}
                      onBlur={() => {
                        if (username && !USERNAME_REGEX.test(username)) {
                          setUsernameError(
                            'Only lowercase letters, numbers, and underscores.'
                          );
                        }
                      }}
                      icon={AtSign}
                      error={usernameError}
                      helperText={`skillhire.com/u/${username || 'your_username'}`}
                      maxLength={USERNAME_MAX}
                      autoComplete="username"
                      aria-label="Username"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSaveUsername}
                    isLoading={isUsernameSaving}
                    disabled={!isUsernameDirty || isUsernameSaving}
                    className="sm:mb-1"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Company Info Card */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Company Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                placeholder="Tech Solutions Pvt Ltd"
                value={form.companyName}
                onChange={(e) => {
                  setField('companyName', e.target.value);
                  clearFieldError('companyName');
                }}
                onBlur={() => {
                  if (touched.companyName) validateForm();
                }}
                icon={Building}
                error={touched.companyName ? errors.companyName : null}
                maxLength={NAME_MAX}
                helperText={`${form.companyName.length}/${NAME_MAX}`}
                required
                aria-label="Company name"
              />

              <Input
                label="Industry"
                placeholder="Software Development"
                value={form.industry}
                onChange={(e) => setField('industry', e.target.value)}
                icon={Factory}
                aria-label="Industry"
              />
            </div>

            <Input
              label="Company Website"
              type="url"
              placeholder="https://techsolutions.com"
              value={form.website}
              onChange={(e) => {
                setField('website', e.target.value);
                clearFieldError('website');
              }}
              onBlur={() => {
                if (form.website && !isValidWebsite(form.website)) {
                  setErrors((p) => ({ ...p, website: 'Enter a valid website URL.' }));
                }
              }}
              icon={Globe}
              error={errors.website}
              helperText="Optional — include https:// or just the domain"
              autoComplete="url"
              aria-label="Company website"
            />

            <Textarea
              label="Company Bio"
              placeholder="Tell freelancers about your company, what you do, and what kind of projects you typically post…"
              value={form.bio}
              onChange={(e) => {
                setField('bio', e.target.value);
                clearFieldError('bio');
              }}
              onBlur={() => {
                if (touched.bio) validateForm();
              }}
              rows={5}
              maxLength={BIO_MAX}
              error={touched.bio ? errors.bio : null}
              helperText={`${form.bio.length}/${BIO_MAX} characters · visible to freelancers on your profile`}
              required
              aria-label="Company bio"
            />
          </section>

          {/* Location Card */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <LocationSelect
              value={form.location}
              onChange={(loc) => setField('location', loc)}
            />
          </section>

          {/* Save bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky bottom-4 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft">
            <div className="text-xs min-h-[1.25rem] flex items-center gap-2">
              {isProfileDirty ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    You have unsaved changes
                  </span>
                </>
              ) : (
                <span className="text-slate-400">All changes saved</span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                icon={RefreshCw}
                onClick={() => {
                  setForm(initialForm);
                  setErrors({});
                  setTouched({});
                }}
                disabled={!isProfileDirty || isSaving}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Save}
                isLoading={isSaving}
                disabled={!isProfileDirty || isSaving}
                className="font-bold shadow-md"
              >
                Save Profile
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ============ SECURITY TAB ============ */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <SettingsRow
            icon={Shield}
            tint="primary"
            title="Change Password"
            description="Update your account password to keep your account secure."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Change Password
              </Button>
            }
          />
        </div>
      )}

      {/* ============ PHONE TAB ============ */}
      {activeTab === 'phone' && (
        <div className="space-y-6">
          <SettingsRow
            icon={Phone}
            tint="emerald"
            title="Phone Number"
            description={
              currentUser?.isPhoneVerified ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Verified · ends in {currentUser?.phone?.slice(-4) || '••••'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Not verified — required for payments and payouts
                </span>
              )
            }
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPhoneModalOpen(true)}
              >
                {currentUser?.isPhoneVerified ? 'Change Phone' : 'Verify Phone'}
              </Button>
            }
          />
        </div>
      )}

      {/* ============ EMAIL TAB ============ */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <SettingsRow
            icon={Mail}
            tint="primary"
            title="Email Address"
            description={currentUser?.email || 'No email on file'}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEmailModalOpen(true)}
              >
                Change Email
              </Button>
            }
          />
        </div>
      )}

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        isChanging={Boolean(currentUser?.isPhoneVerified)}
      />
      <EmailChangeModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </SettingsLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function SettingsRow({ icon: Icon, title, description, action, tint = 'primary' }) {
  const tones = {
    primary: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
  };
  const tintClass = tones[tint] || tones.primary;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className={`shrink-0 w-12 h-12 rounded-2xl ${tintClass} flex items-center justify-center`}>
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <div className="text-xs text-slate-400 mt-0.5 text-pretty">
              {description}
            </div>
          </div>
        </div>

        <div className="shrink-0 self-end sm:self-auto">{action}</div>
      </div>
    </div>
  );
}

export default ClientSettingsPage;