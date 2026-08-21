export const mockDisputes = [
  {
    id: 'disp-101',
    projectId: 'proj-past-legacy-3',
    projectTitle: 'E-Commerce React Native Mobile App Redesign',
    clientId: 'usr-client-2',
    clientName: 'Marcus Vance',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    freelancerId: 'fl-5',
    freelancerName: 'Lucas Silva',
    freelancerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    disputeAmount: 1200.00,
    status: 'open', // 'open', 'resolved', 'in_mediation'
    reason: 'Scope Disagreement & Delayed Milestone',
    createdAt: '2026-08-19T08:30:00Z',
    clientClaim: 'Freelancer missed 2 milestone deadlines and delivered components without TypeScript types as originally specified in the deliverables agreement.',
    freelancerClaim: 'Client changed the API contract halfway through the milestone without extending the deadline or adding compensation for rewriting the state layer.',
    evidence: [
      { sender: 'Client', note: 'Project brief explicitly states TypeScript is required on all mobile screens.' },
      { sender: 'Freelancer', note: 'Backend auth API changed from Cookie-based to Bearer JWT on Aug 10th.' }
    ]
  },
  {
    id: 'disp-102',
    projectId: 'proj-past-legacy-4',
    projectTitle: 'SEO Technical Audit and Schema Markup Implementation',
    clientId: 'usr-client-1',
    clientName: 'Sarah Connor',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    freelancerId: 'fl-6',
    freelancerName: 'Sophie Dubois',
    freelancerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    disputeAmount: 600.00,
    status: 'resolved',
    reason: 'Incomplete Deliverables',
    createdAt: '2026-08-10T14:00:00Z',
    resolvedAt: '2026-08-12T16:30:00Z',
    resolutionAction: 'Partial Refund (50% Client, 50% Freelancer)',
    clientClaim: 'Schema markup was only implemented on home and product pages, missing category pages.',
    freelancerClaim: 'Category page structure had invalid HTML templates that prevented schema injection.'
  }
];
