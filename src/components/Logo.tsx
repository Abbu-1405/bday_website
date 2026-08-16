import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../utils';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 'md',
  showText = true,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
  };

  return (
    <div
      className={cn('inline-flex items-center gap-3 select-none', className)}
      {...props}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-primary)] shadow-[var(--shadow-sm)] shrink-0',
          sizeClasses[size]
        )}
      >
        <Sparkles className={iconSizes[size]} />
      </div>

      {showText && (
        <span
          className={cn(
            'font-serif font-bold text-[var(--color-text)] tracking-tight',
            textSizes[size]
          )}
        >
          Starlit Letters
        </span>
      )}
    </div>
  );
};
