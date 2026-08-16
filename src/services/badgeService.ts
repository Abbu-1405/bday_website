import { BadgeItem, AchievementSummary } from '../types/achievements';
import { getStageProgress, getOverallProgress, ensureFirstVisitRecorded } from './discoveryService';
import { recordDailyVisit } from './streakService';
import { recordActivity } from './activityService';

const UNLOCKED_BADGES_KEY = 'starlit_unlocked_badges';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  category: BadgeItem['category'];
  iconName: string;
  checkUnlocked: (context: EvaluationContext) => boolean;
  getProgressText: (context: EvaluationContext) => string;
}

export interface EvaluationContext {
  notesCount: number;
  adoreCount: number;
  momentsCount: number;
  wishesCount: number;
  openWhenCount: number;
  whatAmIToYouCount: number;
  secretsCount: number;
  currentStreak: number;
  longestStreak: number;
  firstVisitTimestamp: number;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Stepped into the quiet universe of Starlit Letters.',
    category: 'milestone',
    iconName: 'Compass',
    checkUnlocked: () => true,
    getProgressText: () => '1 / 1 Step',
  },
  {
    id: 'first-note',
    title: 'First Note',
    description: 'Opened your first note in 365 Notes.',
    category: 'discovery',
    iconName: 'Calendar',
    checkUnlocked: (ctx) => ctx.notesCount >= 1,
    getProgressText: (ctx) => `${ctx.notesCount} / 1 Note`,
  },
  {
    id: 'memory-keeper',
    title: 'Memory Keeper',
    description: 'Discovered a keepsake moment in Memories.',
    category: 'discovery',
    iconName: 'Camera',
    checkUnlocked: (ctx) => ctx.momentsCount >= 1,
    getProgressText: (ctx) => `${ctx.momentsCount} / 1 Moment`,
  },
  {
    id: 'little-things',
    title: 'Little Things',
    description: 'Explored cherished qualities in Adore.',
    category: 'discovery',
    iconName: 'Heart',
    checkUnlocked: (ctx) => ctx.adoreCount >= 1,
    getProgressText: (ctx) => `${ctx.adoreCount} / 1 Trait`,
  },
  {
    id: 'a-wish',
    title: 'A Wish',
    description: 'Collected a floating wish lantern in Wishes.',
    category: 'discovery',
    iconName: 'Sparkles',
    checkUnlocked: (ctx) => ctx.wishesCount >= 1,
    getProgressText: (ctx) => `${ctx.wishesCount} / 1 Wish`,
  },
  {
    id: 'when-you-need-it',
    title: 'When You Need It',
    description: 'Opened a personal envelope in Open When.',
    category: 'discovery',
    iconName: 'Mail',
    checkUnlocked: (ctx) => ctx.openWhenCount >= 1,
    getProgressText: (ctx) => `${ctx.openWhenCount} / 1 Envelope`,
  },
  {
    id: 'reflection',
    title: 'Reflection',
    description: 'Shared an unspoken feeling or written letter.',
    category: 'discovery',
    iconName: 'Feather',
    checkUnlocked: (ctx) => ctx.whatAmIToYouCount >= 1,
    getProgressText: (ctx) => `${ctx.whatAmIToYouCount} / 1 Letter`,
  },
  {
    id: 'curious',
    title: 'Curious',
    description: 'Unlocked a quiet secret in Secret Vault.',
    category: 'discovery',
    iconName: 'Lock',
    checkUnlocked: (ctx) => ctx.secretsCount >= 1,
    getProgressText: (ctx) => `${ctx.secretsCount} / 1 Secret`,
  },
  {
    id: 'one-week',
    title: 'One Week',
    description: 'Visited our starlit space across 7 days.',
    category: 'streak',
    iconName: 'Clock',
    checkUnlocked: (ctx) => ctx.currentStreak >= 7 || ctx.longestStreak >= 7,
    getProgressText: (ctx) => `${Math.max(ctx.currentStreak, ctx.longestStreak)} / 7 Days`,
  },
  {
    id: 'two-weeks',
    title: 'Two Weeks',
    description: 'Visited our starlit space across 14 days.',
    category: 'streak',
    iconName: 'Star',
    checkUnlocked: (ctx) => ctx.currentStreak >= 14 || ctx.longestStreak >= 14,
    getProgressText: (ctx) => `${Math.max(ctx.currentStreak, ctx.longestStreak)} / 14 Days`,
  },
  {
    id: 'one-month',
    title: 'One Month',
    description: 'Visited our starlit space across 30 days.',
    category: 'streak',
    iconName: 'Award',
    checkUnlocked: (ctx) => ctx.currentStreak >= 30 || ctx.longestStreak >= 30,
    getProgressText: (ctx) => `${Math.max(ctx.currentStreak, ctx.longestStreak)} / 30 Days`,
  },
  {
    id: 'note-keeper',
    title: 'Note Keeper',
    description: 'Discovered 50 notes across the year.',
    category: 'collection',
    iconName: 'BookOpen',
    checkUnlocked: (ctx) => ctx.notesCount >= 50,
    getProgressText: (ctx) => `${ctx.notesCount} / 50 Notes`,
  },
];

function getUnlockedBadgesMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(UNLOCKED_BADGES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Safe fallback
  }
  return {};
}

function saveUnlockedBadgesMap(map: Record<string, number>): void {
  try {
    localStorage.setItem(UNLOCKED_BADGES_KEY, JSON.stringify(map));
  } catch {
    // Safe storage fallback
  }
}

/**
 * Main evaluation function for badges and achievements
 */
export function evaluateBadges(): {
  badges: BadgeItem[];
  newlyUnlocked: BadgeItem[];
  summary: AchievementSummary;
} {
  const streak = recordDailyVisit();
  const firstVisitTimestamp = ensureFirstVisitRecorded();
  const stageProgress = getStageProgress();
  const overall = getOverallProgress();

  const notesCount = stageProgress.find((s) => s.key === 'notes365')?.discovered ?? 0;
  const adoreCount = stageProgress.find((s) => s.key === 'adore')?.discovered ?? 0;
  const momentsCount = stageProgress.find((s) => s.key === 'moments')?.discovered ?? 0;
  const wishesCount = stageProgress.find((s) => s.key === 'wishes')?.discovered ?? 0;
  const openWhenCount = stageProgress.find((s) => s.key === 'openWhen')?.discovered ?? 0;
  const whatAmIToYouCount = stageProgress.find((s) => s.key === 'whatAmIToYou')?.discovered ?? 0;
  const secretsCount = stageProgress.find((s) => s.key === 'secretVault')?.discovered ?? 0;

  const context: EvaluationContext = {
    notesCount,
    adoreCount,
    momentsCount,
    wishesCount,
    openWhenCount,
    whatAmIToYouCount,
    secretsCount,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    firstVisitTimestamp,
  };

  const unlockedMap = getUnlockedBadgesMap();
  const updatedUnlockedMap = { ...unlockedMap };
  const newlyUnlocked: BadgeItem[] = [];

  const badges: BadgeItem[] = BADGE_DEFINITIONS.map((def) => {
    const isUnlocked = def.checkUnlocked(context);
    let unlockedAt = updatedUnlockedMap[def.id];

    if (isUnlocked) {
      if (!unlockedAt) {
        unlockedAt = Date.now();
        updatedUnlockedMap[def.id] = unlockedAt;
        newlyUnlocked.push({
          id: def.id,
          title: def.title,
          description: def.description,
          category: def.category,
          iconName: def.iconName,
          unlocked: true,
          unlockedAt,
          progressText: def.getProgressText(context),
        });
      }
    }

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      category: def.category,
      iconName: def.iconName,
      unlocked: isUnlocked,
      unlockedAt,
      progressText: def.getProgressText(context),
    };
  });

  if (newlyUnlocked.length > 0) {
    saveUnlockedBadgesMap(updatedUnlockedMap);

    // Record activity events for newly unlocked badges / milestones
    for (const badge of newlyUnlocked) {
      recordActivity({
        type: 'badge_unlocked',
        section: 'achievements',
        itemId: badge.id,
      });

      if (badge.category === 'milestone') {
        recordActivity({
          type: 'milestone_unlocked',
          section: 'milestones',
          itemId: badge.id,
        });
      }
    }
  }

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const summary: AchievementSummary = {
    totalBadges: badges.length,
    unlockedBadges: unlockedCount,
    streak,
    universePercentage: overall.percentage,
    notesCount,
    wishesCount,
    secretsCount,
  };

  return {
    badges,
    newlyUnlocked,
    summary,
  };
}
