import React from 'react';
import {
  Calendar,
  Lock,
  Heart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { Note365 } from '../../types';
import { NoteMedia } from '../notes/NoteMedia';
import { cn } from '../../utils';
import {
  VintageCornerFlourish,
  VintageOrnamentalDivider,
  VintagePostmark,
  VintageBotanicalSprig,
} from './LetterArchiveDecorations';

export interface VintageLetterReaderProps extends React.HTMLAttributes<HTMLDivElement> {
  note: Note365 | null;
  onClose?: () => void;
  onPreviousNote?: () => void;
  onNextNote?: () => void;
  hasPreviousNote?: boolean;
  hasNextNote?: boolean;
  onToggleFavorite?: (noteId: string) => void;
  onMarkAsRead?: (noteId: string) => void;
}

export const VintageLetterReader: React.FC<VintageLetterReaderProps> = ({
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
  if (!note) {
    return null;
  }

  const dayIndex = note.dayIndex ?? 1;

  // Render Locked Letter in Vintage Stationery Style
  if (!note.isUnlocked) {
    return (
      <div
        className={cn(
          'relative w-[93%] sm:w-full max-w-2xl mx-auto rounded-[16px] sm:rounded-[18px] p-4 sm:p-10 select-none',
          'bg-[#FAF5EC] border border-[rgba(138,110,89,0.35)]',
          'shadow-[0_16px_40px_-10px_rgba(60,42,33,0.18),0_4px_12px_-2px_rgba(60,42,33,0.08)]',
          'animate-[vintageLetterUnfold_600ms_cubic-bezier(0.16,1,0.3,1)_forwards] motion-reduce:animate-[fadeIn_200ms_ease-out]',
          className
        )}
        {...props}
      >
        {/* Paper Grain Overlay */}
        <div
          className="absolute inset-0 rounded-[16px] sm:rounded-[18px] opacity-40 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
          }}
        />

        {/* Vintage Corner Brackets */}
        <VintageCornerFlourish position="top-left" size={24} className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 opacity-50 sm:opacity-60 pointer-events-none" />
        <VintageCornerFlourish position="top-right" size={24} className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 opacity-50 sm:opacity-60 pointer-events-none" />
        <VintageCornerFlourish position="bottom-left" size={20} className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 opacity-35 sm:opacity-40 pointer-events-none" />
        <VintageCornerFlourish position="bottom-right" size={20} className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 opacity-35 sm:opacity-40 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between pb-3 sm:pb-4 border-b border-[rgba(138,110,89,0.2)]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-serif text-[#6B5547] hover:text-[#7A2E3B] transition-colors py-1 px-1.5 rounded touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4 text-[#7A2E3B] shrink-0" />
            <span>Return to Archive</span>
          </button>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-serif text-[#8C776C]">
            Sealed Letter
          </span>
        </div>

        {/* Locked Presentation */}
        <div className="relative z-10 text-center py-8 sm:py-12 space-y-3.5 sm:space-y-4">
          {/* Tactile Burgundy Wax Seal with Lock */}
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mx-auto flex items-center justify-center shadow-[0_4px_12px_rgba(60,20,30,0.35),inset_0_1px_2px_rgba(255,255,255,0.35)]"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #9E384A 0%, #7A2E3B 60%, #4E1B24 100%)',
              border: '1.5px solid rgba(194, 147, 77, 0.55)',
            }}
          >
            <Lock className="h-5 w-5 sm:h-6 sm:h-6 text-[#EFE0C1]" />
          </div>

          <div className="space-y-1.5 sm:space-y-2 max-w-md mx-auto px-2">
            <h3 className="text-lg sm:text-xl font-serif text-[#3B2A20] font-medium">
              Letter Remains Sealed
            </h3>
            <p className="text-xs sm:text-sm text-[#5C4A42] font-serif italic leading-relaxed">
              This letter for <span className="font-semibold not-italic text-[#7A2E3B]">{note.displayDate}</span> is quietly sealed in the archive and will unfold during an upcoming weekly unlock.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Unfolded Physical Vintage Stationery Letter
  return (
    <div
      className={cn(
        'relative w-[93%] sm:w-full max-w-3xl mx-auto rounded-[16px] sm:rounded-[20px] p-4 sm:p-10 sm:px-12',
        'bg-[#FAF5EC] border border-[rgba(138,110,89,0.35)]',
        'shadow-[0_16px_40px_-10px_rgba(60,42,33,0.18),0_4px_12px_-2px_rgba(60,42,33,0.08)]',
        'animate-[vintageLetterUnfold_650ms_cubic-bezier(0.16,1,0.3,1)_forwards] motion-reduce:animate-[fadeIn_200ms_ease-out]',
        className
      )}
      {...props}
    >
      {/* Physical Paper Grain Texture */}
      <div
        className="absolute inset-0 rounded-[16px] sm:rounded-[20px] opacity-40 mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.045' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3Cpath d='M10 25 Q30 28 60 24 M80 110 Q100 106 125 112' stroke='%238A6E59' stroke-width='0.35' stroke-opacity='0.2' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '140px 140px',
        }}
      />

      {/* Subtle Top Envelope Opening Flap Indicator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 rounded-b-[8px] bg-gradient-to-b from-[rgba(138,110,89,0.2)] to-transparent pointer-events-none opacity-40"
      />

      {/* Subtle Unfolded Paper Crease Lines */}
      <div
        className="absolute top-[32%] left-4 sm:left-6 right-4 sm:right-6 h-[1px] pointer-events-none opacity-20 animate-[vintageCreaseFade_700ms_ease-out_forwards] motion-reduce:opacity-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(138,110,89,0.4) 15%, rgba(138,110,89,0.4) 85%, transparent 100%)',
        }}
      />
      <div
        className="absolute top-[66%] left-4 sm:left-6 right-4 sm:right-6 h-[1px] pointer-events-none opacity-20 animate-[vintageCreaseFade_700ms_ease-out_forwards] motion-reduce:opacity-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(138,110,89,0.4) 15%, rgba(138,110,89,0.4) 85%, transparent 100%)',
        }}
      />

      {/* Vintage Botanical & Corner Flourishes (Refined on mobile to avoid overlap) */}
      <VintageCornerFlourish position="top-left" size={24} className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 sm:w-8 sm:h-8 opacity-50 sm:opacity-65 pointer-events-none" />
      <VintageCornerFlourish position="top-right" size={24} className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 sm:w-8 sm:h-8 opacity-50 sm:opacity-65 pointer-events-none" />
      <VintageCornerFlourish position="bottom-left" size={20} className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 sm:w-6.5 sm:h-6.5 opacity-35 sm:opacity-45 pointer-events-none" />
      <VintageCornerFlourish position="bottom-right" size={20} className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 sm:w-6.5 sm:h-6.5 opacity-35 sm:opacity-45 pointer-events-none" />

      {/* Decorative Botanical Sprig in margins (Desktop only) */}
      <div className="hidden sm:block absolute top-6 right-16 pointer-events-none opacity-40">
        <VintageBotanicalSprig position="right" size={42} />
      </div>

      {/* Top Archive Navigation Bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-[rgba(138,110,89,0.22)] animate-[vintageItemReveal_450ms_cubic-bezier(0.16,1,0.3,1)_80ms_both] motion-reduce:animate-none">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-serif text-[#5C4A42] hover:text-[#7A2E3B] active:scale-[0.98] motion-reduce:active:scale-100 transition-all duration-150 py-1.5 px-2 rounded hover:bg-[#F2E8DC]/60 touch-manipulation focus-visible:ring-2 focus-visible:ring-[#B58A45] focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4 text-[#7A2E3B] shrink-0" />
          <span className="truncate">Archive</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Previous Letter Button */}
          <button
            type="button"
            onClick={onPreviousNote}
            disabled={!hasPreviousNote}
            aria-label="Previous letter"
            title="Previous letter"
            className={cn(
              'p-2 sm:p-1.5 rounded border text-xs font-serif transition-all duration-150 touch-manipulation focus-visible:ring-2 focus-visible:ring-[#B58A45] focus:outline-none',
              hasPreviousNote
                ? 'border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#F2E8DC] hover:text-[#7A2E3B] active:scale-[0.98] motion-reduce:active:scale-100'
                : 'border-[rgba(138,110,89,0.15)] text-[#B09D90] cursor-not-allowed opacity-50'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Next Letter Button */}
          <button
            type="button"
            onClick={onNextNote}
            disabled={!hasNextNote}
            aria-label="Next letter"
            title="Next letter"
            className={cn(
              'p-2 sm:p-1.5 rounded border text-xs font-serif transition-all duration-150 touch-manipulation focus-visible:ring-2 focus-visible:ring-[#B58A45] focus:outline-none',
              hasNextNote
                ? 'border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#F2E8DC] hover:text-[#7A2E3B] active:scale-[0.98] motion-reduce:active:scale-100'
                : 'border-[rgba(138,110,89,0.15)] text-[#B09D90] cursor-not-allowed opacity-50'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:p-1.5 ml-0.5 sm:ml-1 rounded-full text-[#7A6253] hover:text-[#3B2A20] hover:bg-[#F2E8DC] active:scale-[0.95] motion-reduce:active:scale-100 transition-all duration-150 touch-manipulation focus-visible:ring-2 focus-visible:ring-[#B58A45] focus:outline-none"
              aria-label="Close reader"
              title="Close reader"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Letter Meta & Header */}
      <div className="relative z-10 pt-4 sm:pt-5 pb-2 sm:pb-3 space-y-2.5 sm:space-y-3 animate-[vintageItemReveal_500ms_cubic-bezier(0.16,1,0.3,1)_160ms_both] motion-reduce:animate-none">
        {/* Date, Day Index & Favorite Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-serif">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#7A6253]">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#7A2E3B]">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-[#7A2E3B]" />
              {note.displayDate}
            </span>
            <span className="text-[#C2934D] opacity-70">✦</span>
            <span className="text-[#8C776C] italic text-[11px] sm:text-xs">
              № {dayIndex}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Antique-Gold Favorite Toggle */}
            <button
              type="button"
              onClick={() => onToggleFavorite && onToggleFavorite(note.id)}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-serif border transition-all duration-150 touch-manipulation focus-visible:ring-2 focus-visible:ring-[#B58A45] focus:outline-none',
                'active:scale-[0.98] motion-reduce:active:scale-100',
                note.isFavorite
                  ? 'bg-[#F4E9D8] border-[#C2934D] text-[#8A5B20] shadow-xs'
                  : 'bg-transparent border-[rgba(138,110,89,0.3)] text-[#6B5547] hover:bg-[#F2E8DC] hover:text-[#3B2A20]'
              )}
              aria-label={note.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <Heart
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-150',
                  note.isFavorite
                    ? 'fill-[#C2934D] text-[#C2934D] scale-110'
                    : 'text-[#8A6E59]'
                )}
              />
              <span className="text-[11px] sm:text-xs">{note.isFavorite ? 'Treasured' : 'Treasure'}</span>
            </button>

            {/* Read / Unopened Badge in Vintage Type */}
            {note.isRead ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] text-[#5C4A42] font-serif italic px-2 py-0.5 rounded bg-[#EDE3D4] border border-[rgba(138,110,89,0.25)]">
                <Check className="h-3 w-3 text-[#7A2E3B]" />
                Opened
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#7A2E3B] uppercase tracking-wider px-2 py-0.5 rounded bg-[#7A2E3B]/10 border border-[#7A2E3B]/25">
                New
              </span>
            )}
          </div>
        </div>

        {/* Letter Title */}
        <h1 className="text-xl sm:text-3xl font-serif text-[#2C221E] font-normal tracking-tight leading-snug pt-1 break-words">
          {note.title}
        </h1>

        {/* Ornamental Divider */}
        <div className="pt-0.5 sm:pt-1">
          <VintageOrnamentalDivider className="my-2 sm:my-3 opacity-75" />
        </div>
      </div>

      {/* Media Attachments (if any) */}
      <div className="relative z-10 animate-[vintageItemReveal_500ms_cubic-bezier(0.16,1,0.3,1)_240ms_both] motion-reduce:animate-none">
        <NoteMedia
          media={note.media}
          items={note.mediaItems}
          noteDate={note.date}
        />
      </div>

      {/* Main Letter Content written in dark espresso ink */}
      <div className="relative z-10 py-2 sm:py-3 text-[#3B2A20] font-serif text-[15.5px] sm:text-[17.5px] leading-[1.75] sm:leading-[1.85] tracking-normal space-y-4 max-w-none animate-[vintageItemReveal_550ms_cubic-bezier(0.16,1,0.3,1)_300ms_both] motion-reduce:animate-none">
        <p className="whitespace-pre-line selection:bg-[#EBDDC8] selection:text-[#2C221E] break-words">
          {note.content}
        </p>
      </div>

      {/* Letter Bottom Navigation & Closing Sign-Off */}
      <div className="relative z-10 pt-5 sm:pt-6 mt-5 sm:mt-6 border-t border-[rgba(138,110,89,0.22)] space-y-4 animate-[vintageItemReveal_500ms_cubic-bezier(0.16,1,0.3,1)_380ms_both] motion-reduce:animate-none">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <button
              type="button"
              onClick={onPreviousNote}
              disabled={!hasPreviousNote}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded border flex-1 sm:flex-initial transition-all duration-150 touch-manipulation focus-visible:ring-2 focus-visible:ring-[#B58A45] focus:outline-none',
                hasPreviousNote
                  ? 'border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#F2E8DC] hover:text-[#7A2E3B] active:scale-[0.98] motion-reduce:active:scale-100'
                  : 'border-[rgba(138,110,89,0.15)] text-[#B09D90] cursor-not-allowed opacity-50'
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={onNextNote}
              disabled={!hasNextNote}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded border flex-1 sm:flex-initial transition-all duration-150 touch-manipulation focus-visible:ring-2 focus-visible:ring-[#B58A45] focus:outline-none',
                hasNextNote
                  ? 'border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#F2E8DC] hover:text-[#7A2E3B] active:scale-[0.98] motion-reduce:active:scale-100'
                  : 'border-[rgba(138,110,89,0.15)] text-[#B09D90] cursor-not-allowed opacity-50'
              )}
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="text-[#8C776C] italic text-center text-[11px] sm:text-xs">
            Letter {dayIndex} of 365 in Archive
          </span>
        </div>
      </div>

      {/* Embedded Physical Stationery Keyframe Styles */}
      <style>{`
        @keyframes vintageLetterUnfold {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.95);
            box-shadow: 0 4px 12px rgba(60, 42, 33, 0.06);
          }
          45% {
            opacity: 0.85;
            transform: translateY(6px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            box-shadow: 0 20px 50px -10px rgba(60, 42, 33, 0.18), 0 4px 12px -2px rgba(60, 42, 33, 0.08);
          }
        }

        @keyframes vintageCreaseFade {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 0.2;
          }
        }

        @keyframes vintageItemReveal {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes vintageLetterUnfold {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes vintageItemReveal {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
};
