import React from 'react';
import {
  Users,
  Activity,
  BookOpen,
  Sparkles,
  Heart,
  Mail,
  Award,
  KeyRound,
  RefreshCw,
  Film,
} from 'lucide-react';
import { AdminOverviewStats } from '../../services/adminService';

interface AdminOverviewProps {
  stats: AdminOverviewStats;
  loading: boolean;
  onRefresh: () => void;
  onNavigateToActivity: () => void;
  onNavigateToFeelings?: () => void;
  onNavigateToLetters?: () => void;
  onNavigateToBts?: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  loading,
  onRefresh,
  onNavigateToActivity,
  onNavigateToFeelings,
  onNavigateToLetters,
  onNavigateToBts,
}) => {
  const statCards = [
    {
      label: 'Authenticated Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      onClick: undefined,
    },
    {
      label: 'Total Activity Events',
      value: stats.totalActivities,
      icon: Activity,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      onClick: onNavigateToActivity,
    },
    {
      label: 'BTS Activity Hub',
      value: 'Live',
      icon: Film,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      onClick: onNavigateToBts,
    },
    {
      label: 'Notes Opened',
      value: stats.notesOpened,
      icon: BookOpen,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      onClick: undefined,
    },
    {
      label: 'Wishes Collected',
      value: stats.wishesCollected,
      icon: Sparkles,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      onClick: undefined,
    },
    {
      label: 'Secrets Discovered',
      value: stats.secretsDiscovered,
      icon: KeyRound,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      onClick: undefined,
    },
    {
      label: 'Feelings Submitted',
      value: stats.feelingsSubmitted,
      icon: Heart,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      onClick: onNavigateToFeelings,
    },
    {
      label: 'Letters Submitted',
      value: stats.lettersSubmitted,
      icon: Mail,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      onClick: onNavigateToLetters,
    },
    {
      label: 'Badges Unlocked',
      value: stats.badgesUnlocked,
      icon: Award,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      onClick: undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">System Overview</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time aggregate activity metrics from authenticated user interactions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <button
            onClick={onNavigateToActivity}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Activity className="w-3.5 h-3.5" />
            View Activity Feed
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.label}
              onClick={card.onClick}
              className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm transition-colors ${
                card.onClick ? 'hover:border-slate-700 cursor-pointer hover:bg-slate-800/40' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">{card.label}</span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.color}`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                {loading ? (
                  <span className="text-slate-600 animate-pulse">...</span>
                ) : (
                  card.value.toLocaleString()
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
