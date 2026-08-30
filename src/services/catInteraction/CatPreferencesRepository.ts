import {
  collection,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../../firebase';
import { UserCatPreferences } from '../../types/catMeme';
import { FAMOUS_CAT_REGISTRY } from './catRegistry';

export type PreferencesChangeListener = (
  preferences: Record<string, UserCatPreferences>
) => void;

/**
 * Repository and in-memory cache for user-owned cat customization preferences.
 * Implements Firestore persistence with offline/guest session fallback and multi-device synchronization.
 */
export class CatPreferencesRepository {
  private static instance: CatPreferencesRepository | null = null;

  private inMemoryCache: Map<string, UserCatPreferences> = new Map();
  private pendingWriteTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private currentUserId: string | null = null;
  private listeners: Set<PreferencesChangeListener> = new Set();
  private isInitialized = false;
  private authUnsubscribe: (() => void) | null = null;

  private constructor() {
    this.initAuthListener();
  }

  public static getInstance(): CatPreferencesRepository {
    if (!CatPreferencesRepository.instance) {
      CatPreferencesRepository.instance = new CatPreferencesRepository();
    }
    return CatPreferencesRepository.instance;
  }

  /**
   * Initializes Firebase Auth observer to switch user contexts safely.
   */
  private initAuthListener(): void {
    try {
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        this.authUnsubscribe = auth.onAuthStateChanged(async (user) => {
          const newUid = user ? user.uid : null;
          if (newUid !== this.currentUserId) {
            this.currentUserId = newUid;
            this.inMemoryCache.clear();
            if (newUid) {
              await this.loadUserPreferencesFromFirestore(newUid);
            }
            this.notifyListeners();
          }
        });
      }
    } catch (err) {
      console.warn('[CatPreferencesRepository] Auth observer notice:', err);
    }
    this.isInitialized = true;
  }

  /**
   * Loads all cat preference records for the authenticated user from Firestore.
   */
  private async loadUserPreferencesFromFirestore(userId: string): Promise<void> {
    if (!isFirebaseConfigured || !db || !userId) return;

    try {
      const colRef = collection(db, 'users', userId, 'catPreferences');
      const snapshot = await getDocs(colRef);

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserCatPreferences;
        if (data && data.catId) {
          // Enforce legendary cat cannot be hidden
          const catDef = FAMOUS_CAT_REGISTRY[data.catId];
          const isLegendary = catDef?.rarity === 'legendary';
          const safeData: UserCatPreferences = {
            ...data,
            hidden: isLegendary ? false : Boolean(data.hidden),
          };
          this.inMemoryCache.set(data.catId, safeData);
        }
      });
    } catch (err) {
      console.warn('[CatPreferencesRepository] Could not load preferences from Firestore:', err);
    }
  }

  /**
   * Creates a clean default preferences object for a cat.
   */
  private createDefaultPreferences(
    catId: string,
    userId: string = 'guest-session'
  ): UserCatPreferences {
    return {
      catId,
      userId,
      customName: null,
      hidden: false,
      interactions: {
        petEnabled: true,
        treatEnabled: true,
        shooEnabled: true,
      },
      updatedAt: new Date().toISOString(),
      version: 1,
    };
  }

  /**
   * Retrieves preferences for a specific cat.
   */
  public getPreference(catId: string): UserCatPreferences {
    const effectiveUserId = this.currentUserId || 'guest-session';
    const cached = this.inMemoryCache.get(catId);
    if (cached) {
      return cached;
    }
    const defaultPref = this.createDefaultPreferences(catId, effectiveUserId);
    this.inMemoryCache.set(catId, defaultPref);
    return defaultPref;
  }

  /**
   * Retrieves all known cat preferences.
   */
  public getAllPreferences(): Record<string, UserCatPreferences> {
    const result: Record<string, UserCatPreferences> = {};
    for (const catId of Object.keys(FAMOUS_CAT_REGISTRY)) {
      result[catId] = this.getPreference(catId);
    }
    return result;
  }

  /**
   * Updates cat preferences with immediate local cache application and Firestore persistence.
   */
  public async updatePreference(
    catId: string,
    partial: Partial<UserCatPreferences>
  ): Promise<UserCatPreferences> {
    const current = this.getPreference(catId);
    const catDef = FAMOUS_CAT_REGISTRY[catId];
    const isLegendary = catDef?.rarity === 'legendary';

    // Prevent hiding legendary cats
    const nextHidden = isLegendary ? false : partial.hidden !== undefined ? partial.hidden : current.hidden;

    // Merge interactions
    const nextInteractions = {
      ...current.interactions,
      ...(partial.interactions || {}),
    };

    const nextCustomName =
      partial.customName !== undefined ? partial.customName : current.customName;

    const now = new Date().toISOString();

    const updated: UserCatPreferences = {
      ...current,
      ...partial,
      catId,
      userId: this.currentUserId || 'guest-session',
      customName: nextCustomName,
      hidden: nextHidden,
      interactions: nextInteractions,
      updatedAt: now,
      version: (current.version || 1) + 1,
    };

    this.inMemoryCache.set(catId, updated);
    this.notifyListeners();

    // Persist to Firestore if authenticated
    await this.persistToFirestore(updated);

    return updated;
  }

  /**
   * Persists preferences to Firestore under `users/{userId}/catPreferences/{catId}`.
   */
  private async persistToFirestore(preferences: UserCatPreferences): Promise<void> {
    if (!isFirebaseConfigured || !db || !this.currentUserId) return;

    try {
      const docRef = doc(db, 'users', this.currentUserId, 'catPreferences', preferences.catId);
      await setDoc(docRef, { ...preferences, userId: this.currentUserId }, { merge: true });
    } catch (err) {
      console.warn(`[CatPreferencesRepository] Failed to persist preferences for ${preferences.catId}:`, err);
    }
  }

  /**
   * Subscribes to preference changes.
   */
  public subscribe(listener: PreferencesChangeListener): () => void {
    this.listeners.add(listener);
    // Initial emit
    listener(this.getAllPreferences());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const all = this.getAllPreferences();
    this.listeners.forEach((listener) => {
      try {
        listener(all);
      } catch (err) {
        console.error('[CatPreferencesRepository] Listener notification error:', err);
      }
    });
  }

  /**
   * Clean up background listeners on application teardown.
   */
  public destroy(): void {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
      this.authUnsubscribe = null;
    }
    this.pendingWriteTimers.forEach((timer) => clearTimeout(timer));
    this.pendingWriteTimers.clear();
    this.listeners.clear();
    this.inMemoryCache.clear();
  }
}
