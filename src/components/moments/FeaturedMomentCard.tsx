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
          ? 'bg-[linear-gradient(145deg,rgba(16,30,20,0.92)_0%,rgba(10,22,13,0.96)_100%)] border border-[rgba(216,184,106,0.3)] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.55),0_0_24px_rgba(79,107,72,0.2)] hover:border-[rgba(216,184,106,0.55)] focus-visible:ring-[#D8B86A] focus-visible:ring-offset-[#0A160D]'
          : 'bg-[linear-gradient(145deg,rgba(13,23,40,0.92)_0%,rgba(7,14,26,0.96)_100%)] border border-[rgba(201,155,88,0.32)] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.65),0_0_24px_rgba(201,155,88,0.18)] hover:border-[rgba(201,155,88,0.58)] focus-visible:ring-[#C99B58] focus-visible:ring-offset-[#070E1A]',
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
              ? 'bg-black/30 border-b lg:border-b-0 lg:border-r border-[rgba(216,184,106,0.2)]'
              : 'bg-black/40 border-b lg:border-b-0 lg:border-r border-[rgba(201,155,88,0.2)]'
          )}
        >
          {/* Inner Photo Frame with Matte Border */}
          <div
            className={cn(
              'relative w-full h-full min-h-[220px] rounded-[12px] overflow-hidden shadow-md',
              isLetterArchive
                ? 'p-1.5 sm:p-2 bg-[#FAF5EC] border border-[rgba(138,110,89,0.3)]'
                : isScrapbook
                ? 'p-1.5 sm:p-2 bg-[rgba(16,28,19,0.8)] border border-[rgba(216,184,106,0.25)]'
                : 'p-1.5 sm:p-2 bg-[rgba(12,22,38,0.8)] border border-[rgba(201,155,88,0.25)]'
            )}
          >
            <img
              src={moment.image}
              alt={moment.title}
              className="w-full h-full object-cover rounded-[8px] group-hover:scale-103 transition-transform duration-700 ease-out"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            {/* Subtle soft gradient over image */}
            <div className="absolute inset-0 rounded-[8px] bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

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
                    ? 'bg-[rgba(16,30,20,0.85)] text-[#D8B86A] border border-[rgba(216,184,106,0.4)]'
                    : 'bg-[rgba(7,14,26,0.85)] text-[#E2BD78] border border-[rgba(201,155,88,0.4)]'
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
                  ? 'text-[#B8C0AE]'
                  : 'text-[#C2AF99]'
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-medium',
                  isLetterArchive
                    ? 'text-[#7A2E3B]'
                    : isScrapbook
                    ? 'text-[#D8B86A]'
                    : 'text-[#E2BD78]'
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                {moment.date}
              </span>
              <span className="opacity-40">•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 opacity-80" />
                {moment.location}
              </span>
            </div>

            {/* Title */}
            <h2
              className={cn(
                'text-xl sm:text-2xl lg:text-[26px] font-serif leading-snug tracking-tight transition-colors duration-200',
                isLetterArchive
                  ? 'text-[#3B2A20] group-hover:text-[#7A2E3B]'
                  : isScrapbook
                  ? 'text-[#F7F1DF] group-hover:text-[#D8B86A]'
                  : 'text-[#F2E4CF] group-hover:text-[#E2BD78]'
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
                  ? 'text-[#B8C0AE] border-[#D8B86A]/40'
                  : 'text-[#C2AF99] border-[#E2BD78]/40'
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
                ? 'border-[rgba(216,184,106,0.2)] text-[#7F8B78]'
                : 'border-[rgba(201,155,88,0.2)] text-[#817568]'
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
                  ? 'bg-[rgba(79,107,72,0.22)] text-[#D8B86A] border-[rgba(216,184,106,0.3)] group-hover:bg-[rgba(79,107,72,0.45)]'
                  : 'bg-[rgba(201,155,88,0.14)] text-[#E2BD78] border-[rgba(201,155,88,0.3)] group-hover:bg-[rgba(201,155,88,0.25)]'
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

