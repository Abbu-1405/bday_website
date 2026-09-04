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
  Terminal,
  Radio,
  Wifi,
  Cpu,
  Shield,
  Zap,
} from 'lucide-react';
import {
  fetchAdminNotificationEvents,
  subscribeAdminNotificationEvents,
  triggerServerTestNotification,
  triggerServerQueueProcessing,
} from '../../services/notificationService';
import { NotificationEvent, NotificationEventType, NotificationDeliveryMode } from '../../types';
import { useAuth } from '../../hooks';
import { AdminNotificationTemplates } from './AdminNotificationTemplates';
import { AdminNotificationAnalytics } from './notifications/AdminNotificationAnalytics';
import { AdminNotificationHistory } from './notifications/AdminNotificationHistory';
import { AdminNotificationEventInspector } from './notifications/AdminNotificationEventInspector';
import { DEFAULT_NOTIFICATION_TEMPLATES } from '../../services/notificationTemplateService';

type NotificationSubTab = 'queue' | 'analytics' | 'history' | 'templates';

export function AdminNotificationQueue() {
  const { currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<NotificationSubTab>('queue');
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [selectedInspectEvent, setSelectedInspectEvent] = useState<NotificationEvent | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Embedded Dispatch Comms Console State
  const [dispatchCategory, setDispatchCategory] = useState<NotificationEventType>('GENERAL');
  const [dispatchDeliveryMode, setDispatchDeliveryMode] = useState<NotificationDeliveryMode>('immediate');
  const [dispatchTitle, setDispatchTitle] = useState(DEFAULT_NOTIFICATION_TEMPLATES.GENERAL.title);
  const [dispatchBody, setDispatchBody] = useState(DEFAULT_NOTIFICATION_TEMPLATES.GENERAL.body);
  const [dispatchScheduledMin, setDispatchScheduledMin] = useState(5);
  const [isTransmitting, setIsTransmitting] = useState(false);

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
        setActionFeedback(res.message || `DAEMON PASS OK: Verified ${res.processedCount ?? 0} pending transmissions.`);
      } else {
        setActionFeedback(`DAEMON ALERT: ${res.error}`);
      }
    } catch (err: any) {
      setActionFeedback(`DAEMON FAILED: ${err?.message}`);
    } finally {
      setIsProcessingQueue(false);
    }
  };

  const handleCategoryChange = (newCat: NotificationEventType) => {
    setDispatchCategory(newCat);
    const tmpl = DEFAULT_NOTIFICATION_TEMPLATES[newCat] || DEFAULT_NOTIFICATION_TEMPLATES.GENERAL;
    setDispatchTitle(tmpl.title);
    setDispatchBody(tmpl.body);
  };

  const handleTransmitPayload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) {
      setActionFeedback('TRANSMIT FAILED: Root admin credentials not detected.');
      return;
    }

    setIsTransmitting(true);
    setActionFeedback(null);

    let scheduledAt: Date | undefined = undefined;
    if (dispatchDeliveryMode === 'scheduled') {
      scheduledAt = new Date(Date.now() + dispatchScheduledMin * 60 * 1000);
    }

    try {
      const res = await triggerServerTestNotification({
        userId: currentUser.uid,
        title: dispatchTitle,
        body: dispatchBody,
        type: dispatchCategory,
        deliveryMode: dispatchDeliveryMode,
        scheduledAt,
        url: '/settings',
      });

      if (res.success && res.eventId) {
        setActionFeedback(`TRANSMISSION DISPATCHED: Event ID [${res.eventId.slice(-8)}] registered in queue.`);
        loadEvents();
      } else {
        setActionFeedback(`DISPATCH REJECTED: ${res.error || 'Unknown gateway error'}`);
      }
    } catch (err: any) {
      setActionFeedback(`DISPATCH ERROR: ${err?.message}`);
    } finally {
      setIsTransmitting(false);
    }
  };

  // Metrics
  const queuedCount = events.filter((e) => e.status === 'pending' || e.status === 'processing').length;
  const deliveredCount = events.filter((e) => e.status === 'sent').length;
  const failedCount = events.filter((e) => e.status === 'failed').length;
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

  return (
    <div className="space-y-4 font-mono select-none" id="admin-notifications-container">
      {/* Header */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_20px_rgba(16,185,129,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#020408] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-emerald-400 font-bold tracking-wider">
                  [TRANSMISSION_CONTROL // NOTIFICATION_DISPATCHER]
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GATEWAY::ONLINE
                </span>
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-[#020408] border border-emerald-950">
                  [DAEMON_V2.4]
                </span>
                <span className="text-[10px] text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  [FCM_V1_READY]
                </span>
              </div>
              <p className="text-[11px] text-emerald-600/90 font-mono mt-0.5">
                // Mission-control transmission queue, worker daemon telemetry, and push dispatcher.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleProcessQueue}
              disabled={isProcessingQueue}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isProcessingQueue ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{isProcessingQueue ? '[PROCESSING...]' : '[RUN_DAEMON_PASS]'}</span>
            </button>

            <button
              onClick={loadEvents}
              disabled={loading}
              className="p-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
              title="Sync queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
            </button>
          </div>
        </div>

        {/* TRANSMISSION METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-950/60">
          <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
                QUEUED / PENDING
              </div>
              <div className="text-xl font-bold text-amber-400 mt-0.5">{queuedCount}</div>
              <p className="text-[9px] text-amber-700 mt-0.5">Atomic claims awaiting</p>
            </div>
            <div className="w-7 h-7 rounded bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
                DELIVERED
              </div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{deliveredCount}</div>
              <p className="text-[9px] text-emerald-700 mt-0.5">FCM 200 OK confirmed</p>
            </div>
            <div className="w-7 h-7 rounded bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider">
                FAILED / REJECTED
              </div>
              <div className="text-xl font-bold text-rose-400 mt-0.5">{failedCount}</div>
              <p className="text-[9px] text-rose-700 mt-0.5">Dead-letter count</p>
            </div>
            <div className="w-7 h-7 rounded bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-[#020408] rounded-lg p-3 border border-emerald-950 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                ACTIVE SCHEDULES
              </div>
              <div className="text-xl font-bold text-cyan-300 mt-0.5">{scheduledCount}</div>
              <p className="text-[9px] text-cyan-700 mt-0.5">Cron time-locked</p>
            </div>
            <div className="w-7 h-7 rounded bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* WORKER HEALTH / FCM STATUS BAR */}
        <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 text-[11px]">SIGNAL_STRENGTH:</span>
              <span className="text-emerald-400 font-bold tracking-widest text-[11px]">||||| 99.4%</span>
            </div>

            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 text-[11px]">DAEMON_UPTIME:</span>
              <span className="text-cyan-300 font-mono text-[11px]">14D 08H 22M [ACK]</span>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400 text-[11px]">REGISTRATION_TOKENS:</span>
              <span className="text-teal-300 font-mono text-[11px]">VALIDATED_SYNC</span>
            </div>
          </div>

          <div className="text-[10px] text-emerald-600 font-mono">
            PROTOCOL: FCM_HTTP_V1 // ATOMIC_TX_LOCK
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-emerald-950/80 pb-2">
        <button
          onClick={() => setActiveSubTab('queue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'queue'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-semibold'
              : 'bg-[#020408] text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-emerald-950'
          }`}
        >
          <span>&gt; [01 // TRANSMISSION_QUEUE]</span>
          <span className="px-1.5 py-0.2 rounded bg-[#050811] text-[10px] text-cyan-400 border border-emerald-950">
            {events.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'analytics'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-semibold'
              : 'bg-[#020408] text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-emerald-950'
          }`}
        >
          <span>&gt; [02 // TELEMETRY_ANALYTICS]</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'history'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-semibold'
              : 'bg-[#020408] text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-emerald-950'
          }`}
        >
          <span>&gt; [03 // PACKET_HISTORY]</span>
        </button>

        <button
          onClick={() => setActiveSubTab('templates')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'templates'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-semibold'
              : 'bg-[#020408] text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-emerald-950'
          }`}
        >
          <span>&gt; [04 // PAYLOAD_TEMPLATES]</span>
        </button>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>&gt; {actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-400 hover:text-emerald-200 ml-2 font-mono text-xs cursor-pointer"
          >
            [X]
          </button>
        </div>
      )}

      {/* 1. QUEUE TAB (INCLUDES DISPATCH CONSOLE & QUEUE TELEMETRY) */}
      {activeSubTab === 'queue' && (
        <div className="space-y-4">
          {/* MILITARY COMMS DISPATCH CONSOLE */}
          <div className="bg-[#050811]/90 border border-cyan-500/30 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-950/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300 tracking-wider">
                  DISPATCH_CONSOLE // MANUAL_PUSH_TRANSMITTER
                </span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">
                CALLSIGN: ROOT_DISPATCHER
              </span>
            </div>

            <form onSubmit={handleTransmitPayload} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category Select */}
                <div>
                  <label className="block text-[10px] text-emerald-500 font-semibold mb-1 uppercase">
                    TRANSMISSION_TYPE:
                  </label>
                  <select
                    value={dispatchCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as NotificationEventType)}
                    className="w-full bg-[#020408] border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-emerald-200 font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="GENERAL">[GENERAL_BURST]</option>
                    <option value="LETTER_AVAILABLE">[LETTER_AVAILABLE]</option>
                    <option value="OPEN_WHEN_AVAILABLE">[OPEN_WHEN_AVAILABLE]</option>
                    <option value="SECRET_UNLOCKED">[SECRET_UNLOCKED]</option>
                    <option value="MOMENT_AVAILABLE">[MOMENT_AVAILABLE]</option>
                    <option value="BIRTHDAY">[BIRTHDAY_GREETING]</option>
                  </select>
                </div>

                {/* Delivery Mode */}
                <div>
                  <label className="block text-[10px] text-cyan-500 font-semibold mb-1 uppercase">
                    DELIVERY_SCHEDULE:
                  </label>
                  <select
                    value={dispatchDeliveryMode}
                    onChange={(e) => setDispatchDeliveryMode(e.target.value as NotificationDeliveryMode)}
                    className="w-full bg-[#020408] border border-cyan-500/30 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="immediate">[IMMEDIATE_DISPATCH]</option>
                    <option value="scheduled">[SCHEDULED_DELAY]</option>
                  </select>
                </div>

                {/* Delay in minutes if scheduled */}
                {dispatchDeliveryMode === 'scheduled' ? (
                  <div>
                    <label className="block text-[10px] text-teal-400 font-semibold mb-1 uppercase">
                      DELAY (MINUTES):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={dispatchScheduledMin}
                      onChange={(e) => setDispatchScheduledMin(parseInt(e.target.value) || 5)}
                      className="w-full bg-[#020408] border border-teal-500/30 rounded-lg px-2.5 py-1.5 text-xs text-teal-200 font-mono focus:outline-none focus:border-teal-400"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1 uppercase">
                      TARGET_DEVICE:
                    </label>
                    <div className="bg-[#020408] border border-emerald-950 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 font-mono truncate">
                      ADMIN_AUTH_DEVICE (UID: {currentUser?.uid?.substring(0, 10) || 'N/A'}...)
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Body */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-emerald-500 font-semibold mb-1 uppercase">
                    PAYLOAD_HEADER:
                  </label>
                  <input
                    type="text"
                    value={dispatchTitle}
                    onChange={(e) => setDispatchTitle(e.target.value)}
                    required
                    className="w-full bg-[#020408] border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-emerald-200 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-emerald-500 font-semibold mb-1 uppercase">
                    TRANSMISSION_PAYLOAD_BODY:
                  </label>
                  <input
                    type="text"
                    value={dispatchBody}
                    onChange={(e) => setDispatchBody(e.target.value)}
                    required
                    className="w-full bg-[#020408] border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-emerald-200 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Dispatch Action Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isTransmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#020408] hover:bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                >
                  {isTransmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isTransmitting ? '[TRANSMITTING...]' : '[TRANSMIT_PAYLOAD]'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* QUEUE TELEMETRY TABLE */}
          <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl overflow-hidden space-y-3 p-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  placeholder="Filter payload header, body, UID, or event ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#020408] border border-emerald-500/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-emerald-200 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-emerald-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-[#020408] border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="all">[ALL_CATEGORIES]</option>
                  <option value="LETTER_AVAILABLE">[LETTERS]</option>
                  <option value="OPEN_WHEN_AVAILABLE">[OPEN_WHEN]</option>
                  <option value="SECRET_UNLOCKED">[SECRETS]</option>
                  <option value="MOMENT_AVAILABLE">[MOMENTS]</option>
                  <option value="BIRTHDAY">[BIRTHDAY]</option>
                  <option value="GENERAL">[GENERAL]</option>
                </select>
              </div>
            </div>

            {/* Terminal Queue Table */}
            <div className="border border-emerald-950 rounded-lg overflow-hidden bg-[#020408]">
              {loading ? (
                <div className="p-12 text-center text-emerald-400 text-xs font-mono space-y-2">
                  <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>&gt; BUFFERING_TRANSMISSION_QUEUE...</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-mono">
                  &gt; ZERO TRANSMISSIONS CURRENTLY MATCHING FILTER.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-emerald-950/60 font-mono">
                    <thead className="bg-[#050811] text-[10px] font-mono text-emerald-500 uppercase">
                      <tr>
                        <th className="p-2.5">DISPATCH_TIME</th>
                        <th className="p-2.5">PACKET_ID</th>
                        <th className="p-2.5">TYPE</th>
                        <th className="p-2.5">TARGET_UID</th>
                        <th className="p-2.5">PAYLOAD_SUMMARY</th>
                        <th className="p-2.5">TRANSMISSION_STATUS</th>
                        <th className="p-2.5 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-950/40">
                      {filteredEvents.map((evt) => (
                        <tr
                          key={evt.id}
                          onClick={() => setSelectedInspectEvent(evt)}
                          className="hover:bg-emerald-950/20 transition-colors text-[11px] cursor-pointer"
                        >
                          <td className="p-2.5 text-slate-400 whitespace-nowrap">
                            {evt.createdAt ? new Date(evt.createdAt).toLocaleTimeString() : 'N/A'}
                          </td>
                          <td className="p-2.5 text-cyan-400 font-mono whitespace-nowrap">
                            #{evt.id.substring(0, 8)}
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-[#050811] text-emerald-300 border border-emerald-500/30 text-[9px]">
                              {evt.type}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-400 font-mono whitespace-nowrap">
                            {evt.userId ? `${evt.userId.substring(0, 8)}...` : 'broadcast'}
                          </td>
                          <td className="p-2.5 text-slate-200 max-w-[200px] truncate">
                            <span className="font-semibold text-emerald-200">{evt.title}</span> — {evt.body}
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                evt.status === 'sent'
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                                  : evt.status === 'failed'
                                  ? 'bg-rose-950 text-rose-400 border-rose-500/40'
                                  : evt.status === 'scheduled'
                                  ? 'bg-cyan-950 text-cyan-400 border-cyan-500/40'
                                  : 'bg-amber-950 text-amber-400 border-amber-500/40'
                              }`}
                            >
                              [{evt.status.toUpperCase()}]
                            </span>
                          </td>
                          <td className="p-2.5 text-right whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInspectEvent(evt);
                              }}
                              className="px-2 py-0.5 rounded bg-[#050811] hover:bg-emerald-950/60 text-emerald-300 text-[10px] border border-emerald-500/30 transition-colors"
                            >
                              &gt; INSPECT
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ANALYTICS SUB-TAB */}
      {activeSubTab === 'analytics' && <AdminNotificationAnalytics />}

      {/* 3. HISTORY SUB-TAB */}
      {activeSubTab === 'history' && <AdminNotificationHistory />}

      {/* 4. TEMPLATES SUB-TAB */}
      {activeSubTab === 'templates' && <AdminNotificationTemplates />}

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
