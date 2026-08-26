import { FieldValue } from 'firebase-admin/firestore';
import { MulticastMessage } from 'firebase-admin/messaging';
import { adminDb, adminMessaging } from './firebaseAdmin';

export interface ProcessEventResult {
  success: boolean;
  eventId: string;
  skipped?: boolean;
  reason?: string;
  successfulTokenCount?: number;
  failedTokenCount?: number;
  failureReason?: string;
  error?: string;
}

/**
 * Validates whether a token error code corresponds to an unregistered / invalid token
 */
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
    const metaSnap = await adminDb.collection('adminMeta').doc('notifications').get();
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
 * Atomically claims and processes a single notification event by event ID
 */
export async function processNotificationEvent(eventId: string): Promise<ProcessEventResult> {
  if (!eventId) {
    return { success: false, eventId: '', error: 'Event ID is required' };
  }

  const eventRef = adminDb.collection('notificationEvents').doc(eventId);
  let eventData: any = null;

  // 1. ATOMIC TRANSACTION: Claim the pending event
  try {
    const claimResult = await adminDb.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(eventRef);
      if (!docSnap.exists) {
        return { shouldProcess: false, reason: 'Event document does not exist' };
      }

      const data = docSnap.data();
      if (!data) {
        return { shouldProcess: false, reason: 'Event document is empty' };
      }

      // Idempotency check: only process events in 'pending' status
      if (data.status !== 'pending') {
        return {
          shouldProcess: false,
          reason: `Event status is '${data.status}', skipping to prevent duplicate delivery.`,
        };
      }

      // Basic structure validation
      if (!data.userId || typeof data.userId !== 'string') {
        return { shouldProcess: false, reason: 'Invalid or missing userId' };
      }
      if (!data.title || typeof data.title !== 'string') {
        return { shouldProcess: false, reason: 'Invalid or missing title' };
      }
      if (!data.body || typeof data.body !== 'string') {
        return { shouldProcess: false, reason: 'Invalid or missing body' };
      }

      // Atomically transition status from pending to processing
      transaction.update(eventRef, {
        status: 'processing',
        processedAt: FieldValue.serverTimestamp(),
      });

      eventData = { id: docSnap.id, ...data };
      return { shouldProcess: true };
    });

    if (!claimResult.shouldProcess || !eventData) {
      return {
        success: true,
        eventId,
        skipped: true,
        reason: claimResult.reason,
      };
    }

    // Check emergency stop for non-test events
    if (eventData.data?.isTest !== 'true') {
      const globalState = await isGlobalNotificationPaused();
      if (globalState.paused) {
        console.log(`[NotificationWorker] Global notifications paused by emergency stop. Reverting event ${eventId} to pending.`);
        await eventRef.update({
          status: eventData.deliveryMode === 'scheduled' ? 'scheduled' : 'pending',
          processedAt: null,
        });
        return {
          success: true,
          eventId,
          skipped: true,
          reason: globalState.reason,
        };
      }
    }
  } catch (txErr: any) {
    console.error(`[NotificationWorker] Transaction claim error on event ${eventId}:`, txErr);
    return {
      success: false,
      eventId,
      error: txErr?.message || 'Failed to atomically claim event',
    };
  }

  // 2. TOKEN LOOKUP: Query enabled notification tokens for the recipient user
  const userId = eventData.userId;
  let tokens: Array<{ id: string; token: string }> = [];

  try {
    const tokensRef = adminDb.collection('users').doc(userId).collection('notificationTokens');
    const tokensSnapshot = await tokensRef.where('enabled', '==', true).get();

    tokensSnapshot.forEach((docSnap) => {
      const tData = docSnap.data();
      if (tData?.token && typeof tData.token === 'string') {
        tokens.push({
          id: docSnap.id,
          token: tData.token.trim(),
        });
      }
    });
  } catch (tokenErr: any) {
    console.error(`[NotificationWorker] Failed to fetch tokens for user ${userId}:`, tokenErr);
    await eventRef.update({
      status: 'failed',
      failureReason: `Failed to query notification tokens: ${tokenErr?.message || 'Unknown error'}`,
      failedTokenCount: 0,
      successfulTokenCount: 0,
    });
    return {
      success: false,
      eventId,
      error: tokenErr?.message,
    };
  }

  // If no enabled tokens exist for this user, mark as failed cleanly
  if (tokens.length === 0) {
    const failureMsg = 'No enabled notification tokens registered for recipient user.';
    console.log(`[NotificationWorker] Event ${eventId}: ${failureMsg}`);
    await eventRef.update({
      status: 'failed',
      failureReason: failureMsg,
      failedTokenCount: 0,
      successfulTokenCount: 0,
      sentAt: null,
    });
    return {
      success: true,
      eventId,
      successfulTokenCount: 0,
      failedTokenCount: 0,
      failureReason: failureMsg,
    };
  }

  // 3. FCM PAYLOAD PREPARATION
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

  const tokenStrings = tokens.map((t) => t.token);

  const multicastMessage: MulticastMessage = {
    tokens: tokenStrings,
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

  // 4. SERVER-SIDE FCM DELIVERY
  let successfulCount = 0;
  let failedCount = 0;
  const failureReasons: string[] = [];

  try {
    const response = await adminMessaging.sendEachForMulticast(multicastMessage);
    console.log(`[NotificationWorker] FCM delivery response for event ${eventId}:`, {
      successCount: response.successCount,
      failureCount: response.failureCount,
    });

    successfulCount = response.successCount;
    failedCount = response.failureCount;

    // 5. PROCESS INVALID TOKENS INDIVIDUALLY
    if (response.failureCount > 0) {
      const updatePromises: Promise<any>[] = [];

      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          const error = resp.error;
          const errorCode = error?.code;
          const tokenObj = tokens[index];
          failureReasons.push(errorCode || error?.message || 'Delivery error');

          if (tokenObj && isInvalidTokenErrorCode(errorCode)) {
            console.log(`[NotificationWorker] Disabling invalid FCM token ${tokenObj.id} (${errorCode})`);
            const tokenDocRef = adminDb
              .collection('users')
              .doc(userId)
              .collection('notificationTokens')
              .doc(tokenObj.id);

            updatePromises.push(
              tokenDocRef.update({
                enabled: false,
                invalidReason: errorCode || 'Token unregistered',
                invalidatedAt: FieldValue.serverTimestamp(),
              }).catch((e) => {
                console.warn(`[NotificationWorker] Could not disable token ${tokenObj.id}:`, e);
              })
            );
          }
        }
      });

      if (updatePromises.length > 0) {
        await Promise.allSettled(updatePromises);
      }
    }
  } catch (sendErr: any) {
    console.error(`[NotificationWorker] FCM sendEachForMulticast failed on event ${eventId}:`, sendErr);
    await eventRef.update({
      status: 'failed',
      failureReason: sendErr?.message || 'FCM multicast execution failure',
      successfulTokenCount: 0,
      failedTokenCount: tokens.length,
    });
    return {
      success: false,
      eventId,
      error: sendErr?.message,
    };
  }

  // 6. UPDATE EVENT STATUS
  if (successfulCount > 0) {
    await eventRef.update({
      status: 'sent',
      sentAt: FieldValue.serverTimestamp(),
      successfulTokenCount: successfulCount,
      failedTokenCount: failedCount,
      failureReason: failureReasons.length > 0 ? failureReasons.slice(0, 3).join('; ') : null,
    });

    return {
      success: true,
      eventId,
      successfulTokenCount: successfulCount,
      failedTokenCount: failedCount,
    };
  } else {
    const summaryReason = failureReasons.length > 0 ? failureReasons.join('; ') : 'All token deliveries failed';
    await eventRef.update({
      status: 'failed',
      failureReason: summaryReason,
      successfulTokenCount: 0,
      failedTokenCount: failedCount,
    });

    return {
      success: true,
      eventId,
      successfulTokenCount: 0,
      failedTokenCount: failedCount,
      failureReason: summaryReason,
    };
  }
}

/**
 * Scans and moves due scheduled events from 'scheduled' to 'pending'
 */
export async function processDueScheduledEvents(maxBatchSize: number = 30): Promise<number> {
  try {
    const nowIso = new Date().toISOString();
    const snapshot = await adminDb
      .collection('notificationEvents')
      .where('status', '==', 'scheduled')
      .where('scheduledAt', '<=', nowIso)
      .limit(maxBatchSize)
      .get();

    if (snapshot.empty) {
      return 0;
    }

    let processedCount = 0;
    for (const docSnap of snapshot.docs) {
      await docSnap.ref.update({
        status: 'pending',
      });
      processedCount++;
    }
    return processedCount;
  } catch (err: any) {
    console.warn('[NotificationWorker] Notice during scheduled events sweep:', err?.message || err);
    return 0;
  }
}

/**
 * Scans and processes all pending notification events in Firestore
 */
export async function processAllPendingEvents(maxBatchSize: number = 20): Promise<ProcessEventResult[]> {
  try {
    const eventsRef = adminDb.collection('notificationEvents');
    const snapshot = await eventsRef
      .where('status', '==', 'pending')
      .limit(maxBatchSize)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const results: ProcessEventResult[] = [];
    for (const docSnap of snapshot.docs) {
      const result = await processNotificationEvent(docSnap.id);
      results.push(result);
    }
    return results;
  } catch (err: any) {
    console.error('[NotificationWorker] Error processing pending events batch:', err);
    return [];
  }
}

let isListenerActive = false;
let activeUnsubscribe: (() => void) | null = null;

/**
 * Starts a real-time Firestore listener for pending notification events
 */
export function startNotificationQueueListener(): () => void {
  if (isListenerActive) {
    return () => {};
  }

  isListenerActive = true;

  try {
    const unsubscribe = adminDb
      .collection('notificationEvents')
      .where('status', '==', 'pending')
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const data = change.doc.data();
              if (data?.status === 'pending') {
                console.log(`[NotificationWorker] Detected pending notification event: ${change.doc.id}`);
                // Process asynchronously in background
                processNotificationEvent(change.doc.id).catch((err) => {
                  console.error(`[NotificationWorker] Error processing event ${change.doc.id}:`, err);
                });
              }
            }
          });
        },
        (error: any) => {
          const isPermissionNotice =
            error?.code === 7 ||
            error?.code === 'PERMISSION_DENIED' ||
            String(error?.message || error).includes('Missing or insufficient permissions') ||
            String(error?.message || error).includes('Error 7');

          if (isPermissionNotice) {
            console.log(
              '[NotificationWorker] Server Firestore Admin listener is operating in client-delegated / Cloud Functions mode.'
            );
          } else {
            console.warn('[NotificationWorker] Queue listener subscription notice:', error?.message || error);
          }

          // Unsubscribe to avoid recurring error logs
          if (activeUnsubscribe) {
            try {
              activeUnsubscribe();
            } catch (_) {}
            activeUnsubscribe = null;
          }
          isListenerActive = false;
        }
      );

    activeUnsubscribe = unsubscribe;

    return () => {
      isListenerActive = false;
      if (activeUnsubscribe) {
        try {
          activeUnsubscribe();
        } catch (_) {}
        activeUnsubscribe = null;
      }
    };
  } catch (err: any) {
    console.warn('[NotificationWorker] Background queue listener setup notice:', err?.message || err);
    isListenerActive = false;
    return () => {};
  }
}
