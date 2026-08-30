import { CatAudioSettings, CatSoundPriority, CatSoundSpec } from '../../types/catMeme';
import { CatAudioSynthesizer } from './CatAudioSynthesizer';
import {
  FAMOUS_CAT_AUDIO_REGISTRY,
  STANDARD_PET_SOUND,
  STANDARD_SHOO_SOUND,
  STANDARD_TREAT_SOUND,
  getCatAudioDefinition,
} from './catAudioRegistry';

const VOLUME_STORAGE_KEY = 'starlit_cat_audio_volume';
const MUTED_STORAGE_KEY = 'starlit_cat_audio_muted';

type ActivePlayingHandle = {
  id: string;
  priority: CatSoundPriority;
  stop: () => void;
};

type AudioStateListener = (state: {
  volume: number;
  muted: boolean;
  autoplayBlocked: boolean;
}) => void;

/**
 * Centralized singleton audio service managing sound identity for One Brain Cell cats.
 * Handles procedural synthesis, volume scaling, autoplay policy, priorities, and theme teardown.
 */
export class CatAudioService {
  private static instance: CatAudioService | null = null;

  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private volume: number = 0.7;
  private isMuted: boolean = false;
  private isAutoplayBlocked: boolean = false;
  private isThemeActive: boolean = false;

  private activeSounds: Map<string, ActivePlayingHandle> = new Map();
  private soundCooldowns: Map<string, number> = new Map();
  private listeners: Set<AudioStateListener> = new Set();

  private constructor() {
    this.loadStoredPreferences();
  }

  public static getInstance(): CatAudioService {
    if (!CatAudioService.instance) {
      CatAudioService.instance = new CatAudioService();
    }
    return CatAudioService.instance;
  }

  /**
   * Loads initial audio preferences from client storage safely.
   */
  private loadStoredPreferences(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const storedVol = localStorage.getItem(VOLUME_STORAGE_KEY);
        if (storedVol !== null) {
          const parsed = parseFloat(storedVol);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.volume = parsed;
          }
        }
        const storedMute = localStorage.getItem(MUTED_STORAGE_KEY);
        if (storedMute !== null) {
          this.isMuted = storedMute === 'true';
        }
      }
    } catch {
      // Fallback to default
    }
  }

  /**
   * Lazily initializes Web Audio API context upon first user action or sound trigger.
   */
  private ensureAudioContext(): AudioContext | null {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;

      try {
        this.audioCtx = new AudioContextClass();
        this.masterGain = this.audioCtx.createGain();
        this.updateMasterGain();
        this.masterGain.connect(this.audioCtx.destination);
      } catch (err) {
        console.warn('[CatAudioService] Could not create AudioContext:', err);
        return null;
      }
    }

    // Check suspended state for browser autoplay policy
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx
        .resume()
        .then(() => {
          if (this.isAutoplayBlocked) {
            this.isAutoplayBlocked = false;
            this.notifyListeners();
          }
        })
        .catch(() => {
          if (!this.isAutoplayBlocked) {
            this.isAutoplayBlocked = true;
            this.notifyListeners();
          }
        });
    } else if (this.isAutoplayBlocked) {
      this.isAutoplayBlocked = false;
      this.notifyListeners();
    }

    return this.audioCtx;
  }

  /**
   * Updates real-time gain node based on volume and mute states.
   */
  private updateMasterGain(): void {
    if (!this.masterGain || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const targetGain = this.isMuted ? 0.0001 : Math.max(0, Math.min(1, this.volume));
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.05);
  }

  /**
   * Explicitly resumes AudioContext upon user gesture (e.g. clicking 'Enable Cat Sounds 🔊').
   */
  public async enableAudio(): Promise<boolean> {
    const ctx = this.ensureAudioContext();
    if (!ctx) return false;

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      this.isAutoplayBlocked = false;
      this.notifyListeners();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Synchronizes theme activation state.
   */
  public setThemeActive(active: boolean): void {
    this.isThemeActive = active;
    if (!active) {
      this.fadeOutAll(250);
    }
  }

  /**
   * Plays the famous cat's singular signature sound.
   */
  public playSignatureSound(
    catId: string,
    relationshipLevel: number = 1,
    priority: CatSoundPriority = 'low'
  ): void {
    if (!this.canPlaySound(catId, 'signature')) return;

    const audioDef = getCatAudioDefinition(catId);
    const spec = audioDef.signatureSound;
    this.executeSound(spec, priority, catId, relationshipLevel);
  }

  /**
   * Plays a cat's expression/reaction-specific sound.
   */
  public playReactionSound(
    catId: string,
    expression: string,
    relationshipLevel: number = 1,
    priority: CatSoundPriority = 'medium'
  ): void {
    if (!this.canPlaySound(catId, `reaction-${expression}`)) return;

    const audioDef = getCatAudioDefinition(catId);
    const spec = audioDef.reactionSounds[expression] || audioDef.signatureSound;
    this.executeSound(spec, priority, catId, relationshipLevel);
  }

  /**
   * Plays exaggerated micro-interaction sounds (Pet, Treat, Shoo).
   */
  public playInteractionSound(
    type: 'pet' | 'treat' | 'shoo',
    catId: string = 'generic',
    relationshipLevel: number = 1
  ): void {
    let spec: CatSoundSpec;
    switch (type) {
      case 'pet':
        spec = STANDARD_PET_SOUND;
        break;
      case 'treat':
        spec = STANDARD_TREAT_SOUND;
        break;
      case 'shoo':
        spec = STANDARD_SHOO_SOUND;
        break;
    }

    // High priority ensures interactions are heard cleanly over background noise
    this.executeSound(spec, 'high', `${catId}-${type}`, relationshipLevel);
  }

  /**
   * Triggers an occasional sound during passive spawns (~25% probability).
   */
  public maybePlayPassiveSpawnSound(
    catId: string,
    relationshipLevel: number = 1,
    probability: number = 0.25
  ): void {
    if (Math.random() <= probability) {
      this.playSignatureSound(catId, relationshipLevel, 'low');
    }
  }

  /**
   * Internal execution pipeline enforcing cooldowns, priorities, and concurrency limits.
   */
  private executeSound(
    spec: CatSoundSpec,
    priority: CatSoundPriority,
    throttleKey: string,
    relationshipLevel: number
  ): void {
    if (this.isMuted || this.volume <= 0) return;

    // Cooldown throttle to prevent spamming
    const nowMs = Date.now();
    const lastTrigger = this.soundCooldowns.get(throttleKey) || 0;
    if (nowMs - lastTrigger < 350 && priority !== 'high') {
      return;
    }
    this.soundCooldowns.set(throttleKey, nowMs);

    const ctx = this.ensureAudioContext();
    if (!ctx || !this.masterGain) return;

    // Concurrency limit management (Max 3 simultaneous)
    if (this.activeSounds.size >= 3) {
      // If higher priority, dismiss the lowest priority active sound
      let lowestPriorityKey: string | null = null;
      for (const [key, handle] of this.activeSounds.entries()) {
        if (handle.priority === 'low' || (handle.priority === 'medium' && priority === 'high')) {
          lowestPriorityKey = key;
          break;
        }
      }

      if (lowestPriorityKey) {
        const handle = this.activeSounds.get(lowestPriorityKey);
        handle?.stop();
        this.activeSounds.delete(lowestPriorityKey);
      } else if (priority === 'low') {
        // Drop low priority sound if saturated
        return;
      }
    }

    try {
      const handleId = `${spec.soundId}-${Math.random().toString(36).slice(2, 7)}`;
      const playback = CatAudioSynthesizer.playSound(
        ctx,
        this.masterGain,
        spec,
        1.0,
        relationshipLevel
      );

      const activeHandle: ActivePlayingHandle = {
        id: handleId,
        priority,
        stop: playback.stop,
      };

      this.activeSounds.set(handleId, activeHandle);

      // Auto-remove when playback completes
      const soundDuration = (spec.duration || 0.6) * 1000 + 100;
      setTimeout(() => {
        this.activeSounds.delete(handleId);
      }, soundDuration);
    } catch (err) {
      // Fail silently to safeguard core Starlit Letters functionality
    }
  }

  /**
   * Helper check to verify if sound can be played.
   */
  private canPlaySound(catId: string, _action: string): boolean {
    if (this.isMuted || this.volume <= 0) return false;
    return Boolean(catId);
  }

  /**
   * Immediately fades out all active sounds (used on route transition or theme change).
   */
  public fadeOutAll(durationMs: number = 250): void {
    try {
      this.activeSounds.forEach((handle) => {
        handle.stop();
      });
      this.activeSounds.clear();

      if (this.masterGain && this.audioCtx) {
        const now = this.audioCtx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + durationMs / 1000);

        // Restore gain afterwards if still active
        setTimeout(() => {
          if (this.isThemeActive) {
            this.updateMasterGain();
          }
        }, durationMs + 20);
      }
    } catch {
      // Safe fallback
    }
  }

  // --------------------------------------------------------------------------
  // Public Preference Controls
  // --------------------------------------------------------------------------

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, clamped.toString());
    } catch {
      // Ignore
    }
    this.updateMasterGain();
    this.notifyListeners();
  }

  public isMutedState(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem(MUTED_STORAGE_KEY, muted.toString());
    } catch {
      // Ignore
    }
    this.updateMasterGain();
    this.notifyListeners();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getAutoplayBlocked(): boolean {
    return this.isAutoplayBlocked;
  }

  public getSettings(): CatAudioSettings {
    return {
      masterVolume: this.volume,
      muted: this.isMuted,
      autoplayBlocked: this.isAutoplayBlocked,
    };
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener({
      volume: this.volume,
      muted: this.isMuted,
      autoplayBlocked: this.isAutoplayBlocked,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const payload = {
      volume: this.volume,
      muted: this.isMuted,
      autoplayBlocked: this.isAutoplayBlocked,
    };
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch {
        // Prevent subscriber crash
      }
    });
  }

  /**
   * Complete cleanup for component teardown.
   */
  public cleanup(): void {
    this.fadeOutAll(100);
    this.listeners.clear();
  }
}
