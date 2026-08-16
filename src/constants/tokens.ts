/**
 * Centralized Design Token System
 * Provides TypeScript-safe tokens matching variables.css, themes.css, and typography.css
 */

export const SPACING_TOKENS = {
  4: 'var(--spacing-4)',
  8: 'var(--spacing-8)',
  12: 'var(--spacing-12)',
  16: 'var(--spacing-16)',
  24: 'var(--spacing-24)',
  32: 'var(--spacing-32)',
  40: 'var(--spacing-40)',
  48: 'var(--spacing-48)',
  64: 'var(--spacing-64)',
  80: 'var(--spacing-80)',
  96: 'var(--spacing-96)',
  '3xs': 'var(--spacing-3xs)',
  '2xs': 'var(--spacing-2xs)',
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
  '2xl': 'var(--spacing-2xl)',
  '3xl': 'var(--spacing-3xl)',
} as const;

export type SpacingToken = keyof typeof SPACING_TOKENS;

export const RADIUS_TOKENS = {
  none: 'var(--radius-none)',
  xs: 'var(--radius-xs)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  pill: 'var(--radius-pill)',
  full: 'var(--radius-full)',
  card: 'var(--radius-card)',
} as const;

export type RadiusToken = keyof typeof RADIUS_TOKENS;

export const SHADOW_TOKENS = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  soft: 'var(--shadow-soft)',
  inner: 'var(--shadow-inner)',
} as const;

export type ShadowToken = keyof typeof SHADOW_TOKENS;

export const ANIMATION_TOKENS = {
  duration: {
    fast: 'var(--duration-fast)',
    normal: 'var(--duration-normal)',
    slow: 'var(--duration-slow)',
    slower: 'var(--duration-slower)',
  },
  ease: {
    standard: 'var(--ease-standard)',
    in: 'var(--ease-in)',
    out: 'var(--ease-out)',
    bounce: 'var(--ease-bounce)',
  },
  scale: {
    small: 'var(--scale-small)',
    normal: 'var(--scale-normal)',
  },
  blur: {
    small: 'var(--blur-small)',
    medium: 'var(--blur-medium)',
  },
} as const;

export const Z_INDEX_TOKENS = {
  background: 'var(--z-background)',
  content: 'var(--z-content)',
  floating: 'var(--z-floating)',
  modal: 'var(--z-modal)',
  toast: 'var(--z-toast)',
  tooltip: 'var(--z-tooltip)',
} as const;

export type ZIndexLayer = keyof typeof Z_INDEX_TOKENS;

export const BREAKPOINT_TOKENS = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
} as const;

export type BreakpointToken = keyof typeof BREAKPOINT_TOKENS;
