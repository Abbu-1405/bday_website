import { notesProgressService } from '../utils/notesProgressService';
import { getCollectedWishIds } from '../utils/wishesStorage';
import { getDiscoveredSecretIds, discoverSecret } from '../utils/secretVaultStorage';
import { ROUTES } from '../constants/routes';

export type JourneyState = 'NOT STARTED' | 'PARTIALLY EXPLORED' | 'EXPLORED' | 'COMPLETED';

export interface StageProgress {
  key: string;
  title: string;
  route: string;
  discovered: number;
  total: number;
  percentage: number;
  state: JourneyState;
  description: string;
  iconName: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp?: number;
  dateDisplay?: string;
  type: 'milestone' | 'discovery' | 'start';
  iconName: string;
}

import { recordActivity, ActivityType } from './activityService';
import { notifyOpenWhenAvailable, notifyMomentAvailable } from './notificationService';
import { auth } from '../firebase';

const STORAGE_KEYS = {
  FIRST_VISIT: 'starlit_first_visit_time',
  ADORE: 'starlit_adore_discovered',
  MOMENTS: 'starlit_moments_discovered',
  OPEN_WHEN: 'starlit_open_when_opened',
  WHAT_AM_I_TO_YOU: 'starlit_what_am_i_to_you_submitted',
};

function getStoredArray(key: string): string[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function storeArray(key: string, arr: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    // Safe storage fallback
  }
}

/**
  * Mark an item as discovered for sections using lightweight localStorage arrays
  */
export function markSectionItemDiscovered(sectionKey: string, itemId: string): void {
  const keyMap: Record<string, string> = {
    adore: STORAGE_KEYS.ADORE,
    moments: STORAGE_KEYS.MOMENTS,
    openWhen: STORAGE_KEYS.OPEN_WHEN,
    whatAmIToYou: STORAGE_KEYS.WHAT_AM_I_TO_YOU,
  };

  const storageKey = keyMap[sectionKey];
  if (!storageKey) return;

  const current = getStoredArray(storageKey);
  if (!current.includes(itemId)) {
    storeArray(storageKey, [...current, itemId]);

    // Record activity event
    const activityTypeMap: Record<string, ActivityType> = {
      adore: 'adore_opened',
      moments: 'moment_opened',
      openWhen: 'open_when_opened',
      whatAmIToYou: 'feeling_submitted',
    };
    const actType = activityTypeMap[sectionKey];
    if (actType) {
      recordActivity({
        type: actType,
        section: sectionKey,
        itemId,
      });
    }

    // Phase 2 Notification Event dispatch
    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      if (sectionKey === 'openWhen') {
        notifyOpenWhenAvailable(currentUid, itemId, 'Open When Envelope').catch((err) => {
          console.warn('[NotificationEngine] Notice queuing open-when event:', err);
        });
      } else if (sectionKey === 'moments') {
        notifyMomentAvailable(currentUid, itemId).catch((err) => {
          console.warn('[NotificationEngine] Notice queuing moment event:', err);
        });
      }
    }
  }
}

/**
 * Record a discovery across any section in the universe (unified central API)
 */
export function recordDiscovery(sectionType: string, itemId: string): void {
  if (sectionType === 'secret' || sectionType === 'secretVault') {
    discoverSecret(itemId);
  } else {
    markSectionItemDiscovered(sectionType, itemId);
  }
}

/**
 * Record first visit timestamp if not set
 */
export function ensureFirstVisitRecorded(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FIRST_VISIT);
    if (stored) {
      return parseInt(stored, 10);
    }
    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, now.toString());
    return now;
  } catch {
    return Date.now();
  }
}

/**
 * Determine dynamic state based on count vs total
 */
function calculateState(discovered: number, total: number): JourneyState {
  if (discovered <= 0) return 'NOT STARTED';
  if (discovered >= total) return 'COMPLETED';
  return 'PARTIALLY EXPLORED';
}

/**
 * Get individual stage progress for a specific major section
 */
export function getStageProgress(): StageProgress[] {
  const notesRead = notesProgressService.getReadNoteIds().length;
  const adoreDiscovered = getStoredArray(STORAGE_KEYS.ADORE).length;
  const momentsDiscovered = getStoredArray(STORAGE_KEYS.MOMENTS).length;
  const wishesCollected = getCollectedWishIds().length;
  const openWhenOpened = getStoredArray(STORAGE_KEYS.OPEN_WHEN).length;
  const whatAmIToYouSubmitted = getStoredArray(STORAGE_KEYS.WHAT_AM_I_TO_YOU).length;
  const secretsDiscovered = getDiscoveredSecretIds().length;

  return [
    {
      key: 'notes365',
      title: '365 NOTES',
      route: ROUTES.NOTES_365,
      discovered: notesRead,
      total: 365,
      percentage: Math.round((notesRead / 365) * 100),
      state: calculateState(notesRead, 365),
      description: 'Little thoughts waiting to be discovered daily.',
      iconName: 'Calendar',
    },
    {
      key: 'adore',
      title: 'ADORE',
      route: ROUTES.ADORE,
      discovered: adoreDiscovered,
      total: 20,
      percentage: Math.round((adoreDiscovered / 20) * 100),
      state: calculateState(adoreDiscovered, 20),
      description: 'Twenty cherished qualities held with deep affection.',
      iconName: 'Heart',
    },
    {
      key: 'moments',
      title: 'MOMENTS',
      route: ROUTES.MOMENTS,
      discovered: momentsDiscovered,
      total: 10,
      percentage: Math.round((momentsDiscovered / 10) * 100),
      state: calculateState(momentsDiscovered, 10),
      description: 'Shared memories, starlit walks, and quiet hours.',
      iconName: 'Camera',
    },
    {
      key: 'wishes',
      title: 'WISHES',
      route: ROUTES.WISHES,
      discovered: wishesCollected,
      total: 20,
      percentage: Math.round((wishesCollected / 20) * 100),
      state: calculateState(wishesCollected, 20),
      description: 'Floating lanterns carrying heartfelt hopes for your year.',
      iconName: 'Sparkles',
    },
    {
      key: 'openWhen',
      title: 'OPEN WHEN',
      route: ROUTES.OPEN_WHEN,
      discovered: openWhenOpened,
      total: 12,
      percentage: Math.round((openWhenOpened / 12) * 100),
      state: calculateState(openWhenOpened, 12),
      description: 'Personal envelopes written for quiet or difficult days.',
      iconName: 'Mail',
    },
    {
      key: 'whatAmIToYou',
      title: 'WHAT AM I TO YOU?',
      route: ROUTES.WHAT_AM_I_TO_YOU,
      discovered: whatAmIToYouSubmitted,
      total: 2,
      percentage: Math.round((whatAmIToYouSubmitted / 2) * 100),
      state: calculateState(whatAmIToYouSubmitted, 2),
      description: 'Unspoken feelings and written letters held safely.',
      iconName: 'Feather',
    },
    {
      key: 'secretVault',
      title: 'SECRET VAULT',
      route: ROUTES.SECRET_VAULT,
      discovered: secretsDiscovered,
      total: 7,
      percentage: Math.round((secretsDiscovered / 7) * 100),
      state: calculateState(secretsDiscovered, 7),
      description: 'Hidden notes and quiet treasures tucked away.',
      iconName: 'Lock',
    },
  ];
}

/**
 * Calculates overall exploration percentage dynamically across the universe
 */
export function getOverallProgress(): {
  totalDiscovered: number;
  totalUniverse: number;
  percentage: number;
} {
  const stages = getStageProgress();
  const totalDiscovered = stages.reduce((acc, s) => acc + s.discovered, 0);
  const totalUniverse = stages.reduce((acc, s) => acc + s.total, 0); // 436 total items
  const percentage = Math.round((totalDiscovered / totalUniverse) * 100);

  return {
    totalDiscovered,
    totalUniverse,
    percentage,
  };
}

export type JourneyCompletionState =
  | 'BEGINNING'
  | 'EXPLORING'
  | 'DEEPER_IN'
  | 'ALMOST_THERE'
  | 'FULL_CIRCLE';

export interface JourneyCompletionInfo {
  state: JourneyCompletionState;
  label: string;
  description: string;
  percentage: number;
}

export function getJourneyCompletionInfo(): JourneyCompletionInfo {
  const overall = getOverallProgress();
  const pct = overall.percentage;

  if (pct === 0) {
    return {
      state: 'BEGINNING',
      label: 'Beginning',
      description: 'Your little universe is only beginning to unfold. Step into any section to make your first discovery.',
      percentage: pct,
    };
  } else if (pct <= 20) {
    return {
      state: 'BEGINNING',
      label: 'Beginning',
      description: 'Your little universe is only beginning to unfold. So many quiet stars are waiting to be found.',
      percentage: pct,
    };
  } else if (pct <= 50) {
    return {
      state: 'EXPLORING',
      label: 'Exploring',
      description: 'Little by little, more of this universe is coming into light.',
      percentage: pct,
    };
  } else if (pct <= 80) {
    return {
      state: 'DEEPER_IN',
      label: 'Deeper In',
      description: "You've wandered through quite a few hidden corners.",
      percentage: pct,
    };
  } else if (pct < 100) {
    return {
      state: 'ALMOST_THERE',
      label: 'Almost There',
      description: 'Almost every little star has been found.',
      percentage: pct,
    };
  } else {
    return {
      state: 'FULL_CIRCLE',
      label: 'Full Circle',
      description: "You've explored every little corner that was waiting for you. Every star is lit.",
      percentage: pct,
    };
  }
}

/**
 * Dynamic discovery timeline based on user achievements so far
 */
export function getDiscoveryTimeline(): TimelineEvent[] {
  const firstVisitTime = ensureFirstVisitRecorded();
  const dateStr = new Date(firstVisitTime).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const events: TimelineEvent[] = [
    {
      id: 'start-journey',
      title: 'Your Story Begins Here',
      description: 'Stepped into the quiet starlit universe.',
      timestamp: firstVisitTime,
      dateDisplay: dateStr,
      type: 'start',
      iconName: 'Compass',
    },
  ];

  // 1. Wishes collected individually
  const collectedWishes = getCollectedWishIds();
  if (collectedWishes.length > 0) {
    collectedWishes.forEach((wishId) => {
      const cleanNum = wishId.toString().replace('wish-', '').replace(/^0+/, '');
      const paddedNum = cleanNum ? cleanNum.padStart(2, '0') : '01';
      events.push({
        id: `wish-${wishId}`,
        title: 'A Floating Wish',
        description: `You caught wish lantern #${paddedNum}.`,
        type: 'discovery',
        iconName: 'Sparkles',
      });
    });
  }

  // 2. Secrets discovered (Without revealing secret details/titles)
  const discoveredSecrets = getDiscoveredSecretIds();
  if (discoveredSecrets.length > 0) {
    discoveredSecrets.forEach((secId) => {
      events.push({
        id: `secret-${secId}`,
        title: 'A Hidden Corner',
        description: 'You found a hidden corner of this universe.',
        type: 'discovery',
        iconName: 'Lock',
      });
    });
  }

  // 3. Stage progress events
  const stages = getStageProgress();

  stages.forEach((stage) => {
    if (stage.discovered > 0) {
      if (stage.key === 'notes365') {
        events.push({
          id: 'first-note',
          title: 'A Piece of the Story',
          description: `You opened ${stage.discovered} of 365 starlit notes.`,
          type: 'discovery',
          iconName: 'Calendar',
        });
      } else if (stage.key === 'adore') {
        events.push({
          id: 'first-adore',
          title: 'A Cherished Quality',
          description: `You explored ${stage.discovered} of 20 adored traits.`,
          type: 'discovery',
          iconName: 'Heart',
        });
      } else if (stage.key === 'moments') {
        events.push({
          id: 'first-moment',
          title: 'A Keepsake Memory',
          description: `You revisited ${stage.discovered} of 10 shared memories.`,
          type: 'discovery',
          iconName: 'Camera',
        });
      } else if (stage.key === 'openWhen') {
        events.push({
          id: 'first-open-when',
          title: 'A Sealed Envelope',
          description: `You opened ${stage.discovered} of 12 personal letters.`,
          type: 'discovery',
          iconName: 'Mail',
        });
      } else if (stage.key === 'whatAmIToYou') {
        events.push({
          id: 'first-feeling',
          title: 'An Unspoken Reflection',
          description: 'You left a little piece of yourself here.',
          type: 'discovery',
          iconName: 'Feather',
        });
      }
    }

    if (stage.state === 'COMPLETED') {
      events.push({
        id: `completed-${stage.key}`,
        title: `${stage.title} — Fully Explored`,
        description: `You have brought all ${stage.total} items in this section into light.`,
        type: 'milestone',
        iconName: 'CheckCircle2',
      });
    }
  });

  return events;
}

/**
 * Get list of remaining undiscovered item counts across sections.
 * Note: For Secret Vault, no titles or locations are revealed—only remaining count.
 */
export function getRemainingDiscoveries(): { key: string; name: string; remaining: number }[] {
  const stages = getStageProgress();
  return stages
    .map((stage) => ({
      key: stage.key,
      name: stage.title,
      remaining: Math.max(0, stage.total - stage.discovered),
    }))
    .filter((s) => s.remaining > 0);
}

/**
 * Determine currently active or most recently explored section
 */
export function getCurrentExploration(): StageProgress | null {
  const stages = getStageProgress();
  const partiallyExplored = stages.filter((s) => s.state === 'PARTIALLY EXPLORED');
  if (partiallyExplored.length > 0) {
    // Return the one with highest progress
    return partiallyExplored.sort((a, b) => b.percentage - a.percentage)[0];
  }
  const notStarted = stages.filter((s) => s.state === 'NOT STARTED');
  if (notStarted.length > 0) {
    return notStarted[0];
  }
  return stages[0] || null;
}
