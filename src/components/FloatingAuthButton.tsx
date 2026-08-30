import React, { useState, useRef, useEffect } from 'react';
import { User as UserIcon, LogIn, LogOut, Heart, ShieldCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { ROUTES } from '../constants';
import { cn } from '../utils';

export interface FloatingAuthButtonProps {
  className?: string;
}

export const FloatingAuthButton: React.FC<FloatingAuthButtonProps> = ({ className }) => {
  const { currentUser, userProfile, loading, isAdmin, loginWithGoogle, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    console.log('[AUTH] Login button clicked');
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      setIsOpen(false);
    } catch (err: any) {
      if (err.message && !err.message.includes('cancelled')) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const isStatic = className?.includes('static');

  return (
    <div
      ref={containerRef}
      className={cn(!isStatic && 'fixed top-4 right-28 z-40', 'relative', className)}
    >
      <button
        type="button"
        onClick={() => {
          if (!currentUser) {
            handleLogin();
          } else {
            setIsOpen((prev) => !prev);
          }
        }}
        disabled={loading || isLoggingIn}
        aria-expanded={isOpen}
        aria-label={currentUser ? 'User Account' : 'Sign In with Google'}
        title={currentUser ? `Signed in as ${currentUser.displayName || currentUser.email}` : 'Sign In'}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] shadow-[var(--shadow-soft)] transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-out cursor-pointer relative overflow-hidden group [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-md active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 motion-reduce:transform-none"
      >
        {isLoggingIn || loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)] shrink-0" />
        ) : currentUser?.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={currentUser.displayName || 'User Profile'}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover rounded-full"
          />
        ) : currentUser ? (
          <div className="h-full w-full rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center font-serif text-xs font-bold uppercase">
            {(currentUser.displayName || currentUser.email || 'U').charAt(0)}
          </div>
        ) : (
          <UserIcon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
        )}

        {/* Status Dot */}
        {currentUser && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--color-card)]" />
        )}
      </button>

      {/* Unauthenticated Error Toast */}
      {errorMsg && !currentUser && (
        <div className="absolute right-0 mt-2 w-64 p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-card)] border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-serif shadow-lg z-50 animate-in fade-in duration-150 flex items-start justify-between gap-2">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-400 hover:text-rose-600 font-bold text-xs p-1 cursor-pointer"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Popover Menu */}
      {isOpen && currentUser && (
        <div
          className="absolute -right-20 sm:right-0 mt-2 w-64 rounded-[var(--radius-xl)] bg-[var(--color-card)]/95 backdrop-blur-md border border-[var(--color-border)] p-3 shadow-[var(--shadow-lg)] z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
        >
          {/* User Profile Header */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--color-border-light)]">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile Avatar"
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full object-cover border border-[var(--color-border-light)] shrink-0"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center font-serif text-sm font-bold uppercase shrink-0">
                {(currentUser.displayName || currentUser.email || 'U').charAt(0)}
              </div>
            )}

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-serif font-bold text-[var(--color-text)] truncate">
                {currentUser.displayName || 'Starlit Letters User'}
              </span>
              <span className="text-[11px] font-sans text-[var(--color-muted)] truncate">
                {currentUser.email}
              </span>
            </div>
          </div>

          {/* Role Indicator */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[11px] font-serif font-medium border border-[var(--color-accent)]/20">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Administrator Role</span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                navigate(ROUTES.WHAT_AM_I_TO_YOU);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-[var(--radius-lg)] text-xs font-serif text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-[background-color,color,transform] duration-150 ease-out text-left cursor-pointer active:scale-[0.985] motion-reduce:transform-none"
            >
              <Heart className="h-3.5 w-3.5 text-[var(--color-accent)] shrink-0" />
              <span>Write Your Feelings</span>
            </button>
          </div>

          {errorMsg && (
            <div className="text-[11px] font-serif text-rose-500 bg-rose-500/10 p-2 rounded-md">
              {errorMsg}
            </div>
          )}

          {/* Logout Button */}
          <div className="pt-2 border-t border-[var(--color-border-light)]">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 rounded-[var(--radius-lg)] text-xs font-serif text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-[background-color,color,transform] duration-150 ease-out cursor-pointer active:scale-[0.985] motion-reduce:transform-none"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
