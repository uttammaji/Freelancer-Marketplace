import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProjects } from '../data/mockProjects';
import { mockFreelancers } from '../data/mockFreelancers';
import { mockProposals } from '../data/mockProposals';
import { mockContracts } from '../data/mockContracts';
import { mockConversations } from '../data/mockMessages';
import { mockNotifications } from '../data/mockNotifications';
import { mockTransactions } from '../data/mockTransactions';
import { mockDisputes } from '../data/mockDisputes';
import { mockUsers } from '../data/mockUsers';

const MarketplaceContext = createContext();

export function MarketplaceProvider({ children }) {
  // Load or initialize state
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('skillhire_projects');
    return saved ? JSON.parse(saved) : mockProjects;
  });

  const [freelancers, setFreelancers] = useState(() => {
    const saved = localStorage.getItem('skillhire_freelancers');
    return saved ? JSON.parse(saved) : mockFreelancers;
  });

  const [proposals, setProposals] = useState(() => {
    const saved = localStorage.getItem('skillhire_proposals');
    return saved ? JSON.parse(saved) : mockProposals;
  });

  const [contracts, setContracts] = useState(() => {
    const saved = localStorage.getItem('skillhire_contracts');
    return saved ? JSON.parse(saved) : mockContracts;
  });

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('skillhire_conversations');
    return saved ? JSON.parse(saved) : mockConversations;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('skillhire_notifications');
    return saved ? JSON.parse(saved) : mockNotifications;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('skillhire_transactions');
    return saved ? JSON.parse(saved) : mockTransactions;
  });

  const [disputes, setDisputes] = useState(() => {
    const saved = localStorage.getItem('skillhire_disputes');
    return saved ? JSON.parse(saved) : mockDisputes;
  });

  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('skillhire_users_list');
    return saved ? JSON.parse(saved) : mockUsers.map(u => ({ ...u, status: 'active' }));
  });

  const [savedProjectIds, setSavedProjectIds] = useState(() => {
    const saved = localStorage.getItem('skillhire_saved_projects');
    return saved ? JSON.parse(saved) : ['proj-1', 'proj-3'];
  });

  const [savedFreelancerIds, setSavedFreelancerIds] = useState(() => {
    const saved = localStorage.getItem('skillhire_saved_freelancers');
    return saved ? JSON.parse(saved) : ['fl-1'];
  });

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('skillhire_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('skillhire_freelancers', JSON.stringify(freelancers)); }, [freelancers]);
  useEffect(() => { localStorage.setItem('skillhire_proposals', JSON.stringify(proposals)); }, [proposals]);
  useEffect(() => { localStorage.setItem('skillhire_contracts', JSON.stringify(contracts)); }, [contracts]);
  useEffect(() => { localStorage.setItem('skillhire_conversations', JSON.stringify(conversations)); }, [conversations]);
  useEffect(() => { localStorage.setItem('skillhire_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('skillhire_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('skillhire_disputes', JSON.stringify(disputes)); }, [disputes]);
  useEffect(() => { localStorage.setItem('skillhire_users_list', JSON.stringify(usersList)); }, [usersList]);
  useEffect(() => { localStorage.setItem('skillhire_saved_projects', JSON.stringify(savedProjectIds)); }, [savedProjectIds]);
  useEffect(() => { localStorage.setItem('skillhire_saved_freelancers', JSON.stringify(savedFreelancerIds)); }, [savedFreelancerIds]);

  // Project Actions
  const addProject = (projectData) => {
    const newProj = {
      id: 'proj-' + Date.now(),
      slug: projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      proposalsCount: 0,
      hiresCount: 0,
      postedTime: 'Just now',
      createdAt: new Date().toISOString(),
      status: 'open',
      clientRating: 4.95,
      clientSpent: 48500,
      clientHires: 12,
      clientPaymentVerified: true,
      ...projectData
    };
    setProjects(prev => [newProj, ...prev]);
    return newProj;
  };

  const updateProject = (id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const toggleSaveProject = (projectId) => {
    setSavedProjectIds(prev =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const toggleSaveFreelancer = (freelancerId) => {
    setSavedFreelancerIds(prev =>
      prev.includes(freelancerId) ? prev.filter(id => id !== freelancerId) : [...prev, freelancerId]
    );
  };

  // Proposal Actions
  const submitProposal = (proposalData) => {
    const newProp = {
      id: 'prop-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...proposalData
    };
    setProposals(prev => [newProp, ...prev]);

    // Increment proposal count on project
    setProjects(prev => prev.map(p => {
      if (p.id === proposalData.projectId) {
        return { ...p, proposalsCount: (p.proposalsCount || 0) + 1 };
      }
      return p;
    }));

    // Add notification for client
    addNotification({
      title: 'New Proposal Received',
      message: `${proposalData.freelancerName} submitted a proposal on your project.`,
      type: 'proposal',
      link: `/dashboard/client/projects/${proposalData.projectId}/proposals`
    });

    return newProp;
  };

  const updateProposalStatus = (proposalId, status) => {
    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status } : p));
  };

  // Contract & Hiring Actions
  const hireFreelancerAndCreateContract = ({ project, proposal, freelancer, client }) => {
    // 1. Mark proposal as accepted
    updateProposalStatus(proposal.id, 'accepted');

    // 2. Update project status
    updateProject(project.id, { status: 'in_progress', hiresCount: 1 });

    // 3. Create contract
    const newContract = {
      id: 'cntr-' + Date.now(),
      projectId: project.id,
      projectTitle: project.title,
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company || client.name,
      clientAvatar: client.avatar,
      freelancerId: freelancer.id,
      freelancerUserId: freelancer.userId || freelancer.id,
      freelancerName: freelancer.name,
      freelancerAvatar: freelancer.avatar,
      totalBudget: proposal.bidAmount || project.budget,
      amountPaid: 0,
      escrowBalance: proposal.bidAmount || project.budget,
      platformFeeRate: 0.05,
      status: 'in_progress',
      startDate: new Date().toISOString().split('T')[0],
      deadline: project.deadline || '2026-10-30',
      milestones: [
        {
          id: 'ms-' + Date.now() + '-1',
          title: 'Full Project Milestone Deliverables',
          amount: proposal.bidAmount || project.budget,
          status: 'in_progress',
          dueDate: project.deadline || '2026-10-30'
        }
      ]
    };
    setContracts(prev => [newContract, ...prev]);

    // 4. Record Escrow Transaction
    const newTx = {
      id: 'tx-' + Date.now(),
      invoiceNumber: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
      description: `Escrow Funded: ${project.title}`,
      projectTitle: project.title,
      clientName: client.name,
      freelancerName: freelancer.name,
      amount: proposal.bidAmount || project.budget,
      fee: 0,
      netAmount: proposal.bidAmount || project.budget,
      type: 'escrow_deposit',
      status: 'completed',
      date: new Date().toISOString(),
      paymentMethod: 'Escrow Vault'
    };
    setTransactions(prev => [newTx, ...prev]);

    // 5. Notify Freelancer
    addNotification({
      title: 'You were Hired! 🎉',
      message: `Congratulations! ${client.name} has funded escrow and started your contract for "${project.title}".`,
      type: 'contract',
      link: `/dashboard/freelancer/contracts/${newContract.id}`
    });

    return newContract;
  };

  const submitMilestoneWork = (contractId, milestoneId, submissionData) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        const updatedMilestones = c.milestones.map(m => {
          if (m.id === milestoneId) {
            return {
              ...m,
              status: 'submitted',
              submittedDate: new Date().toISOString().split('T')[0],
              submission: submissionData
            };
          }
          return m;
        });
        return { ...c, status: 'submitted', milestones: updatedMilestones };
      }
      return c;
    }));

    addNotification({
      title: 'Work Deliverable Submitted',
      message: 'Freelancer submitted work for milestone review.',
      type: 'contract',
      link: `/dashboard/client/contracts/${contractId}`
    });
  };

  const requestMilestoneRevision = (contractId, milestoneId, feedbackMessage) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        const updatedMilestones = c.milestones.map(m => {
          if (m.id === milestoneId) {
            return {
              ...m,
              status: 'revision_requested',
              revisionNotes: feedbackMessage
            };
          }
          return m;
        });
        return { ...c, status: 'revision_requested', milestones: updatedMilestones };
      }
      return c;
    }));

    addNotification({
      title: 'Revision Requested',
      message: `Client requested adjustments: "${feedbackMessage}"`,
      type: 'contract',
      link: `/dashboard/freelancer/contracts/${contractId}`
    });
  };

  const acceptMilestoneWorkAndReleaseEscrow = (contractId, milestoneId) => {
    let releasedAmount = 0;
    let clientName = '';
    let freelancerName = '';
    let projectTitle = '';

    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        clientName = c.clientName;
        freelancerName = c.freelancerName;
        projectTitle = c.projectTitle;

        const updatedMilestones = c.milestones.map(m => {
          if (m.id === milestoneId) {
            releasedAmount = m.amount;
            return { ...m, status: 'completed', completedDate: new Date().toISOString().split('T')[0] };
          }
          return m;
        });

        const allCompleted = updatedMilestones.every(m => m.status === 'completed');
        return {
          ...c,
          amountPaid: c.amountPaid + releasedAmount,
          escrowBalance: Math.max(0, c.escrowBalance - releasedAmount),
          status: allCompleted ? 'completed' : 'in_progress',
          milestones: updatedMilestones
        };
      }
      return c;
    }));

    // Record Milestone Release Transaction
    const fee = releasedAmount * 0.05;
    const netAmount = releasedAmount - fee;
    const newTx = {
      id: 'tx-' + Date.now(),
      invoiceNumber: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
      description: `Milestone Escrow Released: ${projectTitle}`,
      projectTitle: projectTitle,
      clientName: clientName,
      freelancerName: freelancerName,
      amount: releasedAmount,
      fee: fee,
      netAmount: netAmount,
      type: 'milestone_release',
      status: 'completed',
      date: new Date().toISOString(),
      paymentMethod: 'Escrow Release'
    };
    setTransactions(prev => [newTx, ...prev]);

    addNotification({
      title: 'Payment Released! 💰',
      message: `$${netAmount.toFixed(2)} has been credited to your available balance after platform fee.`,
      type: 'payment',
      link: `/dashboard/freelancer/earnings`
    });
  };

  // Review Action
  const addReview = (reviewData) => {
    // Add review to target freelancer
    setFreelancers(prev => prev.map(f => {
      if (f.id === reviewData.freelancerId || f.userId === reviewData.freelancerUserId) {
        const updatedReviews = [reviewData, ...(f.reviews || [])];
        const avg = (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(2);
        return {
          ...f,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: parseFloat(avg)
        };
      }
      return f;
    }));

    addNotification({
      title: 'New Review Posted',
      message: `${reviewData.clientName} gave you a ${reviewData.rating} ★ rating!`,
      type: 'review',
      link: '/dashboard/freelancer/reviews'
    });
  };

  // Messaging Actions
  const sendMessage = (conversationId, messageData) => {
    const newMsg = {
      id: 'msg-' + Date.now(),
      timestamp: 'Just now',
      isRead: false,
      ...messageData
    };

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: messageData.text || 'Sent an attachment',
          lastMessageTime: 'Just now',
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    // Simulate auto-reply after 2 seconds if message was from user
    setTimeout(() => {
      const replyMsg = {
        id: 'msg-reply-' + Date.now(),
        senderId: 'mock-partner',
        senderName: 'Collaborator',
        text: 'Thanks for the message! I am reviewing the details and will follow up shortly.',
        timestamp: 'Just now',
        isRead: false
      };
      setConversations(prev => prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: replyMsg.text,
            lastMessageTime: 'Just now',
            unreadCount: (c.unreadCount || 0) + 1,
            messages: [...c.messages, replyMsg]
          };
        }
        return c;
      }));
    }, 2000);
  };

  // Notifications
  const addNotification = (notif) => {
    const newN = {
      id: 'notif-' + Date.now(),
      isRead: false,
      timestamp: 'Just now',
      ...notif
    };
    setNotifications(prev => [newN, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Admin User & Dispute Moderation
  const toggleUserStatus = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const deleteUser = (userId) => {
    setUsersList(prev => prev.filter(u => u.id !== userId));
  };

  const resolveDispute = (disputeId, resolutionAction) => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          status: 'resolved',
          resolvedAt: new Date().toISOString(),
          resolutionAction: resolutionAction
        };
      }
      return d;
    }));
  };

  return (
    <MarketplaceContext.Provider
      value={{
        projects,
        freelancers,
        proposals,
        contracts,
        conversations,
        notifications,
        transactions,
        disputes,
        usersList,
        savedProjectIds,
        savedFreelancerIds,
        addProject,
        updateProject,
        toggleSaveProject,
        toggleSaveFreelancer,
        submitProposal,
        updateProposalStatus,
        hireFreelancerAndCreateContract,
        submitMilestoneWork,
        requestMilestoneRevision,
        acceptMilestoneWorkAndReleaseEscrow,
        addReview,
        sendMessage,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toggleUserStatus,
        deleteUser,
        resolveDispute
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}
