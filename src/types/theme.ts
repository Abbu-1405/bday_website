export type Theme = 'letter-archive' | 'midnight-journal' | 'whimsical-scrapbook';

export const AVAILABLE_THEMES: readonly Theme[] = [
  'letter-archive',
  'midnight-journal',
  'whimsical-scrapbook',
] as const;

export const DEFAULT_THEME: Theme = 'letter-archive';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: readonly Theme[];
  isDark: boolean;
}
