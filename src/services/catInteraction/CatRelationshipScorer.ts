import {
  CatDefinition,
  CatMilestone,
  CatProgressionProgress,
  CatRelationshipLevel,
  CatRelationshipState,
  UserCatMemory,
} from '../../types/catMeme';

/**
 * Standard relationship point rewards & deductions.
 */
export const RELATIONSHIP_POINTS = {
  ENCOUNTER_VISIBLE: 3,
  INTERACTIVE_PET: 8,
  INTERACTIVE_TREAT: 12,
  INTERACTIVE_DISMISS: -10, // Negative action: decreases relationship points
  GENERIC_REACTION: 10,
  LETTER_DRAFT_SAVED: 12,
  LETTER_SENT: 25,
  SECRET_UNLOCKED: 25,
  WISH_COMPLETED: 25,
  MOMENT_SAVED: 20,
  GLOBAL_SUCCESS: 15,
  GLOBAL_ERROR: 5,
};

/**
 * Helper to calculate current progression level, point bounds, and percentage.
 */
export function calculateLevelProgress(
  catDef: CatDefinition,
  points: number
): CatProgressionProgress {
  const levels = catDef.progression?.levels || [];
  if (levels.length === 0) {
    return {
      currentLevel: 1,
      currentLevelName: 'Feline Friend',
      currentPoints: points,
      pointsInCurrentLevel: points,
      pointsNeededForNextLevel: 100,
      progressPercent: 0,
      isMaxLevel: false,
      nextLevelName: 'Close Companion',
      remainingPointsToNext: 100,
    };
  }

  // Find the highest level achieved where points >= minPoints
  let currentLevelIdx = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].minPoints) {
      currentLevelIdx = i;
      break;
    }
  }

  const currentLevelObj = levels[currentLevelIdx];
  const isMaxLevel = currentLevelIdx === levels.length - 1;
  const nextLevelObj = isMaxLevel ? null : levels[currentLevelIdx + 1];

  let pointsInCurrentLevel = 0;
  let pointsNeededForNextLevel = 0;
  let progressPercent = 100;
  let remainingPointsToNext = 0;

  if (nextLevelObj) {
    const levelFloor = currentLevelObj.minPoints;
    const levelCeiling = nextLevelObj.minPoints;
    const levelSpan = levelCeiling - levelFloor;
    pointsInCurrentLevel = Math.max(0, points - levelFloor);
    pointsNeededForNextLevel = levelSpan;
    progressPercent = Math.min(100, Math.max(0, (pointsInCurrentLevel / levelSpan) * 100));
    remainingPointsToNext = Math.max(0, levelCeiling - points);
  } else {
    pointsInCurrentLevel = points - currentLevelObj.minPoints;
    pointsNeededForNextLevel = 0;
    progressPercent = 100;
    remainingPointsToNext = 0;
  }

  return {
    currentLevel: currentLevelObj.level,
    currentLevelName: currentLevelObj.name,
    currentPoints: Math.max(0, points),
    pointsInCurrentLevel,
    pointsNeededForNextLevel,
    progressPercent: Math.round(progressPercent),
    isMaxLevel,
    nextLevelName: nextLevelObj?.name,
    remainingPointsToNext,
  };
}

/**
 * Returns the CatRelationshipLevel object for a given point value.
 */
export function getLevelForPoints(
  catDef: CatDefinition,
  points: number
): CatRelationshipLevel {
  const levels = catDef.progression?.levels || [];
  if (levels.length === 0) {
    return {
      level: 1,
      name: 'Companion',
      minPoints: 0,
      description: 'A friendly feline acquaintance.',
      unlockedBehaviors: [],
      acknowledgementQuotes: ['Meow!'],
    };
  }

  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].minPoints) {
      return levels[i];
    }
  }
  return levels[0];
}

/**
 * Computes newly unlocked behaviors across all reached levels.
 */
export function getUnlockedBehaviorsForPoints(
  catDef: CatDefinition,
  points: number
): string[] {
  const levels = catDef.progression?.levels || [];
  const behaviors = new Set<string>();

  for (const lvl of levels) {
    if (points >= lvl.minPoints) {
      lvl.unlockedBehaviors.forEach((b) => behaviors.add(b));
    }
  }
  return Array.from(behaviors);
}

/**
 * Checks for major newly unlocked milestone history records.
 */
export function checkNewMilestones(
  catDef: CatDefinition,
  prevMemory: UserCatMemory | null,
  newPoints: number,
  newEncounterCount: number,
  newMeaningfulCount: number
): CatMilestone[] {
  const newMilestones: CatMilestone[] = [];
  const existingIds = new Set(prevMemory?.milestoneHistory.map((m) => m.id) || []);

  const now = new Date().toISOString();

  // 1. First Encounter Milestone
  if (newEncounterCount >= 1 && !existingIds.has(`${catDef.id}_first_encounter`)) {
    newMilestones.push({
      id: `${catDef.id}_first_encounter`,
      type: 'FIRST_ENCOUNTER',
      title: `First Met ${catDef.displayName}`,
      description: `First crossed paths with ${catDef.displayName} in Starlit Letters.`,
      achievedAt: now,
      pointsAtMilestone: newPoints,
      levelAchieved: 1,
    });
  }

  // 2. Relationship Level Up Milestones
  const currentLvl = getLevelForPoints(catDef, newPoints);
  const prevLvlNumber = prevMemory ? prevMemory.relationshipLevel : 1;

  if (currentLvl.level > prevLvlNumber) {
    for (let l = prevLvlNumber + 1; l <= currentLvl.level; l++) {
      const milestoneId = `${catDef.id}_level_${l}`;
      if (!existingIds.has(milestoneId)) {
        const lvlObj = catDef.progression?.levels.find((item) => item.level === l);
        newMilestones.push({
          id: milestoneId,
          type: 'RELATIONSHIP_LEVEL_UP',
          title: `Reached Level ${l}: ${lvlObj?.name || 'Bond Strengthened'}`,
          description: lvlObj?.description || `Unlocked new tier with ${catDef.displayName}.`,
          achievedAt: now,
          pointsAtMilestone: newPoints,
          levelAchieved: l,
        });
      }
    }
  }

  // 3. Meaningful Interaction Count Milestones (10, 25, 50, 100)
  const interactionThresholds = [10, 25, 50, 100];
  for (const threshold of interactionThresholds) {
    const milestoneId = `${catDef.id}_interactions_${threshold}`;
    if (newMeaningfulCount >= threshold && !existingIds.has(milestoneId)) {
      newMilestones.push({
        id: milestoneId,
        type: 'MEANINGFUL_INTERACTION_MILESTONE',
        title: `${threshold} Meaningful Moments`,
        description: `Shared ${threshold} interactive moments and letters with ${catDef.displayName}.`,
        achievedAt: now,
        pointsAtMilestone: newPoints,
        levelAchieved: currentLvl.level,
      });
    }
  }

  // 4. Encounter Count Milestones (20, 50, 100)
  const encounterThresholds = [20, 50, 100];
  for (const threshold of encounterThresholds) {
    const milestoneId = `${catDef.id}_encounters_${threshold}`;
    if (newEncounterCount >= threshold && !existingIds.has(milestoneId)) {
      newMilestones.push({
        id: milestoneId,
        type: 'SPECIAL_INTERACTION',
        title: `${threshold} Visits`,
        description: `${catDef.displayName} has visited you ${threshold} times.`,
        achievedAt: now,
        pointsAtMilestone: newPoints,
        levelAchieved: currentLvl.level,
      });
    }
  }

  return newMilestones;
}

/**
 * Derives the overarching relationship state enum.
 */
export function deriveRelationshipState(
  level: number,
  points: number,
  isDispleased: boolean = false
): CatRelationshipState {
  if (isDispleased) return 'displeased';
  if (level >= 7) return 'bestie';
  if (level >= 5) return 'devoted';
  if (level >= 4) return 'fond';
  if (level >= 3) return 'friendly';
  if (level >= 2) return 'curious';
  return 'stranger';
}

/**
 * Provides a modest appearance weight multiplier (+10% to +35%) based on relationship level.
 */
export function getAppearanceWeightMultiplier(relationshipLevel: number): number {
  switch (relationshipLevel) {
    case 7:
      return 1.35;
    case 6:
      return 1.25;
    case 5:
      return 1.2;
    case 4:
      return 1.15;
    case 3:
      return 1.1;
    case 2:
      return 1.05;
    default:
      return 1.0;
  }
}

/**
 * Resolves a level-appropriate acknowledgement dialogue.
 */
export function resolveRelationshipAcknowledgement(
  catDef: CatDefinition,
  level: number
): string | null {
  const levels = catDef.progression?.levels || [];
  const target = levels.find((l) => l.level === level) || levels[0];
  if (!target || !target.acknowledgementQuotes || target.acknowledgementQuotes.length === 0) {
    return null;
  }
  const idx = Math.floor(Math.random() * target.acknowledgementQuotes.length);
  return target.acknowledgementQuotes[idx];
}
