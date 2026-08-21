import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { Upload, Link as LinkIcon, GitBranch, Send } from 'lucide-react';

export function SubmitWorkModal({ isOpen, onClose, contract, milestone }) {
  const { submitMilestoneWork } = useMarketplace();
  const toast = useToast();

  const [message, setMessage] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!contract || !milestone) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.warning('Delivery Message Required', 'Please provide a message describing your completed deliverables.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitMilestoneWork(contract.id, milestone.id, {
        message,
        demoLink: demoLink || 'https://demo.skillhire.io/preview',
        githubLink: githubLink || 'https://github.com/client-org/project-repo',
        files: ['production_build_artifacts.zip']
      });

      setIsSubmitting(false);
      toast.success('Work Submitted!', 'Your deliverables have been sent to the client for approval.');
      onClose();
    }, 600);
  };

  const handleFillDemo = () => {
    setMessage('All milestone deliverables have been engineered, tested across mobile/desktop, and deployed to our staging preview environment. Test credentials and architecture documentation are attached.');
    setDemoLink('https://analytics-preview.nexusinnovations.io');
    setGithubLink('https://github.com/nexusinnovations/dashboard-engine');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Milestone Work"
      subtitle={`Milestone: ${milestone.title}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Provide completed deliverable links & notes</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Auto-fill demo submission
          </button>
        </div>

        <Textarea
          label="Delivery Message & Notes"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe what was completed in this milestone, testing instructions, and deployment details..."
          rows={4}
          required
        />

        <Input
          label="Live Demo / Prototype URL (Optional)"
          type="url"
          value={demoLink}
          onChange={(e) => setDemoLink(e.target.value)}
          icon={LinkIcon}
          placeholder="https://staging.app.com"
        />

        <Input
          label="GitHub / Repository URL (Optional)"
          type="url"
          value={githubLink}
          onChange={(e) => setGithubLink(e.target.value)}
          icon={GitBranch}
          placeholder="https://github.com/org/repo"
        />

        <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center bg-slate-50/50 dark:bg-slate-850/50">
          <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Drag & drop assets (ZIP, PDF, Figma)
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Max file size 100MB</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Send} isLoading={isSubmitting}>
            Submit Deliverable
          </Button>
        </div>
      </form>
    </Modal>
  );
}
