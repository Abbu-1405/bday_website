import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  FileText,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  LayoutGrid,
  List,
  Layers,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Star,
} from 'lucide-react';
import { Note365, NoteMediaItem } from '../../../types';
import { sampleNotes365 } from '../../../data';
import { getManagedNotes365 } from '../../../services/contentService';
import { AdminNotePreviewModal } from './AdminNotePreviewModal';

type SortOption = 'day-asc' | 'day-desc' | 'date-asc' | 'date-desc' | 'title-asc' | 'media-first';
type FilterType = 'all' | 'milestone' | 'has-image' | 'has-video' | 'has-audio' | 'has-doc' | 'text-only';
type StatusFilter = 'all' | 'unopened' | 'previewed';

interface AdminNotes365PreviewProps {
  onNavigateToContent?: () => void;
}

const MONTH_OPTIONS = [
  { value: 'all', label: 'All Months (12)' },
  { value: '2026-09', label: 'Sep 2026 (Launch)' },
  { value: '2026-10', label: 'Oct 2026' },
  { value: '2026-11', label: 'Nov 2026' },
  { value: '2026-12', label: 'Dec 2026' },
  { value: '2027-01', label: 'Jan 2027' },
  { value: '2027-02', label: 'Feb 2027' },
  { value: '2027-03', label: 'Mar 2027' },
  { value: '2027-04', label: 'Apr 2027' },
  { value: '2027-05', label: 'May 2027' },
  { value: '2027-06', label: 'Jun 2027' },
  { value: '2027-07', label: 'Jul 2027' },
  { value: '2027-08', label: 'Aug 2027' },
  { value: '2027-09', label: 'Sep 2027 (Finale)' },
];

export const AdminNotes365Preview: React.FC<AdminNotes365PreviewProps> = ({
  onNavigateToContent,
}) => {
  const [notes, setNotes] = useState<Note365[]>(sampleNotes365);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<FilterType>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('day-asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  // Ephemeral admin preview state (strictly in-memory for testing, isolated from user data)
  const [previewedNoteIds, setPreviewedNoteIds] = useState<Set<string>>(new Set());
  const [sessionFavorites, setSessionFavorites] = useState<Set<string>>(new Set());
  const [activePreviewNote, setActivePreviewNote] = useState<Note365 | null>(null);

  // Load existing notes and any Firestore overrides from Content Hub
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getManagedNotes365()
      .then((managedNotes) => {
        if (isMounted) {
          setNotes(managedNotes);
        }
      })
      .catch((err) => {
        console.warn('Error fetching managed notes dataset for admin preview:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Helpers to inspect note media
  const getNoteMediaItems = (note: Note365): NoteMediaItem[] => {
    if (note.mediaItems && note.mediaItems.length > 0) return note.mediaItems;
    if (note.media && note.media.type !== 'none') return [note.media];
    return [];
  };

  const hasMediaType = (note: Note365, type: string): boolean => {
    const items = getNoteMediaItems(note);
    return items.some((item) => item.type === type);
  };

  // Metric summaries
  const metrics = useMemo(() => {
    let totalWithMedia = 0;
    let totalWithImages = 0;
    let totalWithVideos = 0;
    let totalWithAudio = 0;
    let totalWithDocs = 0;

    notes.forEach((n) => {
      const items = getNoteMediaItems(n);
      if (items.length > 0) {
        totalWithMedia++;
        if (items.some((i) => i.type === 'image')) totalWithImages++;
        if (items.some((i) => i.type === 'video')) totalWithVideos++;
        if (items.some((i) => i.type === 'audio')) totalWithAudio++;
        if (items.some((i) => i.type === 'document')) totalWithDocs++;
      }
    });

    return {
      total: notes.length,
      totalWithMedia,
      totalWithImages,
      totalWithVideos,
      totalWithAudio,
      totalWithDocs,
      previewedCount: previewedNoteIds.size,
    };
  }, [notes, previewedNoteIds]);

  // Derived filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // 1. Month filter
      if (selectedMonth !== 'all') {
        if (!n.date.startsWith(selectedMonth)) return false;
      }

      // 2. Type / category filter
      if (selectedTypeFilter === 'milestone') {
        const d = n.dayIndex ?? 1;
        const isSpecial = d <= 5 || d === 100 || d === 200 || d === 300 || d === 365;
        if (!isSpecial) return false;
      } else if (selectedTypeFilter === 'has-image') {
        if (!hasMediaType(n, 'image')) return false;
      } else if (selectedTypeFilter === 'has-video') {
        if (!hasMediaType(n, 'video')) return false;
      } else if (selectedTypeFilter === 'has-audio') {
        if (!hasMediaType(n, 'audio')) return false;
      } else if (selectedTypeFilter === 'has-doc') {
        if (!hasMediaType(n, 'document')) return false;
      } else if (selectedTypeFilter === 'text-only') {
        if (getNoteMediaItems(n).length > 0) return false;
      }

      // 3. Preview session status filter
      const isPreviewed = previewedNoteIds.has(n.id);
      if (selectedStatusFilter === 'unopened' && isPreviewed) return false;
      if (selectedStatusFilter === 'previewed' && !isPreviewed) return false;

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const formattedIndex = `#${String(n.dayIndex ?? '').padStart(3, '0')}`;
        const rawIndex = String(n.dayIndex ?? '');

        const matchesIndex =
          formattedIndex.toLowerCase().includes(q) ||
          rawIndex === q ||
          `note ${rawIndex}`.includes(q);
        const matchesDate = n.date.toLowerCase().includes(q);
        const matchesDisplayDate = (n.displayDate || '').toLowerCase().includes(q);
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesPreview = (n.preview || '').toLowerCase().includes(q);
        const matchesContent = (n.content || '').toLowerCase().includes(q);
        const matchesCategory = (n.category || '').toLowerCase().includes(q);

        if (
          !matchesIndex &&
          !matchesDate &&
          !matchesDisplayDate &&
          !matchesTitle &&
          !matchesPreview &&
          !matchesContent &&
          !matchesCategory
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    notes,
    selectedMonth,
    selectedTypeFilter,
    selectedStatusFilter,
    searchQuery,
    previewedNoteIds,
  ]);

  // Derived sorted notes
  const sortedNotes = useMemo(() => {
    const list = [...filteredNotes];
    switch (sortBy) {
      case 'day-asc':
        return list.sort((a, b) => (a.dayIndex ?? 0) - (b.dayIndex ?? 0));
      case 'day-desc':
        return list.sort((a, b) => (b.dayIndex ?? 0) - (a.dayIndex ?? 0));
      case 'date-asc':
        return list.sort((a, b) => a.date.localeCompare(b.date));
      case 'date-desc':
        return list.sort((a, b) => b.date.localeCompare(a.date));
      case 'title-asc':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'media-first':
        return list.sort((a, b) => {
          const aCount = getNoteMediaItems(a).length;
          const bCount = getNoteMediaItems(b).length;
          if (aCount !== bCount) return bCount - aCount;
          return (a.dayIndex ?? 0) - (b.dayIndex ?? 0);
        });
      default:
        return list;
    }
  }, [filteredNotes, sortBy]);

  // Reset pagination when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMonth, selectedTypeFilter, selectedStatusFilter, sortBy, itemsPerPage]);

  // Paginated slice
  const paginatedNotes = useMemo(() => {
    if (itemsPerPage === -1) return sortedNotes;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedNotes.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedNotes, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.max(1, Math.ceil(sortedNotes.length / itemsPerPage));

  // Open note in Admin Preview Mode
  const handleOpenPreview = (note: Note365) => {
    // Record previewed state strictly in local admin session
    setPreviewedNoteIds((prev) => {
      const next = new Set(prev);
      next.add(note.id);
      return next;
    });
    setActivePreviewNote(note);
  };

  const handleToggleSessionFavorite = (noteId: string) => {
    setSessionFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMonth('all');
    setSelectedTypeFilter('all');
    setSelectedStatusFilter('all');
    setSortBy('day-asc');
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedMonth !== 'all' ||
    selectedTypeFilter !== 'all' ||
    selectedStatusFilter !== 'all' ||
    sortBy !== 'day-asc';

  return (
    <div className="space-y-6 select-none font-sans text-slate-100 pb-12">
      {/* Top Banner & Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ADMIN TESTING / PREVIEW
              </span>
              <span className="text-xs font-mono text-slate-400">
                Total: 365 Notes Available Immediately
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-100 flex items-center gap-2">
              365 NOTES — ADMIN PREVIEW
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Preview every note without affecting user progress or unlock state. Immediate access
              to all 365 calendar entries for quality testing and content verification.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {onNavigateToContent && (
              <button
                onClick={onNavigateToContent}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors border border-slate-700"
              >
                <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                Content Hub
              </button>
            )}
          </div>
        </div>

        {/* Quick Metric Stats Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90">
            <span className="text-[11px] text-slate-400 block">Total Notes</span>
            <span className="text-lg font-mono font-semibold text-slate-100">
              {metrics.total}
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90">
            <span className="text-[11px] text-slate-400 block">With Rich Media</span>
            <span className="text-lg font-mono font-semibold text-indigo-400">
              {metrics.totalWithMedia}
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90">
            <span className="text-[11px] text-slate-400 block">Previewed (This Session)</span>
            <span className="text-lg font-mono font-semibold text-emerald-400">
              {metrics.previewedCount} / 365
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90">
            <span className="text-[11px] text-slate-400 block">Isolated State</span>
            <span className="text-xs font-mono font-medium text-amber-300 block mt-1">
              ZERO USER MUTATION
            </span>
          </div>
        </div>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Search Bar Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by note number (e.g. #001 or 27), date, title, or content..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-slate-100 placeholder-slate-500 transition-colors outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Compact list view"
                aria-label="Compact list view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {/* Month Selector */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Month Scope
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category / Media Type Selector */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Content / Media
            </label>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as FilterType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Content</option>
              <option value="milestone">Milestones & Specials</option>
              <option value="has-image">Has Image Photos</option>
              <option value="has-video">Has Video Clips</option>
              <option value="has-audio">Has Audio Ambient</option>
              <option value="has-doc">Has PDF Documents</option>
              <option value="text-only">Text Only (No Media)</option>
            </select>
          </div>

          {/* Session Preview Status */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Testing Status
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as StatusFilter)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All (Unopened & Previewed)</option>
              <option value="unopened">Unopened in Preview</option>
              <option value="previewed">Previewed this Session</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Order / Sorting
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="day-asc">Oldest First (#001 → #365)</option>
              <option value="day-desc">Newest First (#365 → #001)</option>
              <option value="date-asc">Date (Ascending)</option>
              <option value="date-desc">Date (Descending)</option>
              <option value="title-asc">Title (A → Z)</option>
              <option value="media-first">Rich Media First</option>
            </select>
          </div>
        </div>

        {/* Results Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div>
            Showing <span className="font-mono font-semibold text-slate-200">{sortedNotes.length}</span> of{' '}
            <span className="font-mono text-slate-400">{notes.length}</span> notes
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>All (365)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Note List / Grid */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : sortedNotes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-200">No notes match your filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms, clearing selected categories, or resetting filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* Compact List View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden shadow-sm">
          {paginatedNotes.map((note) => {
            const formattedIndex = `#${String(note.dayIndex ?? 1).padStart(3, '0')}`;
            const mediaItems = getNoteMediaItems(note);
            const isPreviewed = previewedNoteIds.has(note.id);
            const isFav = sessionFavorites.has(note.id) || note.isFavorite;

            return (
              <div
                key={note.id}
                className={`p-3 sm:p-4 hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isPreviewed ? 'bg-slate-900/40' : ''
                }`}
              >
                <div className="flex items-start sm:items-center space-x-3 min-w-0">
                  {/* Note Number Badge */}
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-950 text-indigo-400 border border-slate-800 shrink-0">
                    {formattedIndex}
                  </span>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {note.displayDate || note.date}
                      </span>

                      {/* Media Badges */}
                      {mediaItems.map((m, idx) => {
                        if (m.type === 'image') {
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            >
                              <ImageIcon className="w-3 h-3" /> Photo
                            </span>
                          );
                        }
                        if (m.type === 'video') {
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            >
                              <VideoIcon className="w-3 h-3" /> Video
                            </span>
                          );
                        }
                        if (m.type === 'audio') {
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            >
                              <MusicIcon className="w-3 h-3" /> Audio
                            </span>
                          );
                        }
                        if (m.type === 'document') {
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            >
                              <FileText className="w-3 h-3" /> PDF
                            </span>
                          );
                        }
                        return null;
                      })}

                      {isPreviewed && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Previewed
                        </span>
                      )}

                      {isFav && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current" /> Favorited
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 truncate">
                      {note.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {note.preview || note.content}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleOpenPreview(note)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-medium transition-all shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedNotes.map((note) => {
            const formattedIndex = `#${String(note.dayIndex ?? 1).padStart(3, '0')}`;
            const mediaItems = getNoteMediaItems(note);
            const isPreviewed = previewedNoteIds.has(note.id);
            const isFav = sessionFavorites.has(note.id) || note.isFavorite;

            return (
              <div
                key={note.id}
                onClick={() => handleOpenPreview(note)}
                className={`group bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-sm space-y-3 ${
                  isPreviewed ? 'border-emerald-500/20' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-950 text-indigo-400 border border-slate-800">
                      {formattedIndex}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {note.displayDate || note.date}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {note.title}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {note.preview || note.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {mediaItems.map((m, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {m.type}
                      </span>
                    ))}
                    {mediaItems.length === 0 && (
                      <span className="text-[10px] text-slate-500 italic">Text</span>
                    )}
                  </div>

                  <span className="text-xs text-indigo-400 group-hover:translate-x-0.5 transition-transform font-medium">
                    Preview →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Page <span className="font-mono font-semibold text-slate-200">{currentPage}</span> of{' '}
            <span className="font-mono font-semibold text-slate-200">{totalPages}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-slate-200 transition-colors border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-slate-200 transition-colors border border-slate-700"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Admin Note Preview Modal */}
      <AdminNotePreviewModal
        note={activePreviewNote}
        allNotes={sortedNotes.length > 0 ? sortedNotes : notes}
        sessionFavorites={sessionFavorites}
        onToggleSessionFavorite={handleToggleSessionFavorite}
        onClose={() => setActivePreviewNote(null)}
        onSelectNote={(nextNote) => {
          setPreviewedNoteIds((prev) => {
            const next = new Set(prev);
            next.add(nextNote.id);
            return next;
          });
          setActivePreviewNote(nextNote);
        }}
      />
    </div>
  );
};
