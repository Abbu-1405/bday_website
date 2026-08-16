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

    const hoverClass = variant === 'hoverable' ? 'hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5' : '';

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

