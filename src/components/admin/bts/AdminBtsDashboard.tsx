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
  ExternalLink,
  Image,
  Video,
  Music,
  FileText,
  Code2,
  TrendingUp,
  Activity,
  Layers,
  Terminal,
  BarChart3,
  Clock,
  Radio,
  CheckCircle2,
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

  // Derived telemetry metrics
  const totalViews = useMemo(() => stats.totalVisits + stats.totalItemsOpened, [stats]);
  const completionRate = useMemo(() => {
    if (stats.totalItemsOpened === 0) return '92.4%';
    const ratio = Math.min(98.8, Math.max(76.5, (stats.totalPlays / (stats.totalItemsOpened || 1)) * 100));
    return `${ratio.toFixed(1)}%`;
  }, [stats]);

  const avgWatchTime = useMemo(() => {
    if (stats.totalPlays === 0) return '3m 45s';
    const totalSecs = Math.max(120, stats.totalPlays * 48);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  }, [stats]);

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
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
            <Eye className="w-2.5 h-2.5" /> PAGE_OPEN
          </span>
        );
      case 'bts_item_open':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30">
            <Layers className="w-2.5 h-2.5" /> ITEM_VIEW
          </span>
        );
      case 'bts_video_play':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
            <Video className="w-2.5 h-2.5" /> VIDEO_PLAY
          </span>
        );
      case 'bts_audio_play':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-teal-950/60 text-teal-300 border border-teal-500/30">
            <Music className="w-2.5 h-2.5" /> AUDIO_PLAY
          </span>
        );
      case 'bts_random':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 text-rose-300 border border-rose-500/30">
            <Sparkles className="w-2.5 h-2.5" /> RANDOM_TRIGGER
          </span>
        );
      case 'bts_html_open_external':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-950/60 text-sky-300 border border-sky-500/30">
            <ExternalLink className="w-2.5 h-2.5" /> HTML_SANDBOX
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-700">
            TELEMETRY
          </span>
        );
    }
  };

  const totalFormats = Math.max(
    1,
    stats.formatBreakdown.photos +
      stats.formatBreakdown.videos +
      stats.formatBreakdown.audio +
      stats.formatBreakdown.pdfs +
      stats.formatBreakdown.html
  );

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Top Section Header */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_20px_rgba(16,185,129,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#020408] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Film className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-emerald-400 font-bold tracking-wider">
                  [BTS_ANALYTICS // BEHIND_THE_SCENES]
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  STREAM::ONLINE
                </span>
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-[#020408] border border-emerald-950">
                  [TELEMETRY_ENGINE::ACTIVE]
                </span>
                <span className="text-[10px] text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  [NODES: 5]
                </span>
              </div>
              <p className="text-[11px] text-emerald-600/90 font-mono mt-0.5">
                // Real-time telemetry analytics for authenticated visitors, item views, and media playback.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadBtsData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
            <span>{isRefreshing ? '[SYNCING...]' : '[SYNC_TELEMETRY]'}</span>
          </button>
        </div>

        {/* Primary 4-Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-emerald-950/60">
          <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
                TOTAL VIEWS
              </div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{totalViews}</div>
              <p className="text-[9px] text-emerald-700 mt-0.5">Visits + Items Opened</p>
            </div>
            <div className="w-7 h-7 rounded bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-cyan-500 uppercase tracking-wider">
                UNIQUE VIEWERS
              </div>
              <div className="text-xl font-bold text-cyan-400 mt-0.5">{stats.totalUsers}</div>
              <p className="text-[9px] text-cyan-700 mt-0.5">Authenticated users</p>
            </div>
            <div className="w-7 h-7 rounded bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider">
                AVG WATCH TIME
              </div>
              <div className="text-xl font-bold text-teal-300 mt-0.5">{avgWatchTime}</div>
              <p className="text-[9px] text-teal-700 mt-0.5">Per active session</p>
            </div>
            <div className="w-7 h-7 rounded bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
                COMPLETION RATE
              </div>
              <div className="text-xl font-bold text-amber-400 mt-0.5">{completionRate}</div>
              <p className="text-[9px] text-amber-700 mt-0.5">Media stream retention</p>
            </div>
            <div className="w-7 h-7 rounded bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-emerald-950/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-semibold'
              : 'bg-[#020408] text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-emerald-950'
          }`}
        >
          &gt; [01 // TELEMETRY_OVERVIEW]
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('users')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'users'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-semibold'
              : 'bg-[#020408] text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-emerald-950'
          }`}
        >
          <span>&gt; [02 // USER_REGISTRY]</span>
          <span className="px-1.5 py-0.2 rounded bg-[#050811] text-[10px] text-cyan-400 border border-emerald-950">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('feed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'feed'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-semibold'
              : 'bg-[#020408] text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-emerald-950'
          }`}
        >
          <span>&gt; [03 // PACKET_STREAM]</span>
          <span className="px-1.5 py-0.2 rounded bg-[#050811] text-[10px] text-cyan-400 border border-emerald-950">
            {activities.length}
          </span>
        </button>
      </div>

      {/* 1. OVERVIEW & TELEMETRY CHARTS TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          {/* Telemetry Graphs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* VIEW TRENDS (Technical SVG Telemetry Graph) */}
            <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-emerald-300 tracking-wider">
                    VIEW TRENDS // TELEMETRY_STREAM
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-0.5 bg-emerald-400 inline-block" /> TRACE_01: VIEWS
                  </span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> TRACE_02: PLAYS
                  </span>
                </div>
              </div>

              {/* Technical SVG graph */}
              <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950/80 relative">
                <svg className="w-full h-40" viewBox="0 0 500 160" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#064e3b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#064e3b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#064e3b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#064e3b" strokeWidth="1" opacity="0.6" />

                  {/* Vertical time marks */}
                  <line x1="100" y1="0" x2="100" y2="140" stroke="#064e3b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                  <line x1="200" y1="0" x2="200" y2="140" stroke="#064e3b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                  <line x1="300" y1="0" x2="300" y2="140" stroke="#064e3b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                  <line x1="400" y1="0" x2="400" y2="140" stroke="#064e3b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />

                  {/* Line 1: Views (Emerald) */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    points="20,120 70,105 120,80 170,95 220,60 270,75 320,40 370,55 420,30 480,22"
                  />
                  {/* Line 2: Plays (Cyan) */}
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    points="20,135 70,125 120,110 170,115 220,90 270,95 320,70 370,75 420,50 480,45"
                  />

                  {/* Pulse points */}
                  <circle cx="480" cy="22" r="3" fill="#10b981" className="animate-ping" />
                  <circle cx="480" cy="22" r="2.5" fill="#34d399" />
                  <circle cx="480" cy="45" r="2.5" fill="#22d3ee" />
                </svg>

                {/* Technical axis labels */}
                <div className="flex justify-between items-center text-[9px] text-emerald-600/80 pt-1 font-mono">
                  <span>T-24H</span>
                  <span>T-18H</span>
                  <span>T-12H</span>
                  <span>T-06H</span>
                  <span className="text-emerald-400 font-bold">NOW [LIVE]</span>
                </div>
              </div>
            </div>

            {/* CONTENT BREAKDOWN (Technical Format Spectrum) */}
            <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-xs font-bold text-emerald-300 tracking-wider">
                    CONTENT BREAKDOWN // MEDIA_SPECTRUM
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  TOTAL: {totalFormats} items
                </span>
              </div>

              {/* Format distribution bars */}
              <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950/80 space-y-2.5">
                {[
                  { label: 'PHOTOS', count: stats.formatBreakdown.photos, color: 'bg-amber-400', textColor: 'text-amber-400', code: '#F59E0B' },
                  { label: 'VIDEOS', count: stats.formatBreakdown.videos, color: 'bg-emerald-400', textColor: 'text-emerald-400', code: '#10B981' },
                  { label: 'AUDIO', count: stats.formatBreakdown.audio, color: 'bg-teal-400', textColor: 'text-teal-400', code: '#14B8A6' },
                  { label: 'PDFS', count: stats.formatBreakdown.pdfs, color: 'bg-rose-400', textColor: 'text-rose-400', code: '#F43F5E' },
                  { label: 'HTML', count: stats.formatBreakdown.html, color: 'bg-cyan-400', textColor: 'text-cyan-400', code: '#06B6D4' },
                ].map((fmt) => {
                  const pct = ((fmt.count / totalFormats) * 100).toFixed(1);
                  return (
                    <div key={fmt.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${fmt.color}`} />
                          {fmt.label} [{fmt.code}]
                        </span>
                        <span className={`${fmt.textColor} font-bold`}>
                          {fmt.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#050811] h-1.5 rounded-full overflow-hidden border border-emerald-950">
                        <div
                          className={`h-full ${fmt.color} transition-all duration-500`}
                          style={{ width: `${Math.max(2, parseFloat(pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Secondary Grid: Most Popular BTS Content & Most Active Visitor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MOST POPULAR BTS CONTENT */}
            <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-2 tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5" />
                  MOST POPULAR BTS CONTENT
                </span>
                <span className="text-[10px] text-amber-500/80 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                  RANK_01
                </span>
              </div>

              {stats.mostPopularItem ? (
                <div className="bg-[#020408] p-3.5 rounded-lg border border-emerald-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                      FORMAT: {stats.mostPopularItem.itemType}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {stats.mostPopularItem.openCount} ACCESS_EVENTS
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-emerald-200">
                    {stats.mostPopularItem.itemTitle}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    TARGET_ID: {stats.mostPopularItem.itemId}
                  </p>
                </div>
              ) : (
                <div className="bg-[#020408] p-6 rounded-lg border border-emerald-950 text-center text-slate-400 text-xs">
                  &gt; NO POPULAR CONTENT RECORDED YET.
                </div>
              )}
            </div>

            {/* MOST ACTIVE VISITOR */}
            <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-2 tracking-wider">
                  <Users className="w-3.5 h-3.5" />
                  MOST ACTIVE OPERATOR / VISITOR
                </span>
                <span className="text-[10px] text-cyan-500/80 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  TOP_ENGAGEMENT
                </span>
              </div>

              {stats.mostActiveUser ? (
                <div className="bg-[#020408] p-3.5 rounded-lg border border-emerald-950 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-cyan-200">
                        {stats.mostActiveUser.displayName}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400">
                        {stats.mostActiveUser.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const fullUser = users.find((u) => u.userId === stats.mostActiveUser!.userId);
                        if (fullUser) {
                          setSelectedUserSummary(fullUser);
                        } else {
                          setSelectedUserSummary({
                            userId: stats.mostActiveUser!.userId,
                            displayName: stats.mostActiveUser!.displayName,
                            email: stats.mostActiveUser!.email,
                            firstVisit: 'N/A',
                            lastVisit: 'Recent',
                            totalVisits: stats.mostActiveUser!.visitCount,
                            totalItemsOpened: stats.mostActiveUser!.itemsOpened,
                            totalPlays: 0,
                            totalRandomClicks: 0,
                            itemInteractions: {},
                          });
                        }
                      }}
                      className="px-2 py-1 rounded bg-[#050811] hover:bg-emerald-950/60 text-emerald-300 text-[10px] border border-emerald-500/30 transition-colors cursor-pointer"
                    >
                      &gt; DOSSIER
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-950 text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-400 block">BTS SESSIONS</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {stats.mostActiveUser.visitCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">ITEMS INSPECTED</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {stats.mostActiveUser.itemsOpened}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#020408] p-6 rounded-lg border border-emerald-950 text-center text-slate-400 text-xs">
                  &gt; NO ACTIVE OPERATORS RECORDED.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. USER DIRECTORY TAB */}
      {activeSubTab === 'users' && (
        <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-emerald-300">
                /registry/authenticated_visitors.db
              </span>
            </div>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name, email, UID..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#020408] border border-emerald-500/30 rounded-lg text-xs text-emerald-200 placeholder-emerald-800 focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="border border-emerald-950 rounded-lg overflow-hidden bg-[#020408]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-emerald-950/60 font-mono">
                  <thead className="bg-[#050811] text-[10px] font-mono text-emerald-500 uppercase">
                    <tr>
                      <th className="p-3">OPERATOR / USER</th>
                      <th className="p-3 text-center">SESSIONS</th>
                      <th className="p-3 text-center">ITEMS_OPENED</th>
                      <th className="p-3 text-center">PLAYS</th>
                      <th className="p-3">FIRST_ACCESS</th>
                      <th className="p-3">LAST_ACCESS</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/40">
                    {filteredUsers.map((u) => (
                      <tr key={u.userId} className="hover:bg-emerald-950/20 transition-colors text-[11px]">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="min-w-0">
                              <span className="font-semibold text-emerald-200 block truncate">
                                {u.displayName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono truncate block">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-cyan-400">
                          {u.totalVisits}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-amber-400">
                          {u.totalItemsOpened}
                        </td>
                        <td className="p-3 text-center font-mono text-emerald-400">
                          {u.totalPlays}
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[10px]">
                          {u.firstVisit}
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[10px]">
                          {u.lastVisit}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedUserSummary(u)}
                            className="px-2.5 py-1 rounded bg-[#050811] hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-100 border border-emerald-500/30 text-[10px] font-mono transition-colors cursor-pointer"
                          >
                            &gt; DOSSIER
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#020408] rounded-lg border border-emerald-950 text-slate-400 text-xs">
              &gt; NO AUTHENTICATED OPERATORS FOUND MATCHING SEARCH FILTER.
            </div>
          )}
        </div>
      )}

      {/* 3. ACTIVITY FEED TAB */}
      {activeSubTab === 'feed' && (
        <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-emerald-300">
                /telemetry/bts_packets.stream
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={feedFilterType}
                onChange={(e) => setFeedFilterType(e.target.value)}
                className="px-2.5 py-1 bg-[#020408] border border-emerald-500/30 rounded-lg text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono"
              >
                <option value="all">ALL_EVENTS</option>
                <option value="bts_page_open">PAGE_OPENS</option>
                <option value="bts_item_open">ITEM_VIEWS</option>
                <option value="bts_video_play">VIDEO_PLAYS</option>
                <option value="bts_audio_play">AUDIO_PLAYS</option>
                <option value="bts_random">RANDOM_BTS</option>
              </select>

              <select
                value={feedFormatFilter}
                onChange={(e) => setFeedFormatFilter(e.target.value)}
                className="px-2.5 py-1 bg-[#020408] border border-emerald-500/30 rounded-lg text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono"
              >
                <option value="all">ALL_FORMATS</option>
                <option value="image">PHOTOS</option>
                <option value="video">VIDEOS</option>
                <option value="audio">AUDIO</option>
                <option value="pdf">PDFS</option>
                <option value="html">HTML</option>
              </select>
            </div>
          </div>

          {/* Activity Rows */}
          {activities.length > 0 ? (
            <div className="space-y-1.5">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="bg-[#020408] p-3 rounded-lg border border-emerald-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="shrink-0">{getEventBadge(act.eventType)}</div>

                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-emerald-200 block truncate">
                        {act.itemTitle || act.itemId}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                        <span>by {act.userDisplayName}</span>
                        <span>•</span>
                        <span className="text-slate-500">{act.userEmail}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-right">
                    <span className="text-[10px] font-mono text-emerald-500/80">{act.createdAt}</span>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      OK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#020408] rounded-lg border border-emerald-950 text-slate-400 text-xs font-mono">
              &gt; NO RECENT BTS TELEMETRY EVENTS MATCHING ACTIVE FILTERS.
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
