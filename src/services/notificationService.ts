import { getMessaging, getToken, onMessage, isSupported, deleteToken, Messaging } from 'firebase/messaging';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import app, { db, isFirebaseConfigured } from '../firebase';
import { NotificationPermissionState, NotificationStatusInfo, NotificationToken } from '../types';

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
 * Gets the current Web Push VAPID key from environment variables
 */
export function getVapidKey(): string | null {
  const envKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
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
    error: !vapidKey ? 'VAPID Web Push certificate key not configured.' : null,
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
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.warn('[FCM] Service worker registration notice:', err);
    return undefined;
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

  const supported = await isPushSupported();
  if (!supported) {
    return {
      success: false,
      error: 'Push notifications are not supported by this browser or in this environment.',
    };
  }

  const vapidKey = getVapidKey();
  if (!vapidKey) {
    return {
      success: false,
      error:
        'VAPID key is not configured. Please add VITE_FIREBASE_VAPID_KEY from Firebase Console (Project Settings > Cloud Messaging > Web Push certificates).',
    };
  }

  try {
    // 1. Request browser permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        error:
          permission === 'denied'
            ? 'Notification permission was blocked in browser settings.'
            : 'Notification permission was not granted.',
      };
    }

    // 2. Initialize Messaging
    const messaging = await getMessagingService();
    if (!messaging) {
      return { success: false, error: 'Failed to initialize Firebase Messaging service.' };
    }

    // 3. Register service worker
    const swRegistration = await registerServiceWorker();

    // 4. Retrieve FCM Token
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      return { success: false, error: 'No FCM registration token returned from Firebase.' };
    }

    // 5. Store token securely in Firestore under users/{uid}/notificationTokens/{tokenId}
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
