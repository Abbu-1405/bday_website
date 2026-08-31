import React, { useState } from 'react';
import {
  Users,
  Compass,
  Laptop,
  Smartphone,
  Tablet,
  ChevronRight,
  User,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { LiveActiveUser, LiveSessionInfo } from '../../../types/tracking';

interface LiveActiveUsersListProps {
  users: LiveActiveUser[];
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
  onViewUserDetails?: (userId: string) => void;
}

export const LiveActiveUsersList: React.FC<LiveActiveUsersListProps> = ({
  users,
  selectedUserId,
  onSelectUser,
  onViewUserDetails,
}) => {
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(new Set());

  const toggleExpand = (uid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return next;
    });
  };

  const getDeviceIcon = (cat: string) => {
    if (cat === 'mobile') return <Smartphone className="w-3 h-3 text-pink-400" />;
    if (cat === 'tablet') return <Tablet className="w-3 h-3 text-amber-400" />;
    return <Laptop className="w-3 h-3 text-sky-400" />;
  };

  const getStatusBadge = (status: 'online' | 'recent' | 'offline') => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        );
      case 'recent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Recent
          </span>
        );
      case 'offline':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Offline
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">Active Presence</h3>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
          {users.length} tracked
        </span>
      </div>

      {/* Filter by all users button */}
      <button
        onClick={() => onSelectUser('all')}
        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
          selectedUserId === 'all'
            ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200 shadow-sm'
            : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/60 hover:text-white'
        }`}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>All Users (Aggregated Stream)</span>
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Show All</span>
      </button>

      {/* Users list */}
      <div className="space-y-2 overflow-y-auto max-h-[540px] pr-1 custom-scrollbar">
        {users.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No tracked user activity detected.
          </div>
        ) : (
          users.map((u) => {
            const isSelected = selectedUserId === u.userId;
            const isExpanded = expandedUserIds.has(u.userId);
            const hasMultipleSessions = u.sessions && u.sessions.length > 1;

            return (
              <div
                key={u.userId}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500/50 shadow-md shadow-indigo-900/10'
                    : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {/* Main Card row */}
                <div
                  onClick={() => onSelectUser(u.userId)}
                  className="p-3 cursor-pointer select-none space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.displayName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {u.displayName}
                          </span>
                          {u.role === 'admin' && (
                            <span title="Admin">
                              <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div>{getStatusBadge(u.status)}</div>
                  </div>

                  {/* Section & Last active time */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-slate-800/40">
                    <div className="flex items-center gap-1.5 truncate">
                      <Compass className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="text-slate-300 font-medium truncate">
                        {u.primarySection || 'Home'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {u.lastActivityFormatted}
                    </span>
                  </div>

                  {/* Sessions preview & deep dive button */}
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    {hasMultipleSessions ? (
                      <button
                        onClick={(e) => toggleExpand(u.userId, e)}
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        <Layers className="w-3 h-3" />
                        <span>
                          {u.sessions.length} active devices {isExpanded ? '▲' : '▼'}
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-500">
                        {getDeviceIcon(u.sessions[0]?.deviceCategory || 'desktop')}
                        <span>
                          {u.sessions[0]?.browser || 'Browser'} on {u.sessions[0]?.os || 'OS'}
                        </span>
                      </div>
                    )}

                    {onViewUserDetails && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewUserDetails(u.userId);
                        }}
                        className="inline-flex items-center gap-0.5 text-indigo-400 hover:text-indigo-300 font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20"
                      >
                        <span>History</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Multi-Device Sessions */}
                {isExpanded && hasMultipleSessions && (
                  <div className="px-3 pb-3 pt-1 space-y-1.5 bg-slate-900/60 border-t border-slate-800/60">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Active Device Sessions:
                    </div>
                    {u.sessions.map((sess, idx) => (
                      <div
                        key={sess.sessionId || idx}
                        className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                            {getDeviceIcon(sess.deviceCategory)}
                            {sess.browser} ({sess.os})
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {sess.lastActivityFormatted}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Section: {sess.currentSection}</span>
                          <span className="font-mono text-slate-500">
                            {sess.sessionId.slice(0, 10)}...
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
