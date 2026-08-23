/**
 * Starlit Letters - Firebase Cloud Messaging Web Push Service Worker
 * Handles background push notifications when the web application is closed or inactive.
 */

// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyCtzVnx-qX_0aXA4B0QB7dYtwz7AKLJZ5s",
  authDomain: "quadratic-harmony-5h7sp.firebaseapp.com",
  projectId: "quadratic-harmony-5h7sp",
  storageBucket: "quadratic-harmony-5h7sp.firebasestorage.app",
  messagingSenderId: "710835329405",
  appId: "1:710835329405:web:00e29f18d568e0684b5414"
};

firebase.initializeApp(firebaseConfig);

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

// Handle notification click action (open or focus window)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If an existing Starlit Letters tab is open, focus it
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            if ('navigate' in client && targetUrl !== '/') {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }
        // Otherwise, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
