import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { PressedLotus, PressedSunflower } from './PressedBotanicals';
import { playVintageTypingClick } from './sneakPeekAudio';
import { useSfx } from '../../contexts';

interface SneakPeekLetterProps {
  onGetStarted: () => void;
  isClosing?: boolean;
}

const LETTER_PARAGRAPHS = [
  `Sometimes I think about the moments when I hurt you—through my words, my actions, or simply by not being the person you needed me to be. There are things I wish I had done differently, and moments I wish I could go back to. I can't change any of them now, but I can be honest about them. I'm truly sorry for all the times I've hurt you.`,

  `I also wanted to make something with my own hands for your birthday. Something beautiful, something made especially for you. But honestly, I couldn't make something good enough yet. My hands still have a lot to learn, and I hope that someday they'll be able to make the things I imagine.`,

  `So, for now, this website is the best I could pull off. It may not be perfect, but every little part of it was made with you in mind. Maybe someday I'll get better at crafting, and I'll be able to make something that I can proudly place in your hands.`,

  `Until then, I hope this little world I've made for you makes you smile, even if just for a moment.`,

  `Happy Birthday.`,

  `I hope this year brings you more happiness than you expect, more little moments worth remembering, and countless reasons to smile.`,

  `And selfishly, I hope I get to be there for some of those moments.`,
];

export const SneakPeekLetter: React.FC<SneakPeekLetterProps> = ({
  onGetStarted,
  isClosing = false,
}) => {
  const { playSfx, isSfxEnabled, sfxVolume } = useSfx();
  const [currentParagraphIdx, setCurrentParagraphIdx] = useState<number>(0);
  const [currentCharIdx, setCurrentCharIdx] = useState<number>(0);
  const [isTypingFinished, setIsTypingFinished] = useState<boolean>(false);
  const [showGetStarted, setShowGetStarted] = useState<boolean>(false);
  const [isUnfolded, setIsUnfolded] = useState<boolean>(false);

  const letterScrollRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredCompleteSfx = useRef<boolean>(false);

  // Check reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Unfold animation on mount
  useEffect(() => {
    const unfoldTimer = setTimeout(() => {
      setIsUnfolded(true);
    }, 80);
    return () => clearTimeout(unfoldTimer);
  }, []);

  // Main typing engine with fast ~35-45 chars/sec cadence & reliable completion detection
  useEffect(() => {
    if (prefersReducedMotion) {
      // Immediate presentation for reduced motion users
      setCurrentParagraphIdx(LETTER_PARAGRAPHS.length - 1);
      setCurrentCharIdx(LETTER_PARAGRAPHS[LETTER_PARAGRAPHS.length - 1].length);
      setIsTypingFinished(true);
      setShowGetStarted(true);
      if (!hasTriggeredCompleteSfx.current) {
        hasTriggeredCompleteSfx.current = true;
        playSfx('typingComplete');
      }
      return;
    }

    if (!isUnfolded) return;

    if (isTypingFinished) return;

    const currentParaText = LETTER_PARAGRAPHS[currentParagraphIdx];

    if (currentCharIdx < currentParaText.length) {
      const char = currentParaText[currentCharIdx];
      // Target: 35-45 characters per second (average 22-26ms)
      let delay = 24;

      // Small character micro-variation
      if (currentCharIdx % 3 === 0) delay = 22;
      else if (currentCharIdx % 5 === 0) delay = 26;

      // Short punctuation pauses
      if (char === '.' || char === '!' || char === '?') {
        delay = 80;
      } else if (char === ',' || char === '—' || char === '-') {
        delay = 45;
      }

      typingTimerRef.current = setTimeout(() => {
        setCurrentCharIdx((prev) => prev + 1);

        // Subtle vintage typewriter sound (every 4th character or word break)
        if (char === ' ' || currentCharIdx % 4 === 0) {
          playVintageTypingClick(isSfxEnabled, sfxVolume);
        }

        // Auto-scroll as text flows
        if (letterScrollRef.current) {
          letterScrollRef.current.scrollTop = letterScrollRef.current.scrollHeight;
        }
      }, delay);
    } else {
      // Current paragraph completed
      if (currentParagraphIdx < LETTER_PARAGRAPHS.length - 1) {
        // Short paragraph break pause (~280ms)
        typingTimerRef.current = setTimeout(() => {
          setCurrentParagraphIdx((prev) => prev + 1);
          setCurrentCharIdx(0);
        }, 280);
      } else {
        // Final paragraph and final character typed: TYPING COMPLETE!
        setIsTypingFinished(true);

        if (!hasTriggeredCompleteSfx.current) {
          hasTriggeredCompleteSfx.current = true;
          playSfx('typingComplete');
        }

        // Short final pause before smoothly fading in Get Started
        pauseTimerRef.current = setTimeout(() => {
          setShowGetStarted(true);
        }, 450);
      }
    }

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [
    isUnfolded,
    currentParagraphIdx,
    currentCharIdx,
    isTypingFinished,
    isSfxEnabled,
    sfxVolume,
    playSfx,
    prefersReducedMotion,
  ]);

  // Clean up any remaining pause timer on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative w-full max-w-2xl mx-auto px-2 sm:px-4 transition-all duration-600 ease-out transform-gpu ${
        isUnfolded
          ? isClosing
            ? 'scale-95 opacity-0 -translate-y-4'
            : 'scale-100 opacity-100 translate-y-0'
          : 'scale-95 opacity-0 translate-y-4'
      }`}
    >
      {/* 
        Physical Paper Container:
        Structure:
          ├── Header (Title & Date)
          ├── Scrollable letter content
          └── Footer (Heart signature & Get Started Action)
      */}
      <div
        className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 bg-[#FAF6EE] text-[#3A2D24] border border-[#E5D7C7] shadow-[0_16px_40px_-12px_rgba(60,40,25,0.14),0_2px_8px_rgba(0,0,0,0.03)] flex flex-col max-h-[85vh] sm:max-h-[88vh]"
        style={{
          backgroundImage: `radial-gradient(#E5D5C2 0.65px, transparent 0.65px), radial-gradient(#EFE2D2 0.65px, #FAF6EE 0.65px)`,
          backgroundSize: `24px 24px, 24px 24px`,
          backgroundPosition: `0 0, 12px 12px`,
        }}
      >
        {/* Subtle Pressed Botanical Flora (Left: Lotus, Right: Sunflower) */}
        <div className="absolute -top-3.5 -left-2.5 sm:-top-5 sm:-left-4 pointer-events-none transform -rotate-6">
          <PressedLotus size={46} />
        </div>
        <div className="absolute -top-3.5 -right-2.5 sm:-top-5 sm:-right-4 pointer-events-none transform rotate-6">
          <PressedSunflower size={46} />
        </div>

        {/* Vintage Date Header */}
        <div className="flex items-center justify-between border-b border-[#E3D4C2] pb-2.5 mb-4 sm:mb-6 text-xs font-serif text-[#7D6B5E] shrink-0">
          <span className="italic tracking-wider">A letter for you</span>
          <span className="font-mono tracking-widest text-[11px] sm:text-xs text-[#8A7667] font-medium">
            27/09/2026
          </span>
        </div>

        {/* Scrollable Letter Content Body */}
        <div
          ref={letterScrollRef}
          tabIndex={0}
          aria-label="Personal Letter Content"
          className="flex-1 overflow-y-auto pr-2 sm:pr-3 space-y-3.5 sm:space-y-4 text-[14.5px] sm:text-[15.5px] leading-relaxed sm:leading-[1.75] font-serif text-[#362920] select-text focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8C6B5E] rounded"
        >
          {LETTER_PARAGRAPHS.map((fullPara, paraIndex) => {
            if (paraIndex > currentParagraphIdx) {
              return null;
            }

            const isCurrent = paraIndex === currentParagraphIdx;
            const displayedText = isCurrent
              ? fullPara.slice(0, currentCharIdx)
              : fullPara;

            return (
              <p
                key={paraIndex}
                className={`${
                  paraIndex === 4
                    ? 'font-medium italic text-[#5C2A36] text-[15px] sm:text-[17px] pt-1 pb-0.5'
                    : ''
                }`}
              >
                {isCurrent && !isTypingFinished ? (
                  <>
                    <span>{displayedText}</span>
                    {/* Blinking vintage typewriter cursor */}
                    <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#7D525D] opacity-75 animate-pulse align-middle" />
                  </>
                ) : (
                  <span>{displayedText}</span>
                )}
              </p>
            );
          })}
        </div>

        {/* Letter Footer / Action Area */}
        <div className="mt-4 pt-3 border-t border-[#E8DAC9]/70 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 min-h-[48px]">
          {/* Stamped Heart Accent */}
          <div
            className={`flex items-center gap-1.5 text-xs font-serif italic text-[#7D626C] transition-opacity duration-300 ${
              isTypingFinished || prefersReducedMotion ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-[#B87A87]/30 text-[#9E5A68]" />
            <span className="text-[12.5px]">With all my love</span>
          </div>

          {/* Clean, Restrained "Get Started" Action Button */}
          <div
            className={`transition-all duration-400 ease-out ${
              showGetStarted
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <button
              type="button"
              id="sneak-peek-get-started-btn"
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-2.5 rounded-full bg-[#FAF6EE] hover:bg-[#FFFDF9] text-[#362920] font-serif text-sm tracking-wide border border-[#DFCFC0] shadow-[0_3px_12px_rgba(70,45,30,0.1)] hover:shadow-[0_5px_16px_rgba(70,45,30,0.15)] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6B5E] cursor-pointer select-none"
            >
              <span className="relative z-10 flex items-center gap-1.5 text-[#3A2D24]">
                <span>Get Started</span>
                <Sparkles className="w-3.5 h-3.5 text-[#8C6B5E]" />
              </span>
            </button>
          </div>
        </div>

        {/* Subtle Horizontal Crease Guide */}
        <div
          className="absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-[#E0D0BE]/50 to-transparent pointer-events-none opacity-30"
          aria-hidden="true"
        />
      </div>

      {/* Extremely subtle dissolve particles on Get Started click */}
      {isClosing && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#D4C3B2] opacity-40 animate-ping"
              style={{
                width: '4px',
                height: '4px',
                left: `${25 + (i * 12) % 50}%`,
                top: `${30 + (i * 10) % 40}%`,
                animationDuration: '500ms',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

