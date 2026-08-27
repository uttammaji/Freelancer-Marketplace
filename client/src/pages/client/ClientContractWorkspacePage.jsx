import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { RequestRevisionModal } from '../../components/project/RequestRevisionModal';
import { WriteReviewModal } from '../../components/project/WriteReviewModal';
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
  Star,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function ClientContractWorkspacePage() {
  const { id } = useParams();
  const { contracts, acceptMilestoneWorkAndReleaseEscrow } = useMarketplace();
  const { currentUser } = useAuth();
  const toast = useToast();

  const [activeRevisionMilestone, setActiveRevisionMilestone] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isProcessingRelease, setIsProcessingRelease] = useState(false);

  const contract = contracts.find(c => c.id === id) || contracts[0];

  if (!contract) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Contract not found</h2>
        <Link to="/dashboard/client/contracts" className="text-primary-600 mt-4 inline-block">Return to Contracts</Link>
      </div>
    );
  }

  const handleAcceptMilestone = (milestoneId) => {
    setIsProcessingRelease(true);
    setTimeout(() => {
      acceptMilestoneWorkAndReleaseEscrow(contract.id, milestoneId);
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log(e);
      }
      setIsProcessingRelease(false);
      toast.success('Escrow Released! 💰', 'Milestone payment transferred to freelancer. Please leave your review.');
      setIsReviewModalOpen(true);
    }, 700);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Back Link & Header */}
      <div className="space-y-4">
        <Link
          to="/dashboard/client/contracts"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contracts</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Active Escrow Contract</Badge>
              <span className="text-xs text-slate-400">ID: #{contract.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {contract.projectTitle}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Hired: <strong className="text-slate-900 dark:text-white">{contract.freelancerName}</strong></span>
              <span>•</span>
              <span>Deadline: {formatDate(contract.deadline)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/messages">
              <Button variant="outline" size="sm" icon={MessageSquare}>
                Chat with Freelancer
              </Button>
            </Link>
            {contract.status === 'completed' && (
              <Button
                variant="primary"
                size="sm"
                icon={Star}
                onClick={() => setIsReviewModalOpen(true)}
              >
                Leave Review
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Lifecycle Progress Timeline */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Project Lifecycle</h3>
        <ProjectProgress status={contract.status} />
      </div>

      {/* Main Grid: Milestones + Escrow Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Milestone Submissions & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contract Milestones & Deliverables</h2>

          {contract.milestones?.map((ms, idx) => (
            <div
              key={ms.id}
              className={`p-6 rounded-2xl border transition-all space-y-4 ${
                ms.status === 'submitted'
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-soft'
                  : ms.status === 'completed'
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Milestone {idx + 1}</span>
                    {ms.status === 'completed' && <Badge variant="success" size="sm">Approved & Released</Badge>}
                    {ms.status === 'submitted' && <Badge variant="warning" size="sm" dot>Deliverable Submitted</Badge>}
                    {ms.status === 'revision_requested' && <Badge variant="danger" size="sm" dot>Revision in Progress</Badge>}
                    {ms.status === 'in_progress' && <Badge variant="primary" size="sm" dot>In Progress</Badge>}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{ms.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Due {formatDate(ms.dueDate)}</p>
                </div>

                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(ms.amount)}
                </span>
              </div>

              {/* Submission Details Box if submitted or completed */}
              {ms.submission && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary-500" /> Deliverable Submission Notes:
                    </span>
                    <span className="text-[11px] text-slate-400">Submitted {ms.submittedDate || 'Recently'}</span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                    {ms.submission.message}
                  </p>

                  {/* Links */}
                  <div className="flex flex-wrap gap-3 pt-1">
                    {ms.submission.demoLink && (
                      <a
                        href={ms.submission.demoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Prototype Demo</span>
                      </a>
                    )}
                    {ms.submission.githubLink && (
                      <a
                        href={ms.submission.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>GitHub Repository</span>
                      </a>
                    )}
                    {ms.submission.files?.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <FileText className="w-3.5 h-3.5" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Revision notes if any */}
              {ms.revisionNotes && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2">
                  <RotateCcw className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Your Revision Notes:</span>
                    <span>"{ms.revisionNotes}"</span>
                  </div>
                </div>
              )}

              {/* Approval Buttons if submitted */}
              {ms.status === 'submitted' && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600 dark:text-rose-400"
                    onClick={() => setActiveRevisionMilestone(ms)}
                  >
                    Request Changes / Revision
                  </Button>

                  <Button
                    variant="primary"
                    size="md"
                    icon={Check}
                    className="font-bold shadow-md"
                    onClick={() => handleAcceptMilestone(ms.id)}
                    isLoading={isProcessingRelease}
                  >
                    Accept Work & Release {formatCurrency(ms.amount)}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Col: Escrow & Financial Summary */}
        <div className="space-y-6">
          {/* Escrow Vault Box */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Escrow Security Vault</h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Contract Value:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(contract.totalBudget)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Already Paid / Released:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(contract.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Remaining in Escrow:</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(contract.escrowBalance)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Escrow balance is 100% reserved and ready for release when milestones finish.</span>
            </div>
          </div>

          {/* Freelancer Profile Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Specialist</h3>

            <div className="flex items-center gap-3.5">
              <Avatar src={contract.freelancerAvatar} alt={contract.freelancerName} size="md" isOnline={true} />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{contract.freelancerName}</h4>
                <p className="text-xs text-slate-400">Top Rated Engineer</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link to={`/freelancers/${contract.freelancerId}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Public Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Revision Request Modal */}
      {activeRevisionMilestone && (
        <RequestRevisionModal
          isOpen={!!activeRevisionMilestone}
          onClose={() => setActiveRevisionMilestone(null)}
          contract={contract}
          milestone={activeRevisionMilestone}
        />
      )}

      {/* Leave Review Modal */}
      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        contract={contract}
      />
    </div>
  );
}
