import {
  CatDefinition,
  CatExpressionType,
  CatGenericReaction,
  CatPersonalityType,
} from '../../types/catMeme';
import { GENERIC_REACTION_CAPTIONS } from './catConfig';

export interface ResolvedReactionResult {
  expression: CatExpressionType;
  caption: string;
  durationModifier: number;
}

export interface ResolvedIdleResult {
  expression: CatExpressionType;
  caption?: string;
}

/**
 * Resolves a generic reaction request into a cat's specific personality-driven response.
 */
export function resolvePersonalityReaction(
  cat: CatDefinition,
  reactionType: CatGenericReaction,
  customCaption?: string
): ResolvedReactionResult {
  const rule = cat.reactionMap[reactionType];

  let expression: CatExpressionType = cat.defaultExpression;
  let caption = customCaption;
  let durationModifier = 1.0;

  if (rule) {
    expression = rule.expression;
    durationModifier = rule.durationModifier || 1.0;
    if (!caption && rule.captionPool.length > 0) {
      const idx = Math.floor(Math.random() * rule.captionPool.length);
      caption = rule.captionPool[idx];
    }
  }

  // Graceful fallback to generic reaction captions if nothing matched
  if (!caption) {
    const genericPool = GENERIC_REACTION_CAPTIONS[reactionType] || [];
    caption =
      genericPool.length > 0
        ? genericPool[Math.floor(Math.random() * genericPool.length)]
        : `${cat.displayName} reacts! 🐾`;
  }

  return {
    expression,
    caption,
    durationModifier,
  };
}

/**
 * Resolves idle behavior, expressions, and captions for a spawned cat.
 */
export function resolvePersonalityIdle(
  cat: CatDefinition
): ResolvedIdleResult {
  const expression = cat.defaultExpression;
  let caption: string | undefined;

  // 60% probability of showing a personality-specific idle caption
  if (cat.idleCaptions.length > 0 && Math.random() > 0.4) {
    const idx = Math.floor(Math.random() * cat.idleCaptions.length);
    caption = cat.idleCaptions[idx];
  }

  return {
    expression,
    caption,
  };
}

/**
 * Formats a personality label into a clean, display-ready tag.
 */
export function formatPersonalityLabel(personality: CatPersonalityType): string {
  const labels: Record<CatPersonalityType, string> = {
    judgmental: 'Judgmental',
    confused: 'Confused',
    sleepy: 'Sleepy',
    dramatic: 'Melodramatic',
    chaotic: 'Chaotic',
    angry: 'Grumpy',
    smug: 'Smug',
    suspicious: 'Suspicious',
    clueless: 'Zero Thoughts',
    polite: 'Polite',
  };
  return labels[personality] || 'Feline';
}
