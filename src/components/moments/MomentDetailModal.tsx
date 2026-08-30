import React, { useEffect } from 'react';
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  X,
  Sparkles,
  Camera,
} from 'lucide-react';
import { Moment } from '../../types';
import { cn } from '../../utils';
import { useTheme } from '../../hooks';
import { CrossFadeImage } from '../CrossFadeImage';

export interface MomentDetailModalProps {
  moment: Moment | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevMoment?: () => void;
  onNextMoment?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const MomentDetailModal: React.FC<MomentDetailModalProps> = ({
  moment,
  isOpen,
  onClose,
  onPrevMoment,
  onNextMoment,
  hasPrev = false,
  hasNext = false,
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

  // Global keyboard shortcuts (Escape to close, ArrowLeft / ArrowRight for navigation)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrevMoment) {
        e.preventDefault();
        onPrevMoment();
      } else if (e.key === 'ArrowRight' && hasNext && onNextMoment) {
        e.preventDefault();
        onNextMoment();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onPrevMoment, onNextMoment, onClose]);

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

  if (!isOpen || !moment) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="themed-moment-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[20px] p-5 sm:p-8 select-text',
          'border backdrop-blur-md shadow-2xl animate-in fade-in zoom-in-[0.98] duration-250 focus:outline-none'
        )}
        style={{
          background: isLetterArchive
            ? 'linear-gradient(155deg, #FBF7F0 0%, #F5EDE0 100%)'
            : isScrapbook
            ? 'linear-gradient(155deg, rgba(16, 28, 19, 0.96) 0%, rgba(10, 20, 13, 0.98) 100%)'
            : 'linear-gradient(155deg, rgba(13, 23, 40, 0.96) 0%, rgba(7, 14, 26, 0.98) 100%)',
          borderColor: isLetterArchive
            ? 'rgba(138, 110, 89, 0.38)'
            : isScrapbook
            ? 'rgba(216, 184, 106, 0.3)'
            : 'rgba(201, 155, 88, 0.32)',
          boxShadow: isLetterArchive
            ? '0 24px 60px -12px rgba(60, 42, 33, 0.28), 0 0 20px rgba(122, 46, 59, 0.08)'
            : isScrapbook
            ? '0 24px 60px -12px rgba(0, 0, 0, 0.75), 0 0 30px rgba(79, 107, 72, 0.15)'
            : '0 24px 60px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(201, 155, 88, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Top Navigation Bar */}
        <div
          className="relative z-10 flex items-center justify-between pb-3.5 border-b"
          style={{
            borderColor: isLetterArchive
              ? 'rgba(138, 110, 89, 0.22)'
              : isScrapbook
              ? 'rgba(216, 184, 106, 0.2)'
              : 'rgba(201, 155, 88, 0.2)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'inline-flex items-center gap-1.5 text-xs sm:text-sm font-serif transition-colors py-1.5 px-2.5 rounded touch-manipulation focus-visible:outline-none focus-visible:ring-2',
              isLetterArchive
                ? 'text-[#5C4A42] hover:text-[#7A2E3B] hover:bg-[#EDE2D2]/60 focus-visible:ring-[#7A2E3B]'
                : isScrapbook
                ? 'text-[#B8C0AE] hover:text-[#D8B86A] hover:bg-[rgba(79,107,72,0.25)] focus-visible:ring-[#D8B86A]'
                : 'text-[#C2AF99] hover:text-[#E2BD78] hover:bg-[rgba(201,155,88,0.15)] focus-visible:ring-[#C99B58]'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Memories</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onPrevMoment}
              disabled={!hasPrev}
              aria-label="Previous memory"
              title="Previous memory"
              className={cn(
                'p-1.5 sm:p-2 rounded border text-xs font-serif transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2',
                hasPrev
                  ? isLetterArchive
                    ? 'border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#EDE2D2] hover:text-[#7A2E3B] focus-visible:ring-[#7A2E3B]'
                    : isScrapbook
                    ? 'border-[rgba(216,184,106,0.3)] text-[#B8C0AE] hover:bg-[rgba(79,107,72,0.3)] hover:text-[#F7F1DF] focus-visible:ring-[#D8B86A]'
                    : 'border-[rgba(201,155,88,0.3)] text-[#C2AF99] hover:bg-[rgba(201,155,88,0.18)] hover:text-[#F2E4CF] focus-visible:ring-[#C99B58]'
                  : 'border-transparent opacity-35 cursor-not-allowed text-inherit'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onNextMoment}
              disabled={!hasNext}
              aria-label="Next memory"
              title="Next memory"
              className={cn(
                'p-1.5 sm:p-2 rounded border text-xs font-serif transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2',
                hasNext
                  ? isLetterArchive
                    ? 'border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#EDE2D2] hover:text-[#7A2E3B] focus-visible:ring-[#7A2E3B]'
                    : isScrapbook
                    ? 'border-[rgba(216,184,106,0.3)] text-[#B8C0AE] hover:bg-[rgba(79,107,72,0.3)] hover:text-[#F7F1DF] focus-visible:ring-[#D8B86A]'
                    : 'border-[rgba(201,155,88,0.3)] text-[#C2AF99] hover:bg-[rgba(201,155,88,0.18)] hover:text-[#F2E4CF] focus-visible:ring-[#C99B58]'
                  : 'border-transparent opacity-35 cursor-not-allowed text-inherit'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className={cn(
                'p-1.5 sm:p-2 ml-1 rounded-full transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2',
                isLetterArchive
                  ? 'text-[#7A6253] hover:text-[#3B2A20] hover:bg-[#EDE2D2] focus-visible:ring-[#7A2E3B]'
                  : isScrapbook
                  ? 'text-[#8C9882] hover:text-[#F7F1DF] hover:bg-[rgba(79,107,72,0.25)] focus-visible:ring-[#D8B86A]'
                  : 'text-[#817568] hover:text-[#F2E4CF] hover:bg-[rgba(201,155,88,0.15)] focus-visible:ring-[#C99B58]'
              )}
              aria-label="Close memory"
              title="Close memory"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Photographic Display with Matte Border (if image exists) */}
        {moment.image ? (
          <div className="relative z-10 pt-4">
            <div
              className={cn(
                'relative rounded-[14px] overflow-hidden max-h-[360px] sm:max-h-[420px] w-full flex items-center justify-center shadow-lg',
                isLetterArchive
                  ? 'p-2 bg-[#FAF5EC] border border-[rgba(138,110,89,0.32)]'
                  : isScrapbook
                  ? 'p-2 bg-[rgba(16,28,19,0.85)] border border-[rgba(216,184,106,0.25)]'
                  : 'p-2 bg-[rgba(12,22,38,0.85)] border border-[rgba(201,155,88,0.25)]'
              )}
            >
              <CrossFadeImage
                src={moment.image}
                alt={moment.title}
                className="w-full max-h-[340px] sm:max-h-[400px] object-cover rounded-[10px]"
                loading="lazy"
                referrerPolicy="no-referrer"
              />

              {/* Archival Photo Corner Accents for Letter Archive */}
              {isLetterArchive && (
                <>
                  <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#7A2E3B]/70 pointer-events-none" />
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#7A2E3B]/70 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#7A2E3B]/70 pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#7A2E3B]/70 pointer-events-none" />
                </>
              )}

              {/* Stamp Tag */}
              <div className="absolute top-4 left-4 z-10">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-serif font-semibold tracking-wider shadow-sm backdrop-blur-xs',
                    isLetterArchive
                      ? 'bg-[#FAF5EC]/95 text-[#7A2E3B] border border-[rgba(138,110,89,0.4)]'
                      : isScrapbook
                      ? 'bg-[rgba(16,30,20,0.9)] text-[#D8B86A] border border-[rgba(216,184,106,0.4)]'
                      : 'bg-[rgba(7,14,26,0.9)] text-[#E2BD78] border border-[rgba(201,155,88,0.4)]'
                  )}
                >
                  № {String(moment.order).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Header Metadata & Title */}
        <div className="relative z-10 pt-5 pb-3 space-y-3">
          <div
            className={cn(
              'flex items-center justify-between flex-wrap gap-2 text-xs font-serif',
              isLetterArchive
                ? 'text-[#6B5547]'
                : isScrapbook
                ? 'text-[#B8C0AE]'
                : 'text-[#C2AF99]'
            )}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-medium',
                  isLetterArchive
                    ? 'text-[#7A2E3B]'
                    : isScrapbook
                    ? 'text-[#D8B86A]'
                    : 'text-[#E2BD78]'
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                {moment.date}
              </span>
              {moment.location && (
                <>
                  <span className="opacity-40">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 opacity-80" />
                    {moment.location}
                  </span>
                </>
              )}
              {moment.momentStrength && (
                <>
                  <span className="opacity-40">•</span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 font-medium',
                      isLetterArchive
                        ? 'text-[#7A2E3B]'
                        : isScrapbook
                        ? 'text-[#D8B86A]'
                        : 'text-[#E2BD78]'
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Strength {moment.momentStrength}
                  </span>
                </>
              )}
            </div>

            <span className="italic text-[11px] opacity-75">
              № {String(moment.order).padStart(2, '0')} • Preserved in Memory Gallery
            </span>
          </div>

          <h2
            id="themed-moment-title"
            className={cn(
              'text-2xl sm:text-3xl font-serif font-normal tracking-tight leading-snug pt-1',
              isLetterArchive
                ? 'text-[#3B2A20]'
                : isScrapbook
                ? 'text-[#F7F1DF]'
                : 'text-[#F2E4CF]'
            )}
          >
            {moment.title}
          </h2>

          {/* Short Excerpt Banner */}
          <div
            className={cn(
              'p-3.5 rounded-[10px] border',
              isLetterArchive
                ? 'bg-[#EDE2D2]/60 border-[rgba(138,110,89,0.25)] text-[#5C4A42]'
                : isScrapbook
                ? 'bg-[rgba(79,107,72,0.2)] border-[rgba(216,184,106,0.25)] text-[#B8C0AE]'
                : 'bg-[rgba(201,155,88,0.1)] border-[rgba(201,155,88,0.25)] text-[#C2AF99]'
            )}
          >
            <p className="text-sm font-serif italic leading-relaxed">
              "{moment.shortDescription}"
            </p>
          </div>

          {/* Subtle Star Divider */}
          <div className="pt-2 flex items-center justify-center gap-2 opacity-50">
            <span
              className="h-[1px] flex-1"
              style={{
                background: isLetterArchive
                  ? 'linear-gradient(90deg, transparent, rgba(138, 110, 89, 0.4), transparent)'
                  : isScrapbook
                  ? 'linear-gradient(90deg, transparent, rgba(216, 184, 106, 0.4), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(201, 155, 88, 0.4), transparent)',
              }}
            />
            <span
              className={cn(
                'text-[10px]',
                isLetterArchive
                  ? 'text-[#7A2E3B]'
                  : isScrapbook
                  ? 'text-[#D8B86A]'
                  : 'text-[#E2BD78]'
              )}
            >
              {isScrapbook ? '✿' : '✦'}
            </span>
            <span
              className="h-[1px] flex-1"
              style={{
                background: isLetterArchive
                  ? 'linear-gradient(90deg, transparent, rgba(138, 110, 89, 0.4), transparent)'
                  : isScrapbook
                  ? 'linear-gradient(90deg, transparent, rgba(216, 184, 106, 0.4), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(201, 155, 88, 0.4), transparent)',
              }}
            />
          </div>
        </div>

        {/* Full Story Prose */}
        <div
          className={cn(
            'relative z-10 py-3 font-serif text-[16px] sm:text-[17.5px] leading-[1.8] sm:leading-[1.85] tracking-normal space-y-4 max-w-none',
            isLetterArchive
              ? 'text-[#3B2A20]'
              : isScrapbook
              ? 'text-[#EFE6D4]'
              : 'text-[#E8DBC6]'
          )}
        >
          {moment.story.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Footer Navigation & Actions */}
        <div
          className="relative z-10 pt-6 mt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif"
          style={{
            borderColor: isLetterArchive
              ? 'rgba(138, 110, 89, 0.22)'
              : isScrapbook
              ? 'rgba(216, 184, 106, 0.2)'
              : 'rgba(201, 155, 88, 0.2)',
          }}
        >
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onPrevMoment}
              disabled={!hasPrev}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[8px] border flex-1 sm:flex-initial transition-colors touch-manipulation min-h-[40px] focus-visible:outline-none focus-visible:ring-2',
                hasPrev
                  ? isLetterArchive
                    ? 'border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#EDE2D2] hover:text-[#7A2E3B] focus-visible:ring-[#7A2E3B]'
                    : isScrapbook
                    ? 'border-[rgba(216,184,106,0.3)] text-[#B8C0AE] hover:bg-[rgba(79,107,72,0.3)] hover:text-[#F7F1DF] focus-visible:ring-[#D8B86A]'
                    : 'border-[rgba(201,155,88,0.3)] text-[#C2AF99] hover:bg-[rgba(201,155,88,0.18)] hover:text-[#F2E4CF] focus-visible:ring-[#C99B58]'
                  : 'border-[rgba(138,110,89,0.15)] text-inherit opacity-40 cursor-not-allowed'
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous Memory</span>
            </button>

            <button
              type="button"
              onClick={onNextMoment}
              disabled={!hasNext}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[8px] border flex-1 sm:flex-initial transition-colors touch-manipulation min-h-[40px] focus-visible:outline-none focus-visible:ring-2',
                hasNext
                  ? isLetterArchive
                    ? 'border-[rgba(138,110,89,0.35)] text-[#5C4A42] hover:bg-[#EDE2D2] hover:text-[#7A2E3B] focus-visible:ring-[#7A2E3B]'
                    : isScrapbook
                    ? 'border-[rgba(216,184,106,0.3)] text-[#B8C0AE] hover:bg-[rgba(79,107,72,0.3)] hover:text-[#F7F1DF] focus-visible:ring-[#D8B86A]'
                    : 'border-[rgba(201,155,88,0.3)] text-[#C2AF99] hover:bg-[rgba(201,155,88,0.18)] hover:text-[#F2E4CF] focus-visible:ring-[#C99B58]'
                  : 'border-[rgba(138,110,89,0.15)] text-inherit opacity-40 cursor-not-allowed'
              )}
            >
              <span>Next Memory</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              'inline-flex items-center justify-center px-4 py-2 rounded-[8px] text-xs font-serif transition-colors w-full sm:w-auto touch-manipulation min-h-[40px] focus-visible:outline-none focus-visible:ring-2',
              isLetterArchive
                ? 'text-[#6B5547] hover:text-[#7A2E3B] hover:bg-[#EDE2D2]/80 focus-visible:ring-[#7A2E3B]'
                : isScrapbook
                ? 'text-[#8C9882] hover:text-[#F7F1DF] hover:bg-[rgba(79,107,72,0.3)] focus-visible:ring-[#D8B86A]'
                : 'text-[#817568] hover:text-[#F2E4CF] hover:bg-[rgba(201,155,88,0.18)] focus-visible:ring-[#C99B58]'
            )}
          >
            Close Memory
          </button>
        </div>
      </div>
    </div>
  );
};

