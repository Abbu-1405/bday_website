import React from 'react';
import {
  Activity,
  BookOpen,
  Sparkles,
  Heart,
  Mail,
  Award,
  KeyRound,
  Compass,
  AlertTriangle,
  Flame,
  Globe,
  Search,
  SlidersHorizontal,
  Clock,
  User,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { LiveFeedItem } from '../../../types/tracking';

interface LiveActivityFeedListProps {
  feedItems: LiveFeedItem[];
  isPaused: boolean;
  selectedUserId: string;
  selectedSection: string;
  selectedEventType: string;
  searchQuery: string;
  onClearFilters: () => void;
  onViewUserDetails?: (userId: string) => void;
}

export const LiveActivityFeedList: React.FC<LiveActivityFeedListProps> = ({
  feedItems,
  isPaused,
  selectedUserId,
  selectedSection,
  selectedEventType,
  searchQuery,
  onClearFilters,
  onViewUserDetails,
}) => {
  const getEventBadge = (type: string, isError?: boolean) => {
    if (isError || type === 'error') {
      return {
        label: 'Error Event',
        icon: AlertTriangle,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      };
    }

    switch (type) {
      case 'section_entered':
      case 'section_left':
      case 'navigation':
        return {
          label: 'Navigation',
          icon: Compass,
          color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        };
      case 'item_opened':
        return {
          label: 'Item Opened',
          icon: BookOpen,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case 'item_revisited':
        return {
          label: 'Item Revisited',
          icon: Flame,
          color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        };
      case 'media_viewed':
        return {
          label: 'Media Viewed',
          icon: Activity,
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
        };
      case 'search_performed':
        return {
          label: 'Search Query',
          icon: Search,
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        };
      case 'filter_applied':
        return {
          label: 'Filter Applied',
          icon: SlidersHorizontal,
          color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
        };
      case 'sneak_peek_viewed':
      case 'sneak_peek_skipped':
      case 'sneak_peek_completed':
        return {
          label: 'Sneak Peek',
          icon: Sparkles,
          color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
        };
      case 'website_opened':
        return {
          label: 'Website Opened',
          icon: Globe,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      default:
        return {
          label: 'Activity',
          icon: Activity,
          color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
        };
    }
  };

  const getDeviceIcon = (cat?: string) => {
    if (cat === 'mobile') return <Smartphone className="w-3 h-3 text-pink-400" />;
    if (cat === 'tablet') return <Tablet className="w-3 h-3 text-amber-400" />;
    return <Laptop className="w-3 h-3 text-slate-400" />;
  };

  const isFiltered =
    selectedUserId !== 'all' ||
    selectedSection !== 'all' ||
    selectedEventType !== 'all' ||
    searchQuery.trim() !== '';

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header with live feed count & pause status */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">Chronological Event Stream</h3>
          {isPaused && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Stream Paused
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            {feedItems.length} event{feedItems.length === 1 ? '' : 's'}
          </span>
          {isFiltered && (
            <button
              onClick={onClearFilters}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Feed list */}
      <div className="divide-y divide-slate-800/80 overflow-y-auto max-h-[580px] custom-scrollbar">
        {feedItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Activity className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No activity events match the current filter criteria.</p>
            {isFiltered && (
              <button
                onClick={onClearFilters}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors mt-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          feedItems.map((item) => {
            const badge = getEventBadge(item.type, item.isError);
            const IconComp = badge.icon;

            return (
              <div
                key={item.eventId}
                className={`p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs ${
                  item.isError ? 'bg-rose-950/20' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${badge.color}`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-200">{item.actionTitle}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                        {item.section}
                      </span>
                      {item.isError && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300">
                          ERROR
                        </span>
                      )}
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed break-words">
                      {item.actionDescription}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px] pt-1">
                      <button
                        onClick={() => onViewUserDetails && onViewUserDetails(item.userId)}
                        className="flex items-center gap-1 hover:text-indigo-300 transition-colors text-left"
                      >
                        <User className="w-3 h-3 text-indigo-400" />
                        <span className="font-medium text-slate-300">{item.userDisplayName}</span>
                      </button>

                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        {item.timestampFormatted}
                      </span>

                      {item.deviceCategory && (
                        <span className="flex items-center gap-1 text-slate-500">
                          {getDeviceIcon(item.deviceCategory)}
                          <span className="capitalize">{item.deviceCategory}</span>
                        </span>
                      )}

                      <span className="font-mono text-[10px] text-slate-600">
                        Sess: {item.sessionId.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                {onViewUserDetails && (
                  <button
                    onClick={() => onViewUserDetails(item.userId)}
                    className="self-start sm:self-center shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/80 transition-colors"
                  >
                    <span>User History</span>
                    <ExternalLink className="w-3 h-3 text-indigo-400" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
