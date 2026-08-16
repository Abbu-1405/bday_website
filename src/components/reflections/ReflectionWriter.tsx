import React, { useState } from 'react';
import { Heart, Feather, Send, Loader2, Check } from 'lucide-react';
import { submitFeeling, submitLetter } from '../../services/whatAmIToYouService';

interface ReflectionWriterProps {
  userId: string;
  onSaved: () => void;
}

export const ReflectionWriter: React.FC<ReflectionWriterProps> = ({ userId, onSaved }) => {
  const [writerMode, setWriterMode] = useState<'feeling' | 'letter'>('feeling');
  const [content, setContent] = useState('');
  const [letterTitle, setLetterTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isFeeling = writerMode === 'feeling';
  const maxLength = isFeeling ? 3000 : 10000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting || !userId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (isFeeling) {
        await submitFeeling(userId, content);
      } else {
        await submitLetter(userId, letterTitle || undefined, content);
      }

      setContent('');
      setLetterTitle('');
      setSavedSuccess(true);
      onSaved();

      setTimeout(() => {
        setSavedSuccess(false);
      }, 4000);
    } catch (err: any) {
      console.error('[REFLECTIONS] Error saving reflection:', err);
      setError(err?.message || 'Unable to preserve your reflection at this time. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Reflection Journal Writing Desk"
      className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 border shadow-2xl space-y-5"
      style={{
        backgroundColor: '#151c2e',
        borderColor: 'rgba(197, 154, 82, 0.28)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
      }}
    >
      {/* Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C59A52]/20 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-serif font-medium uppercase tracking-wider" style={{ color: '#C59A52' }}>
            <Feather className="w-3.5 h-3.5" />
            <span>Midnight Journal Desk</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium tracking-tight" style={{ color: '#F2E8D2' }}>
            Inscribe a Reflection
          </h2>
          <p className="text-xs sm:text-sm font-serif italic" style={{ color: '#CDBFA8' }}>
            Whatever thoughts you wish to keep close and revisit in quiet hours.
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex items-center gap-2 self-start sm:self-auto p-1 rounded-full border border-[#806846]/50 bg-[#0f1424]">
          <button
            type="button"
            onClick={() => {
              setWriterMode('feeling');
              setError(null);
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 min-h-[38px] rounded-full text-xs font-serif transition-all cursor-pointer"
            style={{
              backgroundColor: isFeeling ? '#6E3E42' : 'transparent',
              color: isFeeling ? '#F2E8D2' : '#CDBFA8',
              border: isFeeling ? '1px solid #9F7A3D' : '1px solid transparent',
            }}
          >
            <Heart className="w-3 h-3 fill-current opacity-80" />
            <span>A Quiet Feeling</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setWriterMode('letter');
              setError(null);
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 min-h-[38px] rounded-full text-xs font-serif transition-all cursor-pointer"
            style={{
              backgroundColor: !isFeeling ? '#6E3E42' : 'transparent',
              color: !isFeeling ? '#F2E8D2' : '#CDBFA8',
              border: !isFeeling ? '1px solid #9F7A3D' : '1px solid transparent',
            }}
          >
            <Feather className="w-3 h-3" />
            <span>Letter to Self</span>
          </button>
        </div>
      </div>

      {/* Writing Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Optional Title for Letters */}
        {!isFeeling && (
          <div className="space-y-1.5">
            <label htmlFor="journal-letter-title" className="block text-xs font-serif" style={{ color: '#E8D8B8' }}>
              Letter Title <span className="font-normal text-[#9F927F]">(optional)</span>
            </label>
            <input
              id="journal-letter-title"
              type="text"
              value={letterTitle}
              onChange={(e) => setLetterTitle(e.target.value)}
              placeholder="Give this reflection a title or date note..."
              maxLength={120}
              disabled={isSubmitting}
              className="w-full font-serif text-sm sm:text-base px-4 py-2.5 sm:py-3 rounded-xl transition-all reflections-parchment-sheet"
            />
          </div>
        )}

        {/* Parchment Writing Sheet */}
        <div className="space-y-2">
          <label htmlFor="reflection-writing-area" className="sr-only">
            {isFeeling ? 'Quiet Feeling Content' : 'Letter Content'}
          </label>
          
          <div className="relative rounded-2xl overflow-hidden shadow-inner">
            <textarea
              id="reflection-writing-area"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError(null);
              }}
              placeholder={
                isFeeling
                  ? "Write down what lingers in your heart tonight..."
                  : "Dear future self, or words unspoken..."
              }
              rows={isFeeling ? 5 : 8}
              maxLength={maxLength}
              disabled={isSubmitting}
              className="w-full font-serif text-sm sm:text-base p-4 sm:p-5 rounded-2xl transition-all resize-y min-h-[150px] sm:min-h-[180px] reflections-parchment-lines"
            />
          </div>

          {/* Understated Character Notation & Privacy Message */}
          <div className="flex flex-row items-center justify-between text-[11px] sm:text-xs font-serif px-1 gap-2 text-[#9F927F]">
            <span className="italic truncate">
              {isFeeling ? 'Held privately within your reflections' : 'Sealed & kept in your private archive'}
            </span>
            <span className="shrink-0 tabular-nums">
              {content.length} / {maxLength}
            </span>
          </div>
        </div>

        {/* Error Notification if any */}
        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl border text-xs font-serif"
            style={{
              backgroundColor: 'rgba(110, 62, 66, 0.25)',
              borderColor: '#9F7A3D',
              color: '#F2E8D2',
            }}
          >
            {error}
          </div>
        )}

        {/* Success Confirmation Note */}
        {savedSuccess && (
          <div
            role="status"
            className="p-3.5 rounded-xl border text-xs font-serif flex items-center gap-2.5 animate-fadeIn"
            style={{
              backgroundColor: 'rgba(23, 32, 51, 0.8)',
              borderColor: '#C59A52',
              color: '#F2E8D2',
            }}
          >
            <span className="w-5 h-5 rounded-full bg-[#6E3E42] flex items-center justify-center text-[#F2E8D2] shrink-0">
              <Check className="w-3 h-3" />
            </span>
            <span className="italic">
              Your reflection has been safely inscribed into your private journal.
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 min-h-[44px] rounded-full text-xs sm:text-sm font-serif font-medium shadow-md transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation hover:brightness-110"
            style={{
              backgroundColor: '#6E3E42',
              color: '#F2E8D2',
              border: '1px solid #9F7A3D',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#F2E8D2]" />
                <span>Inscribing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#F2E8D2]" />
                <span>Inscribe in Journal</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
