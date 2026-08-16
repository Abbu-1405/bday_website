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
  LucideIcon,
} from 'lucide-react';
import { OpenWhenLetter } from '../../types';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Badge } from '../Badge';
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

  // Global arrow key navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev && onPrevLetter) {
        e.preventDefault();
        onPrevLetter();
      } else if (e.key === 'ArrowRight' && hasNext && onNextLetter) {
        e.preventDefault();
        onNextLetter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onPrevLetter, onNextLetter]);

  if (!letter) return null;

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
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)]">
                <IconComponent className="h-4 w-4" />
              </div>

              <Badge variant="primary" size="sm" className="font-serif">
                Open When Letter #{String(letter.order).padStart(2, '0')}
              </Badge>
            </div>

            <span className="text-xs text-[var(--color-muted)] flex items-center gap-1 font-serif">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              Personal Envelope
            </span>
          </div>

          <h2 className="text-h2 font-serif font-bold text-[var(--color-text)] leading-tight pt-1">
            {letter.title}
          </h2>

          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
            <p className="text-xs font-sans font-medium text-[var(--color-muted)] uppercase tracking-wider mb-0.5">
              When to read:
            </p>
            <p className="text-body text-[var(--color-primary)] italic font-serif">
              "{letter.trigger}"
            </p>
          </div>
        </div>

        {/* Full Letter Content with optimal typography & spacing */}
        <div className="text-[var(--color-text)] font-serif text-base sm:text-lg leading-relaxed space-y-4 py-2">
          {letter.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-[var(--color-text)]">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Footer Controls */}
        <div className="pt-6 border-t border-[var(--color-border-light)] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={onPrevLetter}
              disabled={!hasPrev}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              className="text-xs sm:text-sm min-h-[44px]"
              aria-label="Previous letter"
            >
              Previous Letter
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onNextLetter}
              disabled={!hasNext}
              rightIcon={<ChevronRight className="h-4 w-4" />}
              className="text-xs sm:text-sm min-h-[44px]"
              aria-label="Next letter"
            >
              Next Letter
            </Button>
          </div>

          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="text-xs sm:text-sm min-h-[44px] text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            Close Letter
          </Button>
        </div>
      </div>
    </Modal>
  );
};
