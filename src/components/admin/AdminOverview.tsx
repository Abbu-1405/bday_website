import React from 'react';
import { RefreshCw, Activity, Terminal, Shield, Sparkles } from 'lucide-react';
import {
  AdminOverviewStats,
  AdminActivityItem,
  AdminUserItem,
} from '../../services/adminService';
import { TerminalMetricsGrid } from './overview/TerminalMetricsGrid';
import { TerminalAnalyticsChart } from './overview/TerminalAnalyticsChart';
import { TerminalLiveStream } from './overview/TerminalLiveStream';
import { TerminalSecurityPanel } from './overview/TerminalSecurityPanel';

export interface AdminOverviewProps {
  stats: AdminOverviewStats;
  loading: boolean;
  onRefresh: () => void;
  onNavigateToActivity: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToFeelings?: () => void;
  onNavigateToLetters?: () => void;
  onNavigateToBts?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToContent?: () => void;
  onNavigateToSettings?: () => void;
  activities?: AdminActivityItem[];
  users?: AdminUserItem[];
  adminEmail?: string;
  adminUid?: string;
  adminName?: string;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  loading,
  onRefresh,
  onNavigateToActivity,
  onNavigateToUsers,
  onNavigateToFeelings,
  onNavigateToLetters,
  onNavigateToBts,
  onNavigateToNotifications,
  onNavigateToContent,
  onNavigateToSettings,
  activities = [],
  users = [],
  adminEmail,
  adminUid,
  adminName = 'ADMINISTRATOR',
}) => {
  return (
    <div className="space-y-5 font-mono">
      {/* ──────────────────────────────────────────────────
          1. SYSTEM OVERVIEW HEADER (/home)
          ────────────────────────────────────────────────── */}
      <div className="bg-[#050811]/95 border border-emerald-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 font-bold tracking-wider">
                /home [SYS:CORE]
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-semibold">
                ROOT_CONSOLE
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
              WELCOME BACK,{' '}
              <span className="text-emerald-400">
                {(adminName || 'COMMANDER').toUpperCase()}
              </span>
            </h2>

            <p className="text-xs text-emerald-600/90 font-mono">
              // Constellation monitor active. Telemetry linked to private universe.
            </p>
          </div>

          {/* Quick Controls & Status Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#020408] border border-emerald-950 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span>SUBSYSTEMS: 5/5 ONLINE</span>
            </div>

            <button
              onClick={onRefresh}
              disabled={loading}
              title="Re-query Firestore metrics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs border border-emerald-500/30 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`}
              />
              <span>POLL_SYNC</span>
            </button>

            <button
              onClick={onNavigateToActivity}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-xs border border-emerald-500/50 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>LIVE_ACTIVITY</span>
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────
          2. TERMINAL METRICS MONITORING GRID (9 CARDS)
          ────────────────────────────────────────────────── */}
      <TerminalMetricsGrid
        stats={stats}
        loading={loading}
        onNavigateToActivity={onNavigateToActivity}
        onNavigateToUsers={onNavigateToUsers}
        onNavigateToFeelings={onNavigateToFeelings}
        onNavigateToLetters={onNavigateToLetters}
        onNavigateToBts={onNavigateToBts}
      />

      {/* ──────────────────────────────────────────────────
          3. TWO-COLUMN OPERATIONAL CONSOLE
          Left: Luminous Chart & Live Activity Stream
          Right: System Status, Security & Quick Actions
          ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 spans): Analytics & Live Stream */}
        <div className="lg:col-span-2 space-y-5">
          <TerminalAnalyticsChart
            activities={activities}
            stats={stats}
            loading={loading}
          />

          <TerminalLiveStream
            activities={activities}
            loading={loading}
            onNavigateToActivity={onNavigateToActivity}
            onRefresh={onRefresh}
          />
        </div>

        {/* Right Column (1 span): System & Security Panel + Quick Actions */}
        <div className="lg:col-span-1">
          <TerminalSecurityPanel
            adminEmail={adminEmail}
            adminUid={adminUid}
            totalUsersCount={users.length || stats.totalUsers}
            onNavigateToNotifications={onNavigateToNotifications}
            onNavigateToUsers={onNavigateToUsers}
            onNavigateToContent={onNavigateToContent}
            onNavigateToActivity={onNavigateToActivity}
            onNavigateToLetters={onNavigateToLetters}
            onNavigateToFeelings={onNavigateToFeelings}
            onNavigateToBts={onNavigateToBts}
            onNavigateToSettings={onNavigateToSettings}
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────
          4. TERMINAL FOOTER
          ────────────────────────────────────────────────── */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[0_0_15px_rgba(16,185,129,0.03)]">
        <div className="flex items-center gap-2 text-emerald-600 font-mono text-[11px]">
          <span>// PRIVATE SYSTEM //</span>
          <span className="hidden sm:inline">// AUTHORIZED PERSONNEL ONLY //</span>
          <span>// STARLIT LETTERS //</span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] bg-[#020408] px-2.5 py-1 rounded border border-emerald-950">
          <span className="text-cyan-400">root@starlit-letters</span>
          <span className="text-slate-500">:</span>
          <span className="text-emerald-300">~#</span>
          <span className="w-2 h-3.5 bg-emerald-400 animate-pulse inline-block align-middle ml-0.5" />
        </div>
      </div>
    </div>
  );
};
