import { Theme, AVAILABLE_THEMES, DEFAULT_THEME } from '../types/theme';

const STORAGE_KEY = 'starlit-theme';

export function isValidTheme(theme: string | null): theme is Theme {
  if (!theme) return false;
  return (AVAILABLE_THEMES as readonly string[]).includes(theme);
}

export function getStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isValidTheme(saved)) {
      return saved;
    }
    // If a dormant or invalid theme (e.g. 'cat-meme' or 'meme') is in localStorage,
    // automatically sanitize it and persist the valid fallback default theme.
    if (saved) {
      setStoredTheme(DEFAULT_THEME);
    }
  } catch {
    // Fallback if localStorage is inaccessible
  }
  return DEFAULT_THEME;
}

export function setStoredTheme(theme: Theme): void {
  try {
    // Only persist if it is an active available theme, otherwise fallback to default
    const validTheme = isValidTheme(theme) ? theme : DEFAULT_THEME;
    localStorage.setItem(STORAGE_KEY, validTheme);
  } catch {
    // Handle storage errors gracefully
  }
}

export function getAvailableThemes(): readonly Theme[] {
  return AVAILABLE_THEMES;
}
