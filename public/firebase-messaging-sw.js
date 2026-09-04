/**
 * Starlit Letters - Firebase Cloud Messaging Web Push Service Worker
 * Handles background push notifications when the web application is closed or inactive.
 */

// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker with dynamic query param support or canonical project defaults
let urlParams;
try {
  urlParams = new URLSearchParams(self.location.search || '');
} catch (_) {
  urlParams = new URLSearchParams('');
}

function getSafeParam(key, fallback) {
  try {
    const val = urlParams.get(key);
    if (val && typeof val === 'string' && val.trim().length > 0) {
      return val.trim();
    }
  } catch (_) {}
  return fallback;
}

const firebaseConfig = {
  apiKey: getSafeParam('apiKey', 'AIzaSyCAj57KTHde1XwxXmg08zNlc4knIRmqumo'),
  authDomain: getSafeParam('authDomain', 'gen-lang-client-0057157522.firebaseapp.com'),
  projectId: getSafeParam('projectId', 'gen-lang-client-0057157522'),
  storageBucket: getSafeParam('storageBucket', 'gen-lang-client-0057157522.firebasestorage.app'),
  messagingSenderId: getSafeParam('messagingSenderId', '1040135494913'),
  appId: getSafeParam('appId', '1:1040135494913:web:eccd1c5846fe5f5de60f00'),
};

if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  try {
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
  } catch (initErr) {
    console.warn('[firebase-messaging-sw.js] App init notice:', initErr);
  }
}

let messaging = null;
try {
  messaging = firebase.messaging();
} catch (err) {
  console.warn('[firebase-messaging-sw.js] Messaging init warning:', err);
}

/**
 * Resolves deterministic category-aware Web Push notification tag (Phase 3D)
 * Preserves category isolation so same-category notifications collapse while
 * distinct categories remain independent.
 */
function resolveServiceWorkerNotificationTag(payload) {
  // 1. Direct tag provided in payload data
  if (payload?.data?.tag && typeof payload.data.tag === 'string' && payload.data.tag.trim().length > 0) {
    return payload.data.tag.trim();
  }

  // 2. Infer from eventType or category if tag was omitted
  const rawType = String(payload?.data?.eventType || payload?.data?.type || '').toUpperCase();
  const rawCategory = String(payload?.data?.category || payload?.data?.cooldownCategory || '').toLowerCase();

  if (rawType === 'LETTER_AVAILABLE' || rawCategory === 'letter' || rawCategory === 'letters') {
    return 'starlit-letters';
  }
  if (rawType === 'MOMENT_AVAILABLE' || rawCategory === 'moment' || rawCategory === 'moments') {
    return 'starlit-moments';
  }
  if (rawType === 'OPEN_WHEN_AVAILABLE' || rawCategory === 'open_when' || rawCategory === 'openwhen') {
    return 'starlit-open-when';
  }
  if (
    rawType === 'SECRET_UNLOCKED' ||
    rawType === 'SECRET_UNLCOKED' ||
    rawCategory === 'secret' ||
    rawCategory === 'secrets'
  ) {
    return 'starlit-secrets';
  }
  if (rawType === 'BIRTHDAY' || rawCategory === 'birthday') {
    return 'starlit-birthday';
  }
  if (rawType === 'GENERAL' || rawCategory === 'general' || rawType === 'TEST') {
    return 'starlit-general';
  }

  // 3. Safe fallback tag
  return 'starlit-general';
}

// Background push notification handler
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle =
      payload.notification?.title ||
      payload.data?.title ||
      'Starlit Letters';

    const notificationOptions = {
      body:
        payload.notification?.body ||
        payload.data?.body ||
        'A little piece of your universe is waiting. ✨',
      icon:
        payload.notification?.icon ||
        payload.data?.icon ||
        '/download-7.jpg',
      badge:
        payload.notification?.badge ||
        payload.data?.badge ||
        '/download-7.jpg',
      tag: resolveServiceWorkerNotificationTag(payload),
      renotify: true,
      data: {
        url: payload.data?.url || payload.fcmOptions?.link || '/',
        ...payload.data,
      },
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification click action (open or focus window with engagement tracking)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Extract metadata safely without exposing credentials or sensitive user data
  let rawUrl = event.notification.data?.url || '/';
  const eventId = event.notification.data?.eventId || event.notification.data?.notificationEventId;

  // Validate internal same-origin relative destination
  let safeDestination = '/';
  if (typeof rawUrl === 'string' && rawUrl.startsWith('/') && !rawUrl.startsWith('//')) {
    safeDestination = rawUrl;
  }

  // Construct tracked deep-link URL with event identifier
  let trackedUrl = safeDestination;
  if (eventId && typeof eventId === 'string') {
    const separator = trackedUrl.includes('?') ? '&' : '?';
    trackedUrl = `${trackedUrl}${separator}nid=${encodeURIComponent(eventId)}&src=push`;
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If an existing Starlit Letters tab is open, focus and navigate it
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url && client.url.includes(self.location.origin) && 'focus' in client) {
            // Post message to client for real-time foreground handling
            if ('postMessage' in client && eventId) {
              client.postMessage({
                type: 'STARLIT_NOTIFICATION_CLICK',
                eventId,
                url: safeDestination,
                source: 'push_notification',
              });
            }
            if ('navigate' in client && trackedUrl !== '/') {
              client.navigate(trackedUrl);
            }
            return client.focus();
          }
        }
        // Otherwise, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(trackedUrl);
        }
      })
      .catch((err) => {
        console.warn('[firebase-messaging-sw.js] Notification click handling notice:', err);
      })
  );
});
