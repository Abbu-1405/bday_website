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
  NotificationEngagementSummary,
  NotificationCategoryEngagement,
  NotificationTemplateEngagement,
  NotificationIntelligenceAnalyticsSummary,
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
  engagement: NotificationEngagementSummary;
  intelligence: NotificationIntelligenceAnalyticsSummary;
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

    // Phase 7: Engagement tracking counters
    let totalSent = 0;
    let totalClicked = 0;
    let uniqueClickedEvents = 0;
    let totalTargetOpened = 0;
    let totalTimeToClickMs = 0;
    let timeToClickCount = 0;
    let totalTimeToContentOpenMs = 0;
    let timeToContentOpenCount = 0;

    const engagementCategoryMap: Record<
      NotificationEventType,
      { sent: number; clicked: number; targetOpened: number }
    > = {
      LETTER_AVAILABLE: { sent: 0, clicked: 0, targetOpened: 0 },
      OPEN_WHEN_AVAILABLE: { sent: 0, clicked: 0, targetOpened: 0 },
      SECRET_UNLOCKED: { sent: 0, clicked: 0, targetOpened: 0 },
      MOMENT_AVAILABLE: { sent: 0, clicked: 0, targetOpened: 0 },
      BIRTHDAY: { sent: 0, clicked: 0, targetOpened: 0 },
      GENERAL: { sent: 0, clicked: 0, targetOpened: 0 },
    };

    const engagementDeliveryModeMap = {
      immediate: { sent: 0, clicked: 0, targetOpened: 0 },
      scheduled: { sent: 0, clicked: 0, targetOpened: 0 },
    };

    const templateEngagementMap: Map<
      string,
      {
        templateId: string;
        templateVersion: number;
        title: string;
        category: NotificationEventType | string;
        sent: number;
        clicked: number;
        targetOpened: number;
      }
    > = new Map();

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

    // Phase 8: Smart Intelligence Counters
    let intAllowed = 0;
    let intDelayed = 0;
    let intSuppressed = 0;
    let savedByCooldowns = 0;
    let delayedByQuietHours = 0;
    let delayedBySmartWindow = 0;
    let totalDelayMinutes = 0;
    let delayCalculatedCount = 0;
    const reasonCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = { URGENT: 0, HIGH: 0, NORMAL: 0, LOW: 0 };

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

      // Phase 8: Record Smart Intelligence Decision
      const decision = data.decision || (status === 'failed' ? 'SUPPRESS' : status === 'scheduled' ? 'DELAY' : 'ALLOW');
      const reason = data.decisionReason || (status === 'failed' ? 'SUPPRESSION_RULE' : status === 'scheduled' ? 'SCHEDULED_FOR_LATER' : 'ALLOWED_IMMEDIATE');
      const priority = (data.decisionPriority as 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW') || (type === 'LETTER_AVAILABLE' || type === 'SECRET_UNLOCKED' ? 'HIGH' : type === 'GENERAL' ? 'LOW' : 'NORMAL');

      if (decision === 'ALLOW') intAllowed++;
      else if (decision === 'DELAY') intDelayed++;
      else if (decision === 'SUPPRESS') intSuppressed++;

      if (priorityCounts[priority] !== undefined) priorityCounts[priority]++;
      else priorityCounts.NORMAL++;

      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;

      if (reason === 'COOLDOWN' || reason === 'HOURLY_LIMIT' || reason === 'DAILY_LIMIT' || reason === 'CATEGORY_DAILY_LIMIT') {
        savedByCooldowns++;
      }
      if (reason === 'QUIET_HOURS') {
        delayedByQuietHours++;
      }
      if (reason === 'ALLOWED_PREFERRED_WINDOW' || reason === 'SMART_DELAY') {
        delayedBySmartWindow++;
      }

      const scheduledDateForDelay = parseFirestoreTimestamp(data.scheduledAt);
      if (decision === 'DELAY' && createdDate && scheduledDateForDelay) {
        const diffMin = Math.round((scheduledDateForDelay.getTime() - createdDate.getTime()) / 60000);
        if (diffMin > 0 && diffMin < 10080) {
          totalDelayMinutes += diffMin;
          delayCalculatedCount++;
        }
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
      const scheduledDate = parseFirestoreTimestamp(data.scheduledAt);

      if (sentDate) {
        // For immediate: latency is sentDate - createdDate
        // For scheduled: latency is sentDate - scheduledDate (actual dispatch lag beyond scheduled time)
        const baseline = deliveryMode === 'scheduled' && scheduledDate ? scheduledDate : createdDate;
        if (baseline) {
          const diff = sentDate.getTime() - baseline.getTime();
          if (diff >= 0 && diff < 3600000) {
            totalProcessingTimeMs += diff;
            eventsWithLatencyCount++;
          }
        }
      } else if (createdDate && processedDate) {
        const diff = processedDate.getTime() - createdDate.getTime();
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

      // Phase 7: Engagement calculations for this event
      const isSent = status === 'sent' || Boolean(sentDate);
      if (isSent) {
        totalSent++;
        engagementCategoryMap[catKey].sent++;
        if (deliveryMode === 'scheduled') {
          engagementDeliveryModeMap.scheduled.sent++;
        } else {
          engagementDeliveryModeMap.immediate.sent++;
        }
      }

      const clickedDate = parseFirestoreTimestamp(data.clickedAt);
      const targetOpenedDate = parseFirestoreTimestamp(data.targetOpenedAt);

      const isClicked = Boolean(clickedDate);
      const isTargetOpened = Boolean(targetOpenedDate);

      if (isClicked) {
        uniqueClickedEvents++;
        const opCount = typeof data.openedCount === 'number' && data.openedCount > 0 ? data.openedCount : 1;
        totalClicked += opCount;

        engagementCategoryMap[catKey].clicked++;
        if (deliveryMode === 'scheduled') {
          engagementDeliveryModeMap.scheduled.clicked++;
        } else {
          engagementDeliveryModeMap.immediate.clicked++;
        }

        // Time to click: sent -> click
        if (sentDate && clickedDate) {
          const clickDiff = clickedDate.getTime() - sentDate.getTime();
          if (clickDiff >= 0 && clickDiff < 30 * 24 * 60 * 60 * 1000) {
            totalTimeToClickMs += clickDiff;
            timeToClickCount++;
          }
        }
      }

      if (isTargetOpened) {
        totalTargetOpened++;
        engagementCategoryMap[catKey].targetOpened++;
        if (deliveryMode === 'scheduled') {
          engagementDeliveryModeMap.scheduled.targetOpened++;
        } else {
          engagementDeliveryModeMap.immediate.targetOpened++;
        }

        // Time to content open: click -> target opened
        if (clickedDate && targetOpenedDate) {
          const openDiff = targetOpenedDate.getTime() - clickedDate.getTime();
          if (openDiff >= 0 && openDiff < 24 * 60 * 60 * 1000) {
            totalTimeToContentOpenMs += openDiff;
            timeToContentOpenCount++;
          }
        }
      }

      // Template Engagement aggregation
      if (data.templateId) {
        const tId = String(data.templateId);
        const tVer = typeof data.templateVersion === 'number' ? data.templateVersion : 1;
        const key = `${tId}_v${tVer}`;
        if (!templateEngagementMap.has(key)) {
          templateEngagementMap.set(key, {
            templateId: tId,
            templateVersion: tVer,
            title: data.title || 'Template Notification',
            category: type,
            sent: 0,
            clicked: 0,
            targetOpened: 0,
          });
        }
        const tStat = templateEngagementMap.get(key)!;
        if (isSent) tStat.sent++;
        if (isClicked) tStat.clicked++;
        if (isTargetOpened) tStat.targetOpened++;
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

    // Phase 7 Engagement Metrics summary compilation
    const clickThroughRate = totalSent > 0 ? Math.round((uniqueClickedEvents / totalSent) * 1000) / 10 : 0;
    const contentOpenRate = uniqueClickedEvents > 0 ? Math.round((totalTargetOpened / uniqueClickedEvents) * 1000) / 10 : 0;
    const avgTimeToClickMs = timeToClickCount > 0 ? Math.round(totalTimeToClickMs / timeToClickCount) : 0;
    const avgTimeToContentOpenMs = timeToContentOpenCount > 0 ? Math.round(totalTimeToContentOpenMs / timeToContentOpenCount) : 0;

    const byCategory: NotificationCategoryEngagement[] = ALL_CATEGORIES.map((cat) => {
      const cData = engagementCategoryMap[cat];
      const ctr = cData.sent > 0 ? Math.round((cData.clicked / cData.sent) * 1000) / 10 : 0;
      const cRate = cData.clicked > 0 ? Math.round((cData.targetOpened / cData.clicked) * 1000) / 10 : 0;
      return {
        category: cat,
        label: CATEGORY_LABELS[cat],
        sent: cData.sent,
        clicked: cData.clicked,
        ctr,
        targetOpened: cData.targetOpened,
        contentOpenRate: cRate,
      };
    });

    const byTemplate: NotificationTemplateEngagement[] = Array.from(templateEngagementMap.values())
      .map((t) => ({
        ...t,
        ctr: t.sent > 0 ? Math.round((t.clicked / t.sent) * 1000) / 10 : 0,
        contentOpenRate: t.clicked > 0 ? Math.round((t.targetOpened / t.clicked) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.sent - a.sent);

    const immSent = engagementDeliveryModeMap.immediate.sent;
    const immClicked = engagementDeliveryModeMap.immediate.clicked;
    const immTargetOpened = engagementDeliveryModeMap.immediate.targetOpened;

    const schedSent = engagementDeliveryModeMap.scheduled.sent;
    const schedClicked = engagementDeliveryModeMap.scheduled.clicked;
    const schedTargetOpened = engagementDeliveryModeMap.scheduled.targetOpened;

    const byDeliveryMode = {
      immediate: {
        sent: immSent,
        clicked: immClicked,
        ctr: immSent > 0 ? Math.round((immClicked / immSent) * 1000) / 10 : 0,
        targetOpened: immTargetOpened,
        contentOpenRate: immClicked > 0 ? Math.round((immTargetOpened / immClicked) * 1000) / 10 : 0,
      },
      scheduled: {
        sent: schedSent,
        clicked: schedClicked,
        ctr: schedSent > 0 ? Math.round((schedClicked / schedSent) * 1000) / 10 : 0,
        targetOpened: schedTargetOpened,
        contentOpenRate: schedClicked > 0 ? Math.round((schedTargetOpened / schedClicked) * 1000) / 10 : 0,
      },
    };

    const engagement: NotificationEngagementSummary = {
      totalSent,
      totalClicked,
      uniqueClickedEvents,
      clickThroughRate,
      totalTargetOpened,
      contentOpenRate,
      avgTimeToClickMs,
      avgTimeToContentOpenMs,
      byCategory,
      byTemplate,
      byDeliveryMode,
    };

    // Build Phase 8 Intelligence summary
    const totalDecisions = total;
    const allowedRate = totalDecisions > 0 ? Math.round((intAllowed / totalDecisions) * 1000) / 10 : 0;
    const delayedRate = totalDecisions > 0 ? Math.round((intDelayed / totalDecisions) * 1000) / 10 : 0;
    const suppressedRate = totalDecisions > 0 ? Math.round((intSuppressed / totalDecisions) * 1000) / 10 : 0;
    const avgDelayMinutes = delayCalculatedCount > 0 ? Math.round(totalDelayMinutes / delayCalculatedCount) : 0;

    const REASON_LABELS: Record<string, string> = {
      ALLOWED_IMMEDIATE: 'Immediate Delivery Allowed',
      ALLOWED_SCHEDULED: 'Scheduled Delivery Allowed',
      ALLOWED_PREFERRED_WINDOW: 'Preferred Window Optimization',
      QUIET_HOURS: 'Quiet Hours Deferral',
      COOLDOWN: 'Anti-Spam Spacing Cooldown',
      HOURLY_LIMIT: 'Hourly Frequency Limit',
      DAILY_LIMIT: 'Daily Global Limit',
      CATEGORY_DAILY_LIMIT: 'Category Frequency Limit',
      USER_DISABLED: 'User Notification Opt-Out',
      CATEGORY_DISABLED: 'Category Preference Opt-Out',
      EMERGENCY_STOP: 'Emergency System Pause',
      TEST_PUSH_BYPASS: 'Admin Test Push Bypass',
      FALLBACK_ALLOWED: 'System Fallback Delivery',
      SMART_DELAY: 'Smart Window Timing Delay',
      SCHEDULED_FOR_LATER: 'Scheduled For Later',
    };

    const byReason = Object.entries(reasonCounts)
      .map(([rCode, count]) => ({
        reason: rCode,
        label: REASON_LABELS[rCode] || rCode.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
        count,
        percentage: totalDecisions > 0 ? Math.round((count / totalDecisions) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const byPriority = (['URGENT', 'HIGH', 'NORMAL', 'LOW'] as const).map((p) => ({
      priority: p,
      count: priorityCounts[p] || 0,
      percentage: totalDecisions > 0 ? Math.round(((priorityCounts[p] || 0) / totalDecisions) * 1000) / 10 : 0,
    }));

    const intelligence: NotificationIntelligenceAnalyticsSummary = {
      totalDecisions,
      allowedCount: intAllowed,
      delayedCount: intDelayed,
      suppressedCount: intSuppressed,
      allowedRate,
      delayedRate,
      suppressedRate,
      byReason,
      byPriority,
      savedByCooldowns,
      delayedByQuietHours,
      delayedBySmartWindow,
      avgDelayMinutes,
    };

    return {
      summary,
      categoryStats,
      timeSeries,
      failureGroups,
      rawEventsCount: total,
      engagement,
      intelligence,
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

        // Phase 7: Engagement metadata
        clickedAt: parseFirestoreTimestamp(data.clickedAt)?.toISOString() || null,
        lastClickedAt: parseFirestoreTimestamp(data.lastClickedAt)?.toISOString() || null,
        openedCount: typeof data.openedCount === 'number' ? data.openedCount : data.clickedAt ? 1 : 0,
        targetOpenedAt: parseFirestoreTimestamp(data.targetOpenedAt)?.toISOString() || null,
        interactionSource: data.interactionSource || null,

        // Phase 8: Smart Decision Audit Trail
        decision: data.decision || null,
        decisionReason: data.decisionReason || null,
        decisionReasonExplanation: data.decisionReasonExplanation || null,
        decisionPriority: data.decisionPriority || null,
        decisionAt: parseFirestoreTimestamp(data.decisionAt)?.toISOString() || null,
        decisionSource: data.decisionSource || null,
        recommendedDeliveryAt: parseFirestoreTimestamp(data.recommendedDeliveryAt)?.toISOString() || (typeof data.recommendedDeliveryAt === 'string' ? data.recommendedDeliveryAt : null),
        signalsUsed: Array.isArray(data.signalsUsed) ? data.signalsUsed : null,
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
    engagement: {
      totalSent: 0,
      totalClicked: 0,
      uniqueClickedEvents: 0,
      clickThroughRate: 0,
      totalTargetOpened: 0,
      contentOpenRate: 0,
      avgTimeToClickMs: 0,
      avgTimeToContentOpenMs: 0,
      byCategory: ALL_CATEGORIES.map((cat) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        sent: 0,
        clicked: 0,
        ctr: 0,
        targetOpened: 0,
        contentOpenRate: 0,
      })),
      byTemplate: [],
      byDeliveryMode: {
        immediate: { sent: 0, clicked: 0, ctr: 0, targetOpened: 0, contentOpenRate: 0 },
        scheduled: { sent: 0, clicked: 0, ctr: 0, targetOpened: 0, contentOpenRate: 0 },
      },
    },
    intelligence: {
      totalDecisions: 0,
      allowedCount: 0,
      delayedCount: 0,
      suppressedCount: 0,
      allowedRate: 0,
      delayedRate: 0,
      suppressedRate: 0,
      byReason: [],
      byPriority: [
        { priority: 'URGENT' as const, count: 0, percentage: 0 },
        { priority: 'HIGH' as const, count: 0, percentage: 0 },
        { priority: 'NORMAL' as const, count: 0, percentage: 0 },
        { priority: 'LOW' as const, count: 0, percentage: 0 },
      ],
      savedByCooldowns: 0,
      delayedByQuietHours: 0,
      delayedBySmartWindow: 0,
      avgDelayMinutes: 0,
    },
  };
}
