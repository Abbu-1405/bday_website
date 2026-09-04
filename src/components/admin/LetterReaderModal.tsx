import React from 'react';
import { X, Calendar, Mail, FileText, CheckCircle2, Circle, Terminal, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { AdminLetterSubmission } from '../../services/adminInboxService';

interface LetterReaderModalProps {
  letter: AdminLetterSubmission | null;
  onClose: () => void;
  onToggleReadState: (letterId: string, currentReadState: boolean) => void;
}

export const LetterReaderModal: React.FC<LetterReaderModalProps> = ({
  letter,
  onClose,
  onToggleReadState,
}) => {
  if (!letter) return null;

  const dispatchRef = `#DISP-${letter.id.slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#020408]/85 backdrop-blur-sm animate-fade-in select-none font-mono">
      <div className="relative w-full max-w-3xl bg-[#050811] border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-emerald-950 bg-[#020408] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#050811] border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Unlock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-emerald-300">
                  /dispatch/decrypt/{dispatchRef}
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  CORRESPONDENCE_DECRYPTED
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Decrypted Intelligence Memo // Classification Level 2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#020408] text-slate-400 hover:text-emerald-300 border border-emerald-950 transition-colors cursor-pointer"
            aria-label="Close letter reader"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Letter Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4">
          {/* Classification & Metadata Header */}
          <div className="border border-emerald-950 rounded-lg p-3.5 bg-[#020408] space-y-3">
            <div className="flex items-center justify-between text-[10px] text-rose-400 font-bold border-b border-emerald-950/60 pb-1">
              <span>// RESTRICTED // CONFIDENTIAL // EYES_ONLY</span>
              <span className="text-slate-400 font-normal">ORIGIN_UID: {letter.userId}</span>
            </div>

            <h2 className="text-base md:text-lg font-bold text-emerald-300 tracking-wide">
              SUBJECT: {letter.title || 'UNTITLED_DISPATCH'}
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-1">
              <div className="flex items-center space-x-3">
                {letter.userPhotoURL ? (
                  <img
                    src={letter.userPhotoURL}
                    alt={letter.userDisplayName || 'Sender'}
                    className="w-9 h-9 rounded-lg border border-emerald-950 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-[#050811] border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    {(letter.userDisplayName || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="text-emerald-200 font-semibold text-xs block">
                    TRANSMITTED_BY: {letter.userDisplayName || 'UNKNOWN_AUTHOR'}
                  </span>
                  {letter.userEmail && (
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 select-all">
                      <Mail className="w-3 h-3 text-slate-500" />
                      {letter.userEmail}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  {letter.createdAt}
                </span>

                <button
                  onClick={() => onToggleReadState(letter.id, letter.isRead)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer ${
                    letter.isRead
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-950 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {letter.isRead ? (
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
          </div>

          {/* Letter Body Page Styling */}
          <div className="p-4 md:p-5 rounded-lg bg-[#020408] border border-emerald-500/30 shadow-inner space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-semibold block border-b border-emerald-950 pb-1">
              PAYLOAD_TRANSCRIPTION:
            </span>
            <div className="text-emerald-100 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-mono select-text pt-1">
              {letter.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#020408] border-t border-emerald-950 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400 font-mono text-[10px] select-all">
            DISPATCH_TOKEN: {letter.id}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#050811] hover:bg-emerald-950/40 text-emerald-300 font-mono text-xs transition-colors border border-emerald-500/30 cursor-pointer"
          >
            [CLOSE_DISPATCH]
          </button>
        </div>
      </div>
    </div>
  );
};
