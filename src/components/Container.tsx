import React from 'react';
import { cn } from '../utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'full';
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  children?: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  className,
  size,
  maxWidth = 'lg',
  children,
  ...props
}) => {
  const effectiveSize = size || maxWidth;
  const sizes = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        sizes[effectiveSize] || sizes.lg,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
