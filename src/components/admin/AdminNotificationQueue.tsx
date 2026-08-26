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
} from 'lucide-react';
import {
  fetchAdminNotificationEvents,
  subscribeAdminNotificationEvents,
  triggerServerTestNotification,
  triggerServerQueueProcessing,
} from '../../services/notificationService';
import { NotificationEvent } from '../../types';
import { useAuth } from '../../hooks';

export function AdminNotificationQueue() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
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
    // Initial fetch
    loadEvents();

    // Setup live real-time subscription
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

  const handleSendTestPush = async () => {
    if (!currentUser?.uid) return;
    setIsSendingTest(true);
    setActionFeedback(null);
    try {
      const res = await triggerServerTestNotification({
        userId: currentUser.uid,
        title: 'Starlit Letters Push Verification ✨',
        body: 'Phase 3 server-side FCM push delivery is active and working perfectly!',
        url: '/settings',
      });
      if (res.success) {
        setActionFeedback(`Test event queued (ID: ${res.eventId?.slice(-8)}). Cloud Function Firestore trigger will claim and deliver.`);
      } else {
        setActionFeedback(`Test push notice: ${res.error}`);
      }
    } catch (err: any) {
      setActionFeedback(`Test failed: ${err?.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesFilter = filterType === 'all' || evt.type === filterType;
    const matchesSearch =
      searchQuery === '' ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LETTER_AVAILABLE':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'OPEN_WHEN_AVAILABLE':
        return <FolderLock className="w-4 h-4 text-indigo-400" />;
      case 'SECRET_UNLOCKED':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'MOMENT_AVAILABLE':
        return <Image className="w-4 h-4 text-emerald-400" />;
      case 'BIRTHDAY':
        return <Calendar className="w-4 h-4 text-pink-400" />;
      case 'GENERAL':
      default:
        return <Bell className="w-4 h-4 text-purple-400" />;
    }
  };

  const getStatusBadge = (status: string, evt: NotificationEvent) => {
    switch (status) {
      case 'sent':
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              Delivered
            </span>
            {typeof evt.successfulTokenCount === 'number' && (
              <span className="text-[10px] text-emerald-500/80 font-mono">
                {evt.successfulTokenCount} device{evt.successfulTokenCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
      case 'failed':
        return (
          <div className="flex flex-col gap-0.5 max-w-[160px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-3 h-3" />
              Failed
            </span>
            {evt.failureReason && (
              <span className="text-[10px] text-rose-400/80 truncate" title={evt.failureReason}>
                {evt.failureReason}
              </span>
            )}
          </div>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Pending Dispatch
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Notification Event Engine & Push Worker</h3>
              <p className="text-xs text-slate-400">
                Phase 3 Server-Side FCM Delivery: claims pending events atomically and dispatches to registered tokens.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSendTestPush}
            disabled={isSendingTest || !currentUser}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
            title="Create and deliver test notification through server worker"
          >
            {isSendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send Test Push
          </button>

          <button
            onClick={handleProcessQueue}
            disabled={isProcessingQueue}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
            title="Process pending events"
          >
            {isProcessingQueue ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Process Pending
          </button>

          <button
            onClick={loadEvents}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-xs text-indigo-300 font-serif flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-indigo-400 hover:text-indigo-200 ml-2 font-mono text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, recipient ID, or message..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Event Types</option>
            <option value="LETTER_AVAILABLE">Letters</option>
            <option value="OPEN_WHEN_AVAILABLE">Open When</option>
            <option value="SECRET_UNLOCKED">Secret Vault</option>
            <option value="MOMENT_AVAILABLE">Moments</option>
            <option value="BIRTHDAY">Birthday</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </div>

      {/* Events Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
            Loading queued notification events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Bell className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            No notification events match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Recipient UID</th>
                  <th className="py-3 px-4">Title & Body</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4 text-right">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(evt.type)}
                        <span className="font-mono text-slate-200">{evt.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 max-w-[140px] truncate" title={evt.userId}>
                      {evt.userId}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-medium text-slate-200 truncate">{evt.title}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{evt.body}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(evt.status, evt)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right text-slate-400">
                      {evt.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

