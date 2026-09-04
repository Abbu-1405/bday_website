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

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          label: 'STREAM: CONNECTED',
          badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
          dotClass: 'bg-emerald-400 animate-pulse',
          icon: Wifi,
        };
      case 'connecting':
        return {
          label: 'STREAM: CONNECTING',
          badgeClass: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/30',
          dotClass: 'bg-cyan-400 animate-spin',
          icon: Clock,
        };
      case 'error':
        return {
          label: 'STREAM: RECONNECTING',
          badgeClass: 'bg-rose-950/70 text-rose-400 border-rose-500/40',
          dotClass: 'bg-rose-400',
          icon: AlertCircle,
        };
      case 'offline':
      default:
        return {
          label: 'STREAM: OFFLINE',
          badgeClass: 'bg-[#030712] text-slate-400 border-emerald-950',
          dotClass: 'bg-slate-500',
          icon: WifiOff,
        };
    }
  };

  const badge = getConnectionBadge();

  return (
    <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 sm:p-5 font-mono shadow-[0_0_20px_rgba(16,185,129,0.03)] space-y-4">
      {/* Top bar: title & live controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#020408] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 font-bold tracking-wider">
                /monitor/live-telemetry
              </span>
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-semibold ${badge.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                <span>{badge.label}</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-600/90 font-mono mt-0.5">
              // Observational real-time presence & multi-session exploration streams
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={onTogglePause}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
              isPaused
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/40'
                : 'bg-[#020408] text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/40 hover:text-emerald-200'
            }`}
            title={isPaused ? 'Resume live feed updates' : 'Pause live feed streaming'}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>[RESUME_STREAM]</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-400" />
                <span>[PAUSE_STREAM]</span>
              </>
            )}
          </button>

          <button
            onClick={onManualRefresh}
            className="p-1.5 rounded-lg bg-[#020408] text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40 border border-emerald-500/30 transition-colors"
            title="Refresh stream state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-950/60">
        <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
              ONLINE NOW
            </div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{onlineCount}</div>
          </div>
          <div className="w-7 h-7 rounded bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-cyan-500 uppercase tracking-wider">
              RECENT (15M)
            </div>
            <div className="text-lg font-bold text-cyan-400 mt-0.5">{recentCount}</div>
          </div>
          <div className="w-7 h-7 rounded bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-teal-500 uppercase tracking-wider">
              ACTIVE SESSIONS
            </div>
            <div className="text-lg font-bold text-teal-300 mt-0.5">{totalSessions}</div>
          </div>
          <div className="w-7 h-7 rounded bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              BUFFER EVENTS
            </div>
            <div className="text-lg font-bold text-slate-200 mt-0.5">{feedItems.length}</div>
          </div>
          <div className="w-7 h-7 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
