// client/src/pages/admin/AdminSettingsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Settings,
  Save,
  Shield,
  Percent,
  Lock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants & validation                                             */
/* ------------------------------------------------------------------ */
const DEFAULTS = {
  platformFee: 5,
  escrowHoldDays: 3,
  maintenanceMode: false,
};

const LIMITS = {
  platformFee: { min: 0, max: 30, label: 'Commission rate' },
  escrowHoldDays: { min: 1, max: 30, label: 'Escrow hold window' },
};

/**
 * Validate a single numeric field. Returns an error string or null.
 */
function validateNumber(value, { min, max, label }) {
  if (value === '' || value === null || value === undefined) {
    return `${label} is required.`;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) return `${label} must be a number.`;
  if (n < min) return `${label} must be at least ${min}.`;
  if (n > max) return `${label} cannot exceed ${max}.`;
  return null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function AdminSettingsPage() {
  const toast = useToast();

  /* ---------- Form state ---------- */
  const [form, setForm] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* ---------- UX state ---------- */
  const [isSaving, setIsSaving] = useState(false);
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  /* ---------- Derived ---------- */
  const isDirty = useMemo(() => {
    return (
      form.platformFee !== DEFAULTS.platformFee ||
      form.escrowHoldDays !== DEFAULTS.escrowHoldDays ||
      form.maintenanceMode !== DEFAULTS.maintenanceMode
    );
  }, [form]);

  const hasErrors = useMemo(
    () => Object.values(errors).some(Boolean),
    [errors]
  );

  const exampleFee = useMemo(() => {
    const sample = 100_000;
    const fee = Math.round((sample * Number(form.platformFee || 0)) / 100);
    return {
      gross: sample,
      fee,
      net: sample - fee,
    };
  }, [form.platformFee]);

  /* ---------- Handlers ---------- */
  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  const handleNumberChange = useCallback(
    (key) => (e) => {
      const raw = e.target.value;
      setField(key, raw === '' ? '' : Number(raw));
    },
    [setField]
  );

  const handleBlur = useCallback(
    (key) => () => {
      const rules = LIMITS[key];
      if (!rules) return;
      setErrors((prev) => ({
        ...prev,
        [key]: validateNumber(form[key], rules),
      }));
    },
    [form]
  );

  /**
   * Intercept the maintenance-mode toggle so we can ask for confirmation
   * before enabling it (disabling never needs confirmation).
   */
  const handleMaintenanceToggle = useCallback(
    (e) => {
      const next = e.target.checked;
      if (next && !form.maintenanceMode) {
        setShowMaintenanceConfirm(true);
      } else {
        setField('maintenanceMode', next);
      }
    },
    [form.maintenanceMode, setField]
  );

  const confirmMaintenance = useCallback(() => {
    setField('maintenanceMode', true);
    setShowMaintenanceConfirm(false);
  }, [setField]);

  /* ---------- Save ---------- */
  const handleSave = useCallback(
    async (e) => {
      e?.preventDefault?.();

      // Validate all numeric fields
      const nextErrors = {
        platformFee: validateNumber(form.platformFee, LIMITS.platformFee),
        escrowHoldDays: validateNumber(form.escrowHoldDays, LIMITS.escrowHoldDays),
      };
      setErrors(nextErrors);
      setTouched({ platformFee: true, escrowHoldDays: true });

      if (Object.values(nextErrors).some(Boolean)) {
        toast.error('Invalid Settings', 'Please fix the highlighted fields.');
        return;
      }

      setIsSaving(true);
      try {
        // TODO: replace with real API call
        // await updatePlatformSettings(form);
        await new Promise((r) => setTimeout(r, 600));

        setLastSaved(new Date());
        toast.success(
          'Platform Parameters Updated',
          'New fee structure and system policies are now active.'
        );
      } catch (err) {
        console.error('[AdminSettings] save failed:', err);
        toast.error('Save Failed', 'Could not update platform settings.');
      } finally {
        setIsSaving(false);
      }
    },
    [form, toast]
  );

  const handleReset = useCallback(() => {
    setForm(DEFAULTS);
    setErrors({});
    setTouched({});
  }, []);

  /* ---------- Warn on unload if dirty ---------- */
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  /* ---------- Render ---------- */
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <header>
        <Badge variant="purple" size="sm" className="mb-2">
          System Parameters
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Platform Rules & Fee Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-pretty">
          Configure marketplace commission rates, dispute timeout thresholds, and system health.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-6" noValidate>
        {/* Fee & escrow card */}
        <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-6">
          <header className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Financial & Fee Configuration
            </h2>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Freelancer Take-Rate Commission (%)"
              type="number"
              inputMode="numeric"
              min={LIMITS.platformFee.min}
              max={LIMITS.platformFee.max}
              step={1}
              value={form.platformFee}
              onChange={handleNumberChange('platformFee')}
              onBlur={handleBlur('platformFee')}
              error={touched.platformFee ? errors.platformFee : null}
              icon={Percent}
              helperText={`Industry standard is 5%. Allowed: ${LIMITS.platformFee.min}–${LIMITS.platformFee.max}%.`}
              required
              aria-label="Platform commission percentage"
            />

            <Input
              label="Auto-Release Inactivity Window (Days)"
              type="number"
              inputMode="numeric"
              min={LIMITS.escrowHoldDays.min}
              max={LIMITS.escrowHoldDays.max}
              step={1}
              value={form.escrowHoldDays}
              onChange={handleNumberChange('escrowHoldDays')}
              onBlur={handleBlur('escrowHoldDays')}
              error={touched.escrowHoldDays ? errors.escrowHoldDays : null}
              icon={Lock}
              helperText={`Days before a submitted milestone auto-approves if the client is silent. Allowed: ${LIMITS.escrowHoldDays.min}–${LIMITS.escrowHoldDays.max}.`}
              required
              aria-label="Escrow auto-release window in days"
            />
          </div>

          {/* Live preview */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Live Preview — ₹1,00,000 contract
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <PreviewStat label="Client pays" value={`₹${exampleFee.gross.toLocaleString('en-IN')}`} />
              <PreviewStat
                label="Platform fee"
                value={`₹${exampleFee.fee.toLocaleString('en-IN')}`}
                highlight
              />
              <PreviewStat label="Freelancer gets" value={`₹${exampleFee.net.toLocaleString('en-IN')}`} />
            </div>
          </div>
        </section>

        {/* Maintenance card */}
        <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
          <header className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              System Health
            </h2>
          </header>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Maintenance Mode
                </span>
                {form.maintenanceMode && (
                  <Badge variant="warning" size="xs" dot>
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 text-pretty">
                Temporarily pause new project submissions for system upgrades.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={handleMaintenanceToggle}
                className="sr-only peer"
                aria-label="Toggle maintenance mode"
              />
              <div
                className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-checked:bg-purple-600 rounded-full
                           peer-focus-visible:ring-2 peer-focus-visible:ring-purple-500 peer-focus-visible:ring-offset-2
                           dark:peer-focus-visible:ring-offset-slate-900 transition-colors
                           after:content-[''] after:absolute after:top-0.5 after:left-0.5
                           after:bg-white after:rounded-full after:h-5 after:w-5
                           after:transition-transform peer-checked:after:translate-x-5"
              />
            </label>
          </div>
        </section>

        {/* Action bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400 min-h-[1.25rem]">
            {lastSaved && !isDirty && (
              <span>Last saved {lastSaved.toLocaleTimeString()}</span>
            )}
            {isDirty && (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                Unsaved changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              icon={RefreshCw}
              onClick={handleReset}
              disabled={!isDirty || isSaving}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Save}
              isLoading={isSaving}
              disabled={hasErrors || isSaving}
              className="font-bold shadow-md"
            >
              Save Platform Settings
            </Button>
          </div>
        </div>
      </form>

      {/* Confirmation dialog for enabling maintenance mode */}
      <ConfirmDialog
        isOpen={showMaintenanceConfirm}
        onClose={() => setShowMaintenanceConfirm(false)}
        onConfirm={confirmMaintenance}
        title="Enable Maintenance Mode?"
        description="New project submissions will be paused for all users. Existing contracts and messaging will continue to work. You can disable this at any time."
        confirmText="Enable Maintenance"
        cancelText="Cancel"
        variant="danger"
        icon={AlertTriangle}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function PreviewStat({ label, value, highlight = false }) {
  return (
    <div>
      <div
        className={`font-display text-lg tabular-nums ${
          highlight ? 'text-purple-600 dark:text-purple-400' : 'text-slate-900 dark:text-white'
        }`}
      >
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">
        {label}
      </div>
    </div>
  );
}

export default AdminSettingsPage;