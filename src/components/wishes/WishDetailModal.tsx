import React, { useEffect } from 'react';
import { Sparkles, Heart, X, ArrowRight, ArrowLeft, Moon } from 'lucide-react';
import { Wish } from '../../types';
import './wishes.css';

export interface WishDetailModalProps {
  wish: Wish | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectWish?: (wish: Wish) => void;
  allWishes?: Wish[];
}

export const WishDetailModal: React.FC<WishDetailModalProps> = ({
  wish,
  isOpen,
  onClose,
  onSelectWish,
  allWishes = [],
}) => {
  // Lock body scroll and listen for Keyboard shortcuts (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !wish) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onSelectWish && allWishes.length > 1) {
        const currentIndex = allWishes.findIndex((w) => w.id === wish.id);
        if (currentIndex > 0) {
          onSelectWish(allWishes[currentIndex - 1]);
        }
      } else if (e.key === 'ArrowRight' && onSelectWish && allWishes.length > 1) {
        const currentIndex = allWishes.findIndex((w) => w.id === wish.id);
        if (currentIndex < allWishes.length - 1) {
          onSelectWish(allWishes[currentIndex + 1]);
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, wish, onClose, onSelectWish, allWishes]);

  if (!isOpen || !wish) return null;

  const formattedNumber = String(wish.number).padStart(2, '0');
  const currentIndex = allWishes.findIndex((w) => w.id === wish.id);
  const prevWish = currentIndex > 0 ? allWishes[currentIndex - 1] : null;
  const nextWish = currentIndex >= 0 && currentIndex < allWishes.length - 1 ? allWishes[currentIndex + 1] : null;

  return (
    <div
      id="wish-detail-modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wish-detail-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* 1. Cinematic Quiet Night Backdrop - Keeps floating lanterns & stars dimly visible */}
      <div
        className="fixed inset-0 bg-[#040612]/65 backdrop-blur-[1px] transition-opacity duration-500 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Modal Presentation Wrapper (Centering & Caught Lantern Alignment) */}
      <div className="relative z-10 w-[92vw] sm:w-full max-w-[560px] sm:max-w-[600px] my-auto flex flex-col items-center">
        
        {/* Soft Golden Candlelight Radiance Behind Parchment */}
        <div
          aria-hidden="true"
          className="absolute -top-14 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full bg-amber-400/20 blur-[60px] pointer-events-none animate-golden-aura"
        />

        {/* 3. The Caught Sky Lantern (Floats down gently and illuminates the wish parchment) */}
        <div className="relative z-20 -mb-6 sm:-mb-8 animate-caught-lantern">
          <div className="relative w-[64px] h-[84px] sm:w-[76px] sm:h-[98px] drop-shadow-[0_10px_25px_rgba(245,185,75,0.65)]">
            <svg
              viewBox="0 0 100 130"
              className="w-full h-full overflow-visible select-none pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="caught-lantern-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.96" />
                  <stop offset="40%" stopColor="#F9E8C2" stopOpacity="0.92" />
                  <stop offset="85%" stopColor="#EBC37E" stopOpacity="0.96" />
                  <stop offset="100%" stopColor="#DFB063" stopOpacity="0.98" />
                </linearGradient>

                <radialGradient id="caught-lantern-glow" cx="50%" cy="75%" r="65%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
                  <stop offset="35%" stopColor="#FFF2B8" stopOpacity="0.85" />
                  <stop offset="70%" stopColor="#F8B84E" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#DF8B2E" stopOpacity="0.0" />
                </radialGradient>

                <radialGradient id="caught-flame-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="40%" stopColor="#FFE066" stopOpacity="0.9" />
                  <stop offset="75%" stopColor="#FF9F1C" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#E76F51" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Lantern Translucent Paper Body */}
              <path
                d="M 28,12 C 16,36 14,72 23,106 C 36,113 64,113 77,106 C 86,72 84,36 72,12 C 61,8 39,8 28,12 Z"
                fill="url(#caught-lantern-grad)"
                stroke="rgba(120, 75, 30, 0.38)"
                strokeWidth="0.8"
              />

              {/* Internal Candlelight Layer */}
              <path
                d="M 29,13 C 18,37 16,71 24,105 C 37,112 63,112 76,105 C 84,71 82,37 71,13 C 60,9 40,9 29,13 Z"
                fill="url(#caught-lantern-glow)"
                className="animate-paper-breathe"
              />

              {/* Structural Bamboo Ribs */}
              <g stroke="rgba(165, 110, 50, 0.24)" strokeWidth="0.75" fill="none">
                <path d="M 37,10.5 C 28,40 28,78 35,108" />
                <path d="M 44,9.5 C 42,42 42,76 45,109.5" />
                <path d="M 56,9.5 C 58,42 58,76 55,109.5" />
                <path d="M 63,10.5 C 72,40 72,78 65,108" />
              </g>

              {/* Top Aperture Rim */}
              <ellipse cx="50" cy="11.5" rx="22" ry="3.5" fill="#6B4423" fillOpacity="0.85" />
              <ellipse cx="50" cy="11" rx="18" ry="2.2" fill="#2A160A" fillOpacity="0.75" />

              {/* Bottom Aperture & Fuel Rim */}
              <ellipse cx="50" cy="107" rx="27" ry="4.5" fill="#6B4423" fillOpacity="0.9" />
              <ellipse cx="50" cy="107.5" rx="23" ry="3.2" fill="#1F0F06" fillOpacity="0.85" />

              {/* Flame Core */}
              <g className="animate-wish-flame" style={{ transformOrigin: '50px 105px' }}>
                <circle cx="50" cy="102" r="6" fill="url(#caught-flame-glow)" opacity="0.9" />
                <path d="M 50,96 C 47.5,101 47,104 50,105.5 C 53,104 52.5,101 50,96 Z" fill="#FFF9E6" stroke="#FFB703" strokeWidth="0.4" />
                <circle cx="50" cy="103" r="1.2" fill="#FFFFFF" />
              </g>

              {/* Inscribed Wish Number */}
              <text
                x="50"
                y="60"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#5C381E"
                style={{
                  fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  filter: 'drop-shadow(0px 1px 1px rgba(255, 240, 200, 0.7))',
                }}
              >
                {formattedNumber}
              </text>
            </svg>
          </div>
        </div>

        {/* 4. Illuminated Vintage Parchment Sheet */}
        <div
          className="relative w-full rounded-2xl sm:rounded-3xl p-5 sm:p-9 pt-8 sm:pt-11 text-[#3B2A20] animate-parchment-reveal max-h-[82vh] sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
          style={{
            backgroundColor: '#F3E5CB',
            backgroundImage: `
              radial-gradient(ellipse at 50% 0%, rgba(255, 252, 240, 0.95) 0%, rgba(244, 230, 202, 0.85) 50%, rgba(230, 210, 175, 0.95) 100%),
              radial-gradient(circle at 10% 20%, rgba(217, 190, 145, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(217, 190, 145, 0.18) 0%, transparent 40%)
            `,
            boxShadow: `
              0 24px 70px -15px rgba(0, 0, 0, 0.75),
              0 0 50px rgba(245, 195, 100, 0.3),
              inset 0 0 45px rgba(210, 170, 115, 0.28),
              inset 0 1px 2px rgba(255, 255, 255, 0.75)
            `,
            border: '1px solid rgba(190, 145, 85, 0.5)',
          }}
        >
          {/* Subtle Deckled Parchment Inset Frame */}
          <div
            aria-hidden="true"
            className="absolute inset-2 sm:inset-3 rounded-xl sm:rounded-2xl border border-[#C8A26A]/30 pointer-events-none"
          />

          {/* Delicate Antique Corner Star Accents */}
          <span aria-hidden="true" className="absolute top-3.5 left-4 text-xs text-[#A67C38]/55 select-none font-serif">✦</span>
          <span aria-hidden="true" className="absolute top-3.5 right-4 text-xs text-[#A67C38]/55 select-none font-serif">✦</span>
          <span aria-hidden="true" className="absolute bottom-3.5 left-4 text-xs text-[#A67C38]/55 select-none font-serif">✦</span>
          <span aria-hidden="true" className="absolute bottom-3.5 right-4 text-xs text-[#A67C38]/55 select-none font-serif">✦</span>

          {/* Top-Right Close Button (Subtle, Accessible Touch Target) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wish"
            className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#7A4F28]/70 hover:text-[#3B2A20] hover:bg-[#B58A45]/15 transition-colors cursor-pointer z-10 touch-manipulation"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable Parchment Interior */}
          <div className="overflow-y-auto wish-parchment-scroll pr-1 sm:pr-2 space-y-4 sm:space-y-5 relative z-10">
            
            {/* Archival Inscription Header */}
            <div className="text-center space-y-1.5 pb-3 border-b border-[#C8A060]/30 relative">
              <div className="flex items-center justify-center gap-2">
                <span className="text-[11px] sm:text-xs font-serif tracking-[0.18em] uppercase text-[#7A5C3E]">
                  ✦ Wish № {formattedNumber} · {wish.category} ✦
                </span>
              </div>

              {/* Wish Title in Personal Handwritten/Literary Serif */}
              <h2
                id="wish-detail-title"
                className="text-xl sm:text-3xl font-serif text-[#2F1D0E] tracking-tight leading-snug font-medium"
              >
                {wish.title}
              </h2>
            </div>

            {/* Inscribed Wish Body - Directly on Illuminated Parchment Surface */}
            <div className="relative py-2 px-1 sm:px-2">
              <p className="relative z-10 text-[#3B2A20] font-serif text-[15px] sm:text-[17px] leading-[1.75] sm:leading-[1.8] whitespace-pre-line text-left italic">
                {wish.content}
              </p>
            </div>

            {/* Subtle Archival Information & Status */}
            <div className="pt-3 border-t border-[#C8A060]/30 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
                {/* Archival Collected State Note */}
                <div className="flex items-center gap-1.5 text-xs font-serif text-[#7A5C3E]">
                  <Heart className="w-3.5 h-3.5 text-[#9A422D] fill-current shrink-0 opacity-80" />
                  <span className="italic">Kept safely in your starlit collection</span>
                </div>

                {/* Subtle Correspondence-Style Previous / Next Navigation */}
                {allWishes.length > 1 && onSelectWish && (
                  <div className="flex items-center gap-3 text-xs font-serif text-[#7A5C3E]">
                    {prevWish ? (
                      <button
                        type="button"
                        onClick={() => onSelectWish(prevWish)}
                        className="inline-flex items-center gap-1 py-1.5 px-2 -mx-2 hover:text-[#3B2A20] transition-colors cursor-pointer touch-manipulation"
                        title={`Previous: ${prevWish.title}`}
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>
                    ) : (
                      <span className="opacity-30 inline-flex items-center gap-1 py-1.5 px-2 -mx-2">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </span>
                    )}

                    <span className="text-[#C8A060]/50 select-none">·</span>

                    {nextWish ? (
                      <button
                        type="button"
                        onClick={() => onSelectWish(nextWish)}
                        className="inline-flex items-center gap-1 py-1.5 px-2 -mx-2 hover:text-[#3B2A20] transition-colors cursor-pointer touch-manipulation"
                        title={`Next: ${nextWish.title}`}
                      >
                        <span>Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="opacity-30 inline-flex items-center gap-1 py-1.5 px-2 -mx-2">
                        <span>Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Literary Return Action */}
              <div className="flex justify-center sm:justify-end pt-1">
                <button
                  type="button"
                  id="return-to-lanterns-button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs sm:text-sm font-serif font-medium text-[#5A3314] hover:text-[#2E1606] bg-[#D4A760]/20 hover:bg-[#D4A760]/35 border border-[#B58A45]/40 shadow-xs transition-all duration-200 cursor-pointer group touch-manipulation"
                >
                  <span>Return to the lanterns</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-[#7A5C3E]" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

