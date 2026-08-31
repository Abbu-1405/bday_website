import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  Tablet,
  Laptop,
  Globe,
  Monitor,
  Clock,
  Sparkles,
} from 'lucide-react';
import { TrackedUserOverview, DeviceCategory } from '../../../types/tracking';

interface UserDetailHeaderProps {
  user: TrackedUserOverview;
  onBack: () => void;
}

export const UserDetailHeader: React.FC<UserDetailHeaderProps> = ({ user, onBack }) => {
  const [copiedUid, setCopiedUid] = useState(false);

  const handleCopyUid = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(user.userId).catch(() => {});
    }
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
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

  const DeviceIcon = getDeviceIcon(user.deviceCategory);

  const getStatusBadge = () => {
    switch (user.status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        );
      case 'recent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Active Today
          </span>
        );
      case 'inactive':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Offline ({user.lastActiveFormatted})
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          id="btn-back-to-users"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to User Registry</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Exploration Profile
          </span>
        </div>
      </div>

      {/* User Information Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-14 h-14 rounded-2xl border-2 border-indigo-500/40 object-cover shadow-inner shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-indigo-600/40 flex items-center justify-center text-indigo-300 font-bold text-lg shadow-inner shrink-0">
              {(user.displayName || 'U').charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-100 tracking-tight truncate max-w-[280px] sm:max-w-md">
                {user.displayName}
              </h2>
              {user.role === 'admin' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Admin
                </span>
              )}
              {getStatusBadge()}
            </div>

            <p className="text-xs text-slate-400 font-mono truncate max-w-sm">
              {user.email}
            </p>

            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
                <span>UID: {user.userId}</span>
                <button
                  onClick={handleCopyUid}
                  id="btn-copy-user-uid"
                  title="Copy full UID"
                  className="text-slate-400 hover:text-slate-200 p-0.5 transition-colors ml-1"
                >
                  {copiedUid ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              {user.deviceCategory && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                  <DeviceIcon className="w-3 h-3 text-indigo-400" />
                  <span className="capitalize">{user.deviceCategory}</span>
                  {user.browser && <span className="text-slate-500">• {user.browser}</span>}
                  {user.os && <span className="text-slate-500">• {user.os}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
