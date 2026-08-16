import React from 'react';
import { cn } from '../../utils';
import { VintageCornerFlourish } from './LetterArchiveDecorations';

export interface VintageArchiveLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  subMessage?: string;
}

export const VintageArchiveLoading: React.FC<VintageArchiveLoadingProps> = ({
  className,
  message = 'Unfolding archive records...',
  subMessage = 'Gathering preserved letters across the seasons',
  ...props
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={cn(
        'relative max-w-md mx-auto rounded-[16px] p-8 sm:p-10 text-center select-none',
        'bg-[#FAF5EC] border border-[rgba(138,110,89,0.32)]',
        'shadow-[0_8px_24px_-6px_rgba(60,42,33,0.1)] space-y-4',
        'animate-in fade-in duration-300',
        className
      )}
      {...props}
    >
      {/* Corner Flourishes */}
      <VintageCornerFlourish position="top-left" size={22} className="absolute top-2.5 left-2.5 opacity-40 pointer-events-none" />
      <VintageCornerFlourish position="top-right" size={22} className="absolute top-2.5 right-2.5 opacity-40 pointer-events-none" />
      <VintageCornerFlourish position="bottom-left" size={18} className="absolute bottom-2.5 left-2.5 opacity-30 pointer-events-none" />
      <VintageCornerFlourish position="bottom-right" size={18} className="absolute bottom-2.5 right-2.5 opacity-30 pointer-events-none" />

      {/* Tactile Vintage Wax Seal & Animated Quill Ink Indicator */}
      <div className="relative mx-auto w-14 h-14 flex items-center justify-center">
        {/* Soft rotating outer ring with deckle dashes */}
        <div
          className="absolute inset-0 rounded-full border border-dashed border-[#B58A45]/50 animate-[spin_8s_linear_infinite] motion-reduce:animate-none"
        />

        {/* Central Burgundy Wax Seal with pulsing core */}
        <div
          className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-[0_3px_8px_rgba(60,20,30,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.35)]"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #9E384A 0%, #7A2E3B 60%, #4E1B24 100%)',
            border: '1px solid rgba(194, 147, 77, 0.55)',
          }}
        >
          {/* Botanical sprig emblem in soft antique gold */}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#EFE0C1] opacity-90">
            <path d="M8 2C8 6 5 9 3 13M8 6C10 5 13 6 13 8C11 10 9 9 8 6ZM5 9C6 7 8 8 7 10C5.5 11 5 10 5 9Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Subtle Traveling Ink Rule */}
      <div className="w-32 h-[1.5px] mx-auto bg-[#8A6E59]/20 rounded-full overflow-hidden relative">
        <div
          className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-[#7A2E3B] to-transparent rounded-full animate-[shimmer_1.8s_ease-in-out_infinite] motion-reduce:hidden"
          style={{
            animation: 'vintageInkFlow 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Typographic Message */}
      <div className="space-y-1">
        <h4 className="text-sm sm:text-base font-serif text-[#3B2A20] font-medium tracking-wide">
          {message}
        </h4>
        {subMessage && (
          <p className="text-xs text-[#6B5547] font-serif italic">
            {subMessage}
          </p>
        )}
      </div>

      <style>{`
        @keyframes vintageInkFlow {
          0% { left: -40%; opacity: 0; }
          50% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
