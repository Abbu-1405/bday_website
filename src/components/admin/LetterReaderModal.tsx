import React from 'react';
import { X, Calendar, Mail, FileText, CheckCircle2, Circle } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100">Written Letter Reader</h3>
              <p className="text-[11px] text-slate-400">Submitted through Starlit Letters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close letter reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Letter Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          {/* Letter Meta Header */}
          <div className="border-b border-slate-800 pb-6 space-y-4">
            <h2 className="text-xl md:text-2xl font-serif font-semibold text-amber-200 tracking-wide">
              {letter.title || 'Untitled Letter'}
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center space-x-3">
                {letter.userPhotoURL ? (
                  <img
                    src={letter.userPhotoURL}
                    alt={letter.userDisplayName || 'Sender'}
                    className="w-9 h-9 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                    {(letter.userDisplayName || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="text-slate-300 font-medium text-sm block">
                    Written by {letter.userDisplayName}
                  </span>
                  {letter.userEmail && (
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      {letter.userEmail}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {letter.createdAt}
                </span>

                <button
                  onClick={() => onToggleReadState(letter.id, letter.isRead)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    letter.isRead
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                  }`}
                >
                  {letter.isRead ? (
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
          </div>

          {/* Letter Body Page Styling */}
          <div className="p-6 md:p-8 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner">
            <div className="prose prose-invert prose-amber max-w-none text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-serif select-text">
              {letter.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-mono">UID: {letter.userId.slice(0, 10)}...</span>
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
