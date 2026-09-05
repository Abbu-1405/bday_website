import React, { useState, useMemo } from 'react';
import {
  Activity,
  BookOpen,
  Sparkles,
  Heart,
  Mail,
  Award,
  KeyRound,
  Filter,
  Eye,
  Calendar,
  User,
  Hash,
  X,
  Search,
  SlidersHorizontal,
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

  const filterOptions = [
    { id: 'all', label: 'All Events' },
    { id: 'notes', label: 'Notes' },
    { id: 'wishes', label: 'Wishes' },
    { id: 'moments', label: 'Moments' },
    { id: 'open_when', label: 'Open When' },
    { id: 'feelings', label: 'Feelings' },
    { id: 'letters', label: 'Letters' },
    { id: 'secrets', label: 'Secrets' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'streaks', label: 'Streaks' },
  ];

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'note_opened':
        return {
          label: 'Note Opened',
          icon: BookOpen,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case 'wish_collected':
        return {
          label: 'Wish Collected',
          icon: Sparkles,
          color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        };
      case 'moment_opened':
        return {
          label: 'Moment Opened',
          icon: Activity,
          color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        };
      case 'open_when_opened':
        return {
          label: 'Open When Opened',
          icon: Mail,
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
        };
      case 'feeling_submitted':
        return {
          label: 'Feeling Submitted',
          icon: Heart,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        };
      case 'letter_submitted':
        return {
          label: 'Letter Submitted',
          icon: Mail,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        };
      case 'secret_discovered':
        return {
          label: 'Secret Discovered',
          icon: KeyRound,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'badge_unlocked':
      case 'milestone_unlocked':
        return {
          label: 'Badge Unlocked',
          icon: Award,
          color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
        };
      default:
        return {
          label: type,
          icon: Activity,
          color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
        };
    }
  };

  // Resolve user display name authoritative helper
  const resolveUserDisplayName = (userId: string, fallbackFromItem?: string): string => {
    if (!userId) return 'Unknown User';
    const profile = usersMap.get(userId);
    if (profile && profile.displayName && profile.displayName.trim() !== '') {
      return profile.displayName;
    }
    if (fallbackFromItem && fallbackFromItem.trim() !== '') {
      return fallbackFromItem;
    }
    if (userId === 'admin') return 'Admin';
    return 'Unknown User';
  };

  // Filtered activities computation (Category + UID + Display Name)
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const resolvedName = resolveUserDisplayName(act.userId, act.userDisplayName);

      // 1. UID Filter
      if (uidFilter.trim()) {
        const qUid = uidFilter.trim().toLowerCase();
        const actUid = (act.userId || '').toLowerCase();
        if (!actUid.includes(qUid)) {
          return false;
        }
      }

      // 2. Display Name Filter
      if (displayNameFilter.trim()) {
        const qName = displayNameFilter.trim().toLowerCase();
        const dName = resolvedName.toLowerCase();
        if (!dName.includes(qName)) {
          return false;
        }
      }

      return true;
    });
  }, [activities, uidFilter, displayNameFilter, usersMap]);

  const isUserFiltered = uidFilter.trim() !== '' || displayNameFilter.trim() !== '';

  const handleClearAllFilters = () => {
    setUidFilter('');
    setDisplayNameFilter('');
    onFilterChange('all');
  };

  return (
    <div className="space-y-4">
      {/* Search & User Filter Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3.5 shadow-sm">
        {/* User Search Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* UID Filter Input */}
          <div className="relative">
            <label htmlFor="activity-uid-input" className="sr-only">
              Filter Activity by User UID
            </label>
            <Hash className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
            <input
              id="activity-uid-input"
              type="text"
              placeholder="Filter by User UID (e.g. abc123)..."
              value={uidFilter}
              onChange={(e) => setUidFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
            {uidFilter && (
              <button
                onClick={() => setUidFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label="Clear UID filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Display Name Filter Input */}
          <div className="relative">
            <label htmlFor="activity-displayname-input" className="sr-only">
              Filter Activity by Display Name
            </label>
            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
            <input
              id="activity-displayname-input"
              type="text"
              placeholder="Filter by Display Name (e.g. Thanmai)..."
              value={displayNameFilter}
              onChange={(e) => setDisplayNameFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {displayNameFilter && (
              <button
                onClick={() => setDisplayNameFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label="Clear Display Name filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters Row */}
        <div className="pt-2 border-t border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              Category:
            </span>
            {filterOptions.map((opt) => {
              const active = selectedFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onFilterChange(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100 border border-slate-700/60'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {(isUserFiltered || selectedFilter !== 'all') && (
            <button
              onClick={handleClearAllFilters}
              className="self-start md:self-auto px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-colors shrink-0"
              title="Clear all filters"
              aria-label="Clear all activity filters"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Activity List Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Recent Activity Log
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {filteredActivities.length} of {activities.length} event{activities.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading activity events...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <p>No activity events found matching the filter criteria.</p>
            {(isUserFiltered || selectedFilter !== 'all') && (
              <button
                onClick={handleClearAllFilters}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors mt-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredActivities.map((act) => {
              const badge = getEventBadge(act.type);
              const IconComponent = badge.icon;
              const resolvedDisplayName = resolveUserDisplayName(act.userId, act.userDisplayName);
              const userProfile = usersMap.get(act.userId);

              return (
                <div
                  key={act.id}
                  className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${badge.color}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      {/* 1. User Identity Header: DISPLAY NAME on top, UID directly underneath */}
                      <div className="flex flex-col pb-1 mb-0.5 border-b border-slate-800/50">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="font-semibold text-slate-100 text-xs">
                            {resolvedDisplayName}
                          </span>
                          {userProfile?.role === 'admin' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Admin
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 pl-5">
                          UID: <span className="text-slate-300 select-all">{act.userId || 'unknown'}</span>
                        </span>
                      </div>

                      {/* 2. Activity Badge & Section */}
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">{badge.label}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 uppercase tracking-wider">
                          {act.section}
                        </span>
                      </div>

                      {/* 3. Section / Item ID & Timestamp */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
                        {act.itemId && (
                          <span className="flex items-center gap-1 font-mono">
                            ID: <strong className="text-slate-300 font-normal">{act.itemId}</strong>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {act.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectActivity(act)}
                    className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
