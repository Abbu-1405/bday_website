import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Users,
  Activity,
  Radio,
  FolderKanban,
  Eye,
  Pen,
  Film,
  Bell,
  Heart,
  Mail,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { ROUTES } from '../constants';
import {
  fetchAdminOverviewStats,
  fetchAdminRecentActivity,
  fetchAdminUsers,
  AdminOverviewStats,
  AdminActivityItem,
  AdminUserItem,
} from '../services/adminService';
import { fetchTrackedUsersOverview } from '../services/adminTrackingService';
import { TrackedUserOverview } from '../types/tracking';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminActivityFeed } from '../components/admin/AdminActivityFeed';
import { AdminLiveActivity } from '../components/admin/tracking';
import { ActivityDetailModal } from '../components/admin/ActivityDetailModal';
import { AdminFeelingsInbox } from '../components/admin/AdminFeelingsInbox';
import { AdminLettersInbox } from '../components/admin/AdminLettersInbox';
import { AdminContentHub } from '../components/admin/content/AdminContentHub';
import { AdminBtsDashboard } from '../components/admin/bts';
import { AdminDoodlesDashboard } from '../components/admin/doodles';
import { AdminNotes365Preview } from '../components/admin/preview';
import { AdminNotificationQueue } from '../components/admin/AdminNotificationQueue';
import { AdminHeader } from '../components/admin/header';
import { UserRegistryGrid } from '../components/admin/terminal/UserRegistryGrid';
import { UserInspectionTerminal } from '../components/admin/terminal/UserInspectionTerminal';

type AdminTab =
  | 'users'
  | 'live_activity'
  | 'activity'
  | 'content'
  | 'preview'
  | 'doodles'
  | 'bts'
  | 'notifications'
  | 'feelings'
  | 'letters'
  | 'analytics'
  | 'settings';

interface NavGroup {
  title: string;
  items: {
    id: AdminTab;
    code: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export default function Admin() {
  const navigate = useNavigate();
  const params = useParams<{ uid?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, logout } = useAuth();

  // The primary homepage is USER-CENTRIC (users tab is default)
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Selected user for inspection terminal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    params.uid || searchParams.get('user') || null
  );

  // Sync route and search parameters with inspection state
  useEffect(() => {
    const targetUid = params.uid || searchParams.get('user');
    if (targetUid) {
      setSelectedUserId(targetUid);
      setActiveTab('users');
    } else {
      setSelectedUserId(null);
    }
  }, [params.uid, searchParams]);

  const handleSelectUser = (uid: string) => {
    setSelectedUserId(uid);
    setActiveTab('users');
    setSearchParams({ user: uid });
  };

  const handleClearSelectedUser = () => {
    setSelectedUserId(null);
    if (params.uid) {
      navigate(ROUTES.ADMIN);
    } else {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('user');
      setSearchParams(nextParams);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  // Tracked users state for User Registry
  const [trackedUsers, setTrackedUsers] = useState<TrackedUserOverview[]>([]);
  const [trackedUsersLoading, setTrackedUsersLoading] = useState(true);

  const loadTrackedUsers = useCallback(async () => {
    setTrackedUsersLoading(true);
    try {
      const data = await fetchTrackedUsersOverview();
      setTrackedUsers(data);
    } catch (err) {
      console.error('[Admin] Error loading tracked users for registry:', err);
    } finally {
      setTrackedUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrackedUsers();
  }, [loadTrackedUsers]);

  // Global analytics & activity data states (preserved for secondary modules)
  const [stats, setStats] = useState<AdminOverviewStats>({
    totalUsers: 0,
    totalActivities: 0,
    notesOpened: 0,
    wishesCollected: 0,
    momentsOpened: 0,
    openWhenOpened: 0,
    secretsDiscovered: 0,
    feelingsSubmitted: 0,
    lettersSubmitted: 0,
    badgesUnlocked: 0,
  });
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState<AdminActivityItem | null>(null);

  const loadGlobalData = async () => {
    setStatsLoading(true);
    setActivitiesLoading(true);
    try {
      const [sData, aData, uData] = await Promise.all([
        fetchAdminOverviewStats(),
        fetchAdminRecentActivity(activityFilter),
        fetchAdminUsers(),
      ]);
      setStats(sData);
      setActivities(aData);
      setUsers(uData);
    } catch (err) {
      console.warn('Error loading admin global stats:', err);
    } finally {
      setStatsLoading(false);
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics' || activeTab === 'activity') {
      loadGlobalData();
    }
  }, [activeTab, activityFilter]);

  // Reorganized Terminal Navigation Hierarchy according to specification
  const navGroups: NavGroup[] = [
    {
      title: '/ SYSTEM',
      items: [
        {
          id: 'users',
          code: '[01]',
          label: 'USER REGISTRY',
          icon: Users,
          badge: `${trackedUsers.length}`,
        },
        {
          id: 'live_activity',
          code: '[02]',
          label: 'LIVE ACTIVITY',
          icon: Radio,
          badge: 'LIVE',
        },
        {
          id: 'activity',
          code: '[03]',
          label: 'SYSTEM AUDIT',
          icon: Activity,
        },
      ],
    },
    {
      title: '/ CONTENT',
      items: [
        {
          id: 'content',
          code: '[04]',
          label: 'CONTENT HUB',
          icon: FolderKanban,
        },
        {
          id: 'preview',
          code: '[05]',
          label: '365 PREVIEW',
          icon: Eye,
          badge: 'TEST',
        },
        {
          id: 'doodles',
          code: '[06]',
          label: 'DOODLES & ART',
          icon: Pen,
        },
        {
          id: 'bts',
          code: '[07]',
          label: 'BTS HUB',
          icon: Film,
          badge: 'NEW',
        },
      ],
    },
    {
      title: '/ INBOX',
      items: [
        {
          id: 'notifications',
          code: '[08]',
          label: 'NOTIFICATIONS',
          icon: Bell,
          badge: 'QUEUE',
        },
        {
          id: 'feelings',
          code: '[09]',
          label: 'FEELINGS',
          icon: Heart,
        },
        {
          id: 'letters',
          code: '[10]',
          label: 'LETTERS',
          icon: Mail,
        },
      ],
    },
    {
      title: '/ SYSTEM TOOLS',
      items: [
        {
          id: 'analytics',
          code: '[11]',
          label: 'ANALYTICS',
          icon: BarChart3,
        },
        {
          id: 'settings',
          code: '[12]',
          label: 'SETTINGS',
          icon: SettingsIcon,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#06080c] text-zinc-100 flex flex-col font-sans select-none antialiased">
      {/* Admin Top Header */}
      <AdminHeader
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Admin Workspace Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-3 sm:p-5 gap-5">
        {/* Navigation Sidebar: Terminal Structure */}
        <aside
          className={`${
            isMobileMenuOpen ? 'block' : 'hidden'
          } sm:block w-full md:w-60 shrink-0 space-y-4 bg-[#0a0d12] p-3.5 rounded-xl border border-zinc-800/90 h-fit font-mono shadow-[0_4px_20px_rgba(0,0,0,0.4)]`}
        >
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-2.5 py-1 text-[11px] font-mono text-zinc-500 tracking-wider">
                {group.title}
              </div>
              <div className="border-b border-zinc-900 mb-1" />

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  const isUserRegistry = item.id === 'users';

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-mono transition-all text-left ${
                        active
                          ? isUserRegistry
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_-2px_rgba(16,185,129,0.25)] font-bold'
                            : 'bg-zinc-800/90 text-zinc-100 border border-zinc-700 font-semibold'
                          : 'text-zinc-400 hover:bg-zinc-900/90 hover:text-zinc-200 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`text-[10px] shrink-0 ${
                            active
                              ? isUserRegistry
                                ? 'text-emerald-400'
                                : 'text-zinc-300'
                              : 'text-zinc-600'
                          }`}
                        >
                          {item.code}
                        </span>
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            active
                              ? isUserRegistry
                                ? 'text-emerald-400'
                                : 'text-zinc-200'
                              : 'text-zinc-500'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                            active
                              ? isUserRegistry
                                ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30'
                                : 'bg-zinc-700 text-zinc-200 border-zinc-600'
                              : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Main Content Body */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* [01] USER REGISTRY (PRIMARY HOMEPAGE) */}
          {activeTab === 'users' && (
            selectedUserId ? (
              <UserInspectionTerminal
                userId={selectedUserId}
                onBack={handleClearSelectedUser}
              />
            ) : (
              <UserRegistryGrid
                users={trackedUsers}
                isLoading={trackedUsersLoading}
                onRefresh={loadTrackedUsers}
                onSelectUser={handleSelectUser}
              />
            )
          )}

          {/* [02] LIVE ACTIVITY */}
          {activeTab === 'live_activity' && (
            <AdminLiveActivity
              onViewUserDetails={(userId) => handleSelectUser(userId)}
            />
          )}

          {/* [03] SYSTEM AUDIT */}
          {activeTab === 'activity' && (
            <AdminActivityFeed
              activities={activities}
              users={users}
              loading={activitiesLoading}
              selectedFilter={activityFilter}
              onFilterChange={(filter) => setActivityFilter(filter)}
              onSelectActivity={(act) => setSelectedActivity(act)}
            />
          )}

          {/* [04] CONTENT HUB */}
          {activeTab === 'content' && (
            <AdminContentHub onOpen365Preview={() => setActiveTab('preview')} />
          )}

          {/* [05] 365 PREVIEW */}
          {activeTab === 'preview' && (
            <AdminNotes365Preview onNavigateToContent={() => setActiveTab('content')} />
          )}

          {/* [06] DOODLES & ART */}
          {activeTab === 'doodles' && <AdminDoodlesDashboard />}

          {/* [07] BTS HUB */}
          {activeTab === 'bts' && <AdminBtsDashboard />}

          {/* [08] NOTIFICATIONS */}
          {activeTab === 'notifications' && <AdminNotificationQueue />}

          {/* [09] FEELINGS */}
          {activeTab === 'feelings' && <AdminFeelingsInbox />}

          {/* [10] LETTERS */}
          {activeTab === 'letters' && <AdminLettersInbox />}

          {/* [11] ANALYTICS (PREVIOUS GLOBAL OVERVIEW DASHBOARD) */}
          {activeTab === 'analytics' && (
            <AdminOverview
              stats={stats}
              loading={statsLoading}
              onRefresh={loadGlobalData}
              onNavigateToActivity={() => setActiveTab('live_activity')}
              onNavigateToUsers={() => setActiveTab('users')}
              onNavigateToBts={() => setActiveTab('bts')}
              onNavigateToFeelings={() => setActiveTab('feelings')}
              onNavigateToLetters={() => setActiveTab('letters')}
            />
          )}

          {/* [12] SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-[#0a0d12] border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-6 font-mono select-none">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-100 uppercase tracking-wide">
                  SYSTEM SETTINGS // AUTHORIZATION TELEMETRY
                </h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  Active Firebase Authentication session &amp; verified administrator clearance.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-500">ADMIN EMAIL</span>
                  <span className="font-mono text-zinc-200">{currentUser?.email || 'N/A'}</span>
                </div>

                <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-500">ADMIN UID</span>
                  <span className="font-mono text-zinc-200">{currentUser?.uid || 'N/A'}</span>
                </div>

                <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-500">CLEARANCE MECHANISM</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    Firebase Security Rules / Custom Token Claim
                  </span>
                </div>

                <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-500">FIRESTORE ACCESS ENFORCEMENT</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    isAdmin() Rule Active
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex flex-wrap justify-between items-center gap-3">
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>[ OPEN PUBLIC SITE ]</span>
                </a>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 text-xs font-mono font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>[ END ADMIN SESSION ]</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
}
