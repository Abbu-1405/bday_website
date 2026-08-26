import { getMessaging, getToken, onMessage, isSupported, deleteToken, Messaging } from 'firebase/messaging';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import app, { db, isFirebaseConfigured, vapidKey as defaultVapidKey } from '../firebase';
import firebaseAppletConfig from '../../firebase-applet-config.json';
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
