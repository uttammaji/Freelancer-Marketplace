import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { mockCategories } from '../../data/mockCategories';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import {
  FolderPlus,
  DollarSign,
  Clock,
  Sparkles,
  Upload,
  CheckCircle2,
  X,
  Eye,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function PostProjectPage() {
  const { currentUser } = useAuth();
  const { addProject } = useMarketplace();
  const toast = useToast();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [description, setDescription] = useState('');
  const [budgetType, setBudgetType] = useState('fixed'); // 'fixed' or 'hourly'
  const [budget, setBudget] = useState(3500);
  const [minRate, setMinRate] = useState(45);
  const [maxRate, setMaxRate] = useState(75);
  const [experienceLevel, setExperienceLevel] = useState('Expert');
  const [estimatedDuration, setEstimatedDuration] = useState('1 to 3 months');
  const [deadline, setDeadline] = useState('2026-10-30');
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Node.js', 'Tailwind CSS']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [deliverables, setDeliverables] = useState([
    'Responsive frontend interface with Tailwind CSS',
    'Robust API endpoints with authentication & error handling',
    'Comprehensive test coverage & deployment documentation'
  ]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');
  const [attachments, setAttachments] = useState([
    { name: 'Project_Architecture_Overview.pdf', size: '2.4 MB' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const popularSkillsByCategory = {
    'Web Development': ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'GraphQL', 'Docker'],
    'Mobile Development': ['Flutter', 'React Native', 'Swift', 'Kotlin', 'Firebase', 'iOS', 'Android SDK'],
    'UI/UX Design': ['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping', 'User Research'],
    'AI & Machine Learning': ['Python', 'OpenAI API', 'LangChain', 'Vector DBs', 'PyTorch', 'FastAPI'],
    'Graphic Design': ['Adobe Illustrator', 'Photoshop', 'Brand Identity', 'Logo Design', 'Blender 3D'],
    'Digital Marketing': ['SEO Optimization', 'Google Ads', 'Meta Ads', 'Content Strategy', 'Analytics'],
    'Content & Copywriting': ['Technical Writing', 'Copywriting', 'SEO Articles', 'Product Documentation'],
    'Video & Animation': ['After Effects', 'Premiere Pro', 'Motion Graphics', 'Video Editing']
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills(prev => [...prev, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddDeliverable = (e) => {
    e.preventDefault();
    if (newDeliverableInput.trim()) {
      setDeliverables(prev => [...prev, newDeliverableInput.trim()]);
      setNewDeliverableInput('');
    }
  };

  const handleRemoveDeliverable = (idx) => {
    setDeliverables(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePublish = (status = 'open') => {
    if (!title.trim() || title.length < 10) {
      toast.warning('Title Required', 'Please enter a descriptive project title (at least 10 characters).');
      return;
    }
    if (!description.trim() || description.length < 30) {
      toast.warning('Description Required', 'Please provide detailed project specifications (at least 30 characters).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newProj = addProject({
        title,
        category,
        categorySlug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        budgetType,
        budget: Number(budget),
        hourlyRateRange: { min: Number(minRate), max: Number(maxRate) },
        experienceLevel,
        estimatedDuration,
        deadline,
        skills,
        deliverables,
        attachments,
        status: status, // 'open' or 'draft'
        clientId: currentUser?.id || 'usr-client-1',
        clientName: currentUser?.name || 'Sarah Connor',
        clientCompany: currentUser?.company || 'Nexus Innovations',
        clientAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        clientLocation: currentUser?.location || 'San Francisco, USA',
        isFeatured: false,
        isUrgent: false
      });

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log(e);
      }

      setIsSubmitting(false);
      toast.success('Project Published! 🚀', 'Freelancers can now discover your project and submit bids.');
      navigate(`/dashboard/client/projects`);
    }, 700);
  };

  const handleAutoFill = () => {
    setTitle('Full Stack Next.js & Tailwind SaaS Platform with AI Copilot');
    setCategory('Web Development');
    setDescription(
      `We are building a collaborative enterprise workflow platform that integrates with OpenAI APIs to automate document synthesis.\n\nScope of Work:\n1. Translate 14 Figma design screens into responsive Next.js 14 App Router views.\n2. Connect backend GraphQL/REST endpoints with optimistic caching.\n3. Integrate streaming AI copilot chat interface with syntax highlighting and citation modals.\n4. Ensure full WCAG AAA color contrast compliance and mobile responsiveness.`
    );
    setBudget(4200);
    setEstimatedDuration('1 to 2 months');
    setSkills(['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'OpenAI API', 'GraphQL', 'PostgreSQL']);
  };

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
        /* Live Preview Card */
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <Badge variant="warning" size="sm">Live Posting Preview</Badge>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {budgetType === 'fixed' ? formatCurrency(budget) : `$${minRate} - $${maxRate}/hr`}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{title || 'Your Project Title Here'}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span>{category}</span>
              <span>•</span>
              <span>{experienceLevel} Level</span>
              <span>•</span>
              <span>{estimatedDuration}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {description || 'Project description specifications will appear here...'}
          </p>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Required Skills:</span>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, idx) => (
                <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg font-semibold text-slate-700 dark:text-slate-300">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowPreview(false)}>Back to Editing</Button>
            <Button variant="primary" onClick={() => handlePublish('open')} isLoading={isSubmitting}>Publish This Job</Button>
          </div>
        </div>
      ) : (
        /* Multi-section Form */
        <div className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              1. Project Title & Domain
            </h3>

            <Input
              label="Project Title"
              placeholder="e.g. Build a Modern SaaS Analytics Dashboard in React & Node.js"
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
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {mockCategories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Experience Level Required
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="Entry">Entry Level (Junior)</option>
                  <option value="Intermediate">Intermediate (Mid-level)</option>
                  <option value="Expert">Expert (Senior / Lead)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Scope */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              2. Scope of Work & Deliverables
            </h3>

            <Textarea
              label="Project Description"
              placeholder="Describe your project goals, technical expectations, dependencies, and any constraints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              maxLength={3000}
              required
            />

            {/* Deliverables checklist builder */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Deliverables Checklist
              </label>
              <div className="space-y-2 mb-3">
                {deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-slate-800 dark:text-slate-200">{item}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add another deliverable item..."
                  value={newDeliverableInput}
                  onChange={(e) => setNewDeliverableInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDeliverable(e))}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <Button variant="outline" size="sm" onClick={handleAddDeliverable} icon={Plus}>
                  Add
                </Button>
              </div>
            </div>

            {/* Skills selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Required Skills
              </label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/60"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <span className="text-[11px] text-slate-400 block font-medium">Suggested for {category}:</span>
                <div className="flex flex-wrap gap-1.5">
                  {popularSkillsByCategory[category]?.map(s => {
                    const isAdded = skills.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => !isAdded && setSkills(prev => [...prev, s])}
                        disabled={isAdded}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          isAdded
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent cursor-default'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-primary-500'
                        }`}
                      >
                        + {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Budget & Timeline */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              3. Budget & Timeline
            </h3>

            {/* Budget type selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBudgetType('fixed')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  budgetType === 'fixed'
                    ? 'border-primary-600 bg-primary-50/40 dark:bg-primary-950/40 text-primary-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <DollarSign className="w-5 h-5 text-primary-600 mb-1" />
                <span className="text-xs sm:text-sm font-bold block">Fixed Price Project</span>
                <span className="text-[11px] text-slate-400">Pay by agreed milestone deliverables</span>
              </button>

              <button
                type="button"
                onClick={() => setBudgetType('hourly')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  budgetType === 'hourly'
                    ? 'border-primary-600 bg-primary-50/40 dark:bg-primary-950/40 text-primary-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Clock className="w-5 h-5 text-primary-600 mb-1" />
                <span className="text-xs sm:text-sm font-bold block">Hourly Rate Range</span>
                <span className="text-[11px] text-slate-400">Pay by tracked hours worked</span>
              </button>
            </div>

            {budgetType === 'fixed' ? (
              <Input
                label="Total Fixed Budget ($ USD)"
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                icon={DollarSign}
                helperText="Estimated total cost across all milestones. Escrow is funded upon hiring."
                required
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Minimum Hourly Rate ($/hr)"
                  type="number"
                  value={minRate}
                  onChange={(e) => setMinRate(Number(e.target.value))}
                  icon={DollarSign}
                  required
                />
                <Input
                  label="Maximum Hourly Rate ($/hr)"
                  type="number"
                  value={maxRate}
                  onChange={(e) => setMaxRate(Number(e.target.value))}
                  icon={DollarSign}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Estimated Duration
                </label>
                <select
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="Less than 1 month">Less than 1 month</option>
                  <option value="1 to 3 months">1 to 3 months</option>
                  <option value="3 to 6 months">3 to 6 months</option>
                  <option value="More than 6 months">More than 6 months</option>
                </select>
              </div>

              <Input
                label="Target Completion Deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section 4: File Attachments */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              4. Specification Attachments (Optional)
            </h3>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-850/30">
              <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Drag & drop requirements document, wireframes, or API specs
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">PDF, DOCX, PNG, ZIP up to 50MB</p>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{att.name} ({att.size})</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Button
              variant="ghost"
              size="md"
              onClick={() => handlePublish('draft')}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>

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
                onClick={() => handlePublish('open')}
                isLoading={isSubmitting}
              >
                Publish Job Post ({budgetType === 'fixed' ? formatCurrency(budget) : `$${minRate}-$${maxRate}/hr`})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
