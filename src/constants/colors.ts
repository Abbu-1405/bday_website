import { Theme } from '../types/theme';

export type ColorTokenKey =
  | 'background'
  | 'surface'
  | 'surfaceSecondary'
  | 'card'
  | 'cardHover'
  | 'primary'
  | 'primaryForeground'
  | 'secondary'
  | 'accent'
  | 'textPrimary'
  | 'textSecondary'
  | 'textMuted'
  | 'border'
  | 'borderLight'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'shadowColor';

export interface ThemeColorPalette {
  background: string;
  surface: string;
  surfaceSecondary: string;
  card: string;
  cardHover: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  shadowColor: string;
}

export const COLOR_VARIABLE_MAP: Record<ColorTokenKey, string> = {
  background: 'var(--background)',
  surface: 'var(--surface)',
  surfaceSecondary: 'var(--surface-secondary)',
  card: 'var(--card)',
  cardHover: 'var(--card-hover)',
  primary: 'var(--primary)',
  primaryForeground: 'var(--primary-foreground)',
  secondary: 'var(--secondary)',
  accent: 'var(--accent)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  border: 'var(--border)',
  borderLight: 'var(--border-light)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
  info: 'var(--info)',
  shadowColor: 'var(--shadow-color)',
};

export const THEME_COLOR_PALETTES: Record<Theme, ThemeColorPalette> = {
  'letter-archive': {
    background: '#FBF8F3',
    surface: '#F4EFE6',
    surfaceSecondary: '#EFE8DB',
    card: '#FFFFFF',
    cardHover: '#FAF6EE',
    primary: '#6B2D38',
    primaryForeground: '#FBF8F3',
    secondary: '#8C5E58',
    accent: '#C49248',
    textPrimary: '#2B2825',
    textSecondary: '#524C46',
    textMuted: '#7D756D',
    border: '#E6DEC3',
    borderLight: '#F0E8D5',
    success: '#4A7C59',
    warning: '#C87D32',
    error: '#A83B3B',
    info: '#3B6B88',
    shadowColor: 'rgba(43, 40, 37, 0.08)',
  },
  'midnight-journal': {
    background: '#050A16',
    surface: '#0B1428',
    surfaceSecondary: '#101B32',
    card: '#0D1728',
    cardHover: '#142035',
    primary: '#D8B866',
    primaryForeground: '#050A16',
    secondary: '#8897B0',
    accent: '#F3D58A',
    textPrimary: '#F0E8D8',
    textSecondary: '#B8C3D8',
    textMuted: '#8897B0',
    border: 'rgba(243, 213, 138, 0.20)',
    borderLight: 'rgba(243, 213, 138, 0.12)',
    success: '#4E9A70',
    warning: '#F3D58A',
    error: '#D96B6B',
    info: '#8897B0',
    shadowColor: 'rgba(2, 6, 18, 0.65)',
  },
  'whimsical-scrapbook': {
    background: '#FFFBF5',
    surface: '#FFF5FA',
    surfaceSecondary: '#FBF0F5',
    card: '#FFFFFF',
    cardHover: '#FFF2F7',
    primary: '#E86A82',
    primaryForeground: '#FFFFFF',
    secondary: '#72B095',
    accent: '#F4C463',
    textPrimary: '#3D2C2E',
    textSecondary: '#6E565B',
    textMuted: '#8F7A82',
    border: '#F3D5DE',
    borderLight: '#FAF0F3',
    success: '#6DBE88',
    warning: '#ED8E5E',
    error: '#E26D6D',
    info: '#73A5C6',
    shadowColor: 'rgba(61, 44, 46, 0.08)',
  },
  'cat-meme': {
    background: '#090A0D',
    surface: '#141720',
    surfaceSecondary: '#1A1D28',
    card: '#141720',
    cardHover: '#1D212E',
    primary: '#F97316',
    primaryForeground: '#FFFFFF',
    secondary: '#FB923C',
    accent: '#F97316',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    border: 'rgba(249, 115, 22, 0.22)',
    borderLight: 'rgba(255, 255, 255, 0.08)',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#38BDF8',
    shadowColor: 'rgba(0, 0, 0, 0.70)',
  },
};
