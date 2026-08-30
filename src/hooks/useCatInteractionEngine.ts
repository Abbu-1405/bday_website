import { useCallback } from 'react';
import { useTheme } from './useTheme';
import { CatGenericReaction, CatReactionOptions } from '../types/catMeme';
import { CatEventManager } from '../services/catInteraction/CatEventManager';

export interface UseCatInteractionEngineReturn {
  isCatThemeActive: boolean;
  triggerCatReaction: (
    type: CatGenericReaction,
    options?: Partial<CatReactionOptions>
  ) => void;
}

/**
 * Hook to interact with the Cat Interaction Engine.
 * Allows triggering generic cat reactions safely from any component.
 */
export function useCatInteractionEngine(): UseCatInteractionEngineReturn {
  const { theme } = useTheme();
  const isCatThemeActive = theme === 'cat-meme';

  const triggerCatReaction = useCallback(
    (type: CatGenericReaction, options?: Partial<CatReactionOptions>) => {
      if (!isCatThemeActive) return;
      try {
        CatEventManager.triggerReaction(type, options);
      } catch {
        // Fail silently to safeguard core UI
      }
    },
    [isCatThemeActive]
  );

  return {
    isCatThemeActive,
    triggerCatReaction,
  };
}
