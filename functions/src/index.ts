import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const messaging = getMessaging();

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

/**
 * Core event delivery function executed by Cloud Functions
 */
async function processEvent(eventId: string) {
  const eventRef = db.collection('notificationEvents').doc(eventId);
  let eventData: any = null;

  // 1. Atomic claim in transaction
  const claimResult = await db.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(eventRef);
    if (!docSnap.exists) {
      return { shouldProcess: false, reason: 'Event document does not exist' };
    }

    const data = docSnap.data();
    if (!data || data.status !== 'pending') {
      return {
        shouldProcess: false,
        reason: `Status is '${data?.status}', skipping duplicate execution.`,
      };
    }

    if (!data.userId || !data.title || !data.body) {
      return { shouldProcess: false, reason: 'Missing required event fields' };
    }

    transaction.update(eventRef, {
      status: 'processing',
      processedAt: FieldValue.serverTimestamp(),
    });

    eventData = { id: docSnap.id, ...data };
    return { shouldProcess: true };
  });

  if (!claimResult.shouldProcess || !eventData) {
    return { skipped: true, reason: claimResult.reason };
  }

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

  if (tokens.length === 0) {
    const reason = 'No enabled notification tokens registered for recipient user.';
    await eventRef.update({
      status: 'failed',
      failureReason: reason,
      successfulTokenCount: 0,
      failedTokenCount: 0,
      sentAt: null,
    });
    return { success: false, reason };
  }

  // Format data payload
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

  const response = await messaging.sendEachForMulticast(multicastMessage);
  let successfulCount = response.successCount;
  let failedCount = response.failureCount;
  const failureReasons: string[] = [];

  if (response.failureCount > 0) {
    const updatePromises: Promise<any>[] = [];
    response.responses.forEach((resp, index) => {
      if (!resp.success) {
        const error = resp.error;
        const errorCode = error?.code;
        const tokenObj = tokens[index];
        failureReasons.push(errorCode || error?.message || 'Error');

        if (tokenObj && isInvalidTokenErrorCode(errorCode)) {
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
            }).catch(() => {})
          );
        }
      }
    });
    await Promise.allSettled(updatePromises);
  }

  if (successfulCount > 0) {
    await eventRef.update({
      status: 'sent',
      sentAt: FieldValue.serverTimestamp(),
      successfulTokenCount: successfulCount,
      failedTokenCount: failedCount,
      failureReason: failureReasons.length > 0 ? failureReasons.slice(0, 3).join('; ') : null,
    });
    return { success: true, successfulTokenCount: successfulCount };
  } else {
    const failureReason = failureReasons.join('; ') || 'Delivery failed';
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
 * Cloud Function Trigger: onDocumentCreated in notificationEvents collection
 */
export const onNotificationEventCreated = onDocumentCreated(
  'notificationEvents/{eventId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return null;
    const eventId = event.params.eventId;
    const data = snap.data();
    if (data && data.status === 'pending') {
      return processEvent(eventId);
    }
    return null;
  }
);

/**
 * Cloud Function HTTPS: Process all pending notification events
 */
export const processPendingNotificationEvents = onRequest(async (req, res) => {
  try {
    const snapshot = await db
      .collection('notificationEvents')
      .where('status', '==', 'pending')
      .limit(50)
      .get();

    if (snapshot.empty) {
      res.json({ message: 'No pending notification events found', processed: 0 });
      return;
    }

    const results = [];
    for (const docSnap of snapshot.docs) {
      const resVal = await processEvent(docSnap.id);
      results.push({ id: docSnap.id, result: resVal });
    }

    res.json({ message: 'Processed pending events', count: results.length, details: results });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});
