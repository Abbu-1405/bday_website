import React from 'react';
import { Search, X, Dices, Film, Sparkles } from 'lucide-react';
import { useTheme } from '../../hooks';
import { cn } from '../../utils';

interface BtsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRandomBts: () => void;
  totalCount: number;
  filteredCount: number;
}

export const BtsHeader: React.FC<BtsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onRandomBts,
  totalCount,
  filteredCount,
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

  return (
    <header className="space-y-6 pt-2 sm:pt-4">
      {/* Title + Subtitle + Header badges */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 text-center md:text-left">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-semibold tracking-wider uppercase border border-current/20 opacity-85 shadow-2xs">
            <Film className="w-3.5 h-3.5" />
            <span>Behind The Scenes</span>
            <span className="opacity-50">•</span>
            <span className="font-sans font-normal opacity-90">{totalCount} items</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight">
            BTS
          </h1>

          <p className="text-sm sm:text-base opacity-80 font-serif leading-relaxed max-w-xl">
            The things that didn't make the final cut. Outtakes, raw voice memos, candid snapshots, and early prototype experiments.
          </p>
        </div>

        {/* Random BTS button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRandomBts}
            aria-label="Pick a random Behind The Scenes item"
            className={cn(
              'inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-serif font-medium transition-all shadow-md active:scale-95 cursor-pointer',
              isLetterArchive
                ? 'bg-[#7A2E3B] text-[#FFF9F0] hover:bg-[#63242F] shadow-[0_4px_14px_rgba(122,46,59,0.25)]'
                : isScrapbook
                ? 'bg-[#D8B86A] text-[#0A160D] hover:bg-[#C9A859] shadow-[0_4px_14px_rgba(216,184,106,0.3)]'
                : 'bg-[#C99B58] text-[#070E1A] hover:bg-[#B58A47] shadow-[0_4px_14px_rgba(201,155,88,0.3)]'
            )}
          >
            <Dices className="w-4 h-4 animate-spin-hover" />
            <span>Random BTS</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-xl">
        <div className="relative flex items-center">
          <Search
            className={cn(
              'absolute left-3.5 w-4 h-4 pointer-events-none transition-colors',
              isLetterArchive ? 'text-[#8A6E59]' : isScrapbook ? 'text-[#D8B86A]/70' : 'text-[#C99B58]/70'
            )}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, caption, tags (e.g., wax seal, bloopers)..."
            aria-label="Search BTS items"
            className={cn(
              'w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-serif transition-all outline-none border shadow-2xs',
              isLetterArchive
                ? 'bg-[#FAF6F0] border-[#8A6E59]/30 text-[#2C221E] placeholder:text-[#8C776C] focus:border-[#7A2E3B] focus:ring-2 focus:ring-[#7A2E3B]/15'
                : isScrapbook
                ? 'bg-[rgba(16,30,20,0.85)] border-[#D8B86A]/30 text-[#F7F1DF] placeholder:text-[#B8C0AE] focus:border-[#D8B86A] focus:ring-2 focus:ring-[#D8B86A]/20'
                : 'bg-[rgba(13,23,40,0.85)] border-[#C99B58]/30 text-[#F2E4CF] placeholder:text-[#C2AF99] focus:border-[#C99B58] focus:ring-2 focus:ring-[#C99B58]/20'
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search input"
              className={cn(
                'absolute right-3 p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity cursor-pointer'
              )}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
