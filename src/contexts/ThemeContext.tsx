import React, { createContext, useEffect, useState } from 'react';
import { Theme, ThemeContextType, AVAILABLE_THEMES } from '../types';
import { getStoredTheme, setStoredTheme } from '../utils';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  const isDark = theme === 'midnight-journal';

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, isDark]);

  const setTheme = (newTheme: Theme) => {
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
