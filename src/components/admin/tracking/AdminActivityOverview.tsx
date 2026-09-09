import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Activity,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  TrackedUserOverview,
  TrackingSummaryMetrics,
} from '../../../types/tracking';
import {
  fetchTrackedUsersOverview,
  calculateTrackingSummaryMetrics,
} from '../../../services/adminTrackingService';
import { exportUsersToCsv } from '../../../utils/csvExport';
import { TrackingOverviewCards } from './TrackingOverviewCards';
import { TrackedUsersControls, UserSortOption, UserStatusFilter } from './TrackedUsersControls';
import { TrackedUsersTable } from './TrackedUsersTable';
import { AdminUserDetail } from './AdminUserDetail';

export const AdminActivityOverview: React.FC = () => {
  const [users, setUsers] = useState<TrackedUserOverview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Filter & sort states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<UserSortOption>('last_active');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrackedUsersOverview();
      setUsers(data);
    } catch (err: any) {
      console.error('[AdminActivityOverview] Error loading data:', err);
      setError(err?.message || 'Failed to fetch user tracking data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived high-level summary metrics
  const summaryMetrics: TrackingSummaryMetrics = useMemo(() => {
    return calculateTrackingSummaryMetrics(users);
  }, [users]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;
    const FIFTEEN_MINS_MS = 15 * 60 * 1000;
    const now = Date.now();

    return users
      .filter((user) => {
        // Status filter
        if (statusFilter === 'online') {
          if (!user.lastActiveEpoch || now - user.lastActiveEpoch > FIFTEEN_MINS_MS) {
            return false;
          }
        } else if (statusFilter === 'today') {
          if (!user.lastActiveEpoch || now - user.lastActiveEpoch > ONE_DAY_MS) {
            return false;
          }
        } else if (statusFilter === 'week') {
          if (!user.lastActiveEpoch || now - user.lastActiveEpoch > SEVEN_DAYS_MS) {
            return false;
          }
        }

        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          const nameMatch = user.displayName?.toLowerCase().includes(term);
          const emailMatch = user.email?.toLowerCase().includes(term);
          const uidMatch = user.userId?.toLowerCase().includes(term);
          const sectionMatch = user.currentSection?.toLowerCase().includes(term);
          if (!nameMatch && !emailMatch && !uidMatch && !sectionMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'total_visits':
            return b.totalVisits - a.totalVisits;
          case 'total_time':
            return b.totalTimeSpentSeconds - a.totalTimeSpentSeconds;
          case 'name':
            return (a.displayName || '').localeCompare(b.displayName || '');
          case 'last_active':
          default:
            return (b.lastActiveEpoch || 0) - (a.lastActiveEpoch || 0);
        }
      });
  }, [users, searchTerm, sortBy, statusFilter]);

  if (selectedUserId) {
    return (
      <AdminUserDetail
        userId={selectedUserId}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
              User Activity & Exploration
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Overview & Exploration
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregate session metrics, exploration history, and active platform engagement across all users.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 text-rose-300 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <TrackingOverviewCards metrics={summaryMetrics} loading={loading} />

      {/* Filter and Search Controls */}
      <TrackedUsersControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={users.length}
        filteredCount={filteredAndSortedUsers.length}
        loading={loading}
        onRefresh={loadData}
        onExportCsv={() => {
          exportUsersToCsv(filteredAndSortedUsers, {
            filename: `starlit-letters-users-${new Date().toISOString().slice(0, 10)}.csv`,
          });
        }}
      />

      {/* Detailed Users Table */}
      <TrackedUsersTable
        users={filteredAndSortedUsers}
        loading={loading}
        onSelectUser={(uid) => setSelectedUserId(uid)}
      />
    </div>
  );
};

