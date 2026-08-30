import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, X, Terminal, Sparkles, AlertCircle } from 'lucide-react';
import {
  SECRETS_OVERRIDE_QUESTION,
  validateSecretsOverrideAnswer,
} from '../../utils/secretVaultStorage';

export interface SecretsOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SecretsOverrideModal: React.FC<SecretsOverrideModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [answer, setAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAnswer('');
      setErrorMessage(null);
      setIsSuccess(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSuccess) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSuccess, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setErrorMessage('Answer type cheyali kadha... enter something!');
      return;
    }

    const isValid = validateSecretsOverrideAnswer(answer);
    if (isValid) {
      setErrorMessage(null);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 750);
    } else {
      setErrorMessage(
        'Nope, nijam oppukoledu. Answer motham full sentence type cheyali ani cheppa ga... 😉'
      );
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (!isSuccess) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="override-dialog-title"
      aria-describedby="override-dialog-desc"
    >
      <div
        className="relative w-full max-w-md bg-[#0D1420] border border-[#B18A4A]/40 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7 text-[#F0E5CF] font-serif animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Tag */}
        <div className="flex items-center justify-between border-b border-[#B18A4A]/25 pb-3.5 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#B18A4A] uppercase font-semibold">
            <Terminal className="h-3.5 w-3.5" />
            <span id="override-dialog-title">Chamber Backdoor Override</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close override window"
            className="p-1 rounded-full text-[#A99E8B] hover:text-[#F0E5CF] hover:bg-[#172235] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Question & Prompt */}
        <div className="space-y-3 mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#172235] text-[#D8B86A] border border-[#B18A4A]/30">
            <Lock className="h-3 w-3 text-[#B18A4A]" />
            <span>Verification Required</span>
          </div>

          <p
            id="override-dialog-desc"
            className="text-sm sm:text-base leading-relaxed text-[#F0E5CF] font-medium bg-[#080C13]/70 p-3.5 rounded-xl border border-[#B18A4A]/20"
          >
            &ldquo;{SECRETS_OVERRIDE_QUESTION}&rdquo;
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="override-answer-input"
              className="block text-xs font-mono text-[#A99E8B]"
            >
              Full Sentence Answer:
            </label>
            <input
              ref={inputRef}
              id="override-answer-input"
              type="text"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Type your answer sentence here..."
              autoComplete="off"
              spellCheck="false"
              disabled={isSuccess}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C13] border border-[#B18A4A]/40 text-[#F0E5CF] text-sm focus:outline-none focus:ring-2 focus:ring-[#B18A4A] focus:border-transparent transition-all placeholder:text-[#5C5144] font-sans"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 text-xs text-[#E89898] bg-[#2A1215] border border-[#8C2E3B]/60 p-2.5 rounded-lg"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#E89898]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success State */}
          {isSuccess && (
            <div
              role="status"
              className="flex items-center justify-center gap-2 text-xs font-mono text-[#7ED99B] bg-[#122A18] border border-[#2E8C4A]/60 p-2.5 rounded-lg animate-in fade-in"
            >
              <Unlock className="h-4 w-4 text-[#7ED99B]" />
              <span>Override accepted. 🔓 Backdoor unlocked!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSuccess}
              className="px-4 py-2 text-xs rounded-xl font-serif text-[#A99E8B] hover:text-[#F0E5CF] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="px-5 py-2 min-h-[38px] text-xs font-serif font-medium rounded-xl bg-[#55343B] text-[#F0E5CF] border border-[#B18A4A] hover:brightness-115 active:scale-98 transition-all cursor-pointer shadow-sm inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#B18A4A]" />
              <span>Submit Answer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
