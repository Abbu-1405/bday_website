import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Activity,
  Users,
  Heart,
  Mail,
  FolderKanban,
  Settings as SettingsIcon,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../hooks';
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
import { ActivityDetailModal } from '../components/admin/ActivityDetailModal';
import { AdminFeelingsInbox } from '../components/admin/AdminFeelingsInbox';
import { AdminLettersInbox } from '../components/admin/AdminLettersInbox';
import { AdminContentHub } from '../components/admin/content/AdminContentHub';

type AdminTab = 'overview' | 'activity' | 'users' | 'feelings' | 'letters' | 'content' | 'settings';

export default function Admin() {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'activity' as AdminTab, label: 'Activity', icon: Activity },
    { id: 'users' as AdminTab, label: 'Users', icon: Users },
    { id: 'feelings' as AdminTab, label: 'Feelings', icon: Heart },
    { id: 'letters' as AdminTab, label: 'Letters', icon: Mail },
    { id: 'content' as AdminTab, label: 'Content', icon: FolderKanban },
    { id: 'settings' as AdminTab, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              Starlit Letters <span className="text-xs text-indigo-400 font-mono">/ Admin</span>
            </h1>
            <p className="text-[11px] text-slate-400">Owner Dashboard & System Monitor</p>
          </div>
        </div>

        {/* Right Admin Profile & Actions */}
        <div className="hidden sm:flex items-center space-x-4">
          <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Admin"
                className="w-5 h-5 rounded-full object-cover border border-slate-600"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                A
              </div>
            )}
            <span className="font-medium text-slate-200">{currentUser?.displayName || 'Admin'}</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AUTHORIZED
            </span>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-medium border border-slate-700 hover:border-rose-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Admin Workspace Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Navigation Sidebar */}
        <aside
          className={`${
            isMobileMenuOpen ? 'block' : 'hidden'
          } sm:block w-full md:w-56 shrink-0 space-y-1 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 h-fit`}
        >
          <div className="px-3 py-2 text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
            Navigation
          </div>

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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Content Body */}
        <main className="flex-1 min-w-0 space-y-6">
          {activeTab === 'overview' && (
            <AdminOverview
              stats={stats}
              loading={statsLoading}
              onRefresh={loadData}
              onNavigateToActivity={() => setActiveTab('activity')}
              onNavigateToFeelings={() => setActiveTab('feelings')}
              onNavigateToLetters={() => setActiveTab('letters')}
            />
          )}

          {activeTab === 'activity' && (
            <AdminActivityFeed
              activities={activities}
              loading={activitiesLoading}
              selectedFilter={activityFilter}
              onFilterChange={(filter) => setActivityFilter(filter)}
              onSelectActivity={(act) => setSelectedActivity(act)}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersList users={users} loading={usersLoading} />
          )}

          {activeTab === 'feelings' && <AdminFeelingsInbox />}

          {activeTab === 'letters' && <AdminLettersInbox />}

          {activeTab === 'content' && <AdminContentHub />}

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
                  onClick={logout}
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
