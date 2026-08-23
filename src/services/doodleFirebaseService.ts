import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { DoodleItem, DoodleSection } from '../types/doodle';

/**
 * Save or update a doodle in the authenticated user's Firestore sub-collection:
 * users/{userId}/doodles/{doodleId}
 */
export async function saveDoodleToFirebase(
  doodle: DoodleItem,
  userId: string
): Promise<void> {
  if (!isFirebaseConfigured || !userId || userId === 'anonymous') {
    throw new Error('Cloud save requires authentication and Firebase configuration.');
  }

  const doodleDocRef = doc(db, 'users', userId, 'doodles', doodle.id);

  const payload: DocumentData = {
    id: doodle.id,
    userId: userId,
    section: doodle.section,
    title: doodle.title || 'Untitled Doodle',
    strokes: doodle.strokes || [],
    thumbnailDataUrl: doodle.thumbnailDataUrl || '',
    canvasWidth: doodle.canvasWidth || 600,
    canvasHeight: doodle.canvasHeight || 450,
    createdAt: doodle.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userDisplayName: doodle.userDisplayName || null,
    userEmail: doodle.userEmail || null,
    userPhotoURL: doodle.userPhotoURL || null,
    serverTimestamp: serverTimestamp(),
  };

  await setDoc(doodleDocRef, payload, { merge: true });
}

/**
 * Fetch doodles for a specific authenticated user, optionally filtered by section.
 */
export async function fetchUserDoodlesFromFirebase(
  userId: string,
  section?: DoodleSection
): Promise<DoodleItem[]> {
  if (!isFirebaseConfigured || !userId || userId === 'anonymous') {
    return [];
  }

  try {
    const doodlesCollRef = collection(db, 'users', userId, 'doodles');
    let q = query(doodlesCollRef, orderBy('createdAt', 'desc'));

    if (section) {
      q = query(doodlesCollRef, where('section', '==', section), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const results: DoodleItem[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({
        id: docSnap.id,
        userId: data.userId || userId,
        section: data.section || 'what-am-i-to-you',
        title: data.title || 'Untitled Doodle',
        strokes: data.strokes || [],
        thumbnailDataUrl: data.thumbnailDataUrl || '',
        canvasWidth: data.canvasWidth,
        canvasHeight: data.canvasHeight,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        userDisplayName: data.userDisplayName,
        userEmail: data.userEmail,
        userPhotoURL: data.userPhotoURL,
        syncedToCloud: true,
      });
    });

    return results;
  } catch (err) {
    console.warn('Error fetching user doodles from Firebase:', err);
    return [];
  }
}

/**
 * Delete a user's doodle from Firebase.
 */
export async function deleteDoodleFromFirebase(
  userId: string,
  doodleId: string
): Promise<void> {
  if (!isFirebaseConfigured || !userId || !doodleId) {
    return;
  }

  const doodleDocRef = doc(db, 'users', userId, 'doodles', doodleId);
  await deleteDoc(doodleDocRef);
}

/**
 * Admin view: Fetch all doodles across all users using a collection group query.
 */
export async function fetchAdminDoodles(
  section?: DoodleSection,
  limitCount: number = 50
): Promise<DoodleItem[]> {
  if (!isFirebaseConfigured) return [];

  try {
    // 1. Fetch user lookup map
    const userMap: Record<string, { displayName?: string; email?: string; photoURL?: string }> = {};
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach((d) => {
        const u = d.data();
        userMap[d.id] = {
          displayName: u.displayName || 'Anonymous User',
          email: u.email || 'No email',
          photoURL: u.photoURL,
        };
      });
    } catch (e) {
      console.warn('Failed to load user lookup in admin doodles:', e);
    }

    // 2. Query collection group
    const doodlesGroup = collectionGroup(db, 'doodles');
    let q = query(doodlesGroup, orderBy('createdAt', 'desc'), limit(limitCount));

    if (section) {
      q = query(
        doodlesGroup,
        where('section', '==', section),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    const results: DoodleItem[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const uid = data.userId || 'unknown';
      const userProfile = userMap[uid];

      results.push({
        id: docSnap.id,
        userId: uid,
        section: data.section || 'what-am-i-to-you',
        title: data.title || 'Untitled Doodle',
        strokes: data.strokes || [],
        thumbnailDataUrl: data.thumbnailDataUrl || '',
        canvasWidth: data.canvasWidth,
        canvasHeight: data.canvasHeight,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        userDisplayName: data.userDisplayName || userProfile?.displayName || 'Quiet Traveler',
        userEmail: data.userEmail || userProfile?.email,
        userPhotoURL: data.userPhotoURL || userProfile?.photoURL,
        syncedToCloud: true,
      });
    });

    return results;
  } catch (err) {
    console.warn('Error querying admin doodles collection group:', err);
    return [];
  }
}
