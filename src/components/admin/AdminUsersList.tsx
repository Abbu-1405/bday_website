import React from 'react';
import { Users, UserCheck, Calendar, Clock, Sparkles } from 'lucide-react';
import { AdminUserItem } from '../../services/adminService';

interface AdminUsersListProps {
  users: AdminUserItem[];
  loading: boolean;
}

export const AdminUsersList: React.FC<AdminUsersListProps> = ({ users, loading }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-400" />
          Registered Users
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {users.length} account{users.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 space-y-2">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Loading user registry...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          No registered user profiles found in database.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="p-3.5 font-medium">User Profile</th>
                <th className="p-3.5 font-medium">Role</th>
                <th className="p-3.5 font-medium">Joined</th>
                <th className="p-3.5 font-medium">Last Active</th>
                <th className="p-3.5 font-medium text-right">Discovered Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.displayName || 'User'}
                          className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-semibold text-xs">
                          {(u.displayName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-200">{u.displayName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {u.role === 'admin' && <UserCheck className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {u.createdAt}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {u.lastSeenAt}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-200 font-medium">
                    <span className="inline-flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      <Sparkles className="w-3 h-3" />
                      {u.activityCount || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
