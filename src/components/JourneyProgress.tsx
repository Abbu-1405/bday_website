import React from 'react';
import { Compass, BookOpen, Sparkles, Lock, Mail, Heart } from 'lucide-react';
import { Surface } from './Surface';
import { Badge } from './Badge';
import { cn } from '../utils';
import { getOverallProgress, getStageProgress } from '../services/discoveryService';
import { getStreakData } from '../services/streakService';

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
      className={cn('flex flex-col justify-between space-y-6', className)}
      {...props}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-h3 font-serif text-[var(--color-text)]">
            Universe Explored
          </h2>
          <Badge variant="success" size="sm" className="font-serif">
            {percentage}% Overall
          </Badge>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full bg-[var(--color-surface-secondary)] h-2.5 rounded-full overflow-hidden border border-[var(--color-border-light)]">
          <div
            className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-xs font-serif text-[var(--color-text-secondary)] italic leading-relaxed">
          {overall.totalDiscovered > 0
            ? `You've discovered ${overall.totalDiscovered} of ${overall.totalUniverse} things waiting across your universe.`
            : 'Your universe is quiet and ready to be explored.'}
        </p>
      </div>

      {/* Progress stats list/grid */}
      <div className="grid grid-cols-1 gap-3 pt-2 border-t border-[var(--color-border-light)]">
        <div className="flex items-center justify-between text-xs sm:text-sm font-serif">
          <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
            <Compass className="h-4 w-4 text-[var(--color-primary)]" />
            Sections Explored
          </span>
          <span className="font-semibold text-[var(--color-text)]">
            {sectionsExplored.current} / {sectionsExplored.total}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-serif">
          <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[var(--color-secondary)]" />
            Notes Discovered
          </span>
          <span className="font-semibold text-[var(--color-text)]">
            {notesRead} / 365
          </span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-serif">
          <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
            Wish Lanterns
          </span>
          <span className="font-semibold text-[var(--color-text)]">
            {wishesCollectedCount} / 20
          </span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-serif">
          <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
            <Lock className="h-4 w-4 text-[var(--color-warning)]" />
            Secret Vault
          </span>
          <span className="font-semibold text-[var(--color-text)]">
            {secretsUnlockedCount} / 7
          </span>
        </div>

        {streak.currentStreak > 0 && (
          <div className="flex items-center justify-between text-xs sm:text-sm font-serif pt-1 border-t border-[var(--color-border-light)]/60 text-[var(--color-primary)]">
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


