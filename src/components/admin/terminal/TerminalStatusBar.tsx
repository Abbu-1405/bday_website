import React from 'react';
import { Shield, RefreshCw, Download } from 'lucide-react';
import { isFirebaseConfigured } from '../../../firebase';

interface TerminalStatusBarProps {
  totalUsers: number;
  onlineUsers?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
  onExportCsv?: () => void;
  isExporting?: boolean;
}

export const TerminalStatusBar: React.FC<TerminalStatusBarProps> = ({
  totalUsers,
  onlineUsers = 0,
  isLoading = false,
  onRefresh,
  onExportCsv,
  isExporting = false,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 py-2 px-3 sm:px-4 rounded-xl bg-zinc-950/80 border border-emerald-500/20 font-mono text-[11px] select-none shadow-[0_0_15px_-4px_rgba(16,185,129,0.08)]">
      {/* Left System Status Indicators */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* SYS: ONLINE */}
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>[ SYS: ONLINE ]</span>
        </div>

        {/* FIREBASE: CONNECTED */}
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>[ FIREBASE: {isFirebaseConfigured ? 'CONNECTED' : 'DISCONNECTED'} ]</span>
        </div>

        {/* USERS: X */}
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
          <span>[ USERS: {totalUsers} ]</span>
          {onlineUsers > 0 && (
            <span className="text-emerald-400 font-bold">({onlineUsers} LIVE)</span>
          )}
        </div>

        {/* ACTIVITY STREAM: LIVE */}
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/20 text-emerald-300/90 border border-emerald-500/20">
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
          <span>[ ACTIVITY STREAM: LIVE ]</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 ml-auto">
        {onExportCsv && (
          <button
            onClick={onExportCsv}
            disabled={isLoading || isExporting || totalUsers === 0}
            id="btn-terminal-export-csv"
            title="Export platform user directory to CSV"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-emerald-950/50 text-zinc-300 hover:text-emerald-400 border border-zinc-700/80 hover:border-emerald-500/40 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>[ EXPORT CSV ]</span>
          </button>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            id="btn-terminal-refresh"
            title="Reload registry state"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 border border-zinc-700/80 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>[ SYNC ]</span>
          </button>
        )}
      </div>
    </div>
  );
};
