import React from 'react';
import { X, Clock, User, Tag, Database, ShieldCheck } from 'lucide-react';
import { AdminActivityItem } from '../../services/adminService';

interface ActivityDetailModalProps {
  activity: AdminActivityItem | null;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ activity, onClose }) => {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-base text-slate-100">Activity Event Details</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Event Type
              </span>
              <p className="font-mono text-xs text-indigo-300 font-medium">{activity.type}</p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> Section
              </span>
              <p className="font-medium text-slate-200 capitalize">{activity.section}</p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Item ID</span>
              <p className="font-mono text-xs text-slate-200 break-all">{activity.itemId}</p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Timestamp
              </span>
              <span className="text-xs font-medium text-slate-300">{activity.createdAt}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-sky-400" /> User UID
            </span>
            <p className="font-mono text-xs text-slate-300 break-all">{activity.userId}</p>
          </div>

          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
              <span className="text-xs text-slate-400 block font-medium">Event Metadata</span>
              <pre className="text-xs font-mono text-emerald-400 bg-slate-900 p-2.5 rounded-lg overflow-x-auto border border-slate-800">
                {JSON.stringify(activity.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-indigo-950/30 border border-indigo-800/30 rounded-xl text-xs text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Private submission text is kept securely in private collections and not included in activity logs.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
