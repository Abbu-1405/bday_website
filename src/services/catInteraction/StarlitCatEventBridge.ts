import {
  StarlitEventMetadata,
  StarlitEventType,
} from '../../types/catMeme';
import { CatCooldownManager } from './CatCooldownManager';
import { CatCustomizationService } from './CatCustomizationService';
import { CatEventManager } from './CatEventManager';
import { CatMemoryService } from './CatMemoryService';
import { getAllRegisteredCats, selectWeightedRandomCat } from './catRegistry';
import {
  resolveStarlitEventReaction,
  STARLIT_EVENT_RULES,
} from './StarlitEventReactionMapper';

/**
 * Central Event Bridge connecting Starlit Letters UI events with the One Brain Cell Cat Interaction Engine.
 *
 * Privacy Guarantee:
 * This bridge strictly handles safe event metadata (e.g. 'LETTER_SENT', 'SECRET_UNLOCKED').
 * It never accepts, analyzes, or transmits private letter bodies, secret text, or photos.
 */
export class StarlitCatEventBridgeClass {
  private activeTheme = false;

  /**
   * Updates whether the Cat Meme theme is currently active.
   */
  public setThemeActive(active: boolean): void {
    this.activeTheme = active;
    if (!active) {
      this.cleanup();
    }
  }

  /**
   * Returns whether the Cat Meme theme is currently active.
   */
  public isThemeActive(): boolean {
    return this.activeTheme;
  }

  /**
   * Dispatches a Starlit Letters event to the Cat Interaction Engine.
   * Resolves priority, cooldowns, personality reactions, and triggers the cat.
   *
   * @param eventType - Starlit Letters event type
   * @param metadata - Safe event metadata (strictly no private letter/secret content)
   * @returns boolean - Whether a cat reaction was triggered
   */
  public emit(
    eventType: StarlitEventType,
    metadata?: StarlitEventMetadata
  ): boolean {
    // 1. Theme check - zero overhead if theme is not cat-meme
    if (!this.activeTheme) {
      return false;
    }

    try {
      // 2. Resolve event rule
      const rule = STARLIT_EVENT_RULES[eventType];
      if (!rule) {
        return false;
      }

      // 3. Mobile detection
      const isMobile =
        typeof window !== 'undefined' && window.innerWidth < 768;

      // 4. Check Cooldown & Rate Limiter
      const canTrigger = CatCooldownManager.canTrigger(rule.priority, isMobile);
      if (!canTrigger) {
        return false;
      }

      // 5. Select cat from cast registry respecting user visibility preferences
      const allCats = getAllRegisteredCats();
      const visibleCats = allCats.filter(
        (c) => c.rarity === 'legendary' || !CatCustomizationService.isCatHidden(c.id)
      );
      const catDef = selectWeightedRandomCat([], visibleCats);

      // 6. Resolve personality-specific expression, caption, duration, and position
      const reaction = resolveStarlitEventReaction(catDef, eventType, metadata);

      // 7. Record cooldown trigger
      CatCooldownManager.recordTrigger(rule.priority);

      // 8. Dispatch to CatEventManager
      CatEventManager.triggerReaction(reaction.genericReaction, {
        catId: catDef.id,
        variant: reaction.expression,
        caption: reaction.caption,
        position: reaction.position,
        duration: reaction.duration,
        overrideActive: rule.priority === 'HIGH',
      });

      // 9. Record interaction in Persistent Cat Memory
      try {
        CatMemoryService.recordInteraction(catDef.id, eventType);
      } catch (memErr) {
        console.warn('StarlitCatEventBridge: Error recording memory interaction', memErr);
      }

      return true;
    } catch {
      // Complete error isolation: cat reaction errors never affect Starlit Letters actions
      return false;
    }
  }

  /**
   * Convenience helper for successful actions across the app.
   */
  public emitSuccess(metadata?: StarlitEventMetadata): boolean {
    return this.emit('GLOBAL_SUCCESS', metadata);
  }

  /**
   * Convenience helper for failed actions across the app (supplemental feedback).
   */
  public emitError(metadata?: StarlitEventMetadata): boolean {
    return this.emit('GLOBAL_ERROR', metadata);
  }

  /**
   * Convenience helper for Home / Dashboard events.
   */
  public emitHome(action: 'entered' | 'action'): boolean {
    return this.emit(action === 'entered' ? 'HOME_ENTERED' : 'HOME_ACTION');
  }

  /**
   * Convenience helper for Letters lifecycle events.
   */
  public emitLetter(
    action: 'opened' | 'saved' | 'created' | 'sent' | 'deleted' | 'error',
    metadata?: StarlitEventMetadata
  ): boolean {
    const eventMap: Record<string, StarlitEventType> = {
      opened: 'LETTER_EDITOR_OPENED',
      saved: 'LETTER_DRAFT_SAVED',
      created: 'LETTER_CREATED',
      sent: 'LETTER_SENT',
      deleted: 'LETTER_DELETED',
      error: 'LETTER_ACTION_FAILED',
    };
    const eventType = eventMap[action] || 'LETTER_DRAFT_SAVED';
    return this.emit(eventType, { ...metadata, category: 'letters' });
  }

  /**
   * Convenience helper for Secret Vault events.
   */
  public emitSecret(
    action: 'opened' | 'created' | 'unlocked' | 'locked' | 'error',
    secretId?: string
  ): boolean {
    const eventMap: Record<string, StarlitEventType> = {
      opened: 'SECRET_PAGE_OPENED',
      created: 'SECRET_CREATED',
      unlocked: 'SECRET_UNLOCKED',
      locked: 'SECRET_LOCKED',
      error: 'SECRET_ACTION_FAILED',
    };
    const eventType = eventMap[action] || 'SECRET_PAGE_OPENED';
    return this.emit(eventType, {
      category: 'secrets',
      itemId: secretId,
      action,
    });
  }

  /**
   * Convenience helper for Moments events.
   */
  public emitMoment(
    action: 'opened' | 'added' | 'saved' | 'deleted' | 'error',
    momentId?: string
  ): boolean {
    const eventMap: Record<string, StarlitEventType> = {
      opened: 'MOMENTS_PAGE_OPENED',
      added: 'MOMENT_ADDED',
      saved: 'MOMENT_SAVED',
      deleted: 'MOMENT_DELETED',
      error: 'MOMENT_ACTION_FAILED',
    };
    const eventType = eventMap[action] || 'MOMENTS_PAGE_OPENED';
    return this.emit(eventType, {
      category: 'moments',
      itemId: momentId,
      action,
    });
  }

  /**
   * Convenience helper for Wishes events.
   */
  public emitWish(
    action: 'opened' | 'created' | 'completed' | 'deleted' | 'error',
    wishId?: string
  ): boolean {
    const eventMap: Record<string, StarlitEventType> = {
      opened: 'WISH_PAGE_OPENED',
      created: 'WISH_CREATED',
      completed: 'WISH_COMPLETED',
      deleted: 'WISH_DELETED',
      error: 'WISH_ACTION_FAILED',
    };
    const eventType = eventMap[action] || 'WISH_PAGE_OPENED';
    return this.emit(eventType, {
      category: 'wishes',
      itemId: wishId,
      action,
    });
  }

  /**
   * Clean up all state and timers.
   */
  public cleanup(): void {
    CatCooldownManager.reset();
  }
}

// Global Singleton Instance
export const StarlitCatEventBridge = new StarlitCatEventBridgeClass();
