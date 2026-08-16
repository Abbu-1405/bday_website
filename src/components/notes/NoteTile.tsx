import React from 'react';
import { Calendar, Lock, CheckCircle2, Heart } from 'lucide-react';
import { Note365 } from '../../types';
import { Surface } from '../Surface';
import { Badge } from '../Badge';
import { cn } from '../../utils';
import { useTheme } from '../../hooks';
import { VintageEnvelopeTile } from '../letterArchive/VintageEnvelopeTile';

export interface NoteTileProps extends React.HTMLAttributes<HTMLDivElement> {
  note: Note365;
  isToday?: boolean;
  onSelectNote?: (note: Note365) => void;
  onLockedClick?: (note: Note365) => void;
}

export const NoteTile: React.FC<NoteTileProps> = ({
  className,
  note,
  isToday = false,
  onSelectNote,
  onLockedClick,
  ...props
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';
  const { displayDate, title, preview, isUnlocked, isRead, isFavorite } = note;

  if (isLetterArchive) {
    return (
      <VintageEnvelopeTile
        className={className}
        note={note}
        isToday={isToday}
        onSelectNote={onSelectNote}
        onLockedClick={onLockedClick}
        {...props}
      />
    );
  }

  const handleClick = () => {
    if (isUnlocked && onSelectNote) {
      onSelectNote(note);
    } else if (!isUnlocked) {
      if (onLockedClick) {
        onLockedClick(note);
      } else if (onSelectNote) {
        onSelectNote(note);
      }
    }
  };

  return (
    <Surface
      variant="elevated"
      padding="md"
      className={cn(
        'group flex flex-col justify-between h-full min-h-[160px] border transition-all rounded-[var(--radius-lg)] p-4 sm:p-5',
        isToday && 'ring-1 ring-[var(--color-primary)] border-[var(--color-primary)]/80',
        isUnlocked
          ? 'cursor-pointer border-[var(--color-border)] hover:border-[var(--color-primary)]/60 hover:shadow-md hover:-translate-y-0.5'
          : 'cursor-pointer border-[var(--color-border-light)] bg-[var(--color-surface-secondary)]/40 opacity-75 hover:border-[var(--color-warning)]/40 hover:bg-[var(--color-surface-secondary)]/70',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <div className="space-y-2">
        {/* Date and Status Header */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[var(--color-primary)] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {displayDate}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {isToday && (
              <Badge variant="primary" size="sm" className="py-0.5 px-1.5 text-[10px] bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                Today
              </Badge>
            )}
            {isFavorite && (
              <Heart className="h-3.5 w-3.5 text-[var(--color-accent)] fill-current" />
            )}
            {!isUnlocked ? (
              <Badge variant="warning" size="sm" className="flex items-center gap-1 py-0.5 px-1.5 text-[10px]">
                <Lock className="h-2.5 w-2.5" /> Locked
              </Badge>
            ) : isRead ? (
              <Badge variant="success" size="sm" className="flex items-center gap-1 py-0.5 px-1.5 text-[10px]">
                <CheckCircle2 className="h-2.5 w-2.5" /> Read
              </Badge>
            ) : (
              <Badge variant="primary" size="sm" className="py-0.5 px-1.5 text-[10px]">
                New
              </Badge>
            )}
          </div>
        </div>

        {/* Note Title */}
        <h3 className={cn(
          'text-body font-semibold font-serif transition-colors line-clamp-1',
          isUnlocked ? 'text-[var(--color-text)] group-hover:text-[var(--color-primary)]' : 'text-[var(--color-muted)]'
        )}>
          {title}
        </h3>

        {/* Note Preview */}
        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
          {isUnlocked ? preview : 'This note is locked and will open in a future weekly unlock.'}
        </p>
      </div>

      {/* Footer Indicator */}
      <div className="pt-3 border-t border-[var(--color-border-light)] mt-3 flex items-center justify-between text-[11px] text-[var(--color-muted)] font-sans">
        <span>Day {note.dayIndex ?? 1}</span>
        {isUnlocked && (
          <span className="text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
            Read Note &rarr;
          </span>
        )}
      </div>
    </Surface>
  );
};
