import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  ChevronLeft,
  ChevronRight,
  Layers,
  Calendar,
  Smartphone,
  Info,
  ShieldCheck,
} from 'lucide-react';
import {
  NotificationEvent,
  NotificationEventType,
  NotificationEventStatus,
  NotificationDeliveryMode,
  NotificationTimeRange,
  NotificationHistoryFilterState,
} from '../../../types';
import { fetchNotificationHistoryPaginated } from '../../../services/notificationAnalyticsService';
import { AdminNotificationEventInspector } from './AdminNotificationEventInspector';
import { DocumentSnapshot } from 'firebase/firestore';

const CATEGORY_COLORS: Record<NotificationEventType | string, { bg: string; text: string; border: string }> = {
  LETTER_AVAILABLE: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  OPEN_WHEN_AVAILABLE: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  SECRET_UNLOCKED: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  MOMENT_AVAILABLE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  BIRTHDAY: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  GENERAL: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
};

export function AdminNotificationHistory() {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<NotificationEvent | null>(null);

  // Pagination state
  const [lastDocSnap, setLastDocSnap] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Filter state
  const [filters, setFilters] = useState<NotificationHistoryFilterState>({
    status: 'all',
    category: 'all',
    deliveryMode: 'all',
    timeRange: '30d',
    searchQuery: '',
    templateId: '',
    hasFailureOnly: false,
  });

  const loadData = async (resetPage = false) => {
    setLoading(true);
    try {
      const res = await fetchNotificationHistoryPaginated({
        filters,
        pageSize: 20,
        lastVisible: resetPage ? null : lastDocSnap,
      });

      setEvents(res.events);
      setLastDocSnap(res.lastDoc);
      setHasMore(res.hasMore);
      if (resetPage) setPage(1);
    } catch (err) {
      console.error('Error loading notification history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, [
    filters.status,
    filters.category,
    filters.deliveryMode,
    filters.timeRange,
    filters.hasFailureOnly,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(true);
  };

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return 'N/A';
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? isoStr : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by event ID, recipient UID, title, or message..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shrink-0"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => loadData(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh History"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </form>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="sent">Delivered / Sent</option>
            <option value="pending">Pending Queue</option>
            <option value="scheduled">Scheduled</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed Delivery</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value as any }))}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="LETTER_AVAILABLE">Letters</option>
            <option value="OPEN_WHEN_AVAILABLE">Open When</option>
            <option value="SECRET_UNLOCKED">Secrets</option>
            <option value="MOMENT_AVAILABLE">Moments</option>
            <option value="BIRTHDAY">Birthday</option>
            <option value="GENERAL">General</option>
          </select>

          {/* Delivery Mode Filter */}
          <select
            value={filters.deliveryMode}
            onChange={(e) => setFilters((prev) => ({ ...prev, deliveryMode: e.target.value as any }))}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Modes</option>
            <option value="immediate">Immediate</option>
            <option value="scheduled">Scheduled</option>
          </select>

          {/* Time Range Filter */}
          <select
            value={filters.timeRange}
            onChange={(e) => setFilters((prev) => ({ ...prev, timeRange: e.target.value as NotificationTimeRange }))}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          {/* Failures Only Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer ml-auto text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={filters.hasFailureOnly}
              onChange={(e) => setFilters((prev) => ({ ...prev, hasFailureOnly: e.target.checked }))}
              className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px] font-medium">Failures Only</span>
          </label>
        </div>
      </div>

      {/* Events Table / Card List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-semibold text-slate-200">Authoritative Event History Log</h3>
            <span className="text-[10px] font-mono text-slate-500">({events.length} records)</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Privacy Protected
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading notification history...
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No notification events matched the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {events.map((evt) => {
              const catStyle = CATEGORY_COLORS[evt.type] || CATEGORY_COLORS.GENERAL;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                        {evt.type}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                          evt.status === 'sent'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : evt.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : evt.status === 'scheduled'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {evt.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{evt.deliveryMode}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        UID: {evt.userId ? `${evt.userId.slice(0, 6)}...` : 'N/A'}
                      </span>
                    </div>

                    <div className="font-medium text-slate-200 text-xs truncate">
                      {evt.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {evt.body}
                    </div>

                    {evt.failureReason && (
                      <div className="text-[10px] text-rose-400 font-mono line-clamp-1 pt-0.5">
                        Error: {evt.failureReason}
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-[11px] text-slate-400 font-mono shrink-0 gap-1.5">
                    <span>{formatDate(evt.sentAt || evt.createdAt)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(evt);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-sans font-medium flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Inspect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Pagination Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Page {page} • Displaying up to 20 events per view
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (page > 1) {
                  setPage((p) => p - 1);
                  loadData(true);
                }
              }}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              onClick={() => {
                if (hasMore) {
                  setPage((p) => p + 1);
                  loadData(false);
                }
              }}
              disabled={!hasMore || loading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspector Modal */}
      <AdminNotificationEventInspector
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
