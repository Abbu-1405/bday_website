import React from 'react';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import { Moment } from '../../types';
import { cn } from '../../utils';
import { useTheme } from '../../hooks';

export interface MomentCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  moment: Moment;
  onSelect: (moment: Moment) => void;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  onSelect,
  aspectRatio = 'square',
  className,
  ...props
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[4/5]',
  }[aspectRatio];

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between select-none cursor-pointer transition-all duration-300 rounded-[16px] overflow-hidden h-full',
        'hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:transform-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isLetterArchive
          ? 'bg-[#FAF5EC] border border-[rgba(138,110,89,0.32)] shadow-[0_6px_20px_-4px_rgba(60,42,33,0.12),0_2px_6px_rgba(60,42,33,0.04)] hover:border-[rgba(122,46,59,0.55)] hover:shadow-[0_12px_28px_-6px_rgba(60,42,33,0.2)] focus-visible:ring-[#7A2E3B] focus-visible:ring-offset-[#FAF5EC]'
          : isScrapbook
          ? 'bg-[#FAF1DF] border border-[rgba(120,140,107,0.35)] shadow-[0_6px_20px_-4px_rgba(74,64,56,0.12)] hover:border-[#788C6B] hover:shadow-[0_12px_28px_-6px_rgba(74,64,56,0.18)] focus-visible:ring-[#788C6B] focus-visible:ring-offset-[#F5E8D0]'
          : 'bg-[#101A2B] border border-[#344761] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.7)] hover:border-[#D6B56C] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.85)] focus-visible:ring-[#D6B56C] focus-visible:ring-offset-[#070D18]',
        className
      )}
      onClick={() => onSelect(moment)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(moment);
        }
      }}
      aria-label={`View memory ${moment.order}: ${moment.title}`}
      {...props}
    >
      {/* Top Photographic Mount Frame */}
      <div
        className={cn(
          'p-3 pb-0 relative overflow-hidden',
          isLetterArchive ? 'bg-[#F4ECE0]/50' : isScrapbook ? 'bg-[#F5E8D0]/60' : 'bg-[#0B1424]/60'
        )}
      >
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-[10px] shadow-sm',
            aspectClasses,
            isLetterArchive
              ? 'p-1.5 bg-[#FAF5EC] border border-[rgba(138,110,89,0.25)]'
              : isScrapbook
              ? 'p-1.5 bg-[#FAF1DF] border border-[rgba(120,140,107,0.3)]'
              : 'p-1.5 bg-[#142238] border border-[#344761]'
          )}
        >
          {moment.image ? (
            <img
              src={moment.image}
              alt={moment.title}
              className="w-full h-full object-cover rounded-[6px] group-hover:scale-103 transition-transform duration-500 ease-out"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className={cn(
                'w-full h-full flex flex-col items-center justify-center p-4 text-center rounded-[6px]',
                isLetterArchive
                  ? 'bg-[#EDE2D2]/50 text-[#7A2E3B]'
                  : isScrapbook
                  ? 'bg-[#F5E8D0] text-[#788C6B]'
                  : 'bg-[#101A2B] text-[#D6B56C]'
              )}
            >
              <Sparkles className="h-6 w-6 opacity-40 mb-1" />
            </div>
          )}
          {moment.image && (
            <div className="absolute inset-0 rounded-[6px] bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity pointer-events-none" />
          )}

          {/* Number Stamp */}
          <span
            className={cn(
              'absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-serif font-bold tracking-wider shadow-xs backdrop-blur-xs',
              isLetterArchive
                ? 'bg-[#FAF5EC]/90 text-[#7A2E3B] border border-[rgba(138,110,89,0.4)]'
                : isScrapbook
                ? 'bg-[#FAF1DF]/90 text-[#788C6B] border border-[rgba(120,140,107,0.4)]'
                : 'bg-[#101A2B]/90 text-[#D6B56C] border border-[#344761]'
            )}
          >
            № {String(moment.order).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow space-y-3">
        <div className="space-y-2">
          {/* Metadata Row */}
          <div
            className={cn(
              'flex items-center gap-2 text-xs font-serif flex-wrap',
              isLetterArchive
                ? 'text-[#6B5547]'
                : isScrapbook
                ? 'text-[#6D655B]'
                : 'text-[#9EADC2]'
            )}
          >
            <span
              className={cn(
                'inline-flex items-center gap-1 font-medium',
                isLetterArchive
                  ? 'text-[#7A2E3B]'
                  : isScrapbook
                  ? 'text-[#788C6B]'
                  : 'text-[#D6B56C]'
              )}
            >
              <Calendar className="h-3 w-3" />
              {moment.date}
            </span>
            {moment.location && (
              <>
                <span className="opacity-40">•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 opacity-80" />
                  {moment.location}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3
            className={cn(
              'text-base sm:text-[17px] font-serif font-normal leading-snug line-clamp-2 transition-colors duration-200',
              isLetterArchive
                ? 'text-[#3B2A20] group-hover:text-[#7A2E3B]'
                : isScrapbook
                ? 'text-[#4A4038] group-hover:text-[#788C6B]'
                : 'text-[#E9EDF4] group-hover:text-[#D6B56C]'
            )}
          >
            {moment.title}
          </h3>

          {/* Short Description */}
          <p
            className={cn(
              'text-xs sm:text-sm font-serif line-clamp-2 leading-relaxed italic',
              isLetterArchive
                ? 'text-[#5C4A42]'
                : isScrapbook
                ? 'text-[#6D655B]'
                : 'text-[#9EADC2]'
            )}
          >
            "{moment.shortDescription}"
          </p>
        </div>

        {/* Card Footer Hint */}
        <div
          className={cn(
            'pt-3 border-t flex items-center justify-between text-xs font-serif transition-colors',
            isLetterArchive
              ? 'border-[rgba(138,110,89,0.2)] text-[#7A6253] group-hover:text-[#7A2E3B]'
              : isScrapbook
              ? 'border-[rgba(120,140,107,0.25)] text-[#6D655B] group-hover:text-[#788C6B]'
              : 'border-[#273951] text-[#74859D] group-hover:text-[#D6B56C]'
          )}
        >
          <span className="italic text-[11px]">View memory story</span>
          <span className="text-[11px] opacity-75 group-hover:opacity-100 transition-opacity">
            {isScrapbook ? '✿' : '✦'}
          </span>
        </div>
      </div>
    </div>
  );
};

