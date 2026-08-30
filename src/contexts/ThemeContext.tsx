import React, { createContext, useEffect, useState } from 'react';
import { Theme, ThemeContextType, AVAILABLE_THEMES, DEFAULT_THEME } from '../types';
import { getStoredTheme, setStoredTheme, isValidTheme } from '../utils';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  const isDark = theme === 'midnight-journal';

  useEffect(() => {
    // If state is set to an unavailable or dormant theme, reject and sanitize immediately
    if (!isValidTheme(theme)) {
      setThemeState(DEFAULT_THEME);
      setStoredTheme(DEFAULT_THEME);
      return;
    }

    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, isDark]);

  const setTheme = (newTheme: Theme) => {
    if (!isValidTheme(newTheme)) {
      setStoredTheme(DEFAULT_THEME);
      setThemeState(DEFAULT_THEME);
      return;
    }
    setStoredTheme(newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        availableThemes: AVAILABLE_THEMES,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
