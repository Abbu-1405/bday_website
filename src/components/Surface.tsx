import React from 'react';
import { cn } from '../utils';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  (
    {
      className,
      variant = 'elevated',
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'text-[var(--color-text)] rounded-[var(--radius-card)] transition-all';

    const variants = {
      elevated: 'bg-[var(--color-card)] border border-[var(--color-border-light)] shadow-[var(--shadow-md)]',
      flat: 'bg-[var(--color-surface)] border-none shadow-none',
      outlined: 'bg-[var(--color-card)] border border-[var(--color-border)] shadow-none',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-3 sm:p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Surface.displayName = 'Surface';
