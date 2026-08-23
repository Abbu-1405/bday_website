import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Surface } from '../Surface';
import { Button } from '../Button';
import { cn } from '../../utils';

export interface MonthNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentYear: number;
  currentMonth: number; // 1-12 (1 = January, 9 = September)
  minYear?: number;
  minMonth?: number;
  maxYear?: number;
  maxMonth?: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MonthNavigation: React.FC<MonthNavigationProps> = ({
  className,
  currentYear,
  currentMonth,
  minYear = 2026,
  minMonth = 9, // September 2026
  maxYear = 2027,
  maxMonth = 9, // September 2027 (365 days span)
  onPreviousMonth,
  onNextMonth,
  ...props
}) => {
  const monthName = MONTH_NAMES[currentMonth - 1] || 'September';

  const isAtMin =
    currentYear < minYear || (currentYear === minYear && currentMonth <= minMonth);
  const isAtMax =
    currentYear > maxYear || (currentYear === maxYear && currentMonth >= maxMonth);

  return (
    <Surface
      variant="elevated"
      padding="sm"
      className={cn(
        'flex items-center justify-between gap-2 border border-[var(--color-border)] rounded-[var(--radius-lg)] px-3 py-2 sm:px-5 sm:py-2.5',
        className
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onPreviousMonth}
        disabled={isAtMin}
        aria-label="Previous Month"
        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation font-serif"
      >
        <ChevronLeft className="h-4 w-4 mr-0.5 sm:mr-1" />
        <span className="hidden sm:inline text-xs font-medium">Previous</span>
      </Button>

      <div className="flex items-center gap-2 text-center select-none px-2">
        <Calendar className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
        <span className="font-serif font-semibold text-sm sm:text-base text-[var(--color-text)] tracking-wide">
          {monthName} {currentYear}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onNextMonth}
        disabled={isAtMax}
        aria-label="Next Month"
        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation font-serif"
      >
        <span className="hidden sm:inline text-xs font-medium">Next</span>
        <ChevronRight className="h-4 w-4 ml-0.5 sm:ml-1" />
      </Button>
    </Surface>
  );
};
