import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { SubmitWorkModal } from '../../components/project/SubmitWorkModal';
import { ProjectProgress } from '../../components/dashboard/ProjectProgress';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitBranch,
  FileText,
  AlertCircle,
  MessageSquare,
  Upload,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export function FreelancerContractWorkspacePage() {
  const { id } = useParams();
  const { contracts } = useMarketplace();
  const { currentUser } = useAuth();

  const [activeSubmissionMilestone, setActiveSubmissionMilestone] = useState(null);

  const contract = contracts.find(c => c.id === id) || contracts[0];

  if (!contract) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Contract workspace not found</h2>
        <Link to="/dashboard/freelancer/contracts" className="text-primary-600 mt-4 inline-block">Return to Contracts</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Back Link & Header */}
      <div className="space-y-4">
        <Link
          to="/dashboard/freelancer/contracts"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contracts</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">Active Freelancer Workspace</Badge>
              <span className="text-xs text-slate-400">Contract #{contract.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {contract.projectTitle}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Client: <strong className="text-slate-900 dark:text-white">{contract.clientName} ({contract.clientCompany})</strong></span>
              <span>•</span>
              <span>Due: {formatDate(contract.deadline)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/messages">
              <Button variant="outline" size="sm" icon={MessageSquare}>
                Chat with Client
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Project Lifecycle</h3>
        <ProjectProgress status={contract.status} />
      </div>

      {/* Main Grid: Milestones + Client & Escrow Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Milestones & Deliverables</h2>

          {contract.milestones?.map((ms, idx) => (
            <div
              key={ms.id}
              className={`p-6 rounded-2xl border transition-all space-y-4 ${
                ms.status === 'revision_requested'
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700/60 shadow-soft'
                  : ms.status === 'submitted'
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-soft'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Milestone {idx + 1}</span>
                    {ms.status === 'completed' && <Badge variant="success" size="sm">Approved & Paid</Badge>}
                    {ms.status === 'submitted' && <Badge variant="warning" size="sm" dot>Under Client Review</Badge>}
                    {ms.status === 'revision_requested' && <Badge variant="danger" size="sm" dot>Revision Requested</Badge>}
                    {ms.status === 'in_progress' && <Badge variant="primary" size="sm" dot>In Progress</Badge>}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{ms.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Due {formatDate(ms.dueDate)}</p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white block">
                    {formatCurrency(ms.amount)}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Take home: {formatCurrency(ms.amount * 0.95)}
                  </span>
                </div>
              </div>

              {/* Revision Request Banner if any */}
              {ms.revisionNotes && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <span>Client Requested Adjustments:</span>
                  </div>
                  <p className="italic leading-relaxed">"{ms.revisionNotes}"</p>
                </div>
              )}

              {/* Submission Details if submitted */}
              {ms.submission && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">Your Delivered Work:</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                    {ms.submission.message}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {ms.submission.demoLink && (
                      <a href={ms.submission.demoLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-600 font-semibold hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" /> Demo Link
                      </a>
                    )}
                    {ms.submission.githubLink && (
                      <a href={ms.submission.githubLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold hover:underline">
                        <GitBranch className="w-3.5 h-3.5" /> GitHub Repo
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Work CTA */}
              {(ms.status === 'in_progress' || ms.status === 'revision_requested') && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    icon={Upload}
                    className="font-bold shadow-md"
                    onClick={() => setActiveSubmissionMilestone(ms)}
                  >
                    Submit Milestone Deliverables
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Col: Escrow & Client Info */}
        <div className="space-y-6">
          {/* Escrow Details */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Escrow Guarantee</h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Contract Total:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(contract.totalBudget)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Funded in Escrow:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(contract.escrowBalance)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Platform Fee (5%):</span>
                <span className="text-slate-500">{formatCurrency(contract.totalBudget * 0.05)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Funds are 100% pre-funded and will be credited to your available balance upon milestone approval.</span>
            </div>
          </div>

          {/* Client Info */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Client Info</h3>

            <div className="flex items-center gap-3.5">
              <Avatar src={contract.clientAvatar} alt={contract.clientName} size="md" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{contract.clientName}</h4>
                <p className="text-xs text-slate-400">{contract.clientCompany}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deliverable Submission Modal */}
      {activeSubmissionMilestone && (
        <SubmitWorkModal
          isOpen={!!activeSubmissionMilestone}
          onClose={() => setActiveSubmissionMilestone(null)}
          contract={contract}
          milestone={activeSubmissionMilestone}
        />
      )}
    </div>
  );
}
