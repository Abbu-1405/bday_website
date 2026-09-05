import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  Shield,
  Laptop,
  Smartphone,
  Tablet,
  Calendar,
  Clock,
  MapPin,
  Compass,
  FileText,
  Heart,
  Mail,
  Sparkles,
  Award,
  Video,
  Terminal,
  Activity,
  Key,
} from 'lucide-react';
import {
  fetchUserForensicInspection,
  UserForensicInspection,
  ForensicTimelineEvent,
  UserModuleRecord,
} from '../../../services/adminUserInspectionService';
import { SessionHistoryItem } from '../../../types/tracking';

interface UserInspectionTerminalProps {
  userId: string;
  onBack: () => void;
}

type InspectionModuleTab =
  | 'overview'
  | 'activity'
  | 'notes'
  | 'wishes'
  | 'moments'
  | 'secrets'
  | 'open_when'
  | 'feelings'
  | 'letters'
  | 'media'
  | 'achievements'
  | 'sessions';

export const UserInspectionTerminal: React.FC<UserInspectionTerminalProps> = ({
  userId,
  onBack,
}) => {
  const [data, setData] = useState<UserForensicInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InspectionModuleTab>('overview');
  const [copiedUid, setCopiedUid] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchUserForensicInspection(userId);
      setData(result);
    } catch (err) {
      console.error('Failed to load user forensic data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopyUid = () => {
    if (!data?.user?.userId) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(data.user.userId).catch(() => {});
    }
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const getDeviceIcon = (category?: string) => {
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

  if (loading && !data) {
    return (
      <div className="p-8 sm:p-16 text-center rounded-xl bg-[#0a0d12] border border-zinc-800 space-y-4 font-mono select-none">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/40 border-t-emerald-400 animate-spin mx-auto" />
        <p className="text-sm text-zinc-300">
          [ ACCESSING FORENSIC DATA FOR NODE: {userId} ]
        </p>
        <p className="text-[11px] text-zinc-500">
          RECONSTRUCTING TIMELINE &bull; VERIFYING SECURITY CLEARANCE
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-xl bg-[#0a0d12] border border-red-500/30 space-y-4 font-mono select-none">
        <div className="text-rose-400 font-bold text-base">
          [ ERROR: UNABLE TO RESOLVE USER RECORD FOR UID: {userId} ]
        </div>
        <p className="text-xs text-zinc-400">
          The requested user document or session history could not be retrieved from the database.
        </p>
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs hover:bg-zinc-800 transition-colors"
        >
          [ ← RETURN TO USER REGISTRY ]
        </button>
      </div>
    );
  }

  const { user, activitySignature, timelineEvents, modules } = data;
  const DeviceIcon = getDeviceIcon(user.deviceCategory);

  // Filter tabs that have corresponding data or are primary
  const availableTabs: { id: InspectionModuleTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'activity', label: 'ACTIVITY', count: timelineEvents.length },
    { id: 'notes', label: 'NOTES', count: activitySignature.notes },
    { id: 'wishes', label: 'Wishes', count: activitySignature.wishes },
    { id: 'moments', label: 'MOMENTS', count: activitySignature.moments },
    { id: 'secrets', label: 'SECRETS', count: activitySignature.secrets },
    { id: 'open_when', label: 'OPEN WHEN', count: activitySignature.openWhen },
    { id: 'feelings', label: 'FEELINGS', count: activitySignature.feelings },
    { id: 'letters', label: 'LETTERS', count: activitySignature.letters },
    { id: 'media', label: 'MEDIA', count: activitySignature.media },
    { id: 'achievements', label: 'ACHIEVEMENTS', count: activitySignature.achievements },
    { id: 'sessions', label: 'SESSIONS', count: modules.sessions.length },
  ];

  return (
    <div className="space-y-5 font-mono select-none">
      {/* 1. Terminal Header */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0a0d12] border border-zinc-800 shadow-md space-y-4">
        {/* Navigation / Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              id="btn-return-registry"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-emerald-400 border border-zinc-700/80 text-xs font-mono transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>[ ← USER REGISTRY ]</span>
            </button>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="text-[11px] text-emerald-400/90 hidden sm:inline">
              &lt; USER INSPECTION &gt;
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              id="btn-inspection-refresh"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 border border-zinc-700 text-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>[ REFRESH ]</span>
            </button>
          </div>
        </div>

        {/* User Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-16 h-16 rounded-xl object-cover border border-emerald-500/40 shadow-inner"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono text-2xl font-bold">
                {(user.displayName || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-zinc-100 uppercase tracking-tight">
                  {user.displayName || 'ANONYMOUS'}
                </h1>
                {user.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                    ADMIN
                  </span>
                )}
                {user.status === 'online' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>STATUS: ● ONLINE</span>
                  </span>
                ) : user.status === 'recent' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/50 text-amber-400 border border-amber-500/30 text-[10px]">
                    <span>STATUS: ◐ IDLE</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px]">
                    <span>STATUS: ○ OFFLINE</span>
                  </span>
                )}
              </div>

              {/* UID with copy */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[11px]">
                  <span>UID: {user.userId}</span>
                  <button
                    onClick={handleCopyUid}
                    title="Copy full UID"
                    className="text-zinc-400 hover:text-zinc-100 p-0.5 ml-1 transition-colors"
                  >
                    {copiedUid ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                {user.email && (
                  <span className="text-zinc-500 text-[11px]">&lt;{user.email}&gt;</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Dual Panels: User Profile & Activity Signature Readout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel A: Compact User Overview */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0a0d12] border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <span className="text-xs font-bold text-zinc-200 tracking-wider">
              USER PROFILE
            </span>
            <span className="text-[10px] text-zinc-500">[SPECIFICATION]</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">DISPLAY NAME</span>
              <span className="text-zinc-200 font-medium">{user.displayName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">USER ID</span>
              <span className="text-zinc-400 font-mono text-[11px] truncate max-w-[200px]">
                {user.userId}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">EMAIL</span>
              <span className="text-zinc-300 truncate max-w-[200px]">{user.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">FIRST SEEN</span>
              <span className="text-zinc-300">{user.firstVisitFormatted || '[ NO DATA ]'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">LAST ACTIVE</span>
              <span className="text-emerald-400 font-medium">
                {user.lastActiveFormatted || '[ NO DATA ]'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">SESSIONS</span>
              <span className="text-cyan-400 font-bold">{user.totalVisits}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">CURRENT STATUS</span>
              <span
                className={`font-semibold ${
                  user.status === 'online'
                    ? 'text-emerald-400'
                    : user.status === 'recent'
                    ? 'text-amber-400'
                    : 'text-zinc-500'
                }`}
              >
                ● {user.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Panel B: Activity Signature Terminal Readout */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0a0d12] border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <span className="text-xs font-bold text-emerald-400 tracking-wider">
              ACTIVITY SIGNATURE
            </span>
            <span className="text-[10px] text-zinc-500">[DB TELEMETRY]</span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs pt-1">
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">NOTES</span>
              <span className="text-emerald-400 font-bold">
                {activitySignature.notes > 0 ? activitySignature.notes : '[ NO DATA ]'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">MOMENTS</span>
              <span className="text-cyan-400 font-bold">
                {activitySignature.moments > 0 ? activitySignature.moments : '[ NO DATA ]'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">WISHES</span>
              <span className="text-amber-400 font-bold">
                {activitySignature.wishes > 0 ? activitySignature.wishes : '[ NO DATA ]'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">SECRETS</span>
              <span className="text-purple-400 font-bold">
                {activitySignature.secrets > 0 ? activitySignature.secrets : '[ NO DATA ]'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">LETTERS</span>
              <span className="text-sky-400 font-bold">
                {activitySignature.letters > 0 ? activitySignature.letters : '[ NO DATA ]'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">MEDIA</span>
              <span className="text-indigo-400 font-bold">
                {activitySignature.media > 0 ? activitySignature.media : '[ NO DATA ]'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">SESSIONS</span>
              <span className="text-zinc-200 font-bold">
                {activitySignature.sessions > 0 ? activitySignature.sessions : '[ NO DATA ]'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">FEELINGS</span>
              <span className="text-pink-400 font-bold">
                {activitySignature.feelings > 0 ? activitySignature.feelings : '[ NO DATA ]'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Module Navigation Tabs */}
      <div className="border-b border-zinc-800 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all uppercase flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_-2px_rgba(16,185,129,0.2)]'
                    : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <span>[{tab.label}]</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="text-[10px] text-zinc-500">({tab.count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Tab Content Section */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0a0d12] border border-zinc-800 min-h-[360px]">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                &gt; SYSTEM FORENSIC AUDIT // SUMMARY
              </h3>
              <span className="text-[11px] text-zinc-500">
                ACTIVE TIME: {user.totalTimeSpentFormatted || '0s'}
              </span>
            </div>

            {/* Device & Platform Telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">HARDWARE / PLATFORM</span>
                <div className="flex items-center gap-2 mt-1">
                  <DeviceIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-zinc-200 font-bold capitalize">
                    {user.deviceCategory || 'Desktop'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                  {user.os || 'OS Unknown'} &bull; {user.browser || 'Browser Unknown'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">LAST KNOWN LOCATION</span>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-xs text-zinc-200 font-bold truncate">
                    {user.currentSection || 'Home'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 font-mono truncate">
                  ROUTE: {user.currentRoute || '/'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">TOTAL LOGGED SESSIONS</span>
                <div className="flex items-center gap-2 mt-1">
                  <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs text-zinc-200 font-bold">
                    {modules.sessions.length} Recorded
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                  {modules.sessions.length > 0 ? 'Full telemetry stored' : 'No stored sessions'}
                </p>
              </div>
            </div>

            {/* Recent Highlights from Timeline */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-xs font-bold text-zinc-300">
                  LATEST TELEMETRY SIGNALS (RECENT 5)
                </span>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  [ VIEW FULL STREAM ]
                </button>
              </div>

              {timelineEvents.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs">
                  [ NO ACTIVITY EVENTS STORED IN DATABASE FOR THIS USER ]
                </div>
              ) : (
                <div className="space-y-2">
                  {timelineEvents.slice(0, 5).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded bg-zinc-900/40 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 text-xs font-bold">
                            &gt; {evt.title}
                          </span>
                          <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            {evt.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                          {evt.details.map((d) => (
                            <span key={d.key}>
                              {d.key}: <span className="text-zinc-200">{d.value}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {evt.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CHRONOLOGICAL ACTIVITY STREAM */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-emerald-400">
                &gt; USER ACTIVITY STREAM // CHRONOLOGICAL LOGS ({timelineEvents.length})
              </span>
              <span className="text-[11px] text-zinc-500">NEWEST EVENTS FIRST</span>
            </div>

            {timelineEvents.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                [ NO CHRONOLOGICAL EVENTS RECORDED FOR THIS USER IN DATABASE ]
              </div>
            ) : (
              <div className="space-y-3 font-mono">
                {timelineEvents.map((evt) => {
                  const labelColorClasses =
                    evt.label === '[OPEN]'
                      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                      : evt.label === '[PLAY]'
                      ? 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30'
                      : evt.label === '[UNLOCK]'
                      ? 'text-amber-400 bg-amber-950/60 border-amber-500/30'
                      : evt.label === '[DISCOVERED]'
                      ? 'text-purple-400 bg-purple-950/60 border-purple-500/30'
                      : evt.label === '[READ]'
                      ? 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30'
                      : 'text-zinc-400 bg-zinc-900 border-zinc-700';

                  return (
                    <div
                      key={evt.id}
                      className="p-3.5 rounded-lg bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-zinc-400 font-mono">
                          {evt.timestamp}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border font-mono ${labelColorClasses}`}
                        >
                          {evt.label}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-zinc-100 font-mono">
                        &gt; {evt.title}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400 font-mono pl-3 border-l border-zinc-800">
                        {evt.details.map((d) => (
                          <div key={d.key}>
                            <span className="text-zinc-500">{d.key}: </span>
                            <span className="text-zinc-200">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOTES MODULE */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-emerald-400">
                NOTES // RECORDS ({modules.notes.length})
              </span>
              <span className="text-[11px] text-zinc-500">365 NOTES EXPLORATION</span>
            </div>

            {modules.notes.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                [ NO NOTES OPENED BY THIS USER ]
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {modules.notes.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-300">{item.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
                        {item.tag || 'OPENED'}
                      </span>
                    </div>
                    {item.timestampFormatted && (
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {item.timestampFormatted}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WISHES MODULE */}
        {activeTab === 'wishes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-amber-400">
                WISHES // COLLECTED ({modules.wishes.length})
              </span>
              <span className="text-[11px] text-zinc-500">WISH LOGS</span>
            </div>

            {modules.wishes.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                [ NO WISHES COLLECTED BY THIS USER ]
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {modules.wishes.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-300">{item.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/20">
                        {item.tag || 'COLLECTED'}
                      </span>
                    </div>
                    {item.timestampFormatted && (
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {item.timestampFormatted}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MOMENTS MODULE */}
        {activeTab === 'moments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-cyan-400">
                MOMENTS // EXPLORED ({modules.moments.length})
              </span>
              <span className="text-[11px] text-zinc-500">AUDIO & MOMENT LOGS</span>
            </div>

            {modules.moments.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                [ NO MOMENTS OPENED BY THIS USER ]
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {modules.moments.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-cyan-300">{item.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/20">
                        {item.tag || 'OPENED'}
                      </span>
                    </div>
                    {item.timestampFormatted && (
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {item.timestampFormatted}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SECRETS MODULE */}
        {activeTab === 'secrets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-purple-400">
                SECRETS // DISCOVERED ({modules.secrets.length})
              </span>
              <span className="text-[11px] text-zinc-500">SECRET VAULT DISCOVERIES</span>
            </div>

            {modules.secrets.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                [ NO SECRETS DISCOVERED BY THIS USER ]
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {modules.secrets.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-purple-300">{item.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-400 border border-purple-500/20">
                        {item.tag || 'DISCOVERED'}
                      </span>
                    </div>
                    {item.timestampFormatted && (
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {item.timestampFormatted}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: OPEN WHEN MODULE */}
        {activeTab === 'open_when' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-emerald-400">
                OPEN WHEN // READ ({modules.openWhen.length})
              </span>
              <span className="text-[11px] text-zinc-500">OPEN WHEN LETTERS</span>
            </div>

            {modules.openWhen.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                [ NO OPEN-WHEN LETTERS OPENED BY THIS USER ]
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {modules.openWhen.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-300">{item.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
                        {item.tag || 'OPENED'}
                      </span>
                    </div>
                    {item.timestampFormatted && (
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {item.timestampFormatted}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: FEELINGS MODULE */}
        {activeTab === 'feelings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-pink-400">
                FEELINGS // SUBMISSIONS ({modules.feelings.length})
              </span>
              <span className="text-[11px] text-zinc-500">RECORDED REFLECTIONS</span>
            </div>

            {modules.feelings.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                [ NO FEELING SUBMISSIONS LOGGED FOR THIS USER ]
              </div>
            ) : (
              <div className="space-y-3">
                {modules.feelings.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-pink-300">{item.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {item.timestampFormatted}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans whitespace-pre-wrap bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
                      {item.contentPreview}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 9: LETTERS MODULE */}
        {activeTab === 'letters' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-sky-400">
                LETTERS // SUBMISSIONS ({modules.letters.length})
              </span>
              <span className="text-[11px] text-zinc-500">DISPATCHED CORRESPONDENCE</span>
            </div>

            {modules.letters.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                [ NO LETTERS SUBMITTED BY THIS USER ]
              </div>
            ) : (
              <div className="space-y-3">
                {modules.letters.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-sky-300">{item.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {item.timestampFormatted}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans whitespace-pre-wrap bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
                      {item.contentPreview}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 10: MEDIA MODULE */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-indigo-400">
                MEDIA // PLAYBACK & VIEWS ({modules.media.length})
              </span>
              <span className="text-[11px] text-zinc-500">AUDIO, VIDEO & PHOTO LOGS</span>
            </div>

            {modules.media.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                [ NO MEDIA PLAYBACK LOGGED FOR THIS USER ]
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {modules.media.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-indigo-300 truncate max-w-[180px]">
                        {item.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/40 text-indigo-400 border border-indigo-500/20">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {item.subtitle} &bull; {item.timestampFormatted}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 11: ACHIEVEMENTS MODULE */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-amber-400">
                ACHIEVEMENTS // BADGES & MILESTONES ({modules.achievements.length})
              </span>
              <span className="text-[11px] text-zinc-500">DISCOVERY PROGRESSION</span>
            </div>

            {modules.achievements.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                [ NO BADGES OR MILESTONES UNLOCKED BY THIS USER ]
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {modules.achievements.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-300">{item.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/20">
                        {item.tag || 'UNLOCKED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {item.subtitle} &bull; {item.timestampFormatted}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 12: SESSIONS MODULE */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-200">
                SESSIONS // LOGGED VISITS ({modules.sessions.length})
              </span>
              <span className="text-[11px] text-zinc-500">DETAILED TELEMETRY SESSIONS</span>
            </div>

            {modules.sessions.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                [ NO RAW SESSIONS LOGGED FOR THIS USER ]
              </div>
            ) : (
              <div className="space-y-2.5">
                {modules.sessions.map((sess) => {
                  const isExpanded = expandedSessionId === sess.sessionId;
                  return (
                    <div
                      key={sess.sessionId}
                      className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/90 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-200 font-mono">
                              SESSION #{sess.sessionId.slice(0, 10)}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded border ${
                                sess.status === 'active'
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                              }`}
                            >
                              {sess.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            STARTED: {sess.startedAtFormatted} &bull; DURATION:{' '}
                            <span className="text-zinc-200">{sess.durationFormatted}</span>
                          </p>
                        </div>

                        <div className="text-right text-[11px] text-zinc-400 font-mono">
                          <div>
                            {sess.browser} ({sess.os})
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            ROUTE: {sess.currentRoute} &bull; {sess.eventCount} EVENTS
                          </div>
                        </div>
                      </div>

                      {sess.events && sess.events.length > 0 && (
                        <div className="pt-2 border-t border-zinc-900">
                          <button
                            onClick={() =>
                              setExpandedSessionId(isExpanded ? null : sess.sessionId)
                            }
                            className="text-[10px] text-emerald-400 hover:underline font-mono"
                          >
                            {isExpanded
                              ? '[ HIDE SESSION EVENTS ]'
                              : `[ VIEW SESSION EVENTS (${sess.events.length}) ]`}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-1.5 pl-3 border-l border-zinc-800 text-[11px] font-mono text-zinc-400">
                              {sess.events.map((evt, eIdx) => (
                                <div
                                  key={evt.eventId || eIdx}
                                  className="flex justify-between py-0.5"
                                >
                                  <span>&gt; {evt.type.toUpperCase()}</span>
                                  <span className="text-zinc-500 text-[10px]">
                                    {evt.metadata?.itemId || evt.route || ''}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
