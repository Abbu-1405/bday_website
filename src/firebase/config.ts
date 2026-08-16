import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore, setLogLevel, memoryLocalCache } from 'firebase/firestore';
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
    if (firestoreDatabaseId) {
      return initializeFirestore(app, {
        localCache: memoryLocalCache(),
        experimentalForceLongPolling: true,
      }, firestoreDatabaseId);
    } else {
      return initializeFirestore(app, {
        localCache: memoryLocalCache(),
        experimentalForceLongPolling: true,
      });
    }
  } catch {
    // In case Firestore was already initialized for this app instance
    return firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);
  }
}

export const db: Firestore = createFirestoreInstance();
export const storage: FirebaseStorage = getStorage(app);

export default app;


