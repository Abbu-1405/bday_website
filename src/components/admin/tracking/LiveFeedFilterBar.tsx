import React from 'react';
import { Filter, Search, X, Users, Compass, Tag } from 'lucide-react';
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
    filters.searchQuery.trim() !== '';

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search feed by action, keyword, item title, or user..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* User selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={filters.selectedUserId}
              onChange={(e) => onFilterChange({ selectedUserId: e.target.value })}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Users
              </option>
              {users.map((u) => (
                <option key={u.userId} value={u.userId} className="bg-slate-900 text-slate-200">
                  {u.displayName} ({u.status})
                </option>
              ))}
            </select>
          </div>

          {/* Section selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={filters.selectedSection}
              onChange={(e) => onFilterChange({ selectedSection: e.target.value })}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Sections
              </option>
              {sectionsList
                .filter((s) => s !== 'All Sections')
                .map((sec) => (
                  <option key={sec} value={sec} className="bg-slate-900 text-slate-200">
                    {sec}
                  </option>
                ))}
            </select>
          </div>

          {/* Event type selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={filters.selectedEventType}
              onChange={(e) => onFilterChange({ selectedEventType: e.target.value })}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              {eventTypesList.map((et) => (
                <option key={et.id} value={et.id} className="bg-slate-900 text-slate-200">
                  {et.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset filter button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-colors"
              title="Clear all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
