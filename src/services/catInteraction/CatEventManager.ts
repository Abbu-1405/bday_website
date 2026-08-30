import {
  CatEngineEventType,
  CatGenericReaction,
  CatReactionOptions,
} from '../../types/catMeme';

type CatEventListener = (event: CatEngineEventType, payload?: unknown) => void;

class CatEventManagerClass {
  private listeners: Set<CatEventListener> = new Set();

  /**
   * Subscribe to cat engine events.
   * Returns an unsubscribe callback for clean unmounting.
   */
  public subscribe(listener: CatEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit an internal event to all subscribers.
   */
  public emit(event: CatEngineEventType, payload?: unknown): void {
    try {
      this.listeners.forEach((listener) => {
        try {
          listener(event, payload);
        } catch {
          // Fail silently to safeguard core UI
        }
      });
    } catch {
      // Fail silently
    }
  }

  /**
   * Generic reaction trigger API for Phase 2.
   * Allows any part of the UI to trigger a cat reaction.
   */
  public triggerReaction(
    type: CatGenericReaction,
    options?: Partial<CatReactionOptions>
  ): void {
    const payload: CatReactionOptions = {
      type,
      catId: options?.catId,
      variant: options?.variant,
      caption: options?.caption,
      position: options?.position,
      duration: options?.duration,
      overrideActive: options?.overrideActive,
    };
    this.emit('REACTION', payload);
  }

  /**
   * Reset and clear all event listeners.
   */
  public cleanup(): void {
    this.listeners.clear();
  }
}

// Global Singleton for easy cross-component dispatch
export const CatEventManager = new CatEventManagerClass();
