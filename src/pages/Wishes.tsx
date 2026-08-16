import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Moon, Flame } from 'lucide-react';
import { Container, Surface, HiddenDiscoveryElement } from '../components';
import { BotanicalCorner, CloverStrip } from '../components/whimsical/WhimsicalDecorations';
import { Lantern, WishDetailModal, WishesAtmosphere } from '../components/wishes';
import { sampleWishes } from '../data';
import { Wish } from '../types';
import { useTheme } from '../hooks';
import { useAudio } from '../contexts';
import { getManagedWishes } from '../services/contentService';
import { getCollectedWishIds, collectWish, resetCollectedWishes } from '../utils';
import '../components/wishes/wishes.css';

// Organic positioning, depth scale & continuous sky flight parameters for all 20 lanterns
interface LanternLayoutConfig {
  left: number; // percentage (0 - 100)
  top: number;  // percentage (0 - 100)
  scale: number;
  animClass: string;
  dur: number; // seconds
  delay: number; // seconds
}

// 20 Deterministically spaced organic sky coordinates across natural depth tiers with distinct flight trajectories
const DESKTOP_LANTERN_CONFIGS: LanternLayoutConfig[] = [
  // Upper Canopy (Distant & mid-distant lanterns floating high in the night breeze)
  { left: 6,  top: 7,  scale: 0.90, animClass: 'lantern-flight-1', dur: 22, delay: -4.2 },
  { left: 24, top: 13, scale: 1.06, animClass: 'lantern-flight-2', dur: 26, delay: -9.8 },
  { left: 47, top: 6,  scale: 0.88, animClass: 'lantern-flight-3', dur: 19, delay: -15.3 },
  { left: 70, top: 12, scale: 1.02, animClass: 'lantern-flight-4', dur: 28, delay: -7.1 },
  { left: 89, top: 7,  scale: 0.86, animClass: 'lantern-flight-5', dur: 24, delay: -18.4 },

  // Mid-Upper Sky
  { left: 14, top: 28, scale: 1.08, animClass: 'lantern-flight-6', dur: 27, delay: -12.6 },
  { left: 36, top: 24, scale: 0.94, animClass: 'lantern-flight-1', dur: 25, delay: -5.0 },
  { left: 58, top: 30, scale: 1.10, animClass: 'lantern-flight-2', dur: 21, delay: -16.2 },
  { left: 81, top: 25, scale: 0.90, animClass: 'lantern-flight-4', dur: 29, delay: -10.5 },

  // Mid-Lower Sky
  { left: 5,  top: 51, scale: 0.96, animClass: 'lantern-flight-3', dur: 23, delay: -14.1 },
  { left: 26, top: 47, scale: 0.90, animClass: 'lantern-flight-5', dur: 30, delay: -3.3 },
  { left: 48, top: 53, scale: 1.06, animClass: 'lantern-flight-6', dur: 22, delay: -19.7 },
  { left: 69, top: 48, scale: 0.95, animClass: 'lantern-flight-1', dur: 27, delay: -8.4 },
  { left: 91, top: 50, scale: 1.04, animClass: 'lantern-flight-2', dur: 24, delay: -13.9 },

  // Lower Horizon (Warm ascending lanterns rising from the ground)
  { left: 15, top: 73, scale: 1.02, animClass: 'lantern-flight-4', dur: 20, delay: -6.5 },
  { left: 35, top: 70, scale: 0.88, animClass: 'lantern-flight-3', dur: 28, delay: -16.8 },
  { left: 56, top: 76, scale: 1.08, animClass: 'lantern-flight-5', dur: 23, delay: -2.1 },
  { left: 78, top: 71, scale: 0.92, animClass: 'lantern-flight-6', dur: 26, delay: -11.4 },
  { left: 43, top: 89, scale: 1.00, animClass: 'lantern-flight-1', dur: 21, delay: -20.2 },
  { left: 86, top: 87, scale: 0.94, animClass: 'lantern-flight-4', dur: 29, delay: -9.1 },
];

const MOBILE_LANTERN_ANIM_CLASSES = [
  'lantern-flight-mobile-1',
  'lantern-flight-mobile-2',
  'lantern-flight-mobile-3',
  'lantern-flight-mobile-4',
];

export default function Wishes() {
  const [wishes, setWishes] = useState<Wish[]>(sampleWishes);
  const [collectedIds, setCollectedIds] = useState<string[]>(() => getCollectedWishIds());
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { theme } = useTheme();
  const { playWishChime, playMagicalClick } = useAudio();
  const isWhimsical = theme === 'whimsical-scrapbook';

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
  };

  const handleReset = () => {
    playMagicalClick();
    const cleared = resetCollectedWishes();
    setCollectedIds(cleared);
    setSelectedWish(null);
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
        className="relative overflow-hidden border border-amber-400/20 bg-[#0E1224]/85 text-[#F5EEDC] space-y-3 shadow-xl backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6"
      >
        {isWhimsical && <CloverStrip className="absolute top-0 left-0 right-0 -mt-1" />}

        {/* Ambient Top Light Beam */}
        <div
          aria-hidden="true"
          className="absolute -top-10 left-1/4 w-80 h-24 bg-amber-400/10 blur-3xl pointer-events-none"
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 sm:gap-4 pt-0.5 relative z-10">
          <div className="space-y-1.5 sm:space-y-2 text-center sm:text-left max-w-2xl">
            {/* Storybook Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-serif font-medium bg-amber-400/10 text-amber-200 border border-amber-400/30 shadow-xs">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-300" />
              <span>Lantern Sanctuary</span>
              <HiddenDiscoveryElement
                secretId="secret-07"
                label="Examine starlit wish lotus"
                className="ml-1 text-amber-300 hover:text-amber-100"
              />
            </div>

            {/* Storybook Display Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-medium text-[#FFF9EB] tracking-tight drop-shadow-md">
              Wishes
            </h1>

            {/* Storybook Subtitle */}
            <p className="text-xs sm:text-base text-amber-200/80 font-serif leading-relaxed italic">
              Twenty glowing sky lanterns carrying quiet hopes into the night. Tap any lantern to reveal the wish within.
            </p>
          </div>

          {/* Constellation Progress Tracker & Reset */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
            <div className="flex items-center gap-2 sm:gap-2.5 bg-[#151B33]/80 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-amber-400/25 shadow-xs">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] sm:text-xs font-serif text-amber-200/90">
                Collected: <strong className="text-[#FFF9EB] font-bold">{collectedCount} / {totalCount}</strong>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                {progressPercent}%
              </span>
            </div>

            {collectedCount > 0 && (
              <button
                type="button"
                id="wishes-reset-button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-amber-300/70 hover:text-amber-200 font-serif transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-amber-400/10 touch-manipulation"
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
        className="relative w-full min-h-[580px] sm:min-h-[720px] md:min-h-[780px] rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-400/20 shadow-2xl select-none"
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
            <Moon className="w-8 h-8 text-amber-300/70 animate-pulse" />
            <p className="font-serif text-amber-200/80 italic text-sm sm:text-base">
              The night breeze is still... the sky lanterns will rise shortly.
            </p>
          </div>
        )}

        {/* --- DESKTOP & TABLET ORGANIC SKY VIEW (sm and larger) --- */}
        <div className="hidden sm:block absolute inset-0">
          {wishes.map((wish, index) => {
            const isCollected = collectedIds.includes(wish.id);
            const config = DESKTOP_LANTERN_CONFIGS[index % DESKTOP_LANTERN_CONFIGS.length];

            return (
              <div
                key={wish.id}
                id={`wish-lantern-wrapper-${wish.id}`}
                className="absolute z-10"
                style={
                  {
                    left: `${config.left}%`,
                    top: `${config.top}%`,
                    transform: `scale(${config.scale})`,
                  } as React.CSSProperties
                }
              >
                <div
                  className={prefersReducedMotion ? '' : config.animClass}
                  style={
                    {
                      '--flight-dur': `${config.dur}s`,
                      animationDuration: `${config.dur}s`,
                      animationDelay: `${config.delay}s`,
                      willChange: prefersReducedMotion ? 'auto' : 'transform',
                    } as React.CSSProperties
                  }
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
            );
          })}
        </div>

        {/* --- MOBILE RECOMPOSED SKY VIEW (< 640px) --- */}
        {/* Fluid, organic multi-column layout with comfortable touch spacing to avoid overlaps */}
        <div className="sm:hidden relative z-10 p-3 py-6 grid grid-cols-2 gap-x-2 gap-y-7 place-items-center">
          {wishes.map((wish, index) => {
            const isCollected = collectedIds.includes(wish.id);
            const isEven = index % 2 === 0;
            const staggerOffset = isEven ? -6 : 6;
            const animVariant = MOBILE_LANTERN_ANIM_CLASSES[index % MOBILE_LANTERN_ANIM_CLASSES.length];
            const dur = 18 + (index % 5) * 2.5; // 18s - 28s
            const delay = -((index * 3.1) % 20);

            return (
              <div
                key={`mobile-${wish.id}`}
                id={`mobile-lantern-wrapper-${wish.id}`}
                className="flex items-center justify-center p-1"
                style={
                  {
                    transform: `translateY(${staggerOffset}px) scale(0.92)`,
                  } as React.CSSProperties
                }
              >
                <div
                  className={prefersReducedMotion ? '' : animVariant}
                  style={
                    {
                      '--flight-dur': `${dur}s`,
                      animationDuration: `${dur}s`,
                      animationDelay: `${delay}s`,
                      willChange: prefersReducedMotion ? 'auto' : 'transform',
                    } as React.CSSProperties
                  }
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
