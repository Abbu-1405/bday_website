import React, { useState } from 'react';
import {
  X,
  Send,
  Bell,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { NotificationEventType, NotificationDeliveryMode } from '../../../types';
import { triggerServerTestNotification } from '../../../services/notificationService';
import { DEFAULT_NOTIFICATION_TEMPLATES } from '../../../services/notificationTemplateService';

interface AdminTestPushModalProps {
  currentUserId: string;
  onClose: () => void;
  onSuccess: (eventId: string) => void;
}

const CATEGORIES: { id: NotificationEventType; label: string }[] = [
  { id: 'GENERAL', label: 'General Announcement' },
  { id: 'LETTER_AVAILABLE', label: 'Letter Available' },
  { id: 'OPEN_WHEN_AVAILABLE', label: 'Open-When Note' },
  { id: 'SECRET_UNLOCKED', label: 'Secret Vault' },
  { id: 'MOMENT_AVAILABLE', label: 'Photo Moment' },
  { id: 'BIRTHDAY', label: 'Birthday Greeting' },
];

export function AdminTestPushModal({ currentUserId, onClose, onSuccess }: AdminTestPushModalProps) {
  const [category, setCategory] = useState<NotificationEventType>('GENERAL');
  const [deliveryMode, setDeliveryMode] = useState<NotificationDeliveryMode>('immediate');
  const [title, setTitle] = useState(DEFAULT_NOTIFICATION_TEMPLATES.GENERAL.title);
  const [body, setBody] = useState(DEFAULT_NOTIFICATION_TEMPLATES.GENERAL.body);
  const [scheduledMinutes, setScheduledMinutes] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCategoryChange = (newCat: NotificationEventType) => {
    setCategory(newCat);
    const tmpl = DEFAULT_NOTIFICATION_TEMPLATES[newCat] || DEFAULT_NOTIFICATION_TEMPLATES.GENERAL;
    setTitle(tmpl.title);
    setBody(tmpl.body);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      setErrorMessage('Current user UID not found. Please log in as an administrator.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    let scheduledAt: Date | undefined = undefined;
    if (deliveryMode === 'scheduled') {
      scheduledAt = new Date(Date.now() + scheduledMinutes * 60 * 1000);
    }

    try {
      const res = await triggerServerTestNotification({
        userId: currentUserId,
        title,
        body,
        type: category,
        deliveryMode,
        scheduledAt,
        url: '/settings',
      });

      if (res.success && res.eventId) {
        onSuccess(res.eventId);
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to dispatch test notification event.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error triggering test notification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Send Admin Test Push</h3>
              <p className="text-xs text-slate-400">Safely test FCM push dispatch to your authenticated device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-6 space-y-4 text-xs text-slate-300">
          {/* Strict Admin Target Warning Card */}
          <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-start gap-2.5 text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div className="space-y-0.5">
              <span className="font-semibold">Safe Targeting Protection</span>
              <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                Test pushes are strictly delivered <span className="font-semibold underline">only to your authenticated admin account</span> ({currentUserId.slice(0, 8)}...). Accidental user-wide blasts are completely blocked.
              </p>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
              Notification Category
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as NotificationEventType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} ({cat.id})
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Mode Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDeliveryMode('immediate')}
              className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                deliveryMode === 'immediate'
                  ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span className="font-medium text-xs">Immediate Push</span>
              </div>
              {deliveryMode === 'immediate' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMode('scheduled')}
              className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                deliveryMode === 'scheduled'
                  ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium text-xs">Scheduled Push</span>
              </div>
              {deliveryMode === 'scheduled' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>

          {deliveryMode === 'scheduled' && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <label className="block text-[11px] font-mono text-slate-400">
                Deliver in how many minutes from now?
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={scheduledMinutes}
                onChange={(e) => setScheduledMinutes(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
              Notification Title
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Body Input */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
              Notification Message Body
            </label>
            <textarea
              required
              rows={3}
              maxLength={1000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl text-rose-300 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !body.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Queueing...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Queue Test Push
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
