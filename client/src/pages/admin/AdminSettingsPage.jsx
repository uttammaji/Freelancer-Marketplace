import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Settings, Save, Shield, Percent, Lock } from 'lucide-react';

export function AdminSettingsPage() {
  const toast = useToast();
  const [platformFee, setPlatformFee] = useState(5);
  const [escrowHoldDays, setEscrowHoldDays] = useState(3);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Platform Parameters Updated', 'New fee structure and system policies are now active.');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <Badge variant="purple" size="sm" className="mb-2">System Parameters</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Platform Rules & Fee Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure marketplace commission rates, dispute timeout thresholds, and system health
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Financial & Fee Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Freelancer Take-Rate Commission (%)"
              type="number"
              value={platformFee}
              onChange={(e) => setPlatformFee(Number(e.target.value))}
              icon={Percent}
              helperText="Industry standard is 5% on SkillHire."
              required
            />
            <Input
              label="Auto-Release Inactivity Window (Days)"
              type="number"
              value={escrowHoldDays}
              onChange={(e) => setEscrowHoldDays(Number(e.target.value))}
              icon={Lock}
              helperText="Days before submitted milestone auto-approves if client is silent."
              required
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Maintenance Mode</span>
              <span className="text-[11px] text-slate-400">Temporarily pause new project submissions for system upgrades.</span>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 h-5 w-5"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" icon={Save} isLoading={isSaving} className="font-bold shadow-md">
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
