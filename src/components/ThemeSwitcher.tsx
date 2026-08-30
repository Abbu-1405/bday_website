import React from 'react';
import { BookOpen, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../hooks';
import { useSfx } from '../contexts';
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
  const { playSfx } = useSfx();

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
        'inline-flex items-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] p-1 transition-[background-color,border-color,box-shadow,color] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
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
            onClick={() => {
              if (theme !== item.id) {
                playSfx('themeTransition');
              }
              setTheme(item.id);
            }}
            className={cn(
              'flex items-center justify-center rounded-full transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-out cursor-pointer font-medium active:scale-95 motion-reduce:transform-none',
              sizeClasses,
              isActive
                ? 'bg-[var(--color-card)] text-[var(--color-text)] shadow-xs font-semibold'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)] [@media(hover:hover)]:hover:bg-[var(--color-card)]/50'
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
