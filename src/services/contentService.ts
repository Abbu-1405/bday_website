import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import {
  sampleNotes365,
  sampleWishes,
  sampleOpenWhenLetters,
  sampleSecrets,
  sampleAdoreItems,
  sampleMoments,
} from '../data';
import {
  Note365,
  Wish,
  OpenWhenLetter,
  SecretItem,
  AdoreItem,
  Moment,
} from '../types';

export type ContentCategory = 'notes' | 'wishes' | 'openWhen' | 'secrets' | 'adore' | 'moments';

export interface CategoryInfo {
  id: ContentCategory;
  title: string;
  description: string;
  totalCount: number;
}

export const CONTENT_CATEGORIES: CategoryInfo[] = [
  {
    id: 'notes',
    title: '365 Notes',
    description: 'Manage the daily reflection notes for the entire year.',
    totalCount: sampleNotes365.length,
  },
  {
    id: 'wishes',
    title: 'Wishes',
    description: 'Manage the 20 glowing lanterns and wishes.',
    totalCount: sampleWishes.length,
  },
  {
    id: 'openWhen',
    title: 'Open When',
    description: 'Manage the open-when personal envelopes.',
    totalCount: sampleOpenWhenLetters.length,
  },
  {
    id: 'secrets',
    title: 'Secrets',
    description: 'Manage hidden discoveries and vault notes.',
    totalCount: sampleSecrets.length,
  },
  {
    id: 'adore',
    title: 'Adore',
    description: 'Manage admiration items and heartfelt notes.',
    totalCount: sampleAdoreItems.length,
  },
  {
    id: 'moments',
    title: 'Moments',
    description: 'Manage cherished memory moments.',
    totalCount: sampleMoments.length,
  },
];

/**
 * Generic helper to fetch merged Firestore overrides with static fallback items
 */
export async function getMergedCategoryContent<T extends { id: string }>(
  category: ContentCategory,
  staticItems: T[]
): Promise<T[]> {
  if (!isFirebaseConfigured) return staticItems;

  try {
    const itemsRef = collection(db, 'content', category, 'items');
    const snapshot = await getDocs(itemsRef);

    if (snapshot.empty) {
      return staticItems;
    }

    const firestoreMap = new Map<string, DocumentData>();
    snapshot.forEach((docSnap) => {
      firestoreMap.set(docSnap.id, docSnap.data());
    });

    return staticItems.map((item) => {
      if (firestoreMap.has(item.id)) {
        const firestoreData = firestoreMap.get(item.id)!;
        return {
          ...item,
          ...firestoreData,
          id: item.id, // ID must remain stable
        };
      }
      return item;
    });
  } catch (err) {
    console.warn(`Error fetching content for category [${category}]:`, err);
    return staticItems;
  }
}

/**
 * Save / Update a content item in Firestore and record an Admin audit entry
 */
export async function saveContentItem(
  category: ContentCategory,
  itemId: string,
  updatedFields: Record<string, any>,
  adminUid: string
): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Cannot save content.');
  }

  try {
    const itemRef = doc(db, 'content', category, 'items', itemId);
    const payload = {
      ...updatedFields,
      updatedAt: serverTimestamp(),
      updatedBy: adminUid,
    };

    await setDoc(itemRef, payload, { merge: true });

    // Record Admin Audit metadata (isolated from user activity)
    try {
      const auditRef = doc(collection(db, 'adminMeta', 'audits', 'logs'));
      await setDoc(auditRef, {
        category,
        itemId,
        action: 'content_edit',
        adminUid,
        timestamp: serverTimestamp(),
      });
    } catch (auditErr) {
      console.warn('Failed to record admin audit log:', auditErr);
    }
  } catch (err) {
    console.error(`Error saving content item [${category}/${itemId}]:`, err);
    throw new Error('Failed to save content item to database.');
  }
}

// Category Specific Fetchers
export async function getManagedNotes365(): Promise<Note365[]> {
  return getMergedCategoryContent('notes', sampleNotes365);
}

export async function getManagedWishes(): Promise<Wish[]> {
  return getMergedCategoryContent('wishes', sampleWishes);
}

export async function getManagedOpenWhenLetters(): Promise<OpenWhenLetter[]> {
  return getMergedCategoryContent('openWhen', sampleOpenWhenLetters);
}

export async function getManagedSecrets(): Promise<SecretItem[]> {
  return getMergedCategoryContent('secrets', sampleSecrets);
}

export async function getManagedAdoreItems(): Promise<AdoreItem[]> {
  return getMergedCategoryContent('adore', sampleAdoreItems);
}

export async function getManagedMoments(): Promise<Moment[]> {
  return getMergedCategoryContent('moments', sampleMoments);
}
