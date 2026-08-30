import React from 'react';
import { Search, X, Heart, BookOpen, CheckCircle, Circle } from 'lucide-react';
import { Input } from '../Input';
import { Button } from '../Button';
import { cn } from '../../utils';
import { useTheme } from '../../hooks';
import { VintageSearchAndSort, SortOption } from '../letterArchive/VintageSearchAndSort';

export type { SortOption };

export interface NoteFilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
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

export const NoteFilterBar: React.FC<NoteFilterBarProps> = ({
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
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';

  if (isLetterArchive) {
    return (
      <VintageSearchAndSort
        className={className}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        monthScope={monthScope}
        onMonthScopeChange={onMonthScopeChange}
        readFilter={readFilter}
        onReadFilterChange={onReadFilterChange}
        favoriteOnly={favoriteOnly}
        onFavoriteOnlyChange={onFavoriteOnlyChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        currentMonthName={currentMonthName}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={onClearFilters}
        totalResultsCount={totalResultsCount}
        {...props}
      />
    );
  }

  return (
    <div className={cn('space-y-3.5', className)} {...props}>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input Control */}
        <div className="flex-1 min-w-[240px]">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isLetterArchive
                ? "Search correspondence by title, text, or date..."
                : "Search notes by title, text, or date (e.g. '27 Sept')..."
            }
            leftIcon={
              <Search
                className={cn(
                  "h-4 w-4",
                  isLetterArchive ? "text-[#8A6E59]" : "text-[var(--color-muted)]"
                )}
              />
            }
            rightIcon={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="p-1 rounded-full hover:bg-[var(--color-surface-secondary)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                  aria-label="Clear search text"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : undefined
            }
            className={cn(
              "text-xs sm:text-sm",
              isLetterArchive
                ? "bg-[#FAF5EC] border-[rgba(138,110,89,0.35)] text-[#3B2A20] placeholder:text-[#9C8272] focus:border-[#7A2E3B]"
                : "bg-[var(--color-surface)] border-[var(--color-border)]"
            )}
          />
        </div>

        {/* Filter Controls Group */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Month Scope Selector */}
          <div
            className={cn(
              "inline-flex p-1 rounded-[var(--radius-md)] text-xs font-medium",
              isLetterArchive
                ? "bg-[#F3EBE0] border border-[rgba(138,110,89,0.28)]"
                : "bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]"
            )}
          >
            <button
              type="button"
              onClick={() => onMonthScopeChange('current')}
              className={cn(
                'px-2.5 py-1 rounded-[var(--radius-sm)] transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-95 motion-reduce:transform-none cursor-pointer truncate max-w-[140px]',
                monthScope === 'current'
                  ? isLetterArchive
                    ? 'bg-[#FAF5EC] text-[#7A2E3B] font-semibold font-serif shadow-xs'
                    : 'bg-[var(--color-surface)] text-[var(--color-primary)] font-semibold shadow-xs'
                  : isLetterArchive
                  ? 'text-[#6B5547] hover:text-[#3B2A20] font-serif'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )}
            >
              {currentMonthName}
            </button>
            <button
              type="button"
              onClick={() => onMonthScopeChange('all')}
              className={cn(
                'px-2.5 py-1 rounded-[var(--radius-sm)] transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-95 motion-reduce:transform-none cursor-pointer',
                monthScope === 'all'
                  ? isLetterArchive
                    ? 'bg-[#FAF5EC] text-[#7A2E3B] font-semibold font-serif shadow-xs'
                    : 'bg-[var(--color-surface)] text-[var(--color-primary)] font-semibold shadow-xs'
                  : isLetterArchive
                  ? 'text-[#6B5547] hover:text-[#3B2A20] font-serif'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )}
            >
              {isLetterArchive ? 'All Correspondence' : 'All 365 Notes'}
            </button>
          </div>

          {/* Read/Unread Filter */}
          <div
            className={cn(
              "inline-flex p-1 rounded-[var(--radius-md)] text-xs font-medium",
              isLetterArchive
                ? "bg-[#F3EBE0] border border-[rgba(138,110,89,0.28)]"
                : "bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]"
            )}
          >
            <button
              type="button"
              onClick={() => onReadFilterChange('all')}
              className={cn(
                'px-2 py-1 rounded-[var(--radius-sm)] transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-95 motion-reduce:transform-none cursor-pointer flex items-center gap-1',
                readFilter === 'all'
                  ? isLetterArchive
                    ? 'bg-[#FAF5EC] text-[#3B2A20] font-semibold font-serif shadow-xs'
                    : 'bg-[var(--color-surface)] text-[var(--color-primary)] font-semibold shadow-xs'
                  : isLetterArchive
                  ? 'text-[#6B5547] hover:text-[#3B2A20] font-serif'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )}
            >
              <BookOpen className={cn("h-3 w-3", isLetterArchive && "text-[#7A2E3B]")} />
              All
            </button>
            <button
              type="button"
              onClick={() => onReadFilterChange('unread')}
              className={cn(
                'px-2 py-1 rounded-[var(--radius-sm)] transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-95 motion-reduce:transform-none cursor-pointer flex items-center gap-1',
                readFilter === 'unread'
                  ? isLetterArchive
                    ? 'bg-[#FAF5EC] text-[#7A2E3B] font-semibold font-serif shadow-xs'
                    : 'bg-[var(--color-surface)] text-[var(--color-primary)] font-semibold shadow-xs'
                  : isLetterArchive
                  ? 'text-[#6B5547] hover:text-[#3B2A20] font-serif'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )}
            >
              <Circle className={cn("h-3 w-3", isLetterArchive ? "text-[#7A2E3B]" : "text-[var(--color-primary)]")} />
              {isLetterArchive ? 'Unopened' : 'Unread'}
            </button>
            <button
              type="button"
              onClick={() => onReadFilterChange('read')}
              className={cn(
                'px-2 py-1 rounded-[var(--radius-sm)] transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-95 motion-reduce:transform-none cursor-pointer flex items-center gap-1',
                readFilter === 'read'
                  ? isLetterArchive
                    ? 'bg-[#FAF5EC] text-[#4A6342] font-semibold font-serif shadow-xs'
                    : 'bg-[var(--color-surface)] text-[var(--color-primary)] font-semibold shadow-xs'
                  : isLetterArchive
                  ? 'text-[#6B5547] hover:text-[#3B2A20] font-serif'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )}
            >
              <CheckCircle className={cn("h-3 w-3", isLetterArchive ? "text-[#4A6342]" : "text-[var(--color-success)]")} />
              {isLetterArchive ? 'Opened' : 'Read'}
            </button>
          </div>

          {/* Favorites Filter Toggle */}
          <button
            type="button"
            onClick={() => onFavoriteOnlyChange(!favoriteOnly)}
            className={cn(
              'px-3 py-1.5 rounded-[var(--radius-md)] border text-xs font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out active:scale-95 motion-reduce:transform-none cursor-pointer flex items-center gap-1.5 [@media(hover:hover)]:hover:-translate-y-0.5',
              isLetterArchive
                ? favoriteOnly
                  ? 'bg-[#F4E9D8] border-[#B58A45] text-[#8A5B20] font-serif font-semibold shadow-xs'
                  : 'bg-[#F3EBE0] border-[rgba(138,110,89,0.28)] text-[#6B5547] hover:text-[#3B2A20] font-serif hover:border-[#B58A45]/50'
                : favoriteOnly
                ? 'bg-[var(--color-accent)]/15 border-[var(--color-accent)] text-[var(--color-accent)] font-semibold'
                : 'bg-[var(--color-surface-secondary)] border-[var(--color-border-light)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            )}
            aria-pressed={favoriteOnly}
          >
            <Heart
              className={cn(
                'h-3.5 w-3.5',
                isLetterArchive
                  ? favoriteOnly
                    ? 'fill-[#B58A45] text-[#B58A45]'
                    : 'text-[#8A6E59]'
                  : favoriteOnly && 'fill-current text-[var(--color-accent)]'
              )}
            />
            <span>{isLetterArchive ? 'Treasured' : 'Favorites'}</span>
          </button>

          {/* Active Filters Clear Button */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              leftIcon={<X className="h-3.5 w-3.5" />}
              className={cn(
                "text-xs",
                isLetterArchive
                  ? "text-[#8A6E59] hover:text-[#7A2E3B] font-serif"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              )}
            >
              Reset ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
