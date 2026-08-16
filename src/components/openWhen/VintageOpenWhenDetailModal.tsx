import React, { useEffect } from 'react';
import {
  Heart,
  CloudRain,
  Compass,
  Moon,
  Flame,
  Smile,
  Shield,
  Frown,
  Coffee,
  Sparkles,
  Sun,
  Anchor,
  Mail,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  X,
  LucideIcon,
} from 'lucide-react';
import { OpenWhenLetter } from '../../types';
import { cn } from '../../utils';
import {
  VintageCornerFlourish,
  VintageOrnamentalDivider,
  VintageBotanicalSprig,
} from '../letterArchive/LetterArchiveDecorations';

const iconMap: Record<string, LucideIcon> = {
  Heart,
  CloudRain,
  Compass,
  Moon,
  Flame,
  Smile,
  Shield,
  Frown,
  Coffee,
  Sparkles,
  Sun,
  Anchor,
};

export interface VintageOpenWhenDetailModalProps {
  letter: OpenWhenLetter | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevLetter?: () => void;
  onNextLetter?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const VintageOpenWhenDetailModal: React.FC<VintageOpenWhenDetailModalProps> = ({
  letter,
  isOpen,
  onClose,
  onPrevLetter,
  onNextLetter,
  hasPrev = false,
  hasNext = false,
}) => {
  // Global keyboard shortcuts (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrevLetter) {
        e.preventDefault();
        onPrevLetter();
      } else if (e.key === 'ArrowRight' && hasNext && onNextLetter) {
        e.preventDefault();
        onNextLetter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onPrevLetter, onNextLetter, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !letter) return null;

  const IconComponent = iconMap[letter.icon] || Mail;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vintage-open-when-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[20px] p-6 sm:p-10 select-text',
          'bg-[#FAF5EC] border border-[rgba(138,110,89,0.38)]',
          'shadow-[0_24px_60px_-12px_rgba(60,42,33,0.3),0_6px_16px_rgba(60,42,33,0.12)]',
          'animate-in fade-in zoom-in-95 duration-250',
          'focus:outline-none'
        )}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Physical Paper Grain Texture */}
        <div
          className="absolute inset-0 rounded-[20px] opacity-40 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.045' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3Cpath d='M10 25 Q30 28 60 24 M80 110 Q100 106 125 112' stroke='%238A6E59' stroke-width='0.35' stroke-opacity='0.2' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '140px 140px',
          }}
        />

        {/* Paper Fold Crease Line */}
        <div
          className="absolute top-[28%] left-6 right-6 h-[1px] pointer-events-none opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(138,110,89,0.4) 15%, rgba(138,110,89,0.4) 85%, transparent 100%)',
          }}
        />

        {/* Vintage Corner Brackets */}
        <VintageCornerFlourish position="top-left" size={28} className="absolute top-3 left-3 opacity-60 pointer-events-none" />
        <VintageCornerFlourish position="top-right" size={28} className="absolute top-3 right-3 opacity-60 pointer-events-none" />
        <VintageCornerFlourish position="bottom-left" size={24} className="absolute bottom-3 left-3 opacity-40 pointer-events-none" />
        <VintageCornerFlourish position="bottom-right" size={24} className="absolute bottom-3 right-3 opacity-40 pointer-events-none" />

        {/* Desktop Botanical Accents */}
        <div className="hidden sm:block absolute top-6 right-16 pointer-events-none opacity-35">
          <VintageBotanicalSprig position="right" size={40} />
        </div>

        {/* Top Navigation Bar */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-[rgba(138,110,89,0.22)]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-serif text-[#5C4A42] hover:text-[#7A2E3B] transition-colors py-1 px-2 rounded hover:bg-[#F2E8DC]/60"
          >
            <ArrowLeft className="h-4 w-4 text-[#7A2E3B]" />
            <span>Return to Archive</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onPrevLetter}
              disabled={!hasPrev}
              aria-label="Previous letter"
              title="Previous letter"
              className={cn(
                'p-1.5 rounded border text-xs font-serif transition-colors',
                hasPrev
                  ? 'border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#F2E8DC] hover:text-[#7A2E3B]'
                  : 'border-[rgba(138,110,89,0.15)] text-[#B09D90] cursor-not-allowed opacity-50'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onNextLetter}
              disabled={!hasNext}
              aria-label="Next letter"
              title="Next letter"
              className={cn(
                'p-1.5 rounded border text-xs font-serif transition-colors',
                hasNext
                  ? 'border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#F2E8DC] hover:text-[#7A2E3B]'
                  : 'border-[rgba(138,110,89,0.15)] text-[#B09D90] cursor-not-allowed opacity-50'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 ml-1 rounded-full text-[#7A6253] hover:text-[#3B2A20] hover:bg-[#F2E8DC] transition-colors"
              aria-label="Close letter"
              title="Close letter"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Letter Inscription Header */}
        <div className="relative z-10 pt-5 pb-3 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-serif">
            <div className="flex items-center gap-2 text-[#7A6253]">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7A2E3B]">
                <IconComponent className="h-3.5 w-3.5 shrink-0 text-[#7A2E3B]" />
                Letter № {String(letter.order).padStart(2, '0')}
              </span>
              <span className="text-[#C2934D] opacity-70">✦</span>
              <span className="text-[#8C776C] italic">
                Preserved Correspondence
              </span>
            </div>

            <span className="text-[11px] font-semibold text-[#7A2E3B] uppercase tracking-wider px-2 py-0.5 rounded bg-[#7A2E3B]/10 border border-[#7A2E3B]/25">
              Unfolded
            </span>
          </div>

          <h2
            id="vintage-open-when-title"
            className="text-2xl sm:text-3xl font-serif text-[#2C221E] font-normal tracking-tight leading-snug pt-1"
          >
            {letter.title}
          </h2>

          {/* Trigger Context Box */}
          <div className="p-3 rounded-[10px] bg-[#F2E8DC]/80 border border-[rgba(138,110,89,0.3)] space-y-0.5">
            <p className="text-[10px] font-sans font-medium text-[#8C776C] uppercase tracking-wider">
              When to read:
            </p>
            <p className="text-sm font-serif italic text-[#7A2E3B] leading-relaxed">
              "{letter.trigger}"
            </p>
          </div>

          {/* Ornamental Star Divider */}
          <div className="pt-1">
            <VintageOrnamentalDivider className="my-3 opacity-75" />
          </div>
        </div>

        {/* Full Letter Content in Espresso Ink */}
        <div className="relative z-10 py-3 text-[#3B2A20] font-serif text-[16px] sm:text-[17.5px] leading-[1.8] sm:leading-[1.85] tracking-normal space-y-4 max-w-none">
          {letter.content.split('\n\n').map((paragraph, idx) => (
            <p
              key={idx}
              className="selection:bg-[#EBDDC8] selection:text-[#2C221E]"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Footer Navigation Controls */}
        <div className="relative z-10 pt-6 mt-6 border-t border-[rgba(138,110,89,0.22)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onPrevLetter}
              disabled={!hasPrev}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border flex-1 sm:flex-initial transition-colors',
                hasPrev
                  ? 'border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#F2E8DC] hover:text-[#7A2E3B]'
                  : 'border-[rgba(138,110,89,0.15)] text-[#B09D90] cursor-not-allowed opacity-50'
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous Letter</span>
            </button>

            <button
              type="button"
              onClick={onNextLetter}
              disabled={!hasNext}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border flex-1 sm:flex-initial transition-colors',
                hasNext
                  ? 'border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#F2E8DC] hover:text-[#7A2E3B]'
                  : 'border-[rgba(138,110,89,0.15)] text-[#B09D90] cursor-not-allowed opacity-50'
              )}
            >
              <span>Next Letter</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-1.5 rounded text-xs font-serif text-[#6B5547] hover:text-[#7A2E3B] hover:bg-[#F2E8DC]/80 transition-colors w-full sm:w-auto"
          >
            Close Letter
          </button>
        </div>
      </div>
    </div>
  );
};
