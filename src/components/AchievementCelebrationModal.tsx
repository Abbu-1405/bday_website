import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, Compass, Calendar, Camera, Heart, Mail, Feather, Lock, Clock, Star, Award, BookOpen } from 'lucide-react';
import { BadgeItem } from '../types/achievements';
import { Surface, Button } from '../components';
import { useAudio } from '../contexts';

interface AchievementCelebrationModalProps {
  badge: BadgeItem | null;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Compass,
  Calendar,
  Camera,
  Heart,
  Sparkles,
  Mail,
  Feather,
  Lock,
  Clock,
  Star,
  Award,
  BookOpen,
};

export const AchievementCelebrationModal: React.FC<AchievementCelebrationModalProps> = ({
  badge,
  onClose,
}) => {
  const { playBadgeFanfare } = useAudio();

  useEffect(() => {
    if (badge) {
      playBadgeFanfare();
    }
  }, [badge]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (badge) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [badge, onClose]);

  if (!badge) return null;

  const IconComp = ICON_MAP[badge.iconName] || Sparkles;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      <div
        className="relative w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Surface
          variant="elevated"
          padding="lg"
          className="border border-[var(--color-border-light)] bg-[var(--color-card)] shadow-lg space-y-5 text-center relative rounded-2xl"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close celebration"
            className="absolute top-3 right-3 p-1 text-[var(--color-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Sparkle Header Motif */}
          <div className="flex justify-center items-center gap-2 pt-2">
            <Sparkles className="h-4 w-4 text-[var(--color-accent)] animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-[var(--color-primary)] uppercase font-semibold">
              NEW DISCOVERY
            </span>
            <Sparkles className="h-4 w-4 text-[var(--color-accent)] animate-pulse" />
          </div>

          {/* Badge Icon Artwork Placeholder */}
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-b from-[var(--color-surface-secondary)] to-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] shadow-sm">
            <IconComp className="h-8 w-8" />
          </div>

          {/* Badge Content */}
          <div className="space-y-1.5">
            <h3 id="celebration-title" className="text-h3 font-serif font-bold text-[var(--color-text)]">
              {badge.title}
            </h3>
            <p className="text-body-sm font-serif italic text-[var(--color-text-secondary)] px-2">
              &quot;{badge.description}&quot;
            </p>
          </div>

          {/* Subtle Action Button */}
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="w-full font-serif text-xs rounded-full"
            >
              Continue Journey
            </Button>
          </div>
        </Surface>
      </div>
    </div>,
    document.body
  );
};
