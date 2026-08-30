import React from 'react';
import { OrangeCatIcon } from './OrangeCatIcon';
import { cn } from '../../utils';

export interface CatThemeLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CatThemeLoader: React.FC<CatThemeLoaderProps> = ({
  message = 'Finding one brain cell...',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 20, container: 'py-2 gap-2 text-xs' },
    md: { icon: 32, container: 'py-6 gap-3 text-sm' },
    lg: { icon: 48, container: 'py-10 gap-4 text-base' },
  };

  const { icon, container } = sizeMap[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center text-center', container, className)}
    >
      <div className="relative animate-pulse">
        <OrangeCatIcon size={icon} className="animate-spin duration-1000" />
      </div>
      <p className="text-[var(--color-text-secondary,#CBD5E1)] font-mono text-xs tracking-wide">
        {message}
      </p>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
