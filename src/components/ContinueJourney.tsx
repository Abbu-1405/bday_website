import React from 'react';
import { Compass, Clock, BookOpen, RotateCcw } from 'lucide-react';
import { Surface } from './Surface';
import { Badge } from './Badge';
import { Button } from './Button';
import { cn } from '../utils';
import { getCurrentExploration, getOverallProgress } from '../services/discoveryService';
import { useTheme } from '../hooks';

export interface ContinueJourneyProps extends React.HTMLAttributes<HTMLDivElement> {
  lastSection?: string;
  lastItem?: string;
  lastVisit?: string;
  previewText?: string;
  onResume?: () => void;
  onStartFromHome?: () => void;
}

export const ContinueJourney: React.FC<ContinueJourneyProps> = ({
  className,
  lastSection,
  lastItem,
  lastVisit,
  previewText,
  onResume,
  onStartFromHome,
  ...props
}) => {
  const { theme } = useTheme();
  const isWhimsical = theme === 'whimsical-scrapbook';
  const overall = getOverallProgress();
  const currentExp = getCurrentExploration();

  const isFirstVisit = overall.totalDiscovered === 0;

  const displaySection =
    lastSection || (isFirstVisit ? '365 Notes' : currentExp?.title || '365 Notes');

  const displayItem =
    lastItem ||
    (isFirstVisit
      ? 'Chapter 1: Daily Reflections'
      : currentExp
      ? `${currentExp.discovered} of ${currentExp.total} discovered`
      : 'Active Chapter');

  const displayVisit =
    lastVisit || (isFirstVisit ? 'Your First Step' : 'Active Chapter');

  const displayPreview =
    previewText ||
    (isFirstVisit
      ? 'A quiet starlit space filled with 365 daily reflections, waiting to be opened one day at a time...'
      : currentExp?.description || 'Your journey continues in this quiet starlit space...');

  const buttonText = isFirstVisit ? 'Begin Exploring' : 'Resume Journey';

  return (
    <section className={cn('space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
          {isWhimsical && (
            <span className="whimsical-subtitle text-xs text-[var(--color-accent-rose)] block -mb-1 select-none">
              your ongoing path
            </span>
          )}
          <h2 className="text-h3 font-serif text-[var(--color-text)]">
            {isFirstVisit ? 'Begin Your Journey' : 'Continue Journey'}
          </h2>
        </div>
        <span className="text-xs text-[var(--color-muted)] flex items-center gap-1 font-serif">
          <Clock className="h-3.5 w-3.5" />
          {displayVisit}
        </span>
      </div>

      <Surface
        variant="elevated"
        padding="lg"
        className={cn(
          "space-y-5",
          isWhimsical && "rounded-[20px] bg-[rgba(8,20,11,0.70)] border-[rgba(240,230,190,0.12)] shadow-xs"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[var(--color-border-light)]">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "p-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-light)] text-[var(--color-primary)]",
              isWhimsical && "bg-[rgba(12,26,15,0.75)] border-[rgba(240,230,190,0.12)] text-[var(--color-accent)]"
            )}>
              <BookOpen className="h-4 w-4 shrink-0" />
            </div>
            <div>
              <p className={cn(
                "text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider font-serif",
                isWhimsical && "whimsical-label text-xs text-[var(--color-accent-soft-gold)] normal-case"
              )}>
                {displaySection}
              </p>
              <h3 className="text-body-lg font-semibold text-[var(--color-text)] font-serif">
                {displayItem}
              </h3>
            </div>
          </div>
          <Badge variant="primary" size="sm" className="self-start sm:self-auto shrink-0 font-serif">
            {isFirstVisit ? 'Suggested Start' : 'Active Chapter'}
          </Badge>
        </div>

        <p className="text-body text-[var(--color-text-secondary)] italic font-serif leading-relaxed">
          &ldquo;{displayPreview}&rdquo;
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <Button
            variant="primary"
            size="md"
            onClick={onResume || (() => {})}
            leftIcon={<Compass className="h-4 w-4" />}
            className="w-full sm:w-auto font-serif"
          >
            {buttonText}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={onStartFromHome || (() => {})}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className="w-full sm:w-auto font-serif"
          >
            Explore All Chapters
          </Button>
        </div>
      </Surface>
    </section>
  );
};

