import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Calendar,
  Tag,
  Sparkles,
  Lock,
  Heart,
  Camera,
  FileText,
} from 'lucide-react';
import { ContentCategory } from '../../../services/contentService';
import { ContentItemEditorModal } from './ContentItemEditorModal';

interface ContentCategoryManagerProps {
  category: ContentCategory;
  categoryTitle: string;
  items: any[];
  onBack: () => void;
  onItemUpdated: (updatedItem: any) => void;
}

const ITEMS_PER_PAGE = 25;

export function ContentCategoryManager({
  category,
  categoryTitle,
  items,
  onBack,
  onItemUpdated,
}: ContentCategoryManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();

    return items.filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(q);
      const contentMatch = (item.content || item.story || '').toLowerCase().includes(q);
      const previewMatch = (
        item.preview ||
        item.shortDescription ||
        item.description ||
        ''
      )
        .toLowerCase()
        .includes(q);
      const idMatch = item.id?.toLowerCase().includes(q);
      const dateMatch = item.date?.toLowerCase().includes(q);
      const categoryMatch = item.category?.toLowerCase().includes(q);
      const locationMatch = item.location?.toLowerCase().includes(q);
      const wishNumMatch = item.number ? `wish #${item.number}`.includes(q) : false;

      return (
        titleMatch ||
        contentMatch ||
        previewMatch ||
        idMatch ||
        dateMatch ||
        categoryMatch ||
        locationMatch ||
        wishNumMatch
      );
    });
  }, [items, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset to first page on search
  };

  const getItemBadge = (item: any) => {
    if (category === 'notes') {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {item.date || item.id}
        </span>
      );
    }
    if (category === 'wishes') {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Wish #{item.number}
        </span>
      );
    }
    if (category === 'openWhen') {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {item.id}
        </span>
      );
    }
    if (category === 'secrets') {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
          {item.unlockType || 'Secret'}
        </span>
      );
    }
    if (category === 'adore') {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {item.category || item.id}
        </span>
      );
    }
    if (category === 'moments') {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          {item.date || 'Moment'}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 select-none">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/80 cursor-pointer"
            aria-label="Back to content categories"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-100">{categoryTitle}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {items.length} Total Items
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Select an entry below to edit content, preview formatting, or manage metadata.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={`Search ${categoryTitle.toLowerCase()}...`}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Item List Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {paginatedItems.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium">No matching content items found.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Clear search query
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-2xl min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getItemBadge(item)}
                    <h3 className="text-xs font-semibold text-slate-100 truncate font-serif">
                      {item.title}
                    </h3>
                    {item.status === 'draft' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        DRAFT
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 font-serif leading-relaxed">
                    {item.preview || item.shortDescription || item.description || item.content || item.story}
                  </p>

                  {(item.category || item.location || item.trigger) && (
                    <div className="text-[10px] text-slate-500 font-sans flex items-center gap-2 pt-0.5">
                      {item.category && <span>Category: {item.category}</span>}
                      {item.location && <span>Location: {item.location}</span>}
                      {item.trigger && <span>Trigger: {item.trigger}</span>}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/80 transition-all cursor-pointer shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Entry</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar for large datasets */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Page {currentPage} of {totalPages} ({filteredItems.length} items)
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Item Editor Modal */}
      <ContentItemEditorModal
        category={category}
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSaveSuccess={(updated) => {
          onItemUpdated(updated);
        }}
      />
    </div>
  );
}
