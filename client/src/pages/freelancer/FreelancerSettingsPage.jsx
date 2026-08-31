// client/src/pages/freelancer/FreelancerSettingsPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { 
  getMyPortfolio, 
  addPortfolioItem, 
  updatePortfolioItem, 
  deletePortfolioItem 
} from "../../services/portfolio.service";
import { 
  getMyPayoutMethods,
  addPayoutMethod,
  updatePayoutMethod,
  setPrimaryPayoutMethod,
  deletePayoutMethod,
} from "../../services/payout.service";
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
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import {
  DollarSign,
  Save,
  Loader2,
  Briefcase,
  GraduationCap,
  Camera,
  Trash2,
  Mail,
  User,
  Shield,
  Phone,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  Plus,
  Edit2,
  ExternalLink,
  GitBranch,
  X,
  Wallet,
  CreditCard,
  Landmark,
  Smartphone,
  Star,
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

  // Portfolio state
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [portfolioToDelete, setPortfolioToDelete] = useState(null);
  const [isPortfolioSubmitting, setIsPortfolioSubmitting] = useState(false);

  // Portfolio form state
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [portfolioTechnologies, setPortfolioTechnologies] = useState([]);
  const [portfolioLiveUrl, setPortfolioLiveUrl] = useState("");
  const [portfolioGithubUrl, setPortfolioGithubUrl] = useState("");
  const [portfolioThumbnail, setPortfolioThumbnail] = useState("");

  // Payout methods state
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [isPayoutLoading, setIsPayoutLoading] = useState(true);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [editingPayoutMethod, setEditingPayoutMethod] = useState(null);
  const [payoutToDelete, setPayoutToDelete] = useState(null);
  const [isPayoutSubmitting, setIsPayoutSubmitting] = useState(false);

  // Payout form state
  const [payoutType, setPayoutType] = useState("upi");
  const [payoutUpiId, setPayoutUpiId] = useState("");
  const [payoutAccountHolderName, setPayoutAccountHolderName] = useState("");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState("");
  const [payoutIfscCode, setPayoutIfscCode] = useState("");
  const [payoutBankName, setPayoutBankName] = useState("");
  const [payoutBranchName, setPayoutBranchName] = useState("");

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
  const [location, setLocation] = useState({ country: "", state: "", city: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isUsernameSaving, setIsUsernameSaving] = useState(false);

  useEffect(() => {
    loadProfile();
    fetchPortfolio();
    fetchPayoutMethods();
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
      setSkills(p.skills?.map((s) => (typeof s === "string" ? s : s.name)) || []);
      setLanguages(p.languages || []);
      setLocation(p.location || { country: "", state: "", city: "" });
    }
  };

  // ============ PORTFOLIO FUNCTIONS ============
  const fetchPortfolio = async () => {
    setIsPortfolioLoading(true);
    try {
      const response = await getMyPortfolio();
      if (response.success) {
        setPortfolioItems(response.portfolio || []);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      setPortfolioItems([]);
    } finally {
      setIsPortfolioLoading(false);
    }
  };

  const handleAddPortfolio = () => {
    setEditingPortfolio(null);
    setPortfolioTitle("");
    setPortfolioDescription("");
    setPortfolioTechnologies([]);
    setPortfolioLiveUrl("");
    setPortfolioGithubUrl("");
    setPortfolioThumbnail("");
    setIsPortfolioModalOpen(true);
  };

  const handleEditPortfolio = (item) => {
    setEditingPortfolio(item);
    setPortfolioTitle(item.title || "");
    setPortfolioDescription(item.description || "");
    setPortfolioTechnologies(
      item.technologies?.map(t => typeof t === 'string' ? t : t.name) || []
    );
    setPortfolioLiveUrl(item.liveUrl || "");
    setPortfolioGithubUrl(item.githubUrl || "");
    setPortfolioThumbnail(item.thumbnail || "");
    setIsPortfolioModalOpen(true);
  };

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();

    if (!portfolioTitle.trim()) {
      toast.warning('Title Required', 'Please enter a project title.');
      return;
    }

    if (!portfolioLiveUrl.trim() && !portfolioGithubUrl.trim()) {
      toast.warning('URL Required', 'Please provide at least one URL (live or GitHub).');
      return;
    }

    setIsPortfolioSubmitting(true);

    try {
      const data = {
        title: portfolioTitle.trim(),
        description: portfolioDescription.trim(),
        technologies: portfolioTechnologies,
        liveUrl: portfolioLiveUrl.trim() || null,
        githubUrl: portfolioGithubUrl.trim() || null,
        thumbnail: portfolioThumbnail.trim() || null,
      };

      if (editingPortfolio) {
        const response = await updatePortfolioItem(editingPortfolio._id, data);
        if (response.success) {
          toast.success('Updated', 'Portfolio item updated successfully.');
        }
      } else {
        const response = await addPortfolioItem(data);
        if (response.success) {
          toast.success('Added', 'Portfolio item added successfully.');
        }
      }

      setIsPortfolioModalOpen(false);
      fetchPortfolio();
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      toast.error('Save Failed', error.response?.data?.message || 'Could not save portfolio item.');
    } finally {
      setIsPortfolioSubmitting(false);
    }
  };

  const handleDeletePortfolio = async () => {
    if (!portfolioToDelete) return;

    try {
      const response = await deletePortfolioItem(portfolioToDelete._id);
      if (response.success) {
        setPortfolioItems(prev => prev.filter(p => p._id !== portfolioToDelete._id));
        setPortfolioToDelete(null);
        toast.success('Deleted', 'Portfolio item deleted successfully.');
      }
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
      toast.error('Delete Failed', error.response?.data?.message || 'Could not delete portfolio item.');
    }
  };

  // ============ PAYOUT METHODS FUNCTIONS ============
  const fetchPayoutMethods = async () => {
    setIsPayoutLoading(true);
    try {
      const response = await getMyPayoutMethods();
      if (response.success) {
        setPayoutMethods(response.payoutMethods || []);
      }
    } catch (error) {
      console.error('Failed to fetch payout methods:', error);
      setPayoutMethods([]);
    } finally {
      setIsPayoutLoading(false);
    }
  };

  const handleAddPayoutMethod = () => {
    setEditingPayoutMethod(null);
    setPayoutType("upi");
    setPayoutUpiId("");
    setPayoutAccountHolderName("");
    setPayoutAccountNumber("");
    setPayoutIfscCode("");
    setPayoutBankName("");
    setPayoutBranchName("");
    setIsPayoutModalOpen(true);
  };

  const handleEditPayoutMethod = (method) => {
    setEditingPayoutMethod(method);
    setPayoutType(method.type);
    setPayoutUpiId("");
    setPayoutAccountHolderName(method.accountHolderName || "");
    setPayoutAccountNumber(method.accountNumber || "");
    setPayoutIfscCode(method.ifscCode || "");
    setPayoutBankName(method.bankName || "");
    setPayoutBranchName(method.branchName || "");
    setIsPayoutModalOpen(true);
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();

    if (payoutType === 'upi' && !payoutUpiId.trim()) {
      toast.warning('UPI ID Required', 'Please enter your UPI ID.');
      return;
    }

    if (payoutType === 'bank') {
      if (!payoutAccountHolderName.trim() || !payoutAccountNumber.trim() || !payoutIfscCode.trim() || !payoutBankName.trim()) {
        toast.warning('Bank Details Required', 'Please fill all bank details.');
        return;
      }
    }

    setIsPayoutSubmitting(true);

    try {
      if (editingPayoutMethod) {
        const data = payoutType === 'upi'
          ? { upiId: payoutUpiId.trim() }
          : { accountHolderName: payoutAccountHolderName.trim(), bankName: payoutBankName.trim(), branchName: payoutBranchName.trim() };

        const response = await updatePayoutMethod(editingPayoutMethod._id, data);
        if (response.success) {
          toast.success('Updated', 'Payout method updated.');
        }
      } else {
        const data = payoutType === 'upi'
          ? { type: 'upi', upiId: payoutUpiId.trim() }
          : {
              type: 'bank',
              accountHolderName: payoutAccountHolderName.trim(),
              accountNumber: payoutAccountNumber.trim(),
              ifscCode: payoutIfscCode.trim(),
              bankName: payoutBankName.trim(),
              branchName: payoutBranchName.trim() || null,
            };

        const response = await addPayoutMethod(data);
        if (response.success) {
          toast.success('Added', 'Payout method added successfully.');
        }
      }

      setIsPayoutModalOpen(false);
      fetchPayoutMethods();
    } catch (error) {
      console.error('Failed to save payout method:', error);
      toast.error('Save Failed', error.response?.data?.message || 'Could not save payout method.');
    } finally {
      setIsPayoutSubmitting(false);
    }
  };

  const handleSetPrimaryPayout = async (methodId) => {
    try {
      const response = await setPrimaryPayoutMethod(methodId);
      if (response.success) {
        toast.success('Primary Set', 'Payout method set as primary.');
        fetchPayoutMethods();
      }
    } catch (error) {
      console.error('Failed to set primary:', error);
      toast.error('Failed', error.response?.data?.message || 'Could not set primary.');
    }
  };

  const handleDeletePayoutMethod = async () => {
    if (!payoutToDelete) return;

    try {
      const response = await deletePayoutMethod(payoutToDelete._id);
      if (response.success) {
        setPayoutMethods(prev => prev.filter(p => p._id !== payoutToDelete._id));
        setPayoutToDelete(null);
        toast.success('Deleted', 'Payout method removed.');
      }
    } catch (error) {
      console.error('Failed to delete payout method:', error);
      toast.error('Delete Failed', error.response?.data?.message || 'Could not delete payout method.');
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
      availability: { status: availabilityStatus, hoursPerWeek: Number(hoursPerWeek) },
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
    if (result.success) toast.success("Avatar Removed", "Profile photo removed.");
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Photo & Username</h3>
            <div className="flex items-center gap-5">
              <div className="relative group">
                <Avatar src={currentUser?.avatar} name={currentUser?.name} size="xl" isOnline={availabilityStatus === "available"} />
                <button onClick={handleAvatarClick} className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={Camera} onClick={handleAvatarClick} isLoading={isAvatarUploading}>Change Photo</Button>
                  {currentUser?.avatar && (
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={handleRemoveAvatar} className="text-rose-600">Remove</Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input label="Username" placeholder="your_username" value={username} onChange={(e) => setUsername(e.target.value)} icon={User} />
                  </div>
                  <Button variant="primary" size="sm" onClick={handleSaveUsername} isLoading={isUsernameSaving} className="mt-5">Save</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Professional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Professional Headline" placeholder="Senior MERN Developer" value={headline} onChange={(e) => setHeadline(e.target.value)} icon={Briefcase} required />
              <Input label="Hourly Rate (₹/hr)" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} icon={DollarSign} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Experience (Years)" type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} icon={GraduationCap} />
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Availability</label>
                <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm">
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
            <Textarea label="Professional Bio" placeholder="Describe your skills and experience..." value={bio} onChange={(e) => setBio(e.target.value)} rows={4} required />
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <SkillInput selectedSkills={skills} onAddSkill={(s) => setSkills([...skills, s])} onRemoveSkill={(s) => setSkills(skills.filter((x) => x !== s))} />
          </div>

          {/* Languages */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <LanguageSelect selectedLanguages={languages} onAddLanguage={(l) => setLanguages([...languages, l])} onRemoveLanguage={(name) => setLanguages(languages.filter((x) => x.name !== name))} />
          </div>

          {/* Education */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <EducationInput educationList={education} onAddEducation={(e) => setEducation([...education, e])} onRemoveEducation={(index) => setEducation(education.filter((_, i) => i !== index))} />
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <LocationSelect value={location} onChange={setLocation} />
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <Button variant="primary" size="lg" icon={Save} onClick={handleSaveProfile} isLoading={isSaving}>Save Profile</Button>
          </div>
        </div>
      )}

      {/* ============ PORTFOLIO TAB ============ */}
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-primary-600" />
                Portfolio Projects
              </h3>
              <p className="text-xs text-slate-400 mt-1">Showcase your best work to clients</p>
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleAddPortfolio}>Add Project</Button>
          </div>

          {isPortfolioLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>
          ) : portfolioItems.length > 0 ? (
            <div className="space-y-4">
              {portfolioItems.map((item) => (
                <div key={item._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      {item.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => handleEditPortfolio(item)} className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setPortfolioToDelete(item)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {item.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.technologies.map((tech, idx) => (
                        <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg font-semibold text-slate-700 dark:text-slate-300">{typeof tech === 'string' ? tech : tech.name}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-2">
                    {item.liveUrl && <a href={item.liveUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> Live Demo</a>}
                    {item.githubUrl && <a href={item.githubUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" /> GitHub</a>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No portfolio projects yet.</p>
              <Button variant="primary" size="sm" className="mt-4" icon={Plus} onClick={handleAddPortfolio}>Add Your First Project</Button>
            </div>
          )}
        </div>
      )}

      {/* ============ PAYOUT METHODS TAB ============ */}
      {activeTab === "payout" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary-600" />
                Payout Methods
              </h3>
              <p className="text-xs text-slate-400 mt-1">Manage UPI and bank accounts for withdrawals</p>
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleAddPayoutMethod}>Add Method</Button>
          </div>

          {isPayoutLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>
          ) : payoutMethods.length > 0 ? (
            <div className="space-y-4">
              {payoutMethods.map((method) => (
                <div key={method._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${method.type === 'upi' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600' : 'bg-primary-50 dark:bg-primary-950/60 text-primary-600'}`}>
                        {method.type === 'upi' ? <Smartphone className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {method.type === 'upi' ? method.displayInfo || method.upiId : `${method.bankName} ••••${method.accountNumber?.slice(-4)}`}
                        </h4>
                        <p className="text-xs text-slate-400 capitalize">{method.type === 'upi' ? 'UPI ID' : 'Bank Account'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {method.isPrimary ? (
                        <Badge variant="success" size="sm"><Star className="w-3 h-3" /> Primary</Badge>
                      ) : (
                        <button onClick={() => handleSetPrimaryPayout(method._id)} className="text-xs font-semibold text-primary-600 hover:underline px-2 py-1">Set Primary</button>
                      )}
                      <button onClick={() => handleEditPayoutMethod(method)} className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setPayoutToDelete(method)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Total Withdrawn: ₹{method.totalWithdrawn || 0}</span>
                    {method.lastWithdrawalAt && <span>• Last: {new Date(method.lastWithdrawalAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No payout methods yet.</p>
              <p className="text-xs text-slate-400 mt-1">Add UPI or bank account to withdraw earnings.</p>
              <Button variant="primary" size="sm" className="mt-4" icon={Plus} onClick={handleAddPayoutMethod}>Add Payout Method</Button>
            </div>
          )}
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
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h3>
                  <p className="text-xs text-slate-400">Update your account password</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(true)}>Change Password</Button>
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
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Phone Number</h3>
                  {currentUser?.isPhoneVerified ? (
                    <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</p>
                  ) : (
                    <p className="text-xs text-amber-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Not verified</p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsPhoneModalOpen(true)}>
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
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email Address</h3>
                  <p className="text-xs text-slate-400">{currentUser?.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEmailModalOpen(true)}>Change Email</Button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {isPortfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPortfolioModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{editingPortfolio ? 'Edit Project' : 'Add Project'}</h3>
              <button onClick={() => setIsPortfolioModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePortfolioSubmit} className="space-y-4">
              <Input label="Project Title" value={portfolioTitle} onChange={(e) => setPortfolioTitle(e.target.value)} required />
              <Textarea label="Description" value={portfolioDescription} onChange={(e) => setPortfolioDescription(e.target.value)} rows={3} />
              <Input label="Live Demo URL" value={portfolioLiveUrl} onChange={(e) => setPortfolioLiveUrl(e.target.value)} icon={ExternalLink} />
              <Input label="GitHub URL" value={portfolioGithubUrl} onChange={(e) => setPortfolioGithubUrl(e.target.value)} icon={GitBranch} />
              <Input label="Thumbnail URL (optional)" value={portfolioThumbnail} onChange={(e) => setPortfolioThumbnail(e.target.value)} />
              <div>
                <label className="block text-xs font-semibold mb-1.5">Technologies (comma separated)</label>
                <input type="text" value={portfolioTechnologies.join(', ')} onChange={(e) => setPortfolioTechnologies(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPortfolioModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isPortfolioSubmitting}>{editingPortfolio ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Method Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPayoutModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{editingPayoutMethod ? 'Edit Payout Method' : 'Add Payout Method'}</h3>
              <button onClick={() => setIsPayoutModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setPayoutType('upi')} className={`p-4 rounded-xl border-2 text-center ${payoutType === 'upi' ? 'border-primary-600 bg-primary-50/40 dark:bg-primary-950/40' : 'border-slate-200 dark:border-slate-800'}`}>
                  <Smartphone className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                  <span className="text-xs font-bold">UPI</span>
                </button>
                <button type="button" onClick={() => setPayoutType('bank')} className={`p-4 rounded-xl border-2 text-center ${payoutType === 'bank' ? 'border-primary-600 bg-primary-50/40 dark:bg-primary-950/40' : 'border-slate-200 dark:border-slate-800'}`}>
                  <Landmark className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                  <span className="text-xs font-bold">Bank</span>
                </button>
              </div>

              {payoutType === 'upi' ? (
                <Input label="UPI ID" placeholder="yourname@upi" value={payoutUpiId} onChange={(e) => setPayoutUpiId(e.target.value)} icon={Smartphone} required />
              ) : (
                <>
                  <Input label="Account Holder Name" value={payoutAccountHolderName} onChange={(e) => setPayoutAccountHolderName(e.target.value)} required />
                  <Input label="Account Number" value={payoutAccountNumber} onChange={(e) => setPayoutAccountNumber(e.target.value)} required />
                  <Input label="IFSC Code" value={payoutIfscCode} onChange={(e) => setPayoutIfscCode(e.target.value)} required />
                  <Input label="Bank Name" value={payoutBankName} onChange={(e) => setPayoutBankName(e.target.value)} required />
                  <Input label="Branch Name (optional)" value={payoutBranchName} onChange={(e) => setPayoutBranchName(e.target.value)} />
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPayoutModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isPayoutSubmitting}>{editingPayoutMethod ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Portfolio Confirmation */}
      {portfolioToDelete && (
        <ConfirmDialog isOpen={!!portfolioToDelete} onClose={() => setPortfolioToDelete(null)} onConfirm={handleDeletePortfolio} title="Delete Portfolio Item?" description={`Delete "${portfolioToDelete.title}"?`} confirmLabel="Delete" variant="danger" />
      )}

      {/* Delete Payout Method Confirmation */}
      {payoutToDelete && (
        <ConfirmDialog isOpen={!!payoutToDelete} onClose={() => setPayoutToDelete(null)} onConfirm={handleDeletePayoutMethod} title="Delete Payout Method?" description="This will remove the payout method from your account." confirmLabel="Delete" variant="danger" />
      )}

      {/* Modals */}
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
      <PhoneVerificationModal isOpen={isPhoneModalOpen} onClose={() => setIsPhoneModalOpen(false)} isChanging={currentUser?.isPhoneVerified} />
      <EmailChangeModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </SettingsLayout>
  );
}

export default FreelancerSettingsPage;