// client/src/pages/client/ClientContractsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getClientContracts } from '../../services/contract.service';
import { ContractCard } from '../../components/cards/ContractCard';
import { Tabs } from '../../components/common/Tabs';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { FileCheck2, Loader2 } from 'lucide-react';

export function ClientContractsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();
  
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch client contracts
  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await getClientContracts();
      
      if (response.success) {
        setContracts(response.contracts || []);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      toast.error('Load Failed', 'Could not load your contracts.');
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Filter contracts by tab
  const filtered = contracts.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in_progress') {
      return ['pending_payment', 'active', 'submitted'].includes(c.status);
    }
    return c.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All Contracts', badge: contracts.length },
    { id: 'in_progress', label: 'Active / In Progress', badge: contracts.filter(c => c.status !== 'completed' && c.status !== 'cancelled').length },
    { id: 'completed', label: 'Completed', badge: contracts.filter(c => c.status === 'completed').length },
  ];

  // Map backend contract to ContractCard format
  const mapContractToCard = (contract) => ({
    id: contract._id,
    projectTitle: contract.projectId?.title || 'Project',
    freelancerName: contract.freelancerId?.name || 'Freelancer',
    freelancerAvatar: contract.freelancerId?.avatar || '',
    freelancerEmail: contract.freelancerId?.email || '',
    amount: contract.amount,
    status: contract.status,
    startDate: contract.startDate,
    deadline: contract.deadline,
    createdAt: contract.createdAt,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="primary" size="sm" className="mb-2">Escrow Contract Workspaces</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Active Contracts & Workspaces
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review delivered milestone work, request revisions, and release escrow upon satisfaction.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((contract) => (
            <ContractCard 
              key={contract._id} 
              contract={mapContractToCard(contract)} 
              role="client" 
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileCheck2}
          title={activeTab === 'all' ? 'No contracts yet' : 'No contracts in this tab'}
          description="Once you hire a freelancer on a project, your milestone workspace will appear here."
        />
      )}
    </div>
  );
}

export default ClientContractsPage;