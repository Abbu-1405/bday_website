import React, { useEffect } from 'react';
import {
  X,
  User,
  Film,
  Calendar,
  Eye,
  Play,
  Sparkles,
  ExternalLink,
  FileText,
  Music,
  Video,
  Image,
  Code2,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { BtsUserSummary, BtsItemType } from '../../../types';

interface BtsUserDetailModalProps {
  userSummary: BtsUserSummary | null;
  onClose: () => void;
}

export const BtsUserDetailModal: React.FC<BtsUserDetailModalProps> = ({
  userSummary,
  onClose,
}) => {
  useEffect(() => {
    if (!userSummary) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userSummary, onClose]);

  if (!userSummary) return null;

  type ItemInteractionRecord = BtsUserSummary['itemInteractions'][string];
  const rawItems = Object.values(userSummary.itemInteractions || {}) as ItemInteractionRecord[];
  const itemsList = [...rawItems].sort((a, b) => b.openCount - a.openCount);

  const getItemIcon = (type: BtsItemType) => {
    switch (type) {
      case 'image':
        return <Image className="w-3.5 h-3.5 text-amber-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-emerald-400" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-teal-400" />;
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-rose-400" />;
      case 'html':
        return <Code2 className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Film className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-150 font-mono"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#050811] border border-emerald-500/30 text-slate-100 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 select-none">
        {/* Modal Header */}
        <header className="p-4 border-b border-emerald-950 flex items-center justify-between gap-3 bg-[#020408]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#050811] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-xs">
              <Terminal className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-300">
                  /telemetry/dossier/{userSummary.userId.substring(0, 10)}
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                  AUTH_VERIFIED
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                {userSummary.displayName} &lt;{userSummary.email}&gt;
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close user details modal"
            className="p-1 rounded bg-[#050811] text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-950 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">BTS SESSIONS</span>
              <p className="text-lg font-bold font-mono text-cyan-400">
                {userSummary.totalVisits}
              </p>
            </div>

            <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">ITEMS OPENED</span>
              <p className="text-lg font-bold font-mono text-amber-400">
                {userSummary.totalItemsOpened}
              </p>
            </div>

            <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">MEDIA PLAYS</span>
              <p className="text-lg font-bold font-mono text-emerald-400">
                {userSummary.totalPlays}
              </p>
            </div>

            <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">RANDOM TRIGGERS</span>
              <p className="text-lg font-bold font-mono text-rose-400">
                {userSummary.totalRandomClicks}
              </p>
            </div>
          </div>

          {/* Timestamps & UID Card */}
          <div className="bg-[#020408] p-3.5 rounded-lg border border-emerald-950 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase">FIREBASE UID:</span>
              <span className="font-mono text-cyan-300 select-all">{userSummary.userId}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase">FIRST ACCESS TELEMETRY:</span>
              <span className="font-mono text-emerald-400">{userSummary.firstVisit}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase">LAST RECORDED PACKET:</span>
              <span className="font-mono text-emerald-400">{userSummary.lastVisit}</span>
            </div>
          </div>

          {/* BTS Items Interacted Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                ITEMS INTERACTION AUDIT ({itemsList.length})
              </h3>
            </div>

            {itemsList.length > 0 ? (
              <div className="border border-emerald-950 rounded-lg overflow-hidden bg-[#020408]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-emerald-950/60 font-mono">
                    <thead className="bg-[#050811] text-[10px] font-mono text-emerald-500 uppercase">
                      <tr>
                        <th className="p-2.5">ITEM IDENTIFIER & TYPE</th>
                        <th className="p-2.5 text-center">OPENS</th>
                        <th className="p-2.5 text-center">PLAYS</th>
                        <th className="p-2.5 text-right">LAST INTERACTED</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-950/40">
                      {itemsList.map((item) => (
                        <tr key={item.itemId} className="hover:bg-emerald-950/20 transition-colors text-[11px]">
                          <td className="p-2.5">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded bg-[#050811] border border-emerald-950 shrink-0">
                                {getItemIcon(item.itemType)}
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-emerald-200 block truncate">
                                  {item.itemTitle}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {item.itemId}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-2.5 text-center font-mono text-amber-400 font-semibold">
                            {item.openCount}
                          </td>
                          <td className="p-2.5 text-center font-mono text-emerald-400">
                            {item.playCount > 0 ? item.playCount : '-'}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-400 text-[10px]">
                            {item.lastInteracted}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-[#020408] rounded-lg border border-emerald-950 text-slate-400 text-xs">
                &gt; NO SPECIFIC ITEMS ACCESSED BY THIS OPERATOR YET.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="p-3 border-t border-emerald-950 bg-[#020408] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-[#050811] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono transition-colors border border-emerald-500/30 cursor-pointer"
          >
            [DISMISS_DOSSIER]
          </button>
        </footer>
      </div>
    </div>
  );
};
