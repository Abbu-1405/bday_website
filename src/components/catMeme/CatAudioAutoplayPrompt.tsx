import React, { useEffect, useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { CatAudioService } from '../../services/catInteraction/CatAudioService';

export interface CatAudioAutoplayPromptProps {
  enabled?: boolean;
}

/**
 * Lightweight, non-intrusive prompt rendered when browser autoplay policy
 * prevents synthesized cat audio from playing until user interaction.
 */
export const CatAudioAutoplayPrompt: React.FC<CatAudioAutoplayPromptProps> = ({
  enabled = true,
}) => {
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled) {
      setIsBlocked(false);
      return;
    }

    const audioService = CatAudioService.getInstance();
    const unsubscribe = audioService.subscribe((state) => {
      setIsBlocked(state.autoplayBlocked);
    });

    return () => {
      unsubscribe();
    };
  }, [enabled]);

  if (!enabled || !isBlocked || isDismissed) {
    return null;
  }

  const handleEnableAudio = async () => {
    await CatAudioService.getInstance().enableAudio();
    setIsBlocked(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <aside
      aria-label="Cat audio notification"
      id="cat-audio-autoplay-prompt"
      className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-[#141720]/95 border border-orange-500/40 text-orange-200 shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-md text-xs animate-bounce duration-1000 select-none"
    >
      <button
        id="enable-cat-audio-btn"
        onClick={handleEnableAudio}
        className="flex items-center gap-1.5 font-medium hover:text-white transition-colors cursor-pointer"
        title="Click to enable cat sound effects"
      >
        <Volume2 className="w-4 h-4 text-orange-400 animate-pulse" />
        <span>Enable Cat Sounds 🔊</span>
      </button>

      <button
        id="dismiss-cat-audio-prompt-btn"
        onClick={handleDismiss}
        aria-label="Dismiss cat audio prompt"
        className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors ml-1"
      >
        <X className="w-3 h-3" />
      </button>
    </aside>
  );
};
