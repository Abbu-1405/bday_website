import 'dotenv/config';
import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseAppletConfig from '../firebase-applet-config.json';

const PROJECT_ID = firebaseAppletConfig.projectId || 'gen-lang-client-0057157522';
const DATABASE_ID = firebaseAppletConfig.firestoreDatabaseId;

let adminApp: App;
let hasAdminCredentials = false;

if (getApps().length === 0) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (serviceAccountKey) {
    try {
      let parsedKey: any = serviceAccountKey;
      if (typeof serviceAccountKey === 'string') {
        const trimmed = serviceAccountKey.trim();
        if (trimmed.startsWith('{')) {
          parsedKey = JSON.parse(trimmed);
        } else {
          try {
            const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
            if (decoded.trim().startsWith('{')) {
              parsedKey = JSON.parse(decoded);
            } else {
              parsedKey = JSON.parse(trimmed);
            }
          } catch {
            parsedKey = JSON.parse(trimmed);
          }
        }
      }
      if (parsedKey && parsedKey.private_key && typeof parsedKey.private_key === 'string') {
        parsedKey.private_key = parsedKey.private_key.replace(/\\n/g, '\n');
      }
      adminApp = initializeApp({
        credential: cert(parsedKey),
        projectId: parsedKey.project_id || PROJECT_ID,
      });
      hasAdminCredentials = true;
    } catch (e: any) {
      console.warn('[firebaseAdmin] Failed to parse or apply service account JSON notice:', e?.message || e);
      adminApp = initializeApp({ projectId: PROJECT_ID });
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    adminApp = initializeApp({ projectId: PROJECT_ID });
    hasAdminCredentials = true;
  } else {
    adminApp = initializeApp({ projectId: PROJECT_ID });
  }
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

let adminMessaging: Messaging;
try {
  adminMessaging = getMessaging(adminApp);
} catch (mErr) {
  console.warn('[firebaseAdmin] Messaging initialization notice:', mErr);
  adminMessaging = {} as Messaging;
}

let adminAuth: Auth;
try {
  adminAuth = getAuth(adminApp);
} catch (aErr) {
  console.warn('[firebaseAdmin] Auth initialization notice:', aErr);
  adminAuth = {} as Auth;
}

export { adminApp, adminDb, adminMessaging, adminAuth, PROJECT_ID, DATABASE_ID, hasAdminCredentials };
