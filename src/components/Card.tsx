import React from 'react';
import { Surface, SurfaceProps } from './Surface';

export interface CardProps extends Omit<SurfaceProps, 'variant'> {
  variant?: 'default' | 'flat' | 'bordered' | 'hoverable' | 'elevated' | 'outlined';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    let mappedVariant: 'elevated' | 'flat' | 'outlined' = 'elevated';
    if (variant === 'flat') mappedVariant = 'flat';
    if (variant === 'bordered' || variant === 'outlined') mappedVariant = 'outlined';

    const hoverClass =
      variant === 'hoverable'
        ? 'transition-[transform,box-shadow,background-color,border-color] duration-250 ease-out will-change-transform [@media(hover:hover)]:hover:shadow-[var(--shadow-lg)] [@media(hover:hover)]:hover:-translate-y-1 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none'
        : '';

    return (
      <Surface
        ref={ref}
        variant={mappedVariant}
        padding={padding}
        className={`${hoverClass} ${className || ''}`}
        {...props}
      >
        {children}
      </Surface>
    );
  }
);

Card.displayName = 'Card';

