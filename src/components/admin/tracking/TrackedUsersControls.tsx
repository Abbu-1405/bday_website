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
  Download,
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
  onExportCsv?: () => void;
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
  onExportCsv,
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Top Row: Search Input, Status Tabs, and Refresh Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="tracked-users-search-input"
            type="text"
            placeholder="Search by name, email, or UID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
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
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Export CSV & Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          {onExportCsv && (
            <button
              id="tracked-users-export-btn"
              onClick={onExportCsv}
              disabled={loading || totalCount === 0}
              title="Export platform user records to CSV"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-950/40 text-slate-200 hover:text-emerald-400 text-xs font-medium border border-slate-700/80 hover:border-emerald-500/40 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            id="tracked-users-refresh-btn"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Sort Selectors & Results Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
            <ArrowUpDown className="w-3 h-3" />
            Sort By:
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    active
                      ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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
        <div className="font-mono text-[11px] text-slate-400">
          Showing <span className="text-slate-200 font-semibold">{filteredCount}</span> of{' '}
          <span className="text-slate-200 font-semibold">{totalCount}</span> user
          {totalCount === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
};
