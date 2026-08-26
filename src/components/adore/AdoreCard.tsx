import React from 'react';
import { Heart, Sparkles, Image as ImageIcon } from 'lucide-react';
import { AdoreItem } from '../../types';
import { cn } from '../../utils';
import { useTheme } from '../../hooks';

export interface AdoreCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  item: AdoreItem;
  onSelect: (item: AdoreItem) => void;
}

export const AdoreCard: React.FC<AdoreCardProps> = ({
  item,
  onSelect,
  className,
  ...props
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between select-none cursor-pointer transition-all duration-300 rounded-[18px] overflow-hidden h-full min-h-[220px]',
        'hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:transform-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isLetterArchive
          ? 'bg-[#FAF5EC] border border-[rgba(138,110,89,0.32)] shadow-[0_6px_20px_-4px_rgba(60,42,33,0.12),0_2px_6px_rgba(60,42,33,0.04)] hover:border-[rgba(122,46,59,0.55)] hover:shadow-[0_12px_28px_-6px_rgba(60,42,33,0.2)] focus-visible:ring-[#7A2E3B] focus-visible:ring-offset-[#FAF5EC]'
          : isScrapbook
          ? 'bg-[linear-gradient(155deg,rgba(16,30,20,0.92)_0%,rgba(10,22,13,0.96)_100%)] border border-[rgba(216,184,106,0.25)] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)] hover:border-[rgba(216,184,106,0.5)] focus-visible:ring-[#D8B86A] focus-visible:ring-offset-[#0A160D]'
          : 'bg-[linear-gradient(155deg,rgba(13,23,40,0.92)_0%,rgba(7,14,26,0.96)_100%)] border border-[rgba(201,155,88,0.28)] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)] hover:border-[rgba(201,155,88,0.55)] focus-visible:ring-[#C99B58] focus-visible:ring-offset-[#070E1A]',
        className
      )}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
      aria-label={`Read cherished quality ${item.order}: ${item.title}`}
      {...props}
    >
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow space-y-3.5">
        <div className="space-y-3">
          {/* Top Header Row: Order Number and Category */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-serif font-bold tracking-wider shadow-xs transition-colors',
                isLetterArchive
                  ? 'bg-[#F2E8DC] text-[#7A2E3B] border border-[rgba(138,110,89,0.4)] group-hover:border-[#7A2E3B]/60'
                  : isScrapbook
                  ? 'bg-[rgba(79,107,72,0.3)] text-[#D8B86A] border border-[rgba(216,184,106,0.35)] group-hover:border-[#D8B86A]/60'
                  : 'bg-[rgba(201,155,88,0.14)] text-[#E2BD78] border border-[rgba(201,155,88,0.35)] group-hover:border-[#E2BD78]/60'
              )}
            >
              № {String(item.order).padStart(2, '0')}
            </span>

            {item.category && (
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-serif font-medium tracking-wide border',
                  isLetterArchive
                    ? 'bg-[#FAF5EC] text-[#6B5547] border-[rgba(138,110,89,0.3)]'
                    : isScrapbook
                    ? 'bg-[rgba(16,28,19,0.6)] text-[#B8C0AE] border-[rgba(216,184,106,0.22)]'
                    : 'bg-[rgba(12,22,38,0.6)] text-[#C2AF99] border-[rgba(201,155,88,0.22)]'
                )}
              >
                {item.category}
              </span>
            )}
          </div>

          {/* Thumbnail Keepsake if Image Present */}
          {item.image && (
            <div
              className={cn(
                'relative h-36 sm:h-40 w-full rounded-[12px] overflow-hidden shadow-xs',
                isLetterArchive
                  ? 'p-1.5 bg-[#FAF5EC] border border-[rgba(138,110,89,0.28)]'
                  : isScrapbook
                  ? 'p-1.5 bg-[rgba(16,28,19,0.8)] border border-[rgba(216,184,106,0.22)]'
                  : 'p-1.5 bg-[rgba(12,22,38,0.8)] border border-[rgba(201,155,88,0.22)]'
              )}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover rounded-[8px] group-hover:scale-103 transition-transform duration-500 ease-out"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 rounded-[8px] bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity pointer-events-none" />
              <span className="absolute bottom-3 right-3 p-1 rounded-full bg-black/50 text-white backdrop-blur-xs shadow-xs">
                <ImageIcon className="h-3 w-3" />
              </span>
            </div>
          )}

          {/* Title */}
          <h3
            className={cn(
              'text-base sm:text-[17px] font-serif leading-snug line-clamp-2 transition-colors duration-200 pt-0.5',
              isLetterArchive
                ? 'text-[#3B2A20] group-hover:text-[#7A2E3B]'
                : isScrapbook
                ? 'text-[#F7F1DF] group-hover:text-[#D8B86A]'
                : 'text-[#F2E4CF] group-hover:text-[#E2BD78]'
            )}
          >
            {item.title}
          </h3>

          {/* Short Description Prose */}
          <p
            className={cn(
              'text-xs sm:text-[13.5px] font-serif line-clamp-3 leading-relaxed italic',
              isLetterArchive
                ? 'text-[#5C4A42]'
                : isScrapbook
                ? 'text-[#B8C0AE]'
                : 'text-[#C2AF99]'
            )}
          >
            "{item.shortDescription}"
          </p>
        </div>

        {/* Bottom Action Footer */}
        <div
          className={cn(
            'pt-3 mt-3 border-t flex items-center justify-between text-xs font-serif transition-colors',
            isLetterArchive
              ? 'border-[rgba(138,110,89,0.2)] text-[#7A6253] group-hover:text-[#7A2E3B]'
              : isScrapbook
              ? 'border-[rgba(216,184,106,0.18)] text-[#7F8B78] group-hover:text-[#D8B86A]'
              : 'border-[rgba(201,155,88,0.18)] text-[#817568] group-hover:text-[#E2BD78]'
          )}
        >
          <span className="font-medium inline-flex items-center gap-1.5 text-[11.5px]">
            <Heart
              className={cn(
                'h-3 w-3 fill-current transition-transform duration-200 group-hover:scale-110',
                isLetterArchive
                  ? 'text-[#7A2E3B]'
                  : isScrapbook
                  ? 'text-[#D8B86A]'
                  : 'text-[#E2BD78]'
              )}
            />
            <span>Read Reflection</span>
          </span>
          <span className="text-[11px] opacity-60 group-hover:opacity-100 transition-opacity">
            {isScrapbook ? '✿' : '✦'}
          </span>
        </div>
      </div>
    </div>
  );
};
