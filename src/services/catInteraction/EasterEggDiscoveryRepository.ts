import {
  collection,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../../firebase';
import { EasterEggDiscovery } from '../../types/catMeme';

const GUEST_STORAGE_KEY = 'starlit_cat_easter_eggs_guest';

export type EasterEggChangeListener = (
  discoveries: Record<string, EasterEggDiscovery>
) => void;

/**
 * Phase 8: Repository for Easter Egg discovery records.
 * Manages Firestore persistence for authenticated users and local persistence for guests.
 * Guarantees auth boundary isolation and prevents duplicate discovery records.
 */
export class EasterEggDiscoveryRepository {
  private static instance: EasterEggDiscoveryRepository | null = null;

  private inMemoryCache: Map<string, EasterEggDiscovery> = new Map();
  private currentUserId: string | null = null;
  private listeners: Set<EasterEggChangeListener> = new Set();
  private isInitialized = false;
  private authUnsubscribe: (() => void) | null = null;

  private constructor() {
    this.initAuthListener();
  }

  public static getInstance(): EasterEggDiscoveryRepository {
    if (!EasterEggDiscoveryRepository.instance) {
      EasterEggDiscoveryRepository.instance = new EasterEggDiscoveryRepository();
    }
    return EasterEggDiscoveryRepository.instance;
  }

  /**
   * Initializes the Firebase Auth state observer to isolate user discovery sessions.
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
              await this.loadUserDiscoveriesFromFirestore(newUid);
            } else {
              this.loadGuestDiscoveries();
            }

            this.notifyListeners();
          }
        });
      } else {
        this.loadGuestDiscoveries();
      }
    } catch (err) {
      console.warn('[EasterEggDiscoveryRepository] Auth observer warning:', err);
      this.loadGuestDiscoveries();
    }
    this.isInitialized = true;
  }

  /**
   * Loads discovered Easter eggs from Firestore for the authenticated user.
   */
  private async loadUserDiscoveriesFromFirestore(userId: string): Promise<void> {
    if (!isFirebaseConfigured || !db || !userId) {
      this.loadGuestDiscoveries();
      return;
    }

    try {
      const colRef = collection(db, 'users', userId, 'catEasterEggDiscoveries');
      const snapshot = await getDocs(colRef);

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as EasterEggDiscovery;
        if (data && data.eggId) {
          this.inMemoryCache.set(data.eggId, data);
        }
      });
    } catch (err) {
      console.warn('[EasterEggDiscoveryRepository] Firestore load warning:', err);
      this.loadGuestDiscoveries();
    }
  }

  /**
   * Loads discovered Easter eggs from local storage for guest / offline mode.
   */
  private loadGuestDiscoveries(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(GUEST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, EasterEggDiscovery>;
        Object.entries(parsed).forEach(([eggId, discovery]) => {
          this.inMemoryCache.set(eggId, discovery);
        });
      }
    } catch (err) {
      console.warn('[EasterEggDiscoveryRepository] Guest storage parse error:', err);
    }
  }

  /**
   * Saves guest discoveries to local storage.
   */
  private saveGuestDiscoveries(): void {
    if (typeof window === 'undefined') return;
    try {
      const record: Record<string, EasterEggDiscovery> = {};
      this.inMemoryCache.forEach((val, key) => {
        record[key] = val;
      });
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(record));
    } catch (err) {
      console.warn('[EasterEggDiscoveryRepository] Guest save error:', err);
    }
  }

  /**
   * Returns all cached discoveries as a dictionary mapped by egg ID.
   */
  public getAllDiscoveries(): Record<string, EasterEggDiscovery> {
    const result: Record<string, EasterEggDiscovery> = {};
    this.inMemoryCache.forEach((val, key) => {
      result[key] = { ...val };
    });
    return result;
  }

  /**
   * Checks if an Easter egg has already been discovered by the current user.
   */
  public isDiscovered(eggId: string): boolean {
    return this.inMemoryCache.has(eggId);
  }

  /**
   * Retrieves a specific discovery record if present.
   */
  public getDiscovery(eggId: string): EasterEggDiscovery | undefined {
    const d = this.inMemoryCache.get(eggId);
    return d ? { ...d } : undefined;
  }

  /**
   * Records a new discovery. Guarantees idempotency — if the egg has already
   * been discovered, it returns false and skips duplicate persistence.
   */
  public async recordDiscovery(
    eggId: string,
    catId: string
  ): Promise<boolean> {
    if (this.inMemoryCache.has(eggId)) {
      return false; // Already discovered, no duplicate record created
    }

    const discovery: EasterEggDiscovery = {
      eggId,
      catId,
      discoveredAt: new Date().toISOString(),
      version: 1,
    };

    // 1. Update in-memory cache immediately
    this.inMemoryCache.set(eggId, discovery);
    this.notifyListeners();

    // 2. Persist to Firestore or localStorage
    if (this.currentUserId && isFirebaseConfigured && db) {
      try {
        const docRef = doc(
          db,
          'users',
          this.currentUserId,
          'catEasterEggDiscoveries',
          eggId
        );
        await setDoc(docRef, discovery, { merge: true });
      } catch (err) {
        console.warn('[EasterEggDiscoveryRepository] Firestore write error:', err);
        this.saveGuestDiscoveries();
      }
    } else {
      this.saveGuestDiscoveries();
    }

    return true; // Newly discovered
  }

  /**
   * Subscribes a listener to discovery state changes.
   */
  public subscribe(listener: EasterEggChangeListener): () => void {
    this.listeners.add(listener);
    listener(this.getAllDiscoveries());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const all = this.getAllDiscoveries();
    this.listeners.forEach((listener) => {
      try {
        listener(all);
      } catch (err) {
        console.warn('[EasterEggDiscoveryRepository] Listener error:', err);
      }
    });
  }

  /**
   * Cleanup method for testing or theme deactivation.
   */
  public cleanup(): void {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
      this.authUnsubscribe = null;
    }
    this.listeners.clear();
    this.inMemoryCache.clear();
  }
}
