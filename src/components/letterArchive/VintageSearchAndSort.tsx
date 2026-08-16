import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Heart, BookOpen, CheckCircle, Circle, ArrowDownUp, Check } from 'lucide-react';
import { cn } from '../../utils';

export type SortOption = 'oldest' | 'newest' | 'unopened' | 'opened';

export interface VintageSearchAndSortProps extends React.HTMLAttributes<HTMLDivElement> {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  monthScope: 'current' | 'all';
  onMonthScopeChange: (scope: 'current' | 'all') => void;
  readFilter: 'all' | 'read' | 'unread';
  onReadFilterChange: (filter: 'all' | 'read' | 'unread') => void;
  favoriteOnly: boolean;
  onFavoriteOnlyChange: (favOnly: boolean) => void;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  currentMonthName: string;
  activeFiltersCount: number;
  onClearFilters: () => void;
  totalResultsCount?: number;
}

const SORT_LABELS: Record<SortOption, { label: string; description: string }> = {
  oldest: { label: 'Oldest First', description: 'Chronological (1st to end)' },
  newest: { label: 'Newest First', description: 'Latest letters first' },
  unopened: { label: 'Unopened First', description: 'Awaiting your reading' },
  opened: { label: 'Opened First', description: 'Already unfolded' },
};

export const VintageSearchAndSort: React.FC<VintageSearchAndSortProps> = ({
  className,
  searchQuery,
  onSearchChange,
  monthScope,
  onMonthScopeChange,
  readFilter,
  onReadFilterChange,
  favoriteOnly,
  onFavoriteOnlyChange,
  sortBy = 'oldest',
  onSortChange,
  currentMonthName,
  activeFiltersCount,
  onClearFilters,
  totalResultsCount,
  ...props
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSortOpen) {
        setIsSortOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSortOpen]);

  return (
    <div className={cn('space-y-3', className)} {...props}>
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Archival Handwritten Catalogue Search Field */}
        <div className="flex-1 min-w-[260px] relative">
          <div
            className={cn(
              'relative flex items-center rounded-[8px] transition-all duration-200 overflow-hidden',
              'bg-[#FAF5EC] border',
              isSearchFocused
                ? 'border-[#B58A45] bg-[#FFFDF9] shadow-[0_2px_10px_rgba(181,138,69,0.15)] ring-1 ring-[#B58A45]/30'
                : 'border-[rgba(138,110,89,0.38)] shadow-2xs hover:border-[rgba(138,110,89,0.55)]'
            )}
          >
            {/* Paper Texture Overlay */}
            <div
              className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.08' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
                backgroundSize: '80px 80px',
              }}
            />

            {/* Vintage Archival Search Icon (Magnifying Symbol) */}
            <div className="relative pl-3.5 pr-2 py-2 flex items-center pointer-events-none">
              <Search
                className={cn(
                  'h-4 w-4 transition-colors duration-150',
                  isSearchFocused ? 'text-[#B58A45]' : 'text-[#8A6E59]'
                )}
                strokeWidth={1.75}
              />
            </div>

            {/* Classic Serif Search Input */}
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search correspondence by title, text, or date..."
              className={cn(
                'relative z-10 w-full py-2 pr-8 bg-transparent',
                'font-serif text-xs sm:text-sm text-[#3B2A20]',
                'placeholder:text-[#9C8272] placeholder:italic placeholder:font-serif',
                'focus:outline-none'
              )}
            />

            {/* Understated Vintage Clear Search Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  searchInputRef.current?.focus();
                }}
                className={cn(
                  'relative z-10 mr-2 p-1 rounded transition-colors',
                  'text-[#8A6E59] hover:text-[#7A2E3B] hover:bg-[#EFE4D6]',
                  'focus:outline-none focus:ring-1 focus:ring-[#B58A45]'
                )}
                aria-label="Clear search text"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Archival Controls Group: Sort & Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 max-w-full no-scrollbar sm:flex-wrap sm:overflow-visible sm:pb-0">
          {/* Vintage Archival Sort Selector */}
          {onSortChange && (
            <div className="relative shrink-0" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className={cn(
                  'h-8.5 px-3 rounded-[6px] text-xs font-serif transition-all flex items-center gap-1.5 border select-none touch-manipulation',
                  'bg-[#FAF5EC] shadow-2xs',
                  isSortOpen || sortBy !== 'oldest'
                    ? 'border-[#B58A45] text-[#3B2A20] bg-[#FFFDF9]'
                    : 'border-[rgba(138,110,89,0.32)] text-[#5A4537] hover:border-[rgba(138,110,89,0.55)] hover:text-[#3B2A20]'
                )}
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
                title="Archival Index Sorting"
              >
                <span className="text-[9.5px] uppercase tracking-wider font-semibold text-[#8A6E59]">
                  SORT:
                </span>
                <span className="font-medium text-[#3B2A20] whitespace-nowrap">
                  {SORT_LABELS[sortBy]?.label.replace(' First', '')}
                </span>
                <ArrowDownUp
                  className={cn(
                    'h-3 w-3 transition-transform duration-150',
                    isSortOpen ? 'text-[#B58A45]' : 'text-[#8A6E59]'
                  )}
                />
              </button>

              {/* Archival Paper Index Dropdown */}
              {isSortOpen && (
                <div
                  className={cn(
                    'absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-52 rounded-[8px] z-50 overflow-hidden',
                    'bg-[#FAF5EC] border border-[rgba(138,110,89,0.45)]',
                    'shadow-[0_8px_24px_-4px_rgba(60,42,33,0.22)]',
                    'animate-in fade-in zoom-in-95 duration-150'
                  )}
                  role="listbox"
                >
                  {/* Parchment Noise Overlay */}
                  <div
                    className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.1' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
                      backgroundSize: '60px 60px',
                    }}
                  />

                  {/* Dropdown Header */}
                  <div className="relative px-3 py-1.5 bg-[#F3EBE0] border-b border-[rgba(138,110,89,0.25)] flex items-center justify-between">
                    <span className="text-[10px] tracking-widest uppercase font-serif text-[#8A6E59] font-medium">
                      Archival Index Order
                    </span>
                    <span className="text-[9px] text-[#B58A45] font-serif italic">
                      ❧
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="relative py-1">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((optionKey) => {
                      const isSelected = sortBy === optionKey;
                      const option = SORT_LABELS[optionKey];
                      return (
                        <button
                          key={optionKey}
                          type="button"
                          onClick={() => {
                            onSortChange(optionKey);
                            setIsSortOpen(false);
                          }}
                          className={cn(
                            'w-full px-3 py-2 text-left text-xs font-serif transition-colors flex items-center justify-between gap-2 touch-manipulation',
                            isSelected
                              ? 'bg-[#F2E7D5] text-[#7A2E3B] font-semibold'
                              : 'text-[#3B2A20] hover:bg-[#F6EFE5]'
                          )}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <div className="flex flex-col">
                            <span className="whitespace-nowrap">{option.label}</span>
                            <span className="text-[10px] text-[#8A6E59] font-normal italic">
                              {option.description}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-[#B58A45] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Month Scope Selector */}
          <div className="inline-flex p-0.5 rounded-[6px] text-xs font-medium bg-[#F3EBE0] border border-[rgba(138,110,89,0.28)] shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => onMonthScopeChange('current')}
              className={cn(
                'px-2.5 py-1.5 rounded-[4px] transition-all duration-150 truncate max-w-[130px] font-serif text-xs touch-manipulation',
                'active:scale-[0.98] motion-reduce:active:scale-100',
                'focus-visible:ring-2 focus-visible:ring-[#B58A45] focus:outline-none',
                monthScope === 'current'
                  ? 'bg-[#FAF5EC] text-[#7A2E3B] font-semibold shadow-xs'
                  : 'text-[#6B5547] hover:text-[#3B2A20]'
              )}
            >
              {currentMonthName}
            </button>
            <button
              type="button"
              onClick={() => onMonthScopeChange('all')}
              className={cn(
                'px-2.5 py-1.5 rounded-[4px] transition-all duration-150 font-serif text-xs whitespace-nowrap touch-manipulation',
                'active:scale-[0.98] motion-reduce:active:scale-100',
                'focus-visible:ring-2 focus-visible:ring-[#B58A45] focus:outline-none',
                monthScope === 'all'
                  ? 'bg-[#FAF5EC] text-[#7A2E3B] font-semibold shadow-xs'
                  : 'text-[#6B5547] hover:text-[#3B2A20]'
              )}
            >
              All Letters
            </button>
          </div>

          {/* Read/Unread Filter */}
          <div className="inline-flex p-0.5 rounded-[6px] text-xs font-medium bg-[#F3EBE0] border border-[rgba(138,110,89,0.28)] shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => onReadFilterChange('all')}
              className={cn(
                'px-2 py-1.5 rounded-[4px] transition-all duration-150 flex items-center gap-1 font-serif text-xs whitespace-nowrap touch-manipulation',
                'active:scale-[0.98] motion-reduce:active:scale-100',
                'focus-visible:ring-2 focus-visible:ring-[#B58A45] focus:outline-none',
                readFilter === 'all'
                  ? 'bg-[#FAF5EC] text-[#3B2A20] font-semibold shadow-xs'
                  : 'text-[#6B5547] hover:text-[#3B2A20]'
              )}
            >
              <BookOpen className="h-3 w-3 text-[#7A2E3B]" />
              All
            </button>
            <button
              type="button"
              onClick={() => onReadFilterChange('unread')}
              className={cn(
                'px-2 py-1.5 rounded-[4px] transition-all duration-150 flex items-center gap-1 font-serif text-xs whitespace-nowrap touch-manipulation',
                'active:scale-[0.98] motion-reduce:active:scale-100',
                'focus-visible:ring-2 focus-visible:ring-[#B58A45] focus:outline-none',
                readFilter === 'unread'
                  ? 'bg-[#FAF5EC] text-[#7A2E3B] font-semibold shadow-xs'
                  : 'text-[#6B5547] hover:text-[#3B2A20]'
              )}
            >
              <Circle className="h-3 w-3 text-[#7A2E3B]" />
              Unopened
            </button>
            <button
              type="button"
              onClick={() => onReadFilterChange('read')}
              className={cn(
                'px-2 py-1.5 rounded-[4px] transition-all duration-150 flex items-center gap-1 font-serif text-xs whitespace-nowrap touch-manipulation',
                'active:scale-[0.98] motion-reduce:active:scale-100',
                'focus-visible:ring-2 focus-visible:ring-[#B58A45] focus:outline-none',
                readFilter === 'read'
                  ? 'bg-[#FAF5EC] text-[#4A6342] font-semibold shadow-xs'
                  : 'text-[#6B5547] hover:text-[#3B2A20]'
              )}
            >
              <CheckCircle className="h-3 w-3 text-[#4A6342]" />
              Opened
            </button>
          </div>

          {/* Treasured / Favorites Filter Toggle */}
          <button
            type="button"
            onClick={() => onFavoriteOnlyChange(!favoriteOnly)}
            className={cn(
              'h-8.5 px-2.5 rounded-[6px] border text-xs font-serif font-medium transition-all duration-150 flex items-center gap-1.5 shadow-2xs select-none shrink-0 touch-manipulation whitespace-nowrap',
              'active:scale-[0.98] motion-reduce:active:scale-100',
              'focus-visible:ring-2 focus-visible:ring-[#B58A45] focus-visible:ring-offset-1 focus-visible:ring-offset-[#FAF5EC] focus:outline-none',
              favoriteOnly
                ? 'bg-[#F4E9D8] border-[#B58A45] text-[#8A5B20] font-semibold'
                : 'bg-[#F3EBE0] border-[rgba(138,110,89,0.28)] text-[#6B5547] hover:text-[#3B2A20] hover:border-[#B58A45]/50'
            )}
            aria-pressed={favoriteOnly}
            title="Show only treasured letters"
          >
            <Heart
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-150',
                favoriteOnly ? 'fill-[#B58A45] text-[#B58A45] scale-110' : 'text-[#8A6E59]'
              )}
            />
            <span>Treasured</span>
          </button>

          {/* Active Filters Clear Button */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-8.5 px-2 rounded-[6px] text-xs font-serif text-[#8A6E59] hover:text-[#7A2E3B] hover:bg-[#F3EBE0] transition-colors duration-150 flex items-center gap-1 shrink-0 whitespace-nowrap touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7A2E3B] focus:outline-none"
              title="Reset all search queries and active filters"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Query Result Meta Banner (when searching) */}
      {searchQuery.trim() && (
        <div className="flex items-center justify-between text-xs font-serif text-[#705D4B] px-1 pt-0.5">
          <div className="flex items-center gap-1.5 italic">
            <span className="text-[#B58A45]">❧</span>
            <span>
              Archival search: <strong className="text-[#3B2A20] not-italic">"{searchQuery}"</strong>
              {totalResultsCount !== undefined && (
                <span className="ml-1 text-[#8A5B20]">
                  ({totalResultsCount} {totalResultsCount === 1 ? 'letter found' : 'letters found'})
                </span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="text-[11px] text-[#7A2E3B] hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};
