import React from 'react';
import { Heart, Feather, Sparkles, BookOpen, ArrowRight, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

interface KeepsakeRevealProps {
  type: 'feeling' | 'letter';
  title?: string;
  message: string;
  onReset: () => void;
}

export const KeepsakeReveal: React.FC<KeepsakeRevealProps> = ({
  type,
  title,
  message,
  onReset,
}) => {
  const navigate = useNavigate();

  return (
    <div
      role="region"
      aria-label="Keepsake Confirmation"
      className="relative w-full rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center animate-keepsake-reveal overflow-hidden border shadow-2xl space-y-6 backdrop-blur-md"
      style={{
        backgroundColor: '#172033',
        borderColor: 'rgba(197, 154, 82, 0.3)',
        boxShadow: `
          0 20px 50px -10px rgba(13, 20, 34, 0.9),
          0 0 30px rgba(197, 154, 82, 0.12),
          inset 0 1px 1px rgba(242, 232, 210, 0.08)
        `,
      }}
    >
      {/* Delicate Deckled Inner Inset Frame */}
      <div
        aria-hidden="true"
        className="absolute inset-2.5 sm:inset-3 rounded-xl sm:rounded-2xl border pointer-events-none"
        style={{ borderColor: 'rgba(197, 154, 82, 0.18)' }}
      />

      {/* Antique Corner Star Ornaments */}
      <span aria-hidden="true" className="absolute top-3.5 left-4 text-xs select-none font-serif" style={{ color: '#C59A52', opacity: 0.65 }}>✦</span>
      <span aria-hidden="true" className="absolute top-3.5 right-4 text-xs select-none font-serif" style={{ color: '#C59A52', opacity: 0.65 }}>✦</span>
      <span aria-hidden="true" className="absolute bottom-3.5 left-4 text-xs select-none font-serif" style={{ color: '#C59A52', opacity: 0.65 }}>✦</span>
      <span aria-hidden="true" className="absolute bottom-3.5 right-4 text-xs select-none font-serif" style={{ color: '#C59A52', opacity: 0.65 }}>✦</span>

      {/* Floating Center Icon */}
      <div className="relative z-10 flex justify-center pt-2">
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-md"
          style={{
            backgroundColor: 'rgba(197, 154, 82, 0.12)',
            border: '1px solid #9F7A3D',
            color: '#C59A52',
          }}
        >
          {type === 'feeling' ? (
            <Heart className="w-7 h-7 fill-current" style={{ color: '#C59A52' }} />
          ) : (
            <Feather className="w-7 h-7" style={{ color: '#C59A52' }} />
          )}
        </div>
      </div>

      {/* Chapter Reveal Heading */}
      <div className="relative z-10 space-y-2 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-2">
          <span
            className="text-[11px] sm:text-xs font-serif tracking-[0.2em] uppercase font-medium"
            style={{ color: '#C59A52' }}
          >
            ✦ Sealed & Held Safely ✦
          </span>
        </div>

        <h2
          className="text-2xl sm:text-3xl font-serif tracking-tight leading-snug font-medium"
          style={{ color: '#F2E8D2' }}
        >
          {title || (type === 'feeling' ? 'A Quiet Thought Confided' : 'Your Letter Has Been Sealed')}
        </h2>

        {/* Delicate Ornamental Divider */}
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="w-8 h-px" style={{ backgroundColor: 'rgba(197, 154, 82, 0.25)' }} />
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#C59A52' }} />
          <div className="w-8 h-px" style={{ backgroundColor: 'rgba(197, 154, 82, 0.25)' }} />
        </div>

        <p
          className="text-sm sm:text-base font-serif leading-relaxed italic pt-1"
          style={{ color: '#CDBFA8' }}
        >
          {message}
        </p>
      </div>

      {/* Archival Status Information */}
      <div className="relative z-10 pt-1 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-serif">
        <span className="italic" style={{ color: '#9F927F' }}>
          Your words have been kept safely within your reflections.
        </span>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        {/* Primary Action Button (Soft Burgundy) */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.REFLECTIONS)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-full text-xs sm:text-sm font-serif font-medium shadow-md transition-all duration-200 cursor-pointer group touch-manipulation hover:brightness-110"
          style={{
            backgroundColor: '#6E3E42',
            color: '#F2E8D2',
            border: '1px solid #9F7A3D',
          }}
        >
          <BookOpen className="w-4 h-4" style={{ color: '#F2E8D2' }} />
          <span>Open in Your Reflections</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" style={{ color: '#F2E8D2' }} />
        </button>

        {/* Secondary Action Button (Midnight Blue) */}
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-full text-xs sm:text-sm font-serif transition-all duration-200 cursor-pointer touch-manipulation hover:brightness-115"
          style={{
            backgroundColor: '#172033',
            color: '#E8D8B8',
            border: '1px solid #9F7A3D',
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" style={{ color: '#C59A52' }} />
          <span>{type === 'feeling' ? 'Inscribe another thought' : 'Compose another letter'}</span>
        </button>
      </div>
    </div>
  );
};

