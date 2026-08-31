import React, { useState, useMemo } from 'react';
import {
  Activity,
  Filter,
  Search,
  Calendar,
  Layers,
  ArrowRight,
  Clock,
  Eye,
  FileText,
  Compass,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { TrackingEvent, SessionHistoryItem } from '../../../types/tracking';

interface ActivityTimelineViewProps {
  events: TrackingEvent[];
  sessions: SessionHistoryItem[];
}

export const ActivityTimelineView: React.FC<ActivityTimelineViewProps> = ({
  events,
  sessions,
}) => {
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(50);

  // Distinct event types
  const distinctEventTypes = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.type) set.add(e.type);
    });
    return Array.from(set).sort();
  }, [events]);

  // Distinct sections
  const distinctSections = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      const sec = e.metadata?.section || e.metadata?.sectionName || e.metadata?.sectionId;
      if (sec) set.add(String(sec));
    });
    return Array.from(set).sort();
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    return events.filter((evt) => {
      // Event type filter
      if (selectedEventType !== 'all' && evt.type !== selectedEventType) {
        return false;
      }

      // Session filter
      if (selectedSessionId !== 'all' && evt.sessionId !== selectedSessionId) {
        return false;
      }

      // Section filter
      if (selectedSection !== 'all') {
        const sec = String(evt.metadata?.section || evt.metadata?.sectionName || evt.metadata?.sectionId || '');
        if (sec.toLowerCase() !== selectedSection.toLowerCase()) {
          return false;
        }
      }

      // Date range filter
      if (selectedDateRange !== 'all') {
        const diff = now - (evt.clientEpoch || 0);
        if (selectedDateRange === 'today' && diff > ONE_DAY_MS) return false;
        if (selectedDateRange === '7d' && diff > 7 * ONE_DAY_MS) return false;
        if (selectedDateRange === '30d' && diff > 30 * ONE_DAY_MS) return false;
      }

      // Search keyword filter
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const metaStr = JSON.stringify(evt.metadata || {}).toLowerCase();
        const typeMatch = evt.type.toLowerCase().includes(q);
        const routeMatch = evt.route?.toLowerCase().includes(q);
        if (!typeMatch && !routeMatch && !metaStr.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [
    events,
    selectedEventType,
    selectedSessionId,
    selectedSection,
    selectedDateRange,
    searchFilter,
  ]);

  const visibleEvents = useMemo(() => {
    return filteredEvents.slice(0, pageSize);
  }, [filteredEvents, pageSize]);

  const formatTimestamp = (epoch: number) => {
    if (!epoch) return '--:--';
    const d = new Date(epoch);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'item_opened':
      case 'item_revisited':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'section_entered':
      case 'section_left':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
      case 'navigation':
        return 'bg-teal-500/10 text-teal-300 border-teal-500/20';
      case 'media_viewed':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/20';
      case 'search_performed':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
      case 'filter_applied':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'sneak_peek_viewed':
      case 'sneak_peek_skipped':
      case 'sneak_peek_completed':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'error':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const renderEventDetails = (evt: TrackingEvent) => {
    const meta = evt.metadata || {};
    switch (evt.type) {
      case 'item_opened':
      case 'item_revisited':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-200">
              {meta.title || `Item #${meta.itemNumber || meta.itemId}`}
            </span>
            {meta.section && (
              <span className="text-slate-400">in {meta.section}</span>
            )}
            {meta.itemId && (
              <span className="text-[10px] font-mono text-slate-500">
                (ID: {meta.itemId})
              </span>
            )}
          </div>
        );
      case 'section_entered':
        return (
          <span className="text-slate-200">
            Entered <strong className="text-indigo-300">{meta.sectionName || meta.sectionId || 'Section'}</strong>
          </span>
        );
      case 'section_left':
        return (
          <span className="text-slate-400">
            Left {meta.sectionName || meta.sectionId} — active {meta.durationSeconds || 0}s
          </span>
        );
      case 'navigation':
        return (
          <div className="flex items-center gap-1.5 text-slate-300 flex-wrap">
            <span>{meta.fromSection || 'Home'}</span>
            <ArrowRight className="w-3 h-3 text-indigo-400" />
            <strong className="text-indigo-300">{meta.toSection}</strong>
          </div>
        );
      case 'search_performed':
        return (
          <span className="text-slate-200">
            Searched: <strong className="font-mono text-cyan-300">"{meta.searchTerm}"</strong>{' '}
            {meta.resultCount !== undefined && (
              <span className="text-slate-400 text-[10px]">({meta.resultCount} results)</span>
            )}
          </span>
        );
      case 'filter_applied':
        return (
          <span className="text-slate-200">
            Applied {meta.filterType}: <strong className="text-purple-300">{meta.selectedValue}</strong>
          </span>
        );
      case 'media_viewed':
        return (
          <span className="text-slate-200">
            Viewed {meta.mediaType || 'media'}: <strong className="text-sky-300">{meta.title || meta.mediaId}</strong>
          </span>
        );
      case 'sneak_peek_viewed':
      case 'sneak_peek_skipped':
      case 'sneak_peek_completed':
        return (
          <span className="text-slate-200 capitalize font-medium">
            Sneak a Peek: {evt.type.replace('sneak_peek_', '')}
          </span>
        );
      case 'error':
        return (
          <span className="text-rose-300">
            {meta.category || 'Error'}: {meta.message}
          </span>
        );
      default:
        return (
          <span className="text-slate-400 font-mono text-[11px]">
            {JSON.stringify(meta)}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Complete Chronological Activity Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time verified log of every interaction event performed by this user.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {visibleEvents.length} of {filteredEvents.length} events ({events.length} total)
        </span>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search events..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Event Type Filter */}
        <select
          value={selectedEventType}
          onChange={(e) => setSelectedEventType(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="all">All Event Types</option>
          {distinctEventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Section Filter */}
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="all">All Sections</option>
          {distinctSections.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>

        {/* Session Filter */}
        <select
          value={selectedSessionId}
          onChange={(e) => setSelectedSessionId(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="all">All Sessions ({sessions.length})</option>
          {sessions.map((s, idx) => (
            <option key={s.sessionId} value={s.sessionId}>
              Session #{sessions.length - idx} ({s.startedAtFormatted})
            </option>
          ))}
        </select>

        {/* Date Filter */}
        <select
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="all">All Time</option>
          <option value="today">Today (24h)</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Events Timeline */}
      {visibleEvents.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          No activity events match your current filter selection.
        </div>
      ) : (
        <div className="space-y-2 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
          <div className="divide-y divide-slate-800/60">
            {visibleEvents.map((evt) => (
              <div
                key={evt.eventId}
                className="p-3 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-start md:items-center gap-2.5 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border shrink-0 ${getEventBadge(
                      evt.type
                    )}`}
                  >
                    {evt.type}
                  </span>

                  <div className="min-w-0">
                    {renderEventDetails(evt)}
                    {evt.route && (
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Route: {evt.route}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0 text-slate-400 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{formatTimestamp(evt.clientEpoch)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Pagination Button */}
          {pageSize < filteredEvents.length && (
            <div className="p-3 bg-slate-950 text-center border-t border-slate-800">
              <button
                onClick={() => setPageSize((prev) => prev + 50)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Load More Events ({filteredEvents.length - pageSize} remaining)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
