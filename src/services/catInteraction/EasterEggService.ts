import {
  ActiveEasterEggEvent,
  EasterEggDefinition,
  EasterEggDiscovery,
  EasterEggTriggerAction,
} from '../../types/catMeme';
import { CatAudioService } from './CatAudioService';
import { CatCustomizationService } from './CatCustomizationService';
import { EasterEggDiscoveryRepository } from './EasterEggDiscoveryRepository';
import {
  findMatchingEasterEgg,
  getEasterEgg,
} from './easterEggRegistry';

export interface EasterEggToastPayload {
  eggId: string;
  title: string;
  catDisplayName: string;
  caption: string;
}

export type EasterEggToastListener = (payload: EasterEggToastPayload) => void;
export type ActiveEasterEggEventListener = (
  activeEvents: Map<string, ActiveEasterEggEvent>
) => void;

/**
 * Phase 8: Central Coordinator Service for Easter Eggs & Hidden Events.
 * Coordinates trigger evaluation, animation lifecycles, first-discovery notifications,
 * audio integration, and combination event handling.
 */
export class EasterEggService {
  private static instance: EasterEggService | null = null;

  private repository = EasterEggDiscoveryRepository.getInstance();
  private activeEvents: Map<string, ActiveEasterEggEvent> = new Map();
  private lastTriggerTimeByEgg: Map<string, number> = new Map();
  private toastListeners: Set<EasterEggToastListener> = new Set();
  private activeEventListeners: Set<ActiveEasterEggEventListener> = new Set();
  private activeScreenCatIds: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): EasterEggService {
    if (!EasterEggService.instance) {
      EasterEggService.instance = new EasterEggService();
    }
    return EasterEggService.instance;
  }

  /**
   * Tracks currently active cat definitions on the screen (used for combination eggs).
   */
  public updateActiveScreenCats(catDefinitionIds: string[]): void {
    this.activeScreenCatIds = new Set(catDefinitionIds);
  }

  /**
   * Evaluates if a user action (pet/treat/shoo) on a given cat triggers an Easter egg.
   * Returns the triggered EasterEggDefinition if one executed, or null.
   */
  public async evaluateAction(
    catId: string,
    action: EasterEggTriggerAction,
    catDisplayName: string
  ): Promise<EasterEggDefinition | null> {
    // 1. Verify cat is not hidden in preferences
    const pref = CatCustomizationService.getPreference(catId);
    if (pref?.hidden) {
      return null;
    }

    // 2. Find matching egg (single-cat or combination)
    const activeList = Array.from(this.activeScreenCatIds);
    const egg = findMatchingEasterEgg(catId, action, activeList);

    if (!egg || !egg.enabled) {
      return null;
    }

    // 3. Check per-egg cooldown (4 seconds to prevent runaway rapid spam while remaining repeatable)
    const now = Date.now();
    const lastTrigger = this.lastTriggerTimeByEgg.get(egg.id) || 0;
    if (now - lastTrigger < 4000) {
      return null;
    }
    this.lastTriggerTimeByEgg.set(egg.id, now);

    // 4. Trigger active animation event
    const durationMs = 2800;
    const activeEvent: ActiveEasterEggEvent = {
      eggId: egg.id,
      catId,
      definition: egg,
      startedAt: now,
      durationMs,
      companionCatId: egg.isCombination
        ? egg.catIds.find((id) => id !== catId)
        : undefined,
    };

    this.activeEvents.set(catId, activeEvent);
    this.notifyActiveEventListeners();

    // Auto-clear active animation after duration
    setTimeout(() => {
      if (this.activeEvents.get(catId)?.startedAt === now) {
        this.activeEvents.delete(catId);
        this.notifyActiveEventListeners();
      }
    }, durationMs);

    // 5. Play optional procedural sound if configured
    try {
      if (egg.soundId) {
        CatAudioService.getInstance().playSignatureSound(catId, 1, 'high');
      }
    } catch {
      // Fail silently
    }

    // 6. Record discovery (idempotent — returns true only on first discovery)
    try {
      const isFirstDiscovery = await this.repository.recordDiscovery(egg.id, catId);
      if (isFirstDiscovery) {
        this.notifyToastListeners({
          eggId: egg.id,
          title: egg.title,
          catDisplayName,
          caption: egg.caption,
        });
      }
    } catch (err) {
      console.warn('[EasterEggService] Discovery recording warning:', err);
    }

    return egg;
  }

  /**
   * Retrieves active Easter egg animation for a specific cat instance.
   */
  public getActiveEventForCat(catId: string): ActiveEasterEggEvent | undefined {
    return this.activeEvents.get(catId);
  }

  /**
   * Checks if an egg is already discovered.
   */
  public isDiscovered(eggId: string): boolean {
    return this.repository.isDiscovered(eggId);
  }

  /**
   * Gets all discovery records.
   */
  public getAllDiscoveries(): Record<string, EasterEggDiscovery> {
    return this.repository.getAllDiscoveries();
  }

  /**
   * Subscribes to first-discovery toast events.
   */
  public subscribeToast(listener: EasterEggToastListener): () => void {
    this.toastListeners.add(listener);
    return () => {
      this.toastListeners.delete(listener);
    };
  }

  /**
   * Subscribes to active animation events.
   */
  public subscribeActiveEvents(listener: ActiveEasterEggEventListener): () => void {
    this.activeEventListeners.add(listener);
    listener(new Map(this.activeEvents));
    return () => {
      this.activeEventListeners.delete(listener);
    };
  }

  private notifyToastListeners(payload: EasterEggToastPayload): void {
    this.toastListeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.warn('[EasterEggService] Toast listener error:', err);
      }
    });
  }

  private notifyActiveEventListeners(): void {
    const copy = new Map(this.activeEvents);
    this.activeEventListeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (err) {
        console.warn('[EasterEggService] ActiveEvent listener error:', err);
      }
    });
  }

  /**
   * Reset / cleanup on theme change.
   */
  public cleanup(): void {
    this.activeEvents.clear();
    this.lastTriggerTimeByEgg.clear();
    this.activeScreenCatIds.clear();
  }
}
