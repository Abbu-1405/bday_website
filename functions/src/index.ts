import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';

// Target Firebase Project and Database configuration
const PROJECT_ID = process.env.GCLOUD_PROJECT || 'gen-lang-client-0057157522';
const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || 'ai-studio-remixstarlitlett-45632027-0698-4661-bfb7-6fea5b923b2b';

// Initialize Firebase Admin SDK using Application Default Credentials
const adminApp = getApps().length === 0
  ? initializeApp({ projectId: PROJECT_ID })
  : getApp();

let db: ReturnType<typeof getFirestore>;
try {
  if (DATABASE_ID && DATABASE_ID !== '(default)') {
    db = getFirestore(adminApp, DATABASE_ID);
  } else {
    db = getFirestore(adminApp);
  }
} catch (err) {
  logger.warn('[NotificationEngine] Falling back to default database instance:', err);
  db = getFirestore(adminApp);
}

const messaging = getMessaging(adminApp);

function isInvalidTokenErrorCode(errorCode?: string): boolean {
  if (!errorCode) return false;
  const invalidCodes = [
    'messaging/registration-token-not-registered',
    'messaging/invalid-registration-token',
    'messaging/invalid-argument',
    'messaging/mismatched-credential',
  ];
  return invalidCodes.includes(errorCode);
}

async function isGlobalNotificationPaused(): Promise<{ paused: boolean; reason?: string }> {
  try {
    const metaSnap = await db.collection('adminMeta').doc('notifications').get();
    if (metaSnap.exists) {
      const data = metaSnap.data();
      if (data && data.globalEnabled === false) {
        return {
          paused: true,
          reason: data.reason || 'Global notifications paused by administrator emergency stop',
        };
      }
    }
  } catch (err) {
    // Non-blocking on read error
  }
  return { paused: false };
}

/**
 * Checks if a given time falls within the user's configured quiet hours in their timezone
 */
export function isInsideQuietHours(
  targetDate: Date,
  timezone: string = 'UTC',
  quietHours?: { enabled?: boolean; start?: string; end?: string }
): boolean {
  if (!quietHours?.enabled || !quietHours.start || !quietHours.end) {
    return false;
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(targetDate);
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const currentMins = hour * 60 + minute;

    const [startH, startM] = quietHours.start.split(':').map((v) => parseInt(v, 10) || 0);
    const [endH, endM] = quietHours.end.split(':').map((v) => parseInt(v, 10) || 0);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (startMins < endMins) {
      // Quiet hours within same day (e.g. 13:00 to 15:00)
      return currentMins >= startMins && currentMins < endMins;
    } else if (startMins > endMins) {
      // Quiet hours cross midnight (e.g. 22:00 to 07:00)
      return currentMins >= startMins || currentMins < endMins;
    }
    return false;
  } catch (err) {
    logger.warn('[NotificationEngine] Error evaluating quiet hours:', err);
    return false;
  }
}

/**
 * Calculates the next valid non-quiet delivery time if the target falls within quiet hours
 */
export function calculateNextValidDeliveryTime(
  targetDate: Date,
  timezone: string = 'UTC',
  quietHours?: { enabled?: boolean; start?: string; end?: string }
): Date {
  if (!quietHours?.enabled || !quietHours.start || !quietHours.end) {
    return targetDate;
  }

  if (!isInsideQuietHours(targetDate, timezone, quietHours)) {
    return targetDate;
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(targetDate);
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const currentMins = hour * 60 + minute;

    const [endH, endM] = quietHours.end.split(':').map((v) => parseInt(v, 10) || 0);
    const endMins = endH * 60 + endM;

    let diffMinutes = 0;
    if (currentMins < endMins) {
      diffMinutes = endMins - currentMins;
    } else {
      diffMinutes = 1440 - currentMins + endMins;
    }

    const nextDelivery = new Date(targetDate.getTime() + diffMinutes * 60 * 1000);
    return nextDelivery;
  } catch (err) {
    logger.warn('[NotificationEngine] Error calculating next valid delivery time:', err);
    return targetDate;
  }
}

/**
 * Core event delivery function executed by Firebase Cloud Functions.
 * Implements atomic claim, device token lookup, FCM multicast delivery,
 * invalid token deactivation, and status finalization.
 */
export async function processEvent(eventId: string) {
  logger.info(`[NotificationEngine] [Event Created/Detected] Processing eventId: ${eventId}`);
  const eventRef = db.collection('notificationEvents').doc(eventId);
  let eventData: any = null;

  // 1. Atomic claim in transaction (prevents race conditions & duplicate sends)
  const claimResult = await db.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(eventRef);
    if (!docSnap.exists) {
      return { shouldProcess: false, reason: 'Event document does not exist' };
    }

    const data = docSnap.data();
    if (!data || (data.status !== 'pending' && data.status !== 'scheduled')) {
      return {
        shouldProcess: false,
        reason: `Status is already '${data?.status}', skipping duplicate execution.`,
      };
    }

    if (!data.userId || !data.title || !data.body) {
      return { shouldProcess: false, reason: 'Missing required event fields (userId, title, body)' };
    }

    // Atomically transition from pending/scheduled -> processing
    transaction.update(eventRef, {
      status: 'processing',
      processedAt: FieldValue.serverTimestamp(),
      attemptCount: FieldValue.increment(1),
      lastAttemptAt: FieldValue.serverTimestamp(),
    });

    eventData = { id: docSnap.id, ...data };
    return { shouldProcess: true };
  });

  if (!claimResult.shouldProcess || !eventData) {
    logger.info(`[NotificationEngine] [Claim Skipped] eventId: ${eventId}, reason: ${claimResult.reason}`);
    return { skipped: true, reason: claimResult.reason };
  }

  // 1.5 Check global emergency stop for non-test events
  if (eventData.data?.isTest !== 'true') {
    const globalState = await isGlobalNotificationPaused();
    if (globalState.paused) {
      logger.info(`[NotificationEngine] [Emergency Stop Active] Global notifications paused. Reverting event ${eventId} to pending. Reason: ${globalState.reason}`);
      await eventRef.update({
        status: eventData.deliveryMode === 'scheduled' ? 'scheduled' : 'pending',
        processedAt: null,
      });
      return { skipped: true, reason: globalState.reason };
    }
  }

  logger.info(`[NotificationEngine] [Event Claimed] eventId: ${eventId}, type: ${eventData.type}, recipient: ${eventData.userId}`);

  const userId = eventData.userId;
  const tokensSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('notificationTokens')
    .where('enabled', '==', true)
    .get();

  const tokens: Array<{ id: string; token: string }> = [];
  tokensSnapshot.forEach((snap) => {
    const tData = snap.data();
    if (tData?.token) {
      tokens.push({ id: snap.id, token: tData.token.trim() });
    }
  });

  logger.info(`[NotificationEngine] [Token Count] Found ${tokens.length} enabled token(s) for user: ${userId}`);

  if (tokens.length === 0) {
    const reason = 'No enabled notification tokens registered for recipient user.';
    logger.warn(`[NotificationEngine] [Final Status: FAILED] eventId: ${eventId} - ${reason}`);
    await eventRef.update({
      status: 'failed',
      failureReason: reason,
      successfulTokenCount: 0,
      failedTokenCount: 0,
      sentAt: null,
    });
    return { success: false, reason };
  }

  // Format payload for FCM data
  const stringifiedData: Record<string, string> = {};
  if (eventData.data && typeof eventData.data === 'object') {
    for (const [k, v] of Object.entries(eventData.data)) {
      if (v !== undefined && v !== null) {
        stringifiedData[k] = typeof v === 'string' ? v : JSON.stringify(v);
      }
    }
  }
  stringifiedData.eventType = String(eventData.type || 'GENERAL');
  stringifiedData.eventId = String(eventId);
  const targetUrl = stringifiedData.url || '/';

  const multicastMessage: MulticastMessage = {
    tokens: tokens.map((t) => t.token),
    notification: {
      title: eventData.title.slice(0, 200),
      body: eventData.body.slice(0, 1000),
    },
    data: stringifiedData,
    webpush: {
      headers: {
        Urgency: 'high',
      },
      notification: {
        title: eventData.title.slice(0, 200),
        body: eventData.body.slice(0, 1000),
        icon: '/download-7.jpg',
        badge: '/download-7.jpg',
        tag: stringifiedData.eventKey || `starlit_${eventData.type}_${eventId}`,
      },
      fcmOptions: {
        link: targetUrl,
      },
    },
  };

  logger.info(`[NotificationEngine] Dispatching FCM multicast to ${tokens.length} token(s) for event: ${eventId}`);
  const response = await messaging.sendEachForMulticast(multicastMessage);
  const successfulCount = response.successCount;
  const failedCount = response.failureCount;
  const failureReasons: string[] = [];

  logger.info(`[NotificationEngine] [FCM Results] eventId: ${eventId} -> Success: ${successfulCount}, Failure: ${failedCount}`);

  if (response.failureCount > 0) {
    const updatePromises: Promise<any>[] = [];
    response.responses.forEach((resp, index) => {
      if (!resp.success) {
        const error = resp.error;
        const errorCode = error?.code;
        const tokenObj = tokens[index];
        failureReasons.push(errorCode || error?.message || 'Unknown error');

        if (tokenObj && isInvalidTokenErrorCode(errorCode)) {
          logger.info(`[NotificationEngine] [Invalid Token Cleanup] Disabling stale token docId: ${tokenObj.id}, code: ${errorCode}`);
          const tokenDocRef = db
            .collection('users')
            .doc(userId)
            .collection('notificationTokens')
            .doc(tokenObj.id);

          updatePromises.push(
            tokenDocRef.update({
              enabled: false,
              invalidReason: errorCode || 'Token unregistered',
              invalidatedAt: FieldValue.serverTimestamp(),
            }).catch((err) => {
              logger.warn(`[NotificationEngine] Token deactivation notice:`, err);
            })
          );
        }
      }
    });
    await Promise.allSettled(updatePromises);
  }

  if (successfulCount > 0) {
    logger.info(`[NotificationEngine] [Final Status: SENT] eventId: ${eventId}, deliveredTo: ${successfulCount} device(s)`);
    await eventRef.update({
      status: 'sent',
      sentAt: FieldValue.serverTimestamp(),
      successfulTokenCount: successfulCount,
      failedTokenCount: failedCount,
      failureReason: failureReasons.length > 0 ? failureReasons.slice(0, 3).join('; ') : null,
    });
    return { success: true, successfulTokenCount: successfulCount, failedTokenCount: failedCount };
  } else {
    const failureReason = failureReasons.join('; ') || 'All FCM deliveries failed';
    logger.error(`[NotificationEngine] [Final Status: FAILED] eventId: ${eventId}, reason: ${failureReason}`);
    await eventRef.update({
      status: 'failed',
      failureReason,
      successfulTokenCount: 0,
      failedTokenCount: failedCount,
    });
    return { success: false, failureReason };
  }
}

/**
 * Server-side Scheduled Events Processor.
 * Finds all due scheduled events (scheduledAt <= now), checks user quiet hours & preferences,
 * and executes delivery via processEvent().
 */
export async function processScheduledEvents(): Promise<{
  processedCount: number;
  delayedCount: number;
  skippedCount: number;
  details: any[];
}> {
  const now = new Date();
  logger.info(`[NotificationScheduler] Running scheduled notification check at ${now.toISOString()}`);

  const globalState = await isGlobalNotificationPaused();
  if (globalState.paused) {
    logger.info(`[NotificationScheduler] Scheduled check paused: Emergency stop active (${globalState.reason}).`);
    return {
      processedCount: 0,
      delayedCount: 0,
      skippedCount: 0,
      details: [{ status: 'paused', reason: globalState.reason }],
    };
  }

  const snapshot = await db
    .collection('notificationEvents')
    .where('status', '==', 'scheduled')
    .limit(100)
    .get();

  if (snapshot.empty) {
    logger.info('[NotificationScheduler] No scheduled notification events found.');
    return { processedCount: 0, delayedCount: 0, skippedCount: 0, details: [] };
  }

  let processedCount = 0;
  let delayedCount = 0;
  let skippedCount = 0;
  const details: any[] = [];

  for (const docSnap of snapshot.docs) {
    const eventId = docSnap.id;
    const data = docSnap.data();

    // Check scheduled time
    let scheduledDate: Date | null = null;
    if (data.scheduledAt) {
      if (typeof data.scheduledAt === 'string') {
        scheduledDate = new Date(data.scheduledAt);
      } else if (data.scheduledAt.toDate) {
        scheduledDate = data.scheduledAt.toDate();
      } else if (data.scheduledAt.seconds) {
        scheduledDate = new Date(data.scheduledAt.seconds * 1000);
      }
    }

    // If scheduled for a future time, skip for now
    if (scheduledDate && scheduledDate.getTime() > now.getTime()) {
      continue;
    }

    const userId = data.userId;
    let userPrefs: any = null;

    if (userId) {
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          userPrefs = userDoc.data()?.notificationPreferences;
        }
      } catch (err) {
        logger.warn(`[NotificationScheduler] Notice fetching user prefs for ${userId}:`, err);
      }
    }

    // Check user preference master & category enable flags
    if (userPrefs && userPrefs.enabled === false) {
      logger.info(`[NotificationScheduler] User ${userId} has disabled all notifications. Cancelling event ${eventId}.`);
      await docSnap.ref.update({
        status: 'failed',
        failureReason: 'User has disabled notifications in account preferences.',
      });
      skippedCount++;
      details.push({ eventId, status: 'cancelled', reason: 'Preferences disabled' });
      continue;
    }

    const timezone = data.timezone || userPrefs?.timezone || 'UTC';
    const quietHours = userPrefs ? {
      enabled: userPrefs.quietHoursEnabled,
      start: userPrefs.quietHoursStart,
      end: userPrefs.quietHoursEnd,
    } : undefined;

    // Check if event is currently in quiet hours
    if (quietHours?.enabled && isInsideQuietHours(now, timezone, quietHours)) {
      const nextTime = calculateNextValidDeliveryTime(now, timezone, quietHours);
      logger.info(`[NotificationScheduler] Event ${eventId} falls in quiet hours. Rescheduling to ${nextTime.toISOString()}`);
      await docSnap.ref.update({
        scheduledAt: nextTime.toISOString(),
        nextAttemptAt: nextTime.toISOString(),
        attemptCount: FieldValue.increment(1),
      });
      delayedCount++;
      details.push({ eventId, status: 'delayed', nextDelivery: nextTime.toISOString() });
      continue;
    }

    // Due and eligible: deliver through processEvent
    const deliveryResult = await processEvent(eventId);
    processedCount++;
    details.push({ eventId, status: 'processed', result: deliveryResult });
  }

  logger.info(`[NotificationScheduler] Scheduled check complete. Processed: ${processedCount}, Delayed: ${delayedCount}, Skipped: ${skippedCount}`);
  return { processedCount, delayedCount, skippedCount, details };
}

/**
 * Cloud Function Trigger: onNotificationEventCreated
 * Listens to document creation on notificationEvents/{eventId}.
 * Automatically runs on event creation in Firestore.
 */
export const onNotificationEventCreated = onDocumentCreated(
  {
    document: 'notificationEvents/{eventId}',
    ...(DATABASE_ID && DATABASE_ID !== '(default)' ? { database: DATABASE_ID } : {}),
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.warn('[NotificationEngine] Document snapshot is empty in onDocumentCreated trigger');
      return null;
    }
    const eventId = event.params.eventId;
    const data = snap.data();
    logger.info(`[NotificationEngine] onDocumentCreated triggered for eventId: ${eventId}, status: ${data?.status}`);
    
    if (data && data.status === 'pending') {
      return processEvent(eventId);
    } else if (data && data.status === 'scheduled') {
      logger.info(`[NotificationEngine] Event ${eventId} created with status 'scheduled' for ${data.scheduledAt}. Awaiting scheduler.`);
      return null;
    }
    return null;
  }
);

/**
 * Cloud Function Scheduler: scheduledNotificationWorker
 * Periodically checks for due scheduled events every 5 minutes in production.
 */
export const scheduledNotificationWorker = onSchedule(
  {
    schedule: 'every 5 minutes',
    timeZone: 'UTC',
  },
  async () => {
    await processScheduledEvents();
  }
);

/**
 * Cloud Function HTTPS endpoint: processPendingNotificationEvents
 * Allows manual or scheduled triggering of pending and due scheduled events with CORS support.
 */
export const processPendingNotificationEvents = onRequest({ cors: true }, async (req, res) => {
  try {
    logger.info('[NotificationEngine] processPendingNotificationEvents HTTPS function called');
    
    // 1. Process due scheduled events first
    const scheduledSummary = await processScheduledEvents();

    // 2. Process immediate pending events
    const snapshot = await db
      .collection('notificationEvents')
      .where('status', '==', 'pending')
      .limit(50)
      .get();

    const pendingResults = [];
    if (!snapshot.empty) {
      logger.info(`[NotificationEngine] Found ${snapshot.size} pending notification event(s) to process`);
      for (const docSnap of snapshot.docs) {
        const resVal = await processEvent(docSnap.id);
        pendingResults.push({ id: docSnap.id, result: resVal });
      }
    }

    res.json({
      success: true,
      message: `Processed ${pendingResults.length} pending events and ${scheduledSummary.processedCount} scheduled events.`,
      pendingCount: pendingResults.length,
      scheduledCount: scheduledSummary.processedCount,
      delayedCount: scheduledSummary.delayedCount,
      scheduledDetails: scheduledSummary.details,
      pendingDetails: pendingResults,
    });
  } catch (err: any) {
    logger.error('[NotificationEngine] Error in processPendingNotificationEvents:', err);
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * Cloud Function HTTPS endpoint: runScheduledNotificationCheck
 * Explicit HTTPS endpoint for Cloud Scheduler or manual administrator triggering of due scheduled notifications.
 */
export const runScheduledNotificationCheck = onRequest({ cors: true }, async (req, res) => {
  try {
    const summary = await processScheduledEvents();
    res.json({ success: true, ...summary });
  } catch (err: any) {
    logger.error('[NotificationEngine] Error in runScheduledNotificationCheck:', err);
    res.status(500).json({ success: false, error: err?.message });
  }
});

