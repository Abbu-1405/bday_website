import React from 'react';
import { X, Calendar, User, Mail, Heart, CheckCircle2, Circle, Terminal, Radio } from 'lucide-react';
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

  const packetId = `#PKT-${feeling.id.slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#020408]/85 backdrop-blur-sm animate-fade-in select-none font-mono">
      <div className="relative w-full max-w-2xl bg-[#050811] border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-emerald-950 bg-[#020408] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#050811] border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-emerald-300">
                  /sentiment/packet/{packetId}
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                  PRIVATE_FEELING
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Decrypted telemetry payload from "What Am I To You?"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#020408] text-slate-400 hover:text-emerald-300 border border-emerald-950 transition-colors cursor-pointer"
            aria-label="Close feeling reader"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Reader Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* User & Date Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#020408] border border-emerald-950 text-xs">
            <div className="flex items-center space-x-3">
              {feeling.userPhotoURL ? (
                <img
                  src={feeling.userPhotoURL}
                  alt={feeling.userDisplayName || 'User'}
                  className="w-9 h-9 rounded-full border border-emerald-950 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-[#050811] border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  {(feeling.userDisplayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="font-semibold text-emerald-200">{feeling.userDisplayName}</h4>
                {feeling.userEmail && (
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono select-all">
                    <Mail className="w-3 h-3 text-slate-500" />
                    {feeling.userEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Calendar className="w-3 h-3 text-cyan-400" />
                {feeling.createdAt}
              </span>

              <button
                onClick={() => onToggleReadState(feeling.id, feeling.isRead)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer ${
                  feeling.isRead
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border-amber-500/40'
                }`}
              >
                {feeling.isRead ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> [REVIEWED]
                  </>
                ) : (
                  <>
                    <Circle className="w-3 h-3 text-amber-400" /> [MARK_REVIEWED]
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Full Feeling Text */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-semibold block">
              PAYLOAD_TRANSMISSION_TEXT:
            </span>
            <div className="p-4 rounded-lg bg-[#020408] border border-emerald-500/30 text-emerald-100 text-xs leading-relaxed whitespace-pre-wrap font-mono tracking-wide select-text">
              {feeling.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#020408] border-t border-emerald-950 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400 font-mono text-[10px] select-all">
            ORIGIN_UID: {feeling.userId}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#050811] hover:bg-emerald-950/40 text-emerald-300 font-mono text-xs transition-colors border border-emerald-500/30 cursor-pointer"
          >
            [CLOSE_INSPECTOR]
          </button>
        </div>
      </div>
    </div>
  );
};
