import React from 'react';
import { X, Calendar, User, Mail, Heart, CheckCircle2, Circle } from 'lucide-react';
import { AdminFeelingSubmission } from '../../services/adminInboxService';

interface FeelingReaderModalProps {
  feeling: AdminFeelingSubmission | null;
  onClose: () => void;
  onToggleReadState: (feelingId: string, currentReadState: boolean) => void;
}

export const FeelingReaderModal: React.FC<FeelingReaderModalProps> = ({
  feeling,
  onClose,
  onToggleReadState,
}) => {
  if (!feeling) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100">Private Feeling Submission</h3>
              <p className="text-[11px] text-slate-400">Submitted through What Am I To You?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close feeling reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Reader Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* User & Date Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center space-x-3">
              {feeling.userPhotoURL ? (
                <img
                  src={feeling.userPhotoURL}
                  alt={feeling.userDisplayName || 'User'}
                  className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
                  {(feeling.userDisplayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="font-medium text-sm text-slate-100">{feeling.userDisplayName}</h4>
                {feeling.userEmail && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Mail className="w-3 h-3 text-slate-500" />
                    {feeling.userEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {feeling.createdAt}
              </span>

              <button
                onClick={() => onToggleReadState(feeling.id, feeling.isRead)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  feeling.isRead
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                }`}
              >
                {feeling.isRead ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Read
                  </>
                ) : (
                  <>
                    <Circle className="w-3.5 h-3.5" /> Mark Read
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Full Feeling Text */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              Submission Text
            </span>
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-serif tracking-wide select-text">
              {feeling.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-mono">UID: {feeling.userId.slice(0, 10)}...</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors border border-slate-700"
          >
            Close Reader
          </button>
        </div>
      </div>
    </div>
  );
};
