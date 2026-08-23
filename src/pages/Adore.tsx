import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, BookOpen, Sparkle } from 'lucide-react';
import { Container } from '../components';
import { AdoreCard, AdoreDetailModal } from '../components/adore';
import { sampleAdoreItems } from '../data';
import { AdoreItem } from '../types';
import { cn } from '../utils';
import { recordDiscovery } from '../services/discoveryService';
import { getManagedAdoreItems } from '../services/contentService';
import { useTheme } from '../hooks';

export default function Adore() {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

  const [adoreItems, setAdoreItems] = useState<AdoreItem[]>(sampleAdoreItems);
  const [selectedItem, setSelectedItem] = useState<AdoreItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;
    getManagedAdoreItems().then((items) => {
      if (isMounted) setAdoreItems(items);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Extract unique categories
  const categories = [
    'All',
    ...Array.from(
      new Set(
        adoreItems
          .map((item) => item.category)
          .filter((cat): cat is string => Boolean(cat))
      )
    ),
  ];

  // Filtered items based on active category
  const filteredItems =
    activeCategory === 'All'
      ? adoreItems
      : adoreItems.filter((item) => item.category === activeCategory);

  const selectedIndex = selectedItem
    ? filteredItems.findIndex((item) => item.id === selectedItem.id)
    : -1;

  const handlePrevItem = () => {
    if (selectedIndex > 0) {
      setSelectedItem(filteredItems[selectedIndex - 1]);
    }
  };

  const handleNextItem = () => {
    if (selectedIndex >= 0 && selectedIndex < filteredItems.length - 1) {
      setSelectedItem(filteredItems[selectedIndex + 1]);
    }
  };

  return (
    <Container maxWidth="lg" className="py-6 sm:py-10 space-y-7 sm:space-y-9">
      {/* Themed Page Header */}
      <div
        className={cn(
          'relative overflow-hidden rounded-[20px] p-6 sm:p-8 select-none transition-all duration-300',
          isLetterArchive
            ? 'bg-[#FAF5EC] border border-[rgba(138,110,89,0.38)] shadow-[0_10px_30px_-6px_rgba(60,42,33,0.14)]'
            : isScrapbook
            ? 'bg-[linear-gradient(145deg,rgba(16,30,20,0.92)_0%,rgba(10,22,13,0.96)_100%)] border border-[rgba(216,184,106,0.3)] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.55),0_0_24px_rgba(79,107,72,0.2)]'
            : 'bg-[linear-gradient(145deg,rgba(13,23,40,0.92)_0%,rgba(7,14,26,0.96)_100%)] border border-[rgba(201,155,88,0.32)] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.65),0_0_24px_rgba(201,155,88,0.18)]'
        )}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
          <div className="space-y-2 max-w-2xl">
            {/* Header Badge */}
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium shadow-xs',
                isLetterArchive
                  ? 'bg-[#F2E8DC] text-[#7A2E3B] border border-[rgba(138,110,89,0.35)]'
                  : isScrapbook
                  ? 'bg-[rgba(79,107,72,0.25)] text-[#D8B86A] border border-[rgba(216,184,106,0.3)]'
                  : 'bg-[rgba(201,155,88,0.14)] text-[#E2BD78] border border-[rgba(201,155,88,0.3)]'
              )}
            >
              <Heart className="h-3.5 w-3.5 fill-current" />
              <span>Twenty Things I Cherish</span>
            </div>

            {/* Title */}
            <h1
              className={cn(
                'text-3xl sm:text-4xl lg:text-[40px] font-serif font-normal tracking-tight leading-tight',
                isLetterArchive
                  ? 'text-[#3B2A20]'
                  : isScrapbook
                  ? 'text-[#F7F1DF]'
                  : 'text-[#F2E4CF]'
              )}
            >
              Adore
            </h1>

            {/* Subtitle */}
            <p
              className={cn(
                'text-sm sm:text-base font-serif leading-relaxed',
                isLetterArchive
                  ? 'text-[#5C4A42]'
                  : isScrapbook
                  ? 'text-[#B8C0AE]'
                  : 'text-[#C2AF99]'
              )}
            >
              A curated collection of quiet qualities, gentle gestures, and cherished nuances that make you uniquely special. Every piece is a reflection of warmth and gratitude.
            </p>
          </div>

          {/* Counter Badge */}
          <div className="flex items-center gap-2 self-center sm:self-start shrink-0">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif font-medium border shadow-xs',
                isLetterArchive
                  ? 'bg-[#FAF5EC] text-[#7A2E3B] border-[rgba(138,110,89,0.4)]'
                  : isScrapbook
                  ? 'bg-[rgba(16,30,20,0.8)] text-[#D8B86A] border-[rgba(216,184,106,0.35)]'
                  : 'bg-[rgba(7,14,26,0.8)] text-[#E2BD78] border-[rgba(201,155,88,0.35)]'
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>{adoreItems.length} Reflections</span>
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div
          className={cn(
            'pt-4 mt-5 border-t flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none',
            isLetterArchive
              ? 'border-[rgba(138,110,89,0.22)]'
              : isScrapbook
              ? 'border-[rgba(216,184,106,0.2)]'
              : 'border-[rgba(201,155,88,0.2)]'
          )}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-serif font-medium whitespace-nowrap transition-all duration-200 cursor-pointer min-h-[36px] flex items-center justify-center gap-1.5 border touch-manipulation focus-visible:outline-none focus-visible:ring-2',
                  isActive
                    ? isLetterArchive
                      ? 'bg-[#7A2E3B] text-[#FFF9F0] border-[#7A2E3B] shadow-xs focus-visible:ring-[#7A2E3B]'
                      : isScrapbook
                      ? 'bg-[#D8B86A] text-[#0A160D] border-[#D8B86A] font-semibold shadow-xs focus-visible:ring-[#D8B86A]'
                      : 'bg-[#C99B58] text-[#070E1A] border-[#C99B58] font-semibold shadow-xs focus-visible:ring-[#C99B58]'
                    : isLetterArchive
                    ? 'bg-[#F2E8DC]/80 text-[#5C4A42] border-[rgba(138,110,89,0.3)] hover:border-[#7A2E3B] hover:text-[#7A2E3B]'
                    : isScrapbook
                    ? 'bg-[rgba(79,107,72,0.2)] text-[#B8C0AE] border-[rgba(216,184,106,0.25)] hover:border-[#D8B86A] hover:text-[#F7F1DF]'
                    : 'bg-[rgba(201,155,88,0.1)] text-[#C2AF99] border-[rgba(201,155,88,0.25)] hover:border-[#E2BD78] hover:text-[#F2E4CF]'
                )}
                aria-pressed={isActive}
              >
                {cat === 'All' && (
                  <Sparkle
                    className={cn(
                      'h-3 w-3',
                      isActive
                        ? isLetterArchive
                          ? 'text-[#FFF9F0]'
                          : 'text-[#070E1A]'
                        : isLetterArchive
                        ? 'text-[#7A2E3B]'
                        : isScrapbook
                        ? 'text-[#D8B86A]'
                        : 'text-[#E2BD78]'
                    )}
                  />
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Collection of Adore Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {filteredItems.map((item) => (
          <AdoreCard
            key={item.id}
            item={item}
            onSelect={(selected) => {
              setSelectedItem(selected);
              if (selected) {
                recordDiscovery('adore', selected.id);
              }
            }}
          />
        ))}
      </div>

      {/* Item Detail Modal */}
      <AdoreDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onPrevItem={handlePrevItem}
        onNextItem={handleNextItem}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex >= 0 && selectedIndex < filteredItems.length - 1}
      />

      {/* Themed Footer Notice */}
      <div
        className={cn(
          'pt-4 text-center border-t',
          isLetterArchive
            ? 'border-[rgba(138,110,89,0.22)] text-[#8A6E59]'
            : isScrapbook
            ? 'border-[rgba(216,184,106,0.18)] text-[#7F8B78]'
            : 'border-[rgba(201,155,88,0.18)] text-[#817568]'
        )}
      >
        <p className="text-xs italic font-serif flex items-center justify-center gap-1.5">
          <Sparkles
            className={cn(
              'h-3.5 w-3.5',
              isLetterArchive
                ? 'text-[#7A2E3B]'
                : isScrapbook
                ? 'text-[#D8B86A]'
                : 'text-[#E2BD78]'
            )}
          />
          <span>Starlit Letters — Core Personal Reflections</span>
        </p>
      </div>
    </Container>
  );
}

