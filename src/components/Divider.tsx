import React from 'react';
import { cn } from '../utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: React.ReactNode;
}

export const Divider: React.FC<DividerProps> = ({
  className,
  orientation = 'horizontal',
  label,
  ...props
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-[1px] self-stretch bg-[var(--color-border)] my-auto', className)}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn('flex items-center w-full my-4', className)}
        {...props}
      >
        <div className="flex-grow border-t border-[var(--color-border)]" />
        <span className="px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-grow border-t border-[var(--color-border)]" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('w-full border-t border-[var(--color-border)] my-4', className)}
      {...props}
    />
  );
};
