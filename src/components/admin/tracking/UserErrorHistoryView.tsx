import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';
import { ErrorHistoryItem } from '../../../types/tracking';

interface UserErrorHistoryViewProps {
  errors: ErrorHistoryItem[];
}

export const UserErrorHistoryView: React.FC<UserErrorHistoryViewProps> = ({ errors }) => {
  if (errors.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center text-xs space-y-2">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200">Zero Errors Encountered</h4>
        <p className="text-slate-400 max-w-sm mx-auto">
          This user has enjoyed a completely clean, error-free session history across all visits.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Client Exception & Error Logs
        </h3>
        <span className="text-xs font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
          {errors.length} incident{errors.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
        {errors.map((err) => (
          <div
            key={err.eventId}
            className="p-3.5 hover:bg-slate-800/30 transition-colors space-y-1.5 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {err.category}
              </span>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {err.timestampFormatted}
              </span>
            </div>

            <p className="text-slate-200 font-mono text-xs break-words">
              {err.message}
            </p>

            {(err.component || err.section || err.route) && (
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 flex-wrap pt-0.5">
                {err.component && <span>Component: {err.component}</span>}
                {err.section && <span>• Section: {err.section}</span>}
                {err.route && <span>• Route: {err.route}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
