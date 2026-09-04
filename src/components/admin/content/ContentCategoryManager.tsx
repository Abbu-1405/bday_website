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
  Terminal,
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
    setCurrentPage(1);
  };

  const getItemBadge = (item: any) => {
    if (category === 'notes') {
      return (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#020408] text-emerald-400 border border-emerald-950">
          {item.date || item.id}
        </span>
      );
    }
    if (category === 'wishes') {
      return (
        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40">
          Wish #{item.number}
        </span>
      );
    }
    if (category === 'openWhen') {
      return (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
          {item.id}
        </span>
      );
    }
    if (category === 'secrets') {
      return (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-500/40">
          {item.unlockType || 'Secret'}
        </span>
      );
    }
    if (category === 'adore') {
      return (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/40">
          {item.category || item.id}
        </span>
      );
    }
    if (category === 'moments') {
      return (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-500/40">
          {item.date || 'Moment'}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 select-none font-mono">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#050811] p-4 rounded-xl border border-emerald-500/20">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 transition-colors border border-emerald-950 cursor-pointer"
            aria-label="Back to content categories"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-emerald-300 uppercase">
                [CAMPAIGN: {categoryTitle}]
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                {items.length} ITEMS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              // Payload item inspection, metadata configuration, and inline editor.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={`Search ${categoryTitle.toLowerCase()}...`}
            className="w-full pl-8 pr-3.5 py-1.5 rounded-lg bg-[#020408] border border-emerald-500/30 text-emerald-200 placeholder:text-emerald-800 text-xs focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Item List Container */}
      <div className="bg-[#050811] border border-emerald-500/20 rounded-xl overflow-hidden shadow-sm">
        {paginatedItems.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs text-slate-400 font-mono">&gt; NO MATCHING CONTENT ITEMS FOUND</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer"
              >
                [CLEAR_SEARCH]
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-emerald-950/60 font-mono">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 hover:bg-[#080d1a] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 max-w-2xl min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getItemBadge(item)}
                    <h3 className="text-xs font-bold text-emerald-200 truncate">
                      {item.title}
                    </h3>
                    {item.status === 'draft' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-500/40">
                        [DRAFT]
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.preview || item.shortDescription || item.description || item.content || item.story}
                  </p>

                  {(item.category || item.location || item.trigger) && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                      {item.category && <span>CAT: {item.category}</span>}
                      {item.location && <span>LOC: {item.location}</span>}
                      {item.trigger && <span>TRIG: {item.trigger}</span>}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>[EDIT]</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-2.5 bg-[#020408] border-t border-emerald-950 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>
              PAGE {currentPage} OF {totalPages} ({filteredItems.length} ITEMS)
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded bg-[#050811] text-slate-400 hover:text-emerald-300 border border-emerald-950 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded bg-[#050811] text-slate-400 hover:text-emerald-300 border border-emerald-950 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
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
