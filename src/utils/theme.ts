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
  } catch {
    // Fallback if localStorage is inaccessible
  }
  return DEFAULT_THEME;
}

export function setStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Handle storage errors gracefully
  }
}

export function getAvailableThemes(): readonly Theme[] {
  return AVAILABLE_THEMES;
}
