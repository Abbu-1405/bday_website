import React from 'react';
import { Calendar, MapPin, Sparkles, ArrowRight, Camera } from 'lucide-react';
import { Moment } from '../../types';
import { cn } from '../../utils';
import { useTheme } from '../../hooks';

export interface FeaturedMomentCardProps {
  moment: Moment;
  onSelect: (moment: Moment) => void;
  className?: string;
}

export const FeaturedMomentCard: React.FC<FeaturedMomentCardProps> = ({
  moment,
  onSelect,
  className,
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[20px] select-none cursor-pointer transition-all duration-300',
        'hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:transform-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isLetterArchive
          ? 'bg-[#FAF5EC] border border-[rgba(138,110,89,0.38)] shadow-[0_10px_30px_-6px_rgba(60,42,33,0.14),0_2px_8px_rgba(60,42,33,0.06)] hover:border-[rgba(122,46,59,0.6)] hover:shadow-[0_18px_40px_-6px_rgba(60,42,33,0.22)] focus-visible:ring-[#7A2E3B] focus-visible:ring-offset-[#FAF5EC]'
          : isScrapbook
          ? 'bg-[#FAF1DF] border border-[rgba(120,140,107,0.38)] shadow-[0_10px_30px_-6px_rgba(74,64,56,0.14)] hover:border-[#788C6B] hover:shadow-[0_18px_40px_-6px_rgba(74,64,56,0.2)] focus-visible:ring-[#788C6B] focus-visible:ring-offset-[#F5E8D0]'
          : 'bg-[#101A2B] border border-[#344761] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.85)] hover:border-[#D6B56C] hover:shadow-[0_18px_40px_-6px_rgba(0,0,0,0.9)] focus-visible:ring-[#D6B56C] focus-visible:ring-offset-[#070D18]',
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
      aria-label={`Featured memory: ${moment.title}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px] sm:min-h-[400px]">
        {/* Featured Photographic Mount */}
        <div
          className={cn(
            'lg:col-span-7 relative overflow-hidden min-h-[240px] sm:min-h-[280px] lg:min-h-full flex items-center justify-center p-3 sm:p-4',
            isLetterArchive
              ? 'bg-[#F2E8DC]/70 border-b lg:border-b-0 lg:border-r border-[rgba(138,110,89,0.25)]'
              : isScrapbook
              ? 'bg-[#F5E8D0]/70 border-b lg:border-b-0 lg:border-r border-[rgba(120,140,107,0.25)]'
              : 'bg-[#0B1424]/80 border-b lg:border-b-0 lg:border-r border-[#344761]'
          )}
        >
          {/* Inner Photo Frame with Matte Border */}
          <div
            className={cn(
              'relative w-full h-full min-h-[220px] rounded-[12px] overflow-hidden shadow-md',
              isLetterArchive
                ? 'p-1.5 sm:p-2 bg-[#FAF5EC] border border-[rgba(138,110,89,0.3)]'
                : isScrapbook
                ? 'p-1.5 sm:p-2 bg-[#FAF1DF] border border-[rgba(120,140,107,0.3)]'
                : 'p-1.5 sm:p-2 bg-[#142238] border border-[#344761]'
            )}
          >
            {moment.image ? (
              <img
                src={moment.image}
                alt={moment.title}
                className="w-full h-full object-cover rounded-[8px] group-hover:scale-103 transition-transform duration-700 ease-out"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : moment.video ? (
              <video
                src={moment.video}
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover rounded-[8px]"
              />
            ) : (
              <div
                className={cn(
                  'w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center rounded-[8px]',
                  isLetterArchive
                    ? 'bg-[#EDE2D2]/50 text-[#7A2E3B]'
                    : isScrapbook
                    ? 'bg-[#F5E8D0] text-[#788C6B]'
                    : 'bg-[#101A2B] text-[#D6B56C]'
                )}
              >
                <Camera className="h-10 w-10 opacity-40 mb-2" />
                <span className="text-xs font-serif italic opacity-70">
                  Memory № {String(moment.order).padStart(2, '0')}
                </span>
              </div>
            )}
            {/* Subtle soft gradient over image */}
            {moment.image && (
              <div className="absolute inset-0 rounded-[8px] bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            )}

            {/* Vintage Photo Corner Accents for Letter Archive */}
            {isLetterArchive && (
              <>
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#7A2E3B]/70 pointer-events-none" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#7A2E3B]/70 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#7A2E3B]/70 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#7A2E3B]/70 pointer-events-none" />
              </>
            )}

            {/* Featured Memory Badge */}
            <div className="absolute top-3.5 left-3.5 z-10">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-serif font-medium tracking-wide shadow-sm backdrop-blur-xs',
                  isLetterArchive
                    ? 'bg-[#FAF5EC]/90 text-[#7A2E3B] border border-[rgba(138,110,89,0.4)]'
                    : isScrapbook
                    ? 'bg-[#FAF1DF]/90 text-[#788C6B] border border-[rgba(120,140,107,0.4)]'
                    : 'bg-[#101A2B]/90 text-[#D6B56C] border border-[#344761]'
                )}
              >
                <Sparkles className="h-3 w-3" />
                <span>Featured Reflection</span>
              </span>
            </div>
          </div>
        </div>

        {/* Story Prose & Metadata */}
        <div className="lg:col-span-5 p-5 sm:p-7 lg:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-3.5">
            {/* Metadata Tags */}
            <div
              className={cn(
                'flex items-center gap-2.5 text-xs font-serif flex-wrap',
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
                <Calendar className="h-3.5 w-3.5" />
                {moment.date}
              </span>
              {moment.location && (
                <>
                  <span className="opacity-40">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 opacity-80" />
                    {moment.location}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h2
              className={cn(
                'text-xl sm:text-2xl lg:text-[26px] font-serif leading-snug tracking-tight transition-colors duration-200',
                isLetterArchive
                  ? 'text-[#3B2A20] group-hover:text-[#7A2E3B]'
                  : isScrapbook
                  ? 'text-[#4A4038] group-hover:text-[#788C6B]'
                  : 'text-[#E9EDF4] group-hover:text-[#D6B56C]'
              )}
            >
              {moment.title}
            </h2>

            {/* Excerpt in Theme Ink */}
            <p
              className={cn(
                'text-sm sm:text-[14.5px] font-serif leading-relaxed line-clamp-3 sm:line-clamp-4 italic pl-3 border-l-2',
                isLetterArchive
                  ? 'text-[#5C4A42] border-[#7A2E3B]/40'
                  : isScrapbook
                  ? 'text-[#6D655B] border-[#788C6B]/40'
                  : 'text-[#C5D0DF] border-[#344761]'
              )}
            >
              "{moment.shortDescription}"
            </p>
          </div>

          {/* Card Footer: Order & Action */}
          <div
            className={cn(
              'pt-4 border-t flex items-center justify-between gap-3',
              isLetterArchive
                ? 'border-[rgba(138,110,89,0.25)] text-[#7A6253]'
                : isScrapbook
                ? 'border-[rgba(120,140,107,0.25)] text-[#6D655B]'
                : 'border-[#273951] text-[#74859D]'
            )}
          >
            <span className="text-xs font-serif italic">
              Archived Memory № {String(moment.order).padStart(2, '0')}
            </span>

            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-serif font-medium border transition-colors touch-manipulation min-h-[38px]',
                isLetterArchive
                  ? 'bg-[#F2E8DC]/80 text-[#7A2E3B] border-[rgba(138,110,89,0.35)] group-hover:bg-[#7A2E3B] group-hover:text-[#FFF9F0]'
                  : isScrapbook
                  ? 'bg-[#FAF1DF] text-[#788C6B] border-[rgba(120,140,107,0.35)] group-hover:bg-[#788C6B] group-hover:text-[#FAF1DF]'
                  : 'bg-[#142238] text-[#D6B56C] border-[#344761] group-hover:bg-[#18273B]'
              )}
            >
              <span>View Memory</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

