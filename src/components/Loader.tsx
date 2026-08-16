import React from 'react';
import { cn } from '../utils';

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  className,
  size = 'md',
  variant = 'spinner',
  text,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-1.5', className)} {...props}>
        <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-bounce [animation-delay:-0.3s]" />
        <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-bounce [animation-delay:-0.15s]" />
        <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-bounce" />
        {text && <span className="ml-2 text-sm text-[var(--color-muted)]">{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)} {...props}>
        <div className="h-3 w-3 rounded-full bg-[var(--color-primary)] animate-ping" />
        {text && <span className="text-sm text-[var(--color-muted)]">{text}</span>}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)} {...props}>
      <div
        className={cn(
          'rounded-full border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin',
          sizeClasses[size]
        )}
      />
      {text && <span className="text-sm text-[var(--color-muted)]">{text}</span>}
    </div>
  );
};
