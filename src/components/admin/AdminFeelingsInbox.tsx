import React, { useState, useEffect } from 'react';
import {
  Heart,
  Filter,
  Search,
  ArrowUpDown,
  RefreshCw,
  Eye,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useAuth } from '../../hooks';
import {
  fetchAdminFeelings,
  markSubmissionReadState,
  AdminFeelingSubmission,
} from '../../services/adminInboxService';
import { FeelingReaderModal } from './FeelingReaderModal';

export const AdminFeelingsInbox: React.FC = () => {
  const { currentUser } = useAuth();
  const [feelings, setFeelings] = useState<AdminFeelingSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [maxCount, setMaxCount] = useState<number>(20);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [selectedFeeling, setSelectedFeeling] = useState<AdminFeelingSubmission | null>(null);

  const loadFeelings = async (overrideMaxCount?: number) => {
    setLoading(true);
    const fetchLimit = overrideMaxCount || maxCount;
    try {
      const data = await fetchAdminFeelings(filter, sortOrder, searchTerm, fetchLimit);
      setFeelings(data);
      setHasMore(data.length >= fetchLimit);
    } catch (err) {
      console.warn('Error loading admin feelings inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeelings();
  }, [filter, sortOrder, searchTerm, maxCount]);

  const handleOpenFeeling = async (feeling: AdminFeelingSubmission) => {
    setSelectedFeeling(feeling);
    if (!feeling.isRead && currentUser) {
      try {
        await markSubmissionReadState(feeling.id, true, currentUser.uid);
        setFeelings((prev) =>
          prev.map((item) => (item.id === feeling.id ? { ...item, isRead: true } : item))
        );
        setSelectedFeeling((prev) => (prev ? { ...prev, isRead: true } : null));
      } catch (err) {
        console.warn('Failed to mark feeling as read:', err);
      }
    }
  };

  const handleToggleReadState = async (feelingId: string, currentReadState: boolean) => {
    if (!currentUser) return;
    const newState = !currentReadState;
    try {
      await markSubmissionReadState(feelingId, newState, currentUser.uid);
      setFeelings((prev) =>
        prev.map((item) => (item.id === feelingId ? { ...item, isRead: newState } : item))
      );
      if (selectedFeeling && selectedFeeling.id === feelingId) {
        setSelectedFeeling({ ...selectedFeeling, isRead: newState });
      }
    } catch (err) {
      console.warn('Error toggling read state:', err);
    }
  };

  const unreadCount = feelings.filter((f) => !f.isRead).length;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                Feelings Inbox
                {unreadCount > 0 && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {unreadCount} unread
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Private feelings submitted by users.</p>
            </div>
          </div>

          <button
            onClick={() => loadFeelings()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          {/* Read / Unread Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 shrink-0" />
            {(['all', 'unread', 'read'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1 rounded-lg font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-slate-200">
                Newest First
              </option>
              <option value="oldest" className="bg-slate-900 text-slate-200">
                Oldest First
              </option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search sender name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Submissions List Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading feelings inbox...</p>
          </div>
        ) : feelings.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Heart className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-400">No feelings yet.</p>
            <p className="text-xs text-slate-500">
              Submissions sent through "Write Your Feeling" will appear here safely.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {feelings.map((f) => {
              const snippet =
                f.content.length > 90 ? f.content.slice(0, 90) + '...' : f.content;
              return (
                <div
                  key={f.id}
                  onClick={() => handleOpenFeeling(f)}
                  className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    !f.isRead ? 'bg-indigo-950/15' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* User Avatar */}
                    {f.userPhotoURL ? (
                      <img
                        src={f.userPhotoURL}
                        alt={f.userDisplayName || 'Sender'}
                        className="w-9 h-9 rounded-full border border-slate-700 object-cover shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0 mt-0.5">
                        {(f.userDisplayName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 truncate">
                          {f.userDisplayName}
                        </span>
                        {!f.isRead && (
                          <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                        )}
                        <span className="text-[11px] text-slate-500 font-mono">
                          {f.createdAt}
                        </span>
                      </div>

                      <p className="text-slate-300 font-serif line-clamp-1 italic text-xs">
                        "{snippet}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider ${
                        f.isRead
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {f.isRead ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Read
                        </>
                      ) : (
                        <>
                          <Circle className="w-3 h-3 text-rose-400" /> New
                        </>
                      )}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFeeling(f);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      Read
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Load More */}
        {hasMore && feelings.length > 0 && !loading && (
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-center">
            <button
              onClick={() => setMaxCount((prev) => prev + 20)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
            >
              Load More Feelings
            </button>
          </div>
        )}
      </div>

      {/* Feeling Reader Modal */}
      <FeelingReaderModal
        feeling={selectedFeeling}
        onClose={() => setSelectedFeeling(null)}
        onToggleReadState={handleToggleReadState}
      />
    </div>
  );
};
