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
  const isMidnight = theme === 'midnight-journal';
  const isLetterArchive = theme === 'letter-archive';

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
            <span className="whimsical-subtitle text-xs text-[var(--color-accent-rose)] block -mb-0.5 select-none">
              your ongoing path
            </span>
          )}
          {isMidnight && (
            <span className="midnight-subtitle text-xs text-[#E2BD78] block -mb-0.5 select-none">
              celestial trail
            </span>
          )}
          {isLetterArchive && (
            <span className="letter-script text-sm text-[#7A2E3B] block -mb-0.5 select-none">
              the open volume
            </span>
          )}
          <h2 className={cn(
            "font-serif text-[var(--color-text)] font-semibold tracking-tight",
            isLetterArchive ? "text-[#3B2A20] text-h3" : isMidnight ? "text-[#F2E4CF] text-h3" : "text-h3"
          )}>
            {isFirstVisit ? 'Begin Your Journey' : 'Continue Journey'}
          </h2>
        </div>
        <span className={cn(
          "text-xs flex items-center gap-1.5 font-serif",
          isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-muted)]"
        )}>
          <Clock className="h-3.5 w-3.5" />
          {displayVisit}
        </span>
      </div>

      <Surface
        variant="elevated"
        padding="lg"
        className={cn(
          "space-y-5 transition-all",
          isWhimsical && "rounded-[20px] bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.2)] shadow-sm",
          isMidnight && "rounded-[20px] bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.25)] shadow-md",
          isLetterArchive && "rounded-[20px] bg-[#FAF5EC] border border-[rgba(138,110,89,0.3)] shadow-[0_4px_20px_rgba(60,42,33,0.06)]"
        )}
      >
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b",
          isLetterArchive ? "border-[rgba(138,110,89,0.2)]" : isMidnight ? "border-[rgba(201,155,88,0.18)]" : "border-[var(--color-border-light)]"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-full shrink-0 transition-colors",
              isLetterArchive && "bg-[#F2E8DC] border border-[rgba(138,110,89,0.3)] text-[#7A2E3B]",
              isMidnight && "bg-[rgba(16,27,45,0.9)] border border-[rgba(201,155,88,0.3)] text-[#E2BD78]",
              isWhimsical && "bg-[rgba(20,38,25,0.9)] border border-[rgba(216,184,106,0.25)] text-[#D8B86A]",
              !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface)] border border-[var(--color-border-light)] text-[var(--color-primary)]"
            )}>
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className={cn(
                "text-xs font-medium font-serif uppercase tracking-wider",
                isLetterArchive && "text-[#8A6E59]",
                isMidnight && "text-[#C2AF99]",
                isWhimsical && "whimsical-label text-xs text-[var(--color-accent-soft-gold)] normal-case"
              )}>
                {displaySection}
              </p>
              <h3 className={cn(
                "text-base sm:text-lg font-semibold font-serif",
                isLetterArchive && "text-[#3B2A20]",
                isMidnight && "text-[#F2E4CF]",
                isWhimsical && "text-[var(--color-text)]"
              )}>
                {displayItem}
              </h3>
            </div>
          </div>
          <Badge
            variant="primary"
            size="sm"
            className={cn(
              "self-start sm:self-auto shrink-0 font-serif font-medium",
              isLetterArchive && "bg-[#7A2E3B]/10 text-[#7A2E3B] border border-[#7A2E3B]/30",
              isMidnight && "bg-[rgba(201,155,88,0.15)] text-[#E2BD78] border border-[rgba(201,155,88,0.3)]",
              isWhimsical && "bg-[rgba(216,184,106,0.15)] text-[#D8B86A] border border-[rgba(216,184,106,0.3)]"
            )}
          >
            {isFirstVisit ? 'Suggested Start' : 'Active Chapter'}
          </Badge>
        </div>

        <p className={cn(
          "text-sm font-serif italic leading-relaxed",
          isLetterArchive ? "text-[#5C4A42]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
        )}>
          &ldquo;{displayPreview}&rdquo;
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <Button
            variant="primary"
            size="md"
            onClick={onResume || (() => {})}
            leftIcon={<Compass className="h-4 w-4" />}
            className={cn(
              "w-full sm:w-auto font-serif shadow-xs",
              isLetterArchive && "bg-[#7A2E3B] hover:bg-[#64242F] text-[#FFF9F0]",
              isMidnight && "bg-[#C99B58] hover:bg-[#D8AE6B] text-[#070E1A]",
              isWhimsical && "bg-[#D8B86A] hover:bg-[#E5C97F] text-[#0A160D]"
            )}
          >
            {buttonText}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={onStartFromHome || (() => {})}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className={cn(
              "w-full sm:w-auto font-serif",
              isLetterArchive && "border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#F2E8DC] hover:text-[#3B2A20]",
              isMidnight && "border-[rgba(201,155,88,0.3)] text-[#C2AF99] hover:bg-[rgba(201,155,88,0.15)] hover:text-[#F2E4CF]",
              isWhimsical && "border-[rgba(216,184,106,0.3)] text-[#B8C0AE] hover:bg-[rgba(79,107,72,0.3)] hover:text-[#F7F1DF]"
            )}
          >
            Explore All Chapters
          </Button>
        </div>
      </Surface>
    </section>
  );
};

