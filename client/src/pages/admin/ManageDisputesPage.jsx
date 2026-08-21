import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { DisputeCard } from '../../components/cards/DisputeCard';
import { Badge } from '../../components/common/Badge';
import { Scale } from 'lucide-react';

export function ManageDisputesPage() {
  const { disputes } = useMarketplace();

  const openDisputes = disputes.filter(d => d.status === 'open');
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved');

  return (
    <div className="space-y-8 pb-12">
      <div>
        <Badge variant="purple" size="sm" className="mb-2">Escrow Arbitration</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Scale className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          <span>Dispute Resolution & Escrow Mediation</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review evidence from both parties and make binding arbitration decisions on disputed escrow funds
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-4">
            Active Disputed Cases ({openDisputes.length})
          </h2>
          <div className="space-y-4">
            {openDisputes.map((d) => (
              <DisputeCard key={d.id} dispute={d} />
            ))}
          </div>
        </div>

        {resolvedDisputes.length > 0 && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4">
              Resolved Cases History ({resolvedDisputes.length})
            </h2>
            <div className="space-y-4">
              {resolvedDisputes.map((d) => (
                <DisputeCard key={d.id} dispute={d} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
