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
        {...props}
      />
    );
  }

  if (!note.isUnlocked) {
    return (
      <Surface
        variant="elevated"
        padding="lg"
        className={cn('max-w-2xl mx-auto space-y-6', className)}
        {...props}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-light)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Archive
          </Button>
          <span className="text-xs font-semibold text-[var(--color-muted)]">
            Locked Note
          </span>
        </div>

        <div className="text-center py-8 space-y-4">
          <div className="p-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-light)] text-[var(--color-warning)] w-fit mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-body-lg font-serif text-[var(--color-text)] mb-1">
              Note Locked
            </h3>
            <p className="text-xs text-[var(--color-muted)] max-w-sm mx-auto">
              This note for {note.displayDate} is currently sealed and will become available in an upcoming weekly unlock.
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
        'max-w-3xl mx-auto space-y-6 border border-[var(--color-border)] shadow-sm animate-in fade-in duration-200',
        className
      )}
      {...props}
    >
      {/* Top Navigation Bar with Close / Back and Quick Previous/Next */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--color-border-light)]">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] text-xs sm:text-sm"
        >
          Back to 365 Notes Archive
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
            className="p-1.5 h-8 w-8 min-w-0"
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
            className="p-1.5 h-8 w-8 min-w-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 ml-1 rounded-full hover:bg-[var(--color-surface-secondary)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              aria-label="Close reader"
              title="Close reader"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Header Info (Date & Badges) */}
      <div className="space-y-3 pb-4 border-b border-[var(--color-border-light)]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {note.displayDate}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant={note.isFavorite ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => onToggleFavorite && onToggleFavorite(note.id)}
              leftIcon={
                <Heart
                  className={cn(
                    'h-3.5 w-3.5 text-[var(--color-accent)]',
                    note.isFavorite && 'fill-current'
                  )}
                />
              }
              className="text-xs"
              aria-label={
                note.isFavorite
                  ? 'Remove note from favorites'
                  : 'Mark note as favorite'
              }
            >
              {note.isFavorite ? 'Favorited' : 'Favorite'}
            </Button>
            {note.isRead ? (
              <Badge variant="success" size="sm">
                Read
              </Badge>
            ) : (
              <Badge variant="primary" size="sm">
                Unread
              </Badge>
            )}
          </div>
        </div>

        <h1 className="text-h2 font-serif text-[var(--color-text)] leading-tight">
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
      <div className="prose prose-sm max-w-none text-[var(--color-text)] font-serif text-base sm:text-lg leading-relaxed space-y-4 py-2">
        <p className="whitespace-pre-line">{note.content}</p>
      </div>

      {/* Chronological Collection Navigation & Footer */}
      <div className="pt-4 border-t border-[var(--color-border-light)] space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousNote}
            disabled={!hasPreviousNote}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
            className="w-full sm:w-auto text-xs"
          >
            Previous Note
          </Button>

          <span className="text-xs text-[var(--color-muted)] font-serif italic order-first sm:order-none">
            Day {note.dayIndex ?? 1} of 365
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={onNextNote}
            disabled={!hasNextNote}
            rightIcon={<ChevronRight className="h-4 w-4" />}
            className="w-full sm:w-auto text-xs"
          >
            Next Note
          </Button>
        </div>
      </div>
    </Surface>
  );
};

