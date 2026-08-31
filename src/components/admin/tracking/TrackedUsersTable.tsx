import React, { useState } from 'react';
import {
  Users,
  Compass,
  Calendar,
  Clock,
  Hourglass,
  MapPin,
  Laptop,
  Smartphone,
  Tablet,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { TrackedUserOverview, DeviceCategory } from '../../../types/tracking';

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

  const getDeviceIcon = (category?: DeviceCategory) => {
    switch (category) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
      default:
        return Laptop;
    }
  };

  const getStatusBadge = (status: 'online' | 'recent' | 'inactive') => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        );
      case 'recent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Active Today
          </span>
        );
      case 'inactive':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/80">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Table Title Bar */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-400" />
          Tracked User Activity Registry
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {users.length} user{users.length === 1 ? '' : 's'} registered
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Compiling user session metrics and activity records...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs space-y-2">
          <p className="text-slate-400 font-medium">No matching user tracking records found.</p>
          <p className="text-slate-500">Try adjusting your search criteria or status filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-medium">
                <th className="p-3.5 whitespace-nowrap">User Identity</th>
                <th className="p-3.5 whitespace-nowrap">Status</th>
                <th className="p-3.5 whitespace-nowrap text-center">Total Visits</th>
                <th className="p-3.5 whitespace-nowrap">First Visit</th>
                <th className="p-3.5 whitespace-nowrap">Last Active</th>
                <th className="p-3.5 whitespace-nowrap">Time Spent</th>
                <th className="p-3.5 whitespace-nowrap">Last Known Section</th>
                <th className="p-3.5 whitespace-nowrap">Device / Platform</th>
                <th className="p-3.5 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((user) => {
                const DeviceIcon = getDeviceIcon(user.deviceCategory);
                const isCopied = copiedUid === user.userId;

                return (
                  <tr
                    key={user.userId}
                    id={`user-row-${user.userId}`}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* User Identity */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            className="w-9 h-9 rounded-full border border-slate-700 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-semibold text-xs shrink-0">
                            {(user.displayName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => onSelectUser?.(user.userId)}
                              className="font-semibold text-slate-200 hover:text-indigo-400 text-left truncate max-w-[150px] transition-colors"
                            >
                              {user.displayName}
                            </button>
                            {user.role === 'admin' && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                            {user.email}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-slate-500 font-mono">
                              UID: {user.userId.substring(0, 8)}...
                            </span>
                            <button
                              onClick={() => handleCopyUid(user.userId)}
                              title="Copy UID"
                              className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>

                    {/* Total Visits */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        <Compass className="w-3 h-3" />
                        {user.totalVisits}
                      </span>
                    </td>

                    {/* First Visit */}
                    <td className="p-3.5 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{user.firstVisitFormatted}</span>
                      </div>
                    </td>

                    {/* Last Active */}
                    <td className="p-3.5 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="font-medium text-slate-200">
                          {user.lastActiveFormatted}
                        </span>
                      </div>
                    </td>

                    {/* Total Time Spent */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Hourglass className="w-3 h-3 text-amber-400" />
                        {user.totalTimeSpentFormatted}
                      </span>
                    </td>

                    {/* Last Known Section */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-200 border border-slate-700/80">
                        <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{user.currentSection}</span>
                      </span>
                    </td>

                    {/* Device / Platform */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono text-slate-300 bg-slate-950 border border-slate-800">
                        <DeviceIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="capitalize">{user.deviceCategory || 'Desktop'}</span>
                        {user.browser && (
                          <span className="text-slate-500 text-[10px] hidden sm:inline">
                            • {user.browser}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectUser?.(user.userId)}
                        id={`btn-view-user-${user.userId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm shadow-indigo-600/20"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
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
