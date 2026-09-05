import React, { useState, useEffect, useMemo } from 'react';
import {
  Film,
  Users,
  Eye,
  Play,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Calendar,
  Image,
  Video,
  Music,
  FileText,
  Code2,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import {
  fetchBtsAdminOverviewStats,
  fetchBtsUserSummaries,
  fetchBtsRecentActivity,
} from '../../../services';
import {
  BtsAdminOverviewStats,
  BtsUserSummary,
  BtsActivityEvent,
  BtsActivityType,
  BtsItemType,
} from '../../../types';
import { BtsUserDetailModal } from './BtsUserDetailModal';

export const AdminBtsDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'feed'>('overview');

  // Data states
  const [stats, setStats] = useState<BtsAdminOverviewStats>({
    totalUsers: 0,
    totalVisits: 0,
    totalItemsOpened: 0,
    totalPlays: 0,
    totalRandoms: 0,
    formatBreakdown: { photos: 0, videos: 0, audio: 0, pdfs: 0, html: 0 },
  });
  const [users, setUsers] = useState<BtsUserSummary[]>([]);
  const [activities, setActivities] = useState<BtsActivityEvent[]>([]);

  // Loading & refreshing
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & selection
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [feedFilterType, setFeedFilterType] = useState<string>('all');
  const [feedFormatFilter, setFeedFormatFilter] = useState<string>('all');
  const [feedSearchQuery, setFeedSearchQuery] = useState('');
  const [selectedUserSummary, setSelectedUserSummary] = useState<BtsUserSummary | null>(null);

  const loadBtsData = async () => {
    setIsRefreshing(true);
    try {
      const [sData, uData, aData] = await Promise.all([
        fetchBtsAdminOverviewStats(),
        fetchBtsUserSummaries(),
        fetchBtsRecentActivity({
          eventType: feedFilterType,
          itemType: feedFormatFilter,
          searchQuery: feedSearchQuery,
        }),
      ]);

      setStats(sData);
      setUsers(uData);
      setActivities(aData);
    } catch (err) {
      console.warn('[BTS Admin] Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadBtsData();
  }, [feedFilterType, feedFormatFilter]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users;
    const q = userSearchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q)
    );
  }, [users, userSearchQuery]);

  const getEventBadge = (eventType: BtsActivityType) => {
    switch (eventType) {
      case 'bts_page_open':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Eye className="w-2.5 h-2.5" /> Page Open
          </span>
        );
      case 'bts_item_open':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Layers className="w-2.5 h-2.5" /> Item View
          </span>
        );
      case 'bts_video_play':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Video className="w-2.5 h-2.5" /> Video Play
          </span>
        );
      case 'bts_audio_play':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Music className="w-2.5 h-2.5" /> Audio Play
          </span>
        );
      case 'bts_random':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Sparkles className="w-2.5 h-2.5" /> Random BTS
          </span>
        );
      case 'bts_html_open_external':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ExternalLink className="w-2.5 h-2.5" /> HTML Sandbox
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Activity
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Behind The Scenes Activity Monitor
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time analytics for authenticated visitors, item views, and media playback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadBtsData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 4-Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Unique Visitors</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{stats.totalUsers}</div>
          <p className="text-[11px] text-slate-500 font-mono">Authenticated users</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Page Opens</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">{stats.totalVisits}</div>
          <p className="text-[11px] text-slate-500 font-mono">Unlocked visits logged</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Items Opened</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{stats.totalItemsOpened}</div>
          <p className="text-[11px] text-slate-500 font-mono">Modal viewers opened</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Media Plays</span>
            <Play className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{stats.totalPlays}</div>
          <p className="text-[11px] text-slate-500 font-mono">Audio & video streams</p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Highlights & Insights
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'users'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>User Directory</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('feed')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'feed'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>Activity Stream</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
            {activities.length}
          </span>
        </button>
      </div>

      {/* 1. OVERVIEW & INSIGHTS TAB */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Most Popular Content */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Most Popular BTS Content
            </h3>

            {stats.mostPopularItem ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {stats.mostPopularItem.itemType}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {stats.mostPopularItem.openCount} opens
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-100">
                  {stats.mostPopularItem.itemTitle}
                </h4>
                <p className="text-[11px] font-mono text-slate-500">
                  ID: {stats.mostPopularItem.itemId}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No item views recorded yet.</p>
            )}

            {/* Media Format Distribution */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase block">
                Format Breakdown
              </span>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Photos</span>
                  <span className="font-mono font-bold text-amber-400">
                    {stats.formatBreakdown.photos}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Videos</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {stats.formatBreakdown.videos}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Audio</span>
                  <span className="font-mono font-bold text-purple-400">
                    {stats.formatBreakdown.audio}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">PDFs</span>
                  <span className="font-mono font-bold text-rose-400">
                    {stats.formatBreakdown.pdfs}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">HTML</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {stats.formatBreakdown.html}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Most Active User Highlight */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Most Active Visitor
            </h3>

            {stats.mostActiveUser ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                      {stats.mostActiveUser.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">
                        {stats.mostActiveUser.displayName}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        {stats.mostActiveUser.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">BTS Visits</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {stats.mostActiveUser.visitCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Items Opened</span>
                    <span className="font-mono font-bold text-amber-400">
                      {stats.mostActiveUser.itemsOpened}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No active users recorded.</p>
            )}

            {/* Quick Action to View All Users */}
            <button
              type="button"
              onClick={() => setActiveSubTab('users')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore User Directory ({users.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. USER DIRECTORY TAB */}
      {activeSubTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-200">Authenticated BTS Visitors</h3>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5 text-center">Visits</th>
                      <th className="p-3.5 text-center">Items Opened</th>
                      <th className="p-3.5 text-center">Plays</th>
                      <th className="p-3.5">First Access</th>
                      <th className="p-3.5">Last Access</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.userId} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            {u.photoURL ? (
                              <img
                                src={u.photoURL}
                                alt={u.displayName}
                                className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                                {u.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-200 block truncate">
                                {u.displayName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono truncate block">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-indigo-400">
                          {u.totalVisits}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-amber-400">
                          {u.totalItemsOpened}
                        </td>
                        <td className="p-3.5 text-center font-mono text-emerald-400">
                          {u.totalPlays}
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {u.firstVisit}
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {u.lastVisit}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedUserSummary(u)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-xs">
              No authenticated users found matching criteria.
            </div>
          )}
        </div>
      )}

      {/* 3. ACTIVITY FEED TAB */}
      {activeSubTab === 'feed' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-200">Chronological Event Feed</h3>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={feedFilterType}
                onChange={(e) => setFeedFilterType(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Events</option>
                <option value="bts_page_open">Page Opens</option>
                <option value="bts_item_open">Item Views</option>
                <option value="bts_video_play">Video Plays</option>
                <option value="bts_audio_play">Audio Plays</option>
                <option value="bts_random">Random BTS</option>
              </select>

              <select
                value={feedFormatFilter}
                onChange={(e) => setFeedFormatFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Formats</option>
                <option value="image">Photos</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="pdf">PDFs</option>
                <option value="html">HTML</option>
              </select>
            </div>
          </div>

          {/* Activity Cards List */}
          {activities.length > 0 ? (
            <div className="space-y-2">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="shrink-0">{getEventBadge(act.eventType)}</div>

                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-200 block truncate">
                        {act.itemTitle || act.itemId}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                        <span>by {act.userDisplayName}</span>
                        <span>•</span>
                        <span className="text-slate-500">{act.userEmail}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-right">
                    <span className="text-[11px] font-mono text-slate-500">{act.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-xs">
              No recent BTS events matching active filters.
            </div>
          )}
        </div>
      )}

      {/* User Detail Dossier Modal */}
      <BtsUserDetailModal
        userSummary={selectedUserSummary}
        onClose={() => setSelectedUserSummary(null)}
      />
    </div>
  );
};
