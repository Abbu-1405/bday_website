import React from 'react';
import { Compass, BookOpen, Sparkles, Lock } from 'lucide-react';
import { Surface } from './Surface';
import { Badge } from './Badge';
import { cn } from '../utils';
import { getOverallProgress, getStageProgress } from '../services/discoveryService';
import { getStreakData } from '../services/streakService';
import { useTheme } from '../hooks';

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
        'flex flex-col justify-between space-y-6 transition-all',
        isLetterArchive && 'bg-[#FAF5EC] border border-[rgba(138,110,89,0.3)] shadow-[0_4px_20px_rgba(60,42,33,0.06)]',
        isMidnight && 'bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.25)] shadow-md',
        isWhimsical && 'bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.2)] shadow-sm',
        className
      )}
      {...props}
    >
      <div className="space-y-4">
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
              <span className="letter-script text-sm text-[#7A2E3B] block -mb-0.5 select-none">
                recorded folio
              </span>
            )}
            <h2 className={cn(
              "font-serif font-semibold tracking-tight text-h3",
              isLetterArchive ? "text-[#3B2A20]" : isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
            )}>
              Universe Explored
            </h2>
          </div>
          <Badge
            variant="success"
            size="sm"
            className={cn(
              "font-serif font-medium",
              isLetterArchive && "bg-[#7A2E3B]/10 text-[#7A2E3B] border border-[#7A2E3B]/25",
              isMidnight && "bg-[rgba(201,155,88,0.15)] text-[#E2BD78] border border-[rgba(201,155,88,0.3)]",
              isWhimsical && "bg-[rgba(216,184,106,0.15)] text-[#D8B86A] border border-[rgba(216,184,106,0.25)]"
            )}
          >
            {percentage}% Overall
          </Badge>
        </div>

        {/* Minimal Progress Bar */}
        <div className={cn(
          "w-full h-2.5 rounded-full overflow-hidden border",
          isLetterArchive && "bg-[#EDE2D2] border-[rgba(138,110,89,0.25)]",
          isMidnight && "bg-[rgba(16,27,45,0.9)] border-[rgba(201,155,88,0.25)]",
          isWhimsical && "bg-[rgba(20,38,25,0.9)] border-[rgba(216,184,106,0.2)]",
          !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface-secondary)] border-[var(--color-border-light)]"
        )}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isLetterArchive && "bg-[#7A2E3B]",
              isMidnight && "bg-gradient-to-r from-[#C99B58] to-[#E2BD78]",
              isWhimsical && "bg-gradient-to-r from-[#D8B86A] to-[#E5C97F]",
              !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-primary)]"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className={cn(
          "text-xs font-serif italic leading-relaxed",
          isLetterArchive ? "text-[#5C4A42]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
        )}>
          {overall.totalDiscovered > 0
            ? `You've discovered ${overall.totalDiscovered} of ${overall.totalUniverse} things waiting across your universe.`
            : 'Your universe is quiet and ready to be explored.'}
        </p>
      </div>

      {/* Progress stats list/grid */}
      <div className={cn(
        "grid grid-cols-1 gap-3 pt-3 border-t",
        isLetterArchive ? "border-[rgba(138,110,89,0.2)]" : isMidnight ? "border-[rgba(201,155,88,0.18)]" : "border-[var(--color-border-light)]"
      )}>
        <div className="flex items-center justify-between text-xs sm:text-sm font-serif">
          <span className={cn(
            "flex items-center gap-2",
            isLetterArchive ? "text-[#6B5547]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
          )}>
            <Compass className={cn(
              "h-4 w-4",
              isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-primary)]"
            )} />
            Sections Explored
          </span>
          <span className={cn(
            "font-semibold",
            isLetterArchive ? "text-[#3B2A20]" : isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
          )}>
            {sectionsExplored.current} / {sectionsExplored.total}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-serif">
          <span className={cn(
            "flex items-center gap-2",
            isLetterArchive ? "text-[#6B5547]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
          )}>
            <BookOpen className={cn(
              "h-4 w-4",
              isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C99B58]" : "text-[var(--color-secondary)]"
            )} />
            Notes Discovered
          </span>
          <span className={cn(
            "font-semibold",
            isLetterArchive ? "text-[#3B2A20]" : isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
          )}>
            {notesRead} / 365
          </span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-serif">
          <span className={cn(
            "flex items-center gap-2",
            isLetterArchive ? "text-[#6B5547]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
          )}>
            <Sparkles className={cn(
              "h-4 w-4",
              isLetterArchive ? "text-[#C2934D]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-accent)]"
            )} />
            Wish Lanterns
          </span>
          <span className={cn(
            "font-semibold",
            isLetterArchive ? "text-[#3B2A20]" : isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
          )}>
            {wishesCollectedCount} / 20
          </span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-serif">
          <span className={cn(
            "flex items-center gap-2",
            isLetterArchive ? "text-[#6B5547]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
          )}>
            <Lock className={cn(
              "h-4 w-4",
              isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C99B58]" : "text-[var(--color-warning)]"
            )} />
            Secret Vault
          </span>
          <span className={cn(
            "font-semibold",
            isLetterArchive ? "text-[#3B2A20]" : isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
          )}>
            {secretsUnlockedCount} / 7
          </span>
        </div>

        {streak.currentStreak > 0 && (
          <div className={cn(
            "flex items-center justify-between text-xs sm:text-sm font-serif pt-2 border-t",
            isLetterArchive
              ? "border-[rgba(138,110,89,0.2)] text-[#7A2E3B]"
              : isMidnight
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
    </Surface>
  );
};


