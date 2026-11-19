// client/src/pages/client/PostProjectPage.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { createProject } from '../../services/project.service';
import { getAllCategories } from '../../services/category.service';
import { getAllSkills } from '../../services/skill.service';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency } from '../../utils/formatters';
import {
  IndianRupee,
  Eye,
  Sparkles,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Save,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const DRAFT_KEY = 'skillhire_project_draft_v1';
const DEFAULT_DEADLINE_DAYS = 30;
const TITLE_MIN = 10;
const TITLE_MAX = 120;
const DESC_MIN = 50;
const DESC_MAX = 5000;
const BUDGET_MIN = 500;
const BUDGET_MAX_LIMIT = 10_000_000;

const STEPS = [
  { id: 'basics',      label: 'Basics',    description: 'Title, category, level' },
  { id: 'scope',       label: 'Scope',     description: 'Description & skills' },
  { id: 'budget',      label: 'Budget',    description: 'Price & deadline' },
  { id: 'review',      label: 'Review',    description: 'Confirm & publish' },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner',     label: 'Beginner',     sub: 'Junior' },
  { value: 'intermediate', label: 'Intermediate', sub: 'Mid-level' },
  { value: 'expert',       label: 'Expert',       sub: 'Senior / Lead' },
];

const SAMPLE_DRAFT = {
  title: 'Build a Modern SaaS Analytics Dashboard with Next.js 14',
  description:
    `We're looking for an experienced full-stack engineer to build a multi-tenant SaaS analytics dashboard.\n\n` +
    `Scope of work:\n` +
    `1. Translate Figma designs into responsive Next.js 14 App Router views.\n` +
    `2. Integrate REST APIs with optimistic caching and error boundaries.\n` +
    `3. Build an interactive charting module using Recharts.\n` +
    `4. Ensure WCAG AA compliance and mobile responsiveness.\n\n` +
    `Deliverables: production-ready code, unit tests, deployment on Vercel.`,
  budgetMin: 80000,
  budgetMax: 150000,
  experienceLevel: 'expert',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const safeFormatCurrency = (v) => {
  const n = safeNumber(v);
  try {
    return formatCurrency(n);
  } catch {
    return `₹${n.toLocaleString('en-IN')}`;
  }
};

const defaultDeadline = () => {
  const d = new Date();
  d.setDate(d.getDate() + DEFAULT_DEADLINE_DAYS);
  return d.toISOString().split('T')[0];
};

const todayISO = () => new Date().toISOString().split('T')[0];

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveDraft = (data) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // storage might be full or blocked — ignore
  }
};

const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function PostProjectPage() {
  const toast = useToast();
  const navigate = useNavigate();

  /* ---------------- Reference data ---------------- */
  const [categories, setCategories] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);

  /* ---------------- Form state ---------------- */
  const [step, setStep] = useState('basics');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [budgetType, setBudgetType] = useState('fixed');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [deadline, setDeadline] = useState(defaultDeadline());
  const [skills, setSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');

  /* ---------------- UI state ---------------- */
  const [showPreview, setShowPreview] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftStatus, setDraftStatus] = useState('idle'); // idle | saving | saved
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* ---------------- Refs ---------------- */
  const isFirstRender = useRef(true);
  const autosaveTimer = useRef(null);

  /* ---------------- Derived: dirty state ---------------- */
  const isDirty = useMemo(
    () =>
      Boolean(
        title.trim() ||
          categoryId ||
          description.trim() ||
          skills.length > 0 ||
          budgetMin ||
          budgetMax
      ),
    [title, categoryId, description, skills.length, budgetMin, budgetMax]
  );

  /* ---------------- Load reference data ---------------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoadingData(true);
      setLoadError(null);

      try {
        const [categoriesRes, skillsRes] = await Promise.all([
          getAllCategories(),
          getAllSkills(),
        ]);

        if (cancelled) return;

        if (categoriesRes?.success) {
          const cats = categoriesRes.categories || [];
          setCategories(cats);
          setCategoryId((prev) => prev || cats[0]?._id || '');
        }

        if (skillsRes?.success) {
          setAvailableSkills(skillsRes.skills || []);
        }

        // Restore draft after data is loaded
        const draft = loadDraft();
        if (draft) {
          setTitle(draft.title || '');
          setCategoryId(draft.categoryId || cats[0]?._id || '');
          setDescription(draft.description || '');
          setExperienceLevel(draft.experienceLevel || 'intermediate');
          setBudgetType(draft.budgetType || 'fixed');
          setBudgetMin(draft.budgetMin ?? '');
          setBudgetMax(draft.budgetMax ?? '');
          setDeadline(draft.deadline || defaultDeadline());
          setSkills(Array.isArray(draft.skills) ? draft.skills : []);
          toast.info(
            'Draft Restored',
            'We restored your previous unsaved work.'
          );
        }
      } catch (error) {
        if (cancelled) return;
        console.error('[PostProject] data load failed:', error);
        setLoadError(error);
        toast.error('Load Failed', 'Could not load categories and skills.');
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  /* ---------------- Autosave draft ---------------- */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isDirty) return;

    clearTimeout(autosaveTimer.current);
    setDraftStatus('saving');

    autosaveTimer.current = setTimeout(() => {
      saveDraft({
        title,
        categoryId,
        description,
        experienceLevel,
        budgetType,
        budgetMin,
        budgetMax,
        deadline,
        skills,
      });
      setDraftStatus('saved');
      setTimeout(() => setDraftStatus('idle'), 1500);
    }, 800);

    return () => clearTimeout(autosaveTimer.current);
  }, [
    title,
    categoryId,
    description,
    experienceLevel,
    budgetType,
    budgetMin,
    budgetMax,
    deadline,
    skills,
    isDirty,
  ]);

  /* ---------------- Unsaved-changes guard ---------------- */
  useEffect(() => {
    if (!isDirty || isSubmitting) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, isSubmitting]);

  /* ---------------- Skill helpers ---------------- */
  const getSkillName = useCallback(
    (skillId) => {
      const s = availableSkills.find((x) => x._id === skillId);
      return s?.name || skillId;
    },
    [availableSkills]
  );

  const toggleSkill = useCallback((skillId) => {
    setSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((s) => s !== skillId)
        : [...prev, skillId]
    );
  }, []);

  const removeSkill = useCallback((skillId) => {
    setSkills((prev) => prev.filter((s) => s !== skillId));
  }, []);

  const filteredSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return availableSkills;
    return availableSkills.filter((s) =>
      s.name?.toLowerCase().includes(q)
    );
  }, [availableSkills, skillSearch]);

  /* ---------------- Validation ---------------- */
  const validateStep = useCallback(
    (targetStep) => {
      const next = {};

      if (targetStep === 'basics' || targetStep === 'all') {
        const t = title.trim();
        if (!t) next.title = 'Project title is required.';
        else if (t.length < TITLE_MIN)
          next.title = `At least ${TITLE_MIN} characters.`;
        else if (t.length > TITLE_MAX)
          next.title = `Maximum ${TITLE_MAX} characters.`;
        if (!categoryId) next.categoryId = 'Select a category.';
      }

      if (targetStep === 'scope' || targetStep === 'all') {
        const d = description.trim();
        if (!d) next.description = 'Description is required.';
        else if (d.length < DESC_MIN)
          next.description = `At least ${DESC_MIN} characters — help freelancers understand your needs.`;
        else if (d.length > DESC_MAX)
          next.description = `Maximum ${DESC_MAX} characters.`;
      }

      if (targetStep === 'budget' || targetStep === 'all') {
        const min = safeNumber(budgetMin);
        const max = safeNumber(budgetMax);

        if (!budgetMin) next.budgetMin = 'Minimum budget is required.';
        else if (min < BUDGET_MIN)
          next.budgetMin = `Minimum is ${safeFormatCurrency(BUDGET_MIN)}.`;

        if (!budgetMax) next.budgetMax = 'Maximum budget is required.';
        else if (max > BUDGET_MAX_LIMIT)
          next.budgetMax = 'That budget is unrealistically high.';

        if (min > 0 && max > 0 && min > max) {
          next.budgetMax = 'Maximum must be greater than or equal to minimum.';
        }

        if (!deadline) {
          next.deadline = 'Please set a target deadline.';
        } else {
          const d = new Date(deadline);
          if (Number.isNaN(d.getTime())) {
            next.deadline = 'Invalid date.';
          } else if (d.getTime() < Date.now() - 86400000) {
            next.deadline = 'Deadline must be in the future.';
          }
        }
      }

      setErrors((prev) => ({ ...prev, ...next }));
      return Object.keys(next).length === 0;
    },
    [title, categoryId, description, budgetMin, budgetMax, deadline]
  );

  /* ---------------- Navigation ---------------- */
  const goNext = useCallback(() => {
    const currentIndex = STEPS.findIndex((s) => s.id === step);
    if (!validateStep(step)) {
      toast.error('Invalid Step', 'Please fix the highlighted fields.');
      return;
    }
    const next = STEPS[currentIndex + 1];
    if (next) setStep(next.id);
  }, [step, validateStep, toast]);

  const goPrev = useCallback(() => {
    const currentIndex = STEPS.findIndex((s) => s.id === step);
    const prev = STEPS[currentIndex - 1];
    if (prev) setStep(prev.id);
  }, [step]);

  const goToStep = useCallback(
    (targetStep) => {
      const targetIndex = STEPS.findIndex((s) => s.id === targetStep);
      const currentIndex = STEPS.findIndex((s) => s.id === step);

      // Going backwards: always allowed
      if (targetIndex <= currentIndex) {
        setStep(targetStep);
        return;
      }

      // Going forwards: validate every step in between
      for (let i = currentIndex; i < targetIndex; i++) {
        if (!validateStep(STEPS[i].id)) {
          setStep(STEPS[i].id);
          toast.error('Invalid Step', `Complete "${STEPS[i].label}" first.`);
          return;
        }
      }
      setStep(targetStep);
    },
    [step, validateStep, toast]
  );

  /* ---------------- Auto-fill sample ---------------- */
  const handleAutoFill = useCallback(() => {
    setTitle(SAMPLE_DRAFT.title);
    setDescription(SAMPLE_DRAFT.description);
    setBudgetMin(SAMPLE_DRAFT.budgetMin);
    setBudgetMax(SAMPLE_DRAFT.budgetMax);
    setExperienceLevel(SAMPLE_DRAFT.experienceLevel);
    setErrors({});
    setTouched({});
    toast.info('Sample Loaded', 'Edit the fields as needed before publishing.');
  }, [toast]);

  /* ---------------- Reset ---------------- */
  const handleReset = useCallback(() => {
    setTitle('');
    setCategoryId(categories[0]?._id || '');
    setDescription('');
    setExperienceLevel('intermediate');
    setBudgetType('fixed');
    setBudgetMin('');
    setBudgetMax('');
    setDeadline(defaultDeadline());
    setSkills([]);
    setSkillSearch('');
    setErrors({});
    setTouched({});
    clearDraft();
    toast.info('Form Reset', 'All fields have been cleared.');
  }, [categories, toast]);

  /* ---------------- Publish ---------------- */
  const handlePublish = useCallback(async () => {
    if (!validateStep('all')) {
      toast.error('Invalid Form', 'Please fix the highlighted fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        skills,
        budget: {
          type: budgetType,
          min: safeNumber(budgetMin),
          max: safeNumber(budgetMax),
        },
        experienceLevel,
        deadline: new Date(deadline).toISOString(),
      };

      const response = await createProject(payload);
      if (!response?.success) {
        throw new Error(response?.message || 'Could not publish project');
      }

      clearDraft();

      // Confetti (best-effort, respects reduced motion)
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        disableForReducedMotion: true,
      });

      toast.success(
        'Project Published! 🎉',
        'Freelancers can now discover your project and submit proposals.'
      );
      navigate('/dashboard/client/projects', { replace: true });
    } catch (error) {
      console.error('[PostProject] publish failed:', error);
      toast.error(
        'Publish Failed',
        error?.response?.data?.message ||
          error?.message ||
          'Could not publish project.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateStep,
    title,
    description,
    categoryId,
    skills,
    budgetType,
    budgetMin,
    budgetMax,
    experienceLevel,
    deadline,
    toast,
    navigate,
  ]);

  /* ---------------- Render: loading ---------------- */
  if (isLoadingData) {
    return <FormSkeleton />;
  }

  /* ---------------- Render: hard error ---------------- */
  if (loadError && categories.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <AlertCircle
          className="w-12 h-12 text-rose-500 mx-auto"
          aria-hidden="true"
        />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Couldn&apos;t load the form
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We need categories and skills to continue. Please try again.
        </p>
        <Button
          variant="primary"
          size="sm"
          icon={RefreshCw}
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </div>
    );
  }

  /* ---------------- Render: main ---------------- */
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">
            New Job Posting
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Post a Project
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-pretty">
            Describe your project clearly to attract high-quality proposals. Escrow protection is enabled by default.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {draftStatus === 'saving' && (
            <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
              <Save className="w-3 h-3 animate-pulse" aria-hidden="true" />
              Saving draft…
            </span>
          )}
          {draftStatus === 'saved' && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              Draft saved
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            icon={Sparkles}
            onClick={handleAutoFill}
            className="text-primary-600 dark:text-primary-400"
          >
            Auto-fill Sample
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? 'Edit Form' : 'Preview'}
          </Button>
        </div>
      </header>

      {/* Step indicator */}
      {!showPreview && (
        <nav aria-label="Post project progress">
          <ol className="grid grid-cols-4 gap-2 sm:gap-4">
            {STEPS.map((s, i) => {
              const currentIndex = STEPS.findIndex((x) => x.id === step);
              const isDone = i < currentIndex;
              const isActive = i === currentIndex;

              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goToStep(s.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                      isActive
                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30'
                        : isDone
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isDone ? (
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                          aria-hidden="true"
                        />
                      ) : (
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isActive
                              ? 'bg-primary-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {i + 1}
                        </span>
                      )}
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                        Step {i + 1}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {s.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                      {s.description}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Body */}
      {showPreview ? (
        <PreviewCard
          title={title}
          description={description}
          categoryName={
            categories.find((c) => c._id === categoryId)?.name || 'Category'
          }
          experienceLevel={experienceLevel}
          budgetMin={safeNumber(budgetMin)}
          budgetMax={safeNumber(budgetMax)}
          budgetType={budgetType}
          skills={skills}
          getSkillName={getSkillName}
          onBack={() => setShowPreview(false)}
          onPublish={handlePublish}
          isSubmitting={isSubmitting}
        />
      ) : (
        <div className="space-y-6">
          {/* Step 1 */}
          {step === 'basics' && (
            <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-5">
              <SectionHeader
                number="01"
                title="Project Basics"
                description="Give your project a clear title and select the right category."
              />

              <Input
                label="Project Title"
                placeholder="e.g. Build a Modern SaaS Analytics Dashboard"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((p) => ({ ...p, title: null }));
                }}
                onBlur={() => {
                  setTouched((p) => ({ ...p, title: true }));
                  validateStep('basics');
                }}
                icon={Sparkles}
                error={touched.title ? errors.title : null}
                helperText={`Be specific · ${title.length}/${TITLE_MAX} characters`}
                maxLength={TITLE_MAX}
                required
                aria-label="Project title"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Experience Level
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {EXPERIENCE_LEVELS.map((lvl) => {
                      const isActive = experienceLevel === lvl.value;
                      return (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() => setExperienceLevel(lvl.value)}
                          className={`p-2 rounded-xl border text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                            isActive
                              ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <span className="text-[11px] font-bold block">
                            {lvl.label}
                          </span>
                          <span className="text-[9px] opacity-70 block">
                            {lvl.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Step 2 */}
          {step === 'scope' && (
            <>
              <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-5">
                <SectionHeader
                  number="02"
                  title="Scope of Work"
                  description="Describe the deliverables, expectations, and any constraints."
                />

                <Textarea
                  label="Project Description"
                  placeholder="Describe goals, deliverables, technical expectations, dependencies, and constraints…"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description)
                      setErrors((p) => ({ ...p, description: null }));
                  }}
                  onBlur={() => {
                    setTouched((p) => ({ ...p, description: true }));
                    validateStep('scope');
                  }}
                  rows={8}
                  maxLength={DESC_MAX}
                  error={touched.description ? errors.description : null}
                  helperText={`${description.length}/${DESC_MAX} characters · minimum ${DESC_MIN}`}
                  required
                  aria-label="Project description"
                />
              </section>

              <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-5">
                <SectionHeader
                  number="03"
                  title="Required Skills"
                  description="Pick the skills a freelancer needs to deliver this project."
                />

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50">
                    {skills.map((skillId) => (
                      <span
                        key={skillId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary-600 text-white"
                      >
                        {getSkillName(skillId)}
                        <button
                          type="button"
                          onClick={() => removeSkill(skillId)}
                          className="hover:bg-white/20 rounded p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          aria-label={`Remove ${getSkillName(skillId)}`}
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search skills…"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label="Search skills"
                />

                {/* Skill grid */}
                <div className="max-h-64 overflow-y-auto -mx-1 px-1">
                  <div className="flex flex-wrap gap-2">
                    {filteredSkills.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">
                        No skills match &quot;{skillSearch}&quot;.
                      </p>
                    ) : (
                      filteredSkills.map((skill) => {
                        const isSelected = skills.includes(skill._id);
                        return (
                          <button
                            key={skill._id}
                            type="button"
                            onClick={() => toggleSkill(skill._id)}
                            aria-pressed={isSelected}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                              isSelected
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary-500'
                            }`}
                          >
                            {skill.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Step 3 */}
          {step === 'budget' && (
            <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-5">
              <SectionHeader
                number="04"
                title="Budget & Timeline"
                description="Set a realistic price range and a target completion date."
              />

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: 'fixed',
                    icon: IndianRupee,
                    label: 'Fixed Price',
                    sub: 'Pay by agreed milestones',
                  },
                  {
                    value: 'hourly',
                    icon: Clock,
                    label: 'Hourly Rate',
                    sub: 'Pay by tracked hours',
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  const isActive = budgetType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setBudgetType(option.value)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                        isActive
                          ? 'border-primary-600 bg-primary-50/40 dark:bg-primary-950/40'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                      aria-pressed={isActive}
                    >
                      <Icon
                        className="w-5 h-5 text-primary-600 mb-1.5"
                        aria-hidden="true"
                      />
                      <span className="text-xs sm:text-sm font-bold block text-slate-900 dark:text-white">
                        {option.label}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {option.sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={
                    budgetType === 'fixed'
                      ? `Minimum Budget (₹)`
                      : `Minimum Rate (₹/hr)`
                  }
                  type="number"
                  inputMode="numeric"
                  min={BUDGET_MIN}
                  value={budgetMin}
                  onChange={(e) => {
                    setBudgetMin(e.target.value);
                    if (errors.budgetMin)
                      setErrors((p) => ({ ...p, budgetMin: null }));
                  }}
                  onBlur={() => {
                    setTouched((p) => ({ ...p, budgetMin: true }));
                    validateStep('budget');
                  }}
                  icon={IndianRupee}
                  error={touched.budgetMin ? errors.budgetMin : null}
                  helperText={`Minimum ${safeFormatCurrency(BUDGET_MIN)}`}
                  required
                  aria-label="Minimum budget"
                />
                <Input
                  label={
                    budgetType === 'fixed'
                      ? `Maximum Budget (₹)`
                      : `Maximum Rate (₹/hr)`
                  }
                  type="number"
                  inputMode="numeric"
                  min={BUDGET_MIN}
                  value={budgetMax}
                  onChange={(e) => {
                    setBudgetMax(e.target.value);
                    if (errors.budgetMax)
                      setErrors((p) => ({ ...p, budgetMax: null }));
                  }}
                  onBlur={() => {
                    setTouched((p) => ({ ...p, budgetMax: true }));
                    validateStep('budget');
                  }}
                  icon={IndianRupee}
                  error={touched.budgetMax ? errors.budgetMax : null}
                  required
                  aria-label="Maximum budget"
                />
              </div>

              <Input
                label="Target Completion Deadline"
                type="date"
                min={todayISO()}
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.target.value);
                  if (errors.deadline)
                    setErrors((p) => ({ ...p, deadline: null }));
                }}
                error={errors.deadline}
                required
                aria-label="Project deadline"
              />

              {/* Cost estimate preview */}
              {budgetType === 'fixed' &&
                safeNumber(budgetMin) > 0 &&
                safeNumber(budgetMax) > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-2">
                      What the freelancer receives
                    </span>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        After 5% platform fee
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        {safeFormatCurrency(
                          Math.round(
                            safeNumber(budgetMax) * 0.95
                          )
                        )}{' '}
                        – {safeFormatCurrency(Math.round(safeNumber(budgetMin) * 0.95))}
                      </span>
                    </div>
                  </div>
                )}
            </section>
          )}

          {/* Step 4: Review */}
          {step === 'review' && (
            <ReviewStep
              title={title}
              description={description}
              categoryName={
                categories.find((c) => c._id === categoryId)?.name || '—'
              }
              experienceLevel={experienceLevel}
              budgetMin={safeNumber(budgetMin)}
              budgetMax={safeNumber(budgetMax)}
              budgetType={budgetType}
              deadline={deadline}
              skills={skills}
              getSkillName={getSkillName}
            />
          )}

          {/* Navigation bar */}
          <div className="sticky bottom-4 z-10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {step !== 'basics' && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  icon={ArrowLeft}
                  onClick={goPrev}
                >
                  Back
                </Button>
              )}

              {isDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  icon={RefreshCw}
                  onClick={() => setShowCancelDialog(true)}
                >
                  Reset
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {step !== 'review' ? (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  onClick={goNext}
                  className="font-bold shadow-md"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  icon={CheckCircle2}
                  onClick={handlePublish}
                  isLoading={isSubmitting}
                  className="font-bold shadow-md"
                >
                  Publish Project
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset confirmation */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={() => {
          handleReset();
          setShowCancelDialog(false);
        }}
        title="Discard this project?"
        description="All your progress will be lost, including any autosaved draft. This cannot be undone."
        confirmLabel="Discard Draft"
        cancelLabel="Keep Editing"
        variant="danger"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function SectionHeader({ number, title, description }) {
  return (
    <header className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
      <span className="font-mono text-sm text-slate-300 dark:text-slate-600 tabular-nums shrink-0">
        {number}
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-pretty">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}

function ReviewStep({
  title,
  description,
  categoryName,
  experienceLevel,
  budgetMin,
  budgetMax,
  budgetType,
  deadline,
  skills,
  getSkillName,
}) {
  return (
    <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-6">
      <SectionHeader
        number="05"
        title="Final Review"
        description="A quick look at what you're about to publish. Click Publish when ready."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryTile label="Category" value={categoryName} />
        <SummaryTile
          label="Experience Level"
          value={experienceLevel}
          className="capitalize"
        />
        <SummaryTile
          label="Budget Type"
          value={budgetType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
        />
      </div>

      <div className="space-y-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-1.5">
            Project Title
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white text-pretty">
            {title || '—'}
          </h3>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-1.5">
            Scope
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed text-pretty">
            {description || '—'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-1.5">
              Budget Range
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {safeFormatCurrency(budgetMin)}
              {budgetMax > budgetMin && ` – ${safeFormatCurrency(budgetMax)}`}
              {budgetType === 'hourly' && (
                <span className="text-slate-400 font-normal"> /hr</span>
              )}
            </span>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-1.5">
              Deadline
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {deadline
                ? new Date(deadline).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-2">
              Required Skills ({skills.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skillId) => (
                <span
                  key={skillId}
                  className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg font-semibold text-slate-700 dark:text-slate-300"
                >
                  {getSkillName(skillId)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryTile({ label, value, className = '' }) {
  return (
    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-1">
        {label}
      </span>
      <span
        className={`text-xs font-bold text-slate-900 dark:text-white truncate block ${className}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function PreviewCard({
  title,
  description,
  categoryName,
  experienceLevel,
  budgetMin,
  budgetMax,
  budgetType,
  skills,
  getSkillName,
  onBack,
  onPublish,
  isSubmitting,
}) {
  return (
    <article className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <Badge variant="warning" size="sm" dot>
          Live Posting Preview
        </Badge>
        <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
          {safeFormatCurrency(budgetMin)}
          {budgetMax > budgetMin && ` – ${safeFormatCurrency(budgetMax)}`}
          {budgetType === 'hourly' && (
            <span className="text-slate-400 font-normal"> /hr</span>
          )}
        </span>
      </div>

      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white text-pretty">
          {title || 'Your Project Title Here'}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
          <span>{categoryName}</span>
          <span aria-hidden="true">•</span>
          <span className="capitalize">{experienceLevel} Level</span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-pretty">
        {description || 'Project description will appear here…'}
      </p>

      {skills.length > 0 && (
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block">
            Required Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skillId) => (
              <span
                key={skillId}
                className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg font-semibold text-slate-700 dark:text-slate-300"
              >
                {getSkillName(skillId)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
        <Button variant="outline" onClick={onBack}>
          Back to Editing
        </Button>
        <Button
          variant="primary"
          onClick={onPublish}
          isLoading={isSubmitting}
          className="font-bold"
        >
          Publish This Project
        </Button>
      </div>
    </article>
  );
}

function FormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-pulse">
      <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export default PostProjectPage;