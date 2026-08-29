// client/src/pages/freelancer/FreelancerSettingsPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Input } from "../../components/common/Input";
import { Textarea } from "../../components/common/Textarea";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { SettingsLayout } from "../../components/settings/SettingsLayout";
import { ChangePasswordModal } from "../../components/settings/ChangePasswordModal";
import { PhoneVerificationModal } from "../../components/settings/PhoneVerificationModal";
import { EmailChangeModal } from "../../components/settings/EmailChangeModal";
import { SkillInput } from "../../components/settings/SkillInput";
import { LanguageSelect } from "../../components/settings/LanguageSelect";
import { LocationSelect } from "../../components/settings/LocationSelect";
import { EducationInput } from "../../components/settings/EducationInput";
import {
  DollarSign,
  Save,
  Loader2,
  Briefcase,
  GraduationCap,
  Camera,
  Trash2,
  Mail,
  Clock,
  User,
  Shield,
  Phone,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

export function FreelancerSettingsPage() {
  const {
    currentUser,
    profile,
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

  // Tab state
  const [activeTab, setActiveTab] = useState("profile");

  // Modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Form state
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [experienceYears, setExperienceYears] = useState(0);
  const [availabilityStatus, setAvailabilityStatus] = useState("available");
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [username, setUsername] = useState("");
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [location, setLocation] = useState({
    country: "",
    state: "",
    city: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUsernameSaving, setIsUsernameSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const result = await fetchProfile();
    if (result.success && result.data.profile) {
      const p = result.data.profile;
      setHeadline(p.headline || "");
      setBio(p.bio || "");
      setHourlyRate(p.hourlyRate || 0);
      setExperienceYears(p.experienceYears || 0);
      setAvailabilityStatus(p.availability?.status || "available");
      setHoursPerWeek(p.availability?.hoursPerWeek || 40);
      setUsername(currentUser?.username || "");
      setEducation(p.education || []);
      setSkills(
        p.skills?.map((s) => (typeof s === "string" ? s : s.name)) || [],
      );
      setLanguages(p.languages || []);
      setLocation(p.location || { country: "", state: "", city: "" });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!headline.trim() || !bio.trim()) {
      toast.warning("Required Fields", "Headline and bio are required.");
      return;
    }

    setIsSaving(true);
    const profileData = {
      headline,
      bio,
      hourlyRate: Number(hourlyRate),
      experienceYears: Number(experienceYears),
      availability: {
        status: availabilityStatus,
        hoursPerWeek: Number(hoursPerWeek),
      },
      skills,
      languages,
      location,
      education,
    };
    const result = await saveProfile(profileData);
    setIsSaving(false);

    if (result.success) {
      toast.success("Profile Saved", "Your profile has been updated.");
    } else {
      toast.error("Save Failed", result.error);
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) return;
    setIsUsernameSaving(true);
    const result = await changeUsername(username);
    setIsUsernameSaving(false);
    if (result.success) {
      toast.success("Username Updated", `@${result.data.user.username}`);
    } else {
      toast.error("Update Failed", result.error);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = await uploadAvatar(file);
    if (result.success) {
      toast.success("Avatar Updated", "Profile photo updated.");
    } else {
      toast.error("Upload Failed", result.error);
    }
    e.target.value = "";
  };

  const handleRemoveAvatar = async () => {
    const result = await removeAvatar();
    if (result.success)
      toast.success("Avatar Removed", "Profile photo removed.");
    else toast.error("Remove Failed", result.error);
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
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Avatar & Username Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Profile Photo & Username
            </h3>

            <div className="flex items-center gap-5">
              <div className="relative group">
                <Avatar
                  src={currentUser?.avatar}
                  name={currentUser?.name}
                  size="xl"
                  isOnline={availabilityStatus === "available"}
                />
                <button
                  onClick={handleAvatarClick}
                  className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Camera}
                    onClick={handleAvatarClick}
                    isLoading={isAvatarUploading}
                  >
                    Change Photo
                  </Button>
                  {currentUser?.avatar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={handleRemoveAvatar}
                      className="text-rose-600"
                    >
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
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveUsername}
                    isLoading={isUsernameSaving}
                    className="mt-5"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Professional Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Professional Headline"
                placeholder="Senior MERN Developer"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                icon={Briefcase}
                required
              />
              <Input
                label="Hourly Rate ($/hr)"
                type="number"
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
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                icon={GraduationCap}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Availability
                </label>
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            <Textarea
              label="Professional Bio"
              placeholder="Describe your skills and experience..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Skills Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <SkillInput
              selectedSkills={skills}
              onAddSkill={(s) => setSkills([...skills, s])}
              onRemoveSkill={(s) => setSkills(skills.filter((x) => x !== s))}
            />
          </div>

          {/* Languages Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <LanguageSelect
              selectedLanguages={languages}
              onAddLanguage={(l) => setLanguages([...languages, l])}
              onRemoveLanguage={(name) =>
                setLanguages(languages.filter((x) => x.name !== name))
              }
            />
          </div>

          {/* Education Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <EducationInput
              educationList={education}
              onAddEducation={(e) => setEducation([...education, e])}
              onRemoveEducation={(index) =>
                setEducation(education.filter((_, i) => i !== index))
              }
            />
          </div>

          {/* Location Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <LocationSelect value={location} onChange={setLocation} />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="lg"
              icon={Save}
              onClick={handleSaveProfile}
              isLoading={isSaving}
            >
              Save Profile
            </Button>
          </div>
        </div>
      )}

      {/* ============ SECURITY TAB ============ */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Change Password
                  </h3>
                  <p className="text-xs text-slate-400">
                    Update your account password
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============ PHONE TAB ============ */}
      {activeTab === "phone" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-8 h-8 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Phone Number
                  </h3>
                  {currentUser?.isPhoneVerified ? (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified: +91{" "}
                      {currentUser?.phone?.slice(-4)}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Not verified
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPhoneModalOpen(true)}
              >
                {currentUser?.isPhoneVerified ? "Change Phone" : "Verify Phone"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============ EMAIL TAB ============ */}
      {activeTab === "email" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-primary-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Email Address
                  </h3>
                  <p className="text-xs text-slate-400">{currentUser?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEmailModalOpen(true)}
              >
                Change Email
              </Button>
            </div>
          </div>
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
        isChanging={currentUser?.isPhoneVerified}
      />
      <EmailChangeModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </SettingsLayout>
  );
}
