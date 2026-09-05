import React from 'react';
import {
  Radio,
  Users,
  Activity,
  AlertCircle,
  Pause,
  Play,
  RotateCcw,
  Wifi,
  WifiOff,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LiveConnectionStatus, LiveActiveUser, LiveFeedItem } from '../../../types/tracking';

interface LiveStatusHeaderProps {
  connectionStatus: LiveConnectionStatus;
  users: LiveActiveUser[];
  feedItems: LiveFeedItem[];
  isPaused: boolean;
  onTogglePause: () => void;
  onManualRefresh: () => void;
  activeFilterCount: number;
}

export const LiveStatusHeader: React.FC<LiveStatusHeaderProps> = ({
  connectionStatus,
  users,
  feedItems,
  isPaused,
  onTogglePause,
  onManualRefresh,
  activeFilterCount,
}) => {
  const onlineCount = users.filter((u) => u.status === 'online').length;
  const recentCount = users.filter((u) => u.status === 'recent').length;
  const totalSessions = users.reduce((acc, u) => acc + (u.activeSessionCount || 0), 0);
  const errorEventsCount = feedItems.filter((e) => e.isError).length;

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          label: 'Live Connected',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dotClass: 'bg-emerald-400 animate-pulse',
          icon: Wifi,
        };
      case 'connecting':
        return {
          label: 'Connecting...',
          badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dotClass: 'bg-amber-400 animate-spin',
          icon: Clock,
        };
      case 'error':
        return {
          label: 'Reconnecting',
          badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dotClass: 'bg-rose-400',
          icon: AlertCircle,
        };
      case 'offline':
      default:
        return {
          label: 'Offline (Local)',
          badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-700',
          dotClass: 'bg-slate-500',
          icon: WifiOff,
        };
    }
  };

  const badge = getConnectionBadge();
  const IconComp = badge.icon;

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm space-y-4">
      {/* Top bar: title & live controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Live Activity Monitor
              </h2>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${badge.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                <span>{badge.label}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Observational real-time presence & multi-session exploration streams
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={onTogglePause}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title={isPaused ? 'Resume live feed updates' : 'Pause live feed streaming'}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>Paused (Click to Resume)</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-400" />
                <span>Pause Stream</span>
              </>
            )}
          </button>

          <button
            onClick={onManualRefresh}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700/80 transition-colors"
            title="Refresh stream state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Online Right Now
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{onlineCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Recent (15m)
            </div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{recentCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Active Sessions
            </div>
            <div className="text-xl font-bold text-indigo-400 mt-0.5">{totalSessions}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Live Feed Items
            </div>
            <div className="text-xl font-bold text-slate-200 mt-0.5">{feedItems.length}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Activity className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
