import { useEffect, useCallback } from 'react';
import { useTheme } from './useTheme';
import {
  StarlitEventMetadata,
  StarlitEventType,
} from '../types/catMeme';
import { StarlitCatEventBridge } from '../services/catInteraction/StarlitCatEventBridge';

export interface UseStarlitCatBridgeReturn {
  isCatThemeActive: boolean;
  emitEvent: (eventType: StarlitEventType, metadata?: StarlitEventMetadata) => boolean;
  emitSuccess: (metadata?: StarlitEventMetadata) => boolean;
  emitError: (metadata?: StarlitEventMetadata) => boolean;
  emitHome: (action: 'entered' | 'action') => boolean;
  emitLetter: (
    action: 'opened' | 'saved' | 'created' | 'sent' | 'deleted' | 'error',
    metadata?: StarlitEventMetadata
  ) => boolean;
  emitSecret: (
    action: 'opened' | 'created' | 'unlocked' | 'locked' | 'error',
    secretId?: string
  ) => boolean;
  emitMoment: (
    action: 'opened' | 'added' | 'saved' | 'deleted' | 'error',
    momentId?: string
  ) => boolean;
  emitWish: (
    action: 'opened' | 'created' | 'completed' | 'deleted' | 'error',
    wishId?: string
  ) => boolean;
}

/**
 * React hook providing access to the Starlit Cat Event Bridge.
 * Keeps the bridge in sync with the active theme and provides type-safe event dispatchers.
 */
export function useStarlitCatBridge(): UseStarlitCatBridgeReturn {
  const { theme } = useTheme();
  const isCatThemeActive = theme === 'cat-meme';

  // Synchronize theme state with the event bridge
  useEffect(() => {
    StarlitCatEventBridge.setThemeActive(isCatThemeActive);
  }, [isCatThemeActive]);

  const emitEvent = useCallback(
    (eventType: StarlitEventType, metadata?: StarlitEventMetadata) => {
      if (!isCatThemeActive) return false;
      return StarlitCatEventBridge.emit(eventType, metadata);
    },
    [isCatThemeActive]
  );

  const emitSuccess = useCallback(
    (metadata?: StarlitEventMetadata) => {
      if (!isCatThemeActive) return false;
      return StarlitCatEventBridge.emitSuccess(metadata);
    },
    [isCatThemeActive]
  );

  const emitError = useCallback(
    (metadata?: StarlitEventMetadata) => {
      if (!isCatThemeActive) return false;
      return StarlitCatEventBridge.emitError(metadata);
    },
    [isCatThemeActive]
  );

  const emitHome = useCallback(
    (action: 'entered' | 'action') => {
      if (!isCatThemeActive) return false;
      return StarlitCatEventBridge.emitHome(action);
    },
    [isCatThemeActive]
  );

  const emitLetter = useCallback(
    (
      action: 'opened' | 'saved' | 'created' | 'sent' | 'deleted' | 'error',
      metadata?: StarlitEventMetadata
    ) => {
      if (!isCatThemeActive) return false;
      return StarlitCatEventBridge.emitLetter(action, metadata);
    },
    [isCatThemeActive]
  );

  const emitSecret = useCallback(
    (
      action: 'opened' | 'created' | 'unlocked' | 'locked' | 'error',
      secretId?: string
    ) => {
      if (!isCatThemeActive) return false;
      return StarlitCatEventBridge.emitSecret(action, secretId);
    },
    [isCatThemeActive]
  );

  const emitMoment = useCallback(
    (
      action: 'opened' | 'added' | 'saved' | 'deleted' | 'error',
      momentId?: string
    ) => {
      if (!isCatThemeActive) return false;
      return StarlitCatEventBridge.emitMoment(action, momentId);
    },
    [isCatThemeActive]
  );

  const emitWish = useCallback(
    (
      action: 'opened' | 'created' | 'completed' | 'deleted' | 'error',
      wishId?: string
    ) => {
      if (!isCatThemeActive) return false;
      return StarlitCatEventBridge.emitWish(action, wishId);
    },
    [isCatThemeActive]
  );

  return {
    isCatThemeActive,
    emitEvent,
    emitSuccess,
    emitError,
    emitHome,
    emitLetter,
    emitSecret,
    emitMoment,
    emitWish,
  };
}
