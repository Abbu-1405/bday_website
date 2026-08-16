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
    background: '#0D111D',
    surface: '#151C2C',
    surfaceSecondary: '#1E283E',
    card: '#1C2538',
    cardHover: '#243048',
    primary: '#E5C07B',
    primaryForeground: '#0D111D',
    secondary: '#8B7EC8',
    accent: '#60A5FA',
    textPrimary: '#EAEFF8',
    textSecondary: '#B2C0D6',
    textMuted: '#8FA0BC',
    border: '#28354D',
    borderLight: '#212C40',
    success: '#4E9A70',
    warning: '#E0AF68',
    error: '#D96B6B',
    info: '#5B9BD5',
    shadowColor: 'rgba(0, 0, 0, 0.35)',
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
};
