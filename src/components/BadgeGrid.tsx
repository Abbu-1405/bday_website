import React, { useState } from 'react';
import {
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
  CheckCircle2,
  LockKeyhole,
  Info,
  X,
  Filter,
} from 'lucide-react';
import { BadgeItem } from '../types/achievements';
import { Surface, Badge, Modal } from '../components';
import { cn } from '../utils';

interface BadgeGridProps {
  badges: BadgeItem[];
  className?: string;
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

export const BadgeGrid: React.FC<BadgeGridProps> = ({ badges, className }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  const filteredBadges = badges.filter((b) => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'locked') return !b.unlocked;
    return true;
  });

  const totalUnlocked = badges.filter((b) => b.unlocked).length;
  const isAllUnlocked = totalUnlocked === badges.length && badges.length > 0;
  const isNoneUnlocked = totalUnlocked === 0;

  const IconCompSelected = selectedBadge ? ICON_MAP[selectedBadge.iconName] || Sparkles : Sparkles;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Top Header & Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-[var(--color-primary)]" />
          <h2 className="text-h3 font-serif font-bold text-[var(--color-text)] tracking-tight">
            DISCOVERY BADGES
          </h2>
          <Badge variant="secondary" size="sm" className="font-serif">
            {totalUnlocked} / {badges.length} Unlocked
          </Badge>
        </div>

        {/* Filter Buttons */}
        <div className="inline-flex p-1 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-xs font-serif">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1 rounded-full transition-colors cursor-pointer',
              filter === 'all'
                ? 'bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-2xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            className={cn(
              'px-3 py-1 rounded-full transition-colors cursor-pointer',
              filter === 'unlocked'
                ? 'bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-2xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            )}
          >
            Unlocked
          </button>
          <button
            type="button"
            onClick={() => setFilter('locked')}
            className={cn(
              'px-3 py-1 rounded-full transition-colors cursor-pointer',
              filter === 'locked'
                ? 'bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-2xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            )}
          >
            Locked
          </button>
        </div>
      </div>

      {/* Special Message Banners for Empty State or Completion State */}
      {isNoneUnlocked && (
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-xs font-serif italic text-[var(--color-text-secondary)] flex items-center gap-2">
          <Info className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
          <span>&quot;Your first discovery is still waiting.&quot; Step into any chapter below to unlock your first badge.</span>
        </div>
      )}

      {isAllUnlocked && (
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-success)]/30 text-xs font-serif text-[var(--color-success)] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] shrink-0" />
          <span>🌟 &quot;Every little discovery, discovered.&quot; You have gathered all available badges in Starlit Letters!</span>
        </div>
      )}

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredBadges.map((badge) => {
          const IconComp = ICON_MAP[badge.iconName] || Sparkles;

          return (
            <Surface
              key={badge.id}
              variant="interactive"
              padding="md"
              onClick={() => setSelectedBadge(badge)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedBadge(badge);
                }
              }}
              className={cn(
                'border transition-all duration-300 cursor-pointer space-y-3 relative overflow-hidden group flex flex-col justify-between',
                badge.unlocked
                  ? 'border-[var(--color-border-light)] bg-[var(--color-card)] hover:border-[var(--color-primary)] shadow-xs'
                  : 'border-[var(--color-border-light)]/60 bg-[var(--color-surface)]/60 opacity-70 hover:opacity-90 hover:border-[var(--color-border)]'
              )}
              aria-label={`Badge ${badge.title}. ${badge.unlocked ? 'Unlocked' : 'Locked'}`}
            >
              <div className="space-y-2.5">
                {/* Header row: Icon + State Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border transition-all',
                      badge.unlocked
                        ? 'bg-[var(--color-surface-secondary)] border-[var(--color-primary)]/30 text-[var(--color-primary)] shadow-2xs'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)]'
                    )}
                  >
                    {badge.unlocked ? (
                      <IconComp className="h-5 w-5" />
                    ) : (
                      <LockKeyhole className="h-4 w-4 text-[var(--color-muted)]" />
                    )}
                  </div>

                  {badge.unlocked ? (
                    <span className="inline-flex items-center text-[10px] font-mono text-[var(--color-success)] bg-[var(--color-surface-secondary)] px-2 py-0.5 rounded-full border border-[var(--color-border-light)]">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-mono text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] px-2 py-0.5 rounded-full border border-[var(--color-border-light)]">
                      Locked
                    </span>
                  )}
                </div>

                {/* Title and description */}
                <div className="space-y-1">
                  <h3
                    className={cn(
                      'text-body-sm font-serif font-bold transition-colors',
                      badge.unlocked
                        ? 'text-[var(--color-text)] group-hover:text-[var(--color-primary)]'
                        : 'text-[var(--color-text-secondary)]'
                    )}
                  >
                    {badge.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] font-serif line-clamp-2 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Footer progress/status info */}
              <div className="pt-2 border-t border-[var(--color-border-light)] flex items-center justify-between text-[11px] font-serif text-[var(--color-text-secondary)]">
                <span>{badge.progressText || (badge.unlocked ? 'Achieved' : 'In Progress')}</span>
                <span className="text-[var(--color-primary)] font-semibold group-hover:translate-x-0.5 transition-transform">
                  Details →
                </span>
              </div>
            </Surface>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      <Modal
        isOpen={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
        title={selectedBadge?.title || 'Badge Details'}
      >
        {selectedBadge && (
          <div className="space-y-5 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center border shrink-0',
                  selectedBadge.unlocked
                    ? 'bg-[var(--color-card)] border-[var(--color-primary)] text-[var(--color-primary)] shadow-sm'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)]'
                )}
              >
                {selectedBadge.unlocked ? (
                  <IconCompSelected className="h-8 w-8" />
                ) : (
                  <LockKeyhole className="h-7 w-7" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h3 className="text-h3 font-serif font-bold text-[var(--color-text)]">
                    {selectedBadge.title}
                  </h3>
                  {selectedBadge.unlocked ? (
                    <Badge variant="success" size="sm" className="font-serif">
                      Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="secondary" size="sm" className="font-serif">
                      Locked
                    </Badge>
                  )}
                </div>
                <p className="text-body-sm font-serif text-[var(--color-text-secondary)] italic">
                  {selectedBadge.description}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-serif text-[var(--color-text-secondary)] bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border-light)]">
              <div className="flex justify-between">
                <span>Requirement Status:</span>
                <span className="font-semibold text-[var(--color-text)]">
                  {selectedBadge.progressText || (selectedBadge.unlocked ? 'Completed' : 'Locked')}
                </span>
              </div>

              {selectedBadge.unlocked && selectedBadge.unlockedAt && (
                <div className="flex justify-between border-t border-[var(--color-border-light)] pt-1.5">
                  <span>Discovered On:</span>
                  <span className="font-mono text-[var(--color-primary)]">
                    {new Date(selectedBadge.unlockedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2 text-xs font-serif rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors border border-[var(--color-border)] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
