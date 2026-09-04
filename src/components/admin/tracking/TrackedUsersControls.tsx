import React from 'react';
import {
  Search,
  X,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Clock,
  Compass,
  Hourglass,
  User,
  Radio,
} from 'lucide-react';

export type UserSortOption = 'last_active' | 'total_visits' | 'total_time' | 'name';
export type UserStatusFilter = 'all' | 'online' | 'today' | 'week';

interface TrackedUsersControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: UserSortOption;
  onSortChange: (option: UserSortOption) => void;
  statusFilter: UserStatusFilter;
  onStatusFilterChange: (filter: UserStatusFilter) => void;
  totalCount: number;
  filteredCount: number;
  loading: boolean;
  onRefresh: () => void;
}

export const TrackedUsersControls: React.FC<TrackedUsersControlsProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount,
  loading,
  onRefresh,
}) => {
  const statusTabs: { id: UserStatusFilter; label: string }[] = [
    { id: 'all', label: 'All Users' },
    { id: 'online', label: 'Online / Active' },
    { id: 'today', label: 'Active Today' },
    { id: 'week', label: 'Active This Week' },
  ];

  const sortOptions: { id: UserSortOption; label: string; icon: React.ElementType }[] = [
    { id: 'last_active', label: 'Last Active', icon: Clock },
    { id: 'total_visits', label: 'Total Visits', icon: Compass },
    { id: 'total_time', label: 'Total Time', icon: Hourglass },
    { id: 'name', label: 'Name (A-Z)', icon: User },
  ];

  return (
    <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 space-y-3 font-mono shadow-sm">
      {/* Top Row: Search Input, Status Tabs, and Refresh Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="tracked-users-search-input"
            type="text"
            placeholder="Search by name, email, or UID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#020408] border border-emerald-500/30 rounded-lg pl-9 pr-9 py-2 text-xs text-emerald-200 placeholder-emerald-800 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 transition-colors font-mono"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                id={`status-filter-${tab.id}`}
                onClick={() => onStatusFilterChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 shadow-xs'
                    : 'bg-[#020408] text-slate-400 border border-emerald-950 hover:text-emerald-300 hover:bg-emerald-950/30'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Refresh Action */}
        <button
          id="tracked-users-refresh-btn"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono font-medium border border-emerald-500/30 transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>POLL_SYNC</span>
        </button>
      </div>

      {/* Bottom Row: Sort Selectors & Results Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-emerald-950/60 text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-emerald-600 font-mono text-[10px] uppercase tracking-wider">
            <ArrowUpDown className="w-3 h-3" />
            SORT_INDEX:
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {sortOptions.map((opt) => {
              const active = sortBy === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  id={`sort-option-${opt.id}`}
                  onClick={() => onSortChange(opt.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                    active
                      ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/50 font-semibold'
                      : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/20'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Count Label */}
        <div className="font-mono text-[10px] text-slate-400">
          RESULTS: <span className="text-emerald-300 font-semibold">{filteredCount}</span> /{' '}
          <span className="text-cyan-300 font-semibold">{totalCount}</span> RECORDS
        </div>
      </div>
    </div>
  );
};
