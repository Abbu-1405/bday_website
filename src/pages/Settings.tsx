import React, { useState } from 'react';
import { User, LogIn, LogOut, ShieldCheck, Palette, Heart, Check, Sparkles, Loader2, AlertCircle, Music, Volume2, VolumeX } from 'lucide-react';
import { Container, Surface, Button, Badge } from '../components';
import { useAuth, useTheme } from '../hooks';
import { useAudio, AMBIENT_TRACKS } from '../contexts';
import { Theme } from '../types';

export default function Settings() {
  const { currentUser, loading, isAdmin, loginWithGoogle, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isPlaying, volume, currentTrack, togglePlay, setVolume, setTrack } = useAudio();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const themes: { id: Theme; label: string; desc: string }[] = [
    {
      id: 'letter-archive',
      label: 'Letter Archive',
      desc: 'Warm parchment & elegant serif font',
    },
    {
      id: 'midnight-journal',
      label: 'Midnight Journal',
      desc: 'Charcoal canvas & luxury tones',
    },
    {
      id: 'whimsical-scrapbook',
      label: 'Whimsical Scrapbook',
      desc: 'Enchanted night forest & magical artwork',
    },
  ];

  const handleLogin = async () => {
    if (isLoggingIn) return;
    console.log('[AUTH] Login button clicked');
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.message && !err.message.includes('cancelled')) {
        setAuthError(err.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Container maxWidth="lg" className="py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium bg-[var(--color-surface-secondary)] text-[var(--color-primary)] border border-[var(--color-border-light)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          <span>Preferences & Security</span>
        </div>
        <h1 className="text-h1 font-serif font-bold text-[var(--color-text)] tracking-tight">
          Settings & Account
        </h1>
        <p className="text-body text-[var(--color-text-secondary)] font-serif leading-relaxed">
          Manage your account authentication, private sanctuary settings, and visual theme preferences.
        </p>
      </div>

      {/* Account & Authentication Section */}
      <Surface variant="elevated" padding="lg" className="border border-[var(--color-border-light)] space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)]">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-h2 font-serif font-bold text-[var(--color-text)]">
                Account Authentication
              </h2>
              <p className="text-xs font-serif text-[var(--color-text-secondary)]">
                Required for saving private feelings and written letters
              </p>
            </div>
          </div>
          {currentUser ? (
            <Badge variant="success" size="md" className="font-serif">
              Authenticated
            </Badge>
          ) : (
            <Badge variant="neutral" size="md" className="font-serif">
              Guest
            </Badge>
          )}
        </div>

        {authError && (
          <div className="flex items-center gap-2 text-xs sm:text-sm font-serif text-rose-600 dark:text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {currentUser ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile Avatar"
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-full object-cover border border-[var(--color-border-light)]"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center font-serif text-lg font-bold">
                    {(currentUser.displayName || currentUser.email || 'U').charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-serif font-bold text-sm text-[var(--color-text)]">
                    {currentUser.displayName || 'Starlit Letters User'}
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] font-sans">
                    {currentUser.email}
                  </p>
                  <p className="text-[11px] font-serif text-[var(--color-text-secondary)] mt-0.5">
                    User ID: <code className="text-[10px] bg-[var(--color-surface)] px-1 rounded">{currentUser.uid.slice(0, 12)}...</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isAdmin && (
                  <Badge variant="accent" size="md" className="font-serif flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin Role
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  leftIcon={<LogOut className="h-3.5 w-3.5" />}
                  className="font-serif text-xs text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                >
                  Sign Out
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-light)] text-xs text-[var(--color-text-secondary)] font-serif space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text)]">
                <Heart className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                <span>Private Sanctuary Protection</span>
              </div>
              <p>
                Your submitted feelings and written letters in "What Am I To You?" are isolated and encrypted under your personal account ID (<code className="text-[10px]">{currentUser.uid}</code>).
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto">
                <LogIn className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-serif font-bold text-base text-[var(--color-text)]">
                  Sign In to Access Private Writing
                </h3>
                <p className="text-xs font-serif text-[var(--color-text-secondary)] leading-relaxed">
                  Sign in securely with Google to leave private feelings and letters in "What Am I To You?". You can freely browse the rest of Starlit Letters without signing in.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleLogin}
                disabled={loading || isLoggingIn}
                leftIcon={
                  isLoggingIn ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )
                }
                className="font-serif min-w-[180px]"
              >
                {isLoggingIn ? 'Signing In...' : 'Sign In with Google'}
              </Button>
            </div>
          </div>
        )}
      </Surface>

      {/* Visual Theme Settings */}
      <Surface variant="elevated" padding="lg" className="border border-[var(--color-border-light)] space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[var(--color-border-light)] pb-4">
          <div className="w-9 h-9 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)]">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-h2 font-serif font-bold text-[var(--color-text)]">
              Visual Theme Palette
            </h2>
            <p className="text-xs font-serif text-[var(--color-text-secondary)]">
              Customize the visual atmosphere of Starlit Letters
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-32 relative ${
                  isActive
                    ? 'border-[var(--color-primary)] bg-[var(--color-surface-secondary)] ring-1 ring-[var(--color-primary)]'
                    : 'border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-border)]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[var(--color-text)]">
                      {t.label}
                    </span>
                    {isActive && (
                      <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-muted)] font-serif leading-relaxed">
                    {t.desc}
                  </p>
                </div>
                <div className="text-[10px] font-serif uppercase tracking-wider text-[var(--color-primary)] font-semibold">
                  {isActive ? 'Active Theme' : 'Click to Apply'}
                </div>
              </button>
            );
          })}
        </div>
      </Surface>

      {/* Ambient Audio & Soundscape Controls */}
      <Surface variant="elevated" padding="lg" className="border border-[var(--color-border-light)] space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)]">
              <Music className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-h2 font-serif font-bold text-[var(--color-text)]">
                Ambient Soundscapes & Mute Control
              </h2>
              <p className="text-xs font-serif text-[var(--color-text-secondary)]">
                Manage background audio playback, volume level, and soundscape tracks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif font-medium border transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-[var(--color-surface-secondary)] text-[var(--color-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
          >
            {isPlaying ? (
              <>
                <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                <span>Playing (Click to Mute)</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5" />
                <span>Muted (Click to Unmute)</span>
              </>
            )}
          </button>
        </div>

        {/* Volume Slider */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <div className="flex items-center justify-between text-xs font-serif text-[var(--color-text)]">
            <span className="font-semibold flex items-center gap-1.5">
              {volume === 0 || !isPlaying ? (
                <VolumeX className="h-4 w-4 text-[var(--color-muted)]" />
              ) : (
                <Volume2 className="h-4 w-4 text-[var(--color-primary)]" />
              )}
              Soundscape Volume
            </span>
            <span className="font-mono text-xs">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-primary)] cursor-pointer h-2 bg-[var(--color-surface)] rounded-lg"
            aria-label="Ambient audio volume"
          />
        </div>

        {/* Soundscape Track Choices */}
        <div className="space-y-2">
          <h3 className="text-xs font-serif font-semibold text-[var(--color-muted)] uppercase tracking-wider">
            Choose Atmosphere Track
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AMBIENT_TRACKS.map((t) => {
              const isSelected = currentTrack === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTrack(t.id)}
                  className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-surface-secondary)] ring-1 ring-[var(--color-primary)]'
                      : 'border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-bold text-sm text-[var(--color-text)]">
                      {t.label}
                    </span>
                    {isSelected && (
                      <Badge variant="primary" size="sm" className="font-serif text-[10px]">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-muted)] font-serif leading-relaxed">
                    {t.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </Surface>
    </Container>
  );
}

