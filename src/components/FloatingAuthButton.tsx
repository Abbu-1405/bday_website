import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  LogIn,
  LogOut,
  Heart,
  ShieldCheck,
  Loader2,
  Volume2,
  VolumeX,
  Palette,
  Settings as SettingsIcon,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth, useTheme } from '../hooks';
import { useAudio, useSfx, AMBIENT_TRACKS } from '../contexts';
import { ROUTES } from '../constants';
import { Theme } from '../types';
import { cn } from '../utils';

export interface FloatingAuthButtonProps {
  className?: string;
}

const THEME_OPTIONS: { id: Theme; label: string; desc: string }[] = [
  {
    id: 'letter-archive',
    label: 'Letter Archive',
    desc: 'Warm parchment & elegant serif',
  },
  {
    id: 'midnight-journal',
    label: 'Midnight Journal',
    desc: 'Charcoal & luxury tones',
  },
  {
    id: 'whimsical-scrapbook',
    label: 'Whimsical Scrapbook',
    desc: 'Soft pastels & playful touches',
  },
];

export const FloatingAuthButton: React.FC<FloatingAuthButtonProps> = ({ className }) => {
  const { currentUser, userProfile, loading, isAdmin, loginWithGoogle, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isPlaying, volume, currentTrack, togglePlay, setVolume, setTrack } = useAudio();
  const { playSfx } = useSfx();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSoundExpanded, setIsSoundExpanded] = useState(false);
  const [isThemeExpanded, setIsThemeExpanded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
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
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('starlit_intentional_logout', 'true');
    }
    setIsOpen(false);
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleSoundToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSfx('click');
    togglePlay();
  };

  const handleThemeChange = (newTheme: Theme) => {
    if (theme !== newTheme) {
      playSfx('themeTransition');
      setTheme(newTheme);
    }
  };

  const currentThemeLabel =
    THEME_OPTIONS.find((t) => t.id === theme)?.label ||
    (theme === 'cat-meme' ? 'Cat Meme' : 'Letter Archive');

  const isStatic = className?.includes('static');

  return (
    <div
      ref={containerRef}
      className={cn(!isStatic && 'fixed top-4 right-4 z-40', 'relative', className)}
    >
      {/* Profile Avatar Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={loading || isLoggingIn}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={
          currentUser
            ? `User Account: ${currentUser.displayName || currentUser.email}`
            : 'Personal menu and settings'
        }
        title={
          currentUser
            ? `Signed in as ${currentUser.displayName || currentUser.email}`
            : 'Profile & Settings'
        }
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

        {/* Online Status Indicator */}
        {currentUser && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--color-card)]" />
        )}
      </button>

      {/* Profile & Controls Popover Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-[var(--color-card)]/95 backdrop-blur-md border border-[var(--color-border)] p-3.5 shadow-[var(--shadow-lg)] z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
          aria-label="User profile and controls"
        >
          {/* Section 1: User Profile Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border-light)]">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile Avatar"
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-full object-cover border border-[var(--color-border-light)] shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/20 flex items-center justify-center font-serif text-sm font-bold uppercase shrink-0">
                {currentUser ? (
                  (currentUser.displayName || currentUser.email || 'U').charAt(0)
                ) : (
                  <UserIcon className="h-4 w-4 text-[var(--color-muted)]" />
                )}
              </div>
            )}

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-serif font-bold text-[var(--color-text)] truncate">
                {currentUser?.displayName || (currentUser ? 'Starlit Letters User' : 'Guest Explorer')}
              </span>
              <span className="text-[11px] font-sans text-[var(--color-muted)] truncate">
                {currentUser?.email || 'Sign in to save your journey'}
              </span>
            </div>
          </div>

          {/* Admin Tag if applicable */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[11px] font-serif font-medium border border-[var(--color-accent)]/20">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Administrator Role</span>
            </div>
          )}

          {/* Section 2: Sound / Music Control */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-[var(--color-surface)]/60 border border-[var(--color-border-light)]">
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-primary)] shrink-0">
                  {isPlaying ? (
                    <Volume2 className="h-4 w-4 animate-pulse" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-[var(--color-muted)]" />
                  )}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-serif font-medium text-[var(--color-text)]">
                    Sound / Music
                  </span>
                  <span className="text-[10px] font-sans text-[var(--color-muted)] truncate max-w-[120px]">
                    {isPlaying ? 'Ambient soundscape' : 'Muted'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSoundToggle}
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[11px] font-serif font-semibold border transition-[background-color,border-color,color,transform] duration-150 cursor-pointer active:scale-95',
                    isPlaying
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                      : 'bg-[var(--color-card)] text-[var(--color-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                  )}
                  aria-label={isPlaying ? 'Mute sound' : 'Turn on sound'}
                >
                  {isPlaying ? 'ON' : 'OFF'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsSoundExpanded((prev) => !prev)}
                  className="p-1 rounded-md text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  title={isSoundExpanded ? 'Hide audio mixer' : 'Open audio mixer'}
                  aria-label="Sound settings"
                  aria-expanded={isSoundExpanded}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Expandable Soundscape Customizer */}
            {isSoundExpanded && (
              <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)] space-y-2.5 text-xs font-serif animate-in fade-in duration-150">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[var(--color-muted)]">
                    <span>Volume</span>
                    <span className="font-mono text-[var(--color-text)]">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-[var(--color-primary)] cursor-pointer h-1.5 bg-[var(--color-surface-secondary)] rounded-lg"
                    aria-label="Ambient volume"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] uppercase font-semibold text-[var(--color-muted)] tracking-wider block">
                    Melody
                  </span>
                  <div className="space-y-1">
                    {AMBIENT_TRACKS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          if (currentTrack !== t.id) playSfx('click');
                          setTrack(t.id);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer',
                          currentTrack === t.id
                            ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-medium'
                            : 'text-[var(--color-text)] hover:bg-[var(--color-card)]'
                        )}
                      >
                        <span className="truncate">{t.label}</span>
                        {currentTrack === t.id && <Check className="h-3.5 w-3.5 shrink-0 ml-1.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Appearance / Theme Control */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setIsThemeExpanded((prev) => !prev)}
              aria-expanded={isThemeExpanded}
              className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl bg-[var(--color-surface)]/60 border border-[var(--color-border-light)] text-xs font-serif text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                <span className="font-medium">Appearance</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-[var(--color-card)] text-[var(--color-muted)] border border-[var(--color-border-light)]">
                  {currentThemeLabel}
                </span>
                {isThemeExpanded ? (
                  <ChevronUp className="h-3 w-3 text-[var(--color-muted)]" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-[var(--color-muted)]" />
                )}
              </div>
            </button>

            {/* Expandable Theme Selection */}
            {isThemeExpanded && (
              <div className="p-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)] space-y-1 animate-in fade-in duration-150">
                {THEME_OPTIONS.map((t) => {
                  const isActive = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleThemeChange(t.id)}
                      className={cn(
                        'flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-serif transition-colors cursor-pointer',
                        isActive
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-medium'
                          : 'text-[var(--color-text)] hover:bg-[var(--color-card)]'
                      )}
                    >
                      <div className="flex flex-col">
                        <span>{t.label}</span>
                        <span
                          className={cn(
                            'text-[10px] font-sans',
                            isActive ? 'text-[var(--color-primary-foreground)]/80' : 'text-[var(--color-muted)]'
                          )}
                        >
                          {t.desc}
                        </span>
                      </div>
                      {isActive && <Check className="h-3.5 w-3.5 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Preferences & Quick Navigation */}
          <div className="space-y-1 pt-1 border-t border-[var(--color-border-light)]">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                navigate(ROUTES.SETTINGS);
                setIsOpen(false);
              }}
              className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-serif text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-3.5 w-3.5 text-[var(--color-muted)] shrink-0" />
                <span>Preferences</span>
              </div>
              <span className="text-[10px] font-sans text-[var(--color-muted)]">Settings & Sound</span>
            </button>

            {currentUser && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  navigate(ROUTES.WHAT_AM_I_TO_YOU);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-serif text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors text-left cursor-pointer"
              >
                <Heart className="h-3.5 w-3.5 text-[var(--color-accent)] shrink-0" />
                <span>Write Your Feelings</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  navigate(ROUTES.ADMIN);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-serif text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors text-left cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Admin Console</span>
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="text-[11px] font-serif text-rose-500 bg-rose-500/10 p-2 rounded-md">
              {errorMsg}
            </div>
          )}

          {/* Section 5: Authentication Footer */}
          <div className="pt-2 border-t border-[var(--color-border-light)]">
            {currentUser ? (
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-serif text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer active:scale-[0.985]"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="flex items-center justify-center gap-2 w-full px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs font-serif font-medium hover:opacity-95 transition-opacity cursor-pointer active:scale-[0.985]"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                ) : (
                  <LogIn className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
