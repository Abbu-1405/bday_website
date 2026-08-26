import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { updateNotificationGlobalControl } from '../../../services/notificationAnalyticsService';

interface AdminEmergencySwitchModalProps {
  currentGlobalEnabled: boolean;
  adminUid: string;
  onClose: () => void;
  onSuccess: (newStatus: boolean) => void;
}

export function AdminEmergencySwitchModal({
  currentGlobalEnabled,
  adminUid,
  onClose,
  onSuccess,
}: AdminEmergencySwitchModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetStatus = !currentGlobalEnabled;

  const handleToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await updateNotificationGlobalControl(
        targetStatus,
        reason || (targetStatus ? 'Resumed normal operations' : 'Emergency pause triggered'),
        adminUid
      );

      if (res.success) {
        onSuccess(targetStatus);
        onClose();
      } else {
        setError(res.error || 'Failed to update global emergency notification control.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error updating global control switch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${
            targetStatus
              ? 'border-slate-800 bg-emerald-950/20'
              : 'border-rose-900/40 bg-rose-950/30'
          } flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                targetStatus
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {targetStatus ? <CheckCircle2 className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                {targetStatus ? 'Resume Global Notifications' : 'Global Emergency Pause'}
              </h3>
              <p className="text-xs text-slate-400">
                {targetStatus ? 'Re-enable automatic notifications' : 'Halt all notification event generation'}
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

        {/* Content */}
        <form onSubmit={handleToggle} className="p-6 space-y-4 text-xs text-slate-300">
          <div
            className={`p-3.5 rounded-xl border space-y-1.5 ${
              targetStatus
                ? 'bg-slate-950 border-slate-800 text-slate-300'
                : 'bg-rose-950/20 border-rose-900/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>System Impact Statement</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {targetStatus
                ? 'Re-enabling global notifications will restore automatic background push generation for letters, open-when notes, moments, secrets, and birthdays across all users.'
                : 'Engaging the emergency stop will instantly prevent all new notification events from being queued or generated. Existing queued and scheduled events will remain safely in Firestore without deletion.'}
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
              Reason / Operational Notes (Optional)
            </label>
            <textarea
              rows={2}
              maxLength={300}
              placeholder={targetStatus ? 'e.g. Issue resolved, resuming service' : 'e.g. Temporary maintenance or testing'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl text-rose-300 text-[11px]">
              {error}
            </div>
          )}

          {/* Actions */}
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
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-xl text-white text-xs font-medium transition-colors shadow-lg ${
                targetStatus
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              {isSubmitting
                ? 'Updating...'
                : targetStatus
                ? 'Confirm & Re-Enable Notifications'
                : 'Confirm & Pause Notifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
