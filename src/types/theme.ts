export type Theme = 'letter-archive' | 'midnight-journal' | 'whimsical-scrapbook' | 'cat-meme';

export const AVAILABLE_THEMES: readonly Theme[] = [
  'letter-archive',
  'midnight-journal',
  'whimsical-scrapbook',
  'cat-meme',
] as const;

export const DEFAULT_THEME: Theme = 'letter-archive';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: readonly Theme[];
  isDark: boolean;
}
