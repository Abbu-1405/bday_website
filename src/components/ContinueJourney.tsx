import React from 'react';
import { Compass, Clock, BookOpen, RotateCcw } from 'lucide-react';
import { Surface } from './Surface';
import { Badge } from './Badge';
import { Button } from './Button';
import { cn } from '../utils';
import { getCurrentExploration, getOverallProgress } from '../services/discoveryService';
import { useTheme } from '../hooks';
import { VintageCornerFlourish, VintageWaxSeal } from './letterArchive/LetterArchiveDecorations';

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
            <span className="text-[11px] font-serif uppercase tracking-[0.2em] text-[#8A6E59] block -mb-0.5 select-none font-semibold">
              ARCHIVE FOLIO · VII
            </span>
          )}
          <h2 className={cn(
            "font-serif text-[var(--color-text)] font-semibold tracking-tight",
            isLetterArchive ? "text-[#2B1E16] text-h3 font-bold" : isMidnight ? "text-[#F2E4CF] text-h3" : "text-h3"
          )}>
            {isFirstVisit ? 'Begin Your Journey' : 'Continue Journey'}
          </h2>
        </div>
        <span className={cn(
          "text-xs flex items-center gap-1.5 font-serif",
          isLetterArchive ? "text-[#8A6E59] font-medium" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-muted)]"
        )}>
          <Clock className="h-3.5 w-3.5" />
          {displayVisit}
        </span>
      </div>

      <Surface
        variant="elevated"
        padding="lg"
        className={cn(
          "relative overflow-hidden space-y-5 transition-all",
          isWhimsical && "rounded-[20px] bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.2)] shadow-sm",
          isMidnight && "rounded-[20px] bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.25)] shadow-md",
          isLetterArchive && "rounded-[18px] bg-[#FAF5EC] border border-[rgba(138,110,89,0.35)] shadow-[0_8px_26px_-4px_rgba(51,38,29,0.12),0_2px_6px_-1px_rgba(51,38,29,0.06)]"
        )}
      >
        {/* Letter Archive Decorative Details & Corner Brackets */}
        {isLetterArchive && (
          <>
            <VintageCornerFlourish
              position="top-left"
              size={26}
              className="absolute top-2 left-2 opacity-65 pointer-events-none"
            />
            <VintageCornerFlourish
              position="bottom-right"
              size={22}
              className="absolute bottom-2 right-2 opacity-45 pointer-events-none"
            />
            {/* Subtle paper fold crease mark */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,253,247,0.7)] to-transparent pointer-events-none" />
          </>
        )}

        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b relative z-10",
          isLetterArchive ? "border-[rgba(138,110,89,0.25)]" : isMidnight ? "border-[rgba(201,155,88,0.18)]" : "border-[var(--color-border-light)]"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-full shrink-0 transition-colors shadow-2xs",
              isLetterArchive && "bg-[#F2E8DC] border border-[rgba(138,110,89,0.35)] text-[#7A2E3B]",
              isMidnight && "bg-[rgba(16,27,45,0.9)] border border-[rgba(201,155,88,0.3)] text-[#E2BD78]",
              isWhimsical && "bg-[rgba(20,38,25,0.9)] border border-[rgba(216,184,106,0.25)] text-[#D8B86A]",
              !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface)] border border-[var(--color-border-light)] text-[var(--color-primary)]"
            )}>
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className={cn(
                "text-xs font-medium font-serif uppercase tracking-wider",
                isLetterArchive && "text-[#8A6E59] tracking-[0.14em] text-[11px]",
                isMidnight && "text-[#C2AF99]",
                isWhimsical && "whimsical-label text-xs text-[var(--color-accent-soft-gold)] normal-case"
              )}>
                {displaySection}
              </p>
              <h3 className={cn(
                "text-base sm:text-lg font-semibold font-serif",
                isLetterArchive && "text-[#2B1E16] font-bold",
                isMidnight && "text-[#F2E4CF]",
                isWhimsical && "text-[var(--color-text)]"
              )}>
                {displayItem}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            {isLetterArchive && (
              <VintageWaxSeal size={36} className="hidden sm:inline-flex opacity-95" />
            )}
            {isLetterArchive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-serif uppercase tracking-wider font-semibold rounded-sm bg-[#F2E8DC] border border-[rgba(166,124,61,0.45)] text-[#7A2E3B] shadow-[0_1px_3px_rgba(60,42,33,0.06)]">
                ✦ {isFirstVisit ? 'SUGGESTED START' : 'ACTIVE FOLIO'}
              </span>
            ) : (
              <Badge
                variant="primary"
                size="sm"
                className={cn(
                  "font-serif font-medium",
                  isMidnight && "bg-[rgba(201,155,88,0.15)] text-[#E2BD78] border border-[rgba(201,155,88,0.3)]",
                  isWhimsical && "bg-[rgba(216,184,106,0.15)] text-[#D8B86A] border border-[rgba(216,184,106,0.3)]"
                )}
              >
                {isFirstVisit ? 'Suggested Start' : 'Active Chapter'}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-1.5 relative z-10">
          <p className={cn(
            "text-sm font-serif italic leading-relaxed",
            isLetterArchive ? "text-[#4A352F] border-l-2 border-[#7A2E3B]/30 pl-3.5 py-0.5" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
          )}>
            &ldquo;{displayPreview}&rdquo;
          </p>
          {isLetterArchive && (
            <p className="font-handwritten text-[#7A2E3B] text-sm italic tracking-wide opacity-90 pl-3.5 select-none">
              ~ a quiet chapter, preserved here for you
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 relative z-10">
          <Button
            variant="primary"
            size="md"
            onClick={onResume || (() => {})}
            leftIcon={<Compass className="h-4 w-4" />}
            className={cn(
              "w-full sm:w-auto font-serif",
              isLetterArchive && "bg-[#7A2E3B] hover:bg-[#63242F] text-[#FFFBF2] border border-[rgba(194,147,77,0.5)] shadow-[0_3px_12px_rgba(122,46,59,0.28)]",
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
              isLetterArchive && "bg-[#F2E8DC] border-[rgba(138,110,89,0.38)] text-[#453226] hover:bg-[#EDE0CC] hover:text-[#2B1E16] shadow-[0_2px_6px_rgba(60,42,33,0.05)]",
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


