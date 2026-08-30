// ============================================================================
// ONE BRAIN CELL (CAT MEME THEME) TYPE DEFINITIONS - PHASES 1, 2 & 3
// ============================================================================

/**
 * Core event types for the Cat Interaction Engine.
 * Phase 2 & 3: IDLE, APPEAR, DISAPPEAR, REACTION.
 * SURPRISE and CHAOS are declared for future compatibility.
 */
export type CatEngineEventType =
  | 'IDLE'
  | 'APPEAR'
  | 'DISAPPEAR'
  | 'REACTION'
  | 'SURPRISE'
  | 'CHAOS';

/**
 * Deterministic states for a single decorative cat instance.
 */
export type CatState =
  | 'hidden'
  | 'entering'
  | 'idle'
  | 'reacting'
  | 'exiting';

/**
 * Generic cat reaction types used across the application.
 */
export type CatGenericReaction =
  | 'curious'
  | 'surprised'
  | 'sleepy'
  | 'confused'
  | 'excited';

/**
 * Core personality archetypes for famous meme cats.
 */
export type CatPersonalityType =
  | 'judgmental'
  | 'confused'
  | 'sleepy'
  | 'dramatic'
  | 'chaotic'
  | 'angry'
  | 'smug'
  | 'suspicious'
  | 'clueless'
  | 'polite';

/**
 * Rich facial expressions supported by the cat graphics.
 */
export type CatExpressionType =
  | 'derp'
  | 'curious'
  | 'surprised'
  | 'sleepy'
  | 'confused'
  | 'excited'
  | 'neutral'
  | 'judgmental'
  | 'angry'
  | 'smug'
  | 'shocked';

// Backward compatibility alias for CatVisualVariant
export type CatVisualVariant = CatExpressionType;

/**
 * Safe viewport preset locations for cat rendering.
 */
export type CatPositionPreset =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'center-right'
  | 'center-left'
  | 'card-peek-left'
  | 'card-peek-right'
  | 'custom';

/**
 * Meme rarity tiers determining appearance probability weighting.
 */
export type MemeRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

/**
 * Categories for meme variants.
 */
export type CatMemeCategory =
  | 'orange'
  | 'reaction'
  | 'judgmental'
  | 'crying'
  | 'screaming'
  | 'happy'
  | 'confused'
  | 'sleepy'
  | 'cursed'
  | 'brainrot'
  | 'celebration'
  | 'random';

/**
 * Presentation formats for meme variants.
 */
export type MemePresentationType = 'sticker' | 'full-meme' | 'reaction' | 'dialogue';

/**
 * Foundation for visual meme variants associated with a cat definition.
 */
export interface MemeVariant {
  id: string;
  catId: string;
  presentationType: MemePresentationType;
  category?: CatMemeCategory;
  expression: CatExpressionType;
  captionTemplate?: string;
  rarity: MemeRarity;
  enabled: boolean;
}

/**
 * Personality reaction resolution mapping.
 */
export interface CatPersonalityReactionRule {
  expression: CatExpressionType;
  captionPool: string[];
  durationModifier?: number; // multiplier e.g. 1.2 for dramatic, 0.8 for chaotic
}

/**
 * Central definition for a famous meme cat in the cast registry.
 */
export interface CatDefinition {
  id: string;
  displayName: string;
  personality: CatPersonalityType;
  personalityTags: string[];
  signatureBehavior: string;
  defaultExpression: CatExpressionType;
  availableExpressions: CatExpressionType[];
  reactionMap: Partial<Record<CatGenericReaction, CatPersonalityReactionRule>>;
  idleCaptions: string[];
  appearanceWeight: number; // relative weight for spawn selection (e.g., 25 for common, 2 for legendary)
  rarity: MemeRarity;
  preferredLocations?: CatPositionPreset[];
  captionStyle?: string;
  archetypeColor?: string;
  assets?: {
    avatar?: string;
    stickers?: string[];
    svgVariant?: string;
  };
  memeVariants?: MemeVariant[];
  progression?: CatProgressionConfig;
  enabled: boolean;
}

/**
 * Active Cat instance rendered on screen by the Cat Interaction Engine.
 */
export interface ActiveCatInstance {
  id: string;
  catDefinitionId: string;
  displayName: string;
  personality: CatPersonalityType;
  rarity: MemeRarity;
  archetypeColor?: string;
  state: CatState;
  position: CatPositionPreset;
  customCoordinates?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  reactionType?: CatGenericReaction;
  variant: CatExpressionType;
  caption?: string;
  rotation?: number;
  scale?: number;
  enteredAt: number;
  duration: number; // milliseconds
}

/**
 * Engine spawn and timing configuration.
 */
export interface CatEngineConfig {
  minSpawnInterval: number; // ms
  maxSpawnInterval: number; // ms
  maxSimultaneousDesktop: number;
  maxSimultaneousMobile: number;
  minDisplayDuration: number; // ms
  maxDisplayDuration: number; // ms
  spawnProbability: number; // 0-1
  mobileBreakpoint: number; // px
}

/**
 * Generic Cat reaction trigger options.
 */
export interface CatReactionOptions {
  type: CatGenericReaction;
  catId?: string; // Optional specific cat target
  variant?: CatExpressionType; // Specific visual expression override
  caption?: string;
  position?: CatPositionPreset;
  duration?: number;
  overrideActive?: boolean;
}

// ----------------------------------------------------------------------------
// PHASE 4: STARLIT LETTERS INTEGRATION TYPES
// ----------------------------------------------------------------------------

/**
 * Meaningful UI event types across Starlit Letters that cats can observe.
 */
export type StarlitEventType =
  // Home & Dashboard
  | 'HOME_ENTERED'
  | 'HOME_ACTION'
  // Letters & Writing
  | 'LETTER_EDITOR_OPENED'
  | 'LETTER_DRAFT_SAVED'
  | 'LETTER_CREATED'
  | 'LETTER_SENT'
  | 'LETTER_DELETED'
  | 'LETTER_ACTION_FAILED'
  // Secrets Vault
  | 'SECRET_PAGE_OPENED'
  | 'SECRET_CREATED'
  | 'SECRET_UNLOCKED'
  | 'SECRET_LOCKED'
  | 'SECRET_ACTION_FAILED'
  // Moments
  | 'MOMENTS_PAGE_OPENED'
  | 'MOMENT_ADDED'
  | 'MOMENT_SAVED'
  | 'MOMENT_DELETED'
  | 'MOMENT_ACTION_FAILED'
  // Wishes
  | 'WISH_PAGE_OPENED'
  | 'WISH_CREATED'
  | 'WISH_COMPLETED'
  | 'WISH_DELETED'
  | 'WISH_ACTION_FAILED'
  // Global / Cross-cutting
  | 'GLOBAL_SUCCESS'
  | 'GLOBAL_ERROR'
  | 'PAGE_TRANSITION';

/**
 * Event priority tiers to prevent UI spam and ensure meaningful events take precedence.
 */
export type StarlitEventPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'ERROR';

/**
 * Safe, privacy-preserving event metadata.
 * Cats NEVER receive or inspect letter bodies, secrets, private text, or photos.
 */
export interface StarlitEventMetadata {
  category?: 'home' | 'letters' | 'secrets' | 'moments' | 'wishes' | 'global';
  action?: string;
  itemId?: string; // Opaque ID only (e.g. 'secret-01', 'wish-04')
  status?: 'success' | 'failure' | 'info';
  sourceRoute?: string;
  customCaptionHint?: string; // Pre-approved safe static caption hint only
}

/**
 * Event-to-reaction rule definition.
 */
export interface StarlitEventReactionRule {
  priority: StarlitEventPriority;
  defaultReaction: CatGenericReaction;
  preferredPosition?: CatPositionPreset;
  baseDuration?: number;
  probability: number; // 0.0 - 1.0
}

/**
 * Configuration for the centralized reaction cooldown and rate limiter.
 */
export interface ReactionCooldownConfig {
  lowPriorityCooldownMs: number;
  mediumPriorityCooldownMs: number;
  highPriorityCooldownMs: number;
  errorPriorityCooldownMs: number;
  maxReactionsPerMinuteDesktop: number;
  maxReactionsPerMinuteMobile: number;
  windowMs: number;
  probability: Record<StarlitEventPriority, number>;
}

// ----------------------------------------------------------------------------
// PHASE 5: PERSISTENT CAT MEMORY & RELATIONSHIP SYSTEM TYPES
// ----------------------------------------------------------------------------

/**
 * Meaningful milestone event classifications in a user's relationship with a cat.
 */
export type CatRelationshipMilestoneType =
  | 'FIRST_ENCOUNTER'
  | 'RELATIONSHIP_LEVEL_UP'
  | 'MEANINGFUL_INTERACTION_MILESTONE'
  | 'BEHAVIOR_UNLOCKED'
  | 'SPECIAL_INTERACTION'
  | 'FAVORITE_BOND';

/**
 * Meaningful milestone history record preserved in Firestore.
 */
export interface CatMilestone {
  id: string;
  type: CatRelationshipMilestoneType;
  title: string;
  description: string;
  achievedAt: string; // ISO timestamp
  pointsAtMilestone: number;
  levelAchieved?: number;
  metadata?: Record<string, any>;
}

/**
 * Privacy-preserving memorable interaction record.
 * Strictly NEVER stores letter body, secrets, private text, or photos.
 */
export interface CatMemorableInteraction {
  eventId: string;
  timestamp: string; // ISO timestamp
  eventType: string; // e.g. 'LETTER_SENT', 'SECRET_UNLOCKED', 'PET_CAT', 'DISMISSED'
  impactPoints: number; // positive or negative
  significance: 'minor' | 'meaningful' | 'major';
  summary: string; // Safe, high-level non-sensitive summary e.g. "Shared a magical moment"
}

/**
 * Relationship state descriptor reflecting current rapport.
 */
export type CatRelationshipState =
  | 'stranger'
  | 'neutral'
  | 'curious'
  | 'friendly'
  | 'fond'
  | 'devoted'
  | 'displeased'
  | 'bestie';

/**
 * Individual relationship progression level definition (1-7).
 */
export interface CatRelationshipLevel {
  level: number; // 1 to 7
  name: string; // Cat-specific title e.g. "Brain Cell Trustee" or "VIP Table Partner"
  minPoints: number; // Minimum cumulative relationship points required
  description: string; // Personality-aligned description of the tier
  unlockedBehaviors: string[]; // List of behavior codes unlocked at this tier
  acknowledgementQuotes: string[]; // In-character dialogue acknowledging this tier
}

/**
 * 7-Level progression configuration embedded in CatDefinition.
 */
export interface CatProgressionConfig {
  levels: CatRelationshipLevel[];
  maxLevel: number;
  customMilestones?: {
    encounterMilestones: number[];
    interactionMilestones: number[];
  };
}

/**
 * Complete persistent user-owned memory document for a single meme cat.
 * Stored at path: `users/{userId}/catMemories/{catId}` in Firestore.
 */
export interface UserCatMemory {
  catId: string;
  userId: string;
  relationshipPoints: number;
  relationshipLevel: number; // 1 to 7
  relationshipLevelName: string;
  encounterCount: number;
  meaningfulInteractionCount: number;
  firstSeenAt: string; // ISO timestamp
  lastSeenAt: string; // ISO timestamp
  lastInteractionAt: string; // ISO timestamp
  milestoneHistory: CatMilestone[];
  memorableInteractionReferences: CatMemorableInteraction[];
  relationshipState: CatRelationshipState;
  unlockedBehaviors: string[];
  version: number;
}

/**
 * Progression progress calculation result for UI rendering.
 */
export interface CatProgressionProgress {
  currentLevel: number;
  currentLevelName: string;
  currentPoints: number;
  pointsInCurrentLevel: number;
  pointsNeededForNextLevel: number;
  progressPercent: number;
  isMaxLevel: boolean;
  nextLevelName?: string;
  remainingPointsToNext: number;
}

// ----------------------------------------------------------------------------
// PHASE 6: USER CUSTOMIZATION SYSTEM TYPES
// ----------------------------------------------------------------------------

/**
 * Individual enable/disable state for interactive cat micro-actions.
 */
export interface CatInteractionPreferences {
  petEnabled: boolean;
  treatEnabled: boolean;
  shooEnabled: boolean;
}

/**
 * Complete persistent user-owned customization record for a single meme cat.
 * Stored at path: `users/{userId}/catPreferences/{catId}` in Firestore.
 */
export interface UserCatPreferences {
  catId: string;
  userId: string;
  customName?: string | null;
  hidden: boolean;
  interactions: CatInteractionPreferences;
  updatedAt: string; // ISO timestamp
  version: number;
}

// ----------------------------------------------------------------------------
// PHASE 7: AUDIO & SOUND IDENTITY SYSTEM TYPES
// ----------------------------------------------------------------------------

export type CatSoundCategory =
  | 'signature'
  | 'reaction'
  | 'pet'
  | 'treat'
  | 'shoo'
  | 'relationship';

export type CatSoundPriority = 'low' | 'medium' | 'high';

export type CatSynthType =
  | 'meow'
  | 'purr'
  | 'crunch'
  | 'dramatic_boing'
  | 'pop'
  | 'screech'
  | 'glissando'
  | 'chirp'
  | 'piano_tinkle'
  | 'wobble'
  | 'laser'
  | 'deep_grumble'
  | 'churu_slurp'
  | 'spinning_hum';

export interface CatSoundSpec {
  soundId: string;
  name: string;
  synthType: CatSynthType;
  baseFreq?: number; // Base frequency in Hz
  duration?: number; // Duration in seconds (e.g. 0.35 - 1.2s)
  pitchMultiplier?: number;
  warmth?: number; // 0.0 to 1.0 (warmer harmonics for higher bond)
  vibratoRate?: number;
  modulationIndex?: number;
}

export interface CatAudioDefinition {
  catId: string;
  signatureSound: CatSoundSpec;
  reactionSounds: Record<string, CatSoundSpec>;
  relationshipVariants?: {
    minLevel: number;
    variantSound: CatSoundSpec;
  }[];
}

export interface CatAudioSettings {
  masterVolume: number; // 0 to 1
  muted: boolean;
  autoplayBlocked: boolean;
}

// ----------------------------------------------------------------------------
// PHASE 8: EASTER EGGS & HIDDEN EVENTS SYSTEM TYPES
// ----------------------------------------------------------------------------

export type EasterEggTriggerAction = 'pet' | 'treat' | 'shoo' | 'combination';

export type EasterEggAnimationType =
  | 'salad_recoil'
  | 'stoic_accept'
  | 'antenna_overdrive'
  | 'rapid_pop_symphony'
  | 'perpetual_spin'
  | 'unfazed_stare'
  | 'sync_jam';

export interface EasterEggHint {
  visualCue:
    | 'antenna_flicker'
    | 'salad_glance'
    | 'suspicious_squint'
    | 'spin_wobble'
    | 'polite_nod'
    | 'bubble_twitch'
    | 'musical_sparkle';
  clueText: string;
}

export interface EasterEggDefinition {
  id: string; // Immutable unique identifier
  title: string; // Discovery display name (e.g. "The Salad Incident")
  catIds: string[]; // Primary cat ID, or multiple IDs for combination eggs
  triggerAction: EasterEggTriggerAction;
  hint: EasterEggHint;
  animationType: EasterEggAnimationType;
  caption: string; // In-character caption during Easter egg event
  soundId?: string; // Optional sound identifier
  description: string; // Flavor text shown after discovery
  enabled: boolean;
  isCombination?: boolean;
}

export interface EasterEggDiscovery {
  eggId: string;
  catId: string;
  discoveredAt: string; // ISO 8601 string
  version: number;
}

export interface ActiveEasterEggEvent {
  eggId: string;
  catId: string;
  definition: EasterEggDefinition;
  startedAt: number;
  durationMs: number;
  companionCatId?: string;
}

