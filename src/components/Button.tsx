import React from 'react';
import { cn } from '../utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-button cursor-pointer';

    const variants = {
      primary:
        'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 shadow-[var(--shadow-sm)] active:scale-[0.98]',
      secondary:
        'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-card)] active:scale-[0.98]',
      outline:
        'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)] active:scale-[0.98]',
      ghost:
        'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)] active:scale-[0.98]',
      text:
        'bg-transparent text-[var(--color-text)] hover:text-[var(--color-primary)] p-0 h-auto font-normal underline-offset-4 hover:underline border-none shadow-none',
      danger:
        'bg-[var(--color-error)] text-white hover:opacity-90 shadow-[var(--shadow-sm)] active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-[var(--radius-md)] gap-1.5',
      md: 'h-10 px-4 text-sm rounded-[var(--radius-lg)] gap-2',
      lg: 'h-12 px-6 text-base rounded-[var(--radius-xl)] gap-2.5',
    };

    const sizeClass = variant === 'text' ? '' : sizes[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizeClass, className)}
        {...props}
      >
        {isLoading && (
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent shrink-0" />
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
