import { CatEngineConfig } from '../../types/catMeme';

/**
 * Conservative defaults for Phase 2 Cat Interaction Engine.
 * Spawns are controlled and subtle, never overwhelming the user.
 */
export const DEFAULT_CAT_ENGINE_CONFIG: CatEngineConfig = {
  minSpawnInterval: 18000, // 18 seconds
  maxSpawnInterval: 42000, // 42 seconds
  maxSimultaneousDesktop: 2,
  maxSimultaneousMobile: 1,
  minDisplayDuration: 5000, // 5 seconds
  maxDisplayDuration: 8500, // 8.5 seconds
  spawnProbability: 0.85,
  mobileBreakpoint: 768,
};

/**
 * Generic sample captions for generic reaction states (Phase 2).
 */
export const GENERIC_REACTION_CAPTIONS: Record<string, string[]> = {
  curious: [
    'What is happening here? 🐱',
    'Investigating one brain cell...',
    'Sniffing the letters...',
    'Is this important? 🤔',
  ],
  surprised: [
    'Wait, what?! 🙀',
    'Brain cell overload!',
    'Unexpected discovery! ✨',
    'O_O',
  ],
  sleepy: [
    'Taking a nap right here 💤',
    'One brain cell is resting...',
    'Do not perceive me, I am eepy',
    'Zzz...',
  ],
  confused: [
    'Scanning... no thoughts found 📡',
    'One brain cell calculating... 0%',
    'Wait... where am I? 🐾',
    'Error 404: Brain cell lost',
  ],
  excited: [
    'Orange zoomies incoming! 🚀',
    'Max chaos activated! ✨',
    'Found something shiny! 🌟',
    'Cat approved! 🐾',
  ],
  idle: [
    'One brain cell vibrating...',
    'Just sitting here innocently 🧡',
    'Observing the universe...',
    'No thoughts, head empty ✨',
  ],
};
