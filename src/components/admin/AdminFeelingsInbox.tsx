import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Filter,
  Search,
  ArrowUpDown,
  RefreshCw,
  Eye,
  CheckCircle2,
  Circle,
  Terminal,
  Activity,
  Bookmark,
  Reply,
  Archive,
  Flag,
  Trash2,
  ChevronDown,
  ChevronUp,
  Radio,
  Clock,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks';
import {
  fetchAdminFeelings,
  markSubmissionReadState,
  AdminFeelingSubmission,
} from '../../services/adminInboxService';
import { FeelingReaderModal } from './FeelingReaderModal';

type MoodCategory = 'ALL' | 'JOY' | 'LONGING' | 'MELANCHOLY' | 'AFFECTION' | 'REFLECTION';

interface SentimentData {
  mood: 'JOY' | 'LONGING' | 'MELANCHOLY' | 'AFFECTION' | 'REFLECTION';
  color: string;
  badgeClass: string;
}

function detectSentiment(text: string): SentimentData {
  const lower = text.toLowerCase();
  if (/happy|joy|smile|laugh|bright|glad|ecstatic|delight|celebrat/.test(lower)) {
    return {
      mood: 'JOY',
      color: '#10b981',
      badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
    };
  }
  if (/miss|longing|wish|distance|someday|remember|waiting|far|apart/.test(lower)) {
    return {
      mood: 'LONGING',
      color: '#06b6d4',
      badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
    };
  }
  if (/sad|tears|hard|tired|alone|heavy|pain|cry|hurt|dark/.test(lower)) {
    return {
      mood: 'MELANCHOLY',
      color: '#f59e0b',
      badgeClass: 'bg-amber-950 text-amber-300 border-amber-500/40',
    };
  }
  if (/love|heart|tender|cherish|grateful|darling|warm|adore|sweet/.test(lower)) {
    return {
      mood: 'AFFECTION',
      color: '#f43f5e',
      badgeClass: 'bg-rose-950 text-rose-300 border-rose-500/40',
    };
  }
  return {
    mood: 'REFLECTION',
    color: '#8b5cf6',
    badgeClass: 'bg-purple-950 text-purple-300 border-purple-500/40',
  };
}

export const AdminFeelingsInbox: React.FC = () => {
  const { currentUser } = useAuth();
  const [feelings, setFeelings] = useState<AdminFeelingSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [moodFilter, setMoodFilter] = useState<MoodCategory>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [maxCount, setMaxCount] = useState<number>(30);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [selectedFeeling, setSelectedFeeling] = useState<AdminFeelingSubmission | null>(null);
  const [expandedPacketIds, setExpandedPacketIds] = useState<Record<string, boolean>>({});
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const [terminalNotice, setTerminalNotice] = useState<string | null>(null);

  const loadFeelings = async (overrideMaxCount?: number) => {
    setLoading(true);
    const fetchLimit = overrideMaxCount || maxCount;
    try {
      const data = await fetchAdminFeelings(readFilter, sortOrder, searchTerm, fetchLimit);
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
  }, [readFilter, sortOrder, searchTerm, maxCount]);

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
      setTerminalNotice(`PACKET [${feelingId.slice(-6).toUpperCase()}] STATUS &gt; ${newState ? 'ARCHIVED_REVIEWED' : 'UNREVIEWED_FLAG'}`);
      setTimeout(() => setTerminalNotice(null), 3000);
    } catch (err) {
      console.warn('Error toggling read state:', err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedPacketIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFlag = (id: string) => {
    setFlaggedIds((prev) => {
      const current = !!prev[id];
      setTerminalNotice(`SECURITY FLAG: Packet [${id.slice(-6).toUpperCase()}] &gt; ${!current ? 'FLAGGED_MONITORED' : 'CLEARED'}`);
      setTimeout(() => setTerminalNotice(null), 3000);
      return { ...prev, [id]: !current };
    });
  };

  // Sentiment analytics
  const { moodCounts, unreadCount, latestTimestamp } = useMemo(() => {
    const counts: Record<string, number> = {
      JOY: 0,
      LONGING: 0,
      MELANCHOLY: 0,
      AFFECTION: 0,
      REFLECTION: 0,
    };
    let unread = 0;
    let latest = 'N/A';

    feelings.forEach((f, idx) => {
      if (!f.isRead) unread++;
      if (idx === 0 && f.createdAt) latest = f.createdAt;
      const sent = detectSentiment(f.content);
      counts[sent.mood] = (counts[sent.mood] || 0) + 1;
    });

    return { moodCounts: counts, unreadCount: unread, latestTimestamp: latest };
  }, [feelings]);

  // Filtered list by mood as well
  const displayedFeelings = useMemo(() => {
    return feelings.filter((f) => {
      if (moodFilter === 'ALL') return true;
      const sent = detectSentiment(f.content);
      return sent.mood === moodFilter;
    });
  }, [feelings, moodFilter]);

  return (
    <div className="space-y-4 font-mono select-none" id="admin-feelings-inbox">
      {/* Header & Telemetry Summary Bar */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_20px_rgba(16,185,129,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#020408] border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Radio className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-emerald-400 font-bold tracking-wider">
                  [SENTIMENT_TELEMETRY // FEELINGS_INBOX]
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  INTERCEPT::LIVE
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                    [UNREVIEWED: {unreadCount}]
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-600/90 font-mono mt-0.5">
                // Classified human emotional telemetry stream, mood frequency, and sentiment logs.
              </p>
            </div>
          </div>

          <button
            onClick={() => loadFeelings()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-colors disabled:opacity-50 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
            <span>{loading ? '[INTERCEPTING...]' : '[SYNC_FEED]'}</span>
          </button>
        </div>

        {/* Telemetry Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-950/60">
          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">TOTAL TRANSMISSIONS</span>
            <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">{feelings.length}</div>
            <p className="text-[9px] text-slate-400 mt-0.5">Payloads in cache</p>
          </div>

          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-amber-400 uppercase font-semibold">UNREVIEWED PACKETS</span>
            <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">{unreadCount}</div>
            <p className="text-[9px] text-amber-700 mt-0.5">Awaiting inspection</p>
          </div>

          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold">LATEST PACKET</span>
            <div className="text-xs font-bold text-emerald-300 font-mono mt-1.5 truncate">
              {latestTimestamp}
            </div>
            <p className="text-[9px] text-emerald-700 mt-0.5">Most recent carrier signal</p>
          </div>

          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-rose-400 uppercase font-semibold">TOP SENTIMENT</span>
            <div className="text-xs font-bold text-rose-300 font-mono mt-1.5 uppercase">
              {Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'} (
              {Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[1] || 0})
            </div>
            <p className="text-[9px] text-rose-700 mt-0.5">Dominant frequency</p>
          </div>
        </div>

        {/* Mood Distribution Bar */}
        <div className="bg-[#020408] p-2.5 rounded-lg border border-emerald-950 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-emerald-500 font-semibold uppercase">
            <span>MOOD_DISTRIBUTION_SPECTRUM</span>
            <span className="text-slate-400">{feelings.length} TOTAL SAMPLES</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              JOY: {moodCounts.JOY || 0}
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
              LONGING: {moodCounts.LONGING || 0}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
              MELANCHOLY: {moodCounts.MELANCHOLY || 0}
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40">
              AFFECTION: {moodCounts.AFFECTION || 0}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40">
              REFLECTION: {moodCounts.REFLECTION || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Mood Selector Bar */}
      <div className="bg-[#050811]/90 p-3.5 rounded-xl border border-emerald-500/20 space-y-3">
        {/* Mood Pills Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] text-emerald-500 uppercase font-semibold shrink-0 mr-1">
            MOOD_TAG:
          </span>
          {(['ALL', 'JOY', 'LONGING', 'MELANCHOLY', 'AFFECTION', 'REFLECTION'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMoodFilter(m)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-colors shrink-0 cursor-pointer ${
                moodFilter === m
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                  : 'bg-[#020408] text-slate-400 hover:text-emerald-300 border border-emerald-950'
              }`}
            >
              [{m}]
            </button>
          ))}
        </div>

        {/* Read State, Sort, and Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-emerald-950/60 text-xs">
          {/* Read / Unread */}
          <div className="flex items-center gap-1 bg-[#020408] p-1 rounded-lg border border-emerald-500/30">
            {(['all', 'unread', 'read'] as const).map((rf) => (
              <button
                key={rf}
                onClick={() => setReadFilter(rf)}
                className={`flex-1 py-1 rounded text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                  readFilter === rf
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                [{rf}]
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#020408] px-2.5 py-1.5 rounded-lg border border-emerald-500/30">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="bg-transparent text-cyan-300 focus:outline-none w-full font-mono cursor-pointer text-xs"
            >
              <option value="newest" className="bg-[#050811] text-cyan-300">[NEWEST_FIRST]</option>
              <option value="oldest" className="bg-[#050811] text-cyan-300">[OLDEST_FIRST]</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-1.5 bg-[#020408] px-2.5 py-1.5 rounded-lg border border-emerald-500/30">
            <Search className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <input
              type="text"
              placeholder="Search UID, sender, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-emerald-200 placeholder:text-emerald-800 focus:outline-none w-full font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {terminalNotice && (
        <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-xs text-emerald-200 font-mono">
          &gt; {terminalNotice}
        </div>
      )}

      {/* Monospace Intercepted Transmission Log Feed */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-emerald-400 space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">&gt; BUFFERING_SENTIMENT_TRANSMISSIONS...</p>
          </div>
        ) : displayedFeelings.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2 font-mono">
            <Radio className="w-8 h-8 text-emerald-900 mx-auto" />
            <p className="text-xs font-semibold text-emerald-400">&gt; ZERO PACKETS CURRENTLY DETECTED</p>
            <p className="text-[10px] text-slate-400">
              Awaiting inbound submissions from remote nodes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-emerald-950/60 font-mono">
            {displayedFeelings.map((f) => {
              const sentiment = detectSentiment(f.content);
              const packetId = `#PKT-${f.id.slice(-6).toUpperCase()}`;
              const isExpanded = !!expandedPacketIds[f.id];
              const isFlagged = !!flaggedIds[f.id];

              return (
                <div
                  key={f.id}
                  className={`p-3.5 hover:bg-[#080d1a] transition-colors ${
                    !f.isRead ? 'bg-[#060b18]' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {/* Top Row / Identifier */}
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="font-bold text-cyan-400 text-xs">
                        {packetId}
                      </span>

                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${sentiment.badgeClass}`}>
                        [{sentiment.mood}]
                      </span>

                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          f.isRead
                            ? 'bg-[#020408] text-slate-400 border-emerald-950'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {f.isRead ? '[REVIEWED]' : '[NEW_INBOUND]'}
                      </span>

                      {isFlagged && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <Flag className="w-2.5 h-2.5" /> [FLAGGED]
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400">
                        {f.createdAt}
                      </span>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => toggleFlag(f.id)}
                        className={`px-2 py-0.5 rounded border text-[10px] transition-colors cursor-pointer ${
                          isFlagged
                            ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                            : 'bg-[#020408] text-slate-400 hover:text-rose-300 border-emerald-950'
                        }`}
                        title="Flag packet for security audit"
                      >
                        [FLAG]
                      </button>

                      <button
                        onClick={() => handleToggleReadState(f.id, f.isRead)}
                        className="px-2 py-0.5 rounded bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 border border-emerald-950 text-[10px] transition-colors cursor-pointer"
                        title="Toggle reviewed / archived status"
                      >
                        {f.isRead ? '[UNARCHIVE]' : '[ARCHIVE]'}
                      </button>

                      <button
                        onClick={() => {
                          if (f.userEmail) {
                            window.location.href = `mailto:${f.userEmail}?subject=Regarding your message on Starlit Letters`;
                          } else {
                            setTerminalNotice(`RESPOND: Direct email channel unavailable for UID ${f.userId.slice(0, 8)}`);
                            setTimeout(() => setTerminalNotice(null), 3000);
                          }
                        }}
                        className="px-2 py-0.5 rounded bg-[#020408] hover:bg-cyan-950/40 text-cyan-300 border border-emerald-950 text-[10px] transition-colors cursor-pointer"
                        title="Respond to author"
                      >
                        [RESPOND]
                      </button>

                      <button
                        onClick={() => toggleExpand(f.id)}
                        className="px-2 py-0.5 rounded bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 border border-emerald-950 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? '[COLLAPSE]' : '[PAYLOAD]'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Author Telemetry */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-emerald-950/40">
                    <span className="text-emerald-300 font-semibold truncate">
                      AUTHOR: {f.userDisplayName || 'ANONYMOUS_ORIGIN'}
                    </span>
                    <span className="text-slate-400 select-all font-mono text-[10px]">
                      UID: {f.userId ? `${f.userId.substring(0, 10)}...` : 'N/A'}
                    </span>
                    {f.userEmail && (
                      <span className="text-slate-400 select-all font-mono text-[10px]">
                        &lt;{f.userEmail}&gt;
                      </span>
                    )}
                  </div>

                  {/* Intercepted Content Preview / Expandable */}
                  <div className="mt-2 text-xs">
                    {isExpanded ? (
                      <div className="p-3 bg-[#020408] border border-emerald-500/30 rounded-lg text-emerald-100 whitespace-pre-wrap leading-relaxed select-text space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-emerald-950 pb-1">
                          <span>EXPANDED_PAYLOAD_VIEWER</span>
                          <button
                            onClick={() => handleOpenFeeling(f)}
                            className="text-cyan-400 hover:text-cyan-300 underline"
                          >
                            [OPEN_IN_READER_MODAL]
                          </button>
                        </div>
                        <p>{f.content}</p>
                      </div>
                    ) : (
                      <p
                        onClick={() => toggleExpand(f.id)}
                        className="text-slate-300 line-clamp-2 hover:text-emerald-200 cursor-pointer text-[11px] leading-relaxed"
                      >
                        "{f.content}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Load More */}
        {hasMore && displayedFeelings.length > 0 && !loading && (
          <div className="p-3 bg-[#020408] border-t border-emerald-950 text-center">
            <button
              onClick={() => setMaxCount((prev) => prev + 30)}
              className="px-4 py-1.5 rounded-lg bg-[#050811] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono transition-colors border border-emerald-500/30 cursor-pointer"
            >
              [PULL_ADDITIONAL_PACKETS (+30)]
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
