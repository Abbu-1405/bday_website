import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Filter,
  Search,
  ArrowUpDown,
  RefreshCw,
  Eye,
  CheckCircle2,
  Circle,
  FileText,
  Terminal,
  Shield,
  Star,
  Flag,
  Reply,
  Radio,
  Lock,
  Calendar,
  User,
  Unlock,
} from 'lucide-react';
import { useAuth } from '../../hooks';
import {
  fetchAdminLetters,
  markSubmissionReadState,
  AdminLetterSubmission,
} from '../../services/adminInboxService';
import { LetterReaderModal } from './LetterReaderModal';

export const AdminLettersInbox: React.FC = () => {
  const { currentUser } = useAuth();
  const [letters, setLetters] = useState<AdminLetterSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'starred'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [maxCount, setMaxCount] = useState<number>(30);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [selectedLetter, setSelectedLetter] = useState<AdminLetterSubmission | null>(null);
  const [starredIds, setStarredIds] = useState<Record<string, boolean>>({});
  const [terminalNotice, setTerminalNotice] = useState<string | null>(null);

  const loadLetters = async (overrideMaxCount?: number) => {
    setLoading(true);
    const fetchLimit = overrideMaxCount || maxCount;
    const mappedFilter = statusFilter === 'starred' ? 'all' : statusFilter;
    try {
      const data = await fetchAdminLetters(mappedFilter, sortOrder, searchTerm, fetchLimit);
      setLetters(data);
      setHasMore(data.length >= fetchLimit);
    } catch (err) {
      console.warn('Error loading admin letters inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLetters();
  }, [statusFilter === 'starred' ? 'all' : statusFilter, sortOrder, searchTerm, maxCount]);

  const handleOpenLetter = async (letter: AdminLetterSubmission) => {
    setSelectedLetter(letter);
    if (!letter.isRead && currentUser) {
      try {
        await markSubmissionReadState(letter.id, true, currentUser.uid);
        setLetters((prev) =>
          prev.map((item) => (item.id === letter.id ? { ...item, isRead: true } : item))
        );
        setSelectedLetter((prev) => (prev ? { ...prev, isRead: true } : null));
      } catch (err) {
        console.warn('Failed to mark letter as read:', err);
      }
    }
  };

  const handleToggleReadState = async (letterId: string, currentReadState: boolean) => {
    if (!currentUser) return;
    const newState = !currentReadState;
    try {
      await markSubmissionReadState(letterId, newState, currentUser.uid);
      setLetters((prev) =>
        prev.map((item) => (item.id === letterId ? { ...item, isRead: newState } : item))
      );
      if (selectedLetter && selectedLetter.id === letterId) {
        setSelectedLetter({ ...selectedLetter, isRead: newState });
      }
      setTerminalNotice(`DISPATCH [${letterId.slice(-6).toUpperCase()}] &gt; ${newState ? 'STATUS: REVIEWED_ACK' : 'STATUS: UNREAD_FLAG'}`);
      setTimeout(() => setTerminalNotice(null), 3000);
    } catch (err) {
      console.warn('Error toggling read state:', err);
    }
  };

  const toggleStar = (id: string) => {
    setStarredIds((prev) => {
      const isStarred = !prev[id];
      setTerminalNotice(`CORRESPONDENCE [${id.slice(-6).toUpperCase()}] &gt; ${isStarred ? 'STARRED // HIGH_PRIORITY' : 'UNSTARRED'}`);
      setTimeout(() => setTerminalNotice(null), 3000);
      return { ...prev, [id]: isStarred };
    });
  };

  // Metrics
  const unreadCount = letters.filter((l) => !l.isRead).length;
  const uniqueCorrespondents = new Set(letters.map((l) => l.userId)).size;
  const lastIntercept = letters[0]?.createdAt || 'N/A';

  // Filtered letters including 'starred' check
  const filteredLetters = useMemo(() => {
    if (statusFilter === 'starred') {
      return letters.filter((l) => !!starredIds[l.id]);
    }
    return letters;
  }, [letters, statusFilter, starredIds]);

  return (
    <div className="space-y-4 font-mono select-none" id="admin-letters-inbox">
      {/* Header */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_20px_rgba(16,185,129,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#020408] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-emerald-400 font-bold tracking-wider">
                  [DISPATCH_INTERCEPT // USER_CORRESPONDENCE]
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  MONITOR::ACTIVE
                </span>
                <span className="text-[10px] text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  [TOTAL_DISPATCHES: {letters.length}]
                </span>
              </div>
              <p className="text-[11px] text-emerald-600/90 font-mono mt-0.5">
                // Classified long-form correspondence transmissions, military-format mail packets.
              </p>
            </div>
          </div>

          <button
            onClick={() => loadLetters()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-colors disabled:opacity-50 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
            <span>{loading ? '[SCANNING_CHANNELS...]' : '[SYNC_DISPATCHES]'}</span>
          </button>
        </div>

        {/* Correspondence Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-950/60">
          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">INTERCEPTED LETTERS</span>
            <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">{letters.length}</div>
            <p className="text-[9px] text-slate-400 mt-0.5">Total encrypted dispatches</p>
          </div>

          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-amber-400 uppercase font-semibold">PENDING REVIEW</span>
            <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">{unreadCount}</div>
            <p className="text-[9px] text-amber-700 mt-0.5">Unopened intelligence</p>
          </div>

          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold">LAST INTERCEPT</span>
            <div className="text-xs font-bold text-emerald-300 font-mono mt-1.5 truncate">
              {lastIntercept}
            </div>
            <p className="text-[9px] text-emerald-700 mt-0.5">Recent transmission</p>
          </div>

          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-teal-400 uppercase font-semibold">ACTIVE AGENTS</span>
            <div className="text-lg font-bold text-teal-300 font-mono mt-0.5">{uniqueCorrespondents}</div>
            <p className="text-[9px] text-teal-700 mt-0.5">Unique sender nodes</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#050811]/90 p-3.5 rounded-xl border border-emerald-500/20 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-[#020408] p-1 rounded-lg border border-emerald-500/30">
            {(['all', 'unread', 'read', 'starred'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-1 py-1 rounded text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                [{s}]
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
              <option value="newest" className="bg-[#050811] text-cyan-300">[CHRONOLOGICAL_DESC]</option>
              <option value="oldest" className="bg-[#050811] text-cyan-300">[CHRONOLOGICAL_ASC]</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-1.5 bg-[#020408] px-2.5 py-1.5 rounded-lg border border-emerald-500/30">
            <Search className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <input
              type="text"
              placeholder="Search UID, subject, body text..."
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

      {/* Military/Intelligence Correspondence Feed */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-emerald-400 space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">&gt; DECRYPTING_CORRESPONDENCE_STREAMS...</p>
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2 font-mono">
            <Lock className="w-8 h-8 text-emerald-900 mx-auto" />
            <p className="text-xs font-semibold text-emerald-400">&gt; ZERO CORRESPONDENCE DISPATCHES IN QUEUE</p>
            <p className="text-[10px] text-slate-400">
              No letters match currently specified filter criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-emerald-950/60 font-mono">
            {filteredLetters.map((l) => {
              const packetSize = `${((l.content.length * 2) / 1024).toFixed(1)} KB`;
              const isStarred = !!starredIds[l.id];

              return (
                <div
                  key={l.id}
                  className={`p-4 hover:bg-[#080d1a] transition-colors relative overflow-hidden ${
                    !l.isRead ? 'bg-[#060b18]' : ''
                  }`}
                >
                  {/* Classification Banner */}
                  <div className="flex items-center justify-between text-[9px] text-emerald-500/70 border-b border-emerald-950/60 pb-1.5 mb-2.5">
                    <span className="tracking-widest font-bold text-rose-400/90">
                      // RESTRICTED // CONFIDENTIAL // EYES_ONLY //
                    </span>
                    <span className="text-slate-400 font-mono">
                      DISPATCH_REF: #{l.id.substring(0, 10)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left block: Sender avatar with reticle framing + Memo metadata */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Avatar with cyber reticle frame */}
                      <div className="relative shrink-0 mt-0.5">
                        <div className="w-10 h-10 rounded-lg bg-[#020408] border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs overflow-hidden">
                          {l.userPhotoURL ? (
                            <img
                              src={l.userPhotoURL}
                              alt={l.userDisplayName || 'Sender'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{(l.userDisplayName || 'S').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        {/* Reticle tick marks */}
                        <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t border-l border-emerald-400" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b border-r border-emerald-400" />
                      </div>

                      {/* Metadata Block */}
                      <div className="min-w-0 flex-1 space-y-1">
                        {/* Subject */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-emerald-200 truncate">
                            // SUBJ: {l.title || 'UNTITLED_DISPATCH'}
                          </span>
                          {!l.isRead && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                              [UNREAD_INBOUND]
                            </span>
                          )}
                          {isStarred && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400" /> [STARRED]
                            </span>
                          )}
                        </div>

                        {/* Military Memo Metadata Header: [FROM], [UID], [TIMESTAMP], [PACKET_SIZE] */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-400 pt-0.5">
                          <span>
                            <span className="text-emerald-500 font-semibold">[FROM]:</span>{' '}
                            <span className="text-emerald-300">{l.userDisplayName || 'ANON_OPERATOR'}</span>
                          </span>
                          <span>
                            <span className="text-cyan-500 font-semibold">[UID]:</span>{' '}
                            <span className="text-slate-400 select-all">{l.userId ? `${l.userId.slice(0, 10)}...` : 'N/A'}</span>
                          </span>
                          <span>
                            <span className="text-teal-500 font-semibold">[TIME]:</span>{' '}
                            <span className="text-slate-300">{l.createdAt}</span>
                          </span>
                          <span>
                            <span className="text-amber-500 font-semibold">[SIZE]:</span>{' '}
                            <span className="text-amber-300">{packetSize}</span>
                          </span>
                        </div>

                        {/* Letter snippet preview */}
                        <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed pt-1 select-text">
                          "{l.content}"
                        </p>
                      </div>
                    </div>

                    {/* Actions: [DECRYPT / VIEW], [MARK_READ], [FLAG], [REPLY] */}
                    <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
                      <button
                        onClick={() => toggleStar(l.id)}
                        className={`p-1.5 rounded border text-[10px] transition-colors cursor-pointer ${
                          isStarred
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                            : 'bg-[#020408] text-slate-400 hover:text-cyan-300 border-emerald-950'
                        }`}
                        title="Flag dispatch as starred"
                      >
                        <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleToggleReadState(l.id, l.isRead)}
                        className="px-2 py-1 rounded bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 border border-emerald-950 text-[10px] transition-colors cursor-pointer"
                        title="Toggle read/reviewed status"
                      >
                        {l.isRead ? '[MARK_UNREAD]' : '[MARK_READ]'}
                      </button>

                      <button
                        onClick={() => {
                          if (l.userEmail) {
                            window.location.href = `mailto:${l.userEmail}?subject=RE: ${encodeURIComponent(l.title || 'Your letter')}`;
                          } else {
                            setTerminalNotice(`REPLY: Direct email address not registered for UID ${l.userId.slice(0, 8)}`);
                            setTimeout(() => setTerminalNotice(null), 3000);
                          }
                        }}
                        className="px-2 py-1 rounded bg-[#020408] hover:bg-cyan-950/40 text-cyan-300 border border-emerald-950 text-[10px] transition-colors cursor-pointer"
                        title="Reply to author"
                      >
                        [REPLY]
                      </button>

                      <button
                        onClick={() => handleOpenLetter(l)}
                        className="px-2.5 py-1 rounded bg-[#050811] hover:bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition-colors cursor-pointer shadow-[0_0_8px_rgba(16,185,129,0.15)] flex items-center gap-1"
                      >
                        <Unlock className="w-3 h-3 text-cyan-400" />
                        <span>[DECRYPT / VIEW]</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Load More */}
        {hasMore && filteredLetters.length > 0 && !loading && (
          <div className="p-3 bg-[#020408] border-t border-emerald-950 text-center">
            <button
              onClick={() => setMaxCount((prev) => prev + 30)}
              className="px-4 py-1.5 rounded-lg bg-[#050811] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono transition-colors border border-emerald-500/30 cursor-pointer"
            >
              [PULL_ADDITIONAL_DISPATCHES (+30)]
            </button>
          </div>
        )}
      </div>

      {/* Letter Reader Modal */}
      <LetterReaderModal
        letter={selectedLetter}
        onClose={() => setSelectedLetter(null)}
        onToggleReadState={handleToggleReadState}
      />
    </div>
  );
};
