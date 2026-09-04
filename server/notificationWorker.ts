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
 * Resolves deterministic category-aware Web Push notification tag (Phase 3D)
 */
export function resolveNotificationTag(type?: string, category?: string): string {
  const normalizedType = String(type || '').toUpperCase();
  const normalizedCategory = String(category || '').toLowerCase();

  if (normalizedType === 'LETTER_AVAILABLE' || normalizedCategory === 'letter' || normalizedCategory === 'letters') {
    return 'starlit-letters';
  }
  if (normalizedType === 'MOMENT_AVAILABLE' || normalizedCategory === 'moment' || normalizedCategory === 'moments') {
    return 'starlit-moments';
  }
  if (normalizedType === 'OPEN_WHEN_AVAILABLE' || normalizedCategory === 'open_when' || normalizedCategory === 'openwhen') {
    return 'starlit-open-when';
  }
  if (
    normalizedType === 'SECRET_UNLOCKED' ||
    normalizedType === 'SECRET_UNLCOKED' ||
    normalizedCategory === 'secret' ||
    normalizedCategory === 'secrets'
  ) {
    return 'starlit-secrets';
  }
  if (normalizedType === 'BIRTHDAY' || normalizedCategory === 'birthday') {
    return 'starlit-birthday';
  }
  return 'starlit-general';
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
  // Map token strings to all document IDs that held this token for this user
  const tokenToDocIds = new Map<string, string[]>();

  try {
    const tokensRef = adminDb.collection('users').doc(userId).collection('notificationTokens');
    const tokensSnapshot = await tokensRef.where('enabled', '==', true).get();

    tokensSnapshot.forEach((docSnap) => {
      const tData = docSnap.data();
      if (tData?.token && typeof tData.token === 'string') {
        const cleanToken = tData.token.trim();
        if (cleanToken.length > 0) {
          const docIdList = tokenToDocIds.get(cleanToken) || [];
          docIdList.push(docSnap.id);
          tokenToDocIds.set(cleanToken, docIdList);
        }
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

  // Construct deduplicated recipient list (each token string appears at most once)
  const dedupedRecipients: Array<{ token: string; docIds: string[] }> = [];
  tokenToDocIds.forEach((docIds, token) => {
    dedupedRecipients.push({ token, docIds });
  });

  // If no enabled tokens exist for this user, mark as failed cleanly
  if (dedupedRecipients.length === 0) {
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

  // Phase 3D: Category-aware Web Push tag alignment
  const webPushTag = stringifiedData.tag || resolveNotificationTag(eventData.type, eventData.cooldownCategory);
  stringifiedData.tag = webPushTag;

  const targetUrl = stringifiedData.url || '/';

  // Deduplicated token strings for multicast (appears at most once per request)
  const tokenStrings = dedupedRecipients.map((r) => r.token);

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
        tag: webPushTag,
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
      recipientCount: dedupedRecipients.length,
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
          const recipient = dedupedRecipients[index];
          failureReasons.push(errorCode || error?.message || 'Delivery error');

          if (recipient && isInvalidTokenErrorCode(errorCode)) {
            // Disable all token documents associated with this invalid token string
            for (const docId of recipient.docIds) {
              console.log(`[NotificationWorker] Disabling invalid FCM token document ${docId} (${errorCode})`);
              const tokenDocRef = adminDb
                .collection('users')
                .doc(userId)
                .collection('notificationTokens')
                .doc(docId);

              updatePromises.push(
                tokenDocRef.update({
                  enabled: false,
                  invalidReason: errorCode || 'Token unregistered',
                  invalidatedAt: FieldValue.serverTimestamp(),
                }).catch((e) => {
                  console.warn(`[NotificationWorker] Could not disable token ${docId}:`, e);
                })
              );
            }
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
      failedTokenCount: dedupedRecipients.length,
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

export interface TokenCleanupResult {
  success: boolean;
  usersScanned: number;
  tokensScanned: number;
  tokensDisabled: number;
  details: Array<{
    userId: string;
    totalEnabledBefore: number;
    disabledCount: number;
    retainedCount: number;
  }>;
  error?: string;
}

/**
 * Safely cleans up duplicate active tokens for users:
 * 1. Groups enabled tokens by userId.
 * 2. If identical token strings exist across multiple documents for the same user,
 *    keeps the most recently updated document and disables older duplicate records.
 * 3. If multiple tokens exist for the exact same device context (platform + browser + userAgent)
 *    for the same user, keeps the most recently updated document and disables older superseded ones.
 * 4. Genuinely distinct device tokens (e.g. Android vs Windows, Chrome vs Safari) are preserved.
 * 5. Tokens belonging to different users are never compared or modified.
 * 6. Disables records (enabled: false) rather than deleting them.
 * 7. Safe to run multiple times (idempotent).
 */
export async function cleanupDuplicateNotificationTokens(
  targetUserId?: string
): Promise<TokenCleanupResult> {
  try {
    let querySnapshot: FirebaseFirestore.QuerySnapshot;
    if (targetUserId) {
      querySnapshot = await adminDb
        .collection('users')
        .doc(targetUserId)
        .collection('notificationTokens')
        .where('enabled', '==', true)
        .get();
    } else {
      querySnapshot = await adminDb
        .collectionGroup('notificationTokens')
        .where('enabled', '==', true)
        .get();
    }

    const userTokensMap = new Map<
      string,
      Array<{ id: string; ref: FirebaseFirestore.DocumentReference; data: FirebaseFirestore.DocumentData }>
    >();

    querySnapshot.forEach((docSnap) => {
      // In collectionGroup or user subcollection, parent doc is user document
      const parentUser = targetUserId || docSnap.ref.parent.parent?.id;
      if (parentUser) {
        const list = userTokensMap.get(parentUser) || [];
        list.push({ id: docSnap.id, ref: docSnap.ref, data: docSnap.data() });
        userTokensMap.set(parentUser, list);
      }
    });

    let totalDisabled = 0;
    const details: TokenCleanupResult['details'] = [];

    for (const [userId, userTokens] of userTokensMap.entries()) {
      const docsToDisable = new Map<string, { ref: FirebaseFirestore.DocumentReference; reason: string }>();

      // 1. Identify duplicate token strings for this user
      const tokenStringMap = new Map<
        string,
        Array<{ id: string; ref: FirebaseFirestore.DocumentReference; data: FirebaseFirestore.DocumentData }>
      >();

      userTokens.forEach((t) => {
        const tok = (t.data?.token || '').trim();
        if (tok) {
          const list = tokenStringMap.get(tok) || [];
          list.push(t);
          tokenStringMap.set(tok, list);
        }
      });

      tokenStringMap.forEach((docsWithSameToken) => {
        if (docsWithSameToken.length > 1) {
          // Sort by updatedAt or createdAt descending (latest first)
          docsWithSameToken.sort((a, b) => {
            const timeA = new Date(a.data?.updatedAt || a.data?.createdAt || 0).getTime();
            const timeB = new Date(b.data?.updatedAt || b.data?.createdAt || 0).getTime();
            return timeB - timeA;
          });

          // Keep the first (latest), disable older identical tokens
          for (let i = 1; i < docsWithSameToken.length; i++) {
            docsToDisable.set(docsWithSameToken[i].id, {
              ref: docsWithSameToken[i].ref,
              reason: 'duplicate_token_string',
            });
          }
        }
      });

      // 2. Identify superseded tokens on the same device context (platform + browser + userAgent)
      const remainingDocs = userTokens.filter((t) => !docsToDisable.has(t.id));
      const deviceContextMap = new Map<
        string,
        Array<{ id: string; ref: FirebaseFirestore.DocumentReference; data: FirebaseFirestore.DocumentData }>
      >();

      remainingDocs.forEach((t) => {
        const platform = t.data?.platform || 'Unknown';
        const browser = t.data?.browser || 'Unknown';
        const ua = (t.data?.userAgent || '').trim();
        if (platform !== 'Unknown' && browser !== 'Unknown') {
          const contextKey = `${platform}_${browser}_${ua}`;
          const list = deviceContextMap.get(contextKey) || [];
          list.push(t);
          deviceContextMap.set(contextKey, list);
        }
      });

      deviceContextMap.forEach((docsWithSameDevice) => {
        if (docsWithSameDevice.length > 1) {
          docsWithSameDevice.sort((a, b) => {
            const timeA = new Date(a.data?.updatedAt || a.data?.createdAt || 0).getTime();
            const timeB = new Date(b.data?.updatedAt || b.data?.createdAt || 0).getTime();
            return timeB - timeA;
          });

          // Keep the first (most recently updated/used), disable older superseded tokens
          for (let i = 1; i < docsWithSameDevice.length; i++) {
            docsToDisable.set(docsWithSameDevice[i].id, {
              ref: docsWithSameDevice[i].ref,
              reason: 'superseded_device_context',
            });
          }
        }
      });

      // Apply batch disable updates for this user
      if (docsToDisable.size > 0) {
        const batch = adminDb.batch();
        const nowIso = new Date().toISOString();

        docsToDisable.forEach(({ ref, reason }) => {
          batch.update(ref, {
            enabled: false,
            disabledReason: reason,
            disabledAt: FieldValue.serverTimestamp(),
            updatedAt: nowIso,
          });
        });

        await batch.commit();
        totalDisabled += docsToDisable.size;
      }

      details.push({
        userId,
        totalEnabledBefore: userTokens.length,
        disabledCount: docsToDisable.size,
        retainedCount: userTokens.length - docsToDisable.size,
      });
    }

    return {
      success: true,
      usersScanned: userTokensMap.size,
      tokensScanned: querySnapshot.size,
      tokensDisabled: totalDisabled,
      details,
    };
  } catch (err: any) {
    console.error('[NotificationWorker] Token cleanup error:', err);
    return {
      success: false,
      usersScanned: 0,
      tokensScanned: 0,
      tokensDisabled: 0,
      details: [],
      error: err?.message || 'Token cleanup failed',
    };
  }
}

