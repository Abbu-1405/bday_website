import React from 'react';
import {
  Calendar,
  Lock,
  Heart,
  BookMarked,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Note365 } from '../../types';
import { Surface } from '../Surface';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { NoteMedia } from './NoteMedia';
import { cn } from '../../utils';
import { useTheme } from '../../hooks';
import { VintageLetterReader } from '../letterArchive/VintageLetterReader';

export interface NoteReaderProps extends React.HTMLAttributes<HTMLDivElement> {
  note: Note365 | null;
  onClose?: () => void;
  onPreviousNote?: () => void;
  onNextNote?: () => void;
  hasPreviousNote?: boolean;
  hasNextNote?: boolean;
  onToggleFavorite?: (noteId: string) => void;
  onMarkAsRead?: (noteId: string) => void;
  isAdminPreview?: boolean;
}

export const NoteReader: React.FC<NoteReaderProps> = ({
  className,
  note,
  onClose,
  onPreviousNote,
  onNextNote,
  hasPreviousNote = false,
  hasNextNote = false,
  onToggleFavorite,
  onMarkAsRead,
  isAdminPreview = false,
  ...props
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';

  if (!note) {
    return null;
  }

  if (isLetterArchive) {
    return (
      <VintageLetterReader
        className={className}
        note={note}
        onClose={onClose}
        onPreviousNote={onPreviousNote}
        onNextNote={onNextNote}
        hasPreviousNote={hasPreviousNote}
        hasNextNote={hasNextNote}
        onToggleFavorite={onToggleFavorite}
        onMarkAsRead={onMarkAsRead}
        isAdminPreview={isAdminPreview}
        {...props}
      />
    );
  }

  if (!note.isUnlocked && !isAdminPreview) {
    return (
      <Surface
        variant="elevated"
        padding="lg"
        className={cn(
          'w-full max-w-2xl mx-auto space-y-6 border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 sm:p-8 animate-in fade-in zoom-in-[0.99] duration-200 motion-reduce:animate-none',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-light)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] text-xs sm:text-sm font-serif"
          >
            Return to Archive
          </Button>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] font-serif">
            Sealed Note
          </span>
        </div>

        <div className="text-center py-8 sm:py-10 space-y-4">
          <div className="p-3.5 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-[var(--color-warning)] w-fit mx-auto shadow-xs">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-lg sm:text-xl font-serif text-[var(--color-text)] font-medium">
              Note Sealed
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-serif italic leading-relaxed">
              This entry for <span className="font-semibold not-italic text-[var(--color-primary)]">{note.displayDate}</span> is quietly preserved in the archive and will open in an upcoming weekly unlock.
            </p>
          </div>
        </div>
      </Surface>
    );
  }

  return (
    <Surface
      variant="elevated"
      padding="lg"
      className={cn(
        'w-full max-w-3xl mx-auto rounded-[var(--radius-lg)] p-5 sm:p-8 sm:px-10 space-y-6 border border-[var(--color-border)] shadow-md animate-in fade-in zoom-in-[0.99] duration-300 motion-reduce:animate-none',
        className
      )}
      {...props}
    >
      {/* Top Navigation Bar with Close / Back and Quick Previous/Next */}
      <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[var(--color-border-light)]">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] text-xs sm:text-sm font-serif touch-manipulation"
        >
          <span>Back to Archive</span>
        </Button>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Header Quick Prev / Next Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousNote}
            disabled={!hasPreviousNote}
            aria-label="Previous note"
            title="Previous note"
            className="p-1.5 h-8 w-8 min-w-0 touch-manipulation"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onNextNote}
            disabled={!hasNextNote}
            aria-label="Next note"
            title="Next note"
            className="p-1.5 h-8 w-8 min-w-0 touch-manipulation"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 ml-1 rounded-full hover:bg-[var(--color-surface-secondary)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              aria-label="Close reader"
              title="Close reader"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Header Info (Date, Day Index & Badges) */}
      <div className="space-y-3 pb-3 border-b border-[var(--color-border-light)]">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-serif">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-medium text-[var(--color-primary)] flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              {note.displayDate}
            </span>
            <span className="text-[var(--color-accent)] opacity-60">✦</span>
            <span className="text-[var(--color-muted)] italic text-[11px] sm:text-xs">
              Day {note.dayIndex ?? 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdminPreview && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider">
                ADMIN PREVIEW
              </span>
            )}
            <Button
              variant={note.isFavorite ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => onToggleFavorite && onToggleFavorite(note.id)}
              leftIcon={
                <Heart
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-150',
                    note.isFavorite
                      ? 'fill-[var(--color-accent)] text-[var(--color-accent)] scale-110'
                      : 'text-[var(--color-muted)]'
                  )}
                />
              }
              className="text-xs font-serif touch-manipulation"
              aria-label={
                note.isFavorite
                  ? 'Remove note from favorites'
                  : 'Mark note as favorite'
              }
            >
              <span className="text-[11px] sm:text-xs">
                {note.isFavorite ? 'Favorited' : 'Favorite'}
              </span>
            </Button>
            {note.isRead ? (
              <Badge variant="success" size="sm" className="text-[10px] sm:text-[11px]">
                Read
              </Badge>
            ) : (
              <Badge variant="primary" size="sm" className="text-[10px] sm:text-[11px]">
                Unread
              </Badge>
            )}
          </div>
        </div>

        <h1 className="text-xl sm:text-3xl font-serif text-[var(--color-text)] leading-snug font-normal tracking-tight pt-0.5 break-words">
          {note.title}
        </h1>
      </div>

      {/* Note Media Attachments */}
      <NoteMedia
        media={note.media}
        items={note.mediaItems}
        noteDate={note.date}
      />

      {/* Full Note Content */}
      <div className="text-[var(--color-text)] font-serif text-[15.5px] sm:text-[17.5px] leading-[1.8] sm:leading-[1.85] space-y-4 py-1.5 max-w-none">
        <p className="whitespace-pre-line selection:bg-[var(--color-primary)]/20 break-words">
          {note.content}
        </p>
      </div>

      {/* Chronological Collection Navigation & Footer */}
      <div className="pt-4 border-t border-[var(--color-border-light)] space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousNote}
              disabled={!hasPreviousNote}
              leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
              className="flex-1 sm:flex-initial text-xs touch-manipulation"
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onNextNote}
              disabled={!hasNextNote}
              rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
              className="flex-1 sm:flex-initial text-xs touch-manipulation"
            >
              Next
            </Button>
          </div>

          <span className="text-xs text-[var(--color-muted)] font-serif italic text-center">
            Note {note.dayIndex ?? 1} of 365
          </span>
        </div>
      </div>
    </Surface>
  );
};

