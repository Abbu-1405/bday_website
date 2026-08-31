import React from 'react';
import { Sparkles } from 'lucide-react';

interface SneakPeekLandingProps {
  onOpenLetter: () => void;
  onSkip: () => void;
  isOpening?: boolean;
}

export const SneakPeekLanding: React.FC<SneakPeekLandingProps> = ({
  onOpenLetter,
  onSkip,
  isOpening = false,
}) => {
  return (
    <div
      className={`relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-md mx-auto transition-all duration-600 ease-out ${
        isOpening ? 'opacity-0 scale-95 pointer-events-none -translate-y-3' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle minimalist emblem */}
      <div className="mb-5 inline-flex items-center justify-center p-2.5 rounded-full bg-[#FAF6EE]/80 border border-[#E3D7C7] shadow-sm">
        <Sparkles className="w-4 h-4 text-[#8C6B5E]" />
      </div>

      {/* Primary Greeting */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal italic text-[#382B22] tracking-tight mb-8 leading-snug select-none">
        I made something for you
      </h1>

      {/* Sneak a Peek Invitation Button */}
      <button
        type="button"
        id="sneak-peek-open-btn"
        onClick={onOpenLetter}
        className="group relative inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#FAF6EE] hover:bg-[#FFFDF9] text-[#382B22] font-serif text-sm sm:text-base tracking-wide border border-[#DFCFC0] shadow-[0_4px_16px_rgba(70,45,30,0.08)] hover:shadow-[0_6px_20px_rgba(70,45,30,0.12)] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6B5E] cursor-pointer select-none"
      >
        <span className="relative z-10 flex items-center gap-2">
          <span>Sneak a Peek</span>
          <span className="text-[#8C6B5E] group-hover:translate-x-0.5 transition-transform duration-200">
            ✨
          </span>
        </span>
      </button>

      {/* Skip Option */}
      <button
        type="button"
        id="sneak-peek-skip-btn"
        onClick={onSkip}
        className="mt-5 text-xs font-serif italic tracking-wider text-[#7D6B5E] hover:text-[#382B22] transition-colors duration-200 py-1.5 px-3 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-[#7D6B5E] hover:underline underline-offset-4 cursor-pointer select-none"
      >
        Skip &rarr;
      </button>
    </div>
  );
};

