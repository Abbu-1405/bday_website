import React, { useEffect } from 'react';
import { Calendar, MapPin, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Moment } from '../../types';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Badge } from '../Badge';

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
  // Global arrow keys listener for sequential navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev && onPrevMoment) {
        e.preventDefault();
        onPrevMoment();
      } else if (e.key === 'ArrowRight' && hasNext && onNextMoment) {
        e.preventDefault();
        onNextMoment();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onPrevMoment, onNextMoment]);

  if (!moment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="bg-[var(--color-surface)] border-[var(--color-border)]"
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Prominent Image Display */}
        <div className="relative rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border-light)] max-h-96 w-full bg-[var(--color-surface-secondary)] shadow-sm">
          <img
            src={moment.image}
            alt={moment.title}
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="primary" size="sm" className="font-serif shadow-xs bg-black/60 backdrop-blur-xs text-white border-white/20">
              #{String(moment.order).padStart(2, '0')}
            </Badge>
          </div>
        </div>

        {/* Header Metadata & Title */}
        <div className="space-y-3 pb-4 border-b border-[var(--color-border-light)]">
          <div className="flex items-center gap-3 text-xs text-[var(--color-muted)] flex-wrap font-sans">
            <span className="flex items-center gap-1 font-medium text-[var(--color-primary)]">
              <Calendar className="h-3.5 w-3.5" />
              {moment.date}
            </span>
            <span className="text-[var(--color-border)]">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {moment.location}
            </span>
          </div>

          <h2 className="text-h2 font-serif font-bold text-[var(--color-text)] leading-tight pt-1">
            {moment.title}
          </h2>

          <p className="text-body text-[var(--color-text-secondary)] italic font-serif pl-3 border-l-2 border-[var(--color-primary)] py-0.5">
            "{moment.shortDescription}"
          </p>
        </div>

        {/* Full Story Prose */}
        <div className="text-[var(--color-text)] font-serif text-base sm:text-lg leading-relaxed space-y-4 py-2">
          {moment.story.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-[var(--color-text)]">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Footer Navigation & Actions */}
        <div className="pt-6 border-t border-[var(--color-border-light)] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={onPrevMoment}
              disabled={!hasPrev}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              className="text-xs sm:text-sm min-h-[44px]"
              aria-label="Previous memory"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onNextMoment}
              disabled={!hasNext}
              rightIcon={<ChevronRight className="h-4 w-4" />}
              className="text-xs sm:text-sm min-h-[44px]"
              aria-label="Next memory"
            >
              Next
            </Button>
          </div>

          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="text-xs sm:text-sm min-h-[44px] text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            Close Memory
          </Button>
        </div>
      </div>
    </Modal>
  );
};
