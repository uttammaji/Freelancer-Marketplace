import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ContractCard } from '../../components/cards/ContractCard';
import { Tabs } from '../../components/common/Tabs';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { FileCheck2, Shield } from 'lucide-react';

export function ClientContractsPage() {
  const { currentUser } = useAuth();
  const { contracts } = useMarketplace();
  const [activeTab, setActiveTab] = useState('all');

  const clientContracts = contracts.filter(c => c.clientId === currentUser?.id || c.clientId === 'usr-client-1');

  const filtered = clientContracts.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in_progress') return c.status === 'in_progress' || c.status === 'submitted' || c.status === 'revision_requested';
    return c.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All Contracts', badge: clientContracts.length },
    { id: 'in_progress', label: 'Active / In Progress', badge: clientContracts.filter(c => c.status !== 'completed').length },
    { id: 'completed', label: 'Completed', badge: clientContracts.filter(c => c.status === 'completed').length },
  ];

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
            <ContractCard key={contract.id} contract={contract} role="client" />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileCheck2}
          title="No active contracts"
          description="Once you hire a freelancer on a project, your milestone workspace will appear here."
        />
      )}
    </div>
  );
}
