/**
 * Starlit Letters - Firebase Cloud Messaging Web Push Service Worker
 * Handles background push notifications when the web application is closed or inactive.
 */

// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker with dynamic query param support or canonical project defaults
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: urlParams.get('apiKey') || 'AIzaSyCAj57KTHde1XwxXmg08zNlc4knIRmqumo',
  authDomain: urlParams.get('authDomain') || 'gen-lang-client-0057157522.firebaseapp.com',
  projectId: urlParams.get('projectId') || 'gen-lang-client-0057157522',
  storageBucket: urlParams.get('storageBucket') || 'gen-lang-client-0057157522.firebasestorage.app',
  messagingSenderId: urlParams.get('messagingSenderId') || '1040135494913',
  appId: urlParams.get('appId') || '1:1040135494913:web:ee17e2c259d779bbe60f00',
};

if (firebaseConfig.projectId) {
  try {
    firebase.initializeApp(firebaseConfig);
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
      tag: payload.data?.tag || 'starlit-push-notification',
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
