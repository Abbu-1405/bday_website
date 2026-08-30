import { CatDefinition, CatInteractionPreferences, UserCatPreferences } from '../../types/catMeme';
import { CatPreferencesRepository } from './CatPreferencesRepository';
import { FAMOUS_CAT_REGISTRY, getCatDefinition } from './catRegistry';

export const MAX_NICKNAME_LENGTH = 30;

/**
 * Service orchestrating user cat customization rules, nickname validation,
 * interaction toggles, and legendary cat safeguards.
 */
export class CatCustomizationService {
  /**
   * Validates and sanitizes a user-provided cat nickname.
   */
  public static validateNickname(name: string): {
    isValid: boolean;
    sanitized: string | null;
    error?: string;
  } {
    if (!name || name.trim().length === 0) {
      return { isValid: true, sanitized: null };
    }

    const trimmed = name.trim();

    // Check maximum length
    if (trimmed.length > MAX_NICKNAME_LENGTH) {
      return {
        isValid: false,
        sanitized: null,
        error: `Nickname must be ${MAX_NICKNAME_LENGTH} characters or less.`,
      };
    }

    // Strip out HTML tags or script injection attempts
    const sanitized = trimmed
      .replace(/<[^>]*>?/gm, '')
      .replace(/[<>]/g, '')
      .trim();

    if (sanitized.length === 0) {
      return { isValid: true, sanitized: null };
    }

    return {
      isValid: true,
      sanitized,
    };
  }

  /**
   * Returns the user's custom nickname for the cat if set, otherwise the official display name.
   */
  public static getEffectiveDisplayName(catDefOrId: CatDefinition | string): string {
    const catId = typeof catDefOrId === 'string' ? catDefOrId : catDefOrId.id;
    const catDef = typeof catDefOrId === 'string' ? getCatDefinition(catId) : catDefOrId;
    const pref = CatPreferencesRepository.getInstance().getPreference(catId);

    if (pref && pref.customName && pref.customName.trim().length > 0) {
      return pref.customName.trim();
    }

    return catDef.displayName;
  }

  /**
   * Checks whether a cat is marked as hidden by the user.
   * Legendary cats can NEVER be hidden and will always return false.
   */
  public static isCatHidden(catId: string): boolean {
    const catDef = FAMOUS_CAT_REGISTRY[catId];
    if (catDef?.rarity === 'legendary') {
      return false;
    }

    const pref = CatPreferencesRepository.getInstance().getPreference(catId);
    return Boolean(pref?.hidden);
  }

  /**
   * Checks if an interaction (pet, treat, shoo) is currently enabled for a cat.
   */
  public static isInteractionEnabled(
    catId: string,
    interaction: keyof CatInteractionPreferences
  ): boolean {
    const pref = CatPreferencesRepository.getInstance().getPreference(catId);
    if (!pref || !pref.interactions) return true;
    return pref.interactions[interaction] !== false;
  }

  /**
   * Sets a custom nickname for a cat.
   */
  public static async setNickname(
    catId: string,
    nickname: string
  ): Promise<{ success: boolean; preference?: UserCatPreferences; error?: string }> {
    const validation = this.validateNickname(nickname);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const updated = await CatPreferencesRepository.getInstance().updatePreference(catId, {
      customName: validation.sanitized,
    });

    return { success: true, preference: updated };
  }

  /**
   * Toggles visibility for a cat.
   * Disallows hiding legendary cats.
   */
  public static async setHidden(
    catId: string,
    hidden: boolean
  ): Promise<{ success: boolean; preference?: UserCatPreferences; error?: string }> {
    const catDef = FAMOUS_CAT_REGISTRY[catId];
    if (catDef?.rarity === 'legendary' && hidden) {
      return {
        success: false,
        error: 'Legendary cats cannot be hidden.',
      };
    }

    const updated = await CatPreferencesRepository.getInstance().updatePreference(catId, {
      hidden,
    });

    return { success: true, preference: updated };
  }

  /**
   * Toggles an individual interaction (pet, treat, shoo) for a cat.
   */
  public static async setInteraction(
    catId: string,
    interaction: keyof CatInteractionPreferences,
    enabled: boolean
  ): Promise<UserCatPreferences> {
    const pref = CatPreferencesRepository.getInstance().getPreference(catId);
    const updatedInteractions: CatInteractionPreferences = {
      ...pref.interactions,
      [interaction]: enabled,
    };

    return await CatPreferencesRepository.getInstance().updatePreference(catId, {
      interactions: updatedInteractions,
    });
  }

  /**
   * Gets preference for a cat.
   */
  public static getPreference(catId: string): UserCatPreferences {
    return CatPreferencesRepository.getInstance().getPreference(catId);
  }

  /**
   * Subscribes to preference changes.
   */
  public static subscribe(
    listener: (preferences: Record<string, UserCatPreferences>) => void
  ): () => void {
    return CatPreferencesRepository.getInstance().subscribe(listener);
  }
}
