import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../utils';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  /** 'mark' shows the celestial seal emblem; 'full' shows the full artwork logo */
  variant?: 'mark' | 'full';
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 'md',
  showText = true,
  variant = 'mark',
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const markSizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-12 w-12 sm:h-14 sm:w-14',
    lg: 'h-16 w-16 sm:h-20 sm:w-20',
    xl: 'h-24 w-24 sm:h-28 sm:w-28',
  };

  const fullSizeClasses = {
    xs: 'h-10 w-10',
    sm: 'h-16 w-16',
    md: 'h-24 w-24 sm:h-28 sm:w-28',
    lg: 'h-36 w-36 sm:h-40 sm:w-40',
    xl: 'h-48 w-48 sm:h-56 sm:w-56',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  };

  const subtitleSizes = {
    xs: 'text-[8px] tracking-[0.15em]',
    sm: 'text-[9px] tracking-[0.18em]',
    md: 'text-[10px] sm:text-[11px] tracking-[0.2em]',
    lg: 'text-xs sm:text-sm tracking-[0.22em]',
    xl: 'text-sm sm:text-base tracking-[0.25em]',
  };

  // If user explicitly asks for full variant, or if showText is false and size is large/md on hero
  const isFull = variant === 'full';
  const logoSrc = isFull ? '/gaalimaatalu-logo.png' : '/gaalimaatalu-favicon.png';

  return (
    <div
      className={cn('inline-flex items-center gap-3 select-none', className)}
      {...props}
    >
      <div
        className={cn(
          'relative flex items-center justify-center shrink-0 overflow-hidden rounded-full shadow-[0_4px_16px_rgba(5,8,17,0.18)] transition-transform duration-300 hover:scale-105',
          isFull ? fullSizeClasses[size] : markSizeClasses[size]
        )}
      >
        {!imageError ? (
          <img
            src={logoSrc}
            alt="Gaalimaatalu Starlit Letters Logo"
            className="w-full h-full object-contain rounded-full select-none pointer-events-none"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-full bg-[#050811] text-[#E5B85A] border border-[#E5B85A]/40">
            <Sparkles className="w-1/2 h-1/2" />
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={cn(
              'font-serif font-bold text-[var(--color-text)] tracking-tight leading-tight',
              textSizes[size]
            )}
          >
            Gaalimaatalu
          </span>
          <span
            className={cn(
              'uppercase font-mono text-[var(--color-primary)] font-semibold opacity-90 -mt-0.5',
              subtitleSizes[size]
            )}
          >
            Starlit Letters
          </span>
        </div>
      )}
    </div>
  );
};

