import React, { useState, useMemo, useRef } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks';
import { ROUTES } from '../constants';
import { AuthLoadingScreen } from '../components';

export default function Login() {
  const { currentUser, loading, loginWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const isLoggingInRef = useRef<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);

  // Check if arriving from an explicit logout
  const isIntentionalLogout = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('starlit_intentional_logout') === 'true';
  }, []);

  // Clean up intentional logout marker on mount
  React.useEffect(() => {
    if (isIntentionalLogout && typeof window !== 'undefined') {
      sessionStorage.removeItem('starlit_intentional_logout');
    }
  }, [isIntentionalLogout]);

  // Extract return destination from location.state if the user was intercepted from a deep link
  const fromLocation = (location.state as { from?: Location })?.from;
  const targetDestination = useMemo(() => {
    if (isIntentionalLogout) return ROUTES.HOME;
    if (!fromLocation || !fromLocation.pathname) return ROUTES.HOME;
    const path = fromLocation.pathname;
    // Guard against redirect loops
    if (path === ROUTES.LOGIN || path === ROUTES.LANDING) {
      return ROUTES.HOME;
    }
    return `${path}${fromLocation.search || ''}${fromLocation.hash || ''}`;
  }, [fromLocation, isIntentionalLogout]);

  // Auth loading state: unified vintage paper atmospheric screen
  if (loading) {
    return <AuthLoadingScreen message="Listening to the stars..." />;
  }

  // If already authenticated and visiting /login manually, redirect to destination
  if (currentUser) {
    return <Navigate to={targetDestination} replace />;
  }

  const getFriendlyErrorMessage = (err: any): string => {
    const code = err?.code || '';
    const rawMsg = (err?.message || '').toLowerCase();

    if (code === 'auth/network-request-failed' || rawMsg.includes('network')) {
      return 'A connection issue occurred. Please check your internet connection and try again.';
    }
    if (code === 'auth/popup-blocked' || rawMsg.includes('popup-blocked')) {
      return 'The sign-in popup was blocked by your browser. Please allow popups for Starlit Letters and try again.';
    }
    if (code === 'auth/unauthorized-domain' || rawMsg.includes('unauthorized-domain')) {
      return 'This domain is not configured for Google sign-in in Firebase Authentication.';
    }
    if (code === 'auth/account-exists-with-different-credential') {
      return 'An account already exists with this email using a different sign-in method.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Google sign-in is currently unavailable. Please try again shortly.';
    }
    if (code === 'auth/user-disabled') {
      return 'This account has been disabled. Please contact support.';
    }
    if (code === 'auth/internal-error' || rawMsg.includes('internal-error')) {
      return 'The authentication service encountered an internal error. Please try again shortly.';
    }
    if (code === 'auth/web-storage-unsupported' || rawMsg.includes('web-storage')) {
      return 'Browser storage is disabled or restricted. Please allow cookies/site data and try again.';
    }
    // Clean any technical Firebase wrapper
    const msg = err?.message || '';
    if (msg && !msg.includes('Firebase:') && !msg.includes('auth/') && !msg.includes('Error:') && !msg.includes('(')) {
      return msg;
    }
    return 'Unable to sign in at this moment. Please try again in a few moments.';
  };

  const handleGoogleSignIn = async () => {
    if (isLoggingInRef.current || isLoggingIn) return;
    isLoggingInRef.current = true;
    setIsLoggingIn(true);
    setErrorMessage(null);
    setDiagnosticInfo(null);

    try {
      await loginWithGoogle();
      navigate(targetDestination, { replace: true });
    } catch (err: any) {
      // Detailed console error for diagnosing authentication failures in production & dev
      console.error('[AUTH DEBUG] Google Sign-In failure:', {
        code: err?.code || 'unknown',
        message: err?.message,
        originalMessage: err?.originalMessage,
        originalError: err?.originalError,
      });

      // Improved Google popup cancellation handling checking both code and message
      const code = err?.code || '';
      const msg = (err?.message || '').toLowerCase();
      const isCancelled =
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/user-cancelled' ||
        msg.includes('cancelled') ||
        msg.includes('popup-closed') ||
        msg.includes('closed-by-user') ||
        msg.includes('popup closed');

      if (!isCancelled) {
        setErrorMessage(getFriendlyErrorMessage(err));
        if (import.meta.env.DEV) {
          setDiagnosticInfo(`[Diagnostic: ${code || 'generic-exception'} | ${err?.message || 'no-message'}]`);
        }
      }
    } finally {
      isLoggingInRef.current = false;
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Background radial gradient consistent with SneakPeekEntrance */}
      <div
        className="absolute inset-0 bg-[#ECE5DB]"
        style={{
          backgroundImage: `radial-gradient(ellipse at 50% 40%, #F5EFEB 0%, #E8DFD3 75%, #DDD2C4 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Subtle paper grain texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
        aria-hidden="true"
      />

      {/* Login Card with subtle gentle entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <div className="bg-[#FAF6EE] border border-[#E3D7C7] rounded-3xl p-6 sm:p-10 shadow-[0_12px_40px_rgba(70,45,30,0.1)] text-center">
          {/* Subtle parchment postmark seal emblem */}
          <div className="relative mb-6 inline-flex flex-col items-center justify-center">
            <div className="relative p-3.5 rounded-full bg-[#F4EDE2] border border-[#DFCFC0] shadow-[0_2px_8px_rgba(70,45,30,0.06)]">
              <Sparkles className="w-5 h-5 text-[#8C6B5E]" />
              <div
                className="absolute -inset-1 rounded-full border border-dashed border-[#D5C2B0]/60 pointer-events-none"
                aria-hidden="true"
              />
            </div>
            <span className="mt-2.5 text-[10px] uppercase tracking-[0.2em] font-serif text-[#A08878] select-none">
              Private Sanctuary
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-serif font-normal italic text-[#382B22] tracking-tight mb-2">
            Starlit Letters
          </h1>
          <p className="text-sm font-serif italic text-[#7D6B5E] mb-7 leading-relaxed max-w-xs mx-auto">
            A quiet sanctuary reserved for letters, memories, and little constellations. Please sign in to enter.
          </p>

          {/* Error display */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-serif flex items-start gap-2.5 text-left"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="leading-snug">{errorMessage}</p>
                {diagnosticInfo && (
                  <p className="mt-1 text-[10px] font-mono text-rose-700/80 break-all">{diagnosticInfo}</p>
                )}
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="button"
            id="google-signin-btn"
            aria-label="Continue with Google"
            onClick={handleGoogleSignIn}
            disabled={isLoggingIn}
            className="w-full relative inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-[#FAF6EE] hover:bg-[#FFFDF9] text-[#382B22] font-serif text-sm sm:text-base tracking-wide border border-[#DFCFC0] shadow-[0_4px_16px_rgba(70,45,30,0.08)] hover:shadow-[0_6px_20px_rgba(70,45,30,0.12)] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6B5E] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 text-[#8C6B5E] animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Privacy reassurance badge */}
          <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] font-serif italic text-[#A08878]">
            <Lock className="w-3 h-3 text-[#B09888]" />
            <span>Private &amp; protected access</span>
          </div>

          {/* Deep link note if arriving from a protected page */}
          {!isIntentionalLogout && fromLocation && fromLocation.pathname !== ROUTES.HOME && (
            <p className="mt-4 text-xs font-serif italic text-[#8C6B5E]/80">
              You will be returned to your requested page after signing in.
            </p>
          )}

          {/* Return to Landing link */}
          <div className="mt-8 pt-6 border-t border-[#E3D7C7]/60">
            <Link
              to={ROUTES.LANDING}
              className="inline-flex items-center gap-1.5 text-xs font-serif italic text-[#7D6B5E] hover:text-[#382B22] transition-colors duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Entrance</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

