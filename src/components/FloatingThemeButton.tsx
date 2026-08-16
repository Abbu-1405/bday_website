import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../hooks';
import { Theme } from '../types';
import { cn } from '../utils';

export interface FloatingThemeButtonProps {
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const FloatingThemeButton: React.FC<FloatingThemeButtonProps> = ({
  className,
  position = 'top-right',
}) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const themes: { id: Theme; label: string; desc: string }[] = [
    {
      id: 'letter-archive',
      label: 'Letter Archive',
      desc: 'Warm parchment & elegant serif',
    },
    {
      id: 'midnight-journal',
      label: 'Midnight Journal',
      desc: 'Charcoal & luxury tones',
    },
    {
      id: 'whimsical-scrapbook',
      label: 'Whimsical Scrapbook',
      desc: 'Soft pastels & playful touches',
    },
  ];

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-20 right-4 sm:bottom-4',
    'bottom-left': 'bottom-20 left-4 sm:bottom-4',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isStatic = className?.includes('static');

  return (
    <div
      ref={containerRef}
      className={cn(
        !isStatic && 'fixed z-40',
        !isStatic && positionClasses[position],
        'relative',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Switch Theme"
        title="Switch Theme"
        className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] shadow-[var(--shadow-soft)] transition-all cursor-pointer"
      >
        <Palette className="h-4 w-4 shrink-0" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-[var(--radius-xl)] bg-[var(--color-card)]/95 backdrop-blur-md border border-[var(--color-border)] p-2 shadow-[var(--shadow-lg)] z-50 flex flex-col gap-1"
          role="menu"
        >
          <div className="px-2 py-1 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
            Theme Palette
          </div>
          {themes.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center justify-between w-full px-2.5 py-2 rounded-[var(--radius-lg)] text-left text-xs transition-colors cursor-pointer',
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{t.label}</span>
                  <span
                    className={cn(
                      'text-[10px]',
                      isActive
                        ? 'text-[var(--color-primary-foreground)]/80'
                        : 'text-[var(--color-muted)]'
                    )}
                  >
                    {t.desc}
                  </span>
                </div>
                {isActive && <Check className="h-3.5 w-3.5 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
