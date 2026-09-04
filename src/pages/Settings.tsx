import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Palette,
  Heart,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
  Music,
  Volume2,
  VolumeX,
  Sliders,
  Bell,
  BellOff,
  Send,
  Info,
  Clock,
  Moon,
  Calendar,
  Globe,
  History,
  CheckCircle2,
  FolderLock,
  Mail,
  Image,
  ChevronRight,
} from 'lucide-react';
import { Container, Surface, Button, Badge } from '../components';
import { useAuth, useTheme } from '../hooks';
import { useAudio, useSfx, AMBIENT_TRACKS } from '../contexts';
import { ROUTES } from '../constants';
import { Theme, NotificationPermissionState, NotificationPreferences, NotificationEvent, DEFAULT_NOTIFICATION_PREFERENCES } from '../types';
import {
  isPushSupported,
  getNotificationPermission,
  getVapidKey,
  requestAndRegisterNotification,
  disableNotification,
  sendLocalTestNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  getDetectedTimezone,
  isValidTimezone,
  subscribeUserNotifications,
  scheduleBirthdayNotification,
} from '../services';

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export default function Settings() {
  const navigate = useNavigate();
  const { currentUser, loading, isAdmin, loginWithGoogle, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { playSfx } = useSfx();
  const { isPlaying, volume, currentTrack, togglePlay, setVolume, setTrack } = useAudio();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('starlit_intentional_logout', 'true');
    }
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  // Notification state
  const [pushSupported, setPushSupported] = useState<boolean>(true);
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>('default');
  const [vapidConfigured, setVapidConfigured] = useState<boolean>(false);
  const [isPushLoading, setIsPushLoading] = useState<boolean>(false);
  const [pushFeedback, setPushFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [isUpdatingPref, setIsUpdatingPref] = useState(false);
  const [userNotifications, setUserNotifications] = useState<NotificationEvent[]>([]);

  useEffect(() => {
    async function checkPush() {
      const supported = await isPushSupported();
      setPushSupported(supported);
      setPermissionState(getNotificationPermission());
      setVapidConfigured(Boolean(getVapidKey()));
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('starlit_fcm_token') : null;
      setActiveToken(stored);

      if (currentUser?.uid) {
        const userPrefs = await getNotificationPreferences(currentUser.uid);
        setPreferences(userPrefs);
      }
    }
    checkPush();
  }, [currentUser]);

  // Subscribe to user notification history
  useEffect(() => {
    if (!currentUser?.uid) {
      setUserNotifications([]);
      return;
    }

    const unsubscribe = subscribeUserNotifications(currentUser.uid, (list) => {
      setUserNotifications(list);
    }, 15);

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  const handleTogglePref = async (key: keyof NotificationPreferences) => {
    if (!currentUser?.uid) return;
    const updated: NotificationPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(updated);
    setIsUpdatingPref(true);
    await updateNotificationPreferences(currentUser.uid, updated);
    setIsUpdatingPref(false);
  };

  const handleUpdateFieldPref = async (updates: Partial<NotificationPreferences>) => {
    if (!currentUser?.uid) return;
    const updated: NotificationPreferences = {
      ...preferences,
      ...updates,
    };
    setPreferences(updated);
    setIsUpdatingPref(true);
    await updateNotificationPreferences(currentUser.uid, updated);

    // If birth date was updated, schedule the birthday event in background
    if (updates.birthDate && updated.birthday !== false) {
      scheduleBirthdayNotification(currentUser.uid, updates.birthDate).catch((e) => {
        console.warn('Birthday scheduling notice:', e);
      });
    }

    setIsUpdatingPref(false);
  };

  const handleToggleNotifications = async () => {
    if (!currentUser) {
      setPushFeedback({
        type: 'error',
        message: 'Please sign in with Google first to enable device push notifications.',
      });
      return;
    }

    setIsPushLoading(true);
    setPushFeedback(null);

    const isCurrentlyEnabled = permissionState === 'granted' && Boolean(activeToken);

    if (isCurrentlyEnabled) {
      // Disable
      const res = await disableNotification(currentUser);
      setIsPushLoading(false);
      if (res.success) {
        setActiveToken(null);
        setPushFeedback({
          type: 'success',
          message: 'Notifications disabled for this session.',
        });
      } else {
        setPushFeedback({
          type: 'error',
          message: res.error || 'Failed to disable notifications.',
        });
      }
    } else {
      // Enable
      const res = await requestAndRegisterNotification(currentUser);
      setIsPushLoading(false);
      setPermissionState(getNotificationPermission());
      if (res.success) {
        setActiveToken(res.token || 'registered');
        setPushFeedback({
          type: 'success',
          message: 'Notifications successfully enabled and registered to your UID! ✨',
        });
      } else {
        setPushFeedback({
          type: 'error',
          message: res.error || 'Could not enable push notifications.',
        });
      }
    }
  };

  const handleSendTestPush = async () => {
    setPushFeedback(null);
    const sent = await sendLocalTestNotification(
      'Starlit Letters ✨',
      'A little piece of your universe is waiting in the stars.',
      '/'
    );
    if (sent) {
      setPushFeedback({
        type: 'success',
        message: 'Test notification sent! Check your notification tray.',
      });
    } else {
      setPushFeedback({
        type: 'error',
        message: 'Could not send test notification. Ensure permission is granted.',
      });
    }
  };

  const themes: {
    id: Theme;
    label: string;
    desc: string;
    palette: { bg: string; border: string; accent: string; text: string };
  }[] = [
    {
      id: 'letter-archive',
      label: 'Letter Archive',
      desc: 'Warm parchment & elegant serif font',
      palette: {
        bg: '#FAF6F0',
        border: 'rgba(138, 110, 89, 0.35)',
        accent: '#7A2E3B',
        text: '#2C221E',
      },
    },
    {
      id: 'midnight-journal',
      label: 'Midnight Journal',
      desc: 'Charcoal canvas & luxury tones',
      palette: {
        bg: '#050A16',
        border: 'rgba(201, 155, 88, 0.35)',
        accent: '#C99B58',
        text: '#F2E4CF',
      },
    },
    {
      id: 'whimsical-scrapbook',
      label: 'Whimsical Scrapbook',
      desc: 'Enchanted night forest & magical artwork',
      palette: {
        bg: '#0B100D',
        border: 'rgba(240, 230, 190, 0.25)',
        accent: '#344A32',
        text: '#F7F1DF',
      },
    },
  ];

  const handleLogin = async () => {
    if (isLoggingIn) return;
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

  const volumePercentage = Math.round(volume * 100);

  return (
    <Container maxWidth="lg" className="py-6 sm:py-10 lg:py-14 space-y-8 sm:space-y-10">
      {/* Page Header */}
      <header className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium bg-[var(--color-surface-secondary)] text-[var(--color-primary)] border border-[var(--color-border-light)] shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
          <span>Preferences & Security</span>
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[var(--color-text)] tracking-tight">
            Settings & Account
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] font-serif max-w-2xl leading-relaxed">
            Manage your account authentication, private sanctuary settings, and visual theme preferences.
          </p>
        </div>
      </header>

      {/* Main Settings Sections */}
      <div className="space-y-6 sm:space-y-8">
        {/* =========================================================================
            SECTION 1: VISUAL THEME PALETTE (Appearance)
           ========================================================================= */}
        <Surface
          variant="elevated"
          padding="lg"
          className="border border-[var(--color-border-light)] shadow-[var(--shadow-soft)] space-y-6 transition-all"
        >
          {/* Section Header */}
          <div className="flex items-start sm:items-center gap-3 border-b border-[var(--color-border-light)] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)] shrink-0 shadow-2xs">
              <Palette className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[var(--color-text)]">
                Visual Theme Palette
              </h2>
              <p className="text-xs sm:text-sm font-serif text-[var(--color-text-secondary)]">
                Customize the visual atmosphere of Starlit Letters
              </p>
            </div>
          </div>

          {/* Theme Choices Cards */}
          <div
            role="radiogroup"
            aria-label="Visual Theme Options"
            className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4"
          >
            {themes.map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => {
                    if (theme !== t.id) {
                      playSfx('themeTransition');
                    }
                    setTheme(t.id);
                  }}
                  className={`group relative p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[140px] sm:min-h-[160px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] ${
                    isActive
                      ? 'border-[var(--color-primary)] bg-[var(--color-surface-secondary)] ring-1 ring-[var(--color-primary)] shadow-sm'
                      : 'border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-border)] hover:bg-[var(--color-card-hover)] hover:shadow-2xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif font-bold text-sm sm:text-base text-[var(--color-text)]">
                        {t.label}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 ${
                          isActive
                            ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-xs'
                            : 'border border-[var(--color-border-light)] group-hover:border-[var(--color-border)]'
                        }`}
                        aria-hidden="true"
                      >
                        {isActive && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] font-serif leading-relaxed line-clamp-2">
                      {t.desc}
                    </p>
                  </div>

                  {/* Palette Preview Dots & Status Label */}
                  <div className="pt-3 border-t border-[var(--color-border-light)] flex items-center justify-between">
                    <div
                      className="flex items-center gap-1.5"
                      aria-label={`${t.label} color preview`}
                      title={`${t.label} palette`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border shadow-2xs"
                        style={{ backgroundColor: t.palette.bg, borderColor: t.palette.border }}
                      />
                      <span
                        className="w-3 h-3 rounded-full border shadow-2xs"
                        style={{ backgroundColor: t.palette.accent, borderColor: t.palette.border }}
                      />
                      <span
                        className="w-3 h-3 rounded-full border shadow-2xs"
                        style={{ backgroundColor: t.palette.text, borderColor: t.palette.border }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-serif uppercase tracking-wider font-semibold ${
                        isActive
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-muted)] group-hover:text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {isActive ? 'Active Theme' : 'Click to Apply'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Surface>

        {/* =========================================================================
            SECTION 2: AMBIENT SOUNDSCAPES & AUDIO CONTROLS (Audio)
           ========================================================================= */}
        <Surface
          variant="elevated"
          padding="lg"
          className="border border-[var(--color-border-light)] shadow-[var(--shadow-soft)] space-y-6 transition-all"
        >
          {/* Section Header with Master Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)] shrink-0 shadow-2xs">
                <Music className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[var(--color-text)]">
                  Ambient Soundscapes & Mute Control
                </h2>
                <p className="text-xs sm:text-sm font-serif text-[var(--color-text-secondary)]">
                  Manage background audio playback, volume level, and soundscape tracks
                </p>
              </div>
            </div>

            {/* Mute / Play Audio Toggle Button */}
            <button
              type="button"
              onClick={togglePlay}
              aria-pressed={isPlaying}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] rounded-full text-xs font-serif font-medium border transition-all duration-200 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] ${
                isPlaying
                  ? 'bg-[var(--color-primary)]/12 text-[var(--color-primary)] border-[var(--color-primary)]/35 hover:bg-[var(--color-primary)]/20 shadow-2xs'
                  : 'bg-[var(--color-surface-secondary)] text-[var(--color-muted)] border-[var(--color-border-light)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Volume2 className="h-4 w-4 animate-pulse text-[var(--color-primary)]" aria-hidden="true" />
                  <span>Playing (Click to Mute)</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4 text-[var(--color-muted)]" aria-hidden="true" />
                  <span>Muted (Click to Unmute)</span>
                </>
              )}
            </button>
          </div>

          {/* Volume Slider Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-serif text-[var(--color-text)]">
              <span className="font-semibold flex items-center gap-2">
                {volume === 0 || !isPlaying ? (
                  <VolumeX className="h-4 w-4 text-[var(--color-muted)] shrink-0" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
                )}
                Soundscape Volume
              </span>
              <span className="font-mono text-xs font-medium text-[var(--color-text-secondary)] px-2 py-0.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border-light)]">
                {volumePercentage}%
              </span>
            </div>

            <div className="py-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full cursor-pointer h-2.5 rounded-lg appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${volumePercentage}%, var(--color-surface) ${volumePercentage}%, var(--color-surface) 100%)`,
                  accentColor: 'var(--color-primary)',
                }}
                aria-label="Ambient soundscape volume slider"
              />
            </div>
          </div>

          {/* Soundscape Track Choices */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-[var(--color-muted)]" aria-hidden="true" />
              <h3 className="text-xs font-serif font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                Choose Atmosphere Track
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AMBIENT_TRACKS.map((t) => {
                const isSelected = currentTrack === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrack(t.id)}
                    className={`group p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] ${
                      isSelected
                        ? 'border-[var(--color-primary)] bg-[var(--color-surface-secondary)] ring-1 ring-[var(--color-primary)] shadow-2xs'
                        : 'border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-border)] hover:bg-[var(--color-card-hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif font-bold text-sm text-[var(--color-text)]">
                        {t.label}
                      </span>
                      {isSelected ? (
                        <Badge variant="primary" size="sm" className="font-serif text-[10px] py-0 px-2">
                          Active
                        </Badge>
                      ) : (
                        <span className="text-[10px] font-serif text-[var(--color-muted)] group-hover:text-[var(--color-text-secondary)]">
                          Select
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-muted)] font-serif leading-relaxed line-clamp-2">
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </Surface>

        {/* =========================================================================
            SECTION 3: ACCOUNT & AUTHENTICATION (Account & Sanctuary)
           ========================================================================= */}
        <Surface
          variant="elevated"
          padding="lg"
          className="border border-[var(--color-border-light)] shadow-[var(--shadow-soft)] space-y-6 transition-all"
        >
          {/* Section Header with Auth Badge */}
          <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)] shrink-0 shadow-2xs">
                <User className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[var(--color-text)]">
                  Account Authentication
                </h2>
                <p className="text-xs sm:text-sm font-serif text-[var(--color-text-secondary)]">
                  Required for saving private feelings and written letters
                </p>
              </div>
            </div>
            {currentUser ? (
              <Badge variant="success" size="md" className="font-serif shrink-0">
                Authenticated
              </Badge>
            ) : (
              <Badge variant="neutral" size="md" className="font-serif shrink-0">
                Guest
              </Badge>
            )}
          </div>

          {/* Auth Error Banner */}
          {authError && (
            <div className="flex items-center gap-2 text-xs sm:text-sm font-serif text-rose-600 dark:text-rose-400 bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{authError}</span>
            </div>
          )}

          {currentUser ? (
            /* Authenticated User View */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
                <div className="flex items-center gap-3.5">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile Avatar"
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-full object-cover border border-[var(--color-border-light)] shadow-2xs shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center font-serif text-lg font-bold shadow-2xs shrink-0">
                      {(currentUser.displayName || currentUser.email || 'U').charAt(0)}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--color-text)]">
                      {currentUser.displayName || 'Starlit Letters User'}
                    </h3>
                    <p className="text-xs text-[var(--color-muted)] font-sans">
                      {currentUser.email}
                    </p>
                    <p className="text-[11px] font-serif text-[var(--color-text-secondary)] pt-0.5">
                      User ID:{' '}
                      <code className="text-[10px] font-mono bg-[var(--color-surface)] px-1.5 py-0.5 rounded border border-[var(--color-border-light)] text-[var(--color-text)]">
                        {currentUser.uid.slice(0, 12)}...
                      </code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                  {isAdmin && (
                    <Badge variant="primary" size="md" className="font-serif flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Admin Role</span>
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="h-3.5 w-3.5" />}
                    className="font-serif text-xs min-h-[38px] text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500/50"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>

              {/* Private Sanctuary Notice */}
              <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)] text-xs text-[var(--color-text-secondary)] font-serif space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text)]">
                  <Heart className="h-3.5 w-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
                  <span>Private Sanctuary Protection</span>
                </div>
                <p className="leading-relaxed">
                  Your submitted feelings and written letters in &ldquo;What Am I To You?&rdquo; are isolated and encrypted under your personal account ID (<code className="text-[10px] font-mono">{currentUser.uid}</code>).
                </p>
              </div>
            </div>
          ) : (
            /* Guest View */
            <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto shadow-2xs border border-[var(--color-border-light)]">
                <LogIn className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--color-text)]">
                  Sign In to Access Private Writing
                </h3>
                <p className="text-xs sm:text-sm font-serif text-[var(--color-text-secondary)] leading-relaxed">
                  Sign in securely with Google to leave private feelings and letters in &ldquo;What Am I To You?&rdquo;. You can freely browse the rest of Starlit Letters without signing in.
                </p>
              </div>
              <div className="pt-2">
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
                  className="font-serif min-w-[200px] min-h-[44px] shadow-sm"
                >
                  {isLoggingIn ? 'Signing In...' : 'Sign In with Google'}
                </Button>
              </div>
            </div>
          )}
        </Surface>

        {/* =========================================================================
            SECTION 4: REAL WEB PUSH NOTIFICATIONS (FCM Web Push)
           ========================================================================= */}
        <Surface
          variant="elevated"
          padding="lg"
          className="border border-[var(--color-border-light)] shadow-[var(--shadow-soft)] space-y-6 transition-all"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)] shrink-0 shadow-2xs">
                <Bell className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[var(--color-text)]">
                  Device Push Notifications
                </h2>
                <p className="text-xs sm:text-sm font-serif text-[var(--color-text-secondary)]">
                  Receive real browser and Android notification panel updates from Starlit Letters
                </p>
              </div>
            </div>

            {/* Notification Status Badge */}
            <div className="shrink-0">
              {!pushSupported ? (
                <Badge variant="neutral" size="md" className="font-serif">
                  Unsupported Browser
                </Badge>
              ) : permissionState === 'denied' ? (
                <Badge variant="error" size="md" className="font-serif">
                  Permission Blocked
                </Badge>
              ) : permissionState === 'granted' && activeToken ? (
                <Badge variant="success" size="md" className="font-serif">
                  Notifications Enabled
                </Badge>
              ) : (
                <Badge variant="neutral" size="md" className="font-serif">
                  Notifications Disabled
                </Badge>
              )}
            </div>
          </div>

          {/* Feedback banner */}
          {pushFeedback && (
            <div
              className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs font-serif leading-relaxed ${
                pushFeedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}
            >
              {pushFeedback.type === 'success' ? (
                <Check className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <p>{pushFeedback.message}</p>
              </div>
            </div>
          )}

          {/* Controls & Configuration Details */}
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-sm text-[var(--color-text)]">
                  Push Notification Status
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] font-serif max-w-lg leading-relaxed">
                  {permissionState === 'granted' && activeToken
                    ? 'Device push notifications are active. You will receive notifications even when the app is closed.'
                    : permissionState === 'denied'
                    ? 'Notifications are blocked in your browser settings. To enable them, allow notification permission for this site in your browser.'
                    : 'Enable push notifications to receive real browser and Android notification tray alerts.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {permissionState === 'granted' && activeToken && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendTestPush}
                    leftIcon={<Send className="h-3.5 w-3.5" />}
                    className="font-serif text-xs min-h-[38px]"
                  >
                    Send Test Push
                  </Button>
                )}

                <Button
                  variant={permissionState === 'granted' && activeToken ? 'outline' : 'primary'}
                  size="sm"
                  onClick={handleToggleNotifications}
                  disabled={isPushLoading || !pushSupported || !currentUser}
                  leftIcon={
                    isPushLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : permissionState === 'granted' && activeToken ? (
                      <BellOff className="h-3.5 w-3.5" />
                    ) : (
                      <Bell className="h-3.5 w-3.5" />
                    )
                  }
                  className="font-serif text-xs min-h-[38px]"
                >
                  {isPushLoading
                    ? 'Updating...'
                    : permissionState === 'granted' && activeToken
                    ? 'Disable Notifications'
                    : 'Enable Notifications'}
                </Button>
              </div>
            </div>

            {/* Notification Category Preferences */}
            {currentUser && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[var(--color-text)]">
                      Notification Categories
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] font-serif">
                      Choose which celestial moments you wish to be notified about.
                    </p>
                  </div>
                  {isUpdatingPref && (
                    <div className="flex items-center gap-1 text-[11px] font-serif text-[var(--color-text-muted)]">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif">
                  {/* Letters */}
                  <div
                    onClick={() => handleTogglePref('letters')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      preferences.letters
                        ? 'bg-[var(--color-surface)] border-[var(--color-primary)]/40 text-[var(--color-text)]'
                        : 'bg-[var(--color-surface)]/50 border-[var(--color-border-light)] text-[var(--color-text-muted)] opacity-70'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs text-[var(--color-text)]">Heartfelt Letters</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">New written letters in your sanctuary</p>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                        preferences.letters ? 'bg-[var(--color-primary)]' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.letters ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Open When */}
                  <div
                    onClick={() => handleTogglePref('openWhen')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      preferences.openWhen
                        ? 'bg-[var(--color-surface)] border-[var(--color-primary)]/40 text-[var(--color-text)]'
                        : 'bg-[var(--color-surface)]/50 border-[var(--color-border-light)] text-[var(--color-text-muted)] opacity-70'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs text-[var(--color-text)]">Open When Envelopes</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">When letters become available</p>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                        preferences.openWhen ? 'bg-[var(--color-primary)]' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.openWhen ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Secret Vault */}
                  <div
                    onClick={() => handleTogglePref('secrets')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      preferences.secrets
                        ? 'bg-[var(--color-surface)] border-[var(--color-primary)]/40 text-[var(--color-text)]'
                        : 'bg-[var(--color-surface)]/50 border-[var(--color-border-light)] text-[var(--color-text-muted)] opacity-70'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs text-[var(--color-text)]">Secret Vault Unlocks</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">When secrets and clues open</p>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                        preferences.secrets ? 'bg-[var(--color-primary)]' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.secrets ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Moments Gallery */}
                  <div
                    onClick={() => handleTogglePref('moments')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      preferences.moments
                        ? 'bg-[var(--color-surface)] border-[var(--color-primary)]/40 text-[var(--color-text)]'
                        : 'bg-[var(--color-surface)]/50 border-[var(--color-border-light)] text-[var(--color-text-muted)] opacity-70'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs text-[var(--color-text)]">Cherished Moments</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">Photo gallery memories & milestones</p>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                        preferences.moments ? 'bg-[var(--color-primary)]' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.moments ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Birthday */}
                  <div
                    onClick={() => handleTogglePref('birthday')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      preferences.birthday
                        ? 'bg-[var(--color-surface)] border-[var(--color-primary)]/40 text-[var(--color-text)]'
                        : 'bg-[var(--color-surface)]/50 border-[var(--color-border-light)] text-[var(--color-text-muted)] opacity-70'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs text-[var(--color-text)]">Birthday Celebrations</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">Countdown milestones & birthday greetings</p>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                        preferences.birthday ? 'bg-[var(--color-primary)]' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.birthday ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Timezone, Quiet Hours & Birthday Configuration */}
                <div className="pt-3 border-t border-[var(--color-border-light)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif font-bold text-xs text-[var(--color-text)] flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                      <span>Scheduling, Timezone & Quiet Hours</span>
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif">
                    {/* Timezone Selector */}
                    <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)] space-y-2">
                      <div className="flex items-center gap-1.5 text-[var(--color-text)] font-semibold">
                        <Globe className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                        <span>Your Timezone</span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">
                        Used for accurately scheduling birthday greetings & envelope unlocking.
                      </p>
                      <select
                        value={preferences.timezone || getDetectedTimezone()}
                        onChange={(e) => handleUpdateFieldPref({ timezone: e.target.value })}
                        className="w-full text-xs font-mono py-1.5 px-2.5 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      >
                        {COMMON_TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                        {!COMMON_TIMEZONES.includes(preferences.timezone || getDetectedTimezone()) && (
                          <option value={preferences.timezone || getDetectedTimezone()}>
                            {preferences.timezone || getDetectedTimezone()} (Detected)
                          </option>
                        )}
                      </select>
                    </div>

                    {/* Birthday Picker */}
                    <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)] space-y-2">
                      <div className="flex items-center gap-1.5 text-[var(--color-text)] font-semibold">
                        <Calendar className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                        <span>Birth Date</span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">
                        Sets your yearly starlit birthday reminder and countdown celebrations.
                      </p>
                      <input
                        type="date"
                        value={preferences.birthDate || ''}
                        onChange={(e) => handleUpdateFieldPref({ birthDate: e.target.value })}
                        className="w-full text-xs font-sans py-1.5 px-2.5 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                  </div>

                  {/* Quiet Hours Card */}
                  <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-[var(--color-primary)]" />
                        <div>
                          <p className="font-semibold text-xs text-[var(--color-text)]">Quiet Hours Protection</p>
                          <p className="text-[11px] text-[var(--color-text-secondary)]">
                            Automatically delay non-urgent notifications during your sleep hours until morning.
                          </p>
                        </div>
                      </div>
                      <div
                        onClick={() => handleTogglePref('quietHoursEnabled')}
                        className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer shrink-0 ${
                          preferences.quietHoursEnabled ? 'bg-[var(--color-primary)]' : 'bg-neutral-300 dark:bg-neutral-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            preferences.quietHoursEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>

                    {preferences.quietHoursEnabled && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--color-border-light)]">
                        <div>
                          <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1">
                            Quiet Start (Sleep)
                          </label>
                          <input
                            type="time"
                            value={preferences.quietHoursStart || '22:00'}
                            onChange={(e) => handleUpdateFieldPref({ quietHoursStart: e.target.value })}
                            className="w-full text-xs font-mono py-1.5 px-2 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-[var(--color-text)]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1">
                            Quiet End (Wake)
                          </label>
                          <input
                            type="time"
                            value={preferences.quietHoursEnd || '07:00'}
                            onChange={(e) => handleUpdateFieldPref({ quietHoursEnd: e.target.value })}
                            className="w-full text-xs font-mono py-1.5 px-2 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-[var(--color-text)]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* User Recent Notifications History */}
            {currentUser && userNotifications.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-[var(--color-primary)]" />
                    <h4 className="font-serif font-bold text-sm text-[var(--color-text)]">
                      Recent Notification History
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                      {userNotifications.length} recent
                    </Badge>
                    <Link
                      to={ROUTES.NOTIFICATIONS}
                      className="inline-flex items-center gap-1 text-[11px] font-serif text-[var(--color-primary)] hover:underline font-semibold"
                    >
                      <span>View All</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {userNotifications.map((evt) => {
                    const dateFormatted = evt.createdAt
                      ? new Date(
                          typeof evt.createdAt === 'object' && 'toDate' in evt.createdAt
                            ? (evt.createdAt as { toDate: () => Date }).toDate()
                            : (evt.createdAt as unknown as string)
                        ).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now';

                    return (
                      <div
                        key={evt.id}
                        className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)] flex items-start justify-between gap-3 text-xs font-serif"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)] shrink-0 mt-0.5">
                            {evt.type === 'SECRET_UNLOCKED' ? (
                              <FolderLock className="h-3.5 w-3.5" />
                            ) : evt.type === 'MOMENT_AVAILABLE' ? (
                              <Image className="h-3.5 w-3.5" />
                            ) : evt.type === 'BIRTHDAY' ? (
                              <Sparkles className="h-3.5 w-3.5" />
                            ) : (
                              <Mail className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-bold text-[var(--color-text)] text-xs">{evt.title}</p>
                            <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1">{evt.body}</p>
                            <span className="text-[10px] text-[var(--color-muted)] font-mono">{dateFormatted}</span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right space-y-1">
                          <Badge
                            variant={
                              evt.status === 'sent'
                                ? 'success'
                                : evt.status === 'scheduled'
                                ? 'primary'
                                : evt.status === 'failed'
                                ? 'error'
                                : 'neutral'
                            }
                            size="sm"
                            className="text-[10px] capitalize font-mono"
                          >
                            {evt.status === 'sent' ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Delivered
                              </span>
                            ) : (
                              evt.status
                            )}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VAPID Key Setup notice if missing */}
            {!vapidConfigured && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200 font-serif space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Firebase Web Push (VAPID) Key Configuration</span>
                </div>
                <p className="leading-relaxed">
                  To establish real FCM Web Push subscription tokens, a Web Push certificate (VAPID Key) from your Firebase Console is required.
                </p>
                <div className="text-[11px] space-y-1 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/15">
                  <p className="font-semibold">Where to obtain your VAPID Key:</p>
                  <p>1. Open <strong className="font-sans">Firebase Console</strong> &rarr; <strong className="font-sans">Project Settings</strong> &rarr; <strong className="font-sans">Cloud Messaging</strong>.</p>
                  <p>2. Scroll to <strong className="font-sans">Web configuration</strong> &rarr; <strong className="font-sans">Web Push certificates</strong>.</p>
                  <p>3. Click <strong className="font-sans">Generate key pair</strong> (or copy your existing Key pair string).</p>
                  <p>4. Set <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded">VITE_FIREBASE_VAPID_KEY=YOUR_KEY</code> in your environment.</p>
                </div>
              </div>
            )}

            {/* Browser Permission Blocked Guidance */}
            {permissionState === 'denied' && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-800 dark:text-rose-300 font-serif space-y-1.5">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>How to Unblock in Chrome / Android</span>
                </div>
                <p className="leading-relaxed">
                  Tap the padlock or site settings icon in your browser address bar &rarr; choose <strong>Permissions</strong> &rarr; <strong>Notifications</strong> &rarr; set to <strong>Allow</strong>. Then return here and tap Enable Notifications.
                </p>
              </div>
            )}

            {/* Guest notice */}
            {!currentUser && (
              <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)] text-xs text-[var(--color-text-secondary)] font-serif space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text)]">
                  <User className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                  <span>Authentication Required</span>
                </div>
                <p className="leading-relaxed">
                  Push notification tokens are securely associated with your authenticated Firebase account ID. Please sign in above to register this device.
                </p>
              </div>
            )}
          </div>
        </Surface>

        {/* =========================================================================
            END OF SETTINGS
           ========================================================================= */}
      </div>
    </Container>
  );
}


