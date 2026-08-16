import React, { useState } from 'react';
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
} from 'lucide-react';
import { AdminActivityItem } from '../../services/adminService';

interface AdminActivityFeedProps {
  activities: AdminActivityItem[];
  loading: boolean;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  onSelectActivity: (activity: AdminActivityItem) => void;
}

export const AdminActivityFeed: React.FC<AdminActivityFeedProps> = ({
  activities,
  loading,
  selectedFilter,
  onFilterChange,
  onSelectActivity,
}) => {
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

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Filter Events by Category</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => {
            const active = selectedFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onFilterChange(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100 border border-slate-700/60'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
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
            {activities.length} event{activities.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading activity events...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No activity events found for the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {activities.map((act) => {
              const badge = getEventBadge(act.type);
              const IconComponent = badge.icon;
              return (
                <div
                  key={act.id}
                  className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${badge.color}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">{badge.label}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 uppercase tracking-wider">
                          {act.section}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1 font-mono">
                          ID: <strong className="text-slate-300 font-normal">{act.itemId}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          {act.userId.slice(0, 8)}...
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {act.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectActivity(act)}
                    className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
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
