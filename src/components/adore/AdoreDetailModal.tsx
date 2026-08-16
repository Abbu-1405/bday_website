import React, { useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdoreItem } from '../../types';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Badge } from '../Badge';

export interface AdoreDetailModalProps {
  item: AdoreItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevItem?: () => void;
  onNextItem?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const AdoreDetailModal: React.FC<AdoreDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onPrevItem,
  onNextItem,
  hasPrev = false,
  hasNext = false,
}) => {
  // Keyboard arrow listener for item-to-item navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev && onPrevItem) {
        e.preventDefault();
        onPrevItem();
      } else if (e.key === 'ArrowRight' && hasNext && onNextItem) {
        e.preventDefault();
        onNextItem();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onPrevItem, onNextItem]);

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="bg-[var(--color-surface)] border-[var(--color-border)]"
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header Tags & Title */}
        <div className="space-y-3 pb-4 border-b border-[var(--color-border-light)]">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-7 px-3 rounded-full text-xs font-serif font-bold tracking-wider bg-[var(--color-surface-secondary)] text-[var(--color-primary)] border border-[var(--color-border-light)]">
                Reflection #{String(item.order).padStart(2, '0')}
              </span>
              {item.category && (
                <Badge variant="neutral" size="sm" className="font-sans">
                  {item.category}
                </Badge>
              )}
            </div>

            <span className="text-xs text-[var(--color-muted)] flex items-center gap-1 font-serif">
              <Heart className="h-3.5 w-3.5 text-[var(--color-accent)] fill-current" />
              Starlit Adore
            </span>
          </div>

          <h2 className="text-h2 font-serif font-semibold text-[var(--color-text)] leading-tight pt-1">
            {item.title}
          </h2>

          <p className="text-body text-[var(--color-text-secondary)] italic font-serif pl-3 border-l-2 border-[var(--color-primary)] py-0.5">
            "{item.shortDescription}"
          </p>
        </div>

        {/* Optional Image */}
        {item.image && (
          <div className="relative rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border-light)] max-h-80 w-full bg-[var(--color-surface-secondary)]">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Full Prose Content with optimal line-height & readability */}
        <div className="text-[var(--color-text)] font-serif text-base sm:text-lg leading-relaxed space-y-4 py-2">
          {item.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-[var(--color-text)]">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Footer Navigation & Close */}
        <div className="pt-6 border-t border-[var(--color-border-light)] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={onPrevItem}
              disabled={!hasPrev}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              className="text-xs sm:text-sm min-h-[44px]"
              aria-label="Previous Adore reflection"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onNextItem}
              disabled={!hasNext}
              rightIcon={<ChevronRight className="h-4 w-4" />}
              className="text-xs sm:text-sm min-h-[44px]"
              aria-label="Next Adore reflection"
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
            Close Reflection
          </Button>
        </div>
      </div>
    </Modal>
  );
};
