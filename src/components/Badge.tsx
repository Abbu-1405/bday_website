import React from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-medium rounded-full transition-colors';

  const variants = {
    default:
      'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]',
    primary:
      'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
    secondary:
      'bg-[var(--color-secondary)] text-white',
    outline:
      'bg-transparent text-[var(--color-text)] border border-[var(--color-border)]',
    success:
      'bg-[var(--color-success)] text-white',
    warning:
      'bg-[var(--color-warning)] text-white',
    error:
      'bg-[var(--color-error)] text-white',
    neutral:
      'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};
