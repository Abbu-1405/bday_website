import React from 'react';
import { Image, Video, Music, FileText, Code2, Layers } from 'lucide-react';
import { BtsFilterCategory } from '../../types';
import { useTheme } from '../../hooks';
import { cn } from '../../utils';

interface BtsFiltersProps {
  activeCategory: BtsFilterCategory;
  onSelectCategory: (cat: BtsFilterCategory) => void;
  counts: Record<BtsFilterCategory, number>;
}

export const BtsFilters: React.FC<BtsFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  counts,
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

  const filterOptions: { id: BtsFilterCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'photos', label: 'Photos', icon: <Image className="w-3.5 h-3.5" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-3.5 h-3.5" /> },
    { id: 'audio', label: 'Audio', icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'pdfs', label: 'PDFs', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'html', label: 'HTML', icon: <Code2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      role="tablist"
      aria-label="BTS media categories"
      className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-none max-w-full"
    >
      {filterOptions.map((opt) => {
        const isActive = activeCategory === opt.id;
        const count = counts[opt.id] || 0;

        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectCategory(opt.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-serif font-medium transition-all whitespace-nowrap cursor-pointer select-none border',
              isActive
                ? isLetterArchive
                  ? 'bg-[#7A2E3B] text-[#FFF9F0] border-[#7A2E3B] font-semibold shadow-xs'
                  : isScrapbook
                  ? 'bg-[#D8B86A] text-[#0A160D] border-[#D8B86A] font-semibold shadow-xs'
                  : 'bg-[#C99B58] text-[#070E1A] border-[#C99B58] font-semibold shadow-xs'
                : isLetterArchive
                ? 'bg-[#FAF6F0]/80 text-[#5C4A42] border-[#8A6E59]/25 hover:bg-[#EDE4DC] hover:text-[#2C221E]'
                : isScrapbook
                ? 'bg-[rgba(16,30,20,0.6)] text-[#B8C0AE] border-[#D8B86A]/20 hover:bg-[rgba(79,107,72,0.3)] hover:text-[#F7F1DF]'
                : 'bg-[rgba(13,23,40,0.6)] text-[#C2AF99] border-[#C99B58]/20 hover:bg-[rgba(201,155,88,0.18)] hover:text-[#F2E4CF]'
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
            <span
              className={cn(
                'ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full font-sans font-medium',
                isActive
                  ? isLetterArchive
                    ? 'bg-[#FAF6F0]/20 text-[#FFF9F0]'
                    : isScrapbook
                    ? 'bg-[#0A160D]/20 text-[#0A160D]'
                    : 'bg-[#070E1A]/20 text-[#070E1A]'
                  : isLetterArchive
                  ? 'bg-[#8A6E59]/15 text-[#6B5547]'
                  : isScrapbook
                  ? 'bg-[#D8B86A]/15 text-[#D8B86A]'
                  : 'bg-[#C99B58]/15 text-[#C99B58]'
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
