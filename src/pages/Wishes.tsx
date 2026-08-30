import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Moon, Flame } from 'lucide-react';
import { Container, Surface, HiddenDiscoveryElement } from '../components';
import { BotanicalCorner, CloverStrip } from '../components/whimsical/WhimsicalDecorations';
import { Lantern, WishDetailModal, WishesAtmosphere } from '../components/wishes';
import { sampleWishes } from '../data';
import { Wish } from '../types';
import { useTheme, useStarlitCatBridge } from '../hooks';
import { useAudio } from '../contexts';
import { getManagedWishes } from '../services/contentService';
import { getCollectedWishIds, collectWish, resetCollectedWishes } from '../utils';
import '../components/wishes/wishes.css';

// Organic positioning, depth scale & continuous sky ascent parameters for all 20 lanterns
interface LanternFlightConfig {
  left: number; // percentage (0 - 100)
  scale: number;
  animClass: string;
  dur: number; // seconds
  delay: number; // seconds (negative for instant sky population)
}

// 20 Deterministically spaced organic sky lanes across natural depth tiers with distinct ascent trajectories
const LANTERN_FLIGHT_CONFIGS: LanternFlightConfig[] = [
  // 1. A Smile Every Day
  { left: 7,  scale: 0.94, animClass: 'lantern-ascent-1', dur: 21.5, delay: -4.8 },
  // 2. The Right People
  { left: 23, scale: 1.05, animClass: 'lantern-ascent-2', dur: 25.0, delay: -16.2 },
  // 3. Always Be Yourself
  { left: 45, scale: 0.88, animClass: 'lantern-ascent-3', dur: 18.0, delay: -8.4 },
  // 4. Strong Lady
  { left: 68, scale: 1.02, animClass: 'lantern-ascent-4', dur: 23.5, delay: -19.7 },
  // 5. Courage for Yourself
  { left: 88, scale: 0.90, animClass: 'lantern-ascent-5', dur: 26.0, delay: -11.3 },

  // 6. Beautiful Memories
  { left: 16, scale: 1.08, animClass: 'lantern-ascent-6', dur: 20.0, delay: -14.5 },
  // 7. Eat Without Worry
  { left: 35, scale: 0.96, animClass: 'lantern-ascent-7', dur: 24.5, delay: -2.1 },
  // 8. People Who Match You
  { left: 56, scale: 1.04, animClass: 'lantern-ascent-8', dur: 17.5, delay: -12.8 },
  // 9. Unexpected Happiness
  { left: 78, scale: 0.92, animClass: 'lantern-ascent-1', dur: 22.0, delay: -7.6 },
  // 10. Someone to Listen
  { left: 93, scale: 0.98, animClass: 'lantern-ascent-2', dur: 25.5, delay: -21.0 },

  // 11. Places You've Dreamed Of
  { left: 10, scale: 1.00, animClass: 'lantern-ascent-3', dur: 19.5, delay: -17.4 },
  // 12. Never Lose Your Silly Side
  { left: 29, scale: 0.86, animClass: 'lantern-ascent-4', dur: 24.0, delay: -5.5 },
  // 13. Choose Your Peace
  { left: 50, scale: 1.10, animClass: 'lantern-ascent-5', dur: 21.0, delay: -13.6 },
  // 14. Secret Wishes Come True
  { left: 72, scale: 0.94, animClass: 'lantern-ascent-6', dur: 26.5, delay: -1.2 },
  // 15. Things Going Your Way
  { left: 85, scale: 1.06, animClass: 'lantern-ascent-7', dur: 18.5, delay: -15.9 },

  // 16. "Life Baagundhi"
  { left: 19, scale: 0.96, animClass: 'lantern-ascent-8', dur: 23.0, delay: -9.3 },
  // 17. Little Things, Big Happiness
  { left: 40, scale: 1.03, animClass: 'lantern-ascent-1', dur: 19.0, delay: -22.4 },
  // 18. Never Forget How Far You've Come
  { left: 62, scale: 0.89, animClass: 'lantern-ascent-2', dur: 25.0, delay: -6.7 },
  // 19. Be Proud of Yourself
  { left: 81, scale: 1.07, animClass: 'lantern-ascent-3', dur: 22.5, delay: -18.1 },
  // 20. Life Be Kind to You
  { left: 95, scale: 0.93, animClass: 'lantern-ascent-4', dur: 20.5, delay: -10.0 },
];

export default function Wishes() {
  const [wishes, setWishes] = useState<Wish[]>(sampleWishes);
  const [collectedIds, setCollectedIds] = useState<string[]>(() => getCollectedWishIds());
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { theme } = useTheme();
  const { playWishChime, playMagicalClick } = useAudio();
  const { emitWish } = useStarlitCatBridge();
  const isWhimsical = theme === 'whimsical-scrapbook';

  useEffect(() => {
    emitWish('opened');
  }, [emitWish]);

  useEffect(() => {
    let isMounted = true;
    getManagedWishes().then((managedItems) => {
      if (isMounted) {
        setWishes(managedItems);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleOpenWish = (wish: Wish) => {
    playWishChime();
    const updated = collectWish(wish.id);
    setCollectedIds(updated);
    setSelectedWish(wish);
    emitWish('completed', wish.id);
  };

  const handleReset = () => {
    playMagicalClick();
    const cleared = resetCollectedWishes();
    setCollectedIds(cleared);
    setSelectedWish(null);
    emitWish('opened');
  };

  const collectedCount = collectedIds.length;
  const totalCount = wishes.length;
  const progressPercent = Math.round((collectedCount / totalCount) * 100);

  return (
    <Container size="lg" className="py-4 sm:py-8 space-y-4 sm:space-y-6 min-h-[calc(100vh-120px)] flex flex-col justify-between relative overflow-x-hidden">
      {/* 1. Magical Storybook Header Area */}
      <Surface
        variant="elevated"
        padding="md"
        className="relative overflow-hidden border border-[var(--color-border-light)] bg-[var(--color-surface)] text-[var(--color-text)] space-y-3 shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-colors"
      >
        {isWhimsical && <CloverStrip className="absolute top-0 left-0 right-0 -mt-1" />}

        {/* Ambient Top Light Beam */}
        <div
          aria-hidden="true"
          className="absolute -top-10 left-1/4 w-80 h-24 bg-[var(--color-primary)]/10 blur-3xl pointer-events-none"
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 sm:gap-4 pt-0.5 relative z-10">
          <div className="space-y-1.5 sm:space-y-2 text-center sm:text-left max-w-2xl">
            {/* Storybook Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-serif font-medium bg-[var(--color-surface-secondary)] text-[var(--color-primary)] border border-[var(--color-border-light)] shadow-xs">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[var(--color-primary)] shrink-0" />
              <span>Lantern Sanctuary</span>
              <HiddenDiscoveryElement
                secretId="secret-07"
                label="Examine starlit wish lotus"
                className="ml-1 text-[var(--color-primary)] hover:text-[var(--color-accent)]"
              />
            </div>

            {/* Storybook Display Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-medium text-[var(--color-text)] tracking-tight drop-shadow-xs">
              Wishes
            </h1>

            {/* Storybook Subtitle */}
            <p className="text-xs sm:text-base text-[var(--color-text-secondary)] font-serif leading-relaxed italic">
              Twenty glowing sky lanterns carrying quiet hopes into the night. Tap any lantern to reveal the wish within.
            </p>
          </div>

          {/* Constellation Progress Tracker & Reset */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
            <div className="flex items-center gap-2 sm:gap-2.5 bg-[var(--color-surface-secondary)] px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-[var(--color-border-light)] shadow-xs">
              <Flame className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              <span className="text-[11px] sm:text-xs font-serif text-[var(--color-text-secondary)]">
                Collected: <strong className="text-[var(--color-text)] font-bold">{collectedCount} / {totalCount}</strong>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-primary)] font-bold border border-[var(--color-border-light)]">
                {progressPercent}%
              </span>
            </div>

            {collectedCount > 0 && (
              <button
                type="button"
                id="wishes-reset-button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] font-serif transition-colors cursor-pointer px-2.5 py-1 rounded-md hover:bg-[var(--color-surface-secondary)] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                title="Reset collected wishes"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset Collection</span>
              </button>
            )}
          </div>
        </div>
      </Surface>

      {/* 2. Interactive Night Sky Lantern Garden Canvas */}
      <div
        id="wishes-sky-canvas"
        className="relative w-full min-h-[580px] sm:min-h-[720px] md:min-h-[780px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[var(--color-border-light)] shadow-xl select-none"
      >
        {/* Deep Atmospheric Night Sky Background & Twinkling Stars */}
        <WishesAtmosphere prefersReducedMotion={prefersReducedMotion} />

        {isWhimsical && (
          <>
            <BotanicalCorner position="bottom-left" className="absolute bottom-0 left-0 w-24 sm:w-28 h-24 sm:h-28 opacity-60 z-10 pointer-events-none" />
            <BotanicalCorner position="bottom-right" className="absolute bottom-0 right-0 w-24 sm:w-28 h-24 sm:h-28 opacity-60 z-10 pointer-events-none" />
          </>
        )}

        {/* Empty / Loading Atmosphere State */}
        {wishes.length === 0 && (
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-3">
            <Moon className="w-8 h-8 text-[var(--color-primary)] animate-pulse" />
            <p className="font-serif text-[var(--color-text-secondary)] italic text-sm sm:text-base">
              The night breeze is still... the sky lanterns will rise shortly.
            </p>
          </div>
        )}

        {/* Continuous Bottom-to-Top Flying Sky Lanterns Layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {wishes.map((wish, index) => {
            const isCollected = collectedIds.includes(wish.id);
            const config = LANTERN_FLIGHT_CONFIGS[index % LANTERN_FLIGHT_CONFIGS.length];

            // Static constellation positioning when prefers-reduced-motion is active
            const staticRow = Math.floor(index / 5);
            const staticCol = index % 5;
            const staticTop = prefersReducedMotion ? `${12 + staticRow * 22}%` : undefined;
            const staticLeft = prefersReducedMotion ? `${7 + staticCol * 21}%` : `${config.left}%`;

            return (
              <div
                key={wish.id}
                id={`wish-lantern-lane-${wish.id}`}
                className="absolute pointer-events-none"
                style={
                  prefersReducedMotion
                    ? {
                        top: staticTop,
                        left: staticLeft,
                        transform: 'translateX(-50%)',
                        pointerEvents: 'auto',
                      }
                    : {
                        top: 0,
                        bottom: 0,
                        left: `${config.left}%`,
                        width: '88px',
                        transform: 'translateX(-50%)',
                        pointerEvents: 'none',
                      }
                }
              >
                <div
                  className={prefersReducedMotion ? '' : config.animClass}
                  style={
                    prefersReducedMotion
                      ? undefined
                      : ({
                          height: '100%',
                          width: '100%',
                          '--flight-dur': `${config.dur}s`,
                          animationDuration: `${config.dur}s`,
                          animationDelay: `${config.delay}s`,
                          willChange: 'transform, opacity',
                        } as React.CSSProperties)
                  }
                >
                  <div
                    className="pointer-events-auto inline-block origin-top"
                    style={{ transform: `scale(${config.scale})` }}
                  >
                    <Lantern
                      wish={wish}
                      isCollected={isCollected}
                      onClick={handleOpenWish}
                      index={index}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Wish Detail Modal */}
      <WishDetailModal
        wish={selectedWish}
        isOpen={Boolean(selectedWish)}
        onClose={() => setSelectedWish(null)}
        onSelectWish={handleOpenWish}
        allWishes={wishes}
      />
    </Container>
  );
}
