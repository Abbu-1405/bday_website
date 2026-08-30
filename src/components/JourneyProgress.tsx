import React from 'react';
import { Compass, BookOpen, Sparkles, Lock } from 'lucide-react';
import { Surface } from './Surface';
import { Badge } from './Badge';
import { AnimatedProgressNumber } from './AnimatedProgressNumber';
import { cn } from '../utils';
import { getOverallProgress, getStageProgress } from '../services/discoveryService';
import { getStreakData } from '../services/streakService';
import { useTheme } from '../hooks';
import { VintageCornerFlourish, VintageArchivalStamp } from './letterArchive/LetterArchiveDecorations';

export interface JourneyProgressData {
  percentage?: number;
  sectionsExplored?: { current: number; total: number };
  notesRead?: number;
  memoriesVisited?: number;
}

export interface JourneyProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: JourneyProgressData;
}

export const JourneyProgress: React.FC<JourneyProgressProps> = ({
  className,
  data,
  ...props
}) => {
  const { theme } = useTheme();
  const isWhimsical = theme === 'whimsical-scrapbook';
  const isMidnight = theme === 'midnight-journal';
  const isLetterArchive = theme === 'letter-archive';

  const overall = getOverallProgress();
  const stages = getStageProgress();
  const streak = getStreakData();

  const notesReadCount = stages.find((s) => s.key === 'notes365')?.discovered ?? 0;
  const wishesCollectedCount = stages.find((s) => s.key === 'wishes')?.discovered ?? 0;
  const secretsUnlockedCount = stages.find((s) => s.key === 'secretVault')?.discovered ?? 0;
  const exploredSectionsCount = stages.filter((s) => s.state !== 'NOT STARTED').length;

  const percentage = data?.percentage ?? overall.percentage;
  const sectionsExplored = data?.sectionsExplored ?? { current: exploredSectionsCount, total: 7 };
  const notesRead = data?.notesRead ?? notesReadCount;

  return (
    <Surface
      variant="elevated"
      padding="lg"
      className={cn(
        'relative overflow-hidden flex flex-col justify-between space-y-5 transition-all',
        isLetterArchive && 'rounded-[18px] bg-[#FAF5EC] border border-[rgba(138,110,89,0.35)] shadow-[0_8px_26px_-4px_rgba(51,38,29,0.12),0_2px_6px_-1px_rgba(51,38,29,0.06)]',
        isMidnight && 'rounded-[20px] bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.25)] shadow-md',
        isWhimsical && 'rounded-[20px] bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.2)] shadow-sm',
        className
      )}
      {...props}
    >
      {/* Letter Archive Watermark Stamp & Corner Accents */}
      {isLetterArchive && (
        <>
          <VintageArchivalStamp
            size={115}
            className="absolute -bottom-6 -right-6 opacity-[0.14] pointer-events-none"
          />
          <VintageCornerFlourish
            position="top-right"
            size={24}
            className="absolute top-2 right-2 opacity-60 pointer-events-none"
          />
        </>
      )}

      <div className="space-y-3.5 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            {isWhimsical && (
              <span className="whimsical-subtitle text-xs text-[var(--color-accent-rose)] block -mb-0.5 select-none">
                the unfolded cosmos
              </span>
            )}
            {isMidnight && (
              <span className="midnight-subtitle text-xs text-[#E2BD78] block -mb-0.5 select-none">
                starlit map
              </span>
            )}
            {isLetterArchive && (
              <span className="text-[11px] font-serif uppercase tracking-[0.2em] text-[#8A6E59] block -mb-0.5 select-none font-semibold">
                ARCHIVE RECORD · STARLIT 1926
              </span>
            )}
            <h2 className={cn(
              "font-serif font-semibold tracking-tight text-h3",
              isLetterArchive ? "text-[#2B1E16] font-bold" : isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
            )}>
              Universe Explored
            </h2>
          </div>

          {isLetterArchive ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-serif uppercase tracking-wider font-semibold rounded-sm bg-[#F2E8DC] border border-[rgba(166,124,61,0.45)] text-[#7A2E3B] shadow-2xs">
              ✦ <AnimatedProgressNumber value={percentage} suffix="%" /> OVERALL
            </span>
          ) : (
            <Badge
              variant="success"
              size="sm"
              className={cn(
                "font-serif font-medium",
                isMidnight && "bg-[rgba(201,155,88,0.15)] text-[#E2BD78] border border-[rgba(201,155,88,0.3)]",
                isWhimsical && "bg-[rgba(216,184,106,0.15)] text-[#D8B86A] border border-[rgba(216,184,106,0.25)]"
              )}
            >
              <AnimatedProgressNumber value={percentage} suffix="%" /> Overall
            </Badge>
          )}
        </div>

        {/* Progress Display: Archival Measurement Ruler Line for Letter Archive, Modern Bar for other themes */}
        {isLetterArchive ? (
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-[11px] font-serif uppercase tracking-[0.14em] text-[#8A6E59]">
              <span>DISCOVERY PROGRESS</span>
              <span className="text-[#5C4435] font-semibold">
                {overall.totalDiscovered} / {overall.totalUniverse} RECORDED
              </span>
            </div>

            {/* Physical Archival Measurement Line */}
            <div className="relative w-full py-1.5">
              <div className="w-full h-[2px] bg-[#D8C7B0] rounded-full relative">
                {/* Ruled tick marks at 0%, 25%, 50%, 75%, 100% */}
                <div className="absolute left-0 -top-1 w-[1px] h-3 bg-[#8A6E59] opacity-70" />
                <div className="absolute left-1/4 -top-0.5 w-[1px] h-2 bg-[#8A6E59] opacity-40" />
                <div className="absolute left-1/2 -top-1 w-[1px] h-3 bg-[#8A6E59] opacity-70" />
                <div className="absolute left-3/4 -top-0.5 w-[1px] h-2 bg-[#8A6E59] opacity-40" />
                <div className="absolute right-0 -top-1 w-[1px] h-3 bg-[#8A6E59] opacity-70" />

                {/* Wine burgundy ink fill */}
                <div
                  className="h-[2px] bg-[#7A2E3B] transition-all duration-500 ease-out motion-reduce:transition-none relative"
                  style={{ width: `${percentage}%` }}
                >
                  {/* Antique Gold Compass / Star Pin Indicator */}
                  <div className="absolute -right-1.5 -top-[5px] w-3 h-3 rounded-full bg-[#FAF5EC] border-2 border-[#7A2E3B] flex items-center justify-center shadow-xs">
                    <div className="w-1 h-1 rounded-full bg-[#C2934D]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-serif text-[#8A6E59]">
              <span>0% Origin</span>
              <span>100% Complete</span>
            </div>
          </div>
        ) : (
          <div className={cn(
            "w-full h-2.5 rounded-full overflow-hidden border",
            isMidnight && "bg-[rgba(16,27,45,0.9)] border-[rgba(201,155,88,0.25)]",
            isWhimsical && "bg-[rgba(20,38,25,0.9)] border-[rgba(216,184,106,0.2)]",
            !isMidnight && !isWhimsical && "bg-[var(--color-surface-secondary)] border-[var(--color-border-light)]"
          )}>
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out motion-reduce:transition-none",
                isMidnight && "bg-gradient-to-r from-[#C99B58] to-[#E2BD78]",
                isWhimsical && "bg-gradient-to-r from-[#D8B86A] to-[#E5C97F]",
                !isMidnight && !isWhimsical && "bg-[var(--color-primary)]"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}

        <p className={cn(
          "text-xs font-serif italic leading-relaxed",
          isLetterArchive ? "text-[#4A352F]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
        )}>
          {overall.totalDiscovered > 0
            ? `You've discovered ${overall.totalDiscovered} of ${overall.totalUniverse} Artifacts waiting across your universe.`
            : 'Your universe is quiet and ready to be explored.'}
        </p>
      </div>

      {/* Progress stats: Archival Index Slips for Letter Archive, Linear List for other themes */}
      {isLetterArchive ? (
        <div className="space-y-2.5 pt-2 border-t border-[rgba(138,110,89,0.25)] relative z-10">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Index Slip 1: Sections */}
            <div className="p-2.5 rounded-sm bg-[#F7EFE2] border border-[rgba(138,110,89,0.32)] shadow-[0_2px_6px_rgba(60,42,33,0.04)] rotate-[-0.6deg] hover:rotate-0 transition-transform duration-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-serif uppercase tracking-wider text-[#8A6E59] font-medium flex items-center gap-1">
                  <Compass className="h-3 w-3 text-[#7A2E3B]" />
                  SECTIONS
                </span>
              </div>
              <p className="text-base font-serif font-bold text-[#2B1E16] leading-none">
                {sectionsExplored.current} <span className="text-xs font-normal text-[#8A6E59]">/ {sectionsExplored.total}</span>
              </p>
              <span className="text-[10px] font-serif italic text-[#8A6E59] block mt-0.5">
                folio domains
              </span>
            </div>

            {/* Index Slip 2: Notes */}
            <div className="p-2.5 rounded-sm bg-[#F7EFE2] border border-[rgba(138,110,89,0.32)] shadow-[0_2px_6px_rgba(60,42,33,0.04)] rotate-[0.8deg] hover:rotate-0 transition-transform duration-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-serif uppercase tracking-wider text-[#8A6E59] font-medium flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-[#7A2E3B]" />
                  NOTES
                </span>
              </div>
              <p className="text-base font-serif font-bold text-[#2B1E16] leading-none">
                {notesRead} <span className="text-xs font-normal text-[#8A6E59]">/ 365</span>
              </p>
              <span className="text-[10px] font-serif italic text-[#8A6E59] block mt-0.5">
                daily letters
              </span>
            </div>

            {/* Index Slip 3: Lanterns */}
            <div className="p-2.5 rounded-sm bg-[#F7EFE2] border border-[rgba(138,110,89,0.32)] shadow-[0_2px_6px_rgba(60,42,33,0.04)] rotate-[-0.5deg] hover:rotate-0 transition-transform duration-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-serif uppercase tracking-wider text-[#8A6E59] font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#C2934D]" />
                  LANTERNS
                </span>
              </div>
              <p className="text-base font-serif font-bold text-[#2B1E16] leading-none">
                {wishesCollectedCount} <span className="text-xs font-normal text-[#8A6E59]">/ 20</span>
              </p>
              <span className="text-[10px] font-serif italic text-[#8A6E59] block mt-0.5">
                starlit wishes
              </span>
            </div>

            {/* Index Slip 4: Secret Vault */}
            <div className="p-2.5 rounded-sm bg-[#F7EFE2] border border-[rgba(138,110,89,0.32)] shadow-[0_2px_6px_rgba(60,42,33,0.04)] rotate-[0.7deg] hover:rotate-0 transition-transform duration-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-serif uppercase tracking-wider text-[#8A6E59] font-medium flex items-center gap-1">
                  <Lock className="h-3 w-3 text-[#7A2E3B]" />
                  VAULT
                </span>
              </div>
              <p className="text-base font-serif font-bold text-[#2B1E16] leading-none">
                {secretsUnlockedCount} <span className="text-xs font-normal text-[#8A6E59]">/ 7</span>
              </p>
              <span className="text-[10px] font-serif italic text-[#8A6E59] block mt-0.5">
                hidden seals
              </span>
            </div>
          </div>

          {streak.currentStreak > 0 && (
            <div className="flex items-center justify-between text-xs font-serif pt-2 border-t border-[rgba(138,110,89,0.2)] text-[#7A2E3B]">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-[#C2934D]" />
                Active Streak Record
              </span>
              <span className="font-bold">
                {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className={cn(
          "grid grid-cols-1 gap-3 pt-3 border-t",
          isMidnight ? "border-[rgba(201,155,88,0.18)]" : "border-[var(--color-border-light)]"
        )}>
          <div className="flex items-center justify-between text-xs sm:text-sm font-serif">
            <span className={cn(
              "flex items-center gap-2",
              isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
            )}>
              <Compass className={cn(
                "h-4 w-4",
                isMidnight ? "text-[#E2BD78]" : "text-[var(--color-primary)]"
              )} />
              Sections Explored
            </span>
            <span className={cn(
              "font-semibold",
              isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
            )}>
              {sectionsExplored.current} / {sectionsExplored.total}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm font-serif">
            <span className={cn(
              "flex items-center gap-2",
              isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
            )}>
              <BookOpen className={cn(
                "h-4 w-4",
                isMidnight ? "text-[#C99B58]" : "text-[var(--color-secondary)]"
              )} />
              Notes Discovered
            </span>
            <span className={cn(
              "font-semibold",
              isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
            )}>
              {notesRead} / 365
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm font-serif">
            <span className={cn(
              "flex items-center gap-2",
              isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
            )}>
              <Sparkles className={cn(
                "h-4 w-4",
                isMidnight ? "text-[#E2BD78]" : "text-[var(--color-accent)]"
              )} />
              Wish Lanterns
            </span>
            <span className={cn(
              "font-semibold",
              isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
            )}>
              {wishesCollectedCount} / 20
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm font-serif">
            <span className={cn(
              "flex items-center gap-2",
              isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
            )}>
              <Lock className={cn(
                "h-4 w-4",
                isMidnight ? "text-[#C99B58]" : "text-[var(--color-warning)]"
              )} />
              Secret Vault
            </span>
            <span className={cn(
              "font-semibold",
              isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
            )}>
              {secretsUnlockedCount} / 7
            </span>
          </div>

          {streak.currentStreak > 0 && (
            <div className={cn(
              "flex items-center justify-between text-xs sm:text-sm font-serif pt-2 border-t",
              isMidnight
                ? "border-[rgba(201,155,88,0.18)] text-[#E2BD78]"
                : "border-[var(--color-border-light)]/60 text-[var(--color-primary)]"
            )}>
              <span className="flex items-center gap-2 font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                Active Streak
              </span>
              <span className="font-semibold">
                {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
          )}
        </div>
      )}
    </Surface>
  );
};



