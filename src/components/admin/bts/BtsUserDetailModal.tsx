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
        return <Music className="w-3.5 h-3.5 text-purple-400" />;
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-rose-400" />;
      case 'html':
        return <Code2 className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Film className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <header className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-3 min-w-0">
            {userSummary.photoURL ? (
              <img
                src={userSummary.photoURL}
                alt={userSummary.displayName}
                className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 font-bold">
                {userSummary.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2
                id="user-detail-title"
                className="text-base font-semibold text-slate-100 truncate"
              >
                {userSummary.displayName}
              </h2>
              <p className="text-xs text-slate-400 font-mono truncate">{userSummary.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close user details modal"
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Total BTS Visits</span>
              <p className="text-xl font-bold font-mono text-indigo-400">
                {userSummary.totalVisits}
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Items Opened</span>
              <p className="text-xl font-bold font-mono text-amber-400">
                {userSummary.totalItemsOpened}
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Media Plays</span>
              <p className="text-xl font-bold font-mono text-emerald-400">
                {userSummary.totalPlays}
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Random Triggers</span>
              <p className="text-xl font-bold font-mono text-rose-400">
                {userSummary.totalRandomClicks}
              </p>
            </div>
          </div>

          {/* Timestamps & UID Card */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Firebase UID:</span>
              <span className="font-mono text-slate-300">{userSummary.userId}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>First Behind The Scenes Visit:</span>
              <span className="font-mono text-slate-300">{userSummary.firstVisit}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Most Recent Activity:</span>
              <span className="font-mono text-slate-300">{userSummary.lastVisit}</span>
            </div>
          </div>

          {/* BTS Items Interacted Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Items Interacted ({itemsList.length})
              </h3>
            </div>

            {itemsList.length > 0 ? (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                      <tr>
                        <th className="p-3">Item Title & Type</th>
                        <th className="p-3 text-center">Opens</th>
                        <th className="p-3 text-center">Plays</th>
                        <th className="p-3 text-right">Last Opened</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {itemsList.map((item) => (
                        <tr key={item.itemId} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded bg-slate-800 shrink-0">
                                {getItemIcon(item.itemType)}
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-slate-200 block truncate">
                                  {item.itemTitle}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {item.itemId}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center font-mono text-amber-400 font-semibold">
                            {item.openCount}
                          </td>
                          <td className="p-3 text-center font-mono text-emerald-400">
                            {item.playCount > 0 ? item.playCount : '-'}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-400 text-[11px]">
                            {item.lastInteracted}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No specific items opened by this user yet (page visits only).
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </footer>
      </div>
    </div>
  );
};
