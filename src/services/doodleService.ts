import { DoodleItem, DoodleSection, DoodleStroke } from '../types/doodle';
import {
  saveDoodleLocally,
  getLocalDoodles,
  getLocalDoodleById,
  deleteDoodleLocally,
} from './doodleLocalStorage';
import {
  saveDoodleToFirebase,
  fetchUserDoodlesFromFirebase,
  deleteDoodleFromFirebase,
} from './doodleFirebaseService';

export interface SaveDoodleResult {
  doodle: DoodleItem;
  savedLocally: boolean;
  savedToCloud: boolean;
  message: string;
}

/**
 * Generate a new unique doodle ID.
 */
export function generateDoodleId(): string {
  return 'doodle_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Unified save function:
 * 1. Saves to IndexedDB / local storage first (ensures user data is never lost).
 * 2. If user is authenticated, attempts to sync to Firebase.
 * 3. Gracefully reports status without throwing or crashing the UI.
 */
export async function saveDoodle(
  doodle: DoodleItem,
  userId?: string,
  userProfile?: { displayName?: string; email?: string; photoURL?: string }
): Promise<SaveDoodleResult> {
  const finalUserId = userId || doodle.userId || 'anonymous';
  const now = new Date().toISOString();

  const preparedDoodle: DoodleItem = {
    ...doodle,
    userId: finalUserId,
    createdAt: doodle.createdAt || now,
    updatedAt: now,
    userDisplayName: userProfile?.displayName || doodle.userDisplayName,
    userEmail: userProfile?.email || doodle.userEmail,
    userPhotoURL: userProfile?.photoURL || doodle.userPhotoURL,
  };

  let savedLocally = false;
  let savedToCloud = false;
  let message = 'Doodle saved successfully.';

  // 1. Always save to local IndexedDB
  try {
    await saveDoodleLocally(preparedDoodle);
    savedLocally = true;
  } catch (err) {
    console.warn('Failed to save doodle locally:', err);
  }

  // 2. If authenticated, attempt cloud save
  if (finalUserId && finalUserId !== 'anonymous') {
    try {
      await saveDoodleToFirebase(preparedDoodle, finalUserId);
      savedToCloud = true;
      preparedDoodle.syncedToCloud = true;
      // update local cache with synced flag
      await saveDoodleLocally(preparedDoodle);
      message = 'Preserved in your private sanctuary and cloud reflections.';
    } catch (err) {
      console.warn('Firebase doodle sync failed, kept locally:', err);
      message = 'Saved on this device. Cloud save couldn’t be completed.';
    }
  } else {
    message = 'Saved on this device. Sign in to preserve your doodles across devices.';
  }

  return {
    doodle: preparedDoodle,
    savedLocally,
    savedToCloud,
    message,
  };
}

/**
 * Fetch unified list of doodles for a user & section (merging local and cloud).
 */
export async function fetchUserDoodles(
  userId?: string,
  section?: DoodleSection
): Promise<DoodleItem[]> {
  const localDoodles = await getLocalDoodles(section, userId);

  if (!userId || userId === 'anonymous') {
    return localDoodles;
  }

  try {
    const cloudDoodles = await fetchUserDoodlesFromFirebase(userId, section);

    // Merge by id (cloud wins if newer, local retains offline edits)
    const map = new Map<string, DoodleItem>();

    // Add local first
    localDoodles.forEach((d) => map.set(d.id, d));

    // Add / update with cloud
    cloudDoodles.forEach((cloudItem) => {
      const existing = map.get(cloudItem.id);
      if (!existing || new Date(cloudItem.updatedAt) >= new Date(existing.updatedAt)) {
        map.set(cloudItem.id, cloudItem);
        // Cache to local
        saveDoodleLocally(cloudItem).catch(() => {});
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.warn('Failed to fetch cloud doodles, returning local cache:', err);
    return localDoodles;
  }
}

/**
 * Delete a doodle both locally and from Firebase.
 */
export async function deleteUserDoodle(
  doodleId: string,
  userId?: string
): Promise<void> {
  await deleteDoodleLocally(doodleId);

  if (userId && userId !== 'anonymous') {
    try {
      await deleteDoodleFromFirebase(userId, doodleId);
    } catch (err) {
      console.warn('Failed to delete doodle from Firebase:', err);
    }
  }
}

export * from './doodleLocalStorage';
export * from './doodleFirebaseService';
