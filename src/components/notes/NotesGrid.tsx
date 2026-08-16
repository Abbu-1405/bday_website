import React from 'react';
import { CalendarX } from 'lucide-react';
import { Note365 } from '../../types';
import { NoteTile } from './NoteTile';
import { Surface } from '../Surface';
import { cn } from '../../utils';
import { useTheme } from '../../hooks';
import { VintageEmptyState } from '../letterArchive/VintageEmptyState';

export interface NotesGridProps extends React.HTMLAttributes<HTMLDivElement> {
  notes: Note365[];
  todayDate?: string;
  onSelectNote: (note: Note365) => void;
  onLockedClick?: (note: Note365) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  isFavoriteFilter?: boolean;
  isSearchEmpty?: boolean;
  onClearFilters?: () => void;
}

export const NotesGrid: React.FC<NotesGridProps> = ({
  className,
  notes,
  todayDate,
  onSelectNote,
  onLockedClick,
  emptyTitle = 'No notes recorded for this month',
  emptyMessage = 'Navigate to another month to explore starlit reflections in the 365 Notes collection.',
  isFavoriteFilter = false,
  isSearchEmpty = false,
  onClearFilters,
  ...props
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';

  if (!notes || notes.length === 0) {
    if (isLetterArchive) {
      return (
        <VintageEmptyState
          className={className}
          title={emptyTitle}
          message={emptyMessage}
          isFavoriteFilter={isFavoriteFilter}
          isSearchEmpty={isSearchEmpty}
          onClearFilters={onClearFilters}
          {...props}
        />
      );
    }

    return (
      <Surface variant="elevated" padding="lg" className="text-center py-12 space-y-3 border border-[var(--color-border-light)]">
        <CalendarX className="h-8 w-8 text-[var(--color-muted)] mx-auto opacity-70" />
        <h3 className="text-body font-serif font-medium text-[var(--color-text-secondary)]">
          {emptyTitle}
        </h3>
        <p className="text-xs text-[var(--color-muted)] max-w-xs mx-auto font-sans">
          {emptyMessage}
        </p>
        {onClearFilters && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              Clear search & filters
            </button>
          </div>
        )}
      </Surface>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6',
        className
      )}
      {...props}
    >
      {notes.map((note) => (
        <NoteTile
          key={note.id}
          note={note}
          isToday={todayDate ? note.date === todayDate : false}
          onSelectNote={onSelectNote}
          onLockedClick={onLockedClick}
        />
      ))}
    </div>
  );
};
