import React from 'react';
import { Heart, Search, AlertCircle, Mail, Archive, Sparkles } from 'lucide-react';
import { cn } from '../../utils';
import { VintageCornerFlourish, VintageBotanicalSprig } from './LetterArchiveDecorations';

export type VintageEmptyVariant =
  | 'empty-archive'
  | 'no-search'
  | 'empty-favorites'
  | 'empty-category'
  | 'error'
  | 'unavailable-letter'
  | 'missing-letter';

export interface VintageEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  variant?: VintageEmptyVariant;
  isFavoriteFilter?: boolean;
  isSearchEmpty?: boolean;
  isError?: boolean;
  onClearFilters?: () => void;
  actionLabel?: string;
}

export const VintageEmptyState: React.FC<VintageEmptyStateProps> = ({
  className,
  title,
  message,
  variant,
  isFavoriteFilter = false,
  isSearchEmpty = false,
  isError = false,
  onClearFilters,
  actionLabel,
  ...props
}) => {
  // Determine effective variant
  const effectiveVariant: VintageEmptyVariant =
    variant ||
    (isError
      ? 'error'
      : isSearchEmpty
      ? 'no-search'
      : isFavoriteFilter
      ? 'empty-favorites'
      : 'empty-archive');

  const defaultTitles: Record<VintageEmptyVariant, string> = {
    'empty-archive': 'No letters in the archive yet.',
    'no-search': 'No letter was found.',
    'empty-favorites': 'Nothing treasured here yet.',
    'empty-category': 'No correspondence in this category.',
    'error': 'Archive could not be retrieved.',
    'unavailable-letter': 'Letter is currently unavailable.',
    'missing-letter': 'Letter could not be found.',
  };

  const defaultMessages: Record<VintageEmptyVariant, string> = {
    'empty-archive': 'Perhaps one is still waiting to be penned, or quietly filed in an upcoming season.',
    'no-search': "Perhaps the one you're looking for is filed under a different date, title, or search term.",
    'empty-favorites': 'As you unfold and read correspondence, save the ones that mean a little more to keep them close.',
    'empty-category': 'Try selecting all correspondence to view letters across all categories and dates.',
    'error': 'A gentle pause while the archive rests. Please check your connection and return shortly.',
    'unavailable-letter': 'This letter may be sealed awaiting its unlocking date or temporarily tucked away.',
    'missing-letter': 'This letter record does not exist in the current archive records.',
  };

  const displayTitle = title || defaultTitles[effectiveVariant];
  const displayMessage = message || defaultMessages[effectiveVariant];

  return (
    <div
      role={effectiveVariant === 'error' ? 'alert' : 'status'}
      className={cn(
        'relative max-w-xl mx-auto rounded-[16px] p-8 sm:p-10 text-center select-none',
        'bg-[#FAF5EC] border border-[rgba(138,110,89,0.32)]',
        'shadow-[0_10px_28px_-6px_rgba(60,42,33,0.12)] space-y-4',
        'animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none',
        className
      )}
      {...props}
    >
      {/* Corner Flourishes */}
      <VintageCornerFlourish position="top-left" size={24} className="absolute top-2.5 left-2.5 opacity-50 pointer-events-none" />
      <VintageCornerFlourish position="top-right" size={24} className="absolute top-2.5 right-2.5 opacity-50 pointer-events-none" />
      <VintageCornerFlourish position="bottom-left" size={20} className="absolute bottom-2.5 left-2.5 opacity-35 pointer-events-none" />
      <VintageCornerFlourish position="bottom-right" size={20} className="absolute bottom-2.5 right-2.5 opacity-35 pointer-events-none" />

      {/* Tactile Empty State Illustration */}
      <div className="relative mx-auto w-16 h-14 flex items-center justify-center">
        {effectiveVariant === 'error' || effectiveVariant === 'unavailable-letter' || effectiveVariant === 'missing-letter' ? (
          /* Error / Missing State: Vintage Postal Seal with subtle burgundy accent */
          <div className="w-14 h-14 rounded-[8px] border border-dashed border-[#7A2E3B]/50 bg-[#F7EDEA] flex items-center justify-center shadow-2xs">
            <div className="relative z-10 w-7 h-7 rounded-full bg-[#FAF5EC] border border-[#7A2E3B]/50 flex items-center justify-center shadow-2xs">
              <AlertCircle className="h-4 w-4 text-[#7A2E3B]" strokeWidth={1.75} />
            </div>
          </div>
        ) : effectiveVariant === 'no-search' ? (
          /* Archival Search Empty Illustration with Vintage Magnifier motif */
          <div className="w-14 h-14 rounded-[8px] border border-dashed border-[#8A6E59]/60 bg-[#F3ECE0] flex items-center justify-center shadow-2xs">
            <div className="relative z-10 w-7 h-7 rounded-full bg-[#FAF5EC] border border-[#C5A35A]/50 flex items-center justify-center shadow-2xs">
              <Search className="h-3.5 w-3.5 text-[#8A6E59]" strokeWidth={1.75} />
            </div>
          </div>
        ) : effectiveVariant === 'empty-favorites' ? (
          /* Tactile Empty Envelope with antique gold heart mark */
          <div className="w-16 h-12 rounded-[6px] border border-dashed border-[#C5A35A]/60 bg-[#F6EFE2] flex items-center justify-center shadow-2xs">
            {/* Triangular flap fold indicator */}
            <svg className="w-full h-full absolute inset-0 opacity-40" viewBox="0 0 64 48" fill="none">
              <path d="M0 0 L32 24 L64 0" stroke="#8A6E59" strokeWidth="1" />
            </svg>
            {/* Center antique gold heart mark */}
            <div className="relative z-10 w-6 h-6 rounded-full bg-[#FAF5EC] border border-[#C5A35A] flex items-center justify-center shadow-2xs">
              <Heart className="h-3 w-3 fill-[#B58A45] text-[#B58A45]" />
            </div>
          </div>
        ) : (
          /* Empty Archive / Category: Vintage Correspondence Box with Botanical Sprig */
          <div className="relative w-16 h-12 rounded-[6px] border border-dashed border-[#8A6E59]/60 bg-[#F3ECE0] flex items-center justify-center shadow-2xs">
            {/* Triangular flap fold indicator */}
            <svg className="w-full h-full absolute inset-0 opacity-40" viewBox="0 0 64 48" fill="none">
              <path d="M0 0 L32 24 L64 0" stroke="#8A6E59" strokeWidth="1" />
            </svg>
            {/* Delicate Botanical Sprig in center */}
            <div className="relative z-10 w-6 h-6 rounded-full bg-[#FAF5EC] border border-[#8A6E59]/40 flex items-center justify-center shadow-2xs">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-[#8A6E59]">
                <path d="M8 2C8 6 5 9 3 13M8 6C10 5 13 6 13 8C11 10 9 9 8 6ZM5 9C6 7 8 8 7 10C5.5 11 5 10 5 9Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Text Presentation */}
      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="text-base sm:text-lg font-serif font-medium text-[#3B2A20]">
          {displayTitle}
        </h3>
        <p className="text-xs sm:text-sm text-[#6B5547] font-serif italic leading-relaxed">
          {displayMessage}
        </p>
      </div>

      {/* Clear Filters / Action Button with Tactile Feedback */}
      {onClearFilters && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] text-xs font-serif text-[#7A2E3B] border border-[#7A2E3B]/30 hover:bg-[#F2E8DC] active:scale-[0.98] motion-reduce:active:scale-100 transition-all duration-150 shadow-2xs focus-visible:ring-2 focus-visible:ring-[#7A2E3B] focus:outline-none"
          >
            <span>
              {actionLabel ||
                (effectiveVariant === 'no-search'
                  ? 'Clear search & reset'
                  : 'Show all correspondence')}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
