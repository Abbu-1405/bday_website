import React, { useEffect, useState } from 'react';
import { Sparkles, X, Egg } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  EasterEggService,
  EasterEggToastPayload,
} from '../../services/catInteraction/EasterEggService';
import { ROUTES } from '../../constants';

export interface CatEasterEggToastProps {
  enabled?: boolean;
}

/**
 * Phase 8: Non-intrusive notification toast displayed when an Easter egg
 * is discovered for the first time.
 */
export const CatEasterEggToast: React.FC<CatEasterEggToastProps> = ({
  enabled = true,
}) => {
  const [currentToast, setCurrentToast] = useState<EasterEggToastPayload | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) {
      setCurrentToast(null);
      return;
    }

    const unsubscribe = EasterEggService.getInstance().subscribeToast((payload) => {
      setCurrentToast(payload);
    });

    return () => {
      unsubscribe();
    };
  }, [enabled]);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (!currentToast) return;
    const timer = setTimeout(() => {
      setCurrentToast(null);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [currentToast]);

  if (!enabled || !currentToast) {
    return null;
  }

  const handleViewCollection = () => {
    setCurrentToast(null);
    navigate(ROUTES.SETTINGS); // Users can navigate to collection or settings
  };

  return (
    <aside
      id="cat-easter-egg-toast"
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#0F121A]/95 border border-amber-500/50 rounded-2xl p-4 shadow-[0_8px_32px_rgba(245,158,11,0.25)] backdrop-blur-md text-slate-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
          <Sparkles className="w-5 h-5 animate-spin duration-3000" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            <Egg className="w-3.5 h-3.5" />
            <span>Easter Egg Discovered!</span>
          </div>

          <h4 className="text-sm font-bold text-white mt-0.5 truncate">
            {currentToast.title}
          </h4>

          <p className="text-xs text-slate-300 mt-1 italic leading-relaxed line-clamp-2">
            "{currentToast.caption}"
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              🐾 {currentToast.catDisplayName}
            </span>
          </div>
        </div>

        <button
          id="dismiss-easter-egg-toast-btn"
          onClick={() => setCurrentToast(null)}
          aria-label="Dismiss Easter egg discovery toast"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
