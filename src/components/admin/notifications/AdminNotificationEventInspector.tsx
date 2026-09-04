import React from 'react';
import {
  X,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Copy,
  Check,
  Send,
  Calendar,
  Globe,
  FileCode,
  ShieldCheck,
  Smartphone,
  MousePointerClick,
  Eye,
  Sparkles,
  Brain,
  Sliders,
  AlertOctagon,
  Terminal,
} from 'lucide-react';
import { NotificationEvent, NotificationEventType } from '../../../types';

interface AdminNotificationEventInspectorProps {
  event: NotificationEvent | null;
  onClose: () => void;
}

export function AdminNotificationEventInspector({ event, onClose }: AdminNotificationEventInspectorProps) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!event) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-200 font-mono select-none">
      <div className="bg-[#050811] border border-emerald-500/30 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-emerald-950 flex items-center justify-between bg-[#020408]">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-[#050811] text-emerald-400 border border-emerald-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-emerald-300">
                  /packets/inspect/tx#{event.id.substring(0, 10)}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium bg-[#020408] text-cyan-300 border border-cyan-500/30">
                  [{event.type}]
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium border ${
                    event.status === 'sent'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                      : event.status === 'failed'
                      ? 'bg-rose-950 text-rose-400 border-rose-500/40'
                      : event.status === 'scheduled'
                      ? 'bg-cyan-950 text-cyan-400 border-cyan-500/40'
                      : 'bg-amber-950 text-amber-400 border-amber-500/40'
                  }`}
                >
                  [{event.status.toUpperCase()}]
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                PACKET_ID: {event.id}
                <button
                  onClick={() => copyToClipboard(event.id, 'id')}
                  className="text-slate-400 hover:text-emerald-300 transition-colors p-0.5"
                  title="Copy Packet ID"
                >
                  {copiedKey === 'id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#020408] text-slate-400 hover:text-emerald-300 border border-emerald-950 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Rendered Notification Envelope Card */}
          <div>
            <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-semibold mb-1.5">
              RENDERED_PAYLOAD_PREVIEW
            </div>
            <div className="bg-[#020408] p-3.5 rounded-lg border border-emerald-950 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-200 text-xs">{event.title}</span>
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1 rounded border border-cyan-500/30">
                  {event.deliveryMode}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">{event.body}</p>
              {event.data?.url && (
                <div className="pt-1.5 border-t border-emerald-950 flex items-center gap-2 text-[10px] text-cyan-400">
                  <Globe className="w-3 h-3" />
                  <span>TARGET_ROUTE: <span className="font-mono text-slate-300">{event.data.url}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Lifecycle Metadata Grid */}
          <div>
            <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-semibold mb-1.5">
              DELIVERY_AND_TELEMETRY_TIMESTAMPS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-[#020408] p-2.5 rounded-lg border border-emerald-950 space-y-1">
                <span className="text-slate-400 text-[10px] flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-emerald-400" /> CREATED_AT
                </span>
                <p className="font-mono text-emerald-300 text-[11px]">{formatDate(event.createdAt)}</p>
              </div>

              <div className="bg-[#020408] p-2.5 rounded-lg border border-emerald-950 space-y-1">
                <span className="text-slate-400 text-[10px] flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-amber-400" /> TARGET_DELIVERY_TIME
                </span>
                <p className="font-mono text-amber-300 text-[11px]">
                  {event.scheduledAt ? formatDate(event.scheduledAt) : 'IMMEDIATE_BURST'}
                </p>
              </div>

              <div className="bg-[#020408] p-2.5 rounded-lg border border-emerald-950 space-y-1">
                <span className="text-slate-400 text-[10px] flex items-center gap-1.5">
                  <Send className="w-3 h-3 text-cyan-400" /> PROCESSED_AND_DISPATCHED
                </span>
                <p className="font-mono text-cyan-300 text-[11px]">{formatDate(event.sentAt || event.processedAt)}</p>
              </div>

              <div className="bg-[#020408] p-2.5 rounded-lg border border-emerald-950 space-y-1">
                <span className="text-slate-400 text-[10px] flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-teal-400" /> RECIPIENT_ZONE
                </span>
                <p className="font-mono text-teal-300 text-[11px]">{event.timezone || 'UTC'}</p>
              </div>
            </div>
          </div>

          {/* FCM Gateway & Token Performance */}
          <div>
            <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-semibold mb-1.5">
              FCM_GATEWAY_RESULTS
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-[#020408] p-2.5 rounded-lg border border-emerald-950">
                <div className="text-slate-400 text-[10px]">SUCCESSFUL_DEVICES</div>
                <div className="text-sm font-semibold text-emerald-400 font-mono mt-0.5">
                  {event.successfulTokenCount ?? (event.status === 'sent' ? 1 : 0)}
                </div>
              </div>

              <div className="bg-[#020408] p-2.5 rounded-lg border border-emerald-950">
                <div className="text-slate-400 text-[10px]">FAILED_DEVICES</div>
                <div className="text-sm font-semibold text-rose-400 font-mono mt-0.5">
                  {event.failedTokenCount ?? 0}
                </div>
              </div>

              <div className="bg-[#020408] p-2.5 rounded-lg border border-emerald-950">
                <div className="text-slate-400 text-[10px]">ATTEMPT_COUNT</div>
                <div className="text-sm font-semibold text-cyan-300 font-mono mt-0.5">
                  {event.attemptCount || 1}
                </div>
              </div>
            </div>
          </div>

          {/* Failure Information (if present) */}
          {(event.status === 'failed' || event.failureReason) && (
            <div>
              <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> DIAGNOSTIC_FAULT_REPORT
              </div>
              <div className="bg-[#020408] border border-rose-500/40 p-3 rounded-lg text-rose-300 space-y-1">
                <p className="font-mono font-medium text-xs">{event.failureReason || 'FCM Delivery Failed'}</p>
                {event.error && <p className="text-[10px] text-rose-400 font-mono">{event.error}</p>}
              </div>
            </div>
          )}

          {/* Recipient User Identification */}
          <div>
            <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-semibold mb-1.5">
              RECIPIENT_AND_TEMPLATE_IDENTITY
            </div>
            <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 space-y-2 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">RECIPIENT_UID:</span>
                <span className="font-mono text-cyan-300 flex items-center gap-1.5 select-all">
                  {event.userId}
                  <button
                    onClick={() => copyToClipboard(event.userId, 'uid')}
                    className="text-slate-400 hover:text-emerald-300"
                    title="Copy User UID"
                  >
                    {copiedKey === 'uid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">TEMPLATE_DESCRIPTOR:</span>
                <span className="font-mono text-emerald-300">
                  {event.templateId || 'default'} (v{event.templateVersion || 1})
                </span>
              </div>
            </div>
          </div>

          {/* Custom Payload Safe Data JSON */}
          {event.data && Object.keys(event.data).length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
                <FileCode className="w-3 h-3 text-cyan-400" /> RAW_METADATA_STREAM
              </div>
              <pre className="bg-[#020408] p-3 rounded-lg border border-emerald-950 font-mono text-[10px] text-emerald-300 overflow-x-auto">
                {JSON.stringify(event.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-emerald-950 bg-[#020408] flex justify-between items-center">
          <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> FCM_SECURITY::ENCRYPTED
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#050811] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-colors cursor-pointer"
          >
            [DISMISS_INSPECTOR]
          </button>
        </div>
      </div>
    </div>
  );
}
