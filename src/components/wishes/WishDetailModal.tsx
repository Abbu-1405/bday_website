import React, { useEffect, useMemo } from 'react';
import { Sparkles, Heart, X, ArrowRight, ArrowLeft, Moon } from 'lucide-react';
import { Wish } from '../../types';
import { useTheme } from '../../hooks';
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
  const { theme } = useTheme();

  // Theme-specific parchment styling and palette
  const themeParchment = useMemo(() => {
    if (theme === 'letter-archive') {
      return {
        bg: '#F5ECE1',
        bgGradient: `
          radial-gradient(ellipse at 50% 0%, rgba(255, 252, 245, 0.96) 0%, rgba(245, 236, 225, 0.88) 50%, rgba(235, 222, 206, 0.96) 100%),
          radial-gradient(circle at 10% 20%, rgba(200, 170, 140, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(200, 170, 140, 0.18) 0%, transparent 40%)
        `,
        border: '1px solid rgba(175, 135, 95, 0.45)',
        innerBorder: 'border-[#B89264]/30',
        cornerStar: 'text-[#8C5E32]/55',
        headerText: 'text-[#7A2E3B]',
        titleText: 'text-[#2D1E1B]',
        bodyText: 'text-[#3A2A26]',
        divider: 'border-[#C4A47C]/35',
        heart: 'text-[#7A2E3B]',
        statusText: 'text-[#6B4D3C]',
        navText: 'text-[#6B4D3C] hover:text-[#2D1E1B]',
        navDisabled: 'text-[#6B4D3C]/35',
        buttonBg: 'bg-[#7A2E3B]/10 hover:bg-[#7A2E3B]/20 text-[#63222D] hover:text-[#42141C] border-[#7A2E3B]/30',
        buttonIcon: 'text-[#7A2E3B]',
        closeBtn: 'text-[#7A2E3B]/70 hover:text-[#2D1E1B] hover:bg-[#7A2E3B]/10',
        glowAura: 'bg-[#E5B578]/25',
      };
    }
    if (theme === 'whimsical-scrapbook') {
      return {
        bg: '#F6F2E2',
        bgGradient: `
          radial-gradient(ellipse at 50% 0%, rgba(255, 254, 248, 0.96) 0%, rgba(246, 242, 226, 0.88) 50%, rgba(235, 230, 210, 0.96) 100%),
          radial-gradient(circle at 10% 20%, rgba(180, 205, 160, 0.16) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(180, 205, 160, 0.18) 0%, transparent 40%)
        `,
        border: '1px solid rgba(130, 160, 115, 0.45)',
        innerBorder: 'border-[#92B580]/30',
        cornerStar: 'text-[#4D6E42]/55',
        headerText: 'text-[#2E452C]',
        titleText: 'text-[#182618]',
        bodyText: 'text-[#263626]',
        divider: 'border-[#A2C293]/35',
        heart: 'text-[#2E452C]',
        statusText: 'text-[#455E42]',
        navText: 'text-[#455E42] hover:text-[#182618]',
        navDisabled: 'text-[#455E42]/35',
        buttonBg: 'bg-[#2E452C]/10 hover:bg-[#2E452C]/20 text-[#223520] hover:text-[#132212] border-[#2E452C]/30',
        buttonIcon: 'text-[#2E452C]',
        closeBtn: 'text-[#2E452C]/70 hover:text-[#182618] hover:bg-[#2E452C]/10',
        glowAura: 'bg-[#BFE096]/20',
      };
    }
    // Default: midnight-journal
    return {
      bg: '#F3E5CB',
      bgGradient: `
        radial-gradient(ellipse at 50% 0%, rgba(255, 252, 240, 0.95) 0%, rgba(244, 230, 202, 0.85) 50%, rgba(230, 210, 175, 0.95) 100%),
        radial-gradient(circle at 10% 20%, rgba(217, 190, 145, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(217, 190, 145, 0.18) 0%, transparent 40%)
      `,
      border: '1px solid rgba(190, 145, 85, 0.5)',
      innerBorder: 'border-[#C8A26A]/30',
      cornerStar: 'text-[#A67C38]/55',
      headerText: 'text-[#7A5C3E]',
      titleText: 'text-[#2F1D0E]',
      bodyText: 'text-[#3B2A20]',
      divider: 'border-[#C8A060]/30',
      heart: 'text-[#9A422D]',
      statusText: 'text-[#7A5C3E]',
      navText: 'text-[#7A5C3E] hover:text-[#3B2A20]',
      navDisabled: 'text-[#7A5C3E]/35',
      buttonBg: 'bg-[#D4A760]/20 hover:bg-[#D4A760]/35 text-[#5A3314] hover:text-[#2E1606] border-[#B58A45]/40',
      buttonIcon: 'text-[#7A5C3E]',
      closeBtn: 'text-[#7A4F28]/70 hover:text-[#3B2A20] hover:bg-[#B58A45]/15',
      glowAura: 'bg-amber-400/20',
    };
  }, [theme]);

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
        className="fixed inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-500 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Modal Presentation Wrapper (Centering & Caught Lantern Alignment) */}
      <div className="relative z-10 w-[92vw] sm:w-full max-w-[560px] sm:max-w-[600px] my-auto flex flex-col items-center">
        
        {/* Soft Golden Candlelight Radiance Behind Parchment */}
        <div
          aria-hidden="true"
          className={`absolute -top-14 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full ${themeParchment.glowAura} blur-[60px] pointer-events-none animate-golden-aura`}
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
          className="relative w-full rounded-2xl sm:rounded-3xl p-5 sm:p-9 pt-8 sm:pt-11 animate-parchment-reveal max-h-[82vh] sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl transition-all duration-300"
          style={{
            backgroundColor: themeParchment.bg,
            backgroundImage: themeParchment.bgGradient,
            boxShadow: `
              0 24px 70px -15px rgba(0, 0, 0, 0.75),
              0 0 50px rgba(245, 195, 100, 0.25),
              inset 0 0 45px rgba(210, 170, 115, 0.22),
              inset 0 1px 2px rgba(255, 255, 255, 0.75)
            `,
            border: themeParchment.border,
          }}
        >
          {/* Subtle Deckled Parchment Inset Frame */}
          <div
            aria-hidden="true"
            className={`absolute inset-2 sm:inset-3 rounded-xl sm:rounded-2xl border ${themeParchment.innerBorder} pointer-events-none`}
          />

          {/* Delicate Antique Corner Star Accents */}
          <span aria-hidden="true" className={`absolute top-3.5 left-4 text-xs ${themeParchment.cornerStar} select-none font-serif`}>✦</span>
          <span aria-hidden="true" className={`absolute top-3.5 right-4 text-xs ${themeParchment.cornerStar} select-none font-serif`}>✦</span>
          <span aria-hidden="true" className={`absolute bottom-3.5 left-4 text-xs ${themeParchment.cornerStar} select-none font-serif`}>✦</span>
          <span aria-hidden="true" className={`absolute bottom-3.5 right-4 text-xs ${themeParchment.cornerStar} select-none font-serif`}>✦</span>

          {/* Top-Right Close Button (Subtle, Accessible Touch Target) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wish"
            className={`absolute top-2.5 sm:top-4 right-2.5 sm:right-4 w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${themeParchment.closeBtn} transition-colors cursor-pointer z-10 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current`}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable Parchment Interior */}
          <div className="overflow-y-auto wish-parchment-scroll pr-1 sm:pr-2 space-y-4 sm:space-y-5 relative z-10">
            
            {/* Archival Inscription Header */}
            <div className={`text-center space-y-1.5 pb-3 border-b ${themeParchment.divider} relative`}>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-[11px] sm:text-xs font-serif tracking-[0.18em] uppercase ${themeParchment.headerText} font-medium`}>
                  ✦ Wish № {formattedNumber} · {wish.category} ✦
                </span>
              </div>

              {/* Wish Title in Personal Handwritten/Literary Serif */}
              <h2
                id="wish-detail-title"
                className={`text-xl sm:text-3xl font-serif ${themeParchment.titleText} tracking-tight leading-snug font-medium break-words`}
              >
                {wish.title}
              </h2>
            </div>

            {/* Inscribed Wish Body - Directly on Illuminated Parchment Surface */}
            <div className="relative py-2 px-1 sm:px-2">
              <p className={`relative z-10 ${themeParchment.bodyText} font-serif text-[15px] sm:text-[17px] leading-[1.75] sm:leading-[1.8] whitespace-pre-line text-left italic break-words [overflow-wrap:anywhere]`}>
                {wish.content}
              </p>
            </div>

            {/* Subtle Archival Information & Status */}
            <div className={`pt-3 border-t ${themeParchment.divider} space-y-3`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
                {/* Archival Collected State Note */}
                <div className={`flex items-center gap-1.5 text-xs font-serif ${themeParchment.statusText}`}>
                  <Heart className={`w-3.5 h-3.5 ${themeParchment.heart} fill-current shrink-0 opacity-85`} />
                  <span className="italic">Kept safely in your starlit collection</span>
                </div>

                {/* Subtle Correspondence-Style Previous / Next Navigation */}
                {allWishes.length > 1 && onSelectWish && (
                  <div className="flex items-center gap-3 text-xs font-serif">
                    {prevWish ? (
                      <button
                        type="button"
                        onClick={() => onSelectWish(prevWish)}
                        className={`inline-flex items-center gap-1 py-1.5 px-2 -mx-2 ${themeParchment.navText} transition-colors cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current rounded-sm`}
                        title={`Previous: ${prevWish.title}`}
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>
                    ) : (
                      <span className={`inline-flex items-center gap-1 py-1.5 px-2 -mx-2 ${themeParchment.navDisabled}`}>
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </span>
                    )}

                    <span className="opacity-40 select-none">·</span>

                    {nextWish ? (
                      <button
                        type="button"
                        onClick={() => onSelectWish(nextWish)}
                        className={`inline-flex items-center gap-1 py-1.5 px-2 -mx-2 ${themeParchment.navText} transition-colors cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current rounded-sm`}
                        title={`Next: ${nextWish.title}`}
                      >
                        <span>Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className={`inline-flex items-center gap-1 py-1.5 px-2 -mx-2 ${themeParchment.navDisabled}`}>
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
                  className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs sm:text-sm font-serif font-medium ${themeParchment.buttonBg} border shadow-xs transition-all duration-200 cursor-pointer group touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current`}
                >
                  <span>Return to the lanterns</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${themeParchment.buttonIcon}`} />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

