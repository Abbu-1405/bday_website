import React from 'react';
import { Calendar, Lock, CheckCircle2, Heart } from 'lucide-react';
import { Note365 } from '../../types';
import { Surface } from '../Surface';
import { Badge } from '../Badge';
import { cn } from '../../utils';

export interface NotePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  note: Note365;
  isSelected?: boolean;
  onSelectNote?: (note: Note365) => void;
}

export const NotePreview: React.FC<NotePreviewProps> = ({
  className,
  note,
  isSelected = false,
  onSelectNote,
  ...props
}) => {
  const { displayDate, title, preview, isUnlocked, isRead, isFavorite } = note;

  return (
    <Surface
      variant="elevated"
      padding="md"
      className={cn(
        'border transition-all cursor-pointer space-y-2.5',
        isSelected
          ? 'border-[var(--color-primary)] bg-[var(--color-surface-secondary)]/60'
          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50',
        !isUnlocked && 'opacity-65 cursor-not-allowed bg-[var(--color-surface)]/40',
        className
      )}
      onClick={() => isUnlocked && onSelectNote?.(note)}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--color-muted)] flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
          {displayDate}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {isFavorite && (
            <Heart className="h-3.5 w-3.5 text-[var(--color-accent)] fill-current" />
          )}
          {!isUnlocked ? (
            <Badge variant="warning" size="sm" className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> Locked
            </Badge>
          ) : isRead ? (
            <Badge variant="success" size="sm" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Read
            </Badge>
          ) : (
            <Badge variant="primary" size="sm">
              New
            </Badge>
          )}
        </div>
      </div>

      <h3 className="text-body font-semibold font-serif text-[var(--color-text)] line-clamp-1">
        {title}
      </h3>

      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
        {preview}
      </p>
    </Surface>
  );
};
