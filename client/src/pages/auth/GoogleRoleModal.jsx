// client/src/pages/auth/GoogleRoleModal.jsx
import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, UserCheck, Loader2, Sparkles } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const ROLES = [
  {
    id: 'client',
    title: "I'm a Client",
    description: 'I want to hire talent for my projects.',
    icon: Briefcase,
    accentText: 'text-primary-600 dark:text-primary-400',
    accentBg: 'bg-primary-50 dark:bg-primary-950/40',
    accentBorder: 'hover:border-primary-500 focus-visible:ring-primary-500',
  },
  {
    id: 'freelancer',
    title: "I'm a Freelancer",
    description: 'I want to work and earn on projects.',
    icon: UserCheck,
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    accentBorder: 'hover:border-emerald-500 focus-visible:ring-emerald-500',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function GoogleRoleModal({ isOpen, onSelectRole, isLoading = false }) {
  const dialogRef = useRef(null);
  const firstButtonRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  /* ---------------- Focus management ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    // Remember what was focused before opening
    previouslyFocusedRef.current = document.activeElement;

    // Focus first interactive element
    const focusTimer = setTimeout(() => {
      firstButtonRef.current?.focus();
    }, 50);

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;

      // Restore focus on close
      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === 'function') {
        prev.focus();
      }
    };
  }, [isOpen]);

  /* ---------------- Keyboard handling ---------------- */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        // No onClose prop — treat Escape as a no-op unless you add one.
        // Kept here for consistency with other modals.
        return;
      }

      // Focus trap: keep Tab within the dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [isLoading]
  );

  /* ---------------- Role selection ---------------- */
  const handleSelect = useCallback(
    (roleId) => {
      if (isLoading) return;
      onSelectRole?.(roleId);
    },
    [isLoading, onSelectRole]
  );

  /* ---------------- Render ---------------- */
  if (!isOpen || typeof document === 'undefined') return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-role-title"
      aria-describedby="google-role-description"
    >
      {/* Backdrop click is intentionally NOT wired — role choice is required */}
      <div
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-soft-lg space-y-6"
      >
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 mb-2">
            <Sparkles className="w-3 h-3 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              One last step
            </span>
          </div>

          <h2
            id="google-role-title"
            className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Welcome to SkillHire!
          </h2>
          <p
            id="google-role-description"
            className="text-sm text-slate-500 dark:text-slate-400 text-pretty"
          >
            Choose how you want to use SkillHire. This can be changed later in settings.
          </p>
        </header>

        {/* Role options */}
        <div className="space-y-3">
          {ROLES.map((role, index) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                ref={index === 0 ? firstButtonRef : null}
                type="button"
                onClick={() => handleSelect(role.id)}
                disabled={isLoading}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl
                            border-2 border-slate-200 dark:border-slate-700
                            ${role.accentBorder}
                            transition-all text-left
                            disabled:opacity-50 disabled:cursor-not-allowed
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                            dark:focus-visible:ring-offset-slate-900
                            group`}
                aria-label={`Continue as ${role.title}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${role.accentBg}
                              flex items-center justify-center shrink-0
                              transition-transform group-hover:scale-105`}
                >
                  <Icon
                    className={`w-6 h-6 ${role.accentText}`}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-400 text-pretty">
                    {role.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div
            className="flex items-center justify-center gap-2 text-xs text-slate-400"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Setting up your account…</span>
          </div>
        )}
      </div>
    </div>
  );

  // Render via portal so the modal sits above any z-index / overflow context
  return createPortal(content, document.body);
}

export default GoogleRoleModal;