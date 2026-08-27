export const mockContracts = [
  {
    id: 'cntr-1',
    projectId: 'proj-3',
    projectTitle: 'Complete UI/UX Redesign & Design System for FinTech Web App',
    clientId: 'usr-client-1',
    clientName: 'Sarah Connor',
    clientCompany: 'Nexus Innovations',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    freelancerId: 'fl-2',
    freelancerUserId: 'usr-freelancer-2',
    freelancerName: 'Elena Rostova',
    freelancerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    totalBudget: 2800,
    amountPaid: 1400,
    escrowBalance: 1400,
    platformFeeRate: 0.05,
    status: 'in_progress', // 'active', 'in_progress', 'submitted', 'revision_requested', 'completed', 'disputed'
    startDate: '2026-08-19',
    deadline: '2026-09-20',
    milestones: [
      {
        id: 'ms-1-1',
        title: 'Milestone 1: Design System Tokens & Wireframe Flow',
        amount: 1400,
        status: 'completed',
        dueDate: '2026-08-28',
        completedDate: '2026-08-27',
        submission: {
          message: 'All Figma design system tokens, typography scales, color palettes (with WCAG AAA contrast), and low-fidelity user flow wireframes are ready for your review.',
          figmaLink: 'https://figma.com/file/sample-fintech-ms1',
          files: ['FinTech_Tokens_Spec.pdf']
        },
        clientFeedback: 'Approved! The tokens and contrast ratios look stellar.'
      },
      {
        id: 'ms-1-2',
        title: 'Milestone 2: High-Fidelity Screens & Interactive Prototype',
        amount: 1400,
        status: 'submitted', // Can be accepted or revision requested in demo!
        dueDate: '2026-09-15',
        submittedDate: '2026-08-20',
        submission: {
          message: 'I have finished all 16 high-fidelity desktop and mobile responsive views, along with the clickable micro-interaction prototype for transaction approval flows.',
          figmaLink: 'https://figma.com/file/sample-fintech-ms2-final',
          demoLink: 'https://figma.com/proto/sample-fintech-preview',
          files: ['FinTech_Handoff_Specs.zip']
        }
      }
    ]
  },
  {
    id: 'cntr-2',
    projectId: 'proj-past-1',
    projectTitle: 'Real-time AI Document Assistant Frontend',
    clientId: 'usr-client-1',
    clientName: 'Sarah Connor',
    clientCompany: 'Nexus Innovations',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    freelancerId: 'fl-1',
    freelancerUserId: 'usr-freelancer-1',
    freelancerName: 'Rahul Sharma',
    freelancerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    totalBudget: 3800,
    amountPaid: 3800,
    escrowBalance: 0,
    platformFeeRate: 0.05,
    status: 'completed',
    startDate: '2026-07-15',
    completedDate: '2026-08-14',
    deadline: '2026-08-15',
    milestones: [
      {
        id: 'ms-2-1',
        title: 'Complete React Assistant Interface & Streaming WebSockets',
        amount: 3800,
        status: 'completed',
        dueDate: '2026-08-15',
        completedDate: '2026-08-14',
        submission: {
          message: 'Shipped all React components with token streaming, citations viewer, and responsive markdown rendering.',
          githubLink: 'https://github.com/nexus/ai-assistant-fe',
          demoLink: 'https://assistant.nexusinnovations.io'
        }
      }
    ]
  }
];
