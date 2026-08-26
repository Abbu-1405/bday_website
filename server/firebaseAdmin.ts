import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseAppletConfig from '../firebase-applet-config.json';

const PROJECT_ID = firebaseAppletConfig.projectId || 'gen-lang-client-0057157522';
const DATABASE_ID = firebaseAppletConfig.firestoreDatabaseId;

let adminApp: App;

if (getApps().length === 0) {
  adminApp = initializeApp({
    projectId: PROJECT_ID,
  });
} else {
  adminApp = getApp();
}

let adminDb: Firestore;
try {
  if (DATABASE_ID && DATABASE_ID !== '(default)') {
    adminDb = getFirestore(adminApp, DATABASE_ID);
  } else {
    adminDb = getFirestore(adminApp);
  }
} catch (err) {
  console.warn('[firebaseAdmin] Falling back to default database:', err);
  adminDb = getFirestore(adminApp);
}

const adminMessaging: Messaging = getMessaging(adminApp);
const adminAuth: Auth = getAuth(adminApp);

export { adminApp, adminDb, adminMessaging, adminAuth, PROJECT_ID, DATABASE_ID };
