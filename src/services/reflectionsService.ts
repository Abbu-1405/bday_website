import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

export interface UserFeelingRef {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  timestampRaw: number;
}

export interface UserLetterRef {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  timestampRaw: number;
}

export interface FetchReflectionsResult<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

enum ReflectionOperationType {
  LIST = 'list',
  GET = 'get',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: ReflectionOperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: ReflectionOperationType, path: string | null, userId?: string) {
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

function formatDate(data: DocumentData): { dateString: string; rawMs: number } {
  let dateString = 'Recently';
  let rawMs = 0;

  if (data.createdAt?.toDate) {
    const d = data.createdAt.toDate();
    rawMs = d.getTime();
    dateString = d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } else if (data.createdAt?.seconds) {
    rawMs = data.createdAt.seconds * 1000;
    dateString = new Date(rawMs).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } else if (typeof data.createdAt === 'string') {
    dateString = data.createdAt;
    rawMs = new Date(data.createdAt).getTime() || 0;
  }

  return { dateString, rawMs };
}

/**
 * Fetch authenticated user's submitted feelings with cursor pagination.
 */
export async function fetchUserFeelings(
  userId: string,
  sortOrder: 'newest' | 'oldest' = 'newest',
  limitCount: number = 20,
  cursorDoc?: QueryDocumentSnapshot<DocumentData> | null
): Promise<FetchReflectionsResult<UserFeelingRef>> {
  if (!isFirebaseConfigured || !userId) {
    return { items: [], lastDoc: null, hasMore: false };
  }

  const collectionPath = `users/${userId}/feelings`;
  try {
    const feelingsRef = collection(db, collectionPath);
    let q = query(
      feelingsRef,
      orderBy('createdAt', sortOrder === 'newest' ? 'desc' : 'asc'),
      limit(limitCount)
    );

    if (cursorDoc) {
      q = query(
        feelingsRef,
        orderBy('createdAt', sortOrder === 'newest' ? 'desc' : 'asc'),
        startAfter(cursorDoc),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    const items: UserFeelingRef[] = [];
    let lastDocSnap: QueryDocumentSnapshot<DocumentData> | null = null;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const { dateString, rawMs } = formatDate(data);
      items.push({
        id: docSnap.id,
        userId,
        content: data.content || '',
        createdAt: dateString,
        timestampRaw: rawMs,
      });
      lastDocSnap = docSnap;
    });

    return {
      items,
      lastDoc: lastDocSnap,
      hasMore: snapshot.docs.length === limitCount,
    };
  } catch (error) {
    handleFirestoreError(error, ReflectionOperationType.LIST, collectionPath, userId);
    return { items: [], lastDoc: null, hasMore: false };
  }
}

/**
 * Fetch authenticated user's submitted letters with cursor pagination.
 */
export async function fetchUserLetters(
  userId: string,
  sortOrder: 'newest' | 'oldest' = 'newest',
  limitCount: number = 20,
  cursorDoc?: QueryDocumentSnapshot<DocumentData> | null
): Promise<FetchReflectionsResult<UserLetterRef>> {
  if (!isFirebaseConfigured || !userId) {
    return { items: [], lastDoc: null, hasMore: false };
  }

  const collectionPath = `users/${userId}/letters`;
  try {
    const lettersRef = collection(db, collectionPath);
    let q = query(
      lettersRef,
      orderBy('createdAt', sortOrder === 'newest' ? 'desc' : 'asc'),
      limit(limitCount)
    );

    if (cursorDoc) {
      q = query(
        lettersRef,
        orderBy('createdAt', sortOrder === 'newest' ? 'desc' : 'asc'),
        startAfter(cursorDoc),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    const items: UserLetterRef[] = [];
    let lastDocSnap: QueryDocumentSnapshot<DocumentData> | null = null;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const { dateString, rawMs } = formatDate(data);
      items.push({
        id: docSnap.id,
        userId,
        title: data.title || 'Untitled Letter',
        content: data.content || '',
        createdAt: dateString,
        timestampRaw: rawMs,
      });
      lastDocSnap = docSnap;
    });

    return {
      items,
      lastDoc: lastDocSnap,
      hasMore: snapshot.docs.length === limitCount,
    };
  } catch (error) {
    handleFirestoreError(error, ReflectionOperationType.LIST, collectionPath, userId);
    return { items: [], lastDoc: null, hasMore: false };
  }
}
