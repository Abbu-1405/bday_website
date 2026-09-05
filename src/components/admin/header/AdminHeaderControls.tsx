import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Palette,
  Check,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Music,
} from 'lucide-react';
import { useAuth, useTheme } from '../../../hooks';
import { useAudio, useSfx, AMBIENT_TRACKS } from '../../../contexts';
import { Theme } from '../../../types';
import { ROUTES } from '../../../constants';

interface AdminHeaderControlsProps {
  className?: string;
}

export const AdminHeaderControls: React.FC<AdminHeaderControlsProps> = ({ className = '' }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { playSfx } = useSfx();
  const {
    isPlaying,
    volume,
    currentTrack,
    isMixerOpen,
    togglePlay,
    setVolume,
    setTrack,
    toggleMixer,
    closeMixer,
  } = useAudio();
  const navigate = useNavigate();

  // Popover state management
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  // References for click-outside detection
  const profileRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (audioRef.current && !audioRef.current.contains(target)) {
        closeMixer();
      }
      if (themeRef.current && !themeRef.current.contains(target)) {
        setIsThemeOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        closeMixer();
        setIsThemeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMixer]);

  const themes: { id: Theme; label: string; desc: string }[] = [
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

  const handleSignOut = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const displayName = currentUser?.displayName || userProfile?.displayName || 'Admin';
  const initial = (displayName || 'A').charAt(0).toUpperCase();

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0 ${className}`}>
      {/* ──────────────────────────────────────────────────
          1. USER PROFILE BUTTON & POPOVER
          ────────────────────────────────────────────────── */}
      <div ref={profileRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsProfileOpen((prev) => !prev);
            closeMixer();
            setIsThemeOpen(false);
          }}
          aria-expanded={isProfileOpen}
          aria-label="Admin User Profile & Options"
          title={`Signed in as ${displayName}`}
          className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        >
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Admin"
              referrerPolicy="no-referrer"
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-slate-600 shrink-0"
            />
          ) : (
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">
              {initial}
            </div>
          )}

          {/* Desktop/Tablet Name Label */}
          <span className="hidden sm:inline font-medium text-xs text-slate-200 max-w-[100px] md:max-w-[130px] lg:max-w-[160px] truncate">
            {displayName}
          </span>

          {/* Authorized status tag (desktop only) */}
          <span className="hidden md:inline text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            AUTHORIZED
          </span>
        </button>

        {/* User Profile Popover Dropdown */}
        {isProfileOpen && (
          <div
            className="absolute right-0 mt-2 w-64 sm:w-72 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3 shadow-2xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-label="User profile details"
          >
            {/* Header info */}
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {initial}
                </div>
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {displayName}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {currentUser?.email || 'admin@starlitletters.com'}
                </span>
              </div>
            </div>

            {/* Role indicator */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Access Level
              </span>
              <span className="font-mono font-semibold text-emerald-400">
                Administrator
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate(ROUTES.HOME);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Return to Public Website</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors border border-transparent hover:border-rose-900/50"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Sign Out of Admin Portal</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────
          2. AUDIO PLAY / MUTE & MIXER CONTROLS
          ────────────────────────────────────────────────── */}
      <div ref={audioRef} className="relative flex items-center">
        {/* Play / Mute Toggle Button */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Mute ambient sound' : 'Play ambient sound'}
          title={isPlaying ? 'Mute ambient audio' : 'Play ambient audio'}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-l-xl text-xs font-medium border transition-colors cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ${
            isPlaying
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
              : 'bg-slate-800/90 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          {isPlaying ? (
            <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span className="hidden sm:inline">
            {isPlaying ? 'Mute' : 'Play'}
          </span>
        </button>

        {/* Audio Mixer Popover Toggle */}
        <button
          type="button"
          onClick={() => {
            toggleMixer();
            setIsProfileOpen(false);
            setIsThemeOpen(false);
          }}
          aria-expanded={isMixerOpen}
          aria-label="Ambient Audio Mixer Settings"
          title="Open Audio Mixer & Soundscapes"
          className={`flex items-center justify-center px-2 sm:px-2.5 py-1.5 rounded-r-xl border-y border-r text-xs transition-colors cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ${
            isMixerOpen
              ? 'bg-indigo-600 text-white border-indigo-500'
              : isPlaying
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
              : 'bg-slate-800/90 text-slate-400 border-slate-700/80 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline ml-1 text-xs font-medium">Mixer</span>
        </button>

        {/* Audio Mixer Popover Menu */}
        {isMixerOpen && (
          <div
            className="absolute right-0 mt-2 top-full w-72 sm:w-80 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3.5 shadow-2xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150"
            role="region"
            aria-label="Ambient Sound Mixer"
          >
            {/* Header & Quick Play State */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                <Music className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ambient Soundscape</span>
              </div>

              <button
                type="button"
                onClick={togglePlay}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors border ${
                  isPlaying
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Volume2 className="w-3 h-3 animate-pulse" />
                    <span>Playing</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3 h-3" />
                    <span>Muted</span>
                  </>
                )}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  {volume === 0 || !isPlaying ? (
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  Volume
                </span>
                <span className="font-mono text-[11px] font-semibold text-slate-200">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                aria-label="Ambient volume slider"
              />
            </div>

            {/* Track Selector */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Soundscape Track
              </span>
              <div className="space-y-1">
                {AMBIENT_TRACKS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrack(t.id)}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex flex-col ${
                      currentTrack === t.id
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-medium">{t.label}</span>
                    <span
                      className={`text-[10px] font-normal mt-0.5 ${
                        currentTrack === t.id ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {t.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────
          3. THEME SELECTOR BUTTON & POPOVER
          ────────────────────────────────────────────────── */}
      <div ref={themeRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsThemeOpen((prev) => !prev);
            setIsProfileOpen(false);
            closeMixer();
          }}
          aria-expanded={isThemeOpen}
          aria-label="Theme Palette Selector"
          title="Switch Color Theme & Atmosphere"
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        >
          <Palette className="w-4 h-4 text-slate-300 shrink-0" />
          <span className="hidden lg:inline text-xs font-medium">Theme</span>
        </button>

        {/* Theme Palette Popover Dropdown */}
        {isThemeOpen && (
          <div
            className="absolute right-0 mt-2 w-60 sm:w-64 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 p-2.5 shadow-2xl z-50 space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
            role="menu"
            aria-label="Available themes"
          >
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              App Theme Palette
            </div>
            {themes.map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    if (theme !== t.id) {
                      playSfx('themeTransition');
                    }
                    setTheme(t.id);
                    setIsThemeOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-medium truncate">{t.label}</span>
                    <span
                      className={`text-[10px] truncate ${
                        isActive ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {t.desc}
                    </span>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────
          4. DESKTOP QUICK SIGN OUT BUTTON
          ────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleSignOut}
        aria-label="Sign Out"
        title="Sign Out of Admin Portal"
        className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-medium border border-slate-700/80 hover:border-rose-900/50 transition-colors shadow-xs"
      >
        <LogOut className="w-3.5 h-3.5 shrink-0" />
        <span>Sign Out</span>
      </button>
    </div>
  );
};
