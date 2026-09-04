import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Users,
  Heart,
  Mail,
  FolderKanban,
  Settings as SettingsIcon,
  LogOut,
  Info,
  ExternalLink,
  Film,
  Pen,
  Eye,
  Bell,
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
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminActivityFeed } from '../components/admin/AdminActivityFeed';
import { AdminUsersList } from '../components/admin/AdminUsersList';
import {
  AdminActivityOverview,
  AdminLiveActivity,
  AdminUserDetail,
} from '../components/admin/tracking';
import { ActivityDetailModal } from '../components/admin/ActivityDetailModal';
import { AdminFeelingsInbox } from '../components/admin/AdminFeelingsInbox';
import { AdminLettersInbox } from '../components/admin/AdminLettersInbox';
import { AdminContentHub } from '../components/admin/content/AdminContentHub';
import { AdminBtsDashboard } from '../components/admin/bts';
import { AdminDoodlesDashboard } from '../components/admin/doodles';
import { AdminNotes365Preview } from '../components/admin/preview';
import { AdminNotificationQueue } from '../components/admin/AdminNotificationQueue';
import { AdminHeader } from '../components/admin/header';
import { Radio } from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'live_activity'
  | 'activity'
  | 'bts'
  | 'doodles'
  | 'notifications'
  | 'preview'
  | 'users'
  | 'feelings'
  | 'letters'
  | 'content'
  | 'settings';

export default function Admin() {
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  // Data states
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

  // Loading states
  const [statsLoading, setStatsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  // Filters & selection
  const [activityFilter, setActivityFilter] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState<AdminActivityItem | null>(null);

  const loadData = async () => {
    setStatsLoading(true);
    setActivitiesLoading(true);
    setUsersLoading(true);

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
      console.warn('Error loading admin portal data:', err);
    } finally {
      setStatsLoading(false);
      setActivitiesLoading(false);
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activityFilter]);

  const [selectedUserDetailId, setSelectedUserDetailId] = useState<string | null>(null);

  const navItems: { id: AdminTab; code: string; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview' as AdminTab, code: '[01]', label: 'OVERVIEW', icon: LayoutDashboard },
    { id: 'live_activity' as AdminTab, code: '[02]', label: 'LIVE ACTIVITY', icon: Radio, badge: 'LIVE' },
    { id: 'activity' as AdminTab, code: '[03]', label: 'ALL ACTIVITY', icon: Activity },
    { id: 'users' as AdminTab, code: '[04]', label: 'USER DIRECTORY', icon: Users },
    { id: 'bts' as AdminTab, code: '[05]', label: 'BTS HUB', icon: Film, badge: 'HUB' },
    { id: 'doodles' as AdminTab, code: '[06]', label: 'DOODLES & ART', icon: Pen },
    { id: 'notifications' as AdminTab, code: '[07]', label: 'NOTIFICATIONS', icon: Bell, badge: 'QUEUE' },
    { id: 'feelings' as AdminTab, code: '[08]', label: 'FEELINGS INBOX', icon: Heart },
    { id: 'letters' as AdminTab, code: '[09]', label: 'LETTERS INBOX', icon: Mail },
    { id: 'content' as AdminTab, code: '[10]', label: 'CONTENT HUB', icon: FolderKanban },
    { id: 'preview' as AdminTab, code: '[11]', label: '365 PREVIEW', icon: Eye, badge: 'TEST' },
    { id: 'settings' as AdminTab, code: '[12]', label: 'SYS SETTINGS', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-slate-100 flex flex-col font-mono select-none antialiased relative">
      {/* Background scanline effect */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025] z-50 bg-[radial-gradient(#00ff66_1px,transparent_1px)] [background-size:16px_16px]"
        aria-hidden="true"
      />

      {/* Admin Top Header with Dedicated Responsive Layout */}
      <AdminHeader
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Admin Workspace Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-3 sm:p-5 gap-5">
        {/* Navigation Sidebar */}
        <aside
          className={`${
            isMobileMenuOpen ? 'block' : 'hidden'
          } sm:block w-full md:w-60 shrink-0 space-y-1.5 bg-[#050811]/90 p-3 rounded-xl border border-emerald-500/20 h-fit shadow-[0_0_15px_rgba(16,185,129,0.04)]`}
        >
          <div className="px-2 py-1.5 text-[10px] font-mono text-emerald-500/80 uppercase tracking-wider font-semibold border-b border-emerald-950/60 flex items-center justify-between">
            <span>/system/nav</span>
            <span className="text-[9px] text-slate-400">12 MODS</span>
          </div>

          <div className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all text-left group ${
                    active
                      ? 'bg-emerald-950/70 text-emerald-200 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.18)] font-semibold'
                      : 'text-slate-400 hover:bg-emerald-950/20 hover:text-emerald-300 border border-transparent hover:border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[10px] font-mono shrink-0 ${
                        active ? 'text-emerald-400 font-bold' : 'text-slate-400 group-hover:text-emerald-400'
                      }`}
                    >
                      {active ? '>' : item.code}
                    </span>
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-emerald-400'
                      }`}
                    />
                    <span className="truncate tracking-wide text-[11px]">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-semibold px-1 py-0.2 rounded border shrink-0 ${
                        active
                          ? 'bg-emerald-900/80 text-emerald-200 border-emerald-400/60'
                          : 'bg-[#020408] text-slate-400 border-emerald-950 group-hover:border-emerald-500/40 group-hover:text-emerald-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content Body */}
        <main className="flex-1 min-w-0 space-y-6">
          {activeTab === 'overview' && (
            <AdminOverview
              stats={stats}
              loading={statsLoading}
              onRefresh={loadData}
              onNavigateToActivity={() => setActiveTab('live_activity')}
              onNavigateToUsers={() => setActiveTab('users')}
              onNavigateToBts={() => setActiveTab('bts')}
              onNavigateToFeelings={() => setActiveTab('feelings')}
              onNavigateToLetters={() => setActiveTab('letters')}
              onNavigateToNotifications={() => setActiveTab('notifications')}
              onNavigateToContent={() => setActiveTab('content')}
              onNavigateToSettings={() => setActiveTab('settings')}
              activities={activities}
              users={users}
              adminEmail={currentUser?.email || undefined}
              adminUid={currentUser?.uid || undefined}
              adminName={currentUser?.displayName || undefined}
            />
          )}

          {activeTab === 'live_activity' && (
            selectedUserDetailId ? (
              <AdminUserDetail
                userId={selectedUserDetailId}
                onBack={() => setSelectedUserDetailId(null)}
              />
            ) : (
              <AdminLiveActivity
                onViewUserDetails={(userId) => setSelectedUserDetailId(userId)}
              />
            )
          )}

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

          {activeTab === 'bts' && <AdminBtsDashboard />}

          {activeTab === 'doodles' && <AdminDoodlesDashboard />}

          {activeTab === 'notifications' && <AdminNotificationQueue />}

          {activeTab === 'users' && <AdminActivityOverview />}

          {activeTab === 'feelings' && <AdminFeelingsInbox />}

          {activeTab === 'letters' && <AdminLettersInbox />}

          {activeTab === 'content' && (
            <AdminContentHub onOpen365Preview={() => setActiveTab('preview')} />
          )}

          {activeTab === 'preview' && (
            <AdminNotes365Preview onNavigateToContent={() => setActiveTab('content')} />
          )}

          {activeTab === 'settings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-100">Admin Authorization Settings</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Active Firebase Authentication session & Security Claim Details.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Admin Email</span>
                  <span className="font-mono text-slate-200">{currentUser?.email || 'N/A'}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Admin UID</span>
                  <span className="font-mono text-slate-200">{currentUser?.uid || 'N/A'}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Authorization Mechanism</span>
                  <span className="font-mono text-emerald-400 font-semibold">Firebase Security Rules / Custom Claims</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Firestore Access Rule</span>
                  <span className="font-mono text-indigo-400">isAdmin() Rule Enforced</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Public Starlit Letters Website
                </a>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  End Admin Session
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
