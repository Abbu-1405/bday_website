import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from '../firebase';
import { getStageProgress } from './discoveryService';

export type ActivityType =
  | 'note_opened'
  | 'adore_opened'
  | 'moment_opened'
  | 'wish_collected'
  | 'open_when_opened'
  | 'feeling_submitted'
  | 'letter_submitted'
  | 'secret_discovered'
  | 'journey_discovered'
  | 'milestone_unlocked'
  | 'badge_unlocked'
  | 'streak_updated';

export interface ActivityParams {
  type: ActivityType;
  section: string;
  itemId: string;
  metadata?: Record<string, any>;
  customActivityId?: string;
  userIdOverride?: string;
}

/**
 * Clean metadata to strictly enforce privacy constraints:
 * Private user text content (feelings, letters, notes text) MUST NOT be stored in activity logs.
 */
function sanitizeMetadata(raw?: Record<string, any>): Record<string, any> | undefined {
  if (!raw) return undefined;
  const copy = { ...raw };
  // Redact any potential private content keys
  delete copy.content;
  delete copy.text;
  delete copy.feeling;
  delete copy.letterContent;
  delete copy.body;
  return copy;
}

/**
 * Generate a deterministic activity ID to prevent duplicate discovery events.
 */
function getDeterministicActivityId(type: ActivityType, itemId: string, customId?: string): string {
  if (customId) return customId;
  const cleanItemId = itemId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  return `${type}_${cleanItemId}`;
}

/**
 * Record a meaningful user activity event in Firestore under users/{uid}/activity/{activityId}
 * Failsafe: Returns quietly if unauthenticated, offline, or if Firebase is unavailable.
 */
export async function recordActivity(params: ActivityParams): Promise<void> {
  if (!isFirebaseConfigured) return;

  const activeUserId = params.userIdOverride || auth.currentUser?.uid;
  if (!activeUserId) {
    // Unauthenticated user — skip private activity write gracefully
    return;
  }

  const { type, section, itemId, metadata, customActivityId } = params;
  const cleanMetadata = sanitizeMetadata(metadata);
  const activityId = getDeterministicActivityId(type, itemId, customActivityId);

  try {
    const activityRef = doc(db, 'users', activeUserId, 'activity', activityId);
    await setDoc(
      activityRef,
      {
        userId: activeUserId,
        type,
        section,
        itemId,
        createdAt: serverTimestamp(),
        ...(cleanMetadata && Object.keys(cleanMetadata).length > 0 ? { metadata: cleanMetadata } : {}),
      },
      { merge: true }
    );

    // Synchronize lightweight activity summary on the user profile document
    await syncUserActivitySummary(activeUserId);
  } catch (error) {
    // Non-blocking log — activity logging failure must not break the UI
    console.warn('Activity logging deferred/failed:', error);
  }
}

/**
 * Update lightweight activity counters on users/{uid} document.
 */
async function syncUserActivitySummary(userId: string): Promise<void> {
  try {
    const stageProgress = getStageProgress();
    const notesOpened = stageProgress.find((s) => s.key === 'notes365')?.discovered ?? 0;
    const adoreOpened = stageProgress.find((s) => s.key === 'adore')?.discovered ?? 0;
    const momentsOpened = stageProgress.find((s) => s.key === 'moments')?.discovered ?? 0;
    const wishesCollected = stageProgress.find((s) => s.key === 'wishes')?.discovered ?? 0;
    const openWhenOpened = stageProgress.find((s) => s.key === 'openWhen')?.discovered ?? 0;
    const feelingsSubmitted = stageProgress.find((s) => s.key === 'whatAmIToYou')?.discovered ?? 0;
    const secretsDiscovered = stageProgress.find((s) => s.key === 'secretVault')?.discovered ?? 0;

    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        activitySummary: {
          notesOpened,
          adoreOpened,
          momentsOpened,
          wishesCollected,
          openWhenOpened,
          secretsDiscovered,
          feelingsSubmitted,
          lastUpdated: serverTimestamp(),
        },
      },
      { merge: true }
    );
  } catch {
    // Ignore summary sync errors gracefully
  }
}
