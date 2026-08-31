import React, { useState } from 'react';
import {
  Image,
  Search,
  Filter,
  Eye,
  Compass,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Film,
} from 'lucide-react';
import {
  MediaExplorationStat,
  SearchHistoryItem,
  FilterHistoryItem,
  SneakPeekHistoryItem,
  NavigationHistoryItem,
} from '../../../types/tracking';

interface InteractionsHistoryViewProps {
  media: MediaExplorationStat[];
  searches: SearchHistoryItem[];
  filters: FilterHistoryItem[];
  sneakPeek: SneakPeekHistoryItem[];
  navigation: NavigationHistoryItem[];
}

type InteractionTab = 'media' | 'searches' | 'filters' | 'sneak_peek' | 'navigation';

export const InteractionsHistoryView: React.FC<InteractionsHistoryViewProps> = ({
  media,
  searches,
  filters,
  sneakPeek,
  navigation,
}) => {
  const [activeTab, setActiveTab] = useState<InteractionTab>('media');

  const tabs: { id: InteractionTab; label: string; count: number; icon: React.ElementType }[] = [
    { id: 'media', label: 'Media Views', count: media.length, icon: Image },
    { id: 'searches', label: 'Search Queries', count: searches.length, icon: Search },
    { id: 'filters', label: 'Filters Applied', count: filters.length, icon: Filter },
    { id: 'sneak_peek', label: 'Sneak a Peek', count: sneakPeek.length, icon: Eye },
    { id: 'navigation', label: 'Navigation', count: navigation.length, icon: Compass },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      {/* Sub-tab Navigation Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Exploration Panel */}
      {activeTab === 'media' && (
        <div className="space-y-3">
          {media.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <Image className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-medium text-slate-400">No media views recorded.</p>
              <p>Image and video interactions will be listed here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {media.map((item) => (
                <div
                  key={item.mediaKey}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {item.mediaType}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.viewCount} view{item.viewCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 truncate">
                      {item.title || item.mediaId}
                    </h4>
                    {item.section && (
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                        Section: {item.section}
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900 flex items-center justify-between">
                    <span>First: {item.firstViewedFormatted}</span>
                    <span>Last: {item.lastViewedFormatted}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Searches Panel */}
      {activeTab === 'searches' && (
        <div className="space-y-2">
          {searches.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-medium text-slate-400">No search queries recorded.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-xl overflow-hidden">
              {searches.map((s) => (
                <div
                  key={s.eventId}
                  className="p-3 bg-slate-950/40 hover:bg-slate-800/30 flex items-center justify-between gap-4 text-xs transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-indigo-300 font-semibold truncate">
                          "{s.searchTerm}"
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                          {s.section}
                        </span>
                      </div>
                      {s.resultCount !== undefined && (
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Results returned: {s.resultCount}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {s.timestampFormatted}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {activeTab === 'filters' && (
        <div className="space-y-2">
          {filters.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-medium text-slate-400">No filter activity recorded.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-xl overflow-hidden">
              {filters.map((f) => (
                <div
                  key={f.eventId}
                  className="p-3 bg-slate-950/40 hover:bg-slate-800/30 flex items-center justify-between gap-4 text-xs transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                      <Filter className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">
                          {f.filterType}:
                        </span>
                        <span className="font-mono text-purple-300 font-semibold">
                          {f.selectedValue}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                          {f.section}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {f.timestampFormatted}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sneak a Peek Panel */}
      {activeTab === 'sneak_peek' && (
        <div className="space-y-2">
          {sneakPeek.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <Eye className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-medium text-slate-400">No Sneak a Peek activity recorded.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-xl overflow-hidden">
              {sneakPeek.map((sp) => {
                const isCompleted = sp.action === 'completed';
                const isSkipped = sp.action === 'skipped';
                return (
                  <div
                    key={sp.eventId}
                    className="p-3 bg-slate-950/40 hover:bg-slate-800/30 flex items-center justify-between gap-4 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg border shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isSkipped
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isSkipped ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">
                            Sneak a Peek
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="font-mono capitalize font-bold text-slate-300">
                            {sp.action}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {sp.timestampFormatted}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Navigation Panel */}
      {activeTab === 'navigation' && (
        <div className="space-y-2">
          {navigation.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-medium text-slate-400">No navigation transitions recorded.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-xl overflow-hidden">
              {navigation.map((nav) => (
                <div
                  key={nav.eventId}
                  className="p-3 bg-slate-950/40 hover:bg-slate-800/30 flex items-center justify-between gap-4 text-xs transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                      <Compass className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700">
                        {nav.fromSection}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30">
                        {nav.toSection}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {nav.timestampFormatted}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
