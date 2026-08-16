import React from 'react';
import { BookOpen, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../hooks';
import { Theme } from '../types';
import { cn } from '../utils';

export interface ThemeSwitcherProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className,
  size = 'md',
}) => {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; label: string; icon: React.ReactNode }[] = [
    {
      id: 'letter-archive',
      label: 'Archive',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: 'midnight-journal',
      label: 'Midnight',
      icon: <Moon className="h-4 w-4" />,
    },
    {
      id: 'whimsical-scrapbook',
      label: 'Whimsical',
      icon: <Sparkles className="h-4 w-4" />,
    },
  ];

  const sizeClasses = size === 'sm' ? 'p-1 text-xs gap-1' : 'p-1.5 text-xs gap-1.5';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] p-1',
        className
      )}
      role="radiogroup"
      aria-label="Select Theme"
    >
      {themes.map((item) => {
        const isActive = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(item.id)}
            className={cn(
              'flex items-center justify-center rounded-full transition-colors cursor-pointer font-medium',
              sizeClasses,
              isActive
                ? 'bg-[var(--color-card)] text-[var(--color-text)] shadow-xs font-semibold'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            )}
            title={item.label}
          >
            {item.icon}
            <span className="hidden sm:inline px-1">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
