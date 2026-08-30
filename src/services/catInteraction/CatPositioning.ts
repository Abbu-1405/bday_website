import { CatPositionPreset } from '../../types/catMeme';

export interface SafeCoordinates {
  preset: CatPositionPreset;
  cssStyle: React.CSSProperties;
  rotation: number;
  scale: number;
}

/**
 * Available safe preset positions on desktop and mobile.
 */
const DESKTOP_PRESETS: CatPositionPreset[] = [
  'bottom-left',
  'bottom-right',
  'top-right',
  'top-left',
  'center-right',
  'center-left',
  'card-peek-left',
  'card-peek-right',
];

const MOBILE_PRESETS: CatPositionPreset[] = [
  'bottom-left',
  'bottom-right',
  'top-right',
];

/**
 * Calculates safe CSS coordinates for a given preset, strictly keeping
 * cats clear of navigation bars, interactive buttons, inputs, and modals.
 */
export function getSafePositionStyles(
  preset: CatPositionPreset,
  isMobile: boolean
): SafeCoordinates {
  let rotation = 0;
  let scale = isMobile ? 0.75 : 1.0;
  const cssStyle: React.CSSProperties = {};

  switch (preset) {
    case 'bottom-left':
      // Above the bottom floating bar, safe on left margin
      cssStyle.bottom = isMobile ? '76px' : '36px';
      cssStyle.left = isMobile ? '12px' : '28px';
      rotation = 4;
      break;

    case 'bottom-right':
      // Bottom right corner, with safety margin
      cssStyle.bottom = isMobile ? '76px' : '36px';
      cssStyle.right = isMobile ? '12px' : '28px';
      rotation = -4;
      break;

    case 'top-right':
      // Below top bar / header controls
      cssStyle.top = isMobile ? '68px' : '80px';
      cssStyle.right = isMobile ? '14px' : '36px';
      rotation = 6;
      break;

    case 'top-left':
      // Top left under header
      cssStyle.top = isMobile ? '68px' : '80px';
      cssStyle.left = isMobile ? '14px' : '36px';
      rotation = -6;
      break;

    case 'center-right':
      // Vertical middle right margin (desktop only)
      cssStyle.top = '48%';
      cssStyle.right = '20px';
      rotation = -8;
      break;

    case 'center-left':
      // Vertical middle left margin (desktop only)
      cssStyle.top = '48%';
      cssStyle.left = '20px';
      rotation = 8;
      break;

    case 'card-peek-left':
      // Peeking partially from left edge
      cssStyle.top = '62%';
      cssStyle.left = '-12px';
      rotation = 12;
      break;

    case 'card-peek-right':
      // Peeking partially from right edge
      cssStyle.top = '62%';
      cssStyle.right = '-12px';
      rotation = -12;
      break;

    default:
      cssStyle.bottom = '40px';
      cssStyle.right = '28px';
      rotation = 0;
      break;
  }

  return {
    preset,
    cssStyle,
    rotation,
    scale,
  };
}

/**
 * Selects a random safe preset avoiding existing used positions.
 */
export function pickRandomSafePreset(
  usedPresets: Set<CatPositionPreset>,
  isMobile: boolean
): CatPositionPreset {
  const pool = isMobile ? MOBILE_PRESETS : DESKTOP_PRESETS;
  const available = pool.filter((p) => !usedPresets.has(p));

  if (available.length === 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}
