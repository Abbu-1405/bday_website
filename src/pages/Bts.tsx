import React, { useState, useMemo, useEffect } from 'react';
import {
  BtsHeader,
  BtsFilters,
  BtsCard,
  BtsViewerModal,
  BtsLockedState,
} from '../components/bts';
import { ScrollFocusReveal } from '../components';
import { btsItems } from '../data';
import { BtsItem, BtsFilterCategory } from '../types';
import { useTheme, useAuth } from '../hooks';
import { useAudio } from '../contexts';
import { useSfx } from '../contexts/SfxContext';
import { recordBtsPageOpen, recordBtsRandom } from '../services';
import { cn } from '../utils';
import { Film, RotateCcw } from 'lucide-react';

export default function Bts() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { playMagicalClick, playPaperRustle } = useAudio();
  const { playSfx } = useSfx();

  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

  // Fixed unlock date: October 4, 2026
  const UNLOCK_DATE_STRING = '2026-10-04';
  const isUnlocked = useMemo(() => {
    const unlockTime = new Date('2026-10-04T00:00:00').getTime();
    return Date.now() >= unlockTime;
  }, []);

  // Track BTS page open when unlocked
  useEffect(() => {
    if (isUnlocked && currentUser) {
      recordBtsPageOpen();
    }
  }, [isUnlocked, currentUser]);

  // Filter & Search state
  const [activeCategory, setActiveCategory] = useState<BtsFilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<BtsItem | null>(null);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<BtsFilterCategory, number> = {
      all: btsItems.length,
      photos: 0,
      videos: 0,
      audio: 0,
      pdfs: 0,
      html: 0,
    };

    btsItems.forEach((item) => {
      if (item.type === 'image') counts.photos++;
      else if (item.type === 'video') counts.videos++;
      else if (item.type === 'audio') counts.audio++;
      else if (item.type === 'pdf') counts.pdfs++;
      else if (item.type === 'html') counts.html++;
    });

    return counts;
  }, []);

  // Filter and search items
  const filteredItems = useMemo(() => {
    return btsItems.filter((item) => {
      // 1. Category match
      if (activeCategory === 'photos' && item.type !== 'image') return false;
      if (activeCategory === 'videos' && item.type !== 'video') return false;
      if (activeCategory === 'audio' && item.type !== 'audio') return false;
      if (activeCategory === 'pdfs' && item.type !== 'pdf') return false;
      if (activeCategory === 'html' && item.type !== 'html') return false;

      // 2. Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = item.title.toLowerCase().includes(query);
        const captionMatch = item.caption.toLowerCase().includes(query);
        const tagMatch = item.tags.some((t) => t.toLowerCase().includes(query));
        const authorNoteMatch = item.authorNote?.toLowerCase().includes(query) ?? false;
        const typeMatch = item.type.toLowerCase().includes(query);

        if (!titleMatch && !captionMatch && !tagMatch && !authorNoteMatch && !typeMatch) {
          return false;
        }
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

  // Handle Random BTS action
  const handleRandomBts = () => {
    playMagicalClick();
    const candidateList = filteredItems.length > 0 ? filteredItems : btsItems;
    if (candidateList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * candidateList.length);
    const chosenItem = candidateList[randomIndex];
    setSelectedItem(chosenItem);
    recordBtsRandom(chosenItem);
  };

  const handleOpenItem = (item: BtsItem) => {
    playSfx('photoOpen');
    setSelectedItem(item);
  };

  // If locked before October 4, 2026
  if (!isUnlocked) {
    return (
      <main className="min-h-screen py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <BtsLockedState unlockDate={UNLOCK_DATE_STRING} />
        </div>
      </main>
    );
  }

  return (
    <main
      className={cn(
        'min-h-screen py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 transition-colors select-none',
        isLetterArchive
          ? 'bg-[#F7F2EB] text-[#2C221E]'
          : isScrapbook
          ? 'bg-[var(--color-background)] text-[#F7F1DF]'
          : 'bg-[var(--color-background)] text-[#F2E4CF]'
      )}
    >
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        {/* Top Header */}
        <BtsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRandomBts={handleRandomBts}
          totalCount={btsItems.length}
          filteredCount={filteredItems.length}
        />

        {/* Filter Tabs */}
        <div className="pt-1">
          <BtsFilters
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              playMagicalClick();
              setActiveCategory(cat);
            }}
            counts={categoryCounts}
          />
        </div>

        {/* BTS Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-2">
            {filteredItems.map((item, index) => (
              <ScrollFocusReveal key={item.id} className="h-full">
                <BtsCard
                  item={item}
                  index={index}
                  onOpen={handleOpenItem}
                />
              </ScrollFocusReveal>
            ))}
          </div>
        ) : (
          /* Graceful Empty State */
          <div
            className={cn(
              'rounded-2xl sm:rounded-3xl p-10 sm:p-14 text-center border space-y-4 max-w-lg mx-auto backdrop-blur-sm',
              isLetterArchive
                ? 'bg-[#FAF6F0] border-[#8A6E59]/30 text-[#2C221E]'
                : isScrapbook
                ? 'bg-[rgba(16,30,20,0.8)] border-[#D8B86A]/30 text-[#F7F1DF]'
                : 'bg-[rgba(13,23,40,0.8)] border-[#C99B58]/30 text-[#F2E4CF]'
            )}
          >
            <div
              className={cn(
                'w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border',
                isLetterArchive
                  ? 'bg-[#EDE4DC] border-[#8A6E59]/30 text-[#7A2E3B]'
                  : isScrapbook
                  ? 'bg-[rgba(27,47,33,0.7)] border-[#D8B86A]/30 text-[#D8B86A]'
                  : 'bg-[rgba(19,34,58,0.7)] border-[#C99B58]/30 text-[#C99B58]'
              )}
            >
              <Film className="w-6 h-6 opacity-80" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-serif font-bold">No chaos found.</h2>
              <p className="text-xs sm:text-sm font-serif opacity-75 leading-relaxed">
                No behind-the-scenes outtakes match your current search query or filter.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                playMagicalClick();
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-serif font-medium border transition-all cursor-pointer opacity-80 hover:opacity-100',
                isLetterArchive
                  ? 'border-[#8A6E59]/40 text-[#7A2E3B] hover:bg-[#EDE4DC]'
                  : isScrapbook
                  ? 'border-[#D8B86A]/40 text-[#D8B86A] hover:bg-[rgba(216,184,106,0.15)]'
                  : 'border-[#C99B58]/40 text-[#C99B58] hover:bg-[rgba(201,155,88,0.15)]'
              )}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters & Search</span>
            </button>
          </div>
        )}
      </div>

        {/* Modal Lightbox Viewer */}
        <BtsViewerModal
          item={selectedItem}
          itemsList={filteredItems}
          onClose={() => setSelectedItem(null)}
          onSelect={(item) => setSelectedItem(item)}
        />
    </main>
  );
}
