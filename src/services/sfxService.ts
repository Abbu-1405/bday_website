import { SfxId, SfxConfig, PlaySfxOptions } from '../types/sfx';

/**
 * Central SFX Configuration Registry
 * Maps each typed SfxId to its playback configuration, cooldown intervals, and relative volume adjustments.
 * Note: Audio paths (`src`) will be populated in Phase 2 when audio assets are attached.
 */
export const SFX_REGISTRY: Record<SfxId, SfxConfig> = {
  click: {
    id: 'click',
    name: 'Click',
    description: 'Subtle tactile feedback for buttons and quick selections',
    src: '/audio/sfx/click.mp3',
    volumeMultiplier: 0.8,
    cooldownMs: 60,
    allowOverlap: false,
  },
  navigation: {
    id: 'navigation',
    name: 'Navigation',
    description: 'Crisp transition feedback when navigating between views or tabs',
    src: '/audio/sfx/navigation.mp3',
    volumeMultiplier: 0.85,
    cooldownMs: 120,
    allowOverlap: false,
  },
  favorite: {
    id: 'favorite',
    name: 'Favorite',
    description: 'Warm, positive chime when favoriting or bookmarking items',
    src: '/audio/sfx/favorite.mp3',
    volumeMultiplier: 0.9,
    cooldownMs: 150,
    allowOverlap: true,
  },
  pageTurn: {
    id: 'pageTurn',
    name: 'Page Turn',
    description: 'Soft parchment rustle when turning pages or switching note days',
    src: '/audio/sfx/page-turn.mp3',
    volumeMultiplier: 0.75,
    cooldownMs: 120,
    allowOverlap: false,
  },
  letterOpen: {
    id: 'letterOpen',
    name: 'Letter Open',
    description: 'Gentle envelope opening sound effect',
    src: '/audio/sfx/letter-open.mp3',
    volumeMultiplier: 0.85,
    cooldownMs: 250,
    allowOverlap: false,
  },
  openWhen: {
    id: 'openWhen',
    name: 'Open When',
    description: 'Atmospheric reveal sound when unsealing an Open When letter',
    src: '/audio/sfx/open-when.mp3',
    volumeMultiplier: 0.9,
    cooldownMs: 250,
    allowOverlap: false,
  },
  themeTransition: {
    id: 'themeTransition',
    name: 'Theme Transition',
    description: 'Soft magical shimmer when shifting color themes',
    volumeMultiplier: 0.8,
    cooldownMs: 400,
    allowOverlap: false,
  },
  photoOpen: {
    id: 'photoOpen',
    name: 'Photo Open',
    description: 'Crisp focus snap when expanding photos in full lightbox view',
    src: '/audio/sfx/photo-open.mp3',
    volumeMultiplier: 0.85,
    cooldownMs: 150,
    allowOverlap: false,
  },
  secretUnlock: {
    id: 'secretUnlock',
    name: 'Secret Unlock',
    description: 'Harmonic mystery resonance when decrypting a secret vault entry',
    src: '/audio/sfx/secret-unlock.mp3',
    volumeMultiplier: 0.95,
    cooldownMs: 500,
    allowOverlap: true,
  },
  milestone: {
    id: 'milestone',
    name: 'Milestone',
    description: 'Celebratory starlit fanfare for achievements and streaks',
    src: '/audio/sfx/milestone.mp3',
    volumeMultiplier: 0.95,
    cooldownMs: 600,
    allowOverlap: true,
  },
  typingComplete: {
    id: 'typingComplete',
    name: 'Typing Complete',
    description: 'Subtle completion tone when a letter or quote typing effect finishes',
    src: '/audio/sfx/typing-complete.mp3',
    volumeMultiplier: 0.7,
    cooldownMs: 400,
    allowOverlap: false,
  },
};

/**
 * Centralized SFX Service
 * Manages rapid-click cooldowns, HTMLAudioElement pools, volume balancing, and browser autoplay policies.
 */
class SfxService {
  private lastPlayedMap = new Map<SfxId, number>();
  private audioPool = new Map<SfxId, HTMLAudioElement[]>();
  private maxPoolSizePerSfx = 3;
  private hasUserInteracted = false;

  constructor() {
    this.setupUserInteractionListener();
  }

  /**
   * Listen for the first user interaction to satisfy browser autoplay restrictions.
   */
  private setupUserInteractionListener(): void {
    if (typeof window === 'undefined') return;

    const onFirstInteraction = () => {
      this.hasUserInteracted = true;
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
    };

    window.addEventListener('pointerdown', onFirstInteraction, { passive: true, once: true });
    window.addEventListener('keydown', onFirstInteraction, { passive: true, once: true });
    window.addEventListener('touchstart', onFirstInteraction, { passive: true, once: true });
  }

  /**
   * Evaluates if a given SFX can play based on its cooldown definition.
   */
  public canPlay(id: SfxId, force = false): boolean {
    if (force) return true;
    const config = SFX_REGISTRY[id];
    if (!config) return false;

    const now = Date.now();
    const lastPlayed = this.lastPlayedMap.get(id) || 0;
    const cooldown = config.cooldownMs ?? 80;

    return now - lastPlayed >= cooldown;
  }

  /**
   * Central trigger method to play a registered SFX.
   *
   * @param id The typed identifier of the SFX to play
   * @param masterVolume The global SFX volume setting (0.0 - 1.0)
   * @param isEnabled Global SFX enabled state
   * @param options Additional per-call playback options
   */
  public play(
    id: SfxId,
    masterVolume: number,
    isEnabled: boolean,
    options?: PlaySfxOptions
  ): void {
    // 1. Guard against disabled SFX or zero master volume
    if (!isEnabled || masterVolume <= 0) return;

    // 2. Lookup registry config
    const config = SFX_REGISTRY[id];
    if (!config) {
      console.warn(`[SfxService] Unknown SFX ID requested: "${id}"`);
      return;
    }

    // 3. Rapid-click protection (cooldown enforcement)
    if (!this.canPlay(id, options?.force)) {
      return;
    }

    // Update last played timestamp
    this.lastPlayedMap.set(id, Date.now());

    // 4. If no audio src is defined yet (Phase 1), silently exit without error
    if (!config.src) {
      return;
    }

    // 5. Calculate effective volume
    const volumeMultiplier =
      (config.volumeMultiplier ?? 1.0) * (options?.volumeMultiplier ?? 1.0);
    const effectiveVolume = Math.max(0, Math.min(1, masterVolume * volumeMultiplier));

    // 6. Play audio using pooled instance
    try {
      const audio = this.getAudioInstance(id, config);
      if (!audio) return;

      audio.volume = effectiveVolume;
      audio.currentTime = 0;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err: unknown) => {
          // Gracefully suppress browser policy / abort errors
          if (err instanceof Error && err.name !== 'AbortError') {
            console.debug(`[SfxService] Playback deferred: ${err.message}`);
          }
        });
      }
    } catch (e) {
      console.debug('[SfxService] Unexpected audio error', e);
    }
  }

  /**
   * Retrieves or creates a pooled HTMLAudioElement for the given SFX.
   */
  private getAudioInstance(id: SfxId, config: SfxConfig): HTMLAudioElement | null {
    if (typeof window === 'undefined' || !config.src) return null;

    let pool = this.audioPool.get(id);
    if (!pool) {
      pool = [];
      this.audioPool.set(id, pool);
    }

    // If overlap is permitted, find an idle audio element or allocate a new one up to maxPoolSize
    if (config.allowOverlap) {
      const available = pool.find((a) => a.paused || a.ended);
      if (available) {
        return available;
      }
      if (pool.length < this.maxPoolSizePerSfx) {
        const newAudio = new Audio(config.src);
        pool.push(newAudio);
        return newAudio;
      }
      return pool[0];
    }

    // Non-overlapping: reuse single instance
    if (pool.length === 0) {
      const newAudio = new Audio(config.src);
      pool.push(newAudio);
      return newAudio;
    }

    return pool[0];
  }

  /**
   * Updates an SFX configuration (used when registering custom or theme-specific sound assets).
   */
  public registerSfx(id: SfxId, config: Partial<SfxConfig>): void {
    if (SFX_REGISTRY[id]) {
      SFX_REGISTRY[id] = { ...SFX_REGISTRY[id], ...config };
      // Clear pool if source changed
      if (config.src !== undefined) {
        this.audioPool.delete(id);
      }
    }
  }

  /**
   * Checks if user has performed the required initial interaction for autoplay.
   */
  public isAudioUnlocked(): boolean {
    return this.hasUserInteracted;
  }
}

export const sfxService = new SfxService();
