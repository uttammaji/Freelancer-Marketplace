export const mockNotifications = [
  {
    id: 'notif-1',
    title: 'New Proposal Received',
    message: 'Rahul Sharma submitted a proposal on "Build a Modern SaaS Analytics Dashboard in React & Node.js"',
    type: 'proposal', // 'proposal', 'contract', 'payment', 'message', 'review', 'system'
    isRead: false,
    timestamp: '10 minutes ago',
    link: '/dashboard/client/projects/proj-1/proposals'
  },
  {
    id: 'notif-2',
    title: 'Milestone Work Submitted',
    message: 'Elena Rostova submitted work for Milestone 2: High-Fidelity Screens & Interactive Prototype',
    type: 'contract',
    isRead: false,
    timestamp: '2 hours ago',
    link: '/dashboard/client/contracts/cntr-1'
  },
  {
    id: 'notif-3',
    title: 'Payment Released to Escrow',
    message: '$1,400.00 escrow deposit secured for Complete UI/UX Redesign project.',
    type: 'payment',
    isRead: true,
    timestamp: 'Yesterday',
    link: '/dashboard/client/payments'
  },
  {
    id: 'notif-4',
    title: 'New Review Received',
    message: 'Sarah Connor left a 5.0 ★ review on your completed contract.',
    type: 'review',
    isRead: true,
    timestamp: 'Aug 14, 2026',
    link: '/dashboard/freelancer/reviews'
  },
  {
    id: 'notif-5',
    title: 'Proposal Shortlisted!',
    message: 'Nexus Innovations shortlisted your proposal for "Build a Modern SaaS Analytics Dashboard"',
    type: 'proposal',
    isRead: true,
    timestamp: 'Aug 19, 2026',
    link: '/dashboard/freelancer/proposals'
  }
];
