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
} from 'lucide-react';
import { NotificationEvent, NotificationEventType } from '../../../types';

interface AdminNotificationEventInspectorProps {
  event: NotificationEvent | null;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<NotificationEventType | string, { bg: string; text: string; border: string }> = {
  LETTER_AVAILABLE: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  OPEN_WHEN_AVAILABLE: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  SECRET_UNLOCKED: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  MOMENT_AVAILABLE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  BIRTHDAY: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  GENERAL: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
};

export function AdminNotificationEventInspector({ event, onClose }: AdminNotificationEventInspectorProps) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!event) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const catStyle = CATEGORY_COLORS[event.type] || CATEGORY_COLORS.GENERAL;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-100">Event Inspector</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                  {event.type}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    event.status === 'sent'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : event.status === 'failed'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : event.status === 'scheduled'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {event.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                ID: {event.id}
                <button
                  onClick={() => copyToClipboard(event.id, 'id')}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  title="Copy Event ID"
                >
                  {copiedKey === 'id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Rendered Notification Envelope Card */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mb-2">
              Rendered Push Notification
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100 text-sm">{event.title}</span>
                <span className="text-[10px] font-mono text-slate-500">{event.deliveryMode}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{event.body}</p>
              {event.data?.url && (
                <div className="pt-2 border-t border-slate-900 flex items-center gap-2 text-[11px] text-indigo-400">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Target URL: <span className="font-mono text-slate-300">{event.data.url}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Lifecycle Metadata Grid */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mb-2">
              Delivery & Timing Metadata
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Created At
                </span>
                <p className="font-mono text-slate-200">{formatDate(event.createdAt)}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Scheduled / Target Time
                </span>
                <p className="font-mono text-slate-200">
                  {event.scheduledAt ? formatDate(event.scheduledAt) : 'Immediate Delivery'}
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-400" /> Processed & Sent At
                </span>
                <p className="font-mono text-slate-200">{formatDate(event.sentAt || event.processedAt)}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" /> Recipient Timezone
                </span>
                <p className="font-mono text-slate-200">{event.timezone || 'UTC'}</p>
              </div>
            </div>
          </div>

          {/* FCM Gateway & Token Performance */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mb-2">
              FCM Gateway Dispatch Results
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[11px]">Successful Devices</div>
                <div className="text-base font-semibold text-emerald-400 font-mono mt-0.5">
                  {event.successfulTokenCount ?? (event.status === 'sent' ? 1 : 0)}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[11px]">Failed Devices</div>
                <div className="text-base font-semibold text-rose-400 font-mono mt-0.5">
                  {event.failedTokenCount ?? 0}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[11px]">Attempt Count</div>
                <div className="text-base font-semibold text-slate-200 font-mono mt-0.5">
                  {event.attemptCount || 1}
                </div>
              </div>
            </div>
          </div>

          {/* Failure Information (if present) */}
          {(event.status === 'failed' || event.failureReason) && (
            <div>
              <div className="text-[11px] font-mono text-rose-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Failure Reason / Diagnostic
              </div>
              <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl text-rose-300 space-y-1">
                <p className="font-mono font-medium">{event.failureReason || 'FCM Delivery Failed'}</p>
                {event.error && <p className="text-[11px] text-rose-400/80 font-mono">{event.error}</p>}
              </div>
            </div>
          )}

          {/* Phase 7: User Engagement & Interaction Status */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-purple-400" /> Engagement & Interaction Tracking
              </span>
              <span className="text-[10px] text-purple-400 font-mono">
                {event.clickedAt ? 'INTERACTION RECORDED' : 'NO INTERACTION YET'}
              </span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Notification Clicked</span>
                  <div className="font-semibold text-xs font-mono flex items-center gap-1">
                    {event.clickedAt ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Open Count</span>
                  <div className="font-semibold text-xs font-mono text-slate-200">
                    {event.openedCount ?? (event.clickedAt ? 1 : 0)}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Target Opened</span>
                  <div className="font-semibold text-xs font-mono flex items-center gap-1">
                    {event.targetOpenedAt ? (
                      <span className="text-purple-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Confirmed
                      </span>
                    ) : (
                      <span className="text-slate-400">Not recorded</span>
                    )}
                  </div>
                </div>
              </div>

              {event.clickedAt && (
                <div className="space-y-1.5 pt-1 text-[11px] border-t border-slate-900">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">First Clicked At</span>
                    <span className="font-mono text-slate-300">{formatDate(event.clickedAt)}</span>
                  </div>
                  {event.lastClickedAt && event.lastClickedAt !== event.clickedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Last Clicked At</span>
                      <span className="font-mono text-slate-300">{formatDate(event.lastClickedAt)}</span>
                    </div>
                  )}
                  {event.targetOpenedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Target Content Rendered</span>
                      <span className="font-mono text-purple-300">{formatDate(event.targetOpenedAt)}</span>
                    </div>
                  )}
                  {event.interactionSource && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Interaction Source</span>
                      <span className="font-mono text-indigo-400 uppercase text-[10px] bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/40">
                        {event.interactionSource}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Template & Target User Metadata */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mb-2">
              Template & Identification
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Recipient User UID</span>
                <span className="font-mono text-slate-200 flex items-center gap-1.5">
                  {event.userId}
                  <button
                    onClick={() => copyToClipboard(event.userId, 'uid')}
                    className="text-slate-500 hover:text-slate-300"
                    title="Copy User UID"
                  >
                    {copiedKey === 'uid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Template ID & Version</span>
                <span className="font-mono text-indigo-400">
                  {event.templateId || 'default'} (v{event.templateVersion || 1})
                </span>
              </div>

              {event.cooldownCategory && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Anti-Spam Cooldown Category</span>
                  <span className="font-mono text-slate-200">{event.cooldownCategory}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payload Data JSON */}
          {event.data && Object.keys(event.data).length > 0 && (
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" /> Custom Payload Attributes (Safe Data)
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                {JSON.stringify(event.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center">
          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Tokens & Credentials Hidden (Privacy Enforced)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
