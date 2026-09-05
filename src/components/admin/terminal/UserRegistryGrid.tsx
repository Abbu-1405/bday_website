import React, { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Check,
  Shield,
  ArrowRight,
  Terminal,
  UserCheck,
  Clock,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { TrackedUserOverview } from '../../../types/tracking';
import { TerminalStatusBar } from './TerminalStatusBar';

interface UserRegistryGridProps {
  users: TrackedUserOverview[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectUser: (userId: string) => void;
}

type StatusFilter = 'all' | 'online' | 'idle' | 'offline';
type SortOption = 'last_active' | 'first_seen' | 'most_active' | 'name';

export const UserRegistryGrid: React.FC<UserRegistryGridProps> = ({
  users,
  isLoading,
  onRefresh,
  onSelectUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('last_active');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  const handleCopyUid = (e: React.MouseEvent, uid: string) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(uid).catch(() => {});
    }
    setCopiedUid(uid);
    setTimeout(() => {
      setCopiedUid((prev) => (prev === uid ? null : prev));
    }, 2000);
  };

  /**
   * Determine exact terminal status:
   * ONLINE: Active within 15 minutes
   * IDLE: Active within 24 hours
   * OFFLINE: Inactive > 24 hours or never
   */
  const getUserStatus = (user: TrackedUserOverview): 'online' | 'idle' | 'offline' => {
    if (!user.lastActiveEpoch) return 'offline';
    const diffMs = Date.now() - user.lastActiveEpoch;
    if (diffMs <= 15 * 60 * 1000) return 'online';
    if (diffMs <= 24 * 60 * 60 * 1000) return 'idle';
    return 'offline';
  };

  const onlineCount = useMemo(() => {
    return users.filter((u) => getUserStatus(u) === 'online').length;
  }, [users]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const userStatus = getUserStatus(user);
        if (statusFilter !== 'all' && userStatus !== statusFilter) {
          return false;
        }

        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase().trim();
        const matchesName = (user.displayName || '').toLowerCase().includes(q);
        const matchesEmail = (user.email || '').toLowerCase().includes(q);
        const matchesUid = (user.userId || '').toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesUid;
      })
      .sort((a, b) => {
        if (sortBy === 'last_active') {
          return (b.lastActiveEpoch || 0) - (a.lastActiveEpoch || 0);
        }
        if (sortBy === 'first_seen') {
          return (a.firstVisitEpoch || 0) - (b.firstVisitEpoch || 0);
        }
        if (sortBy === 'name') {
          return (a.displayName || '').localeCompare(b.displayName || '');
        }
        if (sortBy === 'most_active') {
          const aActivity =
            (a.activitySummary?.notesOpened || 0) +
            (a.activitySummary?.momentsOpened || 0) +
            (a.activitySummary?.wishesCollected || 0) +
            (a.activitySummary?.secretsDiscovered || 0) +
            a.totalVisits;
          const bActivity =
            (b.activitySummary?.notesOpened || 0) +
            (b.activitySummary?.momentsOpened || 0) +
            (b.activitySummary?.wishesCollected || 0) +
            (b.activitySummary?.secretsDiscovered || 0) +
            b.totalVisits;
          return bActivity - aActivity;
        }
        return 0;
      });
  }, [users, searchTerm, statusFilter, sortBy]);

  return (
    <div className="space-y-5 select-none font-mono">
      {/* 1. Terminal Header */}
      <div className="border-b border-zinc-800/80 pb-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-500 tracking-wider">
              <span className="inline-block w-2 h-2 rounded-none bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span>STARLIT LETTERS // PRIVATE ADMIN TERMINAL</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight font-mono uppercase mt-0.5">
              USER REGISTRY // AUTHORIZED PERSONNEL ONLY
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-zinc-500">
            <span>TERMINAL ID: SL-ADM-01</span>
            <span className="text-zinc-700">|</span>
            <span className="text-emerald-400/80">SEC LEVEL 4</span>
          </div>
        </div>
      </div>

      {/* 2. System Status Bar */}
      <TerminalStatusBar
        totalUsers={users.length}
        onlineUsers={onlineCount}
        isLoading={isLoading}
        onRefresh={onRefresh}
      />

      {/* 3. Search and Filter Bar */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 space-y-3">
        {/* Terminal Command Search Input */}
        <div className="relative flex items-center bg-zinc-900/90 rounded-lg border border-zinc-700/80 focus-within:border-emerald-500/80 transition-colors">
          <div className="pl-3 pr-2 text-emerald-400 font-mono text-xs flex items-center gap-1.5 shrink-0 select-none">
            <span className="text-emerald-500">&gt;</span>
            <span className="text-zinc-400 hidden sm:inline">SEARCH USER:</span>
          </div>
          <input
            type="text"
            id="input-terminal-user-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Name, email, or Firebase UID..."
            className="w-full bg-transparent py-2 px-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              [CLEAR]
            </button>
          )}
        </div>

        {/* Filter Buttons & Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-zinc-500 mr-1 text-[10px] uppercase">Filter:</span>
            {(['all', 'online', 'idle', 'offline'] as StatusFilter[]).map((filter) => {
              const isActive = statusFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded transition-all font-mono text-[11px] uppercase ${
                    isActive
                      ? filter === 'online'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_-2px_rgba(16,185,129,0.3)]'
                        : filter === 'idle'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : filter === 'offline'
                        ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  [{filter.toUpperCase()}]
                </button>
              );
            })}
          </div>

          {/* Sort Selection */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-zinc-500 mr-1 text-[10px] uppercase">Sort:</span>
            {(
              [
                { key: 'last_active', label: 'LAST ACTIVE' },
                { key: 'first_seen', label: 'FIRST SEEN' },
                { key: 'most_active', label: 'MOST ACTIVE' },
                { key: 'name', label: 'NAME' },
              ] as const
            ).map((opt) => {
              const isSelected = sortBy === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/40'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  [{opt.label}]
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Registry Count Readout */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
        <div>
          <span>NODES INDEXED: </span>
          <span className="text-emerald-400 font-bold">{filteredUsers.length}</span>
          <span className="text-zinc-600"> / {users.length} TOTAL</span>
        </div>
        {searchTerm && (
          <span className="text-amber-400/90 text-[10px]">
            [QUERY: &quot;{searchTerm}&quot;]
          </span>
        )}
      </div>

      {/* 4. User Profile Grid (3 cols desktop, 2 cols tablet, 1 col mobile) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-zinc-800 rounded" />
                <div className="h-4 w-10 bg-zinc-800 rounded" />
              </div>
              <div className="w-16 h-16 rounded-lg bg-zinc-800 mx-auto" />
              <div className="h-4 w-32 bg-zinc-800 mx-auto rounded" />
              <div className="h-3 w-40 bg-zinc-800 mx-auto rounded" />
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="h-3 bg-zinc-800 rounded" />
                <div className="h-3 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-xl bg-zinc-950/80 border border-dashed border-zinc-800 space-y-3">
          <Terminal className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-mono text-zinc-300">
            [ NO USER NODES FOUND MATCHING CURRENT REGISTRY FILTER ]
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="px-3 py-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 rounded hover:bg-emerald-900/40 transition-colors"
          >
            [ RESET FILTERS ]
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user, idx) => {
            const status = getUserStatus(user);
            const indexFormatted = String(idx + 1).padStart(2, '0');
            const summary = user.activitySummary || {};

            const notesVal = summary.notesOpened ?? null;
            const momentsVal = summary.momentsOpened ?? null;
            const wishesVal = summary.wishesCollected ?? null;
            const secretsVal = summary.secretsDiscovered ?? null;

            return (
              <div
                key={user.userId}
                id={`user-node-${user.userId}`}
                onClick={() => onSelectUser(user.userId)}
                className="group relative p-5 rounded-xl bg-[#0a0d12] border border-zinc-800/90 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.15)] flex flex-col justify-between"
              >
                {/* Top Terminal Status Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    {status === 'online' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <span className="text-emerald-400 animate-pulse">◉</span>
                        <span>ONLINE</span>
                      </span>
                    ) : status === 'idle' ? (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                        <span>◐</span>
                        <span>IDLE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-zinc-500 font-medium">
                        <span>○</span>
                        <span>OFFLINE</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-zinc-500 group-hover:text-emerald-400/80 transition-colors">
                    [{indexFormatted}]
                  </span>
                </div>

                {/* Profile Image & Identification Section */}
                <div className="py-4 text-center space-y-2">
                  <div className="relative inline-block mx-auto">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-16 h-16 rounded-xl object-cover border border-zinc-700 group-hover:border-emerald-500/50 shadow-inner transition-colors"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-700 group-hover:border-emerald-500/50 flex items-center justify-center text-zinc-300 font-mono text-xl font-bold transition-colors">
                        {(user.displayName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}

                    {user.role === 'admin' && (
                      <span
                        title="Admin Authorized"
                        className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono"
                      >
                        ADM
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-100 font-mono uppercase tracking-tight truncate max-w-[240px] mx-auto group-hover:text-emerald-300 transition-colors">
                      {user.displayName || 'ANONYMOUS'}
                    </h3>

                    {/* UID Readout with Copy Action */}
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 mt-0.5">
                      <span>UID: {user.userId.slice(0, 10)}...</span>
                      <button
                        onClick={(e) => handleCopyUid(e, user.userId)}
                        title="Copy full UID"
                        className="text-zinc-500 hover:text-zinc-200 p-0.5 transition-colors"
                      >
                        {copiedUid === user.userId ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {user.email && user.email !== 'No email provided' && (
                      <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[220px] mx-auto">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* First Seen & Last Active Timestamps */}
                <div className="border-t border-zinc-800/80 py-2.5 space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="text-zinc-500">FIRST SEEN</span>
                    <span className="text-zinc-300 font-medium">
                      {user.firstVisitFormatted || '[ NO DATA ]'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="text-zinc-500">LAST ACTIVE</span>
                    <span className="text-zinc-300 font-medium">
                      {user.lastActiveFormatted || '[ NO DATA ]'}
                    </span>
                  </div>
                </div>

                {/* Tracked Database Metric Readout */}
                <div className="border-t border-dashed border-zinc-800/90 py-3 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">NOTES</span>
                    <span
                      className={`font-semibold ${
                        notesVal !== null && notesVal > 0 ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {notesVal !== null && notesVal > 0 ? notesVal : '[ NO DATA ]'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">MOMENTS</span>
                    <span
                      className={`font-semibold ${
                        momentsVal !== null && momentsVal > 0 ? 'text-cyan-400' : 'text-zinc-500'
                      }`}
                    >
                      {momentsVal !== null && momentsVal > 0 ? momentsVal : '[ NO DATA ]'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">WISHES</span>
                    <span
                      className={`font-semibold ${
                        wishesVal !== null && wishesVal > 0 ? 'text-amber-400' : 'text-zinc-500'
                      }`}
                    >
                      {wishesVal !== null && wishesVal > 0 ? wishesVal : '[ NO DATA ]'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">SECRETS</span>
                    <span
                      className={`font-semibold ${
                        secretsVal !== null && secretsVal > 0 ? 'text-purple-400' : 'text-zinc-500'
                      }`}
                    >
                      {secretsVal !== null && secretsVal > 0 ? secretsVal : '[ NO DATA ]'}
                    </span>
                  </div>
                </div>

                {/* Action: Inspect User */}
                <div className="pt-3 border-t border-zinc-800/80">
                  <div className="w-full py-2 px-3 rounded-lg bg-zinc-900 group-hover:bg-emerald-950/40 text-zinc-300 group-hover:text-emerald-400 border border-zinc-800 group-hover:border-emerald-500/40 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all">
                    <span>&gt; INSPECT USER</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
