import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { recordActivity } from './activityService';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, userId?: string) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const submitFeeling = async (userId: string, content: string): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please configure VITE_FIREBASE_API_KEY.');
  }
  const collectionPath = `users/${userId}/feelings`;
  try {
    const docRef = await addDoc(collection(db, collectionPath), {
      userId,
      content: content.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      type: 'feeling',
    });

    // Record activity event after successful submission (NO text content in event metadata)
    await recordActivity({
      type: 'feeling_submitted',
      section: 'what_am_i_to_you',
      itemId: docRef.id,
      userIdOverride: userId,
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath, userId);
    throw error;
  }
};

export const submitLetter = async (userId: string, title: string | undefined, content: string): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please configure VITE_FIREBASE_API_KEY.');
  }
  const collectionPath = `users/${userId}/letters`;
  try {
    const docRef = await addDoc(collection(db, collectionPath), {
      userId,
      title: title?.trim() || '',
      content: content.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      type: 'letter',
    });

    // Record activity event after successful submission (NO text content in event metadata)
    await recordActivity({
      type: 'letter_submitted',
      section: 'what_am_i_to_you',
      itemId: docRef.id,
      userIdOverride: userId,
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath, userId);
    throw error;
  }
};

