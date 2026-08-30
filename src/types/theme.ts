export type Theme = 'letter-archive' | 'midnight-journal' | 'whimsical-scrapbook' | 'cat-meme';

/**
 * Currently available/active themes for users.
 * Note: 'cat-meme' remains supported internally as a valid Theme type, but is dormant and excluded from user-facing selection.
 * To reactivate 'cat-meme' in the future, simply add 'cat-meme' back to AVAILABLE_THEMES.
 */
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
