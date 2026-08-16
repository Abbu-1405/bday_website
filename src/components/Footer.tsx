import React from 'react';
import { Divider } from './Divider';
import { cn } from '../utils';

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  quote?: string;
  version?: string;
  copyright?: string;
  showDivider?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  className,
  quote = 'Placeholder closing quote.',
  version = 'Version 2.0',
  copyright = '© Starlit Letters. All rights reserved.',
  showDivider = true,
  ...props
}) => {
  return (
    <footer className={cn('space-y-6 pt-8 pb-6 text-center', className)} {...props}>
      {showDivider && <Divider className="mb-6" />}

      <div className="max-w-md mx-auto space-y-3">
        {quote && (
          <p className="text-quote font-serif italic text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-[var(--color-muted)] font-sans">
          <span>{version}</span>
          <span className="hidden sm:inline" aria-hidden="true">&bull;</span>
          <span>{copyright}</span>
        </div>
      </div>
    </footer>
  );
};
