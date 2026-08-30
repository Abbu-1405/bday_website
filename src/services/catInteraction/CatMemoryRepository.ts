import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../../firebase';
import { UserCatMemory } from '../../types/catMeme';
import { FAMOUS_CAT_REGISTRY } from './catRegistry';
import {
  checkNewMilestones,
  deriveRelationshipState,
  getLevelForPoints,
  getUnlockedBehaviorsForPoints,
  RELATIONSHIP_POINTS,
} from './CatRelationshipScorer';

export type MemoryChangeListener = (memories: Record<string, UserCatMemory>) => void;

/**
 * Repository and in-memory cache for user cat memories and relationships.
 * Implements Firestore persistence with offline/guest session fallback and debounced writes.
 */
export class CatMemoryRepository {
  private static instance: CatMemoryRepository | null = null;

  private inMemoryCache: Map<string, UserCatMemory> = new Map();
  private pendingWriteTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private currentUserId: string | null = null;
  private listeners: Set<MemoryChangeListener> = new Set();
  private isInitialized = false;
  private authUnsubscribe: (() => void) | null = null;

  private constructor() {
    this.initAuthListener();
  }

  public static getInstance(): CatMemoryRepository {
    if (!CatMemoryRepository.instance) {
      CatMemoryRepository.instance = new CatMemoryRepository();
    }
    return CatMemoryRepository.instance;
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
              await this.loadUserMemoriesFromFirestore(newUid);
            }
            this.notifyListeners();
          }
        });
      }
    } catch (err) {
      console.warn('[CatMemoryRepository] Auth observer notice:', err);
    }
    this.isInitialized = true;
  }

  /**
   * Loads all cat memory records for the authenticated user from Firestore.
   */
  private async loadUserMemoriesFromFirestore(userId: string): Promise<void> {
    if (!isFirebaseConfigured || !db || !userId) return;

    try {
      const colRef = collection(db, 'users', userId, 'catMemories');
      const snapshot = await getDocs(colRef);

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserCatMemory;
        if (data && data.catId) {
          this.inMemoryCache.set(data.catId, data);
        }
      });
    } catch (err) {
      console.warn('[CatMemoryRepository] Could not load cat memories from Firestore:', err);
    }
  }

  /**
   * Creates a clean default memory object for a cat.
   */
  private createDefaultMemory(catId: string, userId: string = 'guest-session'): UserCatMemory {
    const catDef = FAMOUS_CAT_REGISTRY[catId] || FAMOUS_CAT_REGISTRY['orange-one-brain-cell'];
    const now = new Date().toISOString();
    const defaultLevel = getLevelForPoints(catDef, 0);

    return {
      catId,
      userId,
      relationshipPoints: 0,
      relationshipLevel: defaultLevel.level,
      relationshipLevelName: defaultLevel.name,
      encounterCount: 0,
      meaningfulInteractionCount: 0,
      firstSeenAt: now,
      lastSeenAt: now,
      lastInteractionAt: now,
      milestoneHistory: [],
      memorableInteractionReferences: [],
      relationshipState: 'stranger',
      unlockedBehaviors: defaultLevel.unlockedBehaviors || [],
      version: 1,
    };
  }

  /**
   * Retrieves a single cat's memory from cache or default.
   */
  public getMemory(catId: string): UserCatMemory {
    const effectiveUserId = this.currentUserId || 'guest-session';
    const cached = this.inMemoryCache.get(catId);
    if (cached) {
      return cached;
    }
    const defaultMem = this.createDefaultMemory(catId, effectiveUserId);
    this.inMemoryCache.set(catId, defaultMem);
    return defaultMem;
  }

  /**
   * Retrieves all known cat memories from cache.
   */
  public getAllMemories(): Record<string, UserCatMemory> {
    const result: Record<string, UserCatMemory> = {};
    for (const catId of Object.keys(FAMOUS_CAT_REGISTRY)) {
      result[catId] = this.getMemory(catId);
    }
    return result;
  }

  /**
   * Records a visible cat encounter (seeing a cat spawn on screen).
   * Uses debounced Firestore persistence to minimize write load.
   */
  public recordEncounter(catId: string): UserCatMemory {
    const catDef = FAMOUS_CAT_REGISTRY[catId] || FAMOUS_CAT_REGISTRY['orange-one-brain-cell'];
    const current = this.getMemory(catId);
    const now = new Date().toISOString();

    const nextPoints = current.relationshipPoints + RELATIONSHIP_POINTS.ENCOUNTER_VISIBLE;
    const nextEncounters = current.encounterCount + 1;
    const nextLvl = getLevelForPoints(catDef, nextPoints);
    const unlockedBehaviors = getUnlockedBehaviorsForPoints(catDef, nextPoints);
    const newMilestones = checkNewMilestones(
      catDef,
      current,
      nextPoints,
      nextEncounters,
      current.meaningfulInteractionCount
    );

    const updated: UserCatMemory = {
      ...current,
      relationshipPoints: nextPoints,
      relationshipLevel: nextLvl.level,
      relationshipLevelName: nextLvl.name,
      encounterCount: nextEncounters,
      lastSeenAt: now,
      milestoneHistory: [...current.milestoneHistory, ...newMilestones],
      unlockedBehaviors,
      relationshipState: deriveRelationshipState(nextLvl.level, nextPoints),
    };

    this.inMemoryCache.set(catId, updated);
    this.notifyListeners();
    this.scheduleDebouncedWrite(updated);

    return updated;
  }

  /**
   * Records a meaningful interaction (letter sent, secret opened, pet, dismiss, etc.).
   * Performs immediate persistence for high reliability.
   */
  public async recordInteraction(
    catId: string,
    options: {
      eventType: string;
      impactPoints: number;
      significance: 'minor' | 'meaningful' | 'major';
      summary: string;
      isDispleased?: boolean;
    }
  ): Promise<UserCatMemory> {
    const catDef = FAMOUS_CAT_REGISTRY[catId] || FAMOUS_CAT_REGISTRY['orange-one-brain-cell'];
    const current = this.getMemory(catId);
    const now = new Date().toISOString();

    const nextPoints = Math.max(0, current.relationshipPoints + options.impactPoints);
    const nextMeaningful =
      options.significance === 'meaningful' || options.significance === 'major'
        ? current.meaningfulInteractionCount + 1
        : current.meaningfulInteractionCount;

    const nextLvl = getLevelForPoints(catDef, nextPoints);
    const unlockedBehaviors = getUnlockedBehaviorsForPoints(catDef, nextPoints);
    const newMilestones = checkNewMilestones(
      catDef,
      current,
      nextPoints,
      current.encounterCount,
      nextMeaningful
    );

    const newInteractionRecord = {
      eventId: `event-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      eventType: options.eventType,
      impactPoints: options.impactPoints,
      significance: options.significance,
      summary: options.summary,
    };

    // Keep last 15 memorable interaction references
    const memorableReferences = [
      newInteractionRecord,
      ...current.memorableInteractionReferences,
    ].slice(0, 15);

    const updated: UserCatMemory = {
      ...current,
      relationshipPoints: nextPoints,
      relationshipLevel: nextLvl.level,
      relationshipLevelName: nextLvl.name,
      meaningfulInteractionCount: nextMeaningful,
      lastInteractionAt: now,
      lastSeenAt: now,
      milestoneHistory: [...current.milestoneHistory, ...newMilestones],
      memorableInteractionReferences: memorableReferences,
      unlockedBehaviors,
      relationshipState: deriveRelationshipState(nextLvl.level, nextPoints, options.isDispleased),
    };

    this.inMemoryCache.set(catId, updated);
    this.notifyListeners();

    // Cancel any pending debounced writes for this cat and persist immediately
    this.cancelDebouncedWrite(catId);
    await this.persistToFirestore(updated);

    return updated;
  }

  /**
   * Debounces Firestore writes for frequent events (e.g. passive encounters).
   */
  private scheduleDebouncedWrite(memory: UserCatMemory): void {
    if (!this.currentUserId || !isFirebaseConfigured) return;

    this.cancelDebouncedWrite(memory.catId);

    const timer = setTimeout(async () => {
      this.pendingWriteTimers.delete(memory.catId);
      await this.persistToFirestore(memory);
    }, 4000);

    this.pendingWriteTimers.set(memory.catId, timer);
  }

  private cancelDebouncedWrite(catId: string): void {
    const existing = this.pendingWriteTimers.get(catId);
    if (existing) {
      clearTimeout(existing);
      this.pendingWriteTimers.delete(catId);
    }
  }

  /**
   * Persists a cat memory record into Firestore `users/{userId}/catMemories/{catId}`.
   */
  private async persistToFirestore(memory: UserCatMemory): Promise<void> {
    if (!isFirebaseConfigured || !db || !this.currentUserId) return;

    try {
      const docRef = doc(db, 'users', this.currentUserId, 'catMemories', memory.catId);
      await setDoc(docRef, { ...memory, userId: this.currentUserId }, { merge: true });
    } catch (err) {
      console.warn(`[CatMemoryRepository] Failed to persist memory for ${memory.catId}:`, err);
    }
  }

  /**
   * Subscribe to memory cache updates.
   */
  public subscribe(listener: MemoryChangeListener): () => void {
    this.listeners.add(listener);
    // Initial emit
    listener(this.getAllMemories());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const all = this.getAllMemories();
    this.listeners.forEach((listener) => {
      try {
        listener(all);
      } catch (err) {
        console.error('[CatMemoryRepository] Listener notification error:', err);
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
