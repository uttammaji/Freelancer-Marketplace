// client/src/pages/freelancer/FreelancerContractWorkspacePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getContractById, updateContractProgress } from '../../services/contract.service';
import { 
  getContractDeliveries, 
  createDelivery, 
  updateDelivery 
} from '../../services/delivery.service';
import { SubmitWorkModal } from '../../components/project/SubmitWorkModal';
import { ProjectProgress } from '../../components/dashboard/ProjectProgress';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  GitBranch,
  FileText,
  MessageSquare,
  Upload,
  RotateCcw,
  Loader2,
} from 'lucide-react';

export function FreelancerContractWorkspacePage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const toast = useToast();

  const [contract, setContract] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeDeliveryForRevision, setActiveDeliveryForRevision] = useState(null);

  // Fetch contract and deliveries
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [contractRes, deliveriesRes] = await Promise.all([
        getContractById(id),
        getContractDeliveries(id)
      ]);

      if (contractRes.success) {
        setContract(contractRes.contract);
      }

      if (deliveriesRes.success) {
        setDeliveries(deliveriesRes.deliveries || []);
      }
    } catch (error) {
      console.error('Failed to fetch workspace:', error);
      toast.error('Load Failed', 'Could not load contract workspace.');
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle submit work
  const handleSubmitWork = async (data) => {
    try {
      const response = await createDelivery({
        contractId: id,
        title: data.title,
        description: data.description,
        attachments: data.attachments || [],
        githubUrl: data.githubUrl || null,
        liveDemoUrl: data.liveDemoUrl || null,
      });

      if (response.success) {
        toast.success('Work Submitted!', 'Client will review your delivery.');
        setIsSubmitModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to submit work:', error);
      toast.error('Submit Failed', error.response?.data?.message || 'Could not submit work.');
    }
  };

  // Handle resubmit after revision
  const handleResubmit = async (data) => {
    if (!activeDeliveryForRevision) return;

    try {
      const response = await updateDelivery(activeDeliveryForRevision._id, {
        title: data.title,
        description: data.description,
        attachments: data.attachments || [],
        githubUrl: data.githubUrl || null,
        liveDemoUrl: data.liveDemoUrl || null,
      });

      if (response.success) {
        toast.success('Resubmitted!', 'Work resubmitted for client review.');
        setActiveDeliveryForRevision(null);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to resubmit:', error);
      toast.error('Resubmit Failed', error.response?.data?.message || 'Could not resubmit work.');
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="warning" size="sm" dot>Under Client Review</Badge>;
      case 'revision_requested':
        return <Badge variant="danger" size="sm" dot>Revision Requested</Badge>;
      case 'accepted':
        return <Badge variant="success" size="sm" dot>Accepted & Paid</Badge>;
      default:
        return <Badge variant="primary" size="sm" dot>In Progress</Badge>;
    }
  };

  // Check if can submit new work
  const canSubmitWork = () => {
    if (!contract) return false;
    
    const hasPendingDelivery = deliveries.some(
      d => d.status === 'submitted' || d.status === 'revision_requested'
    );
    
    return !hasPendingDelivery && ['active', 'in_progress'].includes(contract.status);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!contract) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contract not found</h2>
        <Link to="/dashboard/freelancer/contracts" className="text-primary-600 mt-4 inline-block">
          Return to Contracts
        </Link>
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
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="success" size="sm">
                {contract.status === 'active' ? 'Active Contract' : contract.status}
              </Badge>
              <span className="text-xs text-slate-400">ID: #{contract._id?.slice(-6)}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {contract.projectId?.title || 'Project'}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Client: <strong className="text-slate-900 dark:text-white">{contract.clientId?.name || 'Client'}</strong></span>
              <span>•</span>
              <span>Due: {formatDate(contract.deadline)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/messages">
              <Button variant="outline" size="sm" icon={MessageSquare}>
                Message Client
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Project Lifecycle</h3>
        <ProjectProgress status={contract.status} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Deliveries */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Deliveries</h2>
            
            {canSubmitWork() && (
              <Button
                variant="primary"
                size="sm"
                icon={Upload}
                onClick={() => setIsSubmitModalOpen(true)}
              >
                Submit Work
              </Button>
            )}
          </div>

          {deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <div
                key={delivery._id}
                className={`p-6 rounded-2xl border transition-all space-y-4 ${
                  delivery.status === 'revision_requested'
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700/60'
                    : delivery.status === 'submitted'
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Delivery v{delivery.version || 1}
                      </span>
                      {getStatusBadge(delivery.status)}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {delivery.title || 'Work Submission'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submitted {formatDate(delivery.submittedAt || delivery.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Delivery message */}
                {delivery.message && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                    {delivery.message}
                  </p>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-3 pt-1">
                  {delivery.liveUrl && (
                    <a
                      href={delivery.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Live Demo
                    </a>
                  )}
                  {delivery.githubUrl && (
                    <a
                      href={delivery.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      GitHub Repo
                    </a>
                  )}
                </div>

                {/* Revision feedback */}
                {delivery.revisionMessage && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <RotateCcw className="w-4 h-4 text-rose-600" />
                      <span>Client Requested Adjustments:</span>
                    </div>
                    <p className="italic leading-relaxed">"{delivery.revisionMessage}"</p>
                  </div>
                )}

                {/* Resubmit button */}
                {delivery.status === 'revision_requested' && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Upload}
                      onClick={() => setActiveDeliveryForRevision(delivery)}
                    >
                      Resubmit Work
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No deliveries yet.</p>
              <p className="text-xs text-slate-400 mt-1">Submit your work when ready.</p>
            </div>
          )}
        </div>

        {/* Escrow & Client Info */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Escrow Guarantee</h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Contract Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(contract.amount)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Platform Fee (5%):</span>
                <span className="text-slate-500">{formatCurrency(contract.platformFee || 0)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm font-bold">
                <span className="text-slate-900 dark:text-white">You Receive:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(contract.freelancerAmount || contract.amount)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Funds are pre-funded and will be released upon client approval.</span>
            </div>
          </div>

          {/* Client Info */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Client Info</h3>

            <div className="flex items-center gap-3.5">
              <Avatar 
                src={contract.clientId?.avatar} 
                name={contract.clientId?.name} 
                size="md" 
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {contract.clientId?.name || 'Client'}
                </h4>
                <p className="text-xs text-slate-400">{contract.clientId?.email || ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Work Modal */}
      {isSubmitModalOpen && (
        <SubmitWorkModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          contract={contract}
          onSubmit={handleSubmitWork}
        />
      )}

      {/* Resubmit Modal (after revision) */}
      {activeDeliveryForRevision && (
        <SubmitWorkModal
          isOpen={!!activeDeliveryForRevision}
          onClose={() => setActiveDeliveryForRevision(null)}
          contract={contract}
          delivery={activeDeliveryForRevision}
          onSubmit={handleResubmit}
          isRevision={true}
        />
      )}
    </div>
  );
}

export default FreelancerContractWorkspacePage;