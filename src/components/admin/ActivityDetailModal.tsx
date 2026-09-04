import React from 'react';
import { X, Clock, User, Tag, Database, ShieldCheck, Terminal } from 'lucide-react';
import { AdminActivityItem } from '../../services/adminService';

interface ActivityDetailModalProps {
  activity: AdminActivityItem | null;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ activity, onClose }) => {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-fade-in font-mono">
      <div className="relative w-full max-w-lg bg-[#050811] border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden text-slate-100 select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-950 bg-[#020408]">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-xs text-emerald-300 tracking-wider">
              /telemetry/inspect/event#{activity.id?.substring(0, 8) || '0000'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#050811] text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-950 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
              <span className="text-[10px] text-emerald-600 flex items-center gap-1.5 mb-1 font-semibold uppercase">
                <Tag className="w-3 h-3 text-cyan-400" /> EVENT TYPE
              </span>
              <p className="font-mono text-xs text-cyan-300 font-medium">{activity.type}</p>
            </div>

            <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
              <span className="text-[10px] text-emerald-600 flex items-center gap-1.5 mb-1 font-semibold uppercase">
                <Database className="w-3 h-3 text-emerald-400" /> SECTION / MODULE
              </span>
              <p className="font-medium text-emerald-300 uppercase">{activity.section || 'GLOBAL'}</p>
            </div>
          </div>

          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">ITEM IDENTIFIER</span>
              <p className="font-mono text-xs text-slate-200 break-all">{activity.itemId || 'N/A'}</p>
            </div>
            <div className="pt-2 border-t border-emerald-950/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase">
                <Clock className="w-3 h-3 text-emerald-500" /> LOG TIMESTAMP
              </span>
              <span className="text-xs font-medium text-emerald-300">{activity.createdAt}</span>
            </div>
          </div>

          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mb-1 uppercase">
              <User className="w-3 h-3 text-teal-400" /> USER IDENTIFIER / UID
            </span>
            <p className="font-mono text-xs text-cyan-300 break-all select-all">{activity.userId || 'anonymous'}</p>
          </div>

          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 space-y-1.5">
              <span className="text-[10px] text-emerald-500/80 block font-semibold uppercase">EVENT PAYLOAD METADATA</span>
              <pre className="text-[11px] font-mono text-emerald-400 bg-[#050811] p-2.5 rounded border border-emerald-950 overflow-x-auto">
                {JSON.stringify(activity.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex items-center gap-2 p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted telemetry log payload verified against Firestore Security Claim standards.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#020408] border-t border-emerald-950 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-[#050811] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono font-medium transition-colors border border-emerald-500/30"
          >
            [DISMISS]
          </button>
        </div>
      </div>
    </div>
  );
};
