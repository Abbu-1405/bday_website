import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

export interface AdminFeelingSubmission {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  timestampRaw?: any;
  userDisplayName?: string;
  userEmail?: string;
  userPhotoURL?: string;
  isRead: boolean;
}

export interface AdminLetterSubmission {
  id: string;
  userId: string;
  title?: string;
  content: string;
  createdAt: string;
  timestampRaw?: any;
  userDisplayName?: string;
  userEmail?: string;
  userPhotoURL?: string;
  isRead: boolean;
}

interface UserProfileMap {
  [uid: string]: {
    displayName?: string;
    email?: string;
    photoURL?: string;
  };
}

/**
 * Fetch a lookup map of user profiles for quick user metadata resolution.
 */
async function fetchUserProfilesMap(): Promise<UserProfileMap> {
  const map: UserProfileMap = {};
  if (!isFirebaseConfigured) return map;

  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    usersSnap.forEach((docSnap) => {
      const data = docSnap.data();
      map[docSnap.id] = {
        displayName: data.displayName || 'Anonymous User',
        email: data.email || 'No email',
        photoURL: data.photoURL || undefined,
      };
    });
  } catch (err) {
    console.warn('Error fetching user profile lookup map:', err);
  }
  return map;
}

/**
 * Fetch Admin read state map from adminMeta collection.
 */
async function fetchAdminReadStateSet(): Promise<Set<string>> {
  const readSet = new Set<string>();
  if (!isFirebaseConfigured) return readSet;

  try {
    const readsSnap = await getDocs(collection(db, 'adminMeta', 'reads', 'items'));
    readsSnap.forEach((docSnap) => {
      if (docSnap.data().read === true) {
        readSet.add(docSnap.id);
      }
    });
  } catch (err) {
    console.warn('Error fetching admin read states:', err);
  }
  return readSet;
}

/**
 * Mark a submission as read or unread in adminMeta/reads/items/{submissionId}.
 * Does NOT modify user submission document.
 */
export async function markSubmissionReadState(
  submissionId: string,
  isRead: boolean,
  adminUid: string
): Promise<void> {
  if (!isFirebaseConfigured || !submissionId) return;

  try {
    const itemRef = doc(db, 'adminMeta', 'reads', 'items', submissionId);
    await setDoc(
      itemRef,
      {
        read: isRead,
        readAt: serverTimestamp(),
        adminUid,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Error updating admin read state:', err);
    throw new Error('Failed to update submission read state.');
  }
}

/**
 * Fetch feelings submissions for Admin inbox.
 */
export async function fetchAdminFeelings(
  filter: 'all' | 'unread' | 'read' = 'all',
  sortOrder: 'newest' | 'oldest' = 'newest',
  searchTerm: string = '',
  maxCount: number = 20
): Promise<AdminFeelingSubmission[]> {
  if (!isFirebaseConfigured) return [];

  try {
    const [userProfiles, readStates] = await Promise.all([
      fetchUserProfilesMap(),
      fetchAdminReadStateSet(),
    ]);

    const feelingsRef = collectionGroup(db, 'feelings');
    const q = query(feelingsRef, limit(maxCount * 3));
    const snapshot = await getDocs(q);

    const items: AdminFeelingSubmission[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      const id = docSnap.id;
      const uid = data.userId || 'unknown';
      const isRead = readStates.has(id);

      // Filter read/unread
      if (filter === 'read' && !isRead) return;
      if (filter === 'unread' && isRead) return;

      const user = userProfiles[uid] || {};
      const displayName = user.displayName || 'Anonymous User';
      const email = user.email || '';

      // Search matching (by display name, email)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = displayName.toLowerCase().includes(term);
        const matchesEmail = email.toLowerCase().includes(term);
        if (!matchesName && !matchesEmail) return;
      }

      let dateString = 'Recently';
      let rawMs = 0;
      if (data.createdAt?.toDate) {
        const d = data.createdAt.toDate();
        rawMs = d.getTime();
        dateString = d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (data.createdAt?.seconds) {
        rawMs = data.createdAt.seconds * 1000;
        dateString = new Date(rawMs).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      items.push({
        id,
        userId: uid,
        content: data.content || '',
        createdAt: dateString,
        timestampRaw: rawMs,
        userDisplayName: displayName,
        userEmail: email,
        userPhotoURL: user.photoURL,
        isRead,
      });
    });

    // Sort newest/oldest
    items.sort((a, b) => {
      return sortOrder === 'newest'
        ? (b.timestampRaw || 0) - (a.timestampRaw || 0)
        : (a.timestampRaw || 0) - (b.timestampRaw || 0);
    });

    return items.slice(0, maxCount);
  } catch (err) {
    console.warn('Error fetching admin feelings:', err);
    return [];
  }
}

/**
 * Fetch written letters submissions for Admin inbox.
 */
export async function fetchAdminLetters(
  filter: 'all' | 'unread' | 'read' = 'all',
  sortOrder: 'newest' | 'oldest' = 'newest',
  searchTerm: string = '',
  maxCount: number = 20
): Promise<AdminLetterSubmission[]> {
  if (!isFirebaseConfigured) return [];

  try {
    const [userProfiles, readStates] = await Promise.all([
      fetchUserProfilesMap(),
      fetchAdminReadStateSet(),
    ]);

    const lettersRef = collectionGroup(db, 'letters');
    const q = query(lettersRef, limit(maxCount * 3));
    const snapshot = await getDocs(q);

    const items: AdminLetterSubmission[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      const id = docSnap.id;
      const uid = data.userId || 'unknown';
      const isRead = readStates.has(id);

      // Filter read/unread
      if (filter === 'read' && !isRead) return;
      if (filter === 'unread' && isRead) return;

      const user = userProfiles[uid] || {};
      const displayName = user.displayName || 'Anonymous User';
      const email = user.email || '';
      const title = data.title || 'Untitled Letter';

      // Search matching (by display name, email, letter title)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = displayName.toLowerCase().includes(term);
        const matchesEmail = email.toLowerCase().includes(term);
        const matchesTitle = title.toLowerCase().includes(term);
        if (!matchesName && !matchesEmail && !matchesTitle) return;
      }

      let dateString = 'Recently';
      let rawMs = 0;
      if (data.createdAt?.toDate) {
        const d = data.createdAt.toDate();
        rawMs = d.getTime();
        dateString = d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (data.createdAt?.seconds) {
        rawMs = data.createdAt.seconds * 1000;
        dateString = new Date(rawMs).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      items.push({
        id,
        userId: uid,
        title,
        content: data.content || '',
        createdAt: dateString,
        timestampRaw: rawMs,
        userDisplayName: displayName,
        userEmail: email,
        userPhotoURL: user.photoURL,
        isRead,
      });
    });

    // Sort newest/oldest
    items.sort((a, b) => {
      return sortOrder === 'newest'
        ? (b.timestampRaw || 0) - (a.timestampRaw || 0)
        : (a.timestampRaw || 0) - (b.timestampRaw || 0);
    });

    return items.slice(0, maxCount);
  } catch (err) {
    console.warn('Error fetching admin letters:', err);
    return [];
  }
}
