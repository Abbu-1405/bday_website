import React, { useState, useMemo } from 'react';
import {
  Activity,
  Filter,
  Eye,
  Calendar,
  User,
  Hash,
  X,
  Search,
  Radio,
  Clock,
  Terminal,
  Layers,
  Users,
} from 'lucide-react';
import { AdminActivityItem, AdminUserItem } from '../../services/adminService';

interface AdminActivityFeedProps {
  activities: AdminActivityItem[];
  users?: AdminUserItem[];
  loading: boolean;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  onSelectActivity: (activity: AdminActivityItem) => void;
}

export const AdminActivityFeed: React.FC<AdminActivityFeedProps> = ({
  activities,
  users = [],
  loading,
  selectedFilter,
  onFilterChange,
  onSelectActivity,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [uidFilter, setUidFilter] = useState('');
  const [displayNameFilter, setDisplayNameFilter] = useState('');

  // Map of userId -> { displayName, email, role }
  const usersMap = useMemo(() => {
    const map = new Map<string, { displayName: string; email: string; role?: string }>();
    users.forEach((u) => {
      map.set(u.uid, {
        displayName: u.displayName || 'Anonymous User',
        email: u.email || '',
        role: u.role,
      });
    });
    return map;
  }, [users]);

  // Telemetry metrics
  const uniqueUsersCount = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => {
      if (a.userId) set.add(a.userId);
    });
    return set.size;
  }, [activities]);

  const uniqueEventTypesCount = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => {
      if (a.type) set.add(a.type);
    });
    return set.size;
  }, [activities]);

  const liveUsersCount = useMemo(() => {
    const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
    return users.filter((u) => {
      if (!u.lastSeenAt) return false;
      const seenTime = new Date(u.lastSeenAt).getTime();
      return !isNaN(seenTime) && seenTime >= fifteenMinAgo;
    }).length;
  }, [users]);

  const filterOptions = [
    { id: 'all', label: 'ALL' },
    { id: 'notes', label: 'NOTES' },
    { id: 'wishes', label: 'WISHES' },
    { id: 'moments', label: 'MOMENTS' },
    { id: 'open_when', label: 'OPEN_WHEN' },
    { id: 'feelings', label: 'FEELINGS' },
    { id: 'letters', label: 'LETTERS' },
    { id: 'secrets', label: 'SECRETS' },
    { id: 'achievements', label: 'ACHIEVEMENTS' },
    { id: 'streaks', label: 'STREAKS' },
  ];

  // Resolve user display name authoritative helper
  const resolveUserDisplayName = (userId: string, fallbackFromItem?: string): string => {
    if (!userId) return 'anonymous';
    const profile = usersMap.get(userId);
    if (profile && profile.displayName && profile.displayName.trim() !== '') {
      return profile.displayName;
    }
    if (fallbackFromItem && fallbackFromItem.trim() !== '') {
      return fallbackFromItem;
    }
    if (userId === 'admin') return 'root_admin';
    return 'anonymous';
  };

  // Filtered activities computation (Category + UID + Display Name + Keyword)
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const resolvedName = resolveUserDisplayName(act.userId, act.userDisplayName);

      // 1. Keyword search (details, itemId, section, type)
      if (searchKeyword.trim()) {
        const q = searchKeyword.trim().toLowerCase();
        const details = (act.metadata?.details || act.metadata?.title || act.metadata?.action || '').toLowerCase();
        const itemId = (act.itemId || '').toLowerCase();
        const sec = (act.section || '').toLowerCase();
        const typ = (act.type || '').toLowerCase();
        if (!details.includes(q) && !itemId.includes(q) && !sec.includes(q) && !typ.includes(q)) {
          return false;
        }
      }

      // 2. UID Filter
      if (uidFilter.trim()) {
        const qUid = uidFilter.trim().toLowerCase();
        const actUid = (act.userId || '').toLowerCase();
        if (!actUid.includes(qUid)) {
          return false;
        }
      }

      // 3. Display Name Filter
      if (displayNameFilter.trim()) {
        const qName = displayNameFilter.trim().toLowerCase();
        const dName = resolvedName.toLowerCase();
        if (!dName.includes(qName)) {
          return false;
        }
      }

      return true;
    });
  }, [activities, searchKeyword, uidFilter, displayNameFilter, usersMap]);

  const isFiltered =
    searchKeyword.trim() !== '' ||
    uidFilter.trim() !== '' ||
    displayNameFilter.trim() !== '' ||
    selectedFilter !== 'all';

  const handleClearAllFilters = () => {
    setSearchKeyword('');
    setUidFilter('');
    setDisplayNameFilter('');
    onFilterChange('all');
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Header with Telemetry Indicators */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_20px_rgba(16,185,129,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#020408] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Terminal className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-emerald-400 font-bold tracking-wider">
                  [ ACTIVITY_STREAM // ALL_EVENTS ]
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  STREAM::LIVE
                </span>
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-[#020408] border border-emerald-950">
                  [TAILING LOG]
                </span>
                <span className="text-[10px] text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  [EVENTS: {activities.length}]
                </span>
              </div>
              <p className="text-[11px] text-emerald-600/90 font-mono mt-0.5">
                // Real-time event telemetry from authenticated users.
              </p>
            </div>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-950/60">
          <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
                TOTAL EVENTS
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{activities.length}</div>
            </div>
            <div className="w-7 h-7 rounded bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-cyan-500 uppercase tracking-wider">
                UNIQUE USERS
              </div>
              <div className="text-lg font-bold text-cyan-400 mt-0.5">{uniqueUsersCount}</div>
            </div>
            <div className="w-7 h-7 rounded bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-teal-500 uppercase tracking-wider">
                EVENT TYPES
              </div>
              <div className="text-lg font-bold text-teal-300 mt-0.5">{uniqueEventTypesCount}</div>
            </div>
            <div className="w-7 h-7 rounded bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                LIVE ONLINE
              </div>
              <div className="text-lg font-bold text-emerald-300 mt-0.5">{liveUsersCount}</div>
            </div>
            <div className="w-7 h-7 rounded bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-3.5 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
            <input
              type="text"
              placeholder="Search keyword, item ID, action..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[#020408] border border-emerald-500/30 text-xs text-emerald-200 placeholder-emerald-800 focus:outline-none focus:border-emerald-400 font-mono transition-colors"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* UID Filter */}
          <div className="relative">
            <Hash className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" />
            <input
              type="text"
              placeholder="Filter by user UID..."
              value={uidFilter}
              onChange={(e) => setUidFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[#020408] border border-emerald-500/30 text-xs text-cyan-200 placeholder-emerald-800 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
            />
            {uidFilter && (
              <button
                onClick={() => setUidFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Display Name Filter */}
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" />
            <input
              type="text"
              placeholder="Filter by display name..."
              value={displayNameFilter}
              onChange={(e) => setDisplayNameFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[#020408] border border-emerald-500/30 text-xs text-teal-200 placeholder-emerald-800 focus:outline-none focus:border-teal-400 font-mono transition-colors"
            />
            {displayNameFilter && (
              <button
                onClick={() => setDisplayNameFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories row */}
        <div className="pt-2 border-t border-emerald-950/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-emerald-600 mr-1 flex items-center gap-1 font-semibold">
              <Filter className="w-3 h-3 text-emerald-500" />
              TYPE:
            </span>
            {filterOptions.map((opt) => {
              const active = selectedFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onFilterChange(opt.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
                    active
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'bg-[#020408] text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-emerald-950'
                  }`}
                >
                  [{opt.label}]
                </button>
              );
            })}
          </div>

          {isFiltered && (
            <button
              onClick={handleClearAllFilters}
              className="px-2 py-0.5 rounded bg-[#020408] hover:bg-emerald-950/40 text-emerald-400 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3 text-slate-400" />
              <span>[RESET_FILTERS]</span>
            </button>
          )}
        </div>
      </div>

      {/* Terminal Log Table */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-[#020408] border-b border-emerald-950/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-emerald-300 tracking-wider text-[11px]">
              /telemetry/events.log
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {filteredActivities.length} of {activities.length} entries
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-emerald-400 space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">&gt; BUFFERING_TELEMETRY_LOGS...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2 font-mono">
            <p className="text-emerald-500/80">&gt; QUERY COMPLETE</p>
            <p className="text-slate-400">0 EVENTS MATCHING FILTER MATRIX</p>
            <p className="text-[11px] text-slate-400">&gt; AWAITING INCOMING TELEMETRY STREAM...</p>
            {isFiltered && (
              <button
                onClick={handleClearAllFilters}
                className="px-3 py-1 rounded bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs border border-emerald-500/30 transition-colors mt-2"
              >
                [CLEAR_ALL_FILTERS]
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-emerald-950/60 font-mono">
              <thead className="bg-[#020408]/80 text-[10px] text-emerald-500/80 uppercase tracking-wider font-semibold border-b border-emerald-950/80">
                <tr>
                  <th className="py-2.5 px-3">TIME</th>
                  <th className="py-2.5 px-3">UID / USER</th>
                  <th className="py-2.5 px-3">EVENT</th>
                  <th className="py-2.5 px-3">MODULE</th>
                  <th className="py-2.5 px-3">DETAILS</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/40">
                {filteredActivities.map((act) => {
                  const resolvedName = resolveUserDisplayName(act.userId, act.userDisplayName);
                  const isRoot = act.userId === 'admin' || usersMap.get(act.userId)?.role === 'admin';
                  const cleanTime = act.createdAt || 'N/A';

                  return (
                    <tr
                      key={act.id}
                      className="hover:bg-emerald-950/20 transition-colors group text-[11px]"
                    >
                      {/* TIME */}
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>{cleanTime}</span>
                        </div>
                      </td>

                      {/* UID / USER */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-emerald-200 font-semibold flex items-center gap-1">
                            {resolvedName}
                            {isRoot && (
                              <span className="text-[8px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                                ROOT
                              </span>
                            )}
                          </span>
                          <span className="text-[9px] text-slate-400 select-all font-mono">
                            {act.userId ? `${act.userId.substring(0, 10)}...` : 'anonymous'}
                          </span>
                        </div>
                      </td>

                      {/* EVENT */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#020408] border border-emerald-500/30 text-emerald-300 text-[10px]">
                          {act.type}
                        </span>
                      </td>

                      {/* MODULE / SECTION */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="text-cyan-300 text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20 uppercase tracking-wider">
                          {act.section || 'global'}
                        </span>
                      </td>

                      {/* DETAILS */}
                      <td className="py-2 px-3 text-slate-300 max-w-[240px] truncate">
                        {act.metadata?.details || act.metadata?.title || (act.itemId ? `item #${act.itemId}` : 'interaction logged')}
                      </td>

                      {/* STATUS */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          OK::LOGGED
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectActivity(act)}
                          className="px-2 py-0.5 rounded bg-[#020408] hover:bg-emerald-950/60 text-emerald-400 hover:text-emerald-200 text-[10px] font-mono border border-emerald-500/30 transition-colors"
                        >
                          &gt; INSPECT
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
