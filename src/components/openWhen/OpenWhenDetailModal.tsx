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
import { useTheme } from '../../hooks';
import { VintageOpenWhenDetailModal } from './VintageOpenWhenDetailModal';

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

export interface OpenWhenDetailModalProps {
  letter: OpenWhenLetter | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevLetter?: () => void;
  onNextLetter?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const OpenWhenDetailModal: React.FC<OpenWhenDetailModalProps> = ({
  letter,
  isOpen,
  onClose,
  onPrevLetter,
  onNextLetter,
  hasPrev = false,
  hasNext = false,
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

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

  if (isLetterArchive) {
    return (
      <VintageOpenWhenDetailModal
        letter={letter}
        isOpen={isOpen}
        onClose={onClose}
        onPrevLetter={onPrevLetter}
        onNextLetter={onNextLetter}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    );
  }

  const IconComponent = iconMap[letter.icon] || Mail;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="themed-open-when-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[20px] p-6 sm:p-10 select-text',
          'border backdrop-blur-md shadow-2xl animate-in fade-in zoom-in-[0.98] duration-250 focus:outline-none'
        )}
        style={{
          background: isScrapbook
            ? 'linear-gradient(155deg, #FAF1DF 0%, #F5E8D0 100%)'
            : 'linear-gradient(155deg, #142238 0%, #101A2B 100%)',
          borderColor: isScrapbook
            ? 'rgba(120, 140, 107, 0.45)'
            : '#344761',
          boxShadow: isScrapbook
            ? '0 24px 60px -12px rgba(74, 64, 56, 0.25), 0 0 30px rgba(210, 168, 74, 0.15)'
            : '0 24px 60px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(145, 169, 200, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Subtle Horizontal Paper Crease */}
        <div
          className="absolute top-[28%] left-6 right-6 h-[1px] pointer-events-none opacity-25"
          style={{
            background: isScrapbook
              ? 'linear-gradient(90deg, transparent 0%, rgba(120, 140, 107, 0.4) 20%, rgba(120, 140, 107, 0.4) 80%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, #344761 20%, #344761 80%, transparent 100%)',
          }}
        />

        {/* Top Navigation Bar with Return to Archive, Navigation, and Close */}
        <div
          className="relative z-10 flex items-center justify-between pb-4 border-b"
          style={{
            borderColor: isScrapbook
              ? 'rgba(120, 140, 107, 0.3)'
              : '#273951',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-serif text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors py-1 px-2 rounded hover:bg-[var(--color-surface-secondary)]/50 touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--color-primary)]" />
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
                'p-1.5 rounded border text-xs font-serif transition-colors touch-manipulation',
                hasPrev
                  ? isScrapbook
                    ? 'border-[rgba(120,140,107,0.35)] text-[#6D655B] hover:bg-[#E5D1B0]/60 hover:text-[#4A4038]'
                    : 'border-[#344761] text-[#9EADC2] hover:bg-[#18273B] hover:text-[#E9EDF4]'
                  : 'border-[var(--color-border-light)] text-[var(--color-muted)] cursor-not-allowed opacity-40'
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
                'p-1.5 rounded border text-xs font-serif transition-colors touch-manipulation',
                hasNext
                  ? isScrapbook
                    ? 'border-[rgba(120,140,107,0.35)] text-[#6D655B] hover:bg-[#E5D1B0]/60 hover:text-[#4A4038]'
                    : 'border-[#344761] text-[#9EADC2] hover:bg-[#18273B] hover:text-[#E9EDF4]'
                  : 'border-[var(--color-border-light)] text-[var(--color-muted)] cursor-not-allowed opacity-40'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 ml-1 rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)]/50 transition-colors touch-manipulation"
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
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)]">
                <IconComponent className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                Letter № {String(letter.order).padStart(2, '0')}
              </span>
              <span className="text-[var(--color-accent)] opacity-60">✦</span>
              <span className="text-[var(--color-muted)] italic">
                Preserved Correspondence
              </span>
            </div>

            <span
              className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border"
              style={{
                backgroundColor: isScrapbook
                  ? 'rgba(120, 140, 107, 0.15)'
                  : '#18273B',
                borderColor: isScrapbook
                  ? 'rgba(120, 140, 107, 0.35)'
                  : '#344761',
                color: isScrapbook ? '#788C6B' : '#D6B56C',
              }}
            >
              Unfolded
            </span>
          </div>

          <h2
            id="themed-open-when-title"
            className="text-2xl sm:text-3xl font-serif text-[var(--color-text)] font-semibold tracking-tight leading-snug pt-1"
          >
            {letter.title}
          </h2>

          {/* Trigger Context Box */}
          <div
            className="p-3 rounded-[10px] border space-y-0.5"
            style={{
              backgroundColor: isScrapbook
                ? '#F5E8D0'
                : '#142238',
              borderColor: isScrapbook
                ? 'rgba(120, 140, 107, 0.3)'
                : '#344761',
            }}
          >
            <p className="text-[10px] font-sans font-medium text-[var(--color-muted)] uppercase tracking-wider">
              When to read:
            </p>
            <p className="text-sm font-serif italic text-[var(--color-accent)] leading-relaxed">
              "{letter.trigger}"
            </p>
          </div>

          {/* Subtle Star Divider */}
          <div className="pt-2 flex items-center justify-center gap-2 opacity-50">
            <span
              className="h-[1px] flex-1"
              style={{
                background: isScrapbook
                  ? 'linear-gradient(90deg, transparent, rgba(120, 140, 107, 0.4), transparent)'
                  : 'linear-gradient(90deg, transparent, #344761, transparent)',
              }}
            />
            <span className="text-[10px] text-[var(--color-accent)]">{isScrapbook ? '✿' : '✦'}</span>
            <span
              className="h-[1px] flex-1"
              style={{
                background: isScrapbook
                  ? 'linear-gradient(90deg, transparent, rgba(120, 140, 107, 0.4), transparent)'
                  : 'linear-gradient(90deg, transparent, #344761, transparent)',
              }}
            />
          </div>
        </div>

        {/* Full Letter Content in Theme Ink */}
        <div className="relative z-10 py-3 text-[var(--color-text)] font-serif text-[16px] sm:text-[17.5px] leading-[1.8] sm:leading-[1.85] tracking-normal space-y-4 max-w-none">
          {letter.content.split('\n\n').map((paragraph, idx) => (
            <p
              key={idx}
              className="selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-text)]"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Footer Navigation Controls */}
        <div
          className="relative z-10 pt-6 mt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif"
          style={{
            borderColor: isScrapbook
              ? 'rgba(120, 140, 107, 0.3)'
              : '#273951',
          }}
        >
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onPrevLetter}
              disabled={!hasPrev}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border flex-1 sm:flex-initial transition-colors touch-manipulation',
                hasPrev
                  ? isScrapbook
                    ? 'border-[rgba(120,140,107,0.35)] text-[#6D655B] hover:bg-[#E5D1B0]/60 hover:text-[#4A4038]'
                    : 'border-[#344761] text-[#9EADC2] hover:bg-[#18273B] hover:text-[#E9EDF4]'
                  : 'border-[var(--color-border-light)] text-[var(--color-muted)] cursor-not-allowed opacity-40'
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
                'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border flex-1 sm:flex-initial transition-colors touch-manipulation',
                hasNext
                  ? isScrapbook
                    ? 'border-[rgba(120,140,107,0.35)] text-[#6D655B] hover:bg-[#E5D1B0]/60 hover:text-[#4A4038]'
                    : 'border-[#344761] text-[#9EADC2] hover:bg-[#18273B] hover:text-[#E9EDF4]'
                  : 'border-[var(--color-border-light)] text-[var(--color-muted)] cursor-not-allowed opacity-40'
              )}
            >
              <span>Next Letter</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-1.5 rounded text-xs font-serif text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)]/50 transition-colors w-full sm:w-auto touch-manipulation"
          >
            Close Letter
          </button>
        </div>
      </div>
    </div>
  );
};

