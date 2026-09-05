import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import {
  TrackedUserOverview,
  SessionHistoryItem,
  TrackedUserDetail,
} from '../types/tracking';
import { fetchTrackedUserDetail } from './adminTrackingService';

export interface ForensicTimelineEvent {
  id: string;
  epoch: number;
  timestamp: string; // e.g. "04 SEP 2026  14:22:18"
  title: string;
  label: '[OPEN]' | '[VIEW]' | '[PLAY]' | '[UNLOCK]' | '[READ]' | '[DISCOVERED]';
  labelColor: 'emerald' | 'cyan' | 'amber' | 'indigo' | 'rose' | 'purple';
  details: { key: string; value: string }[];
}

export interface UserModuleRecord {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  timestampFormatted?: string;
  contentPreview?: string;
  details?: { [key: string]: any };
}

export interface UserForensicInspection {
  user: TrackedUserOverview;
  activitySignature: {
    notes: number;
    moments: number;
    wishes: number;
    secrets: number;
    letters: number;
    media: number;
    sessions: number;
    feelings: number;
    openWhen: number;
    achievements: number;
  };
  timelineEvents: ForensicTimelineEvent[];
  modules: {
    notes: UserModuleRecord[];
    wishes: UserModuleRecord[];
    moments: UserModuleRecord[];
    secrets: UserModuleRecord[];
    openWhen: UserModuleRecord[];
    feelings: UserModuleRecord[];
    letters: UserModuleRecord[];
    media: UserModuleRecord[];
    achievements: UserModuleRecord[];
    sessions: SessionHistoryItem[];
  };
}

/**
 * Format date to technical terminal timestamp: "04 SEP 2026  14:22:18"
 */
export function formatTerminalTimestamp(dateInput: any): string {
  if (!dateInput) return 'NO TIMESTAMP';
  let d: Date;
  if (dateInput instanceof Timestamp) {
    d = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else if (typeof dateInput === 'number') {
    d = new Date(dateInput);
  } else if (typeof dateInput === 'string') {
    d = new Date(dateInput);
  } else if (dateInput && typeof dateInput.seconds === 'number') {
    d = new Date(dateInput.seconds * 1000);
  } else {
    return 'NO TIMESTAMP';
  }

  if (isNaN(d.getTime())) return 'UNKNOWN TIMESTAMP';

  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${day} ${month} ${year}  ${hours}:${minutes}:${seconds}`;
}

/**
 * Convert various timestamp formats into epoch milliseconds
 */
function toEpoch(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (val instanceof Timestamp) return val.toMillis();
  if (val instanceof Date) return val.getTime();
  if (val && typeof val.seconds === 'number') return val.seconds * 1000;
  if (typeof val === 'string') {
    const parsed = new Date(val).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Fetch forensic detail for an inspected user across profile, activity, feelings, letters, and sessions
 */
export async function fetchUserForensicInspection(
  userId: string
): Promise<UserForensicInspection | null> {
  if (!isFirebaseConfigured || !userId) return null;

  try {
    // 1. Fetch base tracked user detail (overview, sessions, events, exploration)
    const trackedDetailPromise = fetchTrackedUserDetail(userId);

    // 2. Fetch direct user activity subcollection
    const activityQuery = query(
      collection(db, 'users', userId, 'activity'),
      orderBy('createdAt', 'desc'),
      limit(200)
    );
    const activityPromise = getDocs(activityQuery).catch(() => null);

    // 3. Fetch user feelings subcollection
    const feelingsQuery = query(
      collection(db, 'users', userId, 'feelings'),
      limit(100)
    );
    const feelingsPromise = getDocs(feelingsQuery).catch(() => null);

    // 4. Fetch user letters subcollection
    const lettersQuery = query(
      collection(db, 'users', userId, 'letters'),
      limit(100)
    );
    const lettersPromise = getDocs(lettersQuery).catch(() => null);

    const [trackedDetail, activitySnap, feelingsSnap, lettersSnap] =
      await Promise.all([
        trackedDetailPromise,
        activityPromise,
        feelingsPromise,
        lettersPromise,
      ]);

    if (!trackedDetail || !trackedDetail.user) {
      return null;
    }

    const user = trackedDetail.user;
    const summary = user.activitySummary || {};

    // Parse direct subcollection data
    const rawActivities: DocumentData[] = [];
    if (activitySnap && !activitySnap.empty) {
      activitySnap.forEach((docSnap) => {
        rawActivities.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });
    }

    const rawFeelings: DocumentData[] = [];
    if (feelingsSnap && !feelingsSnap.empty) {
      feelingsSnap.forEach((docSnap) => {
        rawFeelings.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });
    }

    const rawLetters: DocumentData[] = [];
    if (lettersSnap && !lettersSnap.empty) {
      lettersSnap.forEach((docSnap) => {
        rawLetters.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });
    }

    // Collections for module tabs
    const notesModule: UserModuleRecord[] = [];
    const wishesModule: UserModuleRecord[] = [];
    const momentsModule: UserModuleRecord[] = [];
    const secretsModule: UserModuleRecord[] = [];
    const openWhenModule: UserModuleRecord[] = [];
    const achievementsModule: UserModuleRecord[] = [];
    const feelingsModule: UserModuleRecord[] = [];
    const lettersModule: UserModuleRecord[] = [];
    const mediaModule: UserModuleRecord[] = [];

    // Track sets to prevent duplicates
    const seenNoteIds = new Set<string>();
    const seenWishIds = new Set<string>();
    const seenMomentIds = new Set<string>();
    const seenSecretIds = new Set<string>();
    const seenOpenWhenIds = new Set<string>();
    const seenMediaIds = new Set<string>();

    // Unified Timeline Events
    const timelineEvents: ForensicTimelineEvent[] = [];

    // Process direct activities from users/{uid}/activity
    rawActivities.forEach((act) => {
      const epoch = toEpoch(act.createdAt);
      const timestamp = formatTerminalTimestamp(act.createdAt);
      const type = act.type || 'unknown_activity';
      const itemId = act.itemId || act.id || 'N/A';
      const section = act.section || 'General';
      const meta = act.metadata || {};

      switch (type) {
        case 'note_opened': {
          const displayId = itemId.startsWith('#') ? itemId : `#${itemId}`;
          if (!seenNoteIds.has(itemId)) {
            seenNoteIds.add(itemId);
            notesModule.push({
              id: itemId,
              title: `Note ${displayId}`,
              subtitle: section,
              tag: 'OPENED',
              timestampFormatted: timestamp,
            });
          }
          timelineEvents.push({
            id: `act_${act.id}`,
            epoch,
            timestamp,
            title: 'NOTE OPENED',
            label: '[OPEN]',
            labelColor: 'emerald',
            details: [
              { key: 'NOTE', value: displayId },
              { key: 'SECTION', value: section },
            ],
          });
          break;
        }

        case 'moment_opened': {
          if (!seenMomentIds.has(itemId)) {
            seenMomentIds.add(itemId);
            momentsModule.push({
              id: itemId,
              title: `Moment ${itemId}`,
              subtitle: section,
              tag: 'OPENED',
              timestampFormatted: timestamp,
            });
          }
          timelineEvents.push({
            id: `act_${act.id}`,
            epoch,
            timestamp,
            title: 'MOMENT OPENED',
            label: '[OPEN]',
            labelColor: 'cyan',
            details: [
              { key: 'ID', value: itemId },
              { key: 'SECTION', value: section },
            ],
          });
          break;
        }

        case 'wish_collected': {
          if (!seenWishIds.has(itemId)) {
            seenWishIds.add(itemId);
            wishesModule.push({
              id: itemId,
              title: `Wish ${itemId}`,
              subtitle: section,
              tag: 'COLLECTED',
              timestampFormatted: timestamp,
            });
          }
          timelineEvents.push({
            id: `act_${act.id}`,
            epoch,
            timestamp,
            title: 'WISH OPENED',
            label: '[UNLOCK]',
            labelColor: 'amber',
            details: [
              { key: 'ID', value: itemId },
              { key: 'SECTION', value: section },
            ],
          });
          break;
        }

        case 'secret_discovered': {
          if (!seenSecretIds.has(itemId)) {
            seenSecretIds.add(itemId);
            secretsModule.push({
              id: itemId,
              title: `Secret ${itemId}`,
              subtitle: section,
              tag: 'DISCOVERED',
              timestampFormatted: timestamp,
            });
          }
          timelineEvents.push({
            id: `act_${act.id}`,
            epoch,
            timestamp,
            title: 'SECRET DISCOVERED',
            label: '[DISCOVERED]',
            labelColor: 'purple',
            details: [
              { key: 'ID', value: itemId },
              { key: 'SECTION', value: section },
            ],
          });
          break;
        }

        case 'open_when_opened': {
          if (!seenOpenWhenIds.has(itemId)) {
            seenOpenWhenIds.add(itemId);
            openWhenModule.push({
              id: itemId,
              title: `Letter: ${itemId}`,
              subtitle: section,
              tag: 'OPENED',
              timestampFormatted: timestamp,
            });
          }
          timelineEvents.push({
            id: `act_${act.id}`,
            epoch,
            timestamp,
            title: 'OPEN WHEN OPENED',
            label: '[READ]',
            labelColor: 'emerald',
            details: [
              { key: 'ID', value: itemId },
              { key: 'SECTION', value: section },
            ],
          });
          break;
        }

        case 'badge_unlocked':
        case 'milestone_unlocked': {
          achievementsModule.push({
            id: itemId,
            title: meta.badgeTitle || meta.title || itemId,
            subtitle: type === 'badge_unlocked' ? 'Badge' : 'Milestone',
            tag: 'UNLOCKED',
            timestampFormatted: timestamp,
          });
          timelineEvents.push({
            id: `act_${act.id}`,
            epoch,
            timestamp,
            title: type === 'badge_unlocked' ? 'BADGE UNLOCKED' : 'MILESTONE UNLOCKED',
            label: '[UNLOCK]',
            labelColor: 'amber',
            details: [
              { key: 'TITLE', value: meta.badgeTitle || meta.title || itemId },
              { key: 'CATEGORY', value: section },
            ],
          });
          break;
        }

        case 'feeling_submitted': {
          timelineEvents.push({
            id: `act_${act.id}`,
            epoch,
            timestamp,
            title: 'FEELING SUBMITTED',
            label: '[READ]',
            labelColor: 'indigo',
            details: [
              { key: 'ID', value: itemId },
              { key: 'STATUS', value: 'Recorded' },
            ],
          });
          break;
        }

        case 'letter_submitted': {
          timelineEvents.push({
            id: `act_${act.id}`,
            epoch,
            timestamp,
            title: 'LETTER SUBMITTED',
            label: '[READ]',
            labelColor: 'cyan',
            details: [
              { key: 'ID', value: itemId },
              { key: 'STATUS', value: 'Dispatched' },
            ],
          });
          break;
        }

        default: {
          timelineEvents.push({
            id: `act_${act.id}`,
            epoch,
            timestamp,
            title: type.replace(/_/g, ' ').toUpperCase(),
            label: '[VIEW]',
            labelColor: 'cyan',
            details: [
              { key: 'ITEM', value: itemId },
              { key: 'SECTION', value: section },
            ],
          });
          break;
        }
      }
    });

    // Process feelings collection
    rawFeelings.forEach((feel) => {
      const epoch = toEpoch(feel.createdAt);
      const timestamp = formatTerminalTimestamp(feel.createdAt);
      feelingsModule.push({
        id: feel.id,
        title: `Feeling #${feel.id.slice(0, 8)}`,
        subtitle: timestamp,
        tag: 'SUBMITTED',
        contentPreview: feel.content || feel.feeling || 'No content',
        timestampFormatted: timestamp,
      });

      // Also add to timeline if not already tracked by activity
      if (!rawActivities.some((a) => a.itemId === feel.id)) {
        timelineEvents.push({
          id: `feel_${feel.id}`,
          epoch,
          timestamp,
          title: 'FEELING RECORDED',
          label: '[READ]',
          labelColor: 'indigo',
          details: [
            { key: 'ID', value: feel.id.slice(0, 10) },
            { key: 'CONTENT_LENGTH', value: `${(feel.content || '').length} chars` },
          ],
        });
      }
    });

    // Process letters collection
    rawLetters.forEach((letDoc) => {
      const epoch = toEpoch(letDoc.createdAt);
      const timestamp = formatTerminalTimestamp(letDoc.createdAt);
      lettersModule.push({
        id: letDoc.id,
        title: letDoc.title || `Letter #${letDoc.id.slice(0, 8)}`,
        subtitle: timestamp,
        tag: 'SUBMITTED',
        contentPreview: letDoc.content || 'No text content',
        timestampFormatted: timestamp,
      });

      if (!rawActivities.some((a) => a.itemId === letDoc.id)) {
        timelineEvents.push({
          id: `let_${letDoc.id}`,
          epoch,
          timestamp,
          title: 'LETTER DISPATCHED',
          label: '[READ]',
          labelColor: 'cyan',
          details: [
            { key: 'TITLE', value: letDoc.title || 'Untitled' },
            { key: 'ID', value: letDoc.id.slice(0, 10) },
          ],
        });
      }
    });

    // Process tracking events (from sessions) to extract media views & item opens not in activity
    (trackedDetail.events || []).forEach((evt) => {
      const epoch = evt.clientEpoch || 0;
      const timestamp = formatTerminalTimestamp(epoch);
      const meta = evt.metadata || {};

      if (evt.type === 'media_viewed') {
        const mediaId = String(meta.mediaId || 'media');
        const mediaType = String(meta.mediaType || 'VIDEO').toUpperCase();
        const item = String(meta.title || meta.parentItemId || mediaId);

        if (!seenMediaIds.has(mediaId)) {
          seenMediaIds.add(mediaId);
          mediaModule.push({
            id: mediaId,
            title: item,
            subtitle: meta.section || 'Gallery',
            tag: mediaType,
            timestampFormatted: timestamp,
          });
        }

        timelineEvents.push({
          id: `evt_${evt.eventId}`,
          epoch,
          timestamp,
          title: 'MEDIA PLAYBACK',
          label: '[PLAY]',
          labelColor: 'cyan',
          details: [
            { key: 'TYPE', value: mediaType },
            { key: 'ITEM', value: item },
          ],
        });
      } else if (evt.type === 'item_opened' || evt.type === 'item_revisited') {
        const itemId = String(meta.itemId || 'unknown');
        const itemType = String(meta.itemType || 'item');
        const section = String(meta.section || 'General');

        // Check if item isn't in notes or moments or wishes module yet
        if (section.toLowerCase().includes('note') || itemType.toLowerCase() === 'note') {
          if (!seenNoteIds.has(itemId)) {
            seenNoteIds.add(itemId);
            notesModule.push({
              id: itemId,
              title: meta.title || `Note #${itemId}`,
              subtitle: section,
              tag: 'OPENED',
              timestampFormatted: timestamp,
            });
          }
        } else if (section.toLowerCase().includes('moment') || itemType.toLowerCase() === 'moment') {
          if (!seenMomentIds.has(itemId)) {
            seenMomentIds.add(itemId);
            momentsModule.push({
              id: itemId,
              title: meta.title || `Moment ${itemId}`,
              subtitle: section,
              tag: 'OPENED',
              timestampFormatted: timestamp,
            });
          }
        } else if (section.toLowerCase().includes('wish') || itemType.toLowerCase() === 'wish') {
          if (!seenWishIds.has(itemId)) {
            seenWishIds.add(itemId);
            wishesModule.push({
              id: itemId,
              title: meta.title || `Wish ${itemId}`,
              subtitle: section,
              tag: 'OPENED',
              timestampFormatted: timestamp,
            });
          }
        } else if (section.toLowerCase().includes('secret') || itemType.toLowerCase() === 'secret') {
          if (!seenSecretIds.has(itemId)) {
            seenSecretIds.add(itemId);
            secretsModule.push({
              id: itemId,
              title: meta.title || `Secret ${itemId}`,
              subtitle: section,
              tag: 'DISCOVERED',
              timestampFormatted: timestamp,
            });
          }
        }

        // Avoid adding duplicated timeline items if activity collection already logged it
        const alreadyInTimeline = timelineEvents.some(
          (t) => Math.abs(t.epoch - epoch) < 2000 && t.details.some((d) => d.value.includes(itemId))
        );

        if (!alreadyInTimeline) {
          const actionTitle = `${itemType.replace(/_/g, ' ').toUpperCase()} OPENED`;
          timelineEvents.push({
            id: `evt_${evt.eventId}`,
            epoch,
            timestamp,
            title: actionTitle,
            label: '[OPEN]',
            labelColor: 'emerald',
            details: [
              { key: 'ITEM', value: meta.title || itemId },
              { key: 'SECTION', value: section },
            ],
          });
        }
      }
    });

    // Ingest itemExploration from trackedDetail into module records if still unpopulated
    (trackedDetail.itemExploration || []).forEach((item) => {
      const sec = item.section.toLowerCase();
      if (sec.includes('note') && !seenNoteIds.has(item.itemId)) {
        seenNoteIds.add(item.itemId);
        notesModule.push({
          id: item.itemId,
          title: item.title,
          subtitle: item.section,
          tag: 'OPENED',
          timestampFormatted: item.lastOpenedFormatted,
        });
      } else if (sec.includes('moment') && !seenMomentIds.has(item.itemId)) {
        seenMomentIds.add(item.itemId);
        momentsModule.push({
          id: item.itemId,
          title: item.title,
          subtitle: item.section,
          tag: 'OPENED',
          timestampFormatted: item.lastOpenedFormatted,
        });
      } else if (sec.includes('wish') && !seenWishIds.has(item.itemId)) {
        seenWishIds.add(item.itemId);
        wishesModule.push({
          id: item.itemId,
          title: item.title,
          subtitle: item.section,
          tag: 'COLLECTED',
          timestampFormatted: item.lastOpenedFormatted,
        });
      } else if (sec.includes('secret') && !seenSecretIds.has(item.itemId)) {
        seenSecretIds.add(item.itemId);
        secretsModule.push({
          id: item.itemId,
          title: item.title,
          subtitle: item.section,
          tag: 'DISCOVERED',
          timestampFormatted: item.lastOpenedFormatted,
        });
      }
    });

    // Ingest mediaExploration from trackedDetail
    (trackedDetail.mediaExploration || []).forEach((media) => {
      if (!seenMediaIds.has(media.mediaId)) {
        seenMediaIds.add(media.mediaId);
        mediaModule.push({
          id: media.mediaId,
          title: media.title || media.mediaId,
          subtitle: media.section || 'Media Vault',
          tag: media.mediaType.toUpperCase(),
          timestampFormatted: media.lastViewedFormatted,
        });
      }
    });

    // Sort timeline strictly descending (newest first)
    timelineEvents.sort((a, b) => b.epoch - a.epoch);

    // Compute activity signature strictly matching database counts
    const notesCount = Math.max(
      summary.notesOpened ?? 0,
      notesModule.length
    );
    const momentsCount = Math.max(
      summary.momentsOpened ?? 0,
      momentsModule.length
    );
    const wishesCount = Math.max(
      summary.wishesCollected ?? 0,
      wishesModule.length
    );
    const secretsCount = Math.max(
      summary.secretsDiscovered ?? 0,
      secretsModule.length
    );
    const lettersCount = Math.max(
      summary.lettersSubmitted ?? 0,
      lettersModule.length
    );
    const feelingsCount = Math.max(
      summary.feelingsSubmitted ?? 0,
      feelingsModule.length
    );
    const mediaCount = Math.max(
      summary.mediaViewed ?? 0,
      mediaModule.length
    );
    const sessionsCount = Math.max(
      user.totalVisits ?? 0,
      trackedDetail.sessions.length
    );
    const openWhenCount = Math.max(
      summary.openWhenOpened ?? 0,
      openWhenModule.length
    );
    const achievementsCount = Math.max(
      summary.badgesUnlocked ?? 0,
      achievementsModule.length
    );

    return {
      user,
      activitySignature: {
        notes: notesCount,
        moments: momentsCount,
        wishes: wishesCount,
        secrets: secretsCount,
        letters: lettersCount,
        media: mediaCount,
        sessions: sessionsCount,
        feelings: feelingsCount,
        openWhen: openWhenCount,
        achievements: achievementsCount,
      },
      timelineEvents,
      modules: {
        notes: notesModule,
        wishes: wishesModule,
        moments: momentsModule,
        secrets: secretsModule,
        openWhen: openWhenModule,
        feelings: feelingsModule,
        letters: lettersModule,
        media: mediaModule,
        achievements: achievementsModule,
        sessions: trackedDetail.sessions,
      },
    };
  } catch (error) {
    console.error(`[UserInspectionService] Error building forensic inspection for ${userId}:`, error);
    return null;
  }
}
