export type SfxId =
  | 'click'
  | 'navigation'
  | 'favorite'
  | 'pageTurn'
  | 'letterOpen'
  | 'openWhen'
  | 'themeTransition'
  | 'photoOpen'
  | 'secretUnlock'
  | 'milestone'
  | 'typingComplete';

export interface SfxConfig {
  id: SfxId;
  name: string;
  description: string;
  /** Relative or absolute URL to the audio file (to be populated in Phase 2) */
  src?: string;
  /** Relative volume adjustment factor (0.0 to 1.0) */
  volumeMultiplier?: number;
  /** Minimum cooldown in milliseconds before this SFX can be triggered again */
  cooldownMs?: number;
  /** Whether multiple overlapping instances of this sound are permitted */
  allowOverlap?: boolean;
}

export interface PlaySfxOptions {
  /** Override volume multiplier for this specific playback call */
  volumeMultiplier?: number;
  /** Force playback even if within the cooldown window */
  force?: boolean;
}

export interface SfxContextType {
  /** Whether SFX playback is currently enabled */
  isSfxEnabled: boolean;
  /** Normalized SFX master volume (0.0 to 1.0) */
  sfxVolume: number;
  /** Play an SFX by its registered ID */
  playSfx: (id: SfxId, options?: PlaySfxOptions) => void;
  /** Enable SFX playback globally */
  enableSfx: () => void;
  /** Disable SFX playback globally */
  disableSfx: () => void;
  /** Toggle SFX playback enabled/disabled state */
  toggleSfx: () => void;
  /** Set master SFX volume (clamped between 0.0 and 1.0) */
  setSfxVolume: (vol: number) => void;
}
