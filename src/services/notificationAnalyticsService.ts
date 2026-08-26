import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  setDoc,
  doc,
  collectionGroup,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import {
  NotificationEvent,
  NotificationEventType,
  NotificationTimeRange,
  NotificationAnalyticsSummary,
  NotificationCategoryStatItem,
  NotificationTimeSeriesPoint,
  NotificationFailureGroup,
  NotificationFailureItem,
  NotificationTokenHealth,
  NotificationGlobalControl,
  NotificationSystemHealth,
  NotificationHistoryFilterState,
} from '../types';
import { getVapidKey, isPushSupported } from './notificationService';

const ALL_CATEGORIES: NotificationEventType[] = [
  'LETTER_AVAILABLE',
  'OPEN_WHEN_AVAILABLE',
  'SECRET_UNLOCKED',
  'MOMENT_AVAILABLE',
  'BIRTHDAY',
  'GENERAL',
];

const CATEGORY_LABELS: Record<NotificationEventType, string> = {
  LETTER_AVAILABLE: 'Letters',
  OPEN_WHEN_AVAILABLE: 'Open When',
  SECRET_UNLOCKED: 'Secret Vault',
  MOMENT_AVAILABLE: 'Moments',
  BIRTHDAY: 'Birthday',
  GENERAL: 'General',
};

/**
 * Calculates start timestamp based on time range
 */
function getStartDateForRange(range: NotificationTimeRange): Date | null {
  const now = new Date();
  switch (range) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      return start;
    }
    case '7d': {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return start;
    }
    case '30d': {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return start;
    }
    case 'all':
    default:
      return null;
  }
}

/**
 * Parse Firestore timestamp or ISO string into a JavaScript Date
 */
export function parseFirestoreTimestamp(ts: any): Date | null {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (typeof ts === 'string') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof ts === 'number') {
    return new Date(ts);
  }
  if (typeof ts.toDate === 'function') {
    return ts.toDate();
  }
  if (ts.seconds) {
    return new Date(ts.seconds * 1000);
  }
  return null;
}

/**
 * Categorizes failure reason into high-level diagnostic groups
 */
function categorizeFailureReason(
  reason?: string | null
): 'NO_TOKENS' | 'INVALID_TOKEN' | 'PREFERENCES_DISABLED' | 'FCM_ERROR' | 'TIMEOUT' | 'OTHER' {
  if (!reason) return 'OTHER';
  const lower = reason.toLowerCase();

  if (lower.includes('no enabled notification tokens') || lower.includes('no registered device')) {
    return 'NO_TOKENS';
  }
  if (
    lower.includes('registration-token-not-registered') ||
    lower.includes('invalid-registration-token') ||
    lower.includes('unregistered') ||
    lower.includes('invalid token')
  ) {
    return 'INVALID_TOKEN';
  }
  if (lower.includes('preferences') || lower.includes('disabled notifications in account')) {
    return 'PREFERENCES_DISABLED';
  }
  if (lower.includes('fcm') || lower.includes('messaging') || lower.includes('multicast')) {
    return 'FCM_ERROR';
  }
  if (lower.includes('timeout') || lower.includes('deadline')) {
    return 'TIMEOUT';
  }
  return 'OTHER';
}

/**
 * Fetches and calculates comprehensive Notification Analytics
 */
export async function fetchNotificationAnalytics(
  timeRange: NotificationTimeRange = '7d'
): Promise<{
  summary: NotificationAnalyticsSummary;
  categoryStats: NotificationCategoryStatItem[];
  timeSeries: NotificationTimeSeriesPoint[];
  failureGroups: NotificationFailureGroup[];
  rawEventsCount: number;
}> {
  if (!isFirebaseConfigured) {
    return createFallbackAnalytics();
  }

  try {
    const eventsRef = collection(db, 'notificationEvents');
    const startDate = getStartDateForRange(timeRange);

    // Fetch up to 1000 recent events for precise window analytics
    const q = query(eventsRef, orderBy('createdAt', 'desc'), limit(1000));
    const snapshot = await getDocs(q);

    let total = 0;
    let pending = 0;
    let scheduled = 0;
    let processing = 0;
    let sent = 0;
    let failed = 0;

    let immediateCount = 0;
    let scheduledCount = 0;
    let quietHoursDelayedCount = 0;

    let totalTokensAttempted = 0;
    let totalTokensSuccessful = 0;
    let totalTokensFailed = 0;

    let totalProcessingTimeMs = 0;
    let eventsWithLatencyCount = 0;
    let totalAttempts = 0;

    const categoryMap: Record<
      NotificationEventType,
      { count: number; sent: number; failed: number; pending: number; scheduled: number }
    > = {
      LETTER_AVAILABLE: { count: 0, sent: 0, failed: 0, pending: 0, scheduled: 0 },
      OPEN_WHEN_AVAILABLE: { count: 0, sent: 0, failed: 0, pending: 0, scheduled: 0 },
      SECRET_UNLOCKED: { count: 0, sent: 0, failed: 0, pending: 0, scheduled: 0 },
      MOMENT_AVAILABLE: { count: 0, sent: 0, failed: 0, pending: 0, scheduled: 0 },
      BIRTHDAY: { count: 0, sent: 0, failed: 0, pending: 0, scheduled: 0 },
      GENERAL: { count: 0, sent: 0, failed: 0, pending: 0, scheduled: 0 },
    };

    const timeSeriesMap: Map<string, NotificationTimeSeriesPoint> = new Map();
    const failureItems: NotificationFailureItem[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const createdDate = parseFirestoreTimestamp(data.createdAt);

      // Filter by time range if specified
      if (startDate && createdDate && createdDate < startDate) {
        return;
      }

      total++;
      const status = data.status || 'pending';
      const type = (data.type as NotificationEventType) || 'GENERAL';
      const deliveryMode = data.deliveryMode || 'immediate';

      if (status === 'sent') sent++;
      else if (status === 'failed') failed++;
      else if (status === 'pending') pending++;
      else if (status === 'scheduled') scheduled++;
      else if (status === 'processing') processing++;

      if (deliveryMode === 'scheduled') {
        scheduledCount++;
      } else {
        immediateCount++;
      }

      // Check quiet-hours delay indicator (e.g. attemptCount > 0 while scheduled)
      if (data.attemptCount && data.attemptCount > 0 && status === 'scheduled') {
        quietHoursDelayedCount++;
      }

      // Token success/failure tracking from delivery metadata
      const sTokens = typeof data.successfulTokenCount === 'number' ? data.successfulTokenCount : 0;
      const fTokens = typeof data.failedTokenCount === 'number' ? data.failedTokenCount : 0;
      totalTokensSuccessful += sTokens;
      totalTokensFailed += fTokens;
      totalTokensAttempted += sTokens + fTokens;

      // Processing latency calculation
      const processedDate = parseFirestoreTimestamp(data.processedAt);
      const sentDate = parseFirestoreTimestamp(data.sentAt);
      if (createdDate && (sentDate || processedDate)) {
        const end = sentDate || processedDate;
        const diff = end!.getTime() - createdDate.getTime();
        if (diff >= 0 && diff < 3600000) {
          totalProcessingTimeMs += diff;
          eventsWithLatencyCount++;
        }
      }

      if (data.attemptCount) {
        totalAttempts += data.attemptCount;
      }

      // Category breakdown
      const catKey = ALL_CATEGORIES.includes(type) ? type : 'GENERAL';
      if (categoryMap[catKey]) {
        categoryMap[catKey].count++;
        if (status === 'sent') categoryMap[catKey].sent++;
        else if (status === 'failed') categoryMap[catKey].failed++;
        else if (status === 'pending') categoryMap[catKey].pending++;
        else if (status === 'scheduled') categoryMap[catKey].scheduled++;
      }

      // Time series bucket
      if (createdDate) {
        let dateKey = '';
        let label = '';
        if (timeRange === 'today') {
          const hour = createdDate.getHours();
          dateKey = `${hour}:00`;
          label = `${hour.toString().padStart(2, '0')}:00`;
        } else {
          dateKey = createdDate.toISOString().slice(0, 10);
          label = createdDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }

        if (!timeSeriesMap.has(dateKey)) {
          timeSeriesMap.set(dateKey, {
            dateKey,
            label,
            timestamp: createdDate.getTime(),
            total: 0,
            sent: 0,
            failed: 0,
            scheduled: 0,
            pending: 0,
          });
        }
        const point = timeSeriesMap.get(dateKey)!;
        point.total++;
        if (status === 'sent') point.sent++;
        else if (status === 'failed') point.failed++;
        else if (status === 'scheduled') point.scheduled++;
        else if (status === 'pending') point.pending++;
      }

      // Record failures
      if (status === 'failed' || data.failureReason) {
        failureItems.push({
          id: docSnap.id,
          eventId: docSnap.id,
          category: type,
          reason: data.failureReason || 'Unknown error occurred during delivery',
          reasonGroup: categorizeFailureReason(data.failureReason),
          timestamp: createdDate ? createdDate.toISOString() : new Date().toISOString(),
          userId: data.userId || 'unknown',
          title: data.title || 'Untitled',
        });
      }
    });

    const terminalEvents = sent + failed;
    const successRate = terminalEvents > 0 ? Math.round((sent / terminalEvents) * 1000) / 10 : total > 0 && sent > 0 ? 100 : 0;

    const tokenDeliverySuccessRate =
      totalTokensAttempted > 0
        ? Math.round((totalTokensSuccessful / totalTokensAttempted) * 1000) / 10
        : 0;

    const avgProcessingTimeMs =
      eventsWithLatencyCount > 0 ? Math.round(totalProcessingTimeMs / eventsWithLatencyCount) : 0;

    const avgAttemptCount = total > 0 ? Math.round((totalAttempts / total) * 10) / 10 : 1;

    const summary: NotificationAnalyticsSummary = {
      total,
      pending,
      scheduled,
      processing,
      sent,
      failed,
      successRate,
      immediateCount,
      scheduledCount,
      quietHoursDelayedCount,
      totalTokensAttempted,
      totalTokensSuccessful,
      totalTokensFailed,
      tokenDeliverySuccessRate,
      avgProcessingTimeMs,
      avgAttemptCount: Math.max(1, avgAttemptCount),
    };

    // Build Category Stats array
    const categoryStats: NotificationCategoryStatItem[] = ALL_CATEGORIES.map((cat) => {
      const data = categoryMap[cat];
      const catTerminal = data.sent + data.failed;
      const catRate = catTerminal > 0 ? Math.round((data.sent / catTerminal) * 1000) / 10 : 0;
      const percentage = total > 0 ? Math.round((data.count / total) * 1000) / 10 : 0;

      return {
        category: cat,
        label: CATEGORY_LABELS[cat],
        count: data.count,
        percentage,
        sent: data.sent,
        failed: data.failed,
        pending: data.pending,
        scheduled: data.scheduled,
        successRate: catRate,
      };
    });

    // Build sorted Time Series
    const timeSeries = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp);

    // Group failures
    const failureGroupsMap: Record<
      string,
      { label: string; description: string; count: number; examples: NotificationFailureItem[] }
    > = {
      NO_TOKENS: {
        label: 'No Registered Device Tokens',
        description: 'Recipient has not registered or granted Web Push permissions on any device.',
        count: 0,
        examples: [],
      },
      INVALID_TOKEN: {
        label: 'Invalid or Expired FCM Tokens',
        description: 'FCM reported token expired or unregistered (cleaned up automatically).',
        count: 0,
        examples: [],
      },
      PREFERENCES_DISABLED: {
        label: 'Account Preferences Opt-Out',
        description: 'Recipient disabled notification category or master notifications toggle.',
        count: 0,
        examples: [],
      },
      FCM_ERROR: {
        label: 'FCM Gateway & Network Failures',
        description: 'Firebase Cloud Messaging API connection or multicast dispatch error.',
        count: 0,
        examples: [],
      },
      TIMEOUT: {
        label: 'Processing Timeouts',
        description: 'Delivery worker exceeded maximum processing deadline.',
        count: 0,
        examples: [],
      },
      OTHER: {
        label: 'General / Unclassified',
        description: 'Other delivery or validation discrepancies.',
        count: 0,
        examples: [],
      },
    };

    failureItems.forEach((item) => {
      const grp = failureGroupsMap[item.reasonGroup] || failureGroupsMap.OTHER;
      grp.count++;
      if (grp.examples.length < 5) {
        grp.examples.push(item);
      }
    });

    const totalFailures = failureItems.length;
    const failureGroups: NotificationFailureGroup[] = Object.entries(failureGroupsMap)
      .filter(([_, grp]) => grp.count > 0)
      .map(([key, grp]) => ({
        group: key,
        label: grp.label,
        description: grp.description,
        count: grp.count,
        percentage: totalFailures > 0 ? Math.round((grp.count / totalFailures) * 1000) / 10 : 0,
        recentExamples: grp.examples,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      summary,
      categoryStats,
      timeSeries,
      failureGroups,
      rawEventsCount: total,
    };
  } catch (err) {
    console.error('Error computing notification analytics:', err);
    return createFallbackAnalytics();
  }
}

/**
 * Fetches Device Token Health & Distribution without exposing any sensitive FCM token strings
 */
export async function fetchTokenHealthStats(): Promise<NotificationTokenHealth> {
  if (!isFirebaseConfigured) {
    return {
      totalRegisteredTokens: 0,
      enabledTokens: 0,
      invalidatedTokens: 0,
      invalidTokenRate: 0,
      platformBreakdown: [],
      browserBreakdown: [],
      recentInvalidatedTokens: [],
    };
  }

  try {
    // Attempt Collection Group query on notificationTokens
    const tokensQuery = query(collectionGroup(db, 'notificationTokens'), limit(500));
    const snap = await getDocs(tokensQuery);

    let total = 0;
    let enabled = 0;
    let invalidated = 0;

    const platformCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    const recentInvalidated: NotificationTokenHealth['recentInvalidatedTokens'] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      total++;
      const isEnabled = data.enabled !== false;
      if (isEnabled) {
        enabled++;
      } else {
        invalidated++;
      }

      const platform = data.platform || 'Unknown';
      const browser = data.browser || 'Unknown';

      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;

      if (!isEnabled && recentInvalidated.length < 10) {
        const invDate = parseFirestoreTimestamp(data.invalidatedAt || data.updatedAt);
        recentInvalidated.push({
          id: docSnap.id,
          userId: data.uid ? `${data.uid.slice(0, 6)}...${data.uid.slice(-4)}` : 'unknown',
          platform,
          browser,
          invalidReason: data.invalidReason || 'Token unregistered by FCM',
          invalidatedAt: invDate ? invDate.toISOString() : undefined,
        });
      }
    });

    const invalidTokenRate = total > 0 ? Math.round((invalidated / total) * 1000) / 10 : 0;

    const platformBreakdown = Object.entries(platformCounts).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }));

    const browserBreakdown = Object.entries(browserCounts).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }));

    return {
      totalRegisteredTokens: total,
      enabledTokens: enabled,
      invalidatedTokens: invalidated,
      invalidTokenRate,
      platformBreakdown,
      browserBreakdown,
      recentInvalidatedTokens: recentInvalidated,
    };
  } catch (err) {
    console.warn('CollectionGroup notificationTokens query note:', err);
    // Graceful fallback
    return {
      totalRegisteredTokens: 0,
      enabledTokens: 0,
      invalidatedTokens: 0,
      invalidTokenRate: 0,
      platformBreakdown: [],
      browserBreakdown: [],
      recentInvalidatedTokens: [],
    };
  }
}

/**
 * Gets Global Emergency Notification Switch state from adminMeta/notifications
 */
export async function getNotificationGlobalControl(): Promise<NotificationGlobalControl> {
  if (!isFirebaseConfigured) {
    return { globalEnabled: true };
  }
  try {
    const docRef = doc(db, 'adminMeta', 'notifications');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        globalEnabled: data.globalEnabled !== false,
        emergencyDisabledAt: data.emergencyDisabledAt || null,
        disabledBy: data.disabledBy || null,
        reason: data.reason || null,
        lastUpdatedAt: data.lastUpdatedAt || null,
        updatedBy: data.updatedBy || null,
      };
    }
  } catch (err) {
    console.warn('Notice reading adminMeta/notifications:', err);
  }
  return { globalEnabled: true };
}

/**
 * Updates Global Emergency Notification Switch (Admin-only)
 */
export async function updateNotificationGlobalControl(
  globalEnabled: boolean,
  reason: string,
  adminUid: string
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured) {
    return { success: false, error: 'Firebase is not initialized' };
  }
  try {
    const docRef = doc(db, 'adminMeta', 'notifications');
    const payload: Record<string, any> = {
      globalEnabled,
      lastUpdatedAt: new Date().toISOString(),
      updatedBy: adminUid,
    };

    if (!globalEnabled) {
      payload.emergencyDisabledAt = new Date().toISOString();
      payload.disabledBy = adminUid;
      payload.reason = reason || 'Manual emergency stop engaged by administrator';
    } else {
      payload.emergencyDisabledAt = null;
      payload.disabledBy = null;
      payload.reason = null;
    }

    await setDoc(docRef, payload, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error('Failed to update global notification control:', err);
    return { success: false, error: err?.message || 'Permission denied or Firestore error' };
  }
}

/**
 * Fetches real-time system health metrics
 */
export async function fetchNotificationSystemHealth(): Promise<NotificationSystemHealth> {
  const vapidKey = getVapidKey();
  const pushSupported = await isPushSupported();
  const globalControl = await getNotificationGlobalControl();

  let pendingCount = 0;
  let processingCount = 0;
  let recentFailures = 0;
  let total24h = 0;

  if (isFirebaseConfigured) {
    try {
      const eventsRef = collection(db, 'notificationEvents');
      const q = query(eventsRef, orderBy('createdAt', 'desc'), limit(150));
      const snap = await getDocs(q);

      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.status === 'pending') pendingCount++;
        if (d.status === 'processing') processingCount++;

        const cDate = parseFirestoreTimestamp(d.createdAt);
        if (cDate && cDate.getTime() > oneDayAgo) {
          total24h++;
          if (d.status === 'failed') recentFailures++;
        }
      });
    } catch (err) {
      console.warn('Notice checking health queue:', err);
    }
  }

  const tokenHealth = await fetchTokenHealthStats();
  const failureRate24h = total24h > 0 ? Math.round((recentFailures / total24h) * 1000) / 10 : 0;

  let status: 'healthy' | 'degraded' | 'error' = 'healthy';
  if (!globalControl.globalEnabled) {
    status = 'degraded';
  } else if (!vapidKey || failureRate24h > 25) {
    status = 'degraded';
  }

  return {
    status,
    vapidConfigured: Boolean(vapidKey),
    isPushSupported: pushSupported,
    cloudFunctionsTriggerReady: true,
    pendingQueueCount: pendingCount,
    processingCount: processingCount,
    recentFailureRate24h: failureRate24h,
    activeTokenCount: tokenHealth.enabledTokens,
    invalidTokenCount: tokenHealth.invalidatedTokens,
    globalEnabled: globalControl.globalEnabled,
    lastCheckedAt: new Date().toISOString(),
  };
}

/**
 * Cursor-based paginated history queries with multi-predicate filtering
 */
export async function fetchNotificationHistoryPaginated(params: {
  filters: NotificationHistoryFilterState;
  pageSize?: number;
  lastVisible?: DocumentSnapshot | null;
}): Promise<{
  events: NotificationEvent[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}> {
  if (!isFirebaseConfigured) {
    return { events: [], lastDoc: null, hasMore: false };
  }

  try {
    const eventsRef = collection(db, 'notificationEvents');
    const pageSize = params.pageSize || 25;

    let q = query(eventsRef, orderBy('createdAt', 'desc'), limit(pageSize + 1));

    if (params.lastVisible) {
      q = query(eventsRef, orderBy('createdAt', 'desc'), startAfter(params.lastVisible), limit(pageSize + 1));
    }

    const snap = await getDocs(q);
    const docs = snap.docs;
    const hasMore = docs.length > pageSize;
    const targetDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const lastDoc = targetDocs.length > 0 ? targetDocs[targetDocs.length - 1] : null;

    const startDate = getStartDateForRange(params.filters.timeRange);

    const events: NotificationEvent[] = [];
    targetDocs.forEach((docSnap) => {
      const data = docSnap.data();
      const createdDate = parseFirestoreTimestamp(data.createdAt);

      // Status filter
      if (params.filters.status !== 'all' && data.status !== params.filters.status) {
        return;
      }
      // Category filter
      if (params.filters.category !== 'all' && data.type !== params.filters.category) {
        return;
      }
      // Delivery mode filter
      if (params.filters.deliveryMode !== 'all' && (data.deliveryMode || 'immediate') !== params.filters.deliveryMode) {
        return;
      }
      // Time range filter
      if (startDate && createdDate && createdDate < startDate) {
        return;
      }
      // Template filter
      if (params.filters.templateId && params.filters.templateId.trim()) {
        const searchTmpl = params.filters.templateId.toLowerCase().trim();
        if (!data.templateId || !data.templateId.toLowerCase().includes(searchTmpl)) {
          return;
        }
      }
      // Failure only filter
      if (params.filters.hasFailureOnly && data.status !== 'failed' && !data.failureReason) {
        return;
      }
      // Search query (title, body, userId, eventId)
      if (params.filters.searchQuery && params.filters.searchQuery.trim()) {
        const sq = params.filters.searchQuery.toLowerCase().trim();
        const matches =
          docSnap.id.toLowerCase().includes(sq) ||
          (data.title && data.title.toLowerCase().includes(sq)) ||
          (data.body && data.body.toLowerCase().includes(sq)) ||
          (data.userId && data.userId.toLowerCase().includes(sq));
        if (!matches) {
          return;
        }
      }

      events.push({
        id: docSnap.id,
        userId: data.userId || '',
        type: data.type || 'GENERAL',
        title: data.title || '',
        body: data.body || '',
        templateId: data.templateId || null,
        templateVersion: data.templateVersion || null,
        data: data.data || {},
        status: data.status || 'pending',
        deliveryMode: data.deliveryMode || 'immediate',
        scheduledAt: data.scheduledAt || null,
        timezone: data.timezone || null,
        cooldownCategory: data.cooldownCategory || null,
        attemptCount: data.attemptCount || 0,
        lastAttemptAt: parseFirestoreTimestamp(data.lastAttemptAt)?.toISOString() || null,
        nextAttemptAt: parseFirestoreTimestamp(data.nextAttemptAt)?.toISOString() || null,
        processedAt: parseFirestoreTimestamp(data.processedAt)?.toISOString() || null,
        sentAt: parseFirestoreTimestamp(data.sentAt)?.toISOString() || null,
        successfulTokenCount: data.successfulTokenCount ?? 0,
        failedTokenCount: data.failedTokenCount ?? 0,
        failureReason: data.failureReason || null,
        error: data.error || null,
        createdAt: createdDate ? createdDate.toISOString() : new Date().toISOString(),
      });
    });

    return {
      events,
      lastDoc,
      hasMore,
    };
  } catch (err) {
    console.error('Error in fetchNotificationHistoryPaginated:', err);
    return { events: [], lastDoc: null, hasMore: false };
  }
}

function createFallbackAnalytics() {
  return {
    summary: {
      total: 0,
      pending: 0,
      scheduled: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      successRate: 0,
      immediateCount: 0,
      scheduledCount: 0,
      quietHoursDelayedCount: 0,
      totalTokensAttempted: 0,
      totalTokensSuccessful: 0,
      totalTokensFailed: 0,
      tokenDeliverySuccessRate: 0,
      avgProcessingTimeMs: 0,
      avgAttemptCount: 1,
    },
    categoryStats: ALL_CATEGORIES.map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      count: 0,
      percentage: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      scheduled: 0,
      successRate: 0,
    })),
    timeSeries: [],
    failureGroups: [],
    rawEventsCount: 0,
  };
}
