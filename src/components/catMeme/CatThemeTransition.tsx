import React, { useState, useEffect } from 'react';
import { OrangeCatIcon } from './OrangeCatIcon';
import { Sparkles, X } from 'lucide-react';

export interface CatThemeTransitionProps {
  onComplete?: () => void;
  duration?: number;
}

export const CatThemeTransition: React.FC<CatThemeTransitionProps> = ({
  onComplete,
  duration = 2600,
}) => {
  const [step, setStep] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      // Complete immediately for users preferring reduced motion
      const quickTimer = setTimeout(() => {
        setIsDismissed(true);
        onComplete?.();
      }, 400);
      return () => clearTimeout(quickTimer);
    }

    // Progression of the lightweight playful sequence
    const t1 = setTimeout(() => setStep(1), 500);  // "Finding one brain cell..."
    const t2 = setTimeout(() => setStep(2), 1400); // "ERROR: Brain cell not found."
    const t3 = setTimeout(() => {
      setIsDismissed(true);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [duration, onComplete]);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onComplete?.();
  };

  return (
    <div
      role="dialog"
      aria-label="Theme transition"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-opacity duration-300 p-4"
      onClick={handleDismiss}
    >
      <div
        className="relative max-w-sm w-full bg-[#12141A] border border-[#F97316]/30 rounded-2xl p-6 text-center shadow-[0_12px_40px_rgba(249,115,22,0.25)] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Skip button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          aria-label="Skip transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Unhinged Cat Icon */}
        <div className="w-16 h-16 rounded-full bg-[#F97316]/15 border border-[#F97316]/40 flex items-center justify-center mb-4 relative animate-bounce">
          <OrangeCatIcon size={36} className="w-9 h-9" />
          <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        {/* Cinematic Text Hierarchy */}
        <span className="text-[11px] font-mono tracking-widest text-[#F97316] uppercase font-bold mb-1">
          Cat Theme Initializing...
        </span>
        <h3 className="text-xl font-bold text-white mb-3">ONE BRAIN CELL 🧠🐱</h3>

        <div className="min-h-[48px] flex items-center justify-center">
          {step === 0 && (
            <p className="text-xs text-slate-300 animate-pulse font-mono">
              Summoning cats & establishing orange energy...
            </p>
          )}
          {step === 1 && (
            <p className="text-xs text-amber-300 font-mono">
              Scanning universe... Finding one brain cell... 📡
            </p>
          )}
          {step >= 2 && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-orange-400 font-mono font-bold bg-orange-950/60 border border-orange-500/30 px-2 py-0.5 rounded">
                ERROR: Brain cell not found 💀
              </span>
              <span className="text-[10px] text-slate-400">Proceeding with pure chaos anyway</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="mt-5 text-xs text-slate-400 hover:text-[#F97316] underline underline-offset-4 cursor-pointer transition-colors"
        >
          Click anywhere or press Esc to enter
        </button>
      </div>
    </div>
  );
};
