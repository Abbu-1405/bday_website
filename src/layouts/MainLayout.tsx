import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  FloatingNavigation,
  FloatingThemeButton,
  FloatingAuthButton,
  AudioButton,
  AchievementCelebrationModal,
  LetterArchiveBackground,
} from '../components';
import { MagicalWandCursor } from '../components/whimsical/MagicalWandCursor';
import { evaluateBadges } from '../services/badgeService';
import { BadgeItem } from '../types/achievements';
import { useTheme } from '../hooks';
import letterArchiveCursor from '../assets/icons/Letter-archive.cur';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const isWhimsical = theme === 'whimsical-scrapbook';
  const isMidnight = theme === 'midnight-journal';
  const isLetterArchive = theme === 'letter-archive';
  const [celebrationBadge, setCelebrationBadge] = useState<BadgeItem | null>(null);

  useEffect(() => {
    // Evaluate badges on mount and route change
    const { newlyUnlocked } = evaluateBadges();
    if (newlyUnlocked && newlyUnlocked.length > 0) {
      setCelebrationBadge(newlyUnlocked[0]);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] relative pb-32 sm:pb-36 selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-foreground)]">
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

      {/* Top-Right Floating Controls Bar */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <FloatingAuthButton className="static" />
        <AudioButton className="static" />
        <FloatingThemeButton className="static" />
      </div>

      <main className="relative z-10">
        <Outlet />
      </main>
      <FloatingNavigation />
      <AchievementCelebrationModal
        badge={celebrationBadge}
        onClose={() => setCelebrationBadge(null)}
      />
      <MagicalWandCursor />
    </div>
  );
};

