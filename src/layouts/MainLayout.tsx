import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  FloatingNavigation,
  FloatingThemeButton,
  FloatingAuthButton,
  AudioButton,
  AchievementCelebrationModal,
  LetterArchiveBackground,
  LetterArchiveAmbience,
  MidnightAmbience,
  WhimsicalAmbience,
  VintageInkPot,
  NotificationPermissionModal,
  CatBackground,
  CatThemeElement,
  CatThemeTransition,
  CatInteractionEngine,
  CatAudioAutoplayPrompt,
  CatEasterEggToast,
  ScrollProgress,
  SneakPeekEntrance,
} from '../components';
import { MagicalWandCursor } from '../components/whimsical/MagicalWandCursor';
import { evaluateBadges } from '../services/badgeService';
import {
  syncNotificationTokenOnAuth,
  setupForegroundMessageListener,
  shouldPromptNotificationPermission,
  recordNotificationClick,
  recordNotificationTargetOpened,
} from '../services/notificationService';
import { BadgeItem } from '../types/achievements';
import { useTheme, useAuth, useUserTracking } from '../hooks';
import { StarlitCatEventBridge } from '../services/catInteraction/StarlitCatEventBridge';
import { CatAudioService } from '../services/catInteraction/CatAudioService';
import letterArchiveCursor from '../assets/icons/Letter-archive.cur';
import midnightJournalCursor from '../assets/icons/Midnight-journal.cur';

export const MainLayout: React.FC = () => {
  useUserTracking();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const isWhimsical = theme === 'whimsical-scrapbook';
  const isMidnight = theme === 'midnight-journal';
  const isLetterArchive = theme === 'letter-archive';
  const isCatMeme = theme === 'cat-meme';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSneakPeekRoute = location.pathname === '/sneak-peek';
  const [showSneakPeekEntrance, setShowSneakPeekEntrance] = useState<boolean>(() => {
    return !isAdminRoute && !isSneakPeekRoute;
  });
  const [celebrationBadge, setCelebrationBadge] = useState<BadgeItem | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState<boolean>(false);
  const [showCatTransition, setShowCatTransition] = useState<boolean>(false);
  const prevThemeRef = useRef<string>(theme);
  const trackedUrlEventsRef = useRef<Set<string>>(new Set());

  // Synchronize active Cat Meme theme with the centralized event bridge and audio service
  useEffect(() => {
    const isActive = isCatMeme && !isAdminRoute;
    StarlitCatEventBridge.setThemeActive(isActive);
    CatAudioService.getInstance().setThemeActive(isActive);
    return () => {
      if (!isCatMeme) {
        StarlitCatEventBridge.cleanup();
        CatAudioService.getInstance().setThemeActive(false);
      }
    };
  }, [isCatMeme, isAdminRoute]);

  // Trigger lightweight introductory transition when switching INTO One Brain Cell
  useEffect(() => {
    if (prevThemeRef.current !== 'cat-meme' && theme === 'cat-meme') {
      setShowCatTransition(true);
    }
    prevThemeRef.current = theme;
  }, [theme]);

  // Phase 4: Route transition observer
  useEffect(() => {
    if (isCatMeme && !isAdminRoute) {
      // Gentle page transition reaction attempt
      const timer = setTimeout(() => {
        StarlitCatEventBridge.emit('PAGE_TRANSITION', {
          sourceRoute: location.pathname,
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isCatMeme, isAdminRoute]);

  useEffect(() => {
    // Evaluate badges on mount and route change
    const { newlyUnlocked } = evaluateBadges();
    if (newlyUnlocked && newlyUnlocked.length > 0) {
      setCelebrationBadge(newlyUnlocked[0]);
    }
  }, [location.pathname]);

  // Sync notification token on auth and setup foreground message listener
  useEffect(() => {
    if (currentUser) {
      syncNotificationTokenOnAuth(currentUser);

      // Check if we should respectfully prompt the user for notifications
      if (shouldPromptNotificationPermission(currentUser)) {
        // Wait 3.5 seconds after page load so it's unobtrusive
        const timer = setTimeout(() => {
          setShowNotificationPrompt(true);
        }, 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    // Setup foreground message listener for active tab
    const unsubscribe = setupForegroundMessageListener((payload) => {
      console.log('[PUSH] Received in-app foreground notification:', payload);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Phase 7: Track notification clicks and target content opens via incoming URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const nid = searchParams.get('nid');
    const src = searchParams.get('src') || 'push_notification';

    if (nid && typeof nid === 'string' && nid.trim()) {
      const eventId = nid.trim();
      const trackingKey = `${eventId}_${src}`;
      if (trackedUrlEventsRef.current.has(trackingKey)) {
        return;
      }
      trackedUrlEventsRef.current.add(trackingKey);

      // 1. Non-blocking click recording
      recordNotificationClick(eventId, src).catch(() => {});

      // 2. Once destination page content is mounted/rendered, record target content opened
      const timer = setTimeout(() => {
        recordNotificationTargetOpened(eventId).catch(() => {});
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.search]);

  // Phase 7: Listen for direct Service Worker click postMessage notifications
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const handleServiceWorkerMessage = (event: MessageEvent) => {
        if (event.data?.type === 'STARLIT_NOTIFICATION_CLICK' && event.data.eventId) {
          const { eventId, source } = event.data;
          recordNotificationClick(eventId, source || 'push_notification').catch(() => {});
          setTimeout(() => {
            recordNotificationTargetOpened(eventId).catch(() => {});
          }, 400);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, []);

  return (
    <div
      className={`min-h-screen bg-[var(--color-background)] text-[var(--color-text)] relative selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-foreground)] ${
        !isAdminRoute ? 'pb-32 sm:pb-36' : 'pb-6'
      }`}
    >
      {/* Letter Archive Dedicated Scoped Cursor Style */}
      {isLetterArchive && (
        <style>{`
          @media (pointer: fine) {
            [data-theme="letter-archive"],
            .letter-archive-theme {
              cursor: url('${letterArchiveCursor}'), auto;
            }
          }
        `}</style>
      )}

      {/* Midnight Journal Dedicated Scoped Cursor Style */}
      {isMidnight && (
        <style>{`
          @media (pointer: fine) {
            [data-theme="midnight-journal"],
            .midnight-journal-theme,
            [data-theme="midnight-journal"] body {
              cursor: url('${midnightJournalCursor}'), auto;
            }
            [data-theme="midnight-journal"] a,
            [data-theme="midnight-journal"] button,
            [data-theme="midnight-journal"] [role="button"],
            [data-theme="midnight-journal"] input[type="submit"],
            [data-theme="midnight-journal"] input[type="button"],
            [data-theme="midnight-journal"] input[type="checkbox"],
            [data-theme="midnight-journal"] input[type="radio"],
            [data-theme="midnight-journal"] .cursor-pointer,
            .midnight-journal-theme a,
            .midnight-journal-theme button,
            .midnight-journal-theme [role="button"],
            .midnight-journal-theme input[type="submit"],
            .midnight-journal-theme input[type="button"],
            .midnight-journal-theme input[type="checkbox"],
            .midnight-journal-theme input[type="radio"],
            .midnight-journal-theme .cursor-pointer {
              cursor: url('${midnightJournalCursor}'), pointer;
            }
            [data-theme="midnight-journal"] input[type="text"],
            [data-theme="midnight-journal"] input[type="email"],
            [data-theme="midnight-journal"] input[type="password"],
            [data-theme="midnight-journal"] input[type="search"],
            [data-theme="midnight-journal"] input[type="number"],
            [data-theme="midnight-journal"] input[type="tel"],
            [data-theme="midnight-journal"] input[type="url"],
            [data-theme="midnight-journal"] textarea,
            [data-theme="midnight-journal"] [contenteditable="true"],
            .midnight-journal-theme input[type="text"],
            .midnight-journal-theme input[type="email"],
            .midnight-journal-theme input[type="password"],
            .midnight-journal-theme input[type="search"],
            .midnight-journal-theme input[type="number"],
            .midnight-journal-theme input[type="tel"],
            .midnight-journal-theme input[type="url"],
            .midnight-journal-theme textarea,
            .midnight-journal-theme [contenteditable="true"] {
              cursor: text;
            }
            [data-theme="midnight-journal"] select,
            .midnight-journal-theme select {
              cursor: pointer;
            }
            [data-theme="midnight-journal"] [disabled],
            [data-theme="midnight-journal"] .cursor-not-allowed,
            .midnight-journal-theme [disabled],
            .midnight-journal-theme .cursor-not-allowed {
              cursor: not-allowed;
            }
          }
        `}</style>
      )}

      {/* Letter Archive Dedicated Aged Parchment & Desk Atmosphere Background */}
      <div
        className={`fixed inset-0 pointer-events-none select-none z-0 overflow-hidden transition-opacity duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isLetterArchive ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        <LetterArchiveBackground />
        <LetterArchiveAmbience />
      </div>

      {/* Whimsical Theme Fixed Enchanted Forest SVG Background Artwork */}
      <div
        id="whimsical-fixed-artwork-background"
        className={`fixed inset-0 pointer-events-none select-none z-0 overflow-hidden transition-opacity duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isWhimsical ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        {/* Static SVG Artwork Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform-gpu"
          style={{
            backgroundImage: `url('/swirl-wallpaper-green.svg')`,
            backgroundAttachment: 'fixed',
          }}
        />
        {/* Atmospheric dark-green gradient overlay - keeps stars & spiral visible while softening behind UI */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(6, 14, 8, 0.52) 0%, rgba(8, 20, 11, 0.65) 45%, rgba(5, 11, 7, 0.82) 100%)',
          }}
        />
        {/* Subtle edge vignette for cinematic journal framing */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 32%, transparent 15%, rgba(6, 14, 8, 0.35) 65%, rgba(3, 8, 4, 0.78) 100%)',
          }}
        />
        {/* Faint warm starlight radial glow behind hero area */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[550px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(216, 184, 106, 0.055) 0%, transparent 65%)',
          }}
        />
        {/* Whimsical Scrapbook Ambient Atmospheric Layer */}
        <WhimsicalAmbience />
      </div>

      {/* Midnight Journal Theme Atmospheric Painted Starry Night Sky Background */}
      <div
        id="midnight-journal-background"
        className={`fixed inset-0 pointer-events-none select-none z-0 overflow-hidden transition-opacity duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMidnight ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        {/* Primary Full-Page Background: download (7).jpg */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/download (7).jpg'), url('/download-7.jpg'), url('/midnight-starry-bg.svg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Subtle Dark Navy Overlay (rgba(3, 7, 18, 0.35)) - Keeps artwork clearly visible while preserving UI contrast */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(3, 7, 18, 0.35)',
          }}
        />

        {/* Midnight Journal Ambient Atmospheric Layer */}
        <MidnightAmbience />
      </div>

      {/* One Brain Cell Cat Meme Theme Foundation Background */}
      <div
        className={`fixed inset-0 pointer-events-none select-none z-0 overflow-hidden transition-opacity duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isCatMeme ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        <CatBackground />
      </div>

      {/* One Brain Cell Cat Interaction Engine (Autonomous & Controlled Decorative Appearances) */}
      <CatInteractionEngine enabled={isCatMeme && !isAdminRoute} />

      {/* Top-Right Floating Controls Bar (Public pages only - Admin has dedicated header layout) */}
      {!isAdminRoute && !showSneakPeekEntrance && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
          <FloatingAuthButton className="static" />
          <AudioButton className="static" />
          <FloatingThemeButton className="static" />
        </div>
      )}

      <main
        className={`relative z-10 ${
          showSneakPeekEntrance ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        aria-hidden={showSneakPeekEntrance}
      >
        <Outlet />
      </main>
      {!isAdminRoute && !showSneakPeekEntrance && <FloatingNavigation />}
      {!isAdminRoute && !showSneakPeekEntrance && <VintageInkPot />}

      {/* Sneak a Peek Dedicated Entrance Overlay (Every website visit) */}
      {showSneakPeekEntrance && (
        <SneakPeekEntrance onComplete={() => setShowSneakPeekEntrance(false)} />
      )}

      {/* One Brain Cell Theme Placeholder Decorative Cat Element (Unobtrusive & Non-blocking) */}
      {isCatMeme && !isAdminRoute && (
        <CatThemeElement
          size="sm"
          position="bottom-left"
          className="opacity-75 mb-16 sm:mb-4 ml-2"
        />
      )}

      {/* One Brain Cell Lightweight Entry Transition */}
      {showCatTransition && (
        <CatThemeTransition onComplete={() => setShowCatTransition(false)} />
      )}

      {/* One Brain Cell Audio Autoplay Permission Prompt */}
      <CatAudioAutoplayPrompt enabled={isCatMeme && !isAdminRoute} />

      {/* One Brain Cell Easter Egg Discovery Notification Toast */}
      <CatEasterEggToast enabled={isCatMeme && !isAdminRoute} />

      {/* Subtle Integrated Scroll Progress Indicator */}
      <ScrollProgress />

      <AchievementCelebrationModal
        badge={celebrationBadge}
        onClose={() => setCelebrationBadge(null)}
      />
      <NotificationPermissionModal
        isOpen={showNotificationPrompt}
        onClose={() => setShowNotificationPrompt(false)}
      />
      <MagicalWandCursor />
    </div>
  );
};

