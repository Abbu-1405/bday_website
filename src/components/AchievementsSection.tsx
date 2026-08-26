import React, { useEffect, useState } from 'react';
import { Award, Compass, Sparkles, BookOpen, Lock, Star } from 'lucide-react';
import { BadgeItem, AchievementSummary } from '../types/achievements';
import { evaluateBadges } from '../services/badgeService';
import { Surface, Badge } from '../components';
import { BadgeGrid } from './BadgeGrid';
import { StreakPresentation } from './StreakPresentation';
import { AchievementCelebrationModal } from './AchievementCelebrationModal';

interface AchievementsSectionProps {
  className?: string;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ className }) => {
  const [data, setData] = useState<{
    badges: BadgeItem[];
    newlyUnlocked: BadgeItem[];
    summary: AchievementSummary;
  } | null>(null);

  const [activeCelebrationBadge, setActiveCelebrationBadge] = useState<BadgeItem | null>(null);

  useEffect(() => {
    const res = evaluateBadges();
    setData(res);

    if (res.newlyUnlocked && res.newlyUnlocked.length > 0) {
      setActiveCelebrationBadge(res.newlyUnlocked[0]);
    }
  }, []);

  if (!data) return null;

  const { badges, summary } = data;

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* 1. Progress Summary Ribbon */}
      <Surface
        variant="elevated"
        padding="md"
        className="border border-[var(--color-border-light)] bg-[var(--color-card)] space-y-4 shadow-xs"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--color-primary)] animate-spin-slow" />
            <h2 className="text-h3 font-serif font-bold text-[var(--color-text)]">
              DISCOVERY SUMMARY
            </h2>
          </div>
          <Badge variant="primary" size="sm" className="font-serif">
            {summary.universePercentage}% Universe Explored
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="p-3 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-serif text-[var(--color-text-secondary)] justify-center sm:justify-start">
              <BookOpen className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
              <span>Notes Read</span>
            </div>
            <p className="text-h3 font-serif font-bold text-[var(--color-text)]">
              {summary.notesCount} <span className="text-xs font-normal text-[var(--color-text-secondary)]">/ 365</span>
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-serif text-[var(--color-text-secondary)] justify-center sm:justify-start">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)] shrink-0" />
              <span>Wishes</span>
            </div>
            <p className="text-h3 font-serif font-bold text-[var(--color-text)]">
              {summary.wishesCount} <span className="text-xs font-normal text-[var(--color-text-secondary)]">/ 20</span>
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-serif text-[var(--color-text-secondary)] justify-center sm:justify-start">
              <Lock className="h-3.5 w-3.5 text-[var(--color-secondary)] shrink-0" />
              <span>Secrets</span>
            </div>
            <p className="text-h3 font-serif font-bold text-[var(--color-text)]">
              {summary.secretsCount} <span className="text-xs font-normal text-[var(--color-text-secondary)]">/ 7</span>
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-serif text-[var(--color-text-secondary)] justify-center sm:justify-start">
              <Award className="h-3.5 w-3.5 text-[var(--color-success)] shrink-0" />
              <span>Badges</span>
            </div>
            <p className="text-h3 font-serif font-bold text-[var(--color-text)]">
              {summary.unlockedBadges} <span className="text-xs font-normal text-[var(--color-text-secondary)]">/ {summary.totalBadges}</span>
            </p>
          </div>
        </div>
      </Surface>

      {/* 2. Streak Presentation */}
      <StreakPresentation streak={summary.streak} />

      {/* 3. Badge Grid */}
      <BadgeGrid badges={badges} />

      {/* Celebration Modal when new badge unlocked */}
      <AchievementCelebrationModal
        badge={activeCelebrationBadge}
        onClose={() => setActiveCelebrationBadge(null)}
      />
    </div>
  );
};
