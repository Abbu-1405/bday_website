import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, setLogLevel } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const config = {
  apiKey: (firebaseAppletConfig as any)?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: (firebaseAppletConfig as any)?.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (firebaseAppletConfig as any)?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (firebaseAppletConfig as any)?.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (firebaseAppletConfig as any)?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (firebaseAppletConfig as any)?.appId || import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: (firebaseAppletConfig as any)?.firestoreDatabaseId || import.meta.env.VITE_FIREBASE_DATABASE_ID,
};

export const isFirebaseConfigured = Boolean(
  config && config.apiKey && !config.apiKey.includes('demo')
);

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(config);

export const auth: Auth = getAuth(app);

const firestoreDatabaseId = (config as any).firestoreDatabaseId;

// Suppress transient backend connection retry warnings in console
try {
  setLogLevel('silent');
} catch {
  // Ignore if setLogLevel is not supported in environment
}

function createFirestoreInstance(): Firestore {
  try {
    return firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);
  } catch (err) {
    console.warn('[FIREBASE] Firestore retrieval fallback:', err);
    return getFirestore(app);
  }
}

export const db: Firestore = createFirestoreInstance();
export const storage: FirebaseStorage = getStorage(app);

// Safe validation connection test
if (isFirebaseConfigured && typeof window !== 'undefined') {
  const runTestConnection = async () => {
    try {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      const { doc, getDocFromServer } = await import('firebase/firestore');
      if (db) {
        await getDocFromServer(doc(db, 'test', 'connection')).catch(() => {
          // Connection test notice - safely handled
        });
      }
    } catch {
      // Ignored for offline, hidden, or transitioning states
    }
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'complete') {
      setTimeout(() => {
        if (document.visibilityState !== 'hidden') {
          runTestConnection();
        }
      }, 1000);
    } else {
      window.addEventListener(
        'load',
        () => {
          setTimeout(() => {
            if (document.visibilityState !== 'hidden') {
              runTestConnection();
            }
          }, 1000);
        },
        { once: true }
      );
    }
  }
}

export default app;


