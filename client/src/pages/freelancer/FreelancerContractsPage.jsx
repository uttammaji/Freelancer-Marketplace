import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ContractCard } from '../../components/cards/ContractCard';
import { Tabs } from '../../components/common/Tabs';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { FileCheck2 } from 'lucide-react';

export function FreelancerContractsPage() {
  const { currentUser } = useAuth();
  const { contracts } = useMarketplace();
  const [activeTab, setActiveTab] = useState('all');

  const myContracts = contracts.filter(c => c.freelancerId === 'fl-1' || c.freelancerUserId === currentUser?.id);

  const filtered = myContracts.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in_progress') return c.status !== 'completed';
    return c.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All Contracts', badge: myContracts.length },
    { id: 'in_progress', label: 'In Progress / Active', badge: myContracts.filter(c => c.status !== 'completed').length },
    { id: 'completed', label: 'Completed', badge: myContracts.filter(c => c.status === 'completed').length },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <Badge variant="primary" size="sm" className="mb-2">Active Workspaces</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          My Active Contracts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Access your client workspaces, submit milestone deliverables, and view escrow balances
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((contract) => (
            <ContractCard key={contract.id} contract={contract} role="freelancer" />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileCheck2}
          title="No contracts found"
          description="When clients accept your proposals, active contract workspaces will appear here."
        />
      )}
    </div>
  );
}
