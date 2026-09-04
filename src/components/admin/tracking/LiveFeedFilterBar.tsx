import React from 'react';
import { Search, X, Users, Compass, Tag, User, Hash } from 'lucide-react';
import { LiveFeedFilters, LiveActiveUser } from '../../../types/tracking';

interface LiveFeedFilterBarProps {
  filters: LiveFeedFilters;
  users: LiveActiveUser[];
  onFilterChange: (filters: Partial<LiveFeedFilters>) => void;
  onResetFilters: () => void;
}

export const LiveFeedFilterBar: React.FC<LiveFeedFilterBarProps> = ({
  filters,
  users,
  onFilterChange,
  onResetFilters,
}) => {
  const sectionsList = [
    'All Sections',
    'Home',
    'Journey',
    'Sneak a Peek',
    'Adore',
    'Moments',
    '365 Notes',
    'Open When',
    'Wishes',
    'What Am I To You',
    'Your Reflections',
    'Behind The Scenes',
    'Secret Vault',
    'Settings',
    'Notifications',
  ];

  const eventTypesList = [
    { id: 'all', label: 'All Event Types' },
    { id: 'section_entered', label: 'Section Entered' },
    { id: 'section_left', label: 'Section Left' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'item_opened', label: 'Item Opened' },
    { id: 'item_revisited', label: 'Item Revisited' },
    { id: 'media_viewed', label: 'Media Viewed' },
    { id: 'search_performed', label: 'Search Performed' },
    { id: 'filter_applied', label: 'Filter Applied' },
    { id: 'sneak_peek', label: 'Sneak a Peek' },
    { id: 'website_opened', label: 'Website Opened' },
    { id: 'error', label: 'Error' },
  ];

  const isFiltered =
    filters.selectedUserId !== 'all' ||
    filters.selectedSection !== 'all' ||
    filters.selectedEventType !== 'all' ||
    filters.searchQuery.trim() !== '' ||
    filters.uidQuery.trim() !== '' ||
    filters.displayNameQuery.trim() !== '';

  return (
    <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 font-mono shadow-sm space-y-3">
      {/* Search and User Identity Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* 1. Global action / keyword search */}
        <div className="relative">
          <label htmlFor="live-search-input" className="sr-only">
            Search Feed by Action, Keyword or Item
          </label>
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
          <input
            id="live-search-input"
            type="text"
            placeholder="Search feed actions, keywords, items..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#020408] border border-emerald-500/30 text-xs text-emerald-200 placeholder-emerald-800 focus:outline-none focus:border-emerald-400 font-mono transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-300"
              aria-label="Clear keyword search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. User UID Filter */}
        <div className="relative">
          <label htmlFor="live-uid-filter-input" className="sr-only">
            Filter by User UID
          </label>
          <Hash className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" />
          <input
            id="live-uid-filter-input"
            type="text"
            placeholder="Filter by User UID..."
            value={filters.uidQuery}
            onChange={(e) => onFilterChange({ uidQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#020408] border border-emerald-500/30 text-xs text-cyan-200 placeholder-emerald-800 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
          />
          {filters.uidQuery && (
            <button
              onClick={() => onFilterChange({ uidQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-300"
              aria-label="Clear UID filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3. User Display Name Filter */}
        <div className="relative">
          <label htmlFor="live-displayname-filter-input" className="sr-only">
            Filter by Display Name
          </label>
          <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" />
          <input
            id="live-displayname-filter-input"
            type="text"
            placeholder="Filter by Display Name..."
            value={filters.displayNameQuery}
            onChange={(e) => onFilterChange({ displayNameQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#020408] border border-emerald-500/30 text-xs text-teal-200 placeholder-emerald-800 focus:outline-none focus:border-teal-400 font-mono transition-colors"
          />
          {filters.displayNameQuery && (
            <button
              onClick={() => onFilterChange({ displayNameQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-300"
              aria-label="Clear Display Name filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Selectors & Reset Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-emerald-950/60">
        <div className="flex flex-wrap items-center gap-2">
          {/* User selector dropdown */}
          <div className="flex items-center gap-1.5 bg-[#020408] border border-emerald-500/30 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <label htmlFor="live-user-select" className="sr-only">Select User</label>
            <select
              id="live-user-select"
              value={filters.selectedUserId}
              onChange={(e) => onFilterChange({ selectedUserId: e.target.value })}
              className="bg-transparent text-emerald-300 text-xs focus:outline-none cursor-pointer max-w-[160px] truncate font-mono"
            >
              <option value="all" className="bg-[#050811] text-slate-200">
                All Users
              </option>
              {users.map((u) => (
                <option key={u.userId} value={u.userId} className="bg-[#050811] text-slate-200">
                  {u.displayName} ({u.status})
                </option>
              ))}
            </select>
          </div>

          {/* Section selector */}
          <div className="flex items-center gap-1.5 bg-[#020408] border border-emerald-500/30 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <label htmlFor="live-section-select" className="sr-only">Select Section</label>
            <select
              id="live-section-select"
              value={filters.selectedSection}
              onChange={(e) => onFilterChange({ selectedSection: e.target.value })}
              className="bg-transparent text-emerald-300 text-xs focus:outline-none cursor-pointer font-mono"
            >
              <option value="all" className="bg-[#050811] text-slate-200">
                All Sections
              </option>
              {sectionsList
                .filter((s) => s !== 'All Sections')
                .map((sec) => (
                  <option key={sec} value={sec} className="bg-[#050811] text-slate-200">
                    {sec}
                  </option>
                ))}
            </select>
          </div>

          {/* Event type selector */}
          <div className="flex items-center gap-1.5 bg-[#020408] border border-emerald-500/30 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <Tag className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <label htmlFor="live-eventtype-select" className="sr-only">Select Event Type</label>
            <select
              id="live-eventtype-select"
              value={filters.selectedEventType}
              onChange={(e) => onFilterChange({ selectedEventType: e.target.value })}
              className="bg-transparent text-emerald-300 text-xs focus:outline-none cursor-pointer font-mono"
            >
              {eventTypesList.map((et) => (
                <option key={et.id} value={et.id} className="bg-[#050811] text-slate-200">
                  {et.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset / Clear All Filters button */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="px-2.5 py-1 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-200 text-xs font-mono font-medium border border-emerald-500/30 flex items-center gap-1.5 transition-colors shrink-0"
            title="Clear all filters"
            aria-label="Clear all live feed filters"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
            <span>[RESET_FILTERS]</span>
          </button>
        )}
      </div>
    </div>
  );
};
