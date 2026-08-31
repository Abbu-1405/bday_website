import React, { useState } from 'react';
import {
  Compass,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  ArrowRight,
  Eye,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { SessionHistoryItem, DeviceCategory, TrackingEvent } from '../../../types/tracking';

interface SessionHistoryListProps {
  sessions: SessionHistoryItem[];
}

export const SessionHistoryList: React.FC<SessionHistoryListProps> = ({ sessions }) => {
  const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(new Set());

  const toggleExpand = (sessionId: string) => {
    setExpandedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  const getDeviceIcon = (category?: DeviceCategory) => {
    switch (category) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
      default:
        return Laptop;
    }
  };

  const formatEventTime = (epoch: number) => {
    if (!epoch) return '--:--';
    const d = new Date(epoch);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const renderEventDescription = (evt: TrackingEvent) => {
    const meta = evt.metadata || {};
    switch (evt.type) {
      case 'website_opened':
        return (
          <span className="text-slate-300">
            Website opened on initial route <code className="text-indigo-400">{evt.route || '/'}</code>
          </span>
        );
      case 'section_entered':
        return (
          <span className="text-slate-300">
            Entered section: <strong className="text-slate-100">{meta.sectionName || meta.sectionId || 'General'}</strong>
          </span>
        );
      case 'section_left':
        return (
          <span className="text-slate-400">
            Left section: {meta.sectionName || meta.sectionId} ({meta.durationSeconds || 0}s spent)
          </span>
        );
      case 'navigation':
        return (
          <span className="text-slate-300 flex items-center gap-1.5 flex-wrap">
            Navigation: <span className="text-slate-400">{meta.fromSection}</span>
            <ArrowRight className="w-3 h-3 text-indigo-400 inline" />
            <strong className="text-indigo-300">{meta.toSection}</strong>
          </span>
        );
      case 'item_opened':
      case 'item_revisited':
        return (
          <span className="text-slate-300">
            {evt.type === 'item_revisited' ? 'Revisited' : 'Opened'} item:{' '}
            <strong className="text-amber-300">{meta.title || meta.itemId}</strong>{' '}
            {meta.section && <span className="text-slate-500">in {meta.section}</span>}
          </span>
        );
      case 'media_viewed':
        return (
          <span className="text-slate-300">
            Viewed {meta.mediaType || 'media'}: <strong className="text-sky-300">{meta.title || meta.mediaId}</strong>
          </span>
        );
      case 'search_performed':
        return (
          <span className="text-slate-300">
            Searched in {meta.section}: <span className="font-mono text-indigo-300">"{meta.searchTerm}"</span>
          </span>
        );
      case 'filter_applied':
        return (
          <span className="text-slate-300">
            Applied filter: <span className="text-purple-300">{meta.filterType} = {meta.selectedValue}</span>
          </span>
        );
      case 'sneak_peek_viewed':
      case 'sneak_peek_skipped':
      case 'sneak_peek_completed':
        return (
          <span className="text-slate-300">
            Sneak a Peek: <strong className="capitalize text-emerald-300">{evt.type.replace('sneak_peek_', '')}</strong>
          </span>
        );
      case 'error':
        return (
          <span className="text-rose-300">
            Error: {meta.category || 'Error'} — {meta.message}
          </span>
        );
      default:
        return <span className="text-slate-400">{evt.type}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Session History & Per-Session Timeline
        </h3>
        <span className="text-xs font-mono text-slate-400">
          {sessions.length} total session{sessions.length === 1 ? '' : 's'}
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
          No session history found for this user.
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((sess, idx) => {
            const isExpanded = expandedSessionIds.has(sess.sessionId);
            const DeviceIcon = getDeviceIcon(sess.deviceCategory);
            const events = sess.events || [];

            return (
              <div
                key={sess.sessionId}
                id={`session-card-${sess.sessionId}`}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                {/* Session Header Bar */}
                <div
                  onClick={() => toggleExpand(sess.sessionId)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-700/40 flex items-center justify-center text-indigo-300 font-mono font-bold text-xs shrink-0">
                      #{sessions.length - idx}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-100 text-sm">
                          {sess.startedAtFormatted}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {sess.durationFormatted}
                        </span>
                        {sess.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active Now
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                            Ended
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1 flex-wrap">
                        <span>Route: {sess.initialRoute}</span>
                        {sess.currentRoute !== sess.initialRoute && (
                          <>
                            <ArrowRight className="w-3 h-3 text-indigo-400" />
                            <span className="text-slate-300">{sess.currentRoute}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Meta & Expand Icon */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                      <DeviceIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{sess.browser}</span>
                      <span>•</span>
                      <span>{sess.os}</span>
                      {sess.screenWidth && sess.screenHeight && (
                        <span className="hidden md:inline text-slate-500">
                          ({sess.screenWidth}×{sess.screenHeight})
                        </span>
                      )}
                    </div>

                    <button
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                      title={isExpanded ? 'Collapse session activity' : 'Expand session activity'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable Session Event Feed */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950/70 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-400" />
                        Chronological Session Activity ({events.length} events)
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        Session ID: {sess.sessionId}
                      </span>
                    </div>

                    {events.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">
                        No granular events recorded for this session.
                      </p>
                    ) : (
                      <div className="space-y-2 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                        {events.map((evt) => (
                          <div
                            key={evt.eventId}
                            className="flex items-start gap-3 text-xs relative pl-1"
                          >
                            <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 z-10 text-[10px] font-mono text-indigo-400">
                              •
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div className="text-xs">
                                {renderEventDescription(evt)}
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                {formatEventTime(evt.clientEpoch)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
