import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, BookOpen, Sparkle } from 'lucide-react';
import { Container, Surface, Badge } from '../components';
import { AdoreCard, AdoreDetailModal } from '../components/adore';
import { sampleAdoreItems } from '../data';
import { AdoreItem } from '../types';
import { cn } from '../utils';
import { recordDiscovery } from '../services/discoveryService';
import { getManagedAdoreItems } from '../services/contentService';

export default function Adore() {
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
    <Container maxWidth="lg" className="py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Page Header / Introduction */}
      <Surface
        variant="elevated"
        padding="lg"
        className="relative overflow-hidden border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4 text-center sm:text-left"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium bg-[var(--color-surface-secondary)] text-[var(--color-primary)] border border-[var(--color-border-light)]">
              <Heart className="h-3.5 w-3.5 text-[var(--color-accent)] fill-current" />
              <span>Twenty Things I Cherish</span>
            </div>

            <h1 className="text-h1 font-serif font-bold text-[var(--color-text)] tracking-tight">
              Adore
            </h1>

            <p className="text-body text-[var(--color-text-secondary)] font-serif leading-relaxed">
              A curated collection of quiet qualities, gentle gestures, and cherished nuances that make you uniquely special. Every piece is a reflection of warmth and gratitude.
            </p>
          </div>

          <div className="flex items-center gap-2 self-center sm:self-start shrink-0">
            <Badge variant="primary" size="md" className="font-serif">
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              {adoreItems.length} Reflections
            </Badge>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="pt-4 border-t border-[var(--color-border-light)] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-serif font-medium whitespace-nowrap transition-all duration-200 cursor-pointer min-h-[36px] flex items-center justify-center gap-1 border',
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)] shadow-xs'
                    : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-light)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                )}
                aria-pressed={isActive}
              >
                {cat === 'All' && <Sparkle className="h-3 w-3" />}
                {cat}
              </button>
            );
          })}
        </div>
      </Surface>

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

      {/* Footer Notice */}
      <div className="pt-4 text-center border-t border-[var(--color-border-light)]">
        <p className="text-xs text-[var(--color-muted)] italic font-serif flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          Starlit Letters — Core Personal Sections
        </p>
      </div>
    </Container>
  );
}
