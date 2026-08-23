import React, { useState, useEffect, useMemo } from 'react';
import {
  Pen,
  Filter,
  Search,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Trash2,
  Calendar,
  User,
  Sparkles,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react';
import { DoodleItem, DoodleSection } from '../../../types/doodle';
import { fetchAdminDoodles, deleteUserDoodle } from '../../../services/doodleService';
import { useAuth } from '../../../hooks';

export const AdminDoodlesDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [doodles, setDoodles] = useState<DoodleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState<'all' | DoodleSection>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoodle, setSelectedDoodle] = useState<DoodleItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDoodles = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminDoodles(
        sectionFilter === 'all' ? undefined : sectionFilter,
        100
      );
      setDoodles(data);
    } catch (err) {
      console.warn('Error loading admin doodles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoodles();
  }, [sectionFilter]);

  const handleDelete = async (doodle: DoodleItem) => {
    if (!window.confirm(`Delete doodle "${doodle.title || 'Untitled'}" by ${doodle.userDisplayName || 'User'}?`)) {
      return;
    }

    setDeletingId(doodle.id);
    try {
      await deleteUserDoodle(doodle.id, doodle.userId);
      setDoodles((prev) => prev.filter((d) => d.id !== doodle.id));
      if (selectedDoodle?.id === doodle.id) {
        setSelectedDoodle(null);
      }
    } catch (err) {
      console.warn('Failed to delete doodle from admin:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...doodles];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.title?.toLowerCase().includes(term) ||
          d.userDisplayName?.toLowerCase().includes(term) ||
          d.userEmail?.toLowerCase().includes(term) ||
          d.id.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? tB - tA : tA - tB;
    });

    return result;
  }, [doodles, searchTerm, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Top Filter & Stats Bar */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Pen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                User Doodles
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {doodles.length} drawings
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Drawings from "What Am I To You" and "Your Reflections"
              </p>
            </div>
          </div>

          <button
            onClick={loadDoodles}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters and Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          {/* Section Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">All Sections</option>
              <option value="what-am-i-to-you" className="bg-slate-900 text-slate-200">What Am I To You</option>
              <option value="your-reflections" className="bg-slate-900 text-slate-200">Your Reflections</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-slate-200">Newest First</option>
              <option value="oldest" className="bg-slate-900 text-slate-200">Oldest First</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search title, user, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-200 placeholder:text-slate-500 focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Grid of Doodles */}
      {loading ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading user doodle submissions...</p>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <Pen className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-medium text-slate-300">No doodles found</p>
          <p className="text-xs text-slate-500">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Drawings created by users will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSorted.map((doodle) => (
            <div
              key={doodle.id}
              onClick={() => setSelectedDoodle(doodle)}
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 space-y-3.5 cursor-pointer transition-all duration-200 shadow-md flex flex-col justify-between"
            >
              {/* Top User Info & Section Badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5 min-w-0">
                  {doodle.userPhotoURL ? (
                    <img
                      src={doodle.userPhotoURL}
                      alt={doodle.userDisplayName || 'User'}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {doodle.userDisplayName || 'Anonymous User'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {doodle.userEmail || doodle.userId.slice(0, 10) + '...'}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                    doodle.section === 'what-am-i-to-you'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                  }`}
                >
                  {doodle.section === 'what-am-i-to-you' ? 'What Am I' : 'Reflections'}
                </span>
              </div>

              {/* Thumbnail Frame */}
              <div className="w-full h-36 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80 relative">
                {doodle.thumbnailDataUrl ? (
                  <img
                    src={doodle.thumbnailDataUrl}
                    alt={doodle.title || 'Doodle'}
                    className="max-h-full max-w-full object-contain p-2"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Pen className="w-8 h-8 text-slate-700" />
                )}

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 p-1 rounded-md text-amber-400">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Title & Metadata Bottom Row */}
              <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-medium text-slate-100 truncate">
                    {doodle.title || 'Untitled Drawing'}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doodle);
                    }}
                    disabled={deletingId === doodle.id}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                    title="Delete doodle"
                  >
                    {deletingId === doodle.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(doodle.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span>{doodle.strokes?.length || 0} strokes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doodle Viewer Modal */}
      {selectedDoodle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedDoodle(null)}
        >
          <div
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                      selectedDoodle.section === 'what-am-i-to-you'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                    }`}
                  >
                    {selectedDoodle.section === 'what-am-i-to-you' ? 'What Am I To You' : 'Your Reflections'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ID: {selectedDoodle.id}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-100">
                  {selectedDoodle.title || 'Untitled Doodle'}
                </h3>
              </div>

              <button
                onClick={() => setSelectedDoodle(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Author Profile */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                {selectedDoodle.userPhotoURL ? (
                  <img
                    src={selectedDoodle.userPhotoURL}
                    alt={selectedDoodle.userDisplayName || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-200">
                    {selectedDoodle.userDisplayName || 'Quiet Traveler'}
                  </p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    {selectedDoodle.userEmail || 'UID: ' + selectedDoodle.userId}
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-400">
                <p>{new Date(selectedDoodle.createdAt).toLocaleString()}</p>
                <p className="text-slate-500">{selectedDoodle.strokes?.length || 0} strokes drawn</p>
              </div>
            </div>

            {/* Drawing Preview Area */}
            <div className="w-full h-80 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden relative">
              {selectedDoodle.thumbnailDataUrl ? (
                <img
                  src={selectedDoodle.thumbnailDataUrl}
                  alt={selectedDoodle.title || 'Doodle'}
                  className="max-h-full max-w-full object-contain p-4"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Pen className="w-12 h-12 text-slate-700" />
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleDelete(selectedDoodle)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Submission</span>
              </button>

              <button
                onClick={() => setSelectedDoodle(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
