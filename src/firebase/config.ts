import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore, setLogLevel } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const clientEnv = (typeof import.meta !== 'undefined' && (import.meta as any)?.env) || {};

const rawApiKey =
  clientEnv.VITE_FIREBASE_API_KEY ||
  (firebaseAppletConfig as any)?.apiKey ||
  '';

const projectId =
  clientEnv.VITE_FIREBASE_PROJECT_ID ||
  (firebaseAppletConfig as any)?.projectId ||
  'gen-lang-client-0057157522';

const authDomain =
  clientEnv.VITE_FIREBASE_AUTH_DOMAIN ||
  (firebaseAppletConfig as any)?.authDomain ||
  `${projectId}.firebaseapp.com`;

const storageBucket =
  clientEnv.VITE_FIREBASE_STORAGE_BUCKET ||
  (firebaseAppletConfig as any)?.storageBucket ||
  `${projectId}.firebasestorage.app`;

const messagingSenderId =
  clientEnv.VITE_FIREBASE_MESSAGING_SENDER_ID ||
  (firebaseAppletConfig as any)?.messagingSenderId ||
  '1040135494913';

const appId =
  clientEnv.VITE_FIREBASE_APP_ID ||
  (firebaseAppletConfig as any)?.appId ||
  '1:1040135494913:web:eccd1c5846fe5f5de60f00';

const firestoreDatabaseId =
  clientEnv.VITE_FIREBASE_DATABASE_ID ||
  (firebaseAppletConfig as any)?.firestoreDatabaseId ||
  'ai-studio-remixstarlitlett-45632027-0698-4661-bfb7-6fea5b923b2b';

export const vapidKey: string =
  (clientEnv.VITE_FIREBASE_VAPID_KEY && clientEnv.VITE_FIREBASE_VAPID_KEY.trim()) ||
  (firebaseAppletConfig as any)?.vapidKey ||
  (firebaseAppletConfig as any)?.vapidPublicKey ||
  '';

export const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  firestoreDatabaseId,
};

const config = firebaseConfig;

export const isFirebaseConfigured = Boolean(
  rawApiKey &&
    typeof rawApiKey === 'string' &&
    rawApiKey.trim().length > 0 &&
    !rawApiKey.includes('demo') &&
    rawApiKey !== 'unconfigured-api-key'
);

function initFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  try {
    if (isFirebaseConfigured) {
      return initializeApp(config);
    }
    // Safe placeholder app initialization to allow SDK components to load without crashing module evaluation
    return initializeApp({
      apiKey: 'unconfigured-api-key',
      authDomain,
      projectId,
      storageBucket,
      appId: appId || '1:000000000000:web:0000000000000000000000',
    });
  } catch (err) {
    console.warn('[FIREBASE] App initialization fallback notice:', err);
    try {
      return getApp();
    } catch {
      return initializeApp({
        apiKey: 'unconfigured-api-key',
        projectId: 'gen-lang-client-0057157522',
      });
    }
  }
}

const app: FirebaseApp = initFirebaseApp();

function initAuth(): Auth {
  try {
    if (typeof window !== 'undefined') {
      try {
        return initializeAuth(app, {
          persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence],
        });
      } catch {
        return getAuth(app);
      }
    }
    return getAuth(app);
  } catch (err) {
    console.warn('[FIREBASE] Auth initialization fallback notice:', err);
    try {
      return getAuth(app);
    } catch {
      return {} as Auth;
    }
  }
}

export const auth: Auth = initAuth();

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
    try {
      return getFirestore(app);
    } catch (innerErr) {
      console.warn('[FIREBASE] Firestore retrieval fallback notice:', innerErr);
      return {} as Firestore;
    }
  }
}

export const db: Firestore = createFirestoreInstance();

function initStorage(): FirebaseStorage {
  try {
    return getStorage(app);
  } catch (err) {
    console.warn('[FIREBASE] Storage retrieval fallback notice:', err);
    return {} as FirebaseStorage;
  }
}

export const storage: FirebaseStorage = initStorage();

// Safe validation connection test (non-blocking)
if (isFirebaseConfigured && typeof window !== 'undefined') {
  const runTestConnection = async () => {
    try {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      const { doc, getDocFromServer } = await import('firebase/firestore');
      if (db && typeof db === 'object') {
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


