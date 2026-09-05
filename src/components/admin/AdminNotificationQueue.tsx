import React, { useState, useEffect } from 'react';
import {
  Bell,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mail,
  FolderLock,
  Image,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Send,
  Loader2,
  Play,
  FileText,
  Layers,
  BarChart3,
  History,
  Eye,
} from 'lucide-react';
import {
  fetchAdminNotificationEvents,
  subscribeAdminNotificationEvents,
  triggerServerTestNotification,
  triggerServerQueueProcessing,
} from '../../services/notificationService';
import { NotificationEvent } from '../../types';
import { useAuth } from '../../hooks';
import { AdminNotificationTemplates } from './AdminNotificationTemplates';
import { AdminNotificationAnalytics } from './notifications/AdminNotificationAnalytics';
import { AdminNotificationHistory } from './notifications/AdminNotificationHistory';
import { AdminNotificationEventInspector } from './notifications/AdminNotificationEventInspector';
import { AdminTestPushModal } from './notifications/AdminTestPushModal';

type NotificationSubTab = 'analytics' | 'queue' | 'history' | 'templates';

export function AdminNotificationQueue() {
  const { currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<NotificationSubTab>('analytics');
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedInspectEvent, setSelectedInspectEvent] = useState<NotificationEvent | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminNotificationEvents(100);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load notification events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    const unsubscribe = subscribeAdminNotificationEvents((liveEvents) => {
      setEvents(liveEvents);
      setLoading(false);
    }, 100);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleProcessQueue = async () => {
    setIsProcessingQueue(true);
    setActionFeedback(null);
    try {
      const res = await triggerServerQueueProcessing();
      if (res.success) {
        setActionFeedback(res.message || `Queue verified: ${res.processedCount ?? 0} pending events.`);
      } else {
        setActionFeedback(`Queue notice: ${res.error}`);
      }
    } catch (err: any) {
      setActionFeedback(`Failed: ${err?.message}`);
    } finally {
      setIsProcessingQueue(false);
    }
  };

  const pendingCount = events.filter((e) => e.status === 'pending').length;
  const processingCount = events.filter((e) => e.status === 'processing').length;
  const scheduledCount = events.filter((e) => e.status === 'scheduled').length;

  const filteredEvents = events.filter((evt) => {
    if (filterType !== 'all' && evt.type !== filterType) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      evt.title?.toLowerCase().includes(q) ||
      evt.body?.toLowerCase().includes(q) ||
      evt.userId?.toLowerCase().includes(q) ||
      evt.id?.toLowerCase().includes(q)
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LETTER_AVAILABLE':
        return <Mail className="w-4 h-4 text-rose-400" />;
      case 'OPEN_WHEN_AVAILABLE':
        return <FolderLock className="w-4 h-4 text-amber-400" />;
      case 'SECRET_UNLOCKED':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'MOMENT_AVAILABLE':
        return <Image className="w-4 h-4 text-emerald-400" />;
      case 'BIRTHDAY':
        return <Calendar className="w-4 h-4 text-pink-400" />;
      case 'GENERAL':
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6" id="admin-notifications-container">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          id="tab-btn-analytics"
          onClick={() => setActiveSubTab('analytics')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'analytics'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics & Control Center
          <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 text-[10px] font-mono rounded border border-indigo-500/30">
            Phase 6
          </span>
        </button>

        <button
          id="tab-btn-queue"
          onClick={() => setActiveSubTab('queue')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'queue'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          Queue & Event Monitor
          <span className="px-1.5 py-0.2 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">
            {events.length}
          </span>
        </button>

        <button
          id="tab-btn-history"
          onClick={() => setActiveSubTab('history')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          Event History & Inspector
        </button>

        <button
          id="tab-btn-templates"
          onClick={() => setActiveSubTab('templates')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'templates'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          Notification Templates
          <span className="px-1.5 py-0.2 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">
            Phase 5
          </span>
        </button>
      </div>

      {/* Sub-Tab Views */}
      {activeSubTab === 'analytics' && <AdminNotificationAnalytics />}

      {activeSubTab === 'history' && <AdminNotificationHistory />}

      {activeSubTab === 'templates' && <AdminNotificationTemplates />}

      {activeSubTab === 'queue' && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Live Notification Queue & Worker Monitor</h3>
                  <p className="text-xs text-slate-400">
                    Real-time atomic claims, multicast delivery states, and scheduler status
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowTestModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Send Test Push
              </button>

              <button
                onClick={handleProcessQueue}
                disabled={isProcessingQueue}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isProcessingQueue ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Process Pending
              </button>

              <button
                onClick={loadEvents}
                disabled={loading}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {actionFeedback && (
            <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-xs text-indigo-300 font-sans flex items-center justify-between">
              <span>{actionFeedback}</span>
              <button
                onClick={() => setActionFeedback(null)}
                className="text-indigo-400 hover:text-indigo-200 ml-2 font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <span className="text-slate-400 text-[11px] font-mono">TOTAL EVENTS</span>
              <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">{events.length}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <span className="text-amber-400 text-[11px] font-mono">PENDING DISPATCH</span>
              <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">{pendingCount}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <span className="text-purple-400 text-[11px] font-mono">SCHEDULED</span>
              <div className="text-lg font-bold text-purple-300 font-mono mt-0.5">{scheduledCount}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <span className="text-sky-400 text-[11px] font-mono">PROCESSING</span>
              <div className="text-lg font-bold text-sky-300 font-mono mt-0.5">{processingCount}</div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by title, body, user ID, or event ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="all">All Categories</option>
                <option value="LETTER_AVAILABLE">Letters</option>
                <option value="OPEN_WHEN_AVAILABLE">Open When</option>
                <option value="SECRET_UNLOCKED">Secrets</option>
                <option value="MOMENT_AVAILABLE">Moments</option>
                <option value="BIRTHDAY">Birthday</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>

          {/* Events List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading live events...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No notification events match the filter.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedInspectEvent(evt)}
                    className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                        {getTypeIcon(evt.type)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                            {evt.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            ID: {evt.id.slice(0, 14)}...
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              evt.status === 'sent'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : evt.status === 'failed'
                                ? 'bg-rose-500/10 text-rose-400'
                                : evt.status === 'scheduled'
                                ? 'bg-purple-500/10 text-purple-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {evt.status.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200 truncate">{evt.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{evt.body}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInspectEvent(evt);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" /> Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Push Modal */}
      {showTestModal && currentUser?.uid && (
        <AdminTestPushModal
          currentUserId={currentUser.uid}
          onClose={() => setShowTestModal(false)}
          onSuccess={(eventId) => {
            setActionFeedback(`Test notification queued successfully (ID: ${eventId.slice(-8)}).`);
            loadEvents();
          }}
        />
      )}

      {/* Event Inspector Modal */}
      {selectedInspectEvent && (
        <AdminNotificationEventInspector
          event={selectedInspectEvent}
          onClose={() => setSelectedInspectEvent(null)}
        />
      )}
    </div>
  );
}
