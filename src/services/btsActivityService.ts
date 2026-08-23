import {
  collection,
  collectionGroup,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from '../firebase';
import {
  BtsActivityType,
  BtsActivityEvent,
  BtsItem,
  BtsUserSummary,
  BtsAdminOverviewStats,
  BtsItemType,
} from '../types';

export interface BtsActivityParams {
  eventType: BtsActivityType;
  itemId: string;
  itemTitle?: string;
  itemType?: BtsItemType;
  metadata?: Record<string, any>;
  customActivityId?: string;
  userIdOverride?: string;
}

// Session memory caches to prevent duplicate logging within single page lifecycle
const pageVisitLoggedUids = new Set<string>();
const mediaPlayLoggedKeys = new Set<string>();

/**
 * Sanitize event metadata to prevent logging sensitive text or excessive payload size.
 */
function sanitizeBtsMetadata(raw?: Record<string, any>): Record<string, any> | undefined {
  if (!raw) return undefined;
  const copy = { ...raw };
  delete copy.password;
  delete copy.token;
  delete copy.secret;
  return copy;
}

/**
 * Deterministic or unique activity ID generator
 */
function generateBtsActivityId(type: BtsActivityType, itemId: string, customId?: string): string {
  if (customId) return customId;
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7);
  const cleanItemId = itemId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  return `${type}_${cleanItemId}_${timestamp}_${randomStr}`;
}

/**
 * Record a BTS activity event under `users/{userId}/btsActivity/{activityId}`
 * Failsafe: Completely non-blocking and silent on offline or unauthenticated conditions.
 */
export async function recordBtsActivity(params: BtsActivityParams): Promise<void> {
  if (!isFirebaseConfigured) return;

  const activeUserId = params.userIdOverride || auth.currentUser?.uid;
  if (!activeUserId) {
    // Graceful skip for unauthenticated guests
    return;
  }

  const { eventType, itemId, itemTitle, itemType, metadata, customActivityId } = params;
  const cleanMetadata = sanitizeBtsMetadata(metadata);
  const activityId = generateBtsActivityId(eventType, itemId, customActivityId);

  try {
    const activityRef = doc(db, 'users', activeUserId, 'btsActivity', activityId);
    await setDoc(
      activityRef,
      {
        userId: activeUserId,
        eventType,
        itemId,
        ...(itemTitle ? { itemTitle } : {}),
        ...(itemType ? { itemType } : {}),
        createdAt: serverTimestamp(),
        ...(cleanMetadata && Object.keys(cleanMetadata).length > 0 ? { metadata: cleanMetadata } : {}),
      },
      { merge: true }
    );
  } catch (error) {
    // Non-blocking warning: activity recording failures must never disrupt user experience
    console.warn('[BTS Tracking] Notice:', error);
  }
}

/**
 * Record BTS page open (deduplicated per session)
 */
export async function recordBtsPageOpen(): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || pageVisitLoggedUids.has(currentUid)) return;
  pageVisitLoggedUids.add(currentUid);

  await recordBtsActivity({
    eventType: 'bts_page_open',
    itemId: 'bts_main_view',
    itemTitle: 'Behind The Scenes Unlocked View',
  });
}

/**
 * Record BTS item modal open
 */
export async function recordBtsItemOpen(item: BtsItem): Promise<void> {
  await recordBtsActivity({
    eventType: 'bts_item_open',
    itemId: item.id,
    itemTitle: item.title,
    itemType: item.type,
    metadata: {
      date: item.date,
      downloadable: item.downloadable,
    },
  });
}

/**
 * Record BTS video playback start (deduplicated per session per item)
 */
export async function recordBtsVideoPlay(item: BtsItem): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  const key = `${currentUid}_video_${item.id}`;
  if (mediaPlayLoggedKeys.has(key)) return;
  mediaPlayLoggedKeys.add(key);

  await recordBtsActivity({
    eventType: 'bts_video_play',
    itemId: item.id,
    itemTitle: item.title,
    itemType: 'video',
    metadata: {
      duration: item.duration || 'unknown',
    },
  });
}

/**
 * Record BTS audio playback start (deduplicated per session per item)
 */
export async function recordBtsAudioPlay(item: BtsItem): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  const key = `${currentUid}_audio_${item.id}`;
  if (mediaPlayLoggedKeys.has(key)) return;
  mediaPlayLoggedKeys.add(key);

  await recordBtsActivity({
    eventType: 'bts_audio_play',
    itemId: item.id,
    itemTitle: item.title,
    itemType: 'audio',
    metadata: {
      duration: item.duration || 'unknown',
    },
  });
}

/**
 * Record Random BTS trigger
 */
export async function recordBtsRandom(selectedItem: BtsItem): Promise<void> {
  await recordBtsActivity({
    eventType: 'bts_random',
    itemId: selectedItem.id,
    itemTitle: selectedItem.title,
    itemType: selectedItem.type,
  });
}

/**
 * Record Standalone HTML open
 */
export async function recordBtsHtmlOpenExternal(item: BtsItem): Promise<void> {
  await recordBtsActivity({
    eventType: 'bts_html_open_external',
    itemId: item.id,
    itemTitle: item.title,
    itemType: 'html',
  });
}

/**
 * Format Firestore timestamp safely into human-readable string
 */
function formatFirestoreTimestamp(rawTimestamp: any): string {
  if (!rawTimestamp) return 'Recently';
  try {
    if (rawTimestamp.toDate) {
      return rawTimestamp.toDate().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (rawTimestamp.seconds) {
      return new Date(rawTimestamp.seconds * 1000).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (typeof rawTimestamp === 'string') {
      return new Date(rawTimestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch {
    return 'Recently';
  }
  return 'Recently';
}

/**
 * Fetch high-level admin statistics for BTS
 */
export async function fetchBtsAdminOverviewStats(): Promise<BtsAdminOverviewStats> {
  const defaultStats: BtsAdminOverviewStats = {
    totalUsers: 0,
    totalVisits: 0,
    totalItemsOpened: 0,
    totalPlays: 0,
    totalRandoms: 0,
    formatBreakdown: {
      photos: 0,
      videos: 0,
      audio: 0,
      pdfs: 0,
      html: 0,
    },
  };

  if (!isFirebaseConfigured) return defaultStats;

  try {
    const actGroupRef = collectionGroup(db, 'btsActivity');
    const snapshot = await getDocs(query(actGroupRef, limit(1000)));

    if (snapshot.empty) return defaultStats;

    const userVisitCounts = new Map<string, number>();
    const userItemOpenCounts = new Map<string, number>();
    const itemOpenCounts = new Map<string, { count: number; title: string; type: BtsItemType }>();

    let totalVisits = 0;
    let totalItemsOpened = 0;
    let totalPlays = 0;
    let totalRandoms = 0;

    const formatBreakdown = {
      photos: 0,
      videos: 0,
      audio: 0,
      pdfs: 0,
      html: 0,
    };

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const userId = data.userId || 'anonymous';
      const eventType = data.eventType as BtsActivityType;
      const itemId = data.itemId || '';
      const itemTitle = data.itemTitle || itemId;
      const itemType = data.itemType as BtsItemType;

      if (eventType === 'bts_page_open') {
        totalVisits++;
        userVisitCounts.set(userId, (userVisitCounts.get(userId) || 0) + 1);
      } else if (eventType === 'bts_item_open') {
        totalItemsOpened++;
        userItemOpenCounts.set(userId, (userItemOpenCounts.get(userId) || 0) + 1);

        if (itemId) {
          const prev = itemOpenCounts.get(itemId) || { count: 0, title: itemTitle, type: itemType || 'image' };
          itemOpenCounts.set(itemId, { ...prev, count: prev.count + 1 });
        }

        if (itemType === 'image') formatBreakdown.photos++;
        else if (itemType === 'video') formatBreakdown.videos++;
        else if (itemType === 'audio') formatBreakdown.audio++;
        else if (itemType === 'pdf') formatBreakdown.pdfs++;
        else if (itemType === 'html') formatBreakdown.html++;
      } else if (eventType === 'bts_video_play' || eventType === 'bts_audio_play') {
        totalPlays++;
      } else if (eventType === 'bts_random') {
        totalRandoms++;
      }
    });

    // Determine unique users
    const allActiveUsers = new Set<string>([...userVisitCounts.keys(), ...userItemOpenCounts.keys()]);

    // Find most active user
    let topUserId = '';
    let topUserScore = -1;
    allActiveUsers.forEach((uid) => {
      const score = (userVisitCounts.get(uid) || 0) * 2 + (userItemOpenCounts.get(uid) || 0);
      if (score > topUserScore) {
        topUserScore = score;
        topUserId = uid;
      }
    });

    // Find most popular item
    let mostPopularItem: BtsAdminOverviewStats['mostPopularItem'] = undefined;
    let maxItemOpens = 0;
    itemOpenCounts.forEach((val, key) => {
      if (val.count > maxItemOpens) {
        maxItemOpens = val.count;
        mostPopularItem = {
          itemId: key,
          itemTitle: val.title,
          itemType: val.type,
          openCount: val.count,
        };
      }
    });

    return {
      totalUsers: allActiveUsers.size,
      totalVisits,
      totalItemsOpened,
      totalPlays,
      totalRandoms,
      mostActiveUser: topUserId
        ? {
            userId: topUserId,
            displayName: topUserId.substring(0, 8),
            email: 'Authenticated User',
            visitCount: userVisitCounts.get(topUserId) || 0,
            itemsOpened: userItemOpenCounts.get(topUserId) || 0,
          }
        : undefined,
      mostPopularItem,
      formatBreakdown,
    };
  } catch (error) {
    console.warn('[BTS Admin] Error fetching overview stats:', error);
    return defaultStats;
  }
}

/**
 * Fetch detailed user summaries for BTS activity
 */
export async function fetchBtsUserSummaries(): Promise<BtsUserSummary[]> {
  if (!isFirebaseConfigured) return [];

  try {
    // 1. Fetch registered users profiles to correlate emails and names
    const usersMap = new Map<string, { displayName: string; email: string; photoURL?: string }>();
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), limit(200)));
      usersSnap.forEach((uDoc) => {
        const uData = uDoc.data();
        usersMap.set(uDoc.id, {
          displayName: uData.displayName || 'User',
          email: uData.email || 'No email',
          photoURL: uData.photoURL,
        });
      });
    } catch (uErr) {
      console.warn('[BTS Admin] User lookup notice:', uErr);
    }

    // 2. Fetch BTS activity collectionGroup
    const actGroupRef = collectionGroup(db, 'btsActivity');
    const snapshot = await getDocs(query(actGroupRef, limit(1000)));

    const summaryMap = new Map<string, BtsUserSummary>();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const userId = data.userId || 'unknown';
      const eventType = data.eventType as BtsActivityType;
      const itemId = data.itemId || '';
      const itemTitle = data.itemTitle || itemId;
      const itemType = (data.itemType as BtsItemType) || 'image';
      const createdStr = formatFirestoreTimestamp(data.createdAt);

      let summary = summaryMap.get(userId);
      if (!summary) {
        const profile = usersMap.get(userId);
        summary = {
          userId,
          displayName: profile?.displayName || `User (${userId.substring(0, 6)})`,
          email: profile?.email || 'N/A',
          photoURL: profile?.photoURL,
          firstVisit: createdStr,
          lastVisit: createdStr,
          firstVisitRaw: data.createdAt,
          lastVisitRaw: data.createdAt,
          totalVisits: 0,
          totalItemsOpened: 0,
          totalPlays: 0,
          totalRandomClicks: 0,
          itemInteractions: {},
        };
        summaryMap.set(userId, summary);
      }

      // Update timestamps
      summary.lastVisit = createdStr;
      summary.lastVisitRaw = data.createdAt;

      // Update counters
      if (eventType === 'bts_page_open') {
        summary.totalVisits++;
      } else if (eventType === 'bts_item_open') {
        summary.totalItemsOpened++;
      } else if (eventType === 'bts_video_play' || eventType === 'bts_audio_play') {
        summary.totalPlays++;
      } else if (eventType === 'bts_random') {
        summary.totalRandomClicks++;
      }

      // Update item interaction record
      if (itemId && itemId !== 'bts_main_view') {
        const existingItem = summary.itemInteractions[itemId] || {
          itemId,
          itemTitle,
          itemType,
          openCount: 0,
          playCount: 0,
          firstInteracted: createdStr,
          lastInteracted: createdStr,
        };

        if (eventType === 'bts_item_open') {
          existingItem.openCount++;
        } else if (eventType === 'bts_video_play' || eventType === 'bts_audio_play') {
          existingItem.playCount++;
        }

        existingItem.lastInteracted = createdStr;
        summary.itemInteractions[itemId] = existingItem;
      }
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.totalItemsOpened - a.totalItemsOpened);
  } catch (error) {
    console.warn('[BTS Admin] Error fetching user summaries:', error);
    return [];
  }
}

export interface BtsRecentActivityFilter {
  userId?: string;
  eventType?: string;
  itemType?: string;
  searchQuery?: string;
}

/**
 * Fetch chronological BTS recent activity feed
 */
export async function fetchBtsRecentActivity(
  filters: BtsRecentActivityFilter = {},
  maxCount: number = 60
): Promise<BtsActivityEvent[]> {
  if (!isFirebaseConfigured) return [];

  try {
    const actGroupRef = collectionGroup(db, 'btsActivity');
    const q = query(actGroupRef, orderBy('createdAt', 'desc'), limit(maxCount * 2));
    const snapshot = await getDocs(q);

    // Correlate with users
    const usersMap = new Map<string, { displayName: string; email: string; photoURL?: string }>();
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), limit(200)));
      usersSnap.forEach((uDoc) => {
        const uData = uDoc.data();
        usersMap.set(uDoc.id, {
          displayName: uData.displayName || 'User',
          email: uData.email || 'No email',
          photoURL: uData.photoURL,
        });
      });
    } catch {}

    const events: BtsActivityEvent[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      const userId = data.userId || 'unknown';
      const eventType = data.eventType as BtsActivityType;
      const itemType = data.itemType as BtsItemType;
      const itemTitle = data.itemTitle || data.itemId || '';

      // Filters
      if (filters.userId && filters.userId !== 'all' && userId !== filters.userId) return;
      if (filters.eventType && filters.eventType !== 'all' && eventType !== filters.eventType) return;
      if (filters.itemType && filters.itemType !== 'all' && itemType !== filters.itemType) return;

      if (filters.searchQuery?.trim()) {
        const queryTerm = filters.searchQuery.toLowerCase().trim();
        const titleMatch = itemTitle.toLowerCase().includes(queryTerm);
        const userProfile = usersMap.get(userId);
        const nameMatch = userProfile?.displayName?.toLowerCase().includes(queryTerm) ?? false;
        const emailMatch = userProfile?.email?.toLowerCase().includes(queryTerm) ?? false;
        const idMatch = data.itemId?.toLowerCase().includes(queryTerm) ?? false;

        if (!titleMatch && !nameMatch && !emailMatch && !idMatch) return;
      }

      const profile = usersMap.get(userId);
      events.push({
        id: docSnap.id,
        userId,
        eventType,
        itemId: data.itemId || '',
        itemTitle,
        itemType,
        createdAt: formatFirestoreTimestamp(data.createdAt),
        timestampRaw: data.createdAt,
        metadata: data.metadata || {},
        userDisplayName: profile?.displayName || `User (${userId.substring(0, 6)})`,
        userEmail: profile?.email || 'N/A',
        userPhotoURL: profile?.photoURL,
      });
    });

    return events.slice(0, maxCount);
  } catch (error) {
    console.warn('[BTS Admin] Error fetching recent activity feed:', error);
    return [];
  }
}
