import React from 'react';
import { Calendar, BookOpen } from 'lucide-react';
import { Note365 } from '../../types';
import { NotePreview } from './NotePreview';
import { cn } from '../../utils';

export interface NotesCalendarListProps extends React.HTMLAttributes<HTMLDivElement> {
  notes: Note365[];
  selectedNoteId?: string;
  onSelectNote: (note: Note365) => void;
}

export const NotesCalendarList: React.FC<NotesCalendarListProps> = ({
  className,
  notes,
  selectedNoteId,
  onSelectNote,
  ...props
}) => {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className="text-h4 font-serif text-[var(--color-text)] flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
          365 Collection
        </h2>
        <span className="text-xs text-[var(--color-muted)] flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {notes.length} Notes
        </span>
      </div>

      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {notes.map((note) => (
          <NotePreview
            key={note.id}
            note={note}
            isSelected={note.id === selectedNoteId}
            onSelectNote={onSelectNote}
          />
        ))}
      </div>
    </div>
  );
};
