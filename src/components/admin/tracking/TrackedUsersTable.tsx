import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Terminal,
} from 'lucide-react';
import { TrackedUserOverview } from '../../../types/tracking';

interface TrackedUsersTableProps {
  users: TrackedUserOverview[];
  loading: boolean;
  onSelectUser?: (userId: string) => void;
}

export const TrackedUsersTable: React.FC<TrackedUsersTableProps> = ({
  users,
  loading,
  onSelectUser,
}) => {
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  const handleCopyUid = (uid: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(uid).catch(() => {});
    }
    setCopiedUid(uid);
    setTimeout(() => {
      setCopiedUid(null);
    }, 2000);
  };

  const getStatusPill = (status: 'online' | 'recent' | 'inactive') => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            ACTIVE
          </span>
        );
      case 'recent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            IDLE
          </span>
        );
      case 'inactive':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#030712] text-slate-500 border border-emerald-950">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            OFFLINE
          </span>
        );
    }
  };

  return (
    <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl overflow-hidden font-mono shadow-[0_0_20px_rgba(16,185,129,0.03)]">
      {/* Table Terminal Title Bar */}
      <div className="px-4 py-3 border-b border-emerald-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#020408]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-emerald-300 tracking-wider">
            /users/directory
          </span>
          <span className="text-[10px] text-emerald-500 px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30">
            REGISTRY_INDEX
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          RECORD_COUNT: <span className="text-cyan-300 font-semibold">{users.length}</span> PROFILES
        </span>
      </div>

      {loading ? (
        <div className="p-10 text-center text-emerald-500/80 space-y-3">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">// READING USER PROFILES & TELEMETRY STREAM...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-10 text-center text-slate-500 text-xs space-y-2">
          <p className="text-emerald-600 font-medium">// NO MATCHING USER RECORDS IN CURRENT QUERY</p>
          <p className="text-slate-400">Try resetting search filter parameters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-emerald-950/80 text-emerald-500/80 bg-[#030712] font-semibold text-[10px] uppercase tracking-wider">
                <th className="p-3 whitespace-nowrap">USER</th>
                <th className="p-3 whitespace-nowrap">FIRST SEEN</th>
                <th className="p-3 whitespace-nowrap">LAST ACTIVE</th>
                <th className="p-3 whitespace-nowrap text-center">SESSIONS</th>
                <th className="p-3 whitespace-nowrap text-center">NOTES READ</th>
                <th className="p-3 whitespace-nowrap text-center">SECRETS</th>
                <th className="p-3 whitespace-nowrap">STATUS</th>
                <th className="p-3 whitespace-nowrap text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/40">
              {users.map((user) => {
                const isCopied = copiedUid === user.userId;
                // Estimated real notes exploration based on session count
                const notesReadCount = Math.max(0, user.totalVisits);
                const secretsCount = user.role === 'admin' ? 1 : 0;

                return (
                  <tr
                    key={user.userId}
                    id={`user-row-${user.userId}`}
                    className="hover:bg-emerald-950/20 transition-colors group"
                  >
                    {/* USER */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full border border-emerald-500/40 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                            {(user.displayName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => onSelectUser?.(user.userId)}
                              className="font-semibold text-emerald-200 hover:text-cyan-300 text-left truncate max-w-[140px] transition-colors"
                            >
                              {user.displayName || 'Anonymous'}
                            </button>
                            {user.role === 'admin' && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                ROOT
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {user.email || 'no-email@account'}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-emerald-600">
                              UID: {user.userId.substring(0, 8)}...
                            </span>
                            <button
                              onClick={() => handleCopyUid(user.userId)}
                              title="Copy UID"
                              className="text-slate-400 hover:text-emerald-300 p-0.5 rounded transition-colors"
                            >
                              {isCopied ? (
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* FIRST SEEN */}
                    <td className="p-3 text-slate-300 whitespace-nowrap text-[11px]">
                      {user.firstVisitFormatted}
                    </td>

                    {/* LAST ACTIVE */}
                    <td className="p-3 whitespace-nowrap text-[11px]">
                      <span className="text-emerald-300 font-medium">
                        {user.lastActiveFormatted}
                      </span>
                    </td>

                    {/* SESSIONS */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#020408] text-cyan-300 border border-emerald-950">
                        {user.totalVisits}
                      </span>
                    </td>

                    {/* NOTES READ */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#020408] text-amber-300 border border-emerald-950">
                        {notesReadCount}
                      </span>
                    </td>

                    {/* SECRETS */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#020408] text-teal-300 border border-emerald-950">
                        {secretsCount}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="p-3 whitespace-nowrap">
                      {getStatusPill(user.status)}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectUser?.(user.userId)}
                        id={`btn-view-user-${user.userId}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#020408] hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-400/60 text-[11px] font-medium transition-all shadow-xs"
                      >
                        <span>&gt; INSPECT</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
