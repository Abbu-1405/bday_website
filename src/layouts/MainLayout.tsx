import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  FloatingNavigation,
  FloatingThemeButton,
  FloatingAuthButton,
  AudioButton,
  AchievementCelebrationModal,
  LetterArchiveBackground,
  VintageInkPot,
  NotificationPermissionModal,
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
import { useTheme, useAuth } from '../hooks';
import letterArchiveCursor from '../assets/icons/Letter-archive.cur';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const isWhimsical = theme === 'whimsical-scrapbook';
  const isMidnight = theme === 'midnight-journal';
  const isLetterArchive = theme === 'letter-archive';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [celebrationBadge, setCelebrationBadge] = useState<BadgeItem | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState<boolean>(false);
  const trackedUrlEventsRef = useRef<Set<string>>(new Set());

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

      {/* Letter Archive Dedicated Aged Parchment & Desk Atmosphere Background */}
      {isLetterArchive && <LetterArchiveBackground />}

      {/* Whimsical Theme Fixed Enchanted Forest SVG Background Artwork */}
      {isWhimsical && (
        <div
          id="whimsical-fixed-artwork-background"
          className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
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
        </div>
      )}

      {/* Midnight Journal Theme Atmospheric Painted Starry Night Sky Background */}
      {isMidnight && (
        <div
          id="midnight-journal-background"
          className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
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
        </div>
      )}

      {/* Top-Right Floating Controls Bar (Public pages only - Admin has dedicated header layout) */}
      {!isAdminRoute && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
          <FloatingAuthButton className="static" />
          <AudioButton className="static" />
          <FloatingThemeButton className="static" />
        </div>
      )}

      <main className="relative z-10">
        <Outlet />
      </main>
      {!isAdminRoute && <FloatingNavigation />}
      {!isAdminRoute && <VintageInkPot />}
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

