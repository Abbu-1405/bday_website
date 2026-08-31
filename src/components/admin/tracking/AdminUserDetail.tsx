import React, { useState, useEffect } from 'react';
import {
  Compass,
  Layers,
  Clock,
  Activity,
  FileText,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { TrackedUserDetail } from '../../../types/tracking';
import { fetchTrackedUserDetail } from '../../../services/adminTrackingService';
import { UserDetailHeader } from './UserDetailHeader';
import { UserDetailSummaryCards } from './UserDetailSummaryCards';
import { SectionExplorationView } from './SectionExplorationView';
import { ItemExplorationTable } from './ItemExplorationTable';
import { SessionHistoryList } from './SessionHistoryList';
import { ActivityTimelineView } from './ActivityTimelineView';
import { InteractionsHistoryView } from './InteractionsHistoryView';
import { UserErrorHistoryView } from './UserErrorHistoryView';

interface AdminUserDetailProps {
  userId: string;
  onBack: () => void;
}

type UserDetailTab = 'exploration' | 'sessions' | 'timeline' | 'interactions' | 'errors';

export const AdminUserDetail: React.FC<AdminUserDetailProps> = ({ userId, onBack }) => {
  const [detail, setDetail] = useState<TrackedUserDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<UserDetailTab>('exploration');

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTrackedUserDetail(userId);
      if (!data) {
        setError('User record or session history could not be found.');
      } else {
        setDetail(data);
      }
    } catch (err: any) {
      console.error('[AdminUserDetail] Failed to load user detail:', err);
      setError(err?.message || 'Failed to load user exploration history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6 py-12">
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <span className="text-sm font-medium">
            Fetching user sessions, exploration history, and activity timeline...
          </span>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-200">
            {error || 'User details not found'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Unable to retrieve the requested user tracking details.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
          >
            Back to User Registry
          </button>
          <button
            onClick={loadUserData}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    user,
    sessions,
    sectionExploration,
    itemExploration,
    mediaExploration,
    searchHistory,
    filterHistory,
    sneakPeekHistory,
    navigationHistory,
    errorHistory,
    events,
  } = detail;

  const totalInteractionsCount =
    mediaExploration.length +
    searchHistory.length +
    filterHistory.length +
    sneakPeekHistory.length +
    navigationHistory.length;

  return (
    <div className="space-y-6">
      {/* 1. Header Profile & Status */}
      <UserDetailHeader user={user} onBack={onBack} />

      {/* 2. Top Summary Metric Cards */}
      <UserDetailSummaryCards user={user} />

      {/* 3. Section Navigation Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('exploration')}
            id="tab-user-exploration"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'exploration'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Content Exploration</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                activeTab === 'exploration'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {itemExploration.length} items
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            id="tab-user-sessions"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'sessions'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Session History</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                activeTab === 'sessions'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {sessions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            id="tab-user-timeline"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity Timeline</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                activeTab === 'timeline'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {events.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('interactions')}
            id="tab-user-interactions"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'interactions'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactions & Search</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                activeTab === 'interactions'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {totalInteractionsCount}
            </span>
          </button>

          {errorHistory.length > 0 && (
            <button
              onClick={() => setActiveTab('errors')}
              id="tab-user-errors"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'errors'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Errors</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300">
                {errorHistory.length}
              </span>
            </button>
          )}
        </div>

        <button
          onClick={loadUserData}
          title="Refresh user exploration data"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4. Active Tab Content Panels */}
      {activeTab === 'exploration' && (
        <div className="space-y-6">
          <SectionExplorationView sections={sectionExploration} />
          <ItemExplorationTable items={itemExploration} />
        </div>
      )}

      {activeTab === 'sessions' && (
        <SessionHistoryList sessions={sessions} />
      )}

      {activeTab === 'timeline' && (
        <ActivityTimelineView events={events} sessions={sessions} />
      )}

      {activeTab === 'interactions' && (
        <InteractionsHistoryView
          media={mediaExploration}
          searches={searchHistory}
          filters={filterHistory}
          sneakPeek={sneakPeekHistory}
          navigation={navigationHistory}
        />
      )}

      {activeTab === 'errors' && (
        <UserErrorHistoryView errors={errorHistory} />
      )}
    </div>
  );
};
