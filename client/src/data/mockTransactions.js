export const mockTransactions = [
  {
    id: 'tx-1094',
    invoiceNumber: 'INV-2026-0881',
    description: 'Milestone 1 Release: Design System Tokens',
    projectTitle: 'Complete UI/UX Redesign & Design System for FinTech Web App',
    clientName: 'Sarah Connor',
    freelancerName: 'Elena Rostova',
    amount: 1400.00,
    fee: 70.00,
    netAmount: 1330.00,
    type: 'milestone_release', // 'escrow_deposit', 'milestone_release', 'withdrawal', 'refund'
    status: 'completed', // 'completed', 'pending', 'processing', 'failed', 'refunded'
    date: '2026-08-20T14:22:00Z',
    paymentMethod: 'Visa •••• 4242'
  },
  {
    id: 'tx-1093',
    invoiceNumber: 'INV-2026-0879',
    description: 'Escrow Deposit: Milestone 2 Funded',
    projectTitle: 'Complete UI/UX Redesign & Design System for FinTech Web App',
    clientName: 'Sarah Connor',
    freelancerName: 'Elena Rostova',
    amount: 1400.00,
    fee: 0.00,
    netAmount: 1400.00,
    type: 'escrow_deposit',
    status: 'completed',
    date: '2026-08-19T10:15:00Z',
    paymentMethod: 'Mastercard •••• 8821'
  },
  {
    id: 'tx-1092',
    invoiceNumber: 'INV-2026-0865',
    description: 'Direct Payout to Bank Account',
    projectTitle: 'Real-time AI Document Assistant Frontend',
    clientName: 'SkillHire Platform',
    freelancerName: 'Rahul Sharma',
    amount: 3610.00,
    fee: 0.00,
    netAmount: 3610.00,
    type: 'withdrawal',
    status: 'completed',
    date: '2026-08-15T09:00:00Z',
    paymentMethod: 'HDFC Bank •••• 9104'
  },
  {
    id: 'tx-1091',
    invoiceNumber: 'INV-2026-0842',
    description: 'Milestone Completion: React Assistant Interface',
    projectTitle: 'Real-time AI Document Assistant Frontend',
    clientName: 'Sarah Connor',
    freelancerName: 'Rahul Sharma',
    amount: 3800.00,
    fee: 190.00,
    netAmount: 3610.00,
    type: 'milestone_release',
    status: 'completed',
    date: '2026-08-14T16:45:00Z',
    paymentMethod: 'Visa •••• 4242'
  },
  {
    id: 'tx-1090',
    invoiceNumber: 'INV-2026-0820',
    description: 'Escrow Deposit: Full Project Funded',
    projectTitle: 'Real-time AI Document Assistant Frontend',
    clientName: 'Sarah Connor',
    freelancerName: 'Rahul Sharma',
    amount: 3800.00,
    fee: 0.00,
    netAmount: 3800.00,
    type: 'escrow_deposit',
    status: 'completed',
    date: '2026-07-15T11:30:00Z',
    paymentMethod: 'Visa •••• 4242'
  }
];
