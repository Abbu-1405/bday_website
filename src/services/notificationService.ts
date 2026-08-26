import { getMessaging, getToken, onMessage, isSupported, deleteToken, Messaging } from 'firebase/messaging';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import app, { db, isFirebaseConfigured, vapidKey as defaultVapidKey } from '../firebase';
import firebaseAppletConfig from '../../firebase-applet-config.json';
import {
  NotificationPermissionState,
  NotificationStatusInfo,
  NotificationToken,
  NotificationEvent,
  NotificationEventType,
  NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
  CreateNotificationEventParams,
} from '../types';

const TOKEN_STORAGE_KEY = 'starlit_fcm_token';
const TOKEN_SYNCED_UID_KEY = 'starlit_fcm_uid';
const NOTIFICATION_PROMPT_DISMISSED_KEY = 'starlit_notification_prompt_dismissed';

let messagingInstance: Messaging | null = null;
let isMessagingSupportedCached: boolean | null = null;

/**
 * Checks if Firebase Cloud Messaging & Web Push are supported in the current environment
 */
export async function isPushSupported(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return false;
  }
  if (isMessagingSupportedCached !== null) {
    return isMessagingSupportedCached;
  }
  try {
    const supported = await isSupported();
    isMessagingSupportedCached = supported;
    return supported;
  } catch (err) {
    console.warn('[FCM] isSupported check failed:', err);
    isMessagingSupportedCached = false;
    return false;
  }
}

/**
 * Gets the current Web Push VAPID public key from environment variables or project config
 */
export function getVapidKey(): string | null {
  const envKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }
  const fallbackConfigKey =
    (firebaseAppletConfig as any)?.vapidKey ||
    (firebaseAppletConfig as any)?.vapidPublicKey ||
    (firebaseAppletConfig as any)?.fcmVapidKey;
  if (fallbackConfigKey && typeof fallbackConfigKey === 'string' && fallbackConfigKey.trim().length > 0) {
    return fallbackConfigKey.trim();
  }
  if (defaultVapidKey && typeof defaultVapidKey === 'string' && defaultVapidKey.trim().length > 0) {
    return defaultVapidKey.trim();
  }
  return null;
}

/**
 * Returns current permission state
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

/**
 * Lazily gets or initializes the Firebase Messaging instance
 */
export async function getMessagingService(): Promise<Messaging | null> {
  if (messagingInstance) {
    return messagingInstance;
  }
  const supported = await isPushSupported();
  if (!supported || !isFirebaseConfigured) {
    return null;
  }
  try {
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (err) {
    console.warn('[FCM] Failed to initialize Firebase Messaging:', err);
    return null;
  }
}

/**
 * Helper to get device platform description
 */
function getPlatformInfo(): { platform: string; browser: string; userAgent: string } {
  if (typeof navigator === 'undefined') {
    return { platform: 'Unknown', browser: 'Unknown', userAgent: '' };
  }
  const ua = navigator.userAgent;
  let platform = 'Other';
  if (/Android/i.test(ua)) platform = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) platform = 'iOS';
  else if (/Windows/i.test(ua)) platform = 'Windows';
  else if (/Macintosh|Mac OS/i.test(ua)) platform = 'macOS';
  else if (/Linux/i.test(ua)) platform = 'Linux';

  let browser = 'Unknown';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Safari';

  return {
    platform,
    browser,
    userAgent: ua.slice(0, 200),
  };
}

/**
 * Derives a consistent document ID for an FCM token
 */
function generateTokenDocId(token: string): string {
  // Use a stable, sanitized identifier from the token string
  const clean = token.replace(/[^a-zA-Z0-9_-]/g, '').slice(-40);
  return clean || 'token_default';
}

/**
 * Retrieves the full notification status for UI rendering
 */
export async function getNotificationStatus(user?: User | null): Promise<NotificationStatusInfo> {
  const supported = await isPushSupported();
  const permission = getNotificationPermission();
  const vapidKey = getVapidKey();
  const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;

  return {
    isSupported: supported,
    permission,
    hasToken: Boolean(storedToken),
    hasVapidKey: Boolean(vapidKey),
    token: storedToken,
    loading: false,
    error:
      permission === 'denied'
        ? 'Notification permission is blocked in browser settings.'
        : null,
  };
}

/**
 * Registers the service worker explicitly
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return undefined;
  }
  try {
    const swUrl = `/firebase-messaging-sw.js?messagingSenderId=1040135494913&projectId=gen-lang-client-0057157522&appId=1:1040135494913:web:ee17e2c259d779bbe60f00`;
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: '/',
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.warn('[FCM] Service worker registration notice:', err);
    try {
      return await navigator.serviceWorker.getRegistration('/');
    } catch {
      return undefined;
    }
  }
}

/**
 * Requests notification permission from user, acquires FCM token, and saves it to Firestore
 */
export async function requestAndRegisterNotification(
  user: User
): Promise<{ success: boolean; token?: string; error?: string }> {
  if (!user || !user.uid) {
    return { success: false, error: 'User must be signed in to enable notifications.' };
  }

  // 1. Synchronous check for browser notification support
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return {
      success: false,
      error: 'Push notifications are not supported by this browser or device environment.',
    };
  }

  try {
    // 2. Request browser permission IMMEDIATELY inside the active user interaction context
    let permission = Notification.permission;
    if (permission === 'default') {
      try {
        permission = await Notification.requestPermission();
      } catch (permErr) {
        console.warn('[FCM] Error requesting notification permission:', permErr);
      }
    }

    if (permission !== 'granted') {
      return {
        success: false,
        error:
          permission === 'denied'
            ? 'Notification permission was blocked in browser settings. Please allow notifications in site settings.'
            : 'Notification permission was not granted.',
      };
    }

    // 3. Check VAPID key configuration
    const vapidKey = getVapidKey();
    if (!vapidKey) {
      return {
        success: false,
        error:
          'VAPID key is not configured. Please add VITE_FIREBASE_VAPID_KEY from Firebase Console (Project Settings > Cloud Messaging > Web Push certificates).',
      };
    }

    // 4. Initialize Messaging instance
    const messaging = await getMessagingService();
    if (!messaging) {
      return { success: false, error: 'Failed to initialize Firebase Messaging service.' };
    }

    // 5. Register service worker
    const swRegistration = await registerServiceWorker();

    // 6. Retrieve FCM Token from Firebase Cloud Messaging
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      return { success: false, error: 'No FCM registration token returned from Firebase.' };
    }

    // 7. Store token securely in Firestore under users/{uid}/notificationTokens/{tokenId}
    const tokenId = generateTokenDocId(token);
    const { platform, browser, userAgent } = getPlatformInfo();
    const tokenRef = doc(db, 'users', user.uid, 'notificationTokens', tokenId);
    const nowIso = new Date().toISOString();

    const tokenData: NotificationToken = {
      id: tokenId,
      uid: user.uid,
      token,
      platform,
      browser,
      userAgent,
      createdAt: nowIso,
      updatedAt: nowIso,
      enabled: true,
    };

    await setDoc(tokenRef, tokenData, { merge: true });

    // Cache locally
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_SYNCED_UID_KEY, user.uid);

    console.log('[FCM] Notification token successfully registered for user:', user.uid);

    return { success: true, token };
  } catch (err: any) {
    console.error('[FCM] Error requesting / registering push token:', err);
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      return {
        success: false,
        error: 'Firestore permission denied while saving token. Please ensure you are signed in.',
      };
    }
    return {
      success: false,
      error: err?.message || 'Failed to complete push notification registration.',
    };
  }
}

/**
 * Disables push notifications for the current user session
 */
export async function disableNotification(
  user: User
): Promise<{ success: boolean; error?: string }> {
  if (!user || !user.uid) {
    return { success: false, error: 'User must be signed in.' };
  }

  try {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken) {
      const tokenId = generateTokenDocId(storedToken);
      const tokenRef = doc(db, 'users', user.uid, 'notificationTokens', tokenId);
      await updateDoc(tokenRef, {
        enabled: false,
        updatedAt: new Date().toISOString(),
      }).catch(() => {
        // Document might not exist or already removed
      });
    }

    // Delete FCM token from messaging instance if available
    const messaging = await getMessagingService();
    if (messaging) {
      await deleteToken(messaging).catch(() => {});
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_SYNCED_UID_KEY);

    return { success: true };
  } catch (err: any) {
    console.error('[FCM] Error disabling notifications:', err);
    return { success: false, error: err?.message || 'Failed to disable notifications.' };
  }
}

/**
 * Synchronizes existing registration token on login/session start
 */
export async function syncNotificationTokenOnAuth(user: User): Promise<void> {
  if (!user || !user.uid) return;
  if (getNotificationPermission() !== 'granted') return;

  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const syncedUid = localStorage.getItem(TOKEN_SYNCED_UID_KEY);

  // If token already recorded for this UID in this session, update last verified date
  if (storedToken && syncedUid === user.uid) {
    try {
      const tokenId = generateTokenDocId(storedToken);
      const tokenRef = doc(db, 'users', user.uid, 'notificationTokens', tokenId);
      await updateDoc(tokenRef, {
        updatedAt: new Date().toISOString(),
        enabled: true,
      }).catch(() => {});
    } catch {
      // Ignore background sync errors
    }
  }
}

/**
 * Listens for foreground push messages while the app is active
 */
export function setupForegroundMessageListener(
  onMessageReceived: (payload: any) => void
): () => void {
  let unsubscribe: (() => void) | null = null;

  getMessagingService()
    .then((messaging) => {
      if (messaging) {
        unsubscribe = onMessage(messaging, (payload) => {
          console.log('[FCM] Received foreground push message:', payload);
          onMessageReceived(payload);
        });
      }
    })
    .catch((err) => {
      console.warn('[FCM] Foreground message listener setup notice:', err);
    });

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}

/**
 * Checks if the custom respectful permission modal should be prompted to an authenticated user
 */
export function shouldPromptNotificationPermission(user: User | null): boolean {
  if (!user) return false;
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'default') return false;

  const dismissedAt = localStorage.getItem(NOTIFICATION_PROMPT_DISMISSED_KEY);
  if (dismissedAt) {
    const dismissedTime = parseInt(dismissedAt, 10);
    // Don't prompt again for 7 days if user chose "Not Now"
    if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
      return false;
    }
  }
  return true;
}

/**
 * Records user dismissal of the respectful notification modal
 */
export function dismissNotificationPrompt(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(NOTIFICATION_PROMPT_DISMISSED_KEY, Date.now().toString());
  }
}

/**
 * Sends a local test notification to prove the device/browser notification pipeline
 */
export async function sendLocalTestNotification(
  title: string = 'Starlit Letters ✨',
  body: string = 'A little piece of your universe is waiting.',
  url: string = '/'
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/download-7.jpg',
          badge: '/download-7.jpg',
          tag: 'starlit-test-notification',
          data: { url },
        });
        return true;
      }
    }
    // Fallback to window.Notification if SW not ready
    new Notification(title, {
      body,
      icon: '/download-7.jpg',
    });
    return true;
  } catch (err) {
    console.error('[FCM] Failed to trigger test notification:', err);
    return false;
  }
}

/* ==========================================================================
   PHASE 2 — NOTIFICATION EVENT ENGINE (EVENT QUEUE & PREFERENCES)
   ========================================================================== */

const preferencesCache = new Map<string, { prefs: NotificationPreferences; timestamp: number }>();
const PREF_CACHE_TTL_MS = 60000; // 1 minute local cache

/**
 * Retrieves the user's notification preferences from Firestore or local cache
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  if (!userId) return DEFAULT_NOTIFICATION_PREFERENCES;

  const cached = preferencesCache.get(userId);
  if (cached && Date.now() - cached.timestamp < PREF_CACHE_TTL_MS) {
    return cached.prefs;
  }

  // Check localStorage fallback for fast offline response
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(`starlit_notif_prefs_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          const merged = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsed };
          preferencesCache.set(userId, { prefs: merged, timestamp: Date.now() });
        }
      }
    } catch {
      // Ignore parse failure
    }
  }

  if (!isFirebaseConfigured) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const userPrefs = data?.notificationPreferences;
      if (userPrefs && typeof userPrefs === 'object') {
        const resolved: NotificationPreferences = {
          enabled: userPrefs.enabled !== false,
          letters: userPrefs.letters !== false,
          openWhen: userPrefs.openWhen !== false,
          secrets: userPrefs.secrets !== false,
          moments: userPrefs.moments !== false,
          birthday: userPrefs.birthday !== false,
        };
        preferencesCache.set(userId, { prefs: resolved, timestamp: Date.now() });
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`starlit_notif_prefs_${userId}`, JSON.stringify(resolved));
        }
        return resolved;
      }
    }
  } catch (err) {
    console.warn('[NotificationEngine] Notice loading user preferences:', err);
  }

  return DEFAULT_NOTIFICATION_PREFERENCES;
}

/**
 * Updates user notification preferences in Firestore and local cache
 */
export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<NotificationPreferences>
): Promise<{ success: boolean; preferences?: NotificationPreferences; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User ID is required.' };
  }

  const current = await getNotificationPreferences(userId);
  const updated: NotificationPreferences = {
    ...current,
    ...updates,
  };

  preferencesCache.set(userId, { prefs: updated, timestamp: Date.now() });
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`starlit_notif_prefs_${userId}`, JSON.stringify(updated));
  }

  if (!isFirebaseConfigured) {
    return { success: true, preferences: updated };
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        notificationPreferences: updated,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true, preferences: updated };
  } catch (err: any) {
    console.error('[NotificationEngine] Error updating preferences:', err);
    return {
      success: false,
      error: err?.message || 'Failed to save notification preferences.',
    };
  }
}

/**
 * Determines if a notification event of a given type should be generated for a user
 */
export async function shouldCreateNotification(params: {
  userId: string;
  type: NotificationEventType | string;
  preferences?: NotificationPreferences;
}): Promise<boolean> {
  const { userId, type, preferences } = params;
  if (!userId) return false;

  const prefs = preferences || (await getNotificationPreferences(userId));

  // Global master switch
  if (!prefs.enabled) return false;

  // Category granular check
  switch (type) {
    case 'LETTER_AVAILABLE':
      return prefs.letters !== false;
    case 'OPEN_WHEN_AVAILABLE':
      return prefs.openWhen !== false;
    case 'SECRET_UNLOCKED':
      return prefs.secrets !== false;
    case 'MOMENT_AVAILABLE':
      return prefs.moments !== false;
    case 'BIRTHDAY':
      return prefs.birthday !== false;
    case 'GENERAL':
    default:
      return true;
  }
}

/**
 * Generates a clean deterministic document ID for notification event deduplication
 */
function generateDeterministicEventId(
  userId: string,
  type: string,
  eventKey?: string
): string {
  const cleanUid = userId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16);
  const cleanType = type.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  if (eventKey) {
    const cleanKey = eventKey.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48);
    return `evt_${cleanUid}_${cleanType}_${cleanKey}`;
  }
  return `evt_${cleanUid}_${cleanType}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Creates a notification event in Firestore under notificationEvents/{eventId}
 * IMPORTANT:
 * - This creates the event in the queue with status "pending".
 * - The frontend does NOT send FCM directly (Phase 3 trusted server handles push dispatch).
 * - Implements deduplication if an eventKey is provided.
 * - Non-blocking: returns cleanly without interrupting user actions.
 */
export async function createNotificationEvent(
  params: CreateNotificationEventParams
): Promise<{
  success: boolean;
  eventId?: string;
  skipped?: boolean;
  reason?: string;
  error?: string;
}> {
  if (!isFirebaseConfigured) {
    return { success: false, error: 'Firebase is not configured.' };
  }

  const { userId, type, title, body, data, eventKey } = params;

  if (!userId || !type || !title || !body) {
    return {
      success: false,
      error: 'Missing required parameters: userId, type, title, body.',
    };
  }

  try {
    // 1. Check user notification preferences
    const isEligible = await shouldCreateNotification({ userId, type });
    if (!isEligible) {
      return {
        success: true,
        skipped: true,
        reason: 'User preferences have disabled this notification type.',
      };
    }

    // 2. Compute deterministic event ID if eventKey provided
    const eventId = generateDeterministicEventId(userId, type, eventKey);
    const eventRef = doc(db, 'notificationEvents', eventId);

    // 3. Deduplication check: if event with this deterministic ID already exists, do not duplicate
    if (eventKey) {
      try {
        const existingSnap = await getDoc(eventRef);
        if (existingSnap.exists()) {
          return {
            success: true,
            eventId,
            skipped: true,
            reason: 'Notification event already queued or delivered (deduplication matched).',
          };
        }
      } catch {
        // Continue if getDoc fails
      }
    }

    // 4. Create pending notification event document
    const eventPayload = {
      userId,
      type,
      title: title.trim().slice(0, 200),
      body: body.trim().slice(0, 1000),
      data: data || {},
      status: 'pending',
      sentAt: null,
      createdAt: serverTimestamp(),
    };

    await setDoc(eventRef, eventPayload);

    console.log('[NotificationEngine] Event queued successfully:', {
      eventId,
      type,
      userId,
    });

    return {
      success: true,
      eventId,
    };
  } catch (err: any) {
    console.warn('[NotificationEngine] Non-blocking event creation notice:', err);
    return {
      success: false,
      error: err?.message || 'Failed to create notification event.',
    };
  }
}

/**
 * High-level convenience triggers for the 6 primary notification event types
 */

export async function notifyLetterAvailable(
  userId: string,
  letterId: string,
  title?: string
) {
  return createNotificationEvent({
    userId,
    type: 'LETTER_AVAILABLE',
    title: 'New Letter Received ✉️',
    body: title ? `A letter titled "${title}" was written for you.` : 'A new heartfelt letter is waiting for you.',
    data: { letterId, url: '/reflections' },
    eventKey: `letter_${letterId}`,
  });
}

export async function notifyOpenWhenAvailable(
  userId: string,
  letterId: string,
  envelopeTitle: string
) {
  return createNotificationEvent({
    userId,
    type: 'OPEN_WHEN_AVAILABLE',
    title: 'Open When Envelope ✨',
    body: `Your "${envelopeTitle}" letter is available in your archive.`,
    data: { letterId, url: '/open-when' },
    eventKey: `openwhen_${letterId}`,
  });
}

export async function notifySecretUnlocked(
  userId: string,
  secretId: string,
  secretTitle?: string
) {
  return createNotificationEvent({
    userId,
    type: 'SECRET_UNLOCKED',
    title: 'Secret Vault Unlocked 🗝️',
    body: secretTitle
      ? `You uncovered a hidden secret: "${secretTitle}".`
      : 'A mysterious secret has been unlocked in your vault.',
    data: { secretId, url: '/secret-vault' },
    eventKey: `secret_${secretId}`,
  });
}

export async function notifyMomentAvailable(
  userId: string,
  momentId: string,
  momentTitle?: string
) {
  return createNotificationEvent({
    userId,
    type: 'MOMENT_AVAILABLE',
    title: 'Cherished Moment 📸',
    body: momentTitle
      ? `A memory was opened: "${momentTitle}".`
      : 'A special photo memory is waiting in your gallery.',
    data: { momentId, url: '/moments' },
    eventKey: `moment_${momentId}`,
  });
}

export async function notifyBirthday(
  userId: string,
  customMessage?: string
) {
  return createNotificationEvent({
    userId,
    type: 'BIRTHDAY',
    title: 'Happy Birthday! 🎂✨',
    body: customMessage || 'Wishing you the happiest birthday filled with love, wonder, and starlit warmth.',
    data: { url: '/countdown' },
    eventKey: `birthday_${new Date().getFullYear()}`,
  });
}

export async function notifyGeneral(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>,
  eventKey?: string
) {
  return createNotificationEvent({
    userId,
    type: 'GENERAL',
    title,
    body,
    data,
    eventKey,
  });
}

/**
 * Fetches recent notification events for the Admin dashboard
 */
export async function fetchAdminNotificationEvents(
  maxCount: number = 50
): Promise<NotificationEvent[]> {
  if (!isFirebaseConfigured) return [];

  try {
    const eventsRef = collection(db, 'notificationEvents');
    const q = query(eventsRef, orderBy('createdAt', 'desc'), limit(maxCount));
    const snapshot = await getDocs(q);

    const list: NotificationEvent[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let createdStr = 'Recently';
      if (data.createdAt?.toDate) {
        createdStr = data.createdAt.toDate().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (data.createdAt?.seconds) {
        createdStr = new Date(data.createdAt.seconds * 1000).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      list.push({
        id: docSnap.id,
        userId: data.userId || 'Unknown',
        type: data.type || 'GENERAL',
        title: data.title || 'Untitled Notification',
        body: data.body || '',
        data: data.data || {},
        status: data.status || 'pending',
        createdAt: createdStr,
        processedAt: data.processedAt || null,
        sentAt: data.sentAt || null,
        successfulTokenCount: typeof data.successfulTokenCount === 'number' ? data.successfulTokenCount : undefined,
        failedTokenCount: typeof data.failedTokenCount === 'number' ? data.failedTokenCount : undefined,
        failureReason: data.failureReason || null,
        error: data.error || null,
      });
    });

    return list;
  } catch (err) {
    console.warn('[NotificationEngine] Error fetching admin notification events:', err);
    return [];
  }
}

/**
 * Subscribes in real-time to notification events for the Admin dashboard
 */
export function subscribeAdminNotificationEvents(
  onUpdate: (events: NotificationEvent[]) => void,
  maxCount: number = 50
): () => void {
  if (!isFirebaseConfigured) {
    onUpdate([]);
    return () => {};
  }

  try {
    const eventsRef = collection(db, 'notificationEvents');
    const q = query(eventsRef, orderBy('createdAt', 'desc'), limit(maxCount));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: NotificationEvent[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          let createdStr = 'Recently';
          if (data.createdAt?.toDate) {
            createdStr = data.createdAt.toDate().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          } else if (data.createdAt?.seconds) {
            createdStr = new Date(data.createdAt.seconds * 1000).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          }

          list.push({
            id: docSnap.id,
            userId: data.userId || 'Unknown',
            type: data.type || 'GENERAL',
            title: data.title || 'Untitled Notification',
            body: data.body || '',
            data: data.data || {},
            status: data.status || 'pending',
            createdAt: createdStr,
            processedAt: data.processedAt || null,
            sentAt: data.sentAt || null,
            successfulTokenCount: typeof data.successfulTokenCount === 'number' ? data.successfulTokenCount : undefined,
            failedTokenCount: typeof data.failedTokenCount === 'number' ? data.failedTokenCount : undefined,
            failureReason: data.failureReason || null,
            error: data.error || null,
          });
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('[NotificationEngine] Admin subscription notice:', err);
      }
    );
  } catch (err) {
    console.warn('[NotificationEngine] Error setting up admin event listener:', err);
    return () => {};
  }
}

/**
 * Triggers a test notification through the Firebase Cloud Functions FCM push delivery pipeline.
 * Creates a legitimate notification event document with status "pending" in Firestore,
 * which triggers the onNotificationEventCreated Firebase Cloud Function automatically.
 */
export async function triggerServerTestNotification(params: {
  userId: string;
  title?: string;
  body?: string;
  type?: NotificationEventType | string;
  url?: string;
}): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const title = params.title || 'Starlit Letters Push Verification ✨';
    const body = params.body || 'Phase 3 server-side FCM push delivery is active and working!';
    const type = (params.type as NotificationEventType) || 'GENERAL';
    const url = params.url || '/settings';

    // Queue legitimate notification event directly in Firestore
    const res = await createNotificationEvent({
      userId: params.userId,
      type,
      title,
      body,
      data: {
        url,
        isTest: 'true',
        source: 'admin_test_push',
      },
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || 'Failed to queue notification event in Firestore',
      };
    }

    return {
      success: true,
      eventId: res.eventId,
    };
  } catch (err: any) {
    console.error('[NotificationEngine] Error queueing test notification:', err);
    return {
      success: false,
      error: err?.message || 'Error queueing test notification in Firestore',
    };
  }
}

/**
 * Triggers queue processing for pending notification events.
 * In production Firebase architecture:
 * 1. If VITE_FIREBASE_FUNCTIONS_URL is provided, calls the processPendingNotificationEvents HTTPS function.
 * 2. Otherwise queries Firestore directly for pending events and reports queue status.
 * (Note: onNotificationEventCreated Firestore trigger automatically delivers all newly created events in real time).
 */
export async function triggerServerQueueProcessing(): Promise<{
  success: boolean;
  processedCount?: number;
  message?: string;
  error?: string;
}> {
  const functionsUrl = (import.meta as any).env?.VITE_FIREBASE_FUNCTIONS_URL;
  if (functionsUrl) {
    try {
      const response = await fetch(`${functionsUrl.replace(/\/$/, '')}/processPendingNotificationEvents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          processedCount: data.processedCount ?? 0,
          message: data.message || `Processed ${data.processedCount ?? 0} events via Cloud Function`,
        };
      }
    } catch (err: any) {
      console.warn('[NotificationEngine] HTTPS Cloud Function invoke notice:', err);
    }
  }

  // Fallback / status query directly via Firestore
  try {
    const eventsRef = collection(db, 'notificationEvents');
    const q = query(eventsRef, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    let pendingCount = 0;
    snapshot.forEach((docSnap) => {
      if (docSnap.data()?.status === 'pending') {
        pendingCount++;
      }
    });

    return {
      success: true,
      processedCount: pendingCount,
      message:
        pendingCount === 0
          ? 'All events are up to date and processed in real time by the Firebase Cloud Function trigger.'
          : `${pendingCount} event(s) currently awaiting Cloud Function execution.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to inspect pending notification queue',
    };
  }
}

