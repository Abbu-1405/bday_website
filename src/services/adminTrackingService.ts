import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  limit,
  orderBy,
  onSnapshot,
  Unsubscribe,
  DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import {
  TrackedUserOverview,
  TrackingSummaryMetrics,
  UserSession,
  TrackingEvent,
  TrackedUserDetail,
  SessionHistoryItem,
  SectionExplorationStat,
  ItemExplorationStat,
  MediaExplorationStat,
  SearchHistoryItem,
  FilterHistoryItem,
  SneakPeekHistoryItem,
  NavigationHistoryItem,
  ErrorHistoryItem,
  LiveActiveUser,
  LiveFeedItem,
  LiveSessionInfo,
  LiveConnectionStatus,
  LiveUserStatus,
} from '../types/tracking';
import { getSectionFromPath } from './userTrackingService';

/**
 * Format duration in seconds into human-readable string: "3h 24m", "45m 12s", or "18s".
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const sec = Math.round(seconds);
  if (sec < 60) return `${sec}s`;
  const minutes = Math.floor(sec / 60);
  const remainingSec = sec % 60;
  if (minutes < 60) {
    return remainingSec > 0 ? `${minutes}m ${remainingSec}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return remainingMin > 0 ? `${hours}h ${remainingMin}m` : `${hours}h`;
}

/**
 * Format epoch timestamp into friendly date/time.
 */
export function formatTimestamp(epoch: number | null): string {
  if (!epoch || epoch <= 0) return 'Never';
  const date = new Date(epoch);
  if (isNaN(date.getTime())) return 'Unknown';

  const now = Date.now();
  const diffMs = now - epoch;
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Extract epoch milliseconds from a Firestore timestamp, date string, or number.
 */
function extractEpoch(val: any): number | null {
  if (!val) return null;
  if (typeof val === 'number') return val;
  if (val.toMillis && typeof val.toMillis === 'function') {
    return val.toMillis();
  }
  if (val.seconds) {
    return val.seconds * 1000 + (val.nanoseconds || 0) / 1000000;
  }
  if (typeof val === 'string') {
    const parsed = Date.parse(val);
    if (!isNaN(parsed)) return parsed;
  }
  if (val instanceof Date) {
    return val.getTime();
  }
  return null;
}

/**
 * Computes the duration in seconds of a single session document.
 */
function calculateSessionDurationSeconds(session: Partial<UserSession> & DocumentData): number {
  if (typeof session.durationSeconds === 'number' && session.durationSeconds > 0) {
    return session.durationSeconds;
  }

  const startEpoch =
    session.createdAtClientEpoch ||
    extractEpoch(session.startedAt) ||
    0;

  const endEpoch =
    extractEpoch(session.endedAt) ||
    session.lastActivityClientEpoch ||
    extractEpoch(session.lastActivityAt) ||
    startEpoch;

  if (startEpoch > 0 && endEpoch >= startEpoch) {
    const rawSec = (endEpoch - startEpoch) / 1000;
    // Cap single unclosed runaway session to max 6 hours to prevent skew
    return Math.min(rawSec, 6 * 3600);
  }

  return 0;
}

/**
 * Determine user activity status based on last activity epoch.
 */
function determineUserStatus(lastActiveEpoch: number | null): 'online' | 'recent' | 'inactive' {
  if (!lastActiveEpoch) return 'inactive';
  const now = Date.now();
  const diffMs = now - lastActiveEpoch;

  // Active within last 15 minutes = online
  if (diffMs <= 15 * 60 * 1000) {
    return 'online';
  }
  // Active within last 24 hours = recent
  if (diffMs <= 24 * 60 * 60 * 1000) {
    return 'recent';
  }
  return 'inactive';
}

/**
 * Fetch all registered users and aggregate their activity tracking sessions.
 * 100% READ-ONLY operation.
 */
export async function fetchTrackedUsersOverview(): Promise<TrackedUserOverview[]> {
  if (!isFirebaseConfigured) return [];

  try {
    // 1. Fetch all user profile documents from /users
    const usersSnap = await getDocs(collection(db, 'users'));
    const userDocsMap = new Map<string, DocumentData>();

    usersSnap.forEach((docSnap) => {
      userDocsMap.set(docSnap.id, { uid: docSnap.id, ...docSnap.data() });
    });

    // 2. Fetch sessions across all users via collectionGroup
    const sessionsByUserId = new Map<string, DocumentData[]>();

    try {
      const sessionsQuery = query(collectionGroup(db, 'sessions'), limit(2000));
      const sessionsSnap = await getDocs(sessionsQuery);

      sessionsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const userId = data.userId || docSnap.ref.parent.parent?.id;
        if (userId) {
          const list = sessionsByUserId.get(userId) || [];
          list.push({ sessionId: docSnap.id, ...data });
          sessionsByUserId.set(userId, list);
        }
      });
    } catch (groupErr) {
      console.warn('[AdminTracking] collectionGroup query fallback:', groupErr);

      // Fallback: query subcollection /users/{userId}/sessions for each user
      await Promise.all(
        Array.from(userDocsMap.keys()).map(async (uid) => {
          try {
            const userSessionsSnap = await getDocs(
              query(collection(db, 'users', uid, 'sessions'), limit(100))
            );
            const list: DocumentData[] = [];
            userSessionsSnap.forEach((sSnap) => {
              list.push({ sessionId: sSnap.id, ...sSnap.data() });
            });
            if (list.length > 0) {
              sessionsByUserId.set(uid, list);
            }
          } catch (subErr) {
            console.warn(`[AdminTracking] Failed fetching sessions for user ${uid}:`, subErr);
          }
        })
      );
    }

    // 3. Build comprehensive TrackedUserOverview for each user
    const trackedUsers: TrackedUserOverview[] = [];

    userDocsMap.forEach((userData, uid) => {
      const userSessions = sessionsByUserId.get(uid) || [];

      // Sort user sessions by start time ascending for first visit, descending for latest
      let earliestEpoch: number | null = null;
      let latestEpoch: number | null = null;
      let totalTimeSpentSeconds = 0;
      let latestSession: DocumentData | null = null;

      // Extract user profile timestamps as baseline
      const profileCreatedEpoch = extractEpoch(userData.createdAt);
      const profileLastSeenEpoch = extractEpoch(userData.lastSeenAt);

      if (profileCreatedEpoch) earliestEpoch = profileCreatedEpoch;
      if (profileLastSeenEpoch) latestEpoch = profileLastSeenEpoch;

      userSessions.forEach((sess) => {
        const startEpoch =
          sess.createdAtClientEpoch ||
          extractEpoch(sess.startedAt);

        const activeEpoch =
          sess.lastActivityClientEpoch ||
          extractEpoch(sess.lastActivityAt) ||
          extractEpoch(sess.endedAt) ||
          startEpoch;

        if (startEpoch) {
          if (!earliestEpoch || startEpoch < earliestEpoch) {
            earliestEpoch = startEpoch;
          }
        }

        if (activeEpoch) {
          if (!latestEpoch || activeEpoch > latestEpoch) {
            latestEpoch = activeEpoch;
          }
        }

        // Keep track of the most recent session object
        if (
          !latestSession ||
          (activeEpoch &&
            activeEpoch >
              (latestSession.lastActivityClientEpoch ||
                extractEpoch(latestSession.lastActivityAt) ||
                0))
        ) {
          latestSession = sess;
        }

        totalTimeSpentSeconds += calculateSessionDurationSeconds(sess);
      });

      // Total visits count
      const recordedVisits = userData.visitSummary?.totalVisits;
      const totalVisits = Math.max(
        typeof recordedVisits === 'number' ? recordedVisits : 0,
        userSessions.length,
        1 // Every registered user has at least 1 visit
      );

      // Latest known section/route
      const latestRoute =
        latestSession?.currentRoute ||
        latestSession?.initialRoute ||
        userData.lastRoute ||
        '/';
      const sectionInfo = getSectionFromPath(latestRoute);

      // Device info from latest session
      const deviceObj = latestSession?.device || {};

      trackedUsers.push({
        userId: uid,
        displayName: userData.displayName || 'Anonymous Explorer',
        email: userData.email || 'No email provided',
        photoURL: userData.photoURL || undefined,
        role: userData.role === 'admin' ? 'admin' : 'user',
        totalVisits,
        firstVisitEpoch: earliestEpoch,
        firstVisitFormatted: formatTimestamp(earliestEpoch),
        lastActiveEpoch: latestEpoch,
        lastActiveFormatted: formatTimestamp(latestEpoch),
        totalTimeSpentSeconds,
        totalTimeSpentFormatted: formatDuration(totalTimeSpentSeconds),
        currentSection: sectionInfo.name,
        currentRoute: latestRoute,
        status: determineUserStatus(latestEpoch),
        deviceCategory: deviceObj.category,
        browser: deviceObj.browser,
        os: deviceObj.os,
        activeSessionId: latestSession?.sessionId,
        activitySummary: userData.activitySummary || {},
      });
    });

    // Default sort by last active descending (newest first)
    trackedUsers.sort((a, b) => (b.lastActiveEpoch || 0) - (a.lastActiveEpoch || 0));

    return trackedUsers;
  } catch (error) {
    console.error('[AdminTracking] Error fetching tracked users overview:', error);
    return [];
  }
}

/**
 * Calculate high-level summary metrics from user tracking data.
 */
export function calculateTrackingSummaryMetrics(
  users: TrackedUserOverview[]
): TrackingSummaryMetrics {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;
  const FIFTEEN_MINS_MS = 15 * 60 * 1000;

  let totalVisits = 0;
  let totalTrackedTimeSeconds = 0;
  let activeUsers24h = 0;
  let activeUsers7d = 0;
  let onlineUsersNow = 0;

  users.forEach((u) => {
    totalVisits += u.totalVisits;
    totalTrackedTimeSeconds += u.totalTimeSpentSeconds;

    if (u.lastActiveEpoch) {
      const diff = now - u.lastActiveEpoch;
      if (diff <= FIFTEEN_MINS_MS) {
        onlineUsersNow++;
      }
      if (diff <= ONE_DAY_MS) {
        activeUsers24h++;
      }
      if (diff <= SEVEN_DAYS_MS) {
        activeUsers7d++;
      }
    }
  });

  return {
    totalTrackedUsers: users.length,
    totalVisits,
    totalTrackedTimeSeconds,
    totalTrackedTimeFormatted: formatDuration(totalTrackedTimeSeconds),
    activeUsers24h,
    activeUsers7d,
    onlineUsersNow,
  };
}

/**
 * Fetch high-level summary metrics directly from Firestore.
 */
export async function fetchTrackingSummaryStats(): Promise<TrackingSummaryMetrics> {
  const users = await fetchTrackedUsersOverview();
  return calculateTrackingSummaryMetrics(users);
}

/**
 * Helper to normalize section name from ID or raw string.
 */
export function normalizeSectionName(sectionIdOrName?: string): string {
  if (!sectionIdOrName) return 'General';
  const clean = sectionIdOrName.toLowerCase().replace(/[-_]/g, ' ');
  if (clean.includes('365') || clean.includes('note')) return '365 Notes';
  if (clean.includes('moment')) return 'Moments';
  if (clean.includes('adore')) return 'Adore';
  if (clean.includes('open') || clean.includes('when')) return 'Open When';
  if (clean.includes('wish')) return 'Wishes';
  if (clean.includes('vault') || clean.includes('secret')) return 'Secret Vault';
  if (clean.includes('reflection')) return 'Reflections';
  if (clean.includes('what') || clean.includes('you')) return 'What Am I To You';
  if (clean.includes('bts') || clean.includes('behind')) return 'Behind The Scenes';
  if (clean.includes('sneak')) return 'Sneak a Peek';
  if (clean.includes('journey')) return 'Journey';
  if (clean.includes('home')) return 'Home';
  if (clean.includes('doodle')) return 'Doodles';
  if (clean.includes('setting')) return 'Settings';
  if (clean.includes('notification')) return 'Notifications';
  return sectionIdOrName.charAt(0).toUpperCase() + sectionIdOrName.slice(1);
}

/**
 * Fetches comprehensive, authoritative tracking history and session metrics for a single user.
 * 100% READ-ONLY operation.
 */
export async function fetchTrackedUserDetail(userId: string): Promise<TrackedUserDetail | null> {
  if (!isFirebaseConfigured || !userId) return null;

  try {
    // 1. Fetch user root profile
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.exists() ? userDocSnap.data() : null;

    // 2. Fetch all user sessions (up to 150 sessions for efficiency)
    const sessionsQuery = query(
      collection(db, 'users', userId, 'sessions'),
      limit(150)
    );
    const sessionsSnap = await getDocs(sessionsQuery);

    if (!userData && sessionsSnap.empty) {
      return null;
    }

    // 3. Process sessions and collect events
    const rawSessions: DocumentData[] = [];
    const allEvents: TrackingEvent[] = [];
    const eventsBySessionId = new Map<string, TrackingEvent[]>();

    // Fetch events for each session in parallel (capped for performance)
    const sessionDocList = sessionsSnap.docs;

    await Promise.all(
      sessionDocList.map(async (sDoc) => {
        const sData = sDoc.data();
        const sessionId = sDoc.id;
        rawSessions.push({ sessionId, ...sData });

        try {
          const eventsSnap = await getDocs(
            query(collection(db, 'users', userId, 'sessions', sessionId, 'events'), limit(300))
          );

          const sessionEvents: TrackingEvent[] = [];
          eventsSnap.forEach((eDoc) => {
            const eData = eDoc.data();
            const clientEpoch =
              eData.clientEpoch ||
              extractEpoch(eData.timestamp) ||
              0;

            const evt: TrackingEvent = {
              eventId: eDoc.id,
              sessionId,
              userId,
              type: eData.type || 'unknown',
              category: eData.category,
              route: eData.route,
              timestamp: eData.timestamp,
              metadata: eData.metadata || {},
              clientEpoch,
            };

            sessionEvents.push(evt);
            allEvents.push(evt);
          });

          // Sort session events chronologically ascending
          sessionEvents.sort((a, b) => a.clientEpoch - b.clientEpoch);
          eventsBySessionId.set(sessionId, sessionEvents);
        } catch (eventErr) {
          console.warn(`[AdminTracking] Events fetch notice for session ${sessionId}:`, eventErr);
        }
      })
    );

    // Fallback: If no events were retrieved through session subcollections (e.g. legacy flat structure),
    // try querying collectionGroup('events') where userId == userId with limit
    if (allEvents.length === 0) {
      try {
        const groupQuery = query(
          collectionGroup(db, 'events'),
          limit(500)
        );
        const groupSnap = await getDocs(groupQuery);
        groupSnap.forEach((gDoc) => {
          const gData = gDoc.data();
          if (gData.userId === userId) {
            const clientEpoch =
              gData.clientEpoch ||
              extractEpoch(gData.timestamp) ||
              0;
            const evt: TrackingEvent = {
              eventId: gDoc.id,
              sessionId: gData.sessionId || 'unknown',
              userId,
              type: gData.type || 'unknown',
              category: gData.category,
              route: gData.route,
              timestamp: gData.timestamp,
              metadata: gData.metadata || {},
              clientEpoch,
            };
            allEvents.push(evt);
          }
        });
      } catch (grpErr) {
        console.warn('[AdminTracking] collectionGroup events fallback notice:', grpErr);
      }
    }

    // Sort all events chronologically descending (newest first for timeline)
    allEvents.sort((a, b) => b.clientEpoch - a.clientEpoch);

    // 4. Build SessionHistoryItems
    let earliestSessionEpoch: number | null = extractEpoch(userData?.createdAt);
    let latestSessionEpoch: number | null = extractEpoch(userData?.lastSeenAt);
    let totalTimeSpentSeconds = 0;
    let latestSessionObj: DocumentData | null = null;

    const formattedSessions: SessionHistoryItem[] = rawSessions.map((sess) => {
      const startEpoch =
        sess.createdAtClientEpoch ||
        extractEpoch(sess.startedAt) ||
        0;

      const endEpoch =
        extractEpoch(sess.endedAt) ||
        (sess.status === 'ended' ? sess.lastActivityClientEpoch : null);

      const activeEpoch =
        sess.lastActivityClientEpoch ||
        extractEpoch(sess.lastActivityAt) ||
        endEpoch ||
        startEpoch;

      if (startEpoch > 0) {
        if (!earliestSessionEpoch || startEpoch < earliestSessionEpoch) {
          earliestSessionEpoch = startEpoch;
        }
      }

      if (activeEpoch > 0) {
        if (!latestSessionEpoch || activeEpoch > latestSessionEpoch) {
          latestSessionEpoch = activeEpoch;
        }
      }

      if (
        !latestSessionObj ||
        (activeEpoch &&
          activeEpoch >
            (latestSessionObj.lastActivityClientEpoch ||
              extractEpoch(latestSessionObj.lastActivityAt) ||
              0))
      ) {
        latestSessionObj = sess;
      }

      const durationSeconds = calculateSessionDurationSeconds(sess);
      totalTimeSpentSeconds += durationSeconds;

      const deviceObj = sess.device || {};
      const sessEvents = eventsBySessionId.get(sess.sessionId) || [];

      return {
        sessionId: sess.sessionId,
        startedAtEpoch: startEpoch,
        startedAtFormatted: formatTimestamp(startEpoch),
        endedAtEpoch: endEpoch,
        endedAtFormatted: endEpoch ? formatTimestamp(endEpoch) : 'In progress',
        durationSeconds,
        durationFormatted: formatDuration(durationSeconds),
        initialRoute: sess.initialRoute || '/',
        currentRoute: sess.currentRoute || sess.initialRoute || '/',
        deviceCategory: deviceObj.category || 'desktop',
        browser: deviceObj.browser || 'Unknown Browser',
        os: deviceObj.os || 'Unknown OS',
        screenWidth: deviceObj.screenWidth,
        screenHeight: deviceObj.screenHeight,
        status: sess.status || 'ended',
        eventCount: sess.eventCount || sessEvents.length,
        events: sessEvents,
      };
    });

    // Sort sessions newest first
    formattedSessions.sort((a, b) => b.startedAtEpoch - a.startedAtEpoch);

    // 5. Aggregate Exploration Statistics from Events
    const sectionStatsMap = new Map<
      string,
      {
        sectionId: string;
        sectionName: string;
        route: string;
        visitCount: number;
        uniqueItems: Set<string>;
        totalItemOpens: number;
        totalActiveTimeSeconds: number;
        lastExploredEpoch: number | null;
      }
    >();

    const itemStatsMap = new Map<
      string,
      {
        itemKey: string;
        itemId: string;
        itemType: string;
        title: string;
        itemNumber?: number | string;
        section: string;
        firstOpenedEpoch: number | null;
        lastOpenedEpoch: number | null;
        totalOpens: number;
        revisitCount: number;
      }
    >();

    const mediaStatsMap = new Map<
      string,
      {
        mediaKey: string;
        mediaId: string;
        mediaType: string;
        parentItemId?: string;
        title?: string;
        section?: string;
        viewCount: number;
        firstViewedEpoch: number | null;
        lastViewedEpoch: number | null;
      }
    >();

    const searchHistory: SearchHistoryItem[] = [];
    const filterHistory: FilterHistoryItem[] = [];
    const sneakPeekHistory: SneakPeekHistoryItem[] = [];
    const navigationHistory: NavigationHistoryItem[] = [];
    const errorHistory: ErrorHistoryItem[] = [];

    // Helper to get or init section accumulator
    const getSectionAccumulator = (secId: string, route: string = '/') => {
      const normalizedName = normalizeSectionName(secId);
      let sec = sectionStatsMap.get(normalizedName);
      if (!sec) {
        sec = {
          sectionId: secId,
          sectionName: normalizedName,
          route,
          visitCount: 0,
          uniqueItems: new Set<string>(),
          totalItemOpens: 0,
          totalActiveTimeSeconds: 0,
          lastExploredEpoch: null,
        };
        sectionStatsMap.set(normalizedName, sec);
      }
      return sec;
    };

    // Iterate through events (chronologically ascending for accurate first/last tracking)
    const chronologicalEvents = [...allEvents].reverse();

    chronologicalEvents.forEach((evt) => {
      const meta = evt.metadata || {};
      const evtEpoch = evt.clientEpoch || 0;

      switch (evt.type) {
        case 'section_entered': {
          const secId = meta.sectionId || meta.sectionName || getSectionFromPath(evt.route || '').id;
          const sec = getSectionAccumulator(secId, evt.route || '/');
          sec.visitCount++;
          if (!sec.lastExploredEpoch || evtEpoch > sec.lastExploredEpoch) {
            sec.lastExploredEpoch = evtEpoch;
          }
          break;
        }

        case 'section_left': {
          const secId = meta.sectionId || meta.sectionName || getSectionFromPath(evt.route || '').id;
          const sec = getSectionAccumulator(secId, evt.route || '/');
          const duration = typeof meta.durationSeconds === 'number' ? meta.durationSeconds : 0;
          sec.totalActiveTimeSeconds += Math.min(duration, 3600); // safety cap single section exit to 1h
          if (!sec.lastExploredEpoch || evtEpoch > sec.lastExploredEpoch) {
            sec.lastExploredEpoch = evtEpoch;
          }
          break;
        }

        case 'item_opened':
        case 'item_revisited': {
          const itemId = String(meta.itemId || 'unknown');
          const itemType = String(meta.itemType || 'item');
          const rawSection = meta.section || getSectionFromPath(evt.route || '').id;
          const sectionName = normalizeSectionName(rawSection);
          const itemKey = `${itemType}_${itemId}`;
          const title = meta.title || (meta.itemNumber ? `Item #${meta.itemNumber}` : itemId);

          // Update Section stats
          const sec = getSectionAccumulator(rawSection, evt.route || '/');
          sec.uniqueItems.add(itemKey);
          sec.totalItemOpens++;
          if (!sec.lastExploredEpoch || evtEpoch > sec.lastExploredEpoch) {
            sec.lastExploredEpoch = evtEpoch;
          }

          // Update Item stats
          let itemStat = itemStatsMap.get(itemKey);
          if (!itemStat) {
            itemStat = {
              itemKey,
              itemId,
              itemType,
              title,
              itemNumber: meta.itemNumber,
              section: sectionName,
              firstOpenedEpoch: evtEpoch,
              lastOpenedEpoch: evtEpoch,
              totalOpens: 0,
              revisitCount: 0,
            };
            itemStatsMap.set(itemKey, itemStat);
          }

          itemStat.totalOpens++;
          if (evt.type === 'item_revisited' || itemStat.totalOpens > 1) {
            itemStat.revisitCount = itemStat.totalOpens - 1;
          }
          if (evtEpoch < (itemStat.firstOpenedEpoch || Infinity)) {
            itemStat.firstOpenedEpoch = evtEpoch;
          }
          if (evtEpoch > (itemStat.lastOpenedEpoch || 0)) {
            itemStat.lastOpenedEpoch = evtEpoch;
          }
          if (meta.title && meta.title !== itemStat.title) {
            itemStat.title = meta.title;
          }
          break;
        }

        case 'media_viewed': {
          const mediaId = String(meta.mediaId || 'media');
          const mediaType = String(meta.mediaType || 'image');
          const mediaKey = `${mediaType}_${mediaId}`;
          const rawSection = meta.section || getSectionFromPath(evt.route || '').id;
          const sectionName = normalizeSectionName(rawSection);

          let mediaStat = mediaStatsMap.get(mediaKey);
          if (!mediaStat) {
            mediaStat = {
              mediaKey,
              mediaId,
              mediaType,
              parentItemId: meta.parentItemId,
              title: meta.title,
              section: sectionName,
              viewCount: 0,
              firstViewedEpoch: evtEpoch,
              lastViewedEpoch: evtEpoch,
            };
            mediaStatsMap.set(mediaKey, mediaStat);
          }

          mediaStat.viewCount++;
          if (evtEpoch < (mediaStat.firstViewedEpoch || Infinity)) {
            mediaStat.firstViewedEpoch = evtEpoch;
          }
          if (evtEpoch > (mediaStat.lastViewedEpoch || 0)) {
            mediaStat.lastViewedEpoch = evtEpoch;
          }
          break;
        }

        case 'search_performed': {
          const term = String(meta.searchTerm || '').trim();
          if (term) {
            searchHistory.push({
              eventId: evt.eventId,
              sessionId: evt.sessionId,
              section: normalizeSectionName(meta.section || getSectionFromPath(evt.route || '').id),
              searchTerm: term,
              resultCount: typeof meta.resultCount === 'number' ? meta.resultCount : undefined,
              timestampEpoch: evtEpoch,
              timestampFormatted: formatTimestamp(evtEpoch),
              route: evt.route,
            });
          }
          break;
        }

        case 'filter_applied': {
          const filterType = String(meta.filterType || 'Filter');
          const selectedValue = String(meta.selectedValue || 'All');
          filterHistory.push({
            eventId: evt.eventId,
            sessionId: evt.sessionId,
            section: normalizeSectionName(meta.section || getSectionFromPath(evt.route || '').id),
            filterType,
            selectedValue,
            resultCount: typeof meta.resultCount === 'number' ? meta.resultCount : undefined,
            timestampEpoch: evtEpoch,
            timestampFormatted: formatTimestamp(evtEpoch),
            route: evt.route,
          });
          break;
        }

        case 'sneak_peek_viewed':
        case 'sneak_peek_skipped':
        case 'sneak_peek_completed': {
          const action = evt.type.replace('sneak_peek_', '');
          sneakPeekHistory.push({
            eventId: evt.eventId,
            sessionId: evt.sessionId,
            action,
            timestampEpoch: evtEpoch,
            timestampFormatted: formatTimestamp(evtEpoch),
          });
          break;
        }

        case 'navigation': {
          if (meta.fromSection && meta.toSection) {
            navigationHistory.push({
              eventId: evt.eventId,
              sessionId: evt.sessionId,
              fromSection: normalizeSectionName(meta.fromSection),
              toSection: normalizeSectionName(meta.toSection),
              fromRoute: meta.fromRoute || '',
              toRoute: meta.toRoute || '',
              timestampEpoch: evtEpoch,
              timestampFormatted: formatTimestamp(evtEpoch),
            });
          }
          break;
        }

        case 'error': {
          const category = String(meta.category || evt.category || 'Runtime Error');
          const safeMessage = String(meta.message || 'An unexpected client-side error occurred.').slice(0, 300);
          errorHistory.push({
            eventId: evt.eventId,
            sessionId: evt.sessionId,
            category,
            message: safeMessage,
            component: meta.component,
            section: meta.section ? normalizeSectionName(meta.section) : undefined,
            operation: meta.operation,
            route: evt.route,
            timestampEpoch: evtEpoch,
            timestampFormatted: formatTimestamp(evtEpoch),
          });
          break;
        }

        default:
          break;
      }
    });

    // Format section exploration stats
    const sectionExploration: SectionExplorationStat[] = Array.from(sectionStatsMap.values())
      .map((sec) => ({
        sectionId: sec.sectionId,
        sectionName: sec.sectionName,
        route: sec.route,
        visitCount: Math.max(sec.visitCount, 1),
        uniqueItemsCount: sec.uniqueItems.size,
        totalItemOpens: sec.totalItemOpens,
        totalActiveTimeSeconds: sec.totalActiveTimeSeconds,
        totalActiveTimeFormatted: formatDuration(sec.totalActiveTimeSeconds),
        lastExploredEpoch: sec.lastExploredEpoch,
        lastExploredFormatted: formatTimestamp(sec.lastExploredEpoch),
      }))
      .sort((a, b) => (b.lastExploredEpoch || 0) - (a.lastExploredEpoch || 0));

    // Format item exploration stats
    const itemExploration: ItemExplorationStat[] = Array.from(itemStatsMap.values())
      .map((item) => ({
        ...item,
        firstOpenedFormatted: formatTimestamp(item.firstOpenedEpoch),
        lastOpenedFormatted: formatTimestamp(item.lastOpenedEpoch),
      }))
      .sort((a, b) => b.totalOpens - a.totalOpens);

    // Format media exploration stats
    const mediaExploration: MediaExplorationStat[] = Array.from(mediaStatsMap.values())
      .map((m) => ({
        ...m,
        firstViewedFormatted: formatTimestamp(m.firstViewedEpoch),
        lastViewedFormatted: formatTimestamp(m.lastViewedEpoch),
      }))
      .sort((a, b) => b.viewCount - a.viewCount);

    // Reverse histories for newest first
    searchHistory.reverse();
    filterHistory.reverse();
    sneakPeekHistory.reverse();
    navigationHistory.reverse();
    errorHistory.reverse();

    // 6. Build Top-Level TrackedUserOverview
    const recordedVisits = userData?.visitSummary?.totalVisits;
    const totalVisits = Math.max(
      typeof recordedVisits === 'number' ? recordedVisits : 0,
      formattedSessions.length,
      1
    );

    const latestRoute =
      latestSessionObj?.currentRoute ||
      latestSessionObj?.initialRoute ||
      userData?.lastRoute ||
      '/';
    const sectionInfo = getSectionFromPath(latestRoute);
    const latestDevice = latestSessionObj?.device || {};

    const userOverview: TrackedUserOverview = {
      userId,
      displayName: userData?.displayName || 'Anonymous Explorer',
      email: userData?.email || 'No email provided',
      photoURL: userData?.photoURL || undefined,
      role: userData?.role === 'admin' ? 'admin' : 'user',
      totalVisits,
      firstVisitEpoch: earliestSessionEpoch,
      firstVisitFormatted: formatTimestamp(earliestSessionEpoch),
      lastActiveEpoch: latestSessionEpoch,
      lastActiveFormatted: formatTimestamp(latestSessionEpoch),
      totalTimeSpentSeconds,
      totalTimeSpentFormatted: formatDuration(totalTimeSpentSeconds),
      currentSection: sectionInfo.name,
      currentRoute: latestRoute,
      status: determineUserStatus(latestSessionEpoch),
      deviceCategory: latestDevice.category,
      browser: latestDevice.browser,
      os: latestDevice.os,
      activeSessionId: latestSessionObj?.sessionId,
      activitySummary: userData?.activitySummary || {},
    };

    return {
      user: userOverview,
      sessions: formattedSessions,
      sectionExploration,
      itemExploration,
      mediaExploration,
      searchHistory,
      filterHistory,
      sneakPeekHistory,
      navigationHistory,
      errorHistory,
      events: allEvents,
    };
  } catch (error) {
    console.error(`[AdminTracking] Error fetching details for user ${userId}:`, error);
    return null;
  }
}

// =========================================================================
// Phase 3C Live Activity Monitor Streaming & Aggregation Engine (READ-ONLY)
// =========================================================================

/**
 * Exact live status threshold definitions:
 * - ONLINE: Activity/session update within 3 minutes (180,000ms) AND session status == 'active'.
 * - RECENT: Activity/session update within 15 minutes (900,000ms).
 * - OFFLINE: Activity > 15 minutes or no active sessions.
 */
export const LIVE_ONLINE_THRESHOLD_MS = 3 * 60 * 1000;
export const LIVE_RECENT_THRESHOLD_MS = 15 * 60 * 1000;

/**
 * Convert a raw event into a formatted, human-readable action description.
 */
export function formatLiveEventAction(
  type: string,
  metadata: Record<string, any> = {},
  route?: string
): { title: string; description: string; isError: boolean } {
  const meta = metadata || {};
  const sectionName = normalizeSectionName(meta.section || meta.sectionName || (route ? getSectionFromPath(route).name : undefined));

  switch (type) {
    case 'section_entered':
      return {
        title: `Entered ${sectionName}`,
        description: `Navigated into the ${sectionName} experience`,
        isError: false,
      };

    case 'section_left': {
      const dur = typeof meta.durationSeconds === 'number' ? formatDuration(meta.durationSeconds) : 'a few moments';
      return {
        title: `Left ${sectionName}`,
        description: `Explored ${sectionName} for ${dur}`,
        isError: false,
      };
    }

    case 'navigation': {
      const from = normalizeSectionName(meta.fromSection || 'Home');
      const to = normalizeSectionName(meta.toSection || 'Universe');
      return {
        title: `Navigated ${from} → ${to}`,
        description: `Transitioned routes from ${from} to ${to}`,
        isError: false,
      };
    }

    case 'item_opened': {
      const numStr = meta.itemNumber ? ` #${meta.itemNumber}` : '';
      const titleStr = meta.title ? ` "${meta.title}"` : '';
      const itemTypeStr = meta.itemType ? meta.itemType.charAt(0).toUpperCase() + meta.itemType.slice(1) : 'Item';
      return {
        title: `Opened ${itemTypeStr}${numStr}`,
        description: `Opened ${itemTypeStr}${numStr}${titleStr} in ${sectionName}`,
        isError: false,
      };
    }

    case 'item_revisited': {
      const numStr = meta.itemNumber ? ` #${meta.itemNumber}` : '';
      const titleStr = meta.title ? ` "${meta.title}"` : '';
      const itemTypeStr = meta.itemType ? meta.itemType.charAt(0).toUpperCase() + meta.itemType.slice(1) : 'Item';
      const countStr = meta.openCount ? ` (Visit #${meta.openCount})` : '';
      return {
        title: `Revisited ${itemTypeStr}${numStr}`,
        description: `Reopened ${itemTypeStr}${numStr}${titleStr}${countStr} in ${sectionName}`,
        isError: false,
      };
    }

    case 'media_viewed': {
      const mediaType = meta.mediaType || 'Media';
      const titleStr = meta.title ? ` "${meta.title}"` : '';
      return {
        title: `Viewed ${mediaType}`,
        description: `Viewed ${mediaType}${titleStr} in ${sectionName}`,
        isError: false,
      };
    }

    case 'search_performed': {
      const term = meta.searchTerm ? `"${meta.searchTerm}"` : 'term';
      const results = typeof meta.resultCount === 'number' ? ` (${meta.resultCount} results)` : '';
      return {
        title: `Searched ${term}`,
        description: `Queried ${term}${results} in ${sectionName}`,
        isError: false,
      };
    }

    case 'filter_applied': {
      const filterType = meta.filterType || 'Filter';
      const val = meta.selectedValue || 'All';
      return {
        title: `Applied Filter: ${val}`,
        description: `Selected ${filterType} → "${val}" in ${sectionName}`,
        isError: false,
      };
    }

    case 'sneak_peek_viewed':
      return {
        title: 'Viewed Sneak a Peek',
        description: 'Opened the Sneak a Peek birthday countdown preview',
        isError: false,
      };

    case 'sneak_peek_skipped':
      return {
        title: 'Skipped Sneak a Peek',
        description: 'Dismissed the Sneak a Peek countdown modal',
        isError: false,
      };

    case 'sneak_peek_completed':
      return {
        title: 'Completed Sneak a Peek',
        description: 'Reached the conclusion of the countdown sequence',
        isError: false,
      };

    case 'website_opened':
      return {
        title: 'Session Started / Website Opened',
        description: `Arrived on platform at ${route || '/'}`,
        isError: false,
      };

    case 'error': {
      const safeMsg = (meta.message || 'Client-side runtime error occurred').slice(0, 160);
      const cat = meta.category || 'Runtime Error';
      return {
        title: `Error: ${cat}`,
        description: safeMsg,
        isError: true,
      };
    }

    default:
      return {
        title: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        description: `Performed ${type.replace(/_/g, ' ')} in ${sectionName}`,
        isError: false,
      };
  }
}

/**
 * Subscribes to live user activity updates using efficient Firestore listeners.
 * 100% READ-ONLY. Does NOT create or alter any document.
 */
export function subscribeToLiveActivity(callbacks: {
  onUsersUpdate: (users: LiveActiveUser[]) => void;
  onFeedUpdate: (events: LiveFeedItem[]) => void;
  onConnectionStatusChange: (status: LiveConnectionStatus) => void;
}): Unsubscribe {
  if (!isFirebaseConfigured) {
    callbacks.onConnectionStatusChange('offline');
    return () => {};
  }

  callbacks.onConnectionStatusChange('connecting');

  let userProfilesMap = new Map<string, DocumentData>();
  let activeSessionsMap = new Map<string, DocumentData>();
  let rawEventsMap = new Map<string, DocumentData>();

  // Helper to recompute and broadcast aggregated live users
  const computeAndBroadcastUsers = () => {
    const now = Date.now();
    const userAggregates = new Map<string, LiveActiveUser>();

    // 1. Group active/recent sessions by userId
    const sessionsByUserId = new Map<string, DocumentData[]>();
    activeSessionsMap.forEach((sess) => {
      const uid = sess.userId;
      if (uid) {
        const list = sessionsByUserId.get(uid) || [];
        list.push(sess);
        sessionsByUserId.set(uid, list);
      }
    });

    // 2. Populate for every user profile
    userProfilesMap.forEach((profileData, uid) => {
      const userSessions = sessionsByUserId.get(uid) || [];

      // Sort sessions newest activity first
      userSessions.sort((a, b) => {
        const bEpoch = b.lastActivityClientEpoch || extractEpoch(b.lastActivityAt) || 0;
        const aEpoch = a.lastActivityClientEpoch || extractEpoch(a.lastActivityAt) || 0;
        return bEpoch - aEpoch;
      });

      let mostRecentEpoch: number =
        extractEpoch(profileData.lastSeenAt) ||
        extractEpoch(profileData.createdAt) ||
        0;

      const sessionInfos: LiveSessionInfo[] = [];

      userSessions.forEach((sess) => {
        const sessLastEpoch =
          sess.lastActivityClientEpoch ||
          extractEpoch(sess.lastActivityAt) ||
          sess.createdAtClientEpoch ||
          extractEpoch(sess.startedAt) ||
          0;

        if (sessLastEpoch > mostRecentEpoch) {
          mostRecentEpoch = sessLastEpoch;
        }

        const dev = sess.device || {};
        const sessRoute = sess.currentRoute || sess.initialRoute || '/';
        const sessSec = getSectionFromPath(sessRoute).name;

        sessionInfos.push({
          sessionId: sess.sessionId,
          deviceCategory: dev.category || 'desktop',
          browser: dev.browser || 'Browser',
          os: dev.os || 'OS',
          currentRoute: sessRoute,
          currentSection: sessSec,
          startedAtEpoch: sess.createdAtClientEpoch || extractEpoch(sess.startedAt) || 0,
          lastActivityEpoch: sessLastEpoch,
          lastActivityFormatted: formatTimestamp(sessLastEpoch),
        });
      });

      // Status classification
      const diffMs = now - mostRecentEpoch;
      let status: LiveUserStatus = 'offline';

      const hasActiveSessionDoc = userSessions.some((s) => s.status === 'active');

      if (diffMs <= LIVE_ONLINE_THRESHOLD_MS && (hasActiveSessionDoc || userSessions.length > 0)) {
        status = 'online';
      } else if (diffMs <= LIVE_RECENT_THRESHOLD_MS) {
        status = 'recent';
      } else {
        status = 'offline';
      }

      // Latest known primary route & section
      const topSession = sessionInfos[0];
      const primaryRoute = topSession?.currentRoute || profileData.lastRoute || '/';
      const primarySection = topSession?.currentSection || getSectionFromPath(primaryRoute).name;

      userAggregates.set(uid, {
        userId: uid,
        displayName: profileData.displayName || 'Anonymous Explorer',
        email: profileData.email || 'No email provided',
        photoURL: profileData.photoURL || undefined,
        role: profileData.role === 'admin' ? 'admin' : 'user',
        status,
        sessions: sessionInfos,
        primarySection,
        primaryRoute,
        lastActivityEpoch: mostRecentEpoch,
        lastActivityFormatted: formatTimestamp(mostRecentEpoch),
        activeSessionCount: userSessions.filter((s) => s.status === 'active').length || userSessions.length,
      });
    });

    // Also include any users discovered purely in sessions
    sessionsByUserId.forEach((userSessions, uid) => {
      if (!userAggregates.has(uid)) {
        const topSession = userSessions[0];
        const mostRecentEpoch =
          topSession.lastActivityClientEpoch ||
          extractEpoch(topSession.lastActivityAt) ||
          topSession.createdAtClientEpoch ||
          extractEpoch(topSession.startedAt) ||
          0;

        const diffMs = now - mostRecentEpoch;
        let status: LiveUserStatus = 'offline';
        if (diffMs <= LIVE_ONLINE_THRESHOLD_MS && topSession.status === 'active') {
          status = 'online';
        } else if (diffMs <= LIVE_RECENT_THRESHOLD_MS) {
          status = 'recent';
        }

        const dev = topSession.device || {};
        const sessRoute = topSession.currentRoute || topSession.initialRoute || '/';
        const sessSec = getSectionFromPath(sessRoute).name;

        userAggregates.set(uid, {
          userId: uid,
          displayName: 'Explorer',
          email: 'Anonymous',
          photoURL: undefined,
          role: 'user',
          status,
          sessions: userSessions.map((s) => ({
            sessionId: s.sessionId,
            deviceCategory: (s.device && s.device.category) || 'desktop',
            browser: (s.device && s.device.browser) || 'Browser',
            os: (s.device && s.device.os) || 'OS',
            currentRoute: s.currentRoute || s.initialRoute || '/',
            currentSection: getSectionFromPath(s.currentRoute || s.initialRoute || '/').name,
            startedAtEpoch: s.createdAtClientEpoch || extractEpoch(s.startedAt) || 0,
            lastActivityEpoch: s.lastActivityClientEpoch || extractEpoch(s.lastActivityAt) || 0,
            lastActivityFormatted: formatTimestamp(s.lastActivityClientEpoch || extractEpoch(s.lastActivityAt) || 0),
          })),
          primarySection: sessSec,
          primaryRoute: sessRoute,
          lastActivityEpoch: mostRecentEpoch,
          lastActivityFormatted: formatTimestamp(mostRecentEpoch),
          activeSessionCount: userSessions.length,
        });
      }
    });

    // Convert map to array sorted by status (online -> recent -> offline) then lastActivityEpoch desc
    const sortedUsers = Array.from(userAggregates.values()).sort((a, b) => {
      const statusWeight = (s: LiveUserStatus) => (s === 'online' ? 3 : s === 'recent' ? 2 : 1);
      const diff = statusWeight(b.status) - statusWeight(a.status);
      if (diff !== 0) return diff;
      return b.lastActivityEpoch - a.lastActivityEpoch;
    });

    callbacks.onUsersUpdate(sortedUsers);
  };

  // Helper to recompute and broadcast live feed items
  const computeAndBroadcastFeed = () => {
    const feedItems: LiveFeedItem[] = [];

    rawEventsMap.forEach((eData, eventId) => {
      const uid = eData.userId || 'unknown';
      const userProfile = userProfilesMap.get(uid);
      const clientEpoch = eData.clientEpoch || extractEpoch(eData.timestamp) || 0;
      const meta = eData.metadata || {};
      const route = eData.route || meta.route || '/';
      const formattedAction = formatLiveEventAction(eData.type, meta, route);
      const sectionName = normalizeSectionName(meta.section || meta.sectionName || getSectionFromPath(route).name);

      feedItems.push({
        eventId,
        sessionId: eData.sessionId || 'unknown',
        userId: uid,
        userDisplayName: userProfile?.displayName || (uid === 'admin' ? 'Admin' : 'Explorer'),
        userEmail: userProfile?.email || 'user@starlit',
        userPhotoURL: userProfile?.photoURL,
        userRole: userProfile?.role === 'admin' ? 'admin' : 'user',
        type: eData.type || 'activity',
        actionTitle: formattedAction.title,
        actionDescription: formattedAction.description,
        section: sectionName,
        route,
        timestampEpoch: clientEpoch,
        timestampFormatted: formatTimestamp(clientEpoch),
        deviceCategory: meta.deviceCategory,
        isError: formattedAction.isError || eData.type === 'error',
        metadata: meta,
      });
    });

    // Deduplicate strictly by eventId & sort chronologically descending (newest first)
    const dedupedFeedMap = new Map<string, LiveFeedItem>();
    feedItems.forEach((item) => {
      dedupedFeedMap.set(item.eventId, item);
    });

    const sortedFeed = Array.from(dedupedFeedMap.values()).sort(
      (a, b) => b.timestampEpoch - a.timestampEpoch
    );

    // Limit live feed to top 100 recent entries
    callbacks.onFeedUpdate(sortedFeed.slice(0, 100));
  };

  const unsubscribes: Unsubscribe[] = [];

  try {
    // 1. User Profiles listener (/users)
    const usersQuery = query(collection(db, 'users'), limit(100));
    const unsubUsers = onSnapshot(
      usersQuery,
      (snapshot) => {
        callbacks.onConnectionStatusChange('connected');
        snapshot.forEach((docSnap) => {
          userProfilesMap.set(docSnap.id, { uid: docSnap.id, ...docSnap.data() });
        });
        computeAndBroadcastUsers();
        computeAndBroadcastFeed();
      },
      (error) => {
        console.warn('[AdminTracking] Live users onSnapshot error:', error);
        callbacks.onConnectionStatusChange('error');
      }
    );
    unsubscribes.push(unsubUsers);

    // 2. Recent Sessions listener (collectionGroup('sessions') limited to 50 ordered by lastActivityAt desc)
    try {
      const sessionsQuery = query(
        collectionGroup(db, 'sessions'),
        orderBy('lastActivityAt', 'desc'),
        limit(50)
      );
      const unsubSessions = onSnapshot(
        sessionsQuery,
        (snapshot) => {
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const uid = data.userId || docSnap.ref.parent.parent?.id;
            if (uid) {
              activeSessionsMap.set(docSnap.id, { sessionId: docSnap.id, userId: uid, ...data });
            }
          });
          computeAndBroadcastUsers();
        },
        (sessErr) => {
          console.warn('[AdminTracking] Live sessions query fallback:', sessErr);
        }
      );
      unsubscribes.push(unsubSessions);
    } catch (sErr) {
      console.warn('[AdminTracking] Sessions listener setup notice:', sErr);
    }

    // 3. Recent Events listener (collectionGroup('events') limited to 75 ordered by timestamp desc)
    try {
      const eventsQuery = query(
        collectionGroup(db, 'events'),
        orderBy('timestamp', 'desc'),
        limit(75)
      );
      const unsubEvents = onSnapshot(
        eventsQuery,
        (snapshot) => {
          callbacks.onConnectionStatusChange('connected');
          snapshot.forEach((docSnap) => {
            rawEventsMap.set(docSnap.id, { eventId: docSnap.id, ...docSnap.data() });
          });
          computeAndBroadcastFeed();
        },
        (evtErr) => {
          console.warn('[AdminTracking] Live events onSnapshot notice:', evtErr);
          // Non-fatal if index not yet generated; connection remains open for users/sessions
        }
      );
      unsubscribes.push(unsubEvents);
    } catch (eErr) {
      console.warn('[AdminTracking] Events listener setup notice:', eErr);
    }

    // Periodic heartbeat to refresh relative timestamps and online/recent/offline thresholds
    const intervalTimer = setInterval(() => {
      computeAndBroadcastUsers();
      computeAndBroadcastFeed();
    }, 15000); // every 15 seconds

    return () => {
      clearInterval(intervalTimer);
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
    };
  } catch (initErr) {
    console.error('[AdminTracking] Error establishing live activity listener:', initErr);
    callbacks.onConnectionStatusChange('error');
    return () => {};
  }
}


