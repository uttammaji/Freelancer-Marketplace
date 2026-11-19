// client/src/pages/auth/GoogleCallback.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const TOKEN_KEY = 'skillhire_token';
const USER_KEY = 'skillhire_user';
const FETCH_TIMEOUT_MS = 10_000;

const ROLE_DASHBOARDS = {
  client: '/dashboard/client',
  freelancer: '/dashboard/freelancer',
  admin: '/admin',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
/** Safe localStorage write — private mode browsers can throw. */
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[GoogleCallback] Failed to write ${key} to localStorage`, err);
  }
}

/** Fetch with timeout + abort signal so we never hang indefinitely. */
async function fetchWithTimeout(url, options = {}, timeout = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setCurrentUser } = useAuth();
  const toast = useToast();

  /** UI states: 'verifying' | 'success' | 'error' */
  const [status, setStatus] = useState('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  /** Prevent double-run in React 18 StrictMode dev */
  const hasRun = useRef(false);

  /* ---------------- Main flow ---------------- */
  const verifyAndRedirect = useCallback(
    async (token) => {
      try {
        const apiBase =
          import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';

        const response = await fetchWithTimeout(`${apiBase}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Your login link has expired. Please try again.'
              : `Server error (${response.status}).`
          );
        }

        const data = await response.json();

        if (!data?.success || !data?.user) {
          throw new Error(data?.message || 'Could not verify your account.');
        }

        // Persist token + user
        safeSetItem(TOKEN_KEY, token);
        safeSetItem(USER_KEY, JSON.stringify(data.user));

        // Update auth context (order matters — token first)
        setToken?.(token);
        setCurrentUser?.(data.user);

        // Show success briefly, then redirect by role
        setStatus('success');
        toast.success(
          'Welcome!',
          `Signed in as ${data.user.name || data.user.email || 'user'}.`
        );

        const destination =
          ROLE_DASHBOARDS[data.user.role] || '/';

        setTimeout(() => navigate(destination, { replace: true }), 700);
      } catch (error) {
        console.error('[GoogleCallback] verification failed:', error);
        setStatus('error');
        setErrorMessage(
          error?.name === 'AbortError'
            ? 'The request took too long. Check your connection and try again.'
            : error?.message || 'Something went wrong during sign-in.'
        );
        toast.error('Login Failed', 'Could not complete Google sign-in.');
      }
    },
    [navigate, setToken, setCurrentUser, toast]
  );

  /* ---------------- Effect ---------------- */
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    // Case 1: OAuth provider returned an error (user denied, etc.)
    if (errorParam) {
      setStatus('error');
      setErrorMessage(
        errorParam === 'access_denied'
          ? 'You cancelled the Google sign-in.'
          : 'Google sign-in was rejected.'
      );
      return;
    }

    // Case 2: no token at all
    if (!token) {
      setStatus('error');
      setErrorMessage('No authentication token was received.');
      return;
    }

    // Case 3: happy path
    verifyAndRedirect(token);
  }, [searchParams, verifyAndRedirect]);

  /* ---------------- Retry handler ---------------- */
  const handleRetry = useCallback(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    setStatus('verifying');
    setErrorMessage('');
    hasRun.current = false;
    verifyAndRedirect(token);
  }, [searchParams, navigate, verifyAndRedirect]);

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
      <div
        className="w-full max-w-sm text-center space-y-5"
        role="status"
        aria-live="polite"
      >
        {status === 'verifying' && (
          <>
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Completing sign-in
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Verifying your Google account…
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto">
              <CheckCircle2
                className="w-7 h-7 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Signed in successfully
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Redirecting you to your dashboard…
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto">
              <AlertCircle
                className="w-7 h-7 text-rose-600 dark:text-rose-400"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Sign-in failed
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-pretty">
                {errorMessage || 'Something went wrong.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="primary"
                size="md"
                icon={RefreshCw}
                onClick={handleRetry}
              >
                Try Again
              </Button>
              <Link to="/login">
                <Button variant="outline" size="md" icon={ArrowLeft} className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default GoogleCallback;