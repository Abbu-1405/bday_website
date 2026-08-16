import React from 'react';
import { Calendar, Flame, Sparkles } from 'lucide-react';
import { StreakData } from '../types/achievements';
import { Surface, Badge } from '../components';

interface StreakPresentationProps {
  streak: StreakData;
  className?: string;
}

export const StreakPresentation: React.FC<StreakPresentationProps> = ({
  streak,
  className,
}) => {
  return (
    <Surface
      variant="card"
      padding="md"
      className={`border border-[var(--color-border-light)] bg-[var(--color-card)] space-y-3 shadow-xs ${className || ''}`}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[var(--color-surface-secondary)] text-[var(--color-primary)]">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-body font-serif font-bold text-[var(--color-text)]">
              QUIET DEDICATION
            </h3>
            <p className="text-[11px] font-serif text-[var(--color-text-secondary)]">
              Days spent reflecting in our quiet starlit space.
            </p>
          </div>
        </div>

        <Badge variant="secondary" size="sm" className="font-serif">
          <Sparkles className="h-3 w-3 mr-1 text-[var(--color-primary)]" />
          Visit Log
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-1">
          <span className="text-[10px] font-mono tracking-wider text-[var(--color-text-secondary)] uppercase block">
            CURRENT STREAK
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-h2 font-serif font-bold text-[var(--color-primary)]">
              {streak.currentStreak}
            </span>
            <span className="text-xs font-serif text-[var(--color-text-secondary)]">
              {streak.currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-1">
          <span className="text-[10px] font-mono tracking-wider text-[var(--color-text-secondary)] uppercase block">
            LONGEST STREAK
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-h2 font-serif font-bold text-[var(--color-text)]">
              {streak.longestStreak}
            </span>
            <span className="text-xs font-serif text-[var(--color-text-secondary)]">
              {streak.longestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </div>
    </Surface>
  );
};
