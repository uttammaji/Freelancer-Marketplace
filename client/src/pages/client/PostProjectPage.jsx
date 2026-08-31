// client/src/pages/client/PostProjectPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createProject } from '../../services/project.service';
import { getAllCategories } from '../../services/category.service';
import { getAllSkills } from '../../services/skill.service';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import {
  DollarSign,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  Eye,
  Loader2,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function PostProjectPage() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [budgetType, setBudgetType] = useState('fixed');
  const [budgetMin, setBudgetMin] = useState(1000);
  const [budgetMax, setBudgetMax] = useState(5000);
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [deadline, setDeadline] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Data state
  const [categories, setCategories] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch categories and skills
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, skillsRes] = await Promise.all([
          getAllCategories(),
          getAllSkills()
        ]);

        if (categoriesRes.success) {
          setCategories(categoriesRes.categories);
          if (categoriesRes.categories.length > 0) {
            setCategoryId(categoriesRes.categories[0]._id);
          }
        }

        if (skillsRes.success) {
          setAvailableSkills(skillsRes.skills || []);
        }
      } catch (error) {
        console.error('Failed to fetch form data:', error);
        toast.error('Load Failed', 'Could not load categories and skills.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [toast]);

  // Set default deadline (30 days from now)
  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setDeadline(date.toISOString().split('T')[0]);
  }, []);

  // Handle skill selection
  const toggleSkill = (skillId) => {
    setSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(s => s !== skillId) 
        : [...prev, skillId]
    );
  };

  // Get skill name by ID
  const getSkillName = (skillId) => {
    const skill = availableSkills.find(s => s._id === skillId);
    return skill?.name || skillId;
  };

  // Handle publish
  const handlePublish = async () => {
    // Validation
    if (!title.trim() || title.length < 5) {
      toast.warning('Title Required', 'Please enter a descriptive project title (at least 5 characters).');
      return;
    }

    if (!description.trim() || description.length < 20) {
      toast.warning('Description Required', 'Please provide detailed project specifications (at least 20 characters).');
      return;
    }

    if (!categoryId) {
      toast.warning('Category Required', 'Please select a category.');
      return;
    }

    if (budgetType === 'fixed' && (budgetMin <= 0 || budgetMax <= 0 || budgetMin > budgetMax)) {
      toast.warning('Invalid Budget', 'Please provide a valid budget range.');
      return;
    }

    if (!deadline) {
      toast.warning('Deadline Required', 'Please set a target deadline.');
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        skills,
        budget: {
          type: budgetType,
          min: budgetType === 'fixed' ? budgetMin : budgetMin,
          max: budgetType === 'fixed' ? budgetMax : budgetMax,
        },
        experienceLevel,
        deadline: new Date(deadline).toISOString(),
      };

      const response = await createProject(projectData);

      if (response.success) {
        // Celebrate
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          console.log('Confetti unavailable');
        }

        toast.success('Project Published!', 'Freelancers can now discover your project and submit bids.');
        navigate('/dashboard/client/projects');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Publish Failed', error.response?.data?.message || 'Could not publish project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-fill sample
  const handleAutoFill = () => {
    setTitle('Full Stack Next.js & Tailwind SaaS Platform with AI Copilot');
    setDescription(
      `We are building a collaborative enterprise workflow platform that integrates with OpenAI APIs to automate document synthesis.\n\nScope of Work:\n1. Translate design screens into responsive Next.js 14 App Router views.\n2. Connect backend REST endpoints with optimistic caching.\n3. Integrate streaming AI copilot chat interface.\n4. Ensure WCAG compliance and mobile responsiveness.`
    );
    setBudgetMin(3000);
    setBudgetMax(5000);
    setExperienceLevel('expert');
  };

  // Loading state
  if (isLoadingData) {
    return (
      <div className="max-w-4xl mx-auto py-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">New Job Posting</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Post a New Project
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect with top-tier freelancers. Verified escrow protection is enabled by default.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoFill}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 rounded-xl hover:bg-primary-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> Auto-fill Sample
          </button>
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Edit Form' : 'Live Preview'}
          </Button>
        </div>
      </div>

      {showPreview ? (
        /* Preview */
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <Badge variant="warning" size="sm">Live Posting Preview</Badge>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {formatCurrency(budgetMin)} - {formatCurrency(budgetMax)}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {title || 'Your Project Title Here'}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span>{categories.find(c => c._id === categoryId)?.name || 'Category'}</span>
              <span>•</span>
              <span>{experienceLevel} Level</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {description || 'Project description specifications will appear here...'}
          </p>

          {skills.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Required Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skillId) => (
                  <span key={skillId} className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg font-semibold text-slate-700 dark:text-slate-300">
                    {getSkillName(skillId)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowPreview(false)}>Back to Editing</Button>
            <Button variant="primary" onClick={handlePublish} isLoading={isSubmitting}>Publish This Job</Button>
          </div>
        </div>
      ) : (
        /* Form */
        <div className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              1. Project Title & Domain
            </h3>

            <Input
              label="Project Title"
              placeholder="e.g. Build a Modern SaaS Analytics Dashboard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              helperText="Be specific about the core deliverable and tech stack."
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  required
                >
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="beginner">Beginner (Junior)</option>
                  <option value="intermediate">Intermediate (Mid-level)</option>
                  <option value="expert">Expert (Senior / Lead)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Description */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              2. Scope of Work
            </h3>

            <Textarea
              label="Project Description"
              placeholder="Describe your project goals, technical expectations, dependencies, and any constraints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />
          </div>

          {/* Section 3: Skills */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              3. Required Skills
            </h3>

            <div className="flex flex-wrap gap-2">
              {availableSkills.map(skill => {
                const isSelected = skills.includes(skill._id);
                return (
                  <button
                    key={skill._id}
                    type="button"
                    onClick={() => toggleSkill(skill._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary-500'
                    }`}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>

            {skills.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-2">Selected Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(skillId => (
                    <span
                      key={skillId}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/60"
                    >
                      <span>{getSkillName(skillId)}</span>
                      <button
                        type="button"
                        onClick={() => toggleSkill(skillId)}
                        className="text-primary-400 hover:text-primary-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Budget & Timeline */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              4. Budget & Timeline
            </h3>

            {/* Budget type */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBudgetType('fixed')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  budgetType === 'fixed'
                    ? 'border-primary-600 bg-primary-50/40 dark:bg-primary-950/40'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <DollarSign className="w-5 h-5 text-primary-600 mb-1" />
                <span className="text-xs sm:text-sm font-bold block">Fixed Price</span>
                <span className="text-[11px] text-slate-400">Pay by agreed milestones</span>
              </button>

              <button
                type="button"
                onClick={() => setBudgetType('hourly')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  budgetType === 'hourly'
                    ? 'border-primary-600 bg-primary-50/40 dark:bg-primary-950/40'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <Clock className="w-5 h-5 text-primary-600 mb-1" />
                <span className="text-xs sm:text-sm font-bold block">Hourly Rate</span>
                <span className="text-[11px] text-slate-400">Pay by tracked hours</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={budgetType === 'fixed' ? 'Minimum Budget ($)' : 'Minimum Rate ($/hr)'}
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                icon={DollarSign}
                required
              />
              <Input
                label={budgetType === 'fixed' ? 'Maximum Budget ($)' : 'Maximum Rate ($/hr)'}
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                icon={DollarSign}
                required
              />
            </div>

            <Input
              label="Target Completion Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-start gap-2 flex-1">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>
                <strong>Escrow Protection:</strong> Funds are securely held until you approve the work.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                icon={Eye}
                onClick={() => setShowPreview(true)}
              >
                Preview
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="font-bold shadow-md"
                onClick={handlePublish}
                isLoading={isSubmitting}
              >
                Publish Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostProjectPage;