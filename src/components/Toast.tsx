import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: ToastType;
  title?: string;
  message: string;
  onClose?: () => void;
  showIcon?: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  className,
  type = 'info',
  title,
  message,
  onClose,
  showIcon = true,
  ...props
}) => {
  const typeConfigs = {
    success: {
      icon: <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] shrink-0" />,
      border: 'border-l-4 border-l-[var(--color-success)]',
    },
    error: {
      icon: <AlertCircle className="h-4 w-4 text-[var(--color-error)] shrink-0" />,
      border: 'border-l-4 border-l-[var(--color-error)]',
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4 text-[var(--color-warning)] shrink-0" />,
      border: 'border-l-4 border-l-[var(--color-warning)]',
    },
    info: {
      icon: <Info className="h-4 w-4 text-[var(--color-info)] shrink-0" />,
      border: 'border-l-4 border-l-[var(--color-info)]',
    },
  };

  const config = typeConfigs[type];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-3.5 sm:p-4 rounded-[var(--radius-lg)] bg-[var(--color-card)] border border-[var(--color-border)] shadow-[var(--shadow-md)] text-[var(--color-text)] max-w-md w-full transition-all',
        config.border,
        className
      )}
      {...props}
    >
      {showIcon && config.icon}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-xs font-semibold text-[var(--color-text)] mb-0.5">{title}</h4>
        )}
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="p-1 text-[var(--color-muted)] hover:text-[var(--color-text)] rounded-[var(--radius-sm)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
