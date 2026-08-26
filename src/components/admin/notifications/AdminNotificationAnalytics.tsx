import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Bell,
  RefreshCw,
  Layers,
  Smartphone,
  ShieldCheck,
  AlertOctagon,
  Globe,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
  MousePointerClick,
  Eye,
  Target,
  FileText,
  Zap,
  Brain,
  Sliders,
  Moon,
} from 'lucide-react';
import {
  NotificationTimeRange,
  NotificationAnalyticsSummary,
  NotificationCategoryStatItem,
  NotificationTimeSeriesPoint,
  NotificationFailureGroup,
  NotificationTokenHealth,
  NotificationGlobalControl,
  NotificationSystemHealth,
  NotificationEngagementSummary,
  NotificationIntelligenceAnalyticsSummary,
} from '../../../types';
import {
  fetchNotificationAnalytics,
  fetchTokenHealthStats,
  fetchNotificationSystemHealth,
  getNotificationGlobalControl,
} from '../../../services/notificationAnalyticsService';
import { AdminTestPushModal } from './AdminTestPushModal';
import { AdminEmergencySwitchModal } from './AdminEmergencySwitchModal';
import { AdminNotificationEventInspector } from './AdminNotificationEventInspector';
import { AdminNotificationIntelligenceControl } from './AdminNotificationIntelligenceControl';
import { useAuth } from '../../../hooks';

export function AdminNotificationAnalytics() {
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState<NotificationTimeRange>('7d');
  const [loading, setLoading] = useState(true);

  // Data states
  const [summary, setSummary] = useState<NotificationAnalyticsSummary | null>(null);
  const [categoryStats, setCategoryStats] = useState<NotificationCategoryStatItem[]>([]);
  const [timeSeries, setTimeSeries] = useState<NotificationTimeSeriesPoint[]>([]);
  const [failureGroups, setFailureGroups] = useState<NotificationFailureGroup[]>([]);
  const [tokenHealth, setTokenHealth] = useState<NotificationTokenHealth | null>(null);
  const [systemHealth, setSystemHealth] = useState<NotificationSystemHealth | null>(null);
  const [globalControl, setGlobalControl] = useState<NotificationGlobalControl>({ globalEnabled: true });
  const [engagement, setEngagement] = useState<NotificationEngagementSummary | null>(null);
  const [intelligence, setIntelligence] = useState<NotificationIntelligenceAnalyticsSummary | null>(null);
  const [showIntelligenceRules, setShowIntelligenceRules] = useState<boolean>(false);

  // Modal states
  const [showTestModal, setShowTestModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedInspectEvent, setSelectedInspectEvent] = useState<any | null>(null);
  const [expandedFailureGroup, setExpandedFailureGroup] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, tHealth, sHealth, gControl] = await Promise.all([
        fetchNotificationAnalytics(timeRange),
        fetchTokenHealthStats(),
        fetchNotificationSystemHealth(),
        getNotificationGlobalControl(),
      ]);

      setSummary(analyticsData.summary);
      setCategoryStats(analyticsData.categoryStats);
      setTimeSeries(analyticsData.timeSeries);
      setFailureGroups(analyticsData.failureGroups);
      setEngagement(analyticsData.engagement || null);
      setIntelligence(analyticsData.intelligence || null);
      setTokenHealth(tHealth);
      setSystemHealth(sHealth);
      setGlobalControl(gControl);
    } catch (err) {
      console.error('Error loading notification analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const maxTimeSeriesTotal = Math.max(...timeSeries.map((p) => p.total), 1);

  return (
    <div className="space-y-6">
      {/* Top Controls & Global Switch Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">Notification Analytics & Control Center</h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium flex items-center gap-1 ${
                globalControl.globalEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
              }`}
            >
              {globalControl.globalEnabled ? 'ENGINE ACTIVE' : 'EMERGENCY PAUSED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated delivery performance, queue throughput, and token health
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Pills */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-0.5 text-xs">
            {(['today', '7d', '30d', 'all'] as NotificationTimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  timeRange === r
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7D' : r === '30d' ? '30D' : 'All'}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowTestModal(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Test Push
          </button>

          <button
            onClick={() => setShowEmergencyModal(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              globalControl.globalEnabled
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            {globalControl.globalEnabled ? 'Emergency Pause' : 'Resume Engine'}
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-200">
            Dismiss
          </button>
        </div>
      )}

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
          <div className="text-slate-400 text-[11px] flex items-center justify-between font-mono">
            <span>TOTAL VOLUME</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 font-mono">
            {summary?.total ?? 0}
          </div>
          <div className="text-[10px] text-slate-500">All registered events</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
          <div className="text-slate-400 text-[11px] flex items-center justify-between font-mono">
            <span>DELIVERED (FCM)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {summary?.sent ?? 0}
          </div>
          <div className="text-[10px] text-slate-500">Gateway accepted</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
          <div className="text-slate-400 text-[11px] flex items-center justify-between font-mono">
            <span>SUCCESS RATE</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-300 font-mono">
            {summary?.successRate ?? 0}%
          </div>
          <div className="text-[10px] text-slate-500">Delivered / Terminal</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
          <div className="text-slate-400 text-[11px] flex items-center justify-between font-mono">
            <span>SCHEDULED</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300 font-mono">
            {summary?.scheduled ?? 0}
          </div>
          <div className="text-[10px] text-slate-500">Awaiting scheduled time</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
          <div className="text-slate-400 text-[11px] flex items-center justify-between font-mono">
            <span>IN FLIGHT / QUEUED</span>
            <Bell className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-300 font-mono">
            {(summary?.pending ?? 0) + (summary?.processing ?? 0)}
          </div>
          <div className="text-[10px] text-slate-500">Processing queue</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
          <div className="text-slate-400 text-[11px] flex items-center justify-between font-mono">
            <span>FAILED EVENTS</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            {summary?.failed ?? 0}
          </div>
          <div className="text-[10px] text-slate-500">Delivery exceptions</div>
        </div>
      </div>

      {/* Time Series Volume & Delivery Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-semibold text-slate-200">Notification Volume & Delivery Trends</h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Range: {timeRange.toUpperCase()}</span>
        </div>

        {timeSeries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No notification events recorded in this time range.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-40 flex items-end gap-2 pt-4 pb-2 px-2">
              {timeSeries.map((point) => {
                const totalHeightPct = Math.round((point.total / maxTimeSeriesTotal) * 100);
                const sentPct = point.total > 0 ? (point.sent / point.total) * 100 : 0;
                const failedPct = point.total > 0 ? (point.failed / point.total) * 100 : 0;

                return (
                  <div key={point.dateKey} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-950 text-slate-200 border border-slate-800 text-[10px] font-mono rounded-lg p-2 shadow-xl z-20 whitespace-nowrap">
                      <span className="font-semibold text-indigo-300">{point.label}</span>
                      <span>Total: {point.total}</span>
                      <span className="text-emerald-400">Delivered: {point.sent}</span>
                      <span className="text-rose-400">Failed: {point.failed}</span>
                      <span className="text-amber-400">Scheduled: {point.scheduled}</span>
                    </div>

                    {/* Bar Stack */}
                    <div
                      style={{ height: `${Math.max(totalHeightPct, 6)}%` }}
                      className="w-full max-w-[36px] rounded-t-md overflow-hidden flex flex-col-reverse bg-slate-800 transition-all group-hover:brightness-125"
                    >
                      <div style={{ height: `${sentPct}%` }} className="bg-emerald-500" />
                      <div style={{ height: `${failedPct}%` }} className="bg-rose-500" />
                    </div>

                    <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Delivered (FCM Success)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span>Failed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
                <span>Pending / Scheduled</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown & Delivery Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-200">Category Distribution & Success Rates</h4>
            <span className="text-[10px] font-mono text-slate-500">6 Core Categories</span>
          </div>

          <div className="space-y-3">
            {categoryStats.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">{item.label}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400">{item.count} events ({item.percentage}%)</span>
                    <span className="text-emerald-400 font-semibold">{item.successRate}% OK</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className="bg-indigo-500 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Performance & Scheduler Latency */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-200">Delivery Performance & Scheduler Health</h4>
            <span className="text-[10px] font-mono text-emerald-400">Server Metrics</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px]">Avg Processing Latency</div>
              <div className="text-base font-semibold text-slate-200 font-mono mt-0.5">
                {summary?.avgProcessingTimeMs ?? 0} ms
              </div>
              <div className="text-[10px] text-slate-500">Queue to FCM dispatch</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px]">Avg Delivery Attempts</div>
              <div className="text-base font-semibold text-slate-200 font-mono mt-0.5">
                {summary?.avgAttemptCount ?? 1}x
              </div>
              <div className="text-[10px] text-slate-500">Retries per event</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px]">Quiet Hours Deferrals</div>
              <div className="text-base font-semibold text-amber-300 font-mono mt-0.5">
                {summary?.quietHoursDelayedCount ?? 0}
              </div>
              <div className="text-[10px] text-slate-500">Rescheduled for morning</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px]">Token Dispatch Success</div>
              <div className="text-base font-semibold text-emerald-400 font-mono mt-0.5">
                {summary?.tokenDeliverySuccessRate ?? 0}%
              </div>
              <div className="text-[10px] text-slate-500">Multicast success rate</div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Info className="w-3.5 h-3.5 text-indigo-400" /> Dispatch Clarification
            </div>
            <p>
              "Delivered" denotes successful acceptance by FCM WebPush gateway servers. Actual user interaction/open rates are not conflated with delivery metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Phase 7: Notification Engagement & Interaction Funnel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-slate-100">User Engagement & Notification Interaction Funnel</h4>
          </div>
          <span className="text-[10px] text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono">
            Phase 7 Verified (Sent ≠ Clicked ≠ Content Opened)
          </span>
        </div>

        {/* Engagement KPI Funnel Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px] flex items-center justify-between font-mono">
              <span>CLICK-THROUGH (CTR)</span>
              <Target className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-purple-300 font-mono">
              {engagement?.clickThroughRate ?? 0}%
            </div>
            <div className="text-[10px] text-slate-500">
              {engagement?.uniqueClickedEvents ?? 0} clicked / {engagement?.totalSent ?? 0} sent
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px] flex items-center justify-between font-mono">
              <span>CONTENT OPEN RATE</span>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-300 font-mono">
              {engagement?.contentOpenRate ?? 0}%
            </div>
            <div className="text-[10px] text-slate-500">
              {engagement?.totalTargetOpened ?? 0} content views / {engagement?.uniqueClickedEvents ?? 0} clicks
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px] flex items-center justify-between font-mono">
              <span>AVG TIME TO CLICK</span>
              <Clock className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-lg font-bold text-sky-300 font-mono">
              {engagement?.avgTimeToClickMs && engagement.avgTimeToClickMs > 0
                ? engagement.avgTimeToClickMs > 60000
                  ? `${Math.round(engagement.avgTimeToClickMs / 60000)} min`
                  : `${Math.round(engagement.avgTimeToClickMs / 1000)} sec`
                : '—'}
            </div>
            <div className="text-[10px] text-slate-500">From FCM delivery to click</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px] flex items-center justify-between font-mono">
              <span>TOTAL CLICKS</span>
              <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-amber-300 font-mono">
              {engagement?.totalClicked ?? 0}
            </div>
            <div className="text-[10px] text-slate-500">All recorded interactions</div>
          </div>
        </div>

        {/* Category Engagement & Delivery Mode Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
          {/* By Category */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Engagement by Category</span>
              <span className="text-[10px] font-mono text-slate-400">CTR & Content Open %</span>
            </div>

            <div className="space-y-2.5">
              {engagement?.byCategory.map((cat) => (
                <div key={cat.category} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">{cat.label}</span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-400">{cat.clicked} clicks / {cat.sent} sent</span>
                      <span className="text-purple-300 font-semibold">{cat.ctr}% CTR</span>
                      <span className="text-emerald-400 font-semibold">{cat.contentOpenRate}% Opened</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min(cat.ctr, 100)}%` }}
                      className="bg-purple-500 rounded-full"
                      title={`${cat.ctr}% CTR`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Delivery Mode & Template Engagement */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Delivery Mode & Template Breakdown</span>
              <span className="text-[10px] font-mono text-slate-400">Immediate vs Scheduled</span>
            </div>

            {/* Mode Split */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Immediate
                </div>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-sm font-bold text-slate-200">
                    {engagement?.byDeliveryMode.immediate.ctr ?? 0}% CTR
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    {engagement?.byDeliveryMode.immediate.contentOpenRate ?? 0}% open
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {engagement?.byDeliveryMode.immediate.clicked ?? 0} / {engagement?.byDeliveryMode.immediate.sent ?? 0}
                </div>
              </div>

              <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400" /> Scheduled
                </div>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-sm font-bold text-slate-200">
                    {engagement?.byDeliveryMode.scheduled.ctr ?? 0}% CTR
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    {engagement?.byDeliveryMode.scheduled.contentOpenRate ?? 0}% open
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {engagement?.byDeliveryMode.scheduled.clicked ?? 0} / {engagement?.byDeliveryMode.scheduled.sent ?? 0}
                </div>
              </div>
            </div>

            {/* Template Engagement List */}
            <div className="pt-1 space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Top Templates by Performance
              </span>
              {engagement?.byTemplate && engagement.byTemplate.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-none">
                  {engagement.byTemplate.slice(0, 4).map((tmpl) => (
                    <div
                      key={`${tmpl.templateId}_${tmpl.templateVersion}`}
                      className="flex items-center justify-between text-xs bg-slate-900/50 p-2 rounded-lg border border-slate-800/60"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium text-slate-300 truncate">{tmpl.title}</div>
                        <div className="text-[10px] font-mono text-slate-500">v{tmpl.templateVersion} • {tmpl.category}</div>
                      </div>
                      <div className="font-mono text-[11px] text-right shrink-0">
                        <div className="text-purple-300 font-semibold">{tmpl.ctr}% CTR</div>
                        <div className="text-[10px] text-slate-400">{tmpl.clicked}/{tmpl.sent} sent</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2">
                  No template-specific engagement data captured yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phase 8: Smart Notification Intelligence & Decision Performance */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-slate-200">
                  Phase 8: Smart Intelligence & Decision Observability
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Explainable Rule Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Deterministic decision funnel, quiet-hours deferrals, cooldown anti-spam, and user preference protection
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowIntelligenceRules(!showIntelligenceRules)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto ${
              showIntelligenceRules
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showIntelligenceRules ? 'Hide Rules Config' : 'Configure Rules'}</span>
          </button>
        </div>

        {/* Expandable Rules Config Drawer */}
        {showIntelligenceRules && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <AdminNotificationIntelligenceControl
              adminUid={currentUser?.uid}
              onConfigSaved={() => loadData()}
            />
          </div>
        )}

        {/* Top Funnel Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/90 space-y-1">
            <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Decisions Evaluated</span>
            </div>
            <div className="text-lg font-bold text-slate-100 font-mono">
              {intelligence?.totalDecisions ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">100% evaluated</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/90 space-y-1">
            <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Allowed Directly</span>
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {intelligence?.allowedCount ?? 0}
            </div>
            <div className="text-[10px] text-emerald-400/90 font-mono">
              {intelligence?.allowedRate ?? 0}% throughput
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/90 space-y-1">
            <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Timing Postponed</span>
            </div>
            <div className="text-lg font-bold text-amber-400 font-mono">
              {intelligence?.delayedCount ?? 0}
            </div>
            <div className="text-[10px] text-amber-400/90 font-mono">
              {intelligence?.delayedRate ?? 0}% deferred
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/90 space-y-1">
            <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>Suppressed / Filtered</span>
            </div>
            <div className="text-lg font-bold text-rose-400 font-mono">
              {intelligence?.suppressedCount ?? 0}
            </div>
            <div className="text-[10px] text-rose-400/90 font-mono">
              {intelligence?.suppressedRate ?? 0}% filtered
            </div>
          </div>
        </div>

        {/* Smart Protection Impact */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-purple-950/20 p-3.5 rounded-xl border border-purple-900/30 text-xs">
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-mono text-purple-300/70">Anti-Spam Spacing</div>
            <div className="font-semibold text-purple-200 font-mono text-sm">
              {intelligence?.savedByCooldowns ?? 0}
            </div>
            <div className="text-[10px] text-purple-300/80">Spaced by cooldown rules</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-mono text-purple-300/70">Quiet Hours Guard</div>
            <div className="font-semibold text-indigo-300 font-mono text-sm">
              {intelligence?.delayedByQuietHours ?? 0}
            </div>
            <div className="text-[10px] text-purple-300/80">Protected recipient sleep</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-mono text-purple-300/70">Window Optimization</div>
            <div className="font-semibold text-emerald-300 font-mono text-sm">
              {intelligence?.delayedBySmartWindow ?? 0}
            </div>
            <div className="text-[10px] text-purple-300/80">Shifted to peak read hour</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-mono text-purple-300/70">Average Deferral</div>
            <div className="font-semibold text-amber-300 font-mono text-sm">
              {intelligence?.avgDelayMinutes ?? 0} min
            </div>
            <div className="text-[10px] text-purple-300/80">Mean shift for timing delay</div>
          </div>
        </div>

        {/* Priority & Reason Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
          {/* Decision Reason Audit Distribution */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Decision Outcome Reasons</span>
              <span className="text-[10px] font-mono text-slate-400">Explainable Audit Trail</span>
            </div>

            {intelligence?.byReason && intelligence.byReason.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {intelligence.byReason.map((r) => (
                  <div key={r.reason} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300 font-medium truncate max-w-[200px]">
                        {r.label}
                      </span>
                      <span className="font-mono text-slate-400">
                        {r.count} ({r.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          r.reason.startsWith('ALLOWED')
                            ? 'bg-emerald-500'
                            : r.reason === 'QUIET_HOURS' || r.reason === 'SMART_DELAY' || r.reason === 'SCHEDULED_FOR_LATER'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(r.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">
                No decision reason telemetry recorded yet in this time range.
              </div>
            )}
          </div>

          {/* Decision Priority Distribution */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Delivery Priority Distribution</span>
              <span className="text-[10px] font-mono text-slate-400">Tier Allocation</span>
            </div>

            <div className="space-y-2.5">
              {intelligence?.byPriority?.map((p) => {
                const badgeColor =
                  p.priority === 'URGENT'
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                    : p.priority === 'HIGH'
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                    : p.priority === 'NORMAL'
                    ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
                    : 'text-slate-400 bg-slate-800 border-slate-700';

                const barColor =
                  p.priority === 'URGENT'
                    ? 'bg-rose-500'
                    : p.priority === 'HIGH'
                    ? 'bg-amber-500'
                    : p.priority === 'NORMAL'
                    ? 'bg-indigo-500'
                    : 'bg-slate-600';

                return (
                  <div key={p.priority} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>
                        {p.priority}
                      </span>
                      <span className="font-mono text-slate-300 text-xs">
                        {p.count} events ({p.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${Math.max(p.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Device & Token Health Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-semibold text-slate-200">Device & FCM Token Health</h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> No Raw Tokens Exposed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px]">Total Registered Tokens</div>
            <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">
              {tokenHealth?.totalRegisteredTokens ?? 0}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px]">Enabled & Active Tokens</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {tokenHealth?.enabledTokens ?? 0}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px]">Invalidated Tokens</div>
            <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
              {tokenHealth?.invalidatedTokens ?? 0} ({tokenHealth?.invalidTokenRate ?? 0}%)
            </div>
          </div>
        </div>

        {/* Platform & Browser Distribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Platform Distribution
            </span>
            <div className="space-y-1.5">
              {tokenHealth?.platformBreakdown && tokenHealth.platformBreakdown.length > 0 ? (
                tokenHealth.platformBreakdown.map((p) => (
                  <div key={p.name} className="flex justify-between items-center text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-300">{p.name}</span>
                    <span className="font-mono text-slate-400">{p.count} ({p.percentage}%)</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">No platform telemetry available yet.</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Browser Distribution
            </span>
            <div className="space-y-1.5">
              {tokenHealth?.browserBreakdown && tokenHealth.browserBreakdown.length > 0 ? (
                tokenHealth.browserBreakdown.map((b) => (
                  <div key={b.name} className="flex justify-between items-center text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-300">{b.name}</span>
                    <span className="font-mono text-slate-400">{b.count} ({b.percentage}%)</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">No browser telemetry available yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Failure Breakdown & Diagnostics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-semibold text-slate-200">Failure Diagnostics & Root Causes</h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {summary?.failed ?? 0} Total Failures
          </span>
        </div>

        {failureGroups.length === 0 ? (
          <div className="p-8 text-center text-emerald-400 text-xs flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/80" />
            <span>Zero delivery failures recorded in this time range. Everything running smoothly!</span>
          </div>
        ) : (
          <div className="space-y-3">
            {failureGroups.map((grp) => {
              const isExpanded = expandedFailureGroup === grp.group;
              return (
                <div
                  key={grp.group}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden text-xs"
                >
                  <button
                    onClick={() => setExpandedFailureGroup(isExpanded ? null : grp.group)}
                    className="w-full p-3 flex items-center justify-between hover:bg-slate-900/50 transition-colors text-left"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium text-slate-200 flex items-center gap-2">
                        <span>{grp.label}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-900/40">
                          {grp.count} ({grp.percentage}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{grp.description}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="p-3 border-t border-slate-800 bg-slate-900/30 space-y-2">
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        Recent Occurrence Examples
                      </div>
                      <div className="space-y-1.5">
                        {grp.recentExamples.map((ex) => (
                          <div
                            key={ex.id}
                            className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center text-[11px]"
                          >
                            <div className="space-y-0.5">
                              <span className="font-medium text-slate-300">{ex.title}</span>
                              <div className="font-mono text-rose-400/90 text-[10px]">{ex.reason}</div>
                            </div>
                            <span className="font-mono text-[10px] text-slate-500">
                              {new Date(ex.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showTestModal && currentUser?.uid && (
        <AdminTestPushModal
          currentUserId={currentUser.uid}
          onClose={() => setShowTestModal(false)}
          onSuccess={(eventId) => {
            setActionNotice(`Test notification queued successfully (ID: ${eventId.slice(-8)}).`);
            loadData();
          }}
        />
      )}

      {showEmergencyModal && currentUser?.uid && (
        <AdminEmergencySwitchModal
          currentGlobalEnabled={globalControl.globalEnabled}
          adminUid={currentUser.uid}
          onClose={() => setShowEmergencyModal(false)}
          onSuccess={(newStatus) => {
            setGlobalControl((prev) => ({ ...prev, globalEnabled: newStatus }));
            setActionNotice(
              newStatus
                ? 'Global notifications resumed successfully.'
                : 'Emergency pause engaged. All automatic push generation is paused.'
            );
            loadData();
          }}
        />
      )}

      {selectedInspectEvent && (
        <AdminNotificationEventInspector
          event={selectedInspectEvent}
          onClose={() => setSelectedInspectEvent(null)}
        />
      )}
    </div>
  );
}
