import {
  ActiveCatInstance,
  CatDefinition,
  CatEngineConfig,
  CatGenericReaction,
  CatPositionPreset,
  CatReactionOptions,
} from '../../types/catMeme';
import { DEFAULT_CAT_ENGINE_CONFIG } from './catConfig';
import { CatCustomizationService } from './CatCustomizationService';
import { CatAudioService } from './CatAudioService';
import { CatEventManager } from './CatEventManager';
import { CatMemoryService } from './CatMemoryService';
import { getAppearanceWeightMultiplier } from './CatRelationshipScorer';
import {
  getAllRegisteredCats,
  getCatDefinition,
  selectWeightedRandomCat,
} from './catRegistry';
import {
  resolvePersonalityIdle,
  resolvePersonalityReaction,
} from './CatPersonalityResolver';
import { pickRandomSafePreset } from './CatPositioning';

export interface SpawnControllerListener {
  onCatsUpdated: (cats: ActiveCatInstance[]) => void;
}

export class CatSpawnController {
  private config: CatEngineConfig;
  private activeCats: Map<string, ActiveCatInstance> = new Map();
  private timers: Set<ReturnType<typeof setTimeout>> = new Set();
  private spawnTimeout: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;
  private listener: SpawnControllerListener | null = null;
  private unsubscribeEvents: (() => void) | null = null;
  private recentCatIds: string[] = [];

  constructor(config: Partial<CatEngineConfig> = {}) {
    this.config = { ...DEFAULT_CAT_ENGINE_CONFIG, ...config };
  }

  /**
   * Start the spawn engine.
   */
  public start(listener: SpawnControllerListener): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.listener = listener;

    // Listen to external reaction triggers
    this.unsubscribeEvents = CatEventManager.subscribe((event, payload) => {
      if (event === 'REACTION' && payload) {
        this.handleExternalReaction(payload as CatReactionOptions);
      }
    });

    // Schedule initial spawn
    this.scheduleNextSpawn();
  }

  /**
   * Stop the spawn engine and clean up all resources.
   */
  public stop(): void {
    this.isRunning = false;

    if (this.spawnTimeout) {
      clearTimeout(this.spawnTimeout);
      this.spawnTimeout = null;
    }

    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();

    if (this.unsubscribeEvents) {
      this.unsubscribeEvents();
      this.unsubscribeEvents = null;
    }

    this.activeCats.clear();
    this.recentCatIds = [];
    if (this.listener) {
      this.listener.onCatsUpdated([]);
      this.listener = null;
    }
  }

  /**
   * Clear active cats immediately on route navigation.
   */
  public handleRouteChange(): void {
    if (!this.isRunning) return;

    // Clear existing active instances gracefully
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
    this.activeCats.clear();
    this.notifyUpdate();

    // Reschedule next spawn after route settlement
    if (this.spawnTimeout) {
      clearTimeout(this.spawnTimeout);
    }
    this.spawnTimeout = setTimeout(() => {
      this.scheduleNextSpawn();
    }, 4000);
  }

  /**
   * Schedules a random spawn interval.
   */
  private scheduleNextSpawn(): void {
    if (!this.isRunning) return;

    if (this.spawnTimeout) {
      clearTimeout(this.spawnTimeout);
      this.spawnTimeout = null;
    }

    const interval =
      Math.floor(
        Math.random() *
          (this.config.maxSpawnInterval - this.config.minSpawnInterval)
      ) + this.config.minSpawnInterval;

    this.spawnTimeout = setTimeout(() => {
      this.attemptRandomSpawn();
      this.scheduleNextSpawn();
    }, interval);
  }

  /**
   * Attempts a controlled random cat spawn with weighted selection from the Cat Cast Registry.
   */
  private attemptRandomSpawn(): void {
    if (!this.isRunning) return;

    try {
      const isMobile =
        typeof window !== 'undefined' &&
        window.innerWidth < this.config.mobileBreakpoint;
      const maxSimultaneous = isMobile
        ? this.config.maxSimultaneousMobile
        : this.config.maxSimultaneousDesktop;

      if (this.activeCats.size >= maxSimultaneous) {
        return;
      }

      if (Math.random() > this.config.spawnProbability) {
        return;
      }

      // Determine safe position avoiding currently occupied slots
      const usedPresets = new Set(
        Array.from(this.activeCats.values()).map((c) => c.position)
      );
      const position = pickRandomSafePreset(usedPresets, isMobile);

      // Select cat from registry with duplicate avoidance, relationship weight bonus, and hidden filtering
      const allCats = getAllRegisteredCats();
      // Filter out hidden cats (Legendary cats are protected and can never be hidden)
      const visibleCats = allCats.filter(
        (c) => c.rarity === 'legendary' || !CatCustomizationService.isCatHidden(c.id)
      );
      if (visibleCats.length === 0) {
        return; // All cats hidden (except none left)
      }

      const recentSet = new Set(this.recentCatIds);
      const candidates =
        visibleCats.filter((c) => !recentSet.has(c.id)).length > 0
          ? visibleCats.filter((c) => !recentSet.has(c.id))
          : visibleCats;

      let totalWeight = 0;
      const weightedList = candidates.map((cat) => {
        const mem = CatMemoryService.getCatMemory(cat.id);
        const multiplier = getAppearanceWeightMultiplier(mem.relationshipLevel);
        const weight = (cat.appearanceWeight || 10) * multiplier;
        totalWeight += weight;
        return { cat, weight };
      });

      let randomVal = Math.random() * totalWeight;
      let chosenCat = weightedList[0]?.cat || selectWeightedRandomCat(this.recentCatIds, visibleCats);
      for (const item of weightedList) {
        if (randomVal <= item.weight) {
          chosenCat = item.cat;
          break;
        }
        randomVal -= item.weight;
      }

      const catDef = chosenCat;
      this.recordRecentCat(catDef.id);

      // Resolve personality-driven idle behavior & captions
      const { expression, caption } = resolvePersonalityIdle(catDef);

      const duration =
        Math.floor(
          Math.random() *
            (this.config.maxDisplayDuration - this.config.minDisplayDuration)
        ) + this.config.minDisplayDuration;

      this.spawnCatInstance({
        catDef,
        position,
        variant: expression,
        caption,
        duration,
      });
    } catch (err) {
      console.warn('CatSpawnController: Error during random spawn', err);
    }
  }

  /**
   * Spawns a cat instance with deterministic lifecycle transitions:
   * entering (350ms) -> idle/reacting -> exiting (350ms) -> unmounted.
   */
  private spawnCatInstance(options: {
    catDef: CatDefinition;
    position: CatPositionPreset;
    variant: CatDefinition['defaultExpression'];
    reactionType?: CatGenericReaction;
    caption?: string;
    duration: number;
    id?: string;
  }): void {
    const id =
      options.id ||
      `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const effectiveDisplayName = CatCustomizationService.getEffectiveDisplayName(
      options.catDef
    );

    const instance: ActiveCatInstance = {
      id,
      catDefinitionId: options.catDef.id,
      displayName: effectiveDisplayName,
      personality: options.catDef.personality,
      rarity: options.catDef.rarity,
      archetypeColor: options.catDef.archetypeColor,
      state: 'entering',
      position: options.position,
      variant: options.variant,
      reactionType: options.reactionType,
      caption: options.caption,
      enteredAt: Date.now(),
      duration: options.duration,
    };

    this.activeCats.set(id, instance);
    this.notifyUpdate();

    // Record encounter in persistent cat memory
    try {
      CatMemoryService.recordEncounter(id, options.catDef.id);
    } catch (memErr) {
      console.warn('CatSpawnController: Error recording memory encounter', memErr);
    }

    CatEventManager.emit('APPEAR', {
      id,
      catId: options.catDef.id,
      position: options.position,
    });

    // Transition: entering -> idle/reacting
    const tEnter = setTimeout(() => {
      this.timers.delete(tEnter);
      const cat = this.activeCats.get(id);
      if (cat && cat.state === 'entering') {
        cat.state = options.reactionType ? 'reacting' : 'idle';
        this.notifyUpdate();
        CatEventManager.emit(options.reactionType ? 'REACTION' : 'IDLE', {
          id,
          catId: options.catDef.id,
        });

        // Phase 7: Synchronized sound playback with caption display
        try {
          const mem = CatMemoryService.getCatMemory(options.catDef.id);
          const bondLevel = mem?.relationshipLevel || 1;

          if (options.reactionType) {
            // Reaction sounds play with medium priority
            CatAudioService.getInstance().playReactionSound(
              options.catDef.id,
              options.variant || 'curious',
              bondLevel,
              'medium'
            );
          } else {
            // Passive spawn sounds play with controlled probability (~25%)
            CatAudioService.getInstance().maybePlayPassiveSpawnSound(
              options.catDef.id,
              bondLevel,
              0.25
            );
          }
        } catch {
          // Fail silently
        }
      }
    }, 400);
    this.timers.add(tEnter);

    // Transition: idle/reacting -> exiting
    const tExit = setTimeout(() => {
      this.timers.delete(tExit);
      const cat = this.activeCats.get(id);
      if (cat) {
        cat.state = 'exiting';
        this.notifyUpdate();
        CatEventManager.emit('DISAPPEAR', { id, catId: options.catDef.id });

        // Final cleanup after exit animation completes
        const tCleanup = setTimeout(() => {
          this.timers.delete(tCleanup);
          this.activeCats.delete(id);
          this.notifyUpdate();
        }, 400);
        this.timers.add(tCleanup);
      }
    }, options.duration);
    this.timers.add(tExit);
  }

  /**
   * Handles external generic reaction triggers with personality mapping.
   */
  private handleExternalReaction(options: CatReactionOptions): void {
    if (!this.isRunning) return;

    try {
      const isMobile =
        typeof window !== 'undefined' &&
        window.innerWidth < this.config.mobileBreakpoint;
      const maxSimultaneous = isMobile
        ? this.config.maxSimultaneousMobile
        : this.config.maxSimultaneousDesktop;

      // If max reached and override is false, discard
      if (this.activeCats.size >= maxSimultaneous && !options.overrideActive) {
        return;
      }

      // Determine target CatDefinition respecting hidden preferences
      const allCats = getAllRegisteredCats();
      const visibleCats = allCats.filter(
        (c) => c.rarity === 'legendary' || !CatCustomizationService.isCatHidden(c.id)
      );

      let catDef: CatDefinition;
      if (options.catId) {
        if (CatCustomizationService.isCatHidden(options.catId)) {
          // If explicitly requested cat is hidden, select from visible pool
          catDef = selectWeightedRandomCat(this.recentCatIds, visibleCats);
        } else {
          catDef = getCatDefinition(options.catId);
        }
      } else {
        catDef = selectWeightedRandomCat(this.recentCatIds, visibleCats);
      }

      this.recordRecentCat(catDef.id);

      // Resolve reaction through personality system or use explicit variant
      let expression = options.variant;
      let caption = options.caption;
      let durationModifier = 1.0;

      if (!expression || !caption) {
        const resolved = resolvePersonalityReaction(catDef, options.type, options.caption);
        if (!expression) expression = resolved.expression;
        if (!caption) caption = resolved.caption;
        durationModifier = resolved.durationModifier;
      }

      const usedPresets = new Set(
        Array.from(this.activeCats.values()).map((c) => c.position)
      );
      const position =
        options.position || pickRandomSafePreset(usedPresets, isMobile);

      const baseDuration = options.duration || 6000;
      const duration = Math.round(baseDuration * durationModifier);

      this.spawnCatInstance({
        catDef,
        position,
        variant: expression,
        reactionType: options.type,
        caption,
        duration,
      });
    } catch (err) {
      console.warn('CatSpawnController: Error handling external reaction', err);
    }
  }

  private recordRecentCat(catId: string): void {
    this.recentCatIds = [catId, ...this.recentCatIds.filter((id) => id !== catId)].slice(0, 3);
  }

  private notifyUpdate(): void {
    if (this.listener) {
      this.listener.onCatsUpdated(Array.from(this.activeCats.values()));
    }
  }
}
