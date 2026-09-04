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
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  onSnapshot,
  runTransaction,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import app, { db, auth, isFirebaseConfigured, vapidKey as defaultVapidKey, firebaseConfig } from '../firebase';
import firebaseAppletConfig from '../../firebase-applet-config.json';
import {
  NotificationPermissionState,
  NotificationStatusInfo,
  NotificationToken,
  NotificationEvent,
  NotificationEventType,
  NotificationEventStatus,
  NotificationDeliveryMode,
  NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
  CreateNotificationEventParams,
  TemplateVariables,
  NotificationTemplate,
  NotificationGlobalControl,
} from '../types';
import {
  renderNotificationContent,
  getTemplateForCategory,
  DEFAULT_NOTIFICATION_TEMPLATES,
} from './notificationTemplateService';
import { getNotificationGlobalControl } from './notificationAnalyticsService';
import { evaluateNotificationDecision } from './notificationIntelligenceService';

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
    const params = new URLSearchParams();
    if (firebaseConfig.apiKey) params.set('apiKey', firebaseConfig.apiKey);
    if (firebaseConfig.authDomain) params.set('authDomain', firebaseConfig.authDomain);
    if (firebaseConfig.projectId) params.set('projectId', firebaseConfig.projectId);
    if (firebaseConfig.storageBucket) params.set('storageBucket', firebaseConfig.storageBucket);
    if (firebaseConfig.messagingSenderId) params.set('messagingSenderId', firebaseConfig.messagingSenderId);
    if (firebaseConfig.appId) params.set('appId', firebaseConfig.appId);

    const queryString = params.toString();
    const swUrl = queryString ? `/firebase-messaging-sw.js?${queryString}` : '/firebase-messaging-sw.js';
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

    // 8. Device context hygiene: disable older obsolete tokens for the exact same device context
    // Preserves legitimate tokens belonging to genuinely separate devices (different platform, browser, or device UA)
    try {
      const tokensColRef = collection(db, 'users', user.uid, 'notificationTokens');
      const existingSnap = await getDocs(query(tokensColRef, where('enabled', '==', true)));

      const hygienePromises: Promise<any>[] = [];
      existingSnap.forEach((docSnap) => {
        if (docSnap.id === tokenId) return;

        const exData = docSnap.data();
        const isIdenticalToken = exData?.token === token;
        const isSameDeviceContext =
          exData?.platform === platform &&
          exData?.browser === browser &&
          exData?.userAgent === userAgent;

        if (isIdenticalToken || isSameDeviceContext) {
          hygienePromises.push(
            updateDoc(docSnap.ref, {
              enabled: false,
              disabledReason: isIdenticalToken
                ? 'superseded_identical_token'
                : 'superseded_by_new_device_token',
              supersededAt: nowIso,
              updatedAt: nowIso,
            }).catch(() => {})
          );
        }
      });

      if (hygienePromises.length > 0) {
        await Promise.allSettled(hygienePromises);
      }
    } catch (hygieneErr) {
      console.warn('[FCM] Notice checking token registration hygiene:', hygieneErr);
    }

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
   PHASE 2 & PHASE 4 — NOTIFICATION EVENT ENGINE, PREFERENCES & SCHEDULER
   ========================================================================== */

const preferencesCache = new Map<string, { prefs: NotificationPreferences; timestamp: number }>();
const PREF_CACHE_TTL_MS = 60000; // 1 minute local cache

// Anti-spam cooldown cache: maps `${userId}_${category}` -> timestamp of last event creation
const cooldownTracker = new Map<string, number>();
export const COOLDOWN_WINDOW_MS = 15 * 60 * 1000; // 15-minute cooldown per category

/* ==========================================================================
   PHASE 3C — DISCOVERY TRIGGER AVALANCHE & BURST PROTECTION
   ========================================================================== */

export const DISCOVERY_BURST_STORAGE_KEYS = {
  moments: 'starlit_last_discovery_notif_moments',
  open_when: 'starlit_last_discovery_notif_open_when',
  secret: 'starlit_last_discovery_notif_secret',
  global: 'starlit_last_discovery_notif_global',
} as const;

// In-memory burst tracker mapping `${userId}_${category}` -> timestamp
const discoveryBurstTracker = new Map<string, number>();

/**
 * Checks whether a notification event type or cooldown category is part of the discovery system
 */
export function isDiscoveryNotificationType(type: string, cooldownCategory?: string): boolean {
  if (
    type === 'MOMENT_AVAILABLE' ||
    type === 'OPEN_WHEN_AVAILABLE' ||
    type === 'SECRET_UNLOCKED'
  ) {
    return true;
  }
  if (
    cooldownCategory === 'moment' ||
    cooldownCategory === 'moments' ||
    cooldownCategory === 'open_when' ||
    cooldownCategory === 'openWhen' ||
    cooldownCategory === 'secret' ||
    cooldownCategory === 'secretVault'
  ) {
    return true;
  }
  return false;
}

/**
 * Normalizes discovery event type or cooldown category to a standard category key
 */
export function resolveDiscoveryCategory(
  type: string,
  cooldownCategory?: string
): 'moments' | 'open_when' | 'secret' | null {
  if (
    type === 'MOMENT_AVAILABLE' ||
    cooldownCategory === 'moment' ||
    cooldownCategory === 'moments'
  ) {
    return 'moments';
  }
  if (
    type === 'OPEN_WHEN_AVAILABLE' ||
    cooldownCategory === 'open_when' ||
    cooldownCategory === 'openWhen'
  ) {
    return 'open_when';
  }
  if (
    type === 'SECRET_UNLOCKED' ||
    cooldownCategory === 'secret' ||
    cooldownCategory === 'secretVault'
  ) {
    return 'secret';
  }
  return null;
}

/**
 * Retrieves the localStorage key for a given discovery category
 */
export function getDiscoveryBurstStorageKey(category: string): string {
  if (category === 'moments') return DISCOVERY_BURST_STORAGE_KEYS.moments;
  if (category === 'open_when') return DISCOVERY_BURST_STORAGE_KEYS.open_when;
  if (category === 'secret') return DISCOVERY_BURST_STORAGE_KEYS.secret;
  return DISCOVERY_BURST_STORAGE_KEYS.global;
}

/**
 * Checks if a discovery burst window is currently active for this user and category.
 * Inspects both in-memory state and localStorage to guard across re-renders and remounts.
 */
export function isDiscoveryBurstActive(
  userId: string,
  type: string,
  cooldownCategory?: string
): boolean {
  const category = resolveDiscoveryCategory(type, cooldownCategory);
  if (!category) return false;

  const memKey = `${userId}_${category}`;
  const memTime = discoveryBurstTracker.get(memKey) || 0;

  let storageTime = 0;
  const storageKey = getDiscoveryBurstStorageKey(category);
  if (storageKey) {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(storageKey);
        if (val) {
          const parsed = parseInt(val, 10);
          if (!isNaN(parsed) && parsed > 0) {
            storageTime = parsed;
          }
        }
      }
    } catch {
      // Safe storage fallback
    }
  }

  const lastTime = Math.max(memTime, storageTime);
  if (!lastTime || lastTime <= 0) return false;

  const now = Date.now();
  const elapsed = now - lastTime;
  return elapsed >= 0 && elapsed < COOLDOWN_WINDOW_MS;
}

/**
 * Returns remaining milliseconds in the active discovery burst window (or 0 if expired/inactive)
 */
export function getDiscoveryBurstRemainingMs(
  userId: string,
  type: string,
  cooldownCategory?: string
): number {
  const category = resolveDiscoveryCategory(type, cooldownCategory);
  if (!category) return 0;

  const memKey = `${userId}_${category}`;
  const memTime = discoveryBurstTracker.get(memKey) || 0;

  let storageTime = 0;
  const storageKey = getDiscoveryBurstStorageKey(category);
  if (storageKey) {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(storageKey);
        if (val) {
          const parsed = parseInt(val, 10);
          if (!isNaN(parsed) && parsed > 0) {
            storageTime = parsed;
          }
        }
      }
    } catch {
      // Safe storage fallback
    }
  }

  const lastTime = Math.max(memTime, storageTime);
  if (!lastTime || lastTime <= 0) return 0;

  const now = Date.now();
  const elapsed = now - lastTime;
  if (elapsed >= COOLDOWN_WINDOW_MS || elapsed < 0) return 0;

  return COOLDOWN_WINDOW_MS - elapsed;
}

/**
 * Records a discovery notification event dispatch in the burst tracker.
 * Persists the timestamp in both in-memory map and localStorage.
 */
export function recordDiscoveryBurst(
  userId: string,
  type: string,
  cooldownCategory?: string,
  customTimestamp?: number
): void {
  const category = resolveDiscoveryCategory(type, cooldownCategory);
  if (!category) return;

  const timestamp = typeof customTimestamp === 'number' ? customTimestamp : Date.now();
  const memKey = `${userId}_${category}`;
  discoveryBurstTracker.set(memKey, timestamp);

  const storageKey = getDiscoveryBurstStorageKey(category);
  if (storageKey) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(storageKey, String(timestamp));
      }
    } catch {
      // Safe storage fallback
    }
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DISCOVERY_BURST_STORAGE_KEYS.global, String(timestamp));
    }
  } catch {
    // Safe storage fallback
  }
}

/**
 * Resets discovery burst state (for testing or cache resets)
 */
export function resetDiscoveryBurst(userId?: string, category?: string): void {
  if (category) {
    const cat = resolveDiscoveryCategory(category, category) || (category as any);
    if (userId) {
      discoveryBurstTracker.delete(`${userId}_${cat}`);
    } else {
      for (const key of Array.from(discoveryBurstTracker.keys())) {
        if (key.endsWith(`_${cat}`)) {
          discoveryBurstTracker.delete(key);
        }
      }
    }
    const storageKey = getDiscoveryBurstStorageKey(cat);
    if (storageKey) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(storageKey);
        }
      } catch {}
    }
  } else {
    if (userId) {
      discoveryBurstTracker.delete(`${userId}_moments`);
      discoveryBurstTracker.delete(`${userId}_open_when`);
      discoveryBurstTracker.delete(`${userId}_secret`);
    } else {
      discoveryBurstTracker.clear();
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(DISCOVERY_BURST_STORAGE_KEYS.moments);
        localStorage.removeItem(DISCOVERY_BURST_STORAGE_KEYS.open_when);
        localStorage.removeItem(DISCOVERY_BURST_STORAGE_KEYS.secret);
        localStorage.removeItem(DISCOVERY_BURST_STORAGE_KEYS.global);
      }
    } catch {}
  }
}

/**
 * Safely determines if a timezone string is valid
 */
export function isValidTimezone(tz: string): boolean {
  if (!tz || typeof tz !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves the client/browser IANA timezone or 'UTC' fallback
 */
export function getDetectedTimezone(): string {
  try {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && isValidTimezone(tz)) {
        return tz;
      }
    }
  } catch {
    // Fallback
  }
  return 'UTC';
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
    const tz = isValidTimezone(timezone) ? timezone : 'UTC';
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
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
    console.warn('[NotificationEngine] Error evaluating quiet hours:', err);
    return false;
  }
}

/**
 * Calculates the next valid non-quiet delivery time if the target falls within quiet hours
 */
export function adjustForQuietHours(
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
    const tz = isValidTimezone(timezone) ? timezone : 'UTC';
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
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

    // Add 2 minutes cushion past quiet hours end
    const nextDelivery = new Date(targetDate.getTime() + (diffMinutes + 2) * 60 * 1000);
    return nextDelivery;
  } catch (err) {
    console.warn('[NotificationEngine] Error adjusting for quiet hours:', err);
    return targetDate;
  }
}

/**
 * Retrieves the user's notification preferences from Firestore or local cache
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const defaultTz = getDetectedTimezone();
  const fallbackDefaults: NotificationPreferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    timezone: defaultTz,
  };

  if (!userId) return fallbackDefaults;

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
          const merged: NotificationPreferences = { ...fallbackDefaults, ...parsed };
          preferencesCache.set(userId, { prefs: merged, timestamp: Date.now() });
        }
      }
    } catch {
      // Ignore parse failure
    }
  }

  if (!isFirebaseConfigured) {
    return fallbackDefaults;
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
          timezone: isValidTimezone(userPrefs.timezone) ? userPrefs.timezone : defaultTz,
          quietHoursEnabled: Boolean(userPrefs.quietHoursEnabled),
          quietHoursStart: userPrefs.quietHoursStart || '22:00',
          quietHoursEnd: userPrefs.quietHoursEnd || '07:00',
          birthDate: userPrefs.birthDate || data.birthDate || undefined,
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

  return fallbackDefaults;
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
        ...(updated.birthDate ? { birthDate: updated.birthDate } : {}),
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
 * In-memory registry of in-flight notification event creations.
 * Guarantees that concurrent invocations within the same runtime
 * (double clicks, React component re-renders, mounting twice, rapid loops)
 * share a single atomic execution and cannot race each other.
 */
const inFlightEventCreations = new Map<
  string,
  Promise<{
    success: boolean;
    eventId?: string;
    skipped?: boolean;
    reason?: string;
    error?: string;
  }>
>();

/**
 * Creates a notification event in Firestore under notificationEvents/{eventId}
 * IMPORTANT:
 * - Immediate notifications get deliveryMode: 'immediate' and status: 'pending'.
 * - Scheduled notifications get deliveryMode: 'scheduled' and status: 'scheduled' with future scheduledAt.
 * - Handles quiet hours adjustment and anti-spam cooldown window.
 * - The frontend does NOT send FCM directly (Phase 3 & 4 server workers handle dispatch).
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

  const {
    userId,
    type,
    title: explicitTitle,
    body: explicitBody,
    templateId: explicitTemplateId,
    templateVariables,
    data: rawData,
    eventKey,
    deliveryMode: requestedDeliveryMode,
    scheduledAt: rawScheduledAt,
    timezone: requestedTimezone,
    cooldownCategory,
    bypassPreferences,
    bypassQuietHours,
    bypassDiscoveryBurst,
  } = params;

  if (!userId || !type) {
    return {
      success: false,
      error: 'Missing required parameters: userId, type.',
    };
  }

  // Derive deterministic event ID based on userId, type, and optional eventKey
  const eventId = generateDeterministicEventId(userId, type, eventKey);

  // In-flight concurrency lock: if an identical deterministic event is currently being created, share the execution
  if (eventKey && inFlightEventCreations.has(eventId)) {
    console.log(`[NotificationEngine] In-flight concurrent event creation detected for ${eventId}, awaiting existing promise.`);
    return inFlightEventCreations.get(eventId)!;
  }

  // Phase 3C: Discovery Trigger Avalanche Protection
  const isDiscovery = isDiscoveryNotificationType(type, cooldownCategory);
  if (!bypassDiscoveryBurst && isDiscovery) {
    if (isDiscoveryBurstActive(userId, type, cooldownCategory)) {
      console.log(
        `[NotificationEngine] Discovery burst active for category ${cooldownCategory || type}. Suppressing notification event for user ${userId}.`
      );
      return {
        success: true,
        skipped: true,
        reason: 'DISCOVERY_BURST_SUPPRESSION',
      };
    }
    // Synchronously reserve burst slot to protect against rapid concurrent/batch calls
    recordDiscoveryBurst(userId, type, cooldownCategory);
  }

  const creationPromise = (async (): Promise<{
    success: boolean;
    eventId?: string;
    skipped?: boolean;
    reason?: string;
    error?: string;
  }> => {
  try {
    // 0. Check Global Emergency Switch
    let globalControl: NotificationGlobalControl = { globalEnabled: true, reason: '' };
    if (rawData?.isTest !== 'true') {
      try {
        globalControl = await getNotificationGlobalControl();
      } catch (gErr) {
        console.warn('[NotificationEngine] Notice verifying global notification control state:', gErr);
      }
    }

    // Phase 5 Template & Variable Resolution
    let finalTitle = explicitTitle;
    let finalBody = explicitBody;
    let finalTemplateId = explicitTemplateId || null;
    let finalTemplateVersion: number | null = null;
    let defaultActionRoute: string = '/';

    // If explicit title/body not provided, or if templateVariables are provided, resolve through template engine
    if (!finalTitle || !finalBody || templateVariables) {
      try {
        const rendered = await renderNotificationContent({
          category: type,
          variables: templateVariables || {},
        });
        finalTitle = finalTitle || rendered.title;
        finalBody = finalBody || rendered.body;
        finalTemplateId = finalTemplateId || rendered.templateId;
        finalTemplateVersion = rendered.templateVersion;
        defaultActionRoute = rendered.actionRoute;
      } catch (tmplErr) {
        console.warn('[NotificationEngine] Template resolution fallback:', tmplErr);
        const def = DEFAULT_NOTIFICATION_TEMPLATES[type as NotificationEventType] || DEFAULT_NOTIFICATION_TEMPLATES.GENERAL;
        finalTitle = finalTitle || def.title;
        finalBody = finalBody || def.body;
        finalTemplateId = finalTemplateId || def.id;
        finalTemplateVersion = def.version;
        defaultActionRoute = def.actionRoute;
      }
    } else {
      // Resolve template version for explicit custom push
      try {
        const activeTmpl = await getTemplateForCategory(type);
        finalTemplateId = finalTemplateId || activeTmpl.id;
        finalTemplateVersion = activeTmpl.version;
        defaultActionRoute = activeTmpl.actionRoute;
      } catch {
        finalTemplateId = finalTemplateId || 'custom';
        finalTemplateVersion = 1;
      }
    }

    if (!finalTitle || !finalBody) {
      return {
        success: false,
        error: 'Unable to resolve notification title and body.',
      };
    }

    // 1. Fetch user notification preferences
    const userPrefs = await getNotificationPreferences(userId);
    const resolvedTimezone = requestedTimezone || userPrefs.timezone || getDetectedTimezone();

    // 2. Parse explicitly requested scheduled date if any
    let resolvedScheduledDate: Date | null = null;
    if (rawScheduledAt) {
      if (rawScheduledAt instanceof Date) {
        resolvedScheduledDate = rawScheduledAt;
      } else if (typeof rawScheduledAt === 'string' || typeof rawScheduledAt === 'number') {
        resolvedScheduledDate = new Date(rawScheduledAt);
      }
    }

    const isExplicitlyScheduled = requestedDeliveryMode === 'scheduled' || Boolean(resolvedScheduledDate);

    // 3. Document reference for deterministic event ID
    const eventRef = doc(db, 'notificationEvents', eventId);

    // 4. Fast-path deduplication check
    if (eventKey) {
      try {
        const existingSnap = await getDoc(eventRef);
        if (existingSnap.exists()) {
          const existingData = existingSnap.data();
          if (isDiscovery) {
            resetDiscoveryBurst(userId, cooldownCategory || type);
          }
          return {
            success: true,
            eventId,
            skipped: true,
            reason: `Notification event already queued or delivered (status: ${existingData?.status || 'existing'}).`,
          };
        }
      } catch {
        // Continue if getDoc fails
      }
    }

    // 5. Centralized Smart Notification Decision Evaluation (Phase 8)
    const decisionResult = await evaluateNotificationDecision({
      userId,
      type,
      userPrefs,
      explicitScheduledDate: resolvedScheduledDate,
      isExplicitlyScheduled,
      timezone: resolvedTimezone,
      isTest: rawData?.isTest === 'true' || rawData?.isTest === true,
      globalEnabled: globalControl.globalEnabled,
      globalPauseReason: globalControl.reason,
      cooldownCategory,
      bypassPreferences,
      bypassQuietHours,
    });

    // 6. Deep link route sanitization
    const finalData = { ...(rawData || {}) };
    if (!finalData.url || typeof finalData.url !== 'string' || !finalData.url.startsWith('/')) {
      finalData.url = defaultActionRoute;
    }

    // Determine final delivery attributes based on smart decision
    let finalStatus: NotificationEventStatus = 'pending';
    let finalDeliveryMode: NotificationDeliveryMode = 'immediate';
    let finalScheduledAt: string | null = null;

    if (decisionResult.decision === 'SUPPRESS') {
      finalStatus = 'failed';
      finalDeliveryMode = isExplicitlyScheduled ? 'scheduled' : 'immediate';
    } else if (decisionResult.decision === 'DELAY') {
      finalStatus = 'scheduled';
      finalDeliveryMode = 'scheduled';
      finalScheduledAt = decisionResult.recommendedDeliveryAt || (resolvedScheduledDate ? resolvedScheduledDate.toISOString() : null);
    } else {
      // ALLOW
      if (decisionResult.recommendedDeliveryAt) {
        finalStatus = 'scheduled';
        finalDeliveryMode = 'scheduled';
        finalScheduledAt = decisionResult.recommendedDeliveryAt;
      } else if (isExplicitlyScheduled && resolvedScheduledDate) {
        finalStatus = 'scheduled';
        finalDeliveryMode = 'scheduled';
        finalScheduledAt = resolvedScheduledDate.toISOString();
      } else {
        finalStatus = 'pending';
        finalDeliveryMode = 'immediate';
      }
    }

    // 7. Assemble immutable audit payload
    const eventPayload: Record<string, any> = {
      userId,
      type,
      title: finalTitle.trim().slice(0, 200),
      body: finalBody.trim().slice(0, 1000),
      templateId: finalTemplateId,
      templateVersion: finalTemplateVersion,
      data: finalData,
      status: finalStatus,
      deliveryMode: finalDeliveryMode,
      timezone: resolvedTimezone,
      attemptCount: 0,
      createdAt: serverTimestamp(),

      // Phase 8: Smart Decision Audit Trail
      decision: decisionResult.decision,
      decisionReason: decisionResult.reason,
      decisionReasonExplanation: decisionResult.reasonExplanation,
      decisionPriority: decisionResult.priority,
      decisionAt: serverTimestamp(),
      decisionSource: decisionResult.source,
      signalsUsed: decisionResult.signalsUsed || [],
    };

    if (finalScheduledAt) {
      eventPayload.scheduledAt = finalScheduledAt;
      eventPayload.recommendedDeliveryAt = finalScheduledAt;
    }
    if (cooldownCategory) {
      eventPayload.cooldownCategory = cooldownCategory;
    }
    if (decisionResult.decision === 'SUPPRESS') {
      eventPayload.failureReason = decisionResult.reasonExplanation;
    }

    // 8. Atomic Document Creation: Protect against race conditions and concurrent double-creations
    if (eventKey) {
      let alreadyExists = false;
      let existingStatus: string | null = null;

      try {
        await runTransaction(db, async (transaction) => {
          const currentSnap = await transaction.get(eventRef);
          if (currentSnap.exists()) {
            alreadyExists = true;
            existingStatus = currentSnap.data()?.status || 'existing';
            return;
          }
          transaction.set(eventRef, eventPayload);
        });
      } catch (txErr: any) {
        // If transaction encountered contention or check failure, verify document existence
        try {
          const verifySnap = await getDoc(eventRef);
          if (verifySnap.exists()) {
            alreadyExists = true;
            existingStatus = verifySnap.data()?.status || 'existing';
          } else {
            throw txErr;
          }
        } catch {
          throw txErr;
        }
      }

      if (alreadyExists) {
        if (isDiscovery) {
          resetDiscoveryBurst(userId, cooldownCategory || type);
        }
        console.log(`[NotificationEngine] Atomic transaction prevented duplicate event creation for ${eventId} (status: ${existingStatus})`);
        return {
          success: true,
          eventId,
          skipped: true,
          reason: `Notification event already queued or delivered (status: ${existingStatus || 'existing'}).`,
        };
      }
    } else {
      // Ad-hoc/test notification without deterministic eventKey
      await setDoc(eventRef, eventPayload);
    }

    // Update client cooldown tracker
    const categoryKey = cooldownCategory || type;
    const cooldownKey = `${userId}_${categoryKey}`;
    cooldownTracker.set(cooldownKey, Date.now());

    console.log('[NotificationEngine] Event evaluated & recorded:', {
      eventId,
      type,
      decision: decisionResult.decision,
      reason: decisionResult.reason,
      priority: decisionResult.priority,
      status: finalStatus,
      scheduledAt: finalScheduledAt,
    });

    if (decisionResult.decision === 'SUPPRESS') {
      return {
        success: true,
        eventId,
        skipped: true,
        reason: decisionResult.reasonExplanation,
      };
    }

    return {
      success: true,
      eventId,
    };
  } catch (err: any) {
    console.warn('[NotificationEngine] Non-blocking event creation notice:', err);
    if (isDiscovery) {
      resetDiscoveryBurst(userId, cooldownCategory || type);
    }
    return {
      success: false,
      error: err?.message || 'Failed to create notification event.',
    };
  }
  })();

  if (eventKey) {
    inFlightEventCreations.set(eventId, creationPromise);
    try {
      return await creationPromise;
    } finally {
      inFlightEventCreations.delete(eventId);
    }
  }

  return await creationPromise;
}

/**
 * Phase 4 Scheduling & Personalization Helpers
 */

/**
 * Schedules an Open When envelope notification for future delivery or availability
 */
export async function scheduleOpenWhenNotification(
  userId: string,
  letterId: string,
  envelopeTitle: string,
  availableAt: Date | string
) {
  const availDate = typeof availableAt === 'string' ? new Date(availableAt) : availableAt;
  const isFuture = availDate.getTime() > Date.now();
  const dateKey = availDate.toISOString().slice(0, 10);

  return createNotificationEvent({
    userId,
    type: 'OPEN_WHEN_AVAILABLE',
    templateVariables: {
      openWhenTitle: envelopeTitle,
      scheduledDate: availDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    },
    data: { letterId, url: '/open-when' },
    eventKey: `openwhen_${letterId}_${dateKey}`,
    deliveryMode: isFuture ? 'scheduled' : 'immediate',
    scheduledAt: isFuture ? availDate : undefined,
    cooldownCategory: 'open_when',
  });
}

/**
 * Calculates and schedules a Birthday celebration notification in the user's local timezone
 */
export async function scheduleBirthdayNotification(
  userId: string,
  birthDateOrMonthDay: string,
  customMessage?: string
) {
  if (!birthDateOrMonthDay) {
    return {
      success: false,
      error: 'No birth date specified. Please set birthday in user settings.',
    };
  }

  // Parse birth date (supports 'YYYY-MM-DD' or 'MM-DD')
  let birthMonth = 0;
  let birthDay = 0;
  const parts = birthDateOrMonthDay.split('-').map((v) => parseInt(v, 10));
  if (parts.length === 3) {
    birthMonth = parts[1] - 1;
    birthDay = parts[2];
  } else if (parts.length === 2) {
    birthMonth = parts[0] - 1;
    birthDay = parts[1];
  } else {
    return { success: false, error: 'Invalid birth date format. Use YYYY-MM-DD or MM-DD.' };
  }

  const prefs = await getNotificationPreferences(userId);
  const tz = prefs.timezone || getDetectedTimezone();

  // Determine the next birthday occurrence (set to 09:00 AM local time)
  const now = new Date();
  let targetYear = now.getFullYear();
  let candidateDate = new Date(Date.UTC(targetYear, birthMonth, birthDay, 9, 0, 0));

  // If already passed this year, schedule for next year
  if (candidateDate.getTime() < now.getTime()) {
    targetYear += 1;
    candidateDate = new Date(Date.UTC(targetYear, birthMonth, birthDay, 9, 0, 0));
  }

  return createNotificationEvent({
    userId,
    type: 'BIRTHDAY',
    body: customMessage,
    templateVariables: {
      scheduledDate: `${targetYear}`,
    },
    data: { url: '/settings' },
    eventKey: `birthday_${targetYear}`,
    deliveryMode: 'scheduled',
    scheduledAt: candidateDate,
    timezone: tz,
    cooldownCategory: 'birthday',
  });
}

/**
 * Schedules a future letter availability notification
 */
export async function scheduleLetterAvailableNotification(
  userId: string,
  letterId: string,
  title: string,
  availableAt: Date | string
) {
  const availDate = typeof availableAt === 'string' ? new Date(availableAt) : availableAt;
  const isFuture = availDate.getTime() > Date.now();

  return createNotificationEvent({
    userId,
    type: 'LETTER_AVAILABLE',
    templateVariables: {
      letterTitle: title || 'A new letter',
    },
    data: { letterId, url: '/letters' },
    eventKey: `letter_${letterId}_${availDate.toISOString().slice(0, 10)}`,
    deliveryMode: isFuture ? 'scheduled' : 'immediate',
    scheduledAt: isFuture ? availDate : undefined,
    cooldownCategory: 'letter',
  });
}

/**
 * Schedules a future secret vault reveal notification
 */
export async function scheduleSecretUnlockedNotification(
  userId: string,
  secretId: string,
  secretTitle: string,
  unlockAt: Date | string
) {
  const unlockDate = typeof unlockAt === 'string' ? new Date(unlockAt) : unlockAt;
  const isFuture = unlockDate.getTime() > Date.now();

  return createNotificationEvent({
    userId,
    type: 'SECRET_UNLOCKED',
    templateVariables: {
      secretTitle: secretTitle || 'A new secret',
    },
    data: { secretId, url: '/secret-vault' },
    eventKey: `secret_${secretId}_${unlockDate.toISOString().slice(0, 10)}`,
    deliveryMode: isFuture ? 'scheduled' : 'immediate',
    scheduledAt: isFuture ? unlockDate : undefined,
    cooldownCategory: 'secret',
  });
}

/**
 * High-level convenience triggers for the 6 primary notification event types (Immediate)
 */

export async function notifyLetterAvailable(
  userId: string,
  letterId: string,
  title?: string
) {
  return createNotificationEvent({
    userId,
    type: 'LETTER_AVAILABLE',
    templateVariables: {
      letterTitle: title || 'A new letter',
    },
    data: { letterId, url: '/letters' },
    eventKey: `letter_${letterId}`,
    deliveryMode: 'immediate',
    cooldownCategory: 'letter',
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
    templateVariables: {
      openWhenTitle: envelopeTitle,
    },
    data: { letterId, url: '/open-when' },
    eventKey: `openwhen_${letterId}`,
    deliveryMode: 'immediate',
    cooldownCategory: 'open_when',
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
    templateVariables: {
      secretTitle: secretTitle || 'A new secret',
    },
    data: { secretId, url: '/secret-vault' },
    eventKey: `secret_${secretId}`,
    deliveryMode: 'immediate',
    cooldownCategory: 'secret',
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
    templateVariables: {
      momentTitle: momentTitle || 'A new moment',
    },
    data: { momentId, url: '/moments' },
    eventKey: `moment_${momentId}`,
    deliveryMode: 'immediate',
    cooldownCategory: 'moment',
  });
}

export async function notifyBirthday(
  userId: string,
  customMessage?: string
) {
  return createNotificationEvent({
    userId,
    type: 'BIRTHDAY',
    body: customMessage,
    data: { url: '/settings' },
    eventKey: `birthday_${new Date().getFullYear()}`,
    deliveryMode: 'immediate',
    cooldownCategory: 'birthday',
  });
}

export async function notifyGeneral(
  userId: string,
  title?: string,
  body?: string,
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
    deliveryMode: 'immediate',
  });
}

/**
 * Fetches recent notification events for a specific user (User History in Settings)
 */
export async function fetchUserNotifications(
  userId: string,
  maxCount: number = 20
): Promise<NotificationEvent[]> {
  if (!isFirebaseConfigured || !userId) return [];

  try {
    const eventsRef = collection(db, 'notificationEvents');
    const q = query(
      eventsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    );
    const snapshot = await getDocs(q);

    const list: NotificationEvent[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let createdStr = 'Recently';
      if (data.createdAt?.toDate) {
        createdStr = data.createdAt.toDate().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (data.createdAt?.seconds) {
        createdStr = new Date(data.createdAt.seconds * 1000).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      list.push({
        id: docSnap.id,
        userId: data.userId || userId,
        type: data.type || 'GENERAL',
        title: data.title || 'Notification',
        body: data.body || '',
        templateId: data.templateId || null,
        templateVersion: data.templateVersion || null,
        data: data.data || {},
        status: data.status || 'pending',
        deliveryMode: data.deliveryMode || 'immediate',
        scheduledAt: data.scheduledAt || null,
        timezone: data.timezone || null,
        createdAt: createdStr,
        sentAt: data.sentAt || null,
        successfulTokenCount: typeof data.successfulTokenCount === 'number' ? data.successfulTokenCount : undefined,
      });
    });

    return list;
  } catch (err) {
    console.warn('[NotificationEngine] Error fetching user notifications:', err);
    return [];
  }
}

/**
 * Real-time subscription to a user's recent notifications
 */
export function subscribeUserNotifications(
  userId: string,
  onUpdate: (events: NotificationEvent[]) => void,
  maxCount: number = 20
): () => void {
  if (!isFirebaseConfigured || !userId) {
    onUpdate([]);
    return () => {};
  }

  try {
    const eventsRef = collection(db, 'notificationEvents');
    const q = query(
      eventsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    );

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
              hour: '2-digit',
              minute: '2-digit',
            });
          } else if (data.createdAt?.seconds) {
            createdStr = new Date(data.createdAt.seconds * 1000).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          }

          list.push({
            id: docSnap.id,
            userId: data.userId || userId,
            type: data.type || 'GENERAL',
            title: data.title || 'Notification',
            body: data.body || '',
            templateId: data.templateId || null,
            templateVersion: data.templateVersion || null,
            data: data.data || {},
            status: data.status || 'pending',
            deliveryMode: data.deliveryMode || 'immediate',
            scheduledAt: data.scheduledAt || null,
            timezone: data.timezone || null,
            createdAt: createdStr,
            sentAt: data.sentAt || null,
            successfulTokenCount: typeof data.successfulTokenCount === 'number' ? data.successfulTokenCount : undefined,
          });
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('[NotificationEngine] User notifications subscription notice:', err);
      }
    );
  } catch (err) {
    console.warn('[NotificationEngine] Error subscribing to user notifications:', err);
    return () => {};
  }
}

/**
 * Fetches recent notification events for the Admin dashboard (includes scheduling metadata)
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
        templateId: data.templateId || null,
        templateVersion: data.templateVersion || null,
        data: data.data || {},
        status: data.status || 'pending',
        deliveryMode: data.deliveryMode || 'immediate',
        scheduledAt: data.scheduledAt || null,
        timezone: data.timezone || null,
        cooldownCategory: data.cooldownCategory || null,
        attemptCount: data.attemptCount ?? 0,
        lastAttemptAt: data.lastAttemptAt || null,
        nextAttemptAt: data.nextAttemptAt || null,
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
            templateId: data.templateId || null,
            templateVersion: data.templateVersion || null,
            data: data.data || {},
            status: data.status || 'pending',
            deliveryMode: data.deliveryMode || 'immediate',
            scheduledAt: data.scheduledAt || null,
            timezone: data.timezone || null,
            cooldownCategory: data.cooldownCategory || null,
            attemptCount: data.attemptCount ?? 0,
            lastAttemptAt: data.lastAttemptAt || null,
            nextAttemptAt: data.nextAttemptAt || null,
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
  deliveryMode?: NotificationDeliveryMode;
  scheduledAt?: Date | string;
}): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const title = params.title || 'Starlit Letters Push Verification ✨';
    const body = params.body || 'Phase 3 & Phase 4 server-side FCM push delivery & scheduler active!';
    const type = (params.type as NotificationEventType) || 'GENERAL';
    const url = params.url || '/settings';

    // Queue legitimate notification event directly in Firestore
    const res = await createNotificationEvent({
      userId: params.userId,
      type,
      title,
      body,
      deliveryMode: params.deliveryMode || 'immediate',
      scheduledAt: params.scheduledAt,
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
 * Triggers server-side processing for scheduled & pending events
 */
export async function triggerServerScheduledCheck(): Promise<{
  success: boolean;
  processedCount?: number;
  delayedCount?: number;
  message?: string;
  error?: string;
}> {
  const functionsUrl = (import.meta as any).env?.VITE_FIREBASE_FUNCTIONS_URL;
  if (functionsUrl) {
    try {
      const response = await fetch(`${functionsUrl.replace(/\/$/, '')}/runScheduledNotificationCheck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          processedCount: data.processedCount ?? 0,
          delayedCount: data.delayedCount ?? 0,
          message: `Scheduler checked: ${data.processedCount ?? 0} dispatched, ${data.delayedCount ?? 0} delayed for quiet hours.`,
        };
      }
    } catch (err: any) {
      console.warn('[NotificationEngine] HTTPS Cloud Function scheduler invoke notice:', err);
    }
  }

  return triggerServerQueueProcessing();
}

/**
 * Triggers queue processing for pending notification events.
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
          processedCount: data.pendingCount ?? data.processedCount ?? 0,
          message: data.message || `Processed queue via Cloud Function`,
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
    let scheduledCount = 0;
    snapshot.forEach((docSnap) => {
      const st = docSnap.data()?.status;
      if (st === 'pending') pendingCount++;
      if (st === 'scheduled') scheduledCount++;
    });

    return {
      success: true,
      processedCount: pendingCount,
      message:
        pendingCount === 0 && scheduledCount === 0
          ? 'All events are up to date and processed in real time by the Firebase Cloud Function trigger.'
          : `${pendingCount} pending event(s) and ${scheduledCount} scheduled event(s) in queue.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to inspect notification queue',
    };
  }
}

/**
 * Validates whether a target URL is a safe internal same-origin relative route
 */
export function validateSafeDeepLink(url?: string | null): string {
  if (!url || typeof url !== 'string') return '/';
  const trimmed = url.trim();

  // Must start with '/' and must not start with '//' (protocol-relative external attack)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return '/';
  }

  // Prevent javascript:, data:, vbscript: protocols
  if (trimmed.toLowerCase().includes('javascript:') || trimmed.toLowerCase().includes('data:') || trimmed.toLowerCase().includes('vbscript:')) {
    return '/';
  }

  return trimmed;
}

/**
 * Phase 7: Records a notification click event securely and idempotently.
 * Updates clickedAt (if first time), lastClickedAt (every time), openedCount (atomic increment), and interactionSource.
 */
export async function recordNotificationClick(
  eventId: string,
  source: 'push_notification' | 'in_app' | 'history_click' | string = 'push_notification'
): Promise<boolean> {
  if (!eventId || typeof eventId !== 'string' || !eventId.trim()) {
    return false;
  }
  if (!isFirebaseConfigured || !auth.currentUser) {
    return false;
  }

  try {
    const cleanEventId = eventId.trim();
    const cleanSource = (typeof source === 'string' ? source.trim() : 'push_notification').slice(0, 64) || 'push_notification';
    const eventRef = doc(db, 'notificationEvents', cleanEventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return false;
    }

    const currentData = eventSnap.data();

    // Verify ownership on the client as well
    if (currentData.userId && currentData.userId !== auth.currentUser.uid) {
      console.warn('[NotificationTracking] Ownership mismatch for notification click tracking');
      return false;
    }

    // Prepare update payload
    const updatePayload: Record<string, any> = {
      lastClickedAt: serverTimestamp(),
      openedCount: increment(1),
      interactionSource: cleanSource,
    };

    // First-click semantics: only set clickedAt if not already populated
    if (!currentData.clickedAt) {
      updatePayload.clickedAt = serverTimestamp();
    }

    await updateDoc(eventRef, updatePayload);
    return true;
  } catch (err: any) {
    // Non-blocking fail-safe: engagement analytics must never block navigation or throw unhandled exceptions
    console.warn('[NotificationTracking] Non-blocking click recording notice:', err?.message || err);
    return false;
  }
}

/**
 * Phase 7: Records that target content was successfully rendered/opened.
 * Distinguishes notification click from actual destination engagement (sentAt ≠ clickedAt ≠ targetOpenedAt).
 */
export async function recordNotificationTargetOpened(eventId: string): Promise<boolean> {
  if (!eventId || typeof eventId !== 'string' || !eventId.trim()) {
    return false;
  }
  if (!isFirebaseConfigured || !auth.currentUser) {
    return false;
  }

  try {
    const cleanEventId = eventId.trim();
    const eventRef = doc(db, 'notificationEvents', cleanEventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return false;
    }

    const currentData = eventSnap.data();

    // Verify ownership on the client
    if (currentData.userId && currentData.userId !== auth.currentUser.uid) {
      return false;
    }

    // Only set targetOpenedAt if not already populated to preserve the primary content open timestamp
    if (!currentData.targetOpenedAt) {
      await updateDoc(eventRef, {
        targetOpenedAt: serverTimestamp(),
      });
    }
    return true;
  } catch (err: any) {
    // Non-blocking fail-safe
    console.warn('[NotificationTracking] Non-blocking target open recording notice:', err?.message || err);
    return false;
  }
}



