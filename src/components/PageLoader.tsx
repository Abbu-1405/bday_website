import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../utils';

export interface PageLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  fullScreen?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  className,
  message = 'Loading...',
  fullScreen = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-8 text-center text-[var(--color-muted)]',
        fullScreen
          ? 'fixed inset-0 z-50 bg-[var(--color-background)]/90 backdrop-blur-sm'
          : 'min-h-[200px] w-full',
        className
      )}
      role="status"
      aria-label="Loading page"
      {...props}
    >
      <div className="relative flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
        <Sparkles className="absolute h-4 w-4 text-[var(--color-primary)] opacity-75" />
      </div>
      {message && (
        <p className="text-xs font-medium tracking-wide uppercase text-[var(--color-muted)] animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
