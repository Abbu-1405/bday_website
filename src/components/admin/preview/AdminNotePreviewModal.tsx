import React, { useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Note365 } from '../../../types';
import { NoteReader } from '../../notes/NoteReader';
import { useSfx } from '../../../contexts';

interface AdminNotePreviewModalProps {
  note: Note365 | null;
  allNotes: Note365[];
  sessionFavorites: Set<string>;
  onToggleSessionFavorite: (noteId: string) => void;
  onClose: () => void;
  onSelectNote: (note: Note365) => void;
}

export const AdminNotePreviewModal: React.FC<AdminNotePreviewModalProps> = ({
  note,
  allNotes,
  sessionFavorites,
  onToggleSessionFavorite,
  onClose,
  onSelectNote,
}) => {
  const { playSfx } = useSfx();

  if (!note) return null;

  const currentIndex = allNotes.findIndex((n) => n.id === note.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allNotes.length - 1;

  const previousNote = hasPrevious ? allNotes[currentIndex - 1] : null;
  const nextNote = hasNext ? allNotes[currentIndex + 1] : null;

  const handlePrevious = () => {
    if (previousNote) {
      playSfx('pageTurn');
      onSelectNote(previousNote);
    }
  };

  const handleNext = () => {
    if (nextNote) {
      playSfx('pageTurn');
      onSelectNote(nextNote);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrevious) {
        handlePrevious();
      } else if (e.key === 'ArrowRight' && hasNext) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrevious, hasNext, previousNote, nextNote, onClose]);

  const formattedDayIndex = String(note.dayIndex ?? currentIndex + 1).padStart(3, '0');
  const isFavorite = sessionFavorites.has(note.id) || note.isFavorite;

  // Unlocked clone for admin testing without modifying persistent state
  const unlockedNoteForPreview: Note365 = {
    ...note,
    isUnlocked: true,
    isFavorite,
    isRead: true,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-preview-title"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Admin Testing Top Ribbon */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ADMIN PREVIEW MODE
                </span>
                <span className="text-xs font-medium text-slate-300 hidden sm:inline">
                  Note #{formattedDayIndex} of {allNotes.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Isolated testing view · Recipient unlocks and activity tracking remain unchanged.
              </p>
            </div>
          </div>

          {/* Quick Previous / Next Navigation Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-slate-200 transition-colors border border-slate-700"
              title="Previous note (Left Arrow)"
              aria-label="Previous note"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <span className="text-xs font-mono font-semibold px-2 py-1 bg-slate-800/80 rounded-lg text-indigo-300 border border-slate-700">
              #{formattedDayIndex} / {allNotes.length}
            </span>

            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-slate-200 transition-colors border border-slate-700"
              title="Next note (Right Arrow)"
              aria-label="Next note"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-slate-800 mx-1" />

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Close Preview (Esc)"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Real Note Reader Render */}
        <div className="p-3 sm:p-6 md:p-8 overflow-y-auto max-h-[calc(96vh-60px)]">
          <div className="max-w-3xl mx-auto">
            <NoteReader
              note={unlockedNoteForPreview}
              isAdminPreview={true}
              onClose={onClose}
              onPreviousNote={handlePrevious}
              onNextNote={handleNext}
              hasPreviousNote={hasPrevious}
              hasNextNote={hasNext}
              onToggleFavorite={() => onToggleSessionFavorite(note.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
