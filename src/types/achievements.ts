export type BadgeCategory = 'discovery' | 'milestone' | 'streak' | 'collection';

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: number;
  progressText?: string;
  secretHint?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string; // YYYY-MM-DD
  historyDates: string[]; // List of YYYY-MM-DD
}

export interface AchievementSummary {
  totalBadges: number;
  unlockedBadges: number;
  streak: StreakData;
  universePercentage: number;
  notesCount: number;
  wishesCount: number;
  secretsCount: number;
}
