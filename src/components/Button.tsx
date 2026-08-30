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
      'inline-flex items-center justify-center font-medium transition-[transform,background-color,border-color,box-shadow,color,opacity] duration-200 ease-out will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:transform-none disabled:shadow-none text-button cursor-pointer active:translate-y-0 active:scale-[0.985] motion-reduce:transform-none';

    const variants = {
      primary:
        'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[var(--shadow-sm)] [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[var(--shadow-md)] [@media(hover:hover)]:hover:brightness-105',
      secondary:
        'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] [@media(hover:hover)]:hover:bg-[var(--color-card)] [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[var(--shadow-sm)]',
      outline:
        'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] [@media(hover:hover)]:hover:bg-[var(--color-surface)] [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:border-[var(--color-primary)]/40',
      ghost:
        'bg-transparent text-[var(--color-text)] [@media(hover:hover)]:hover:bg-[var(--color-surface)] [@media(hover:hover)]:hover:-translate-y-0.5',
      text:
        'bg-transparent text-[var(--color-text)] hover:text-[var(--color-primary)] p-0 h-auto font-normal underline-offset-4 hover:underline border-none shadow-none hover:translate-y-0 active:scale-100',
      danger:
        'bg-[var(--color-error)] text-white shadow-[var(--shadow-sm)] [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[var(--shadow-md)] [@media(hover:hover)]:hover:brightness-105',
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
