import React from 'react';
import { Button, ButtonProps } from './Button';
import { cn } from '../utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    icon?: React.ReactNode;
  } | React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  className,
  icon,
  title,
  description,
  action,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border-light)]',
        'animate-empty-state',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex items-center justify-center p-3.5 rounded-full bg-[var(--color-card)] text-[var(--color-primary)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          {icon}
        </div>
      )}
      <h3 className="text-h3 text-[var(--color-text)] font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-body text-[var(--color-muted)] max-w-md mb-6">{description}</p>
      )}
      {action && (
        <div>
          {React.isValidElement(action) ? (
            action
          ) : typeof action === 'object' && 'label' in action ? (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              leftIcon={action.icon}
            >
              {action.label}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
};
