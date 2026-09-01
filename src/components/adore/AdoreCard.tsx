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
        'group relative flex flex-col justify-between select-none cursor-pointer rounded-[18px] overflow-hidden h-full min-h-[220px]',
        'transition-[transform,box-shadow,border-color] duration-300 ease-out',
        '[@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:scale-[1.008]',
        'active:scale-[0.99] active:translate-y-0',
        'motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:hover:shadow-none motion-reduce:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isLetterArchive
          ? 'bg-[#FAF5EC] border border-[rgba(138,110,89,0.32)] shadow-[0_6px_20px_-4px_rgba(60,42,33,0.12),0_2px_6px_rgba(60,42,33,0.04)] [@media(hover:hover)]:hover:border-[rgba(122,46,59,0.55)] [@media(hover:hover)]:hover:shadow-[0_14px_30px_-6px_rgba(60,42,33,0.22),0_4px_10px_rgba(60,42,33,0.06)] focus-visible:ring-[#7A2E3B] focus-visible:ring-offset-[#FAF5EC]'
          : isScrapbook
          ? 'bg-[#FAF1DF] border border-[rgba(120,140,107,0.35)] shadow-[0_6px_20px_-4px_rgba(74,64,56,0.12),0_2px_6px_rgba(74,64,56,0.04)] [@media(hover:hover)]:hover:border-[rgba(120,140,107,0.65)] [@media(hover:hover)]:hover:shadow-[0_14px_30px_-6px_rgba(74,64,56,0.2),0_0_16px_rgba(210,168,74,0.15)] focus-visible:ring-[#788C6B] focus-visible:ring-offset-[#FAF1DF]'
          : 'bg-[#101A2B] border border-[#344761] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.7)] [@media(hover:hover)]:hover:border-[#D6B56C]/60 [@media(hover:hover)]:hover:shadow-[0_14px_32px_-6px_rgba(0,0,0,0.85),0_0_18px_rgba(214,181,108,0.15)] focus-visible:ring-[#D6B56C] focus-visible:ring-offset-[#070D18]',
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
      {/* Subtle Ambient Hover Top Edge Gleam */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-[1.5px] pointer-events-none opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-300 ease-out motion-reduce:hidden',
          isLetterArchive
            ? 'bg-gradient-to-r from-transparent via-[#B58A45]/45 to-transparent'
            : isScrapbook
            ? 'bg-gradient-to-r from-transparent via-[#788C6B]/50 to-transparent'
            : 'bg-gradient-to-r from-transparent via-[#D6B56C]/55 to-transparent'
        )}
        aria-hidden="true"
      />

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
                  ? 'bg-[#788C6B]/15 text-[#788C6B] border border-[rgba(120,140,107,0.35)] group-hover:border-[#788C6B]/60'
                  : 'bg-[#18273B] text-[#D6B56C] border border-[#344761] group-hover:border-[#D6B56C]/60'
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
                    ? 'bg-[#FAF1DF] text-[#6D655B] border-[rgba(120,140,107,0.25)]'
                    : 'bg-[#142238] text-[#91A9C8] border-[#344761]'
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
                  ? 'p-1.5 bg-[#FAF1DF] border border-[rgba(120,140,107,0.25)]'
                  : 'p-1.5 bg-[#142238] border border-[#344761]'
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
                ? 'text-[#4A4038] group-hover:text-[#788C6B]'
                : 'text-[#E9EDF4] group-hover:text-[#D6B56C]'
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
                ? 'text-[#6D655B]'
                : 'text-[#9EADC2]'
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
              ? 'border-[rgba(120,140,107,0.25)] text-[#8C8376] group-hover:text-[#788C6B]'
              : 'border-[#273951] text-[#74859D] group-hover:text-[#D6B56C]'
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
