import {
  CatDefinition,
  CatExpressionType,
  CatGenericReaction,
  CatPositionPreset,
  StarlitEventMetadata,
  StarlitEventReactionRule,
  StarlitEventType,
} from '../../types/catMeme';

/**
 * Deterministic mapping rules for all Starlit Letters events.
 */
export const STARLIT_EVENT_RULES: Record<StarlitEventType, StarlitEventReactionRule> = {
  // Home & Dashboard
  HOME_ENTERED: {
    priority: 'LOW',
    defaultReaction: 'curious',
    preferredPosition: 'bottom-right',
    baseDuration: 5500,
    probability: 0.35,
  },
  HOME_ACTION: {
    priority: 'LOW',
    defaultReaction: 'excited',
    preferredPosition: 'bottom-right',
    baseDuration: 5000,
    probability: 0.40,
  },

  // Letters & Writing
  LETTER_EDITOR_OPENED: {
    priority: 'LOW',
    defaultReaction: 'curious',
    // Safe position away from typing area, toolbar, and send button
    preferredPosition: 'bottom-left',
    baseDuration: 5000,
    probability: 0.35,
  },
  LETTER_DRAFT_SAVED: {
    priority: 'MEDIUM',
    defaultReaction: 'sleepy',
    preferredPosition: 'bottom-left',
    baseDuration: 5500,
    probability: 0.75,
  },
  LETTER_CREATED: {
    priority: 'MEDIUM',
    defaultReaction: 'curious',
    preferredPosition: 'bottom-right',
    baseDuration: 6000,
    probability: 0.70,
  },
  LETTER_SENT: {
    priority: 'HIGH',
    defaultReaction: 'excited',
    preferredPosition: 'bottom-right',
    baseDuration: 7000,
    probability: 1.0,
  },
  LETTER_DELETED: {
    priority: 'MEDIUM',
    defaultReaction: 'surprised',
    preferredPosition: 'bottom-left',
    baseDuration: 5500,
    probability: 0.65,
  },
  LETTER_ACTION_FAILED: {
    priority: 'ERROR',
    defaultReaction: 'confused',
    preferredPosition: 'bottom-right',
    baseDuration: 6000,
    probability: 0.85,
  },

  // Secrets Vault
  SECRET_PAGE_OPENED: {
    priority: 'LOW',
    defaultReaction: 'curious',
    preferredPosition: 'bottom-left',
    baseDuration: 5000,
    probability: 0.35,
  },
  SECRET_CREATED: {
    priority: 'MEDIUM',
    defaultReaction: 'curious',
    preferredPosition: 'bottom-right',
    baseDuration: 6000,
    probability: 0.70,
  },
  SECRET_UNLOCKED: {
    priority: 'HIGH',
    defaultReaction: 'surprised',
    preferredPosition: 'bottom-right',
    baseDuration: 7500,
    probability: 1.0,
  },
  SECRET_LOCKED: {
    priority: 'MEDIUM',
    defaultReaction: 'confused',
    preferredPosition: 'bottom-left',
    baseDuration: 5000,
    probability: 0.55,
  },
  SECRET_ACTION_FAILED: {
    priority: 'ERROR',
    defaultReaction: 'confused',
    preferredPosition: 'bottom-right',
    baseDuration: 6000,
    probability: 0.85,
  },

  // Moments
  MOMENTS_PAGE_OPENED: {
    priority: 'LOW',
    defaultReaction: 'curious',
    preferredPosition: 'bottom-left',
    baseDuration: 5000,
    probability: 0.35,
  },
  MOMENT_ADDED: {
    priority: 'MEDIUM',
    defaultReaction: 'excited',
    preferredPosition: 'bottom-right',
    baseDuration: 6500,
    probability: 0.75,
  },
  MOMENT_SAVED: {
    priority: 'MEDIUM',
    defaultReaction: 'curious',
    preferredPosition: 'bottom-right',
    baseDuration: 5500,
    probability: 0.70,
  },
  MOMENT_DELETED: {
    priority: 'MEDIUM',
    defaultReaction: 'surprised',
    preferredPosition: 'bottom-left',
    baseDuration: 5500,
    probability: 0.65,
  },
  MOMENT_ACTION_FAILED: {
    priority: 'ERROR',
    defaultReaction: 'confused',
    preferredPosition: 'bottom-right',
    baseDuration: 6000,
    probability: 0.85,
  },

  // Wishes
  WISH_PAGE_OPENED: {
    priority: 'LOW',
    defaultReaction: 'curious',
    preferredPosition: 'bottom-left',
    baseDuration: 5000,
    probability: 0.35,
  },
  WISH_CREATED: {
    priority: 'MEDIUM',
    defaultReaction: 'excited',
    preferredPosition: 'bottom-right',
    baseDuration: 6000,
    probability: 0.75,
  },
  WISH_COMPLETED: {
    priority: 'HIGH',
    defaultReaction: 'excited',
    preferredPosition: 'bottom-right',
    baseDuration: 7000,
    probability: 1.0,
  },
  WISH_DELETED: {
    priority: 'MEDIUM',
    defaultReaction: 'surprised',
    preferredPosition: 'bottom-left',
    baseDuration: 5500,
    probability: 0.60,
  },
  WISH_ACTION_FAILED: {
    priority: 'ERROR',
    defaultReaction: 'confused',
    preferredPosition: 'bottom-right',
    baseDuration: 6000,
    probability: 0.85,
  },

  // Global
  GLOBAL_SUCCESS: {
    priority: 'HIGH',
    defaultReaction: 'excited',
    preferredPosition: 'bottom-right',
    baseDuration: 6500,
    probability: 0.90,
  },
  GLOBAL_ERROR: {
    priority: 'ERROR',
    defaultReaction: 'confused',
    preferredPosition: 'bottom-right',
    baseDuration: 6000,
    probability: 0.85,
  },
  PAGE_TRANSITION: {
    priority: 'LOW',
    defaultReaction: 'curious',
    preferredPosition: 'bottom-left',
    baseDuration: 4500,
    probability: 0.25,
  },
};

/**
 * Event-specific personality dialogue pools.
 * These ensure famous cats react to Starlit events in character without ever
 * inspecting private user content.
 */
export const EVENT_PERSONALITY_CAPTIONS: Record<
  string, // catId
  Partial<Record<StarlitEventType, { expression?: CatExpressionType; captions: string[] }>>
> = {
  'orange-one-brain-cell': {
    HOME_ENTERED: {
      expression: 'derp',
      captions: [
        'Welcome home! The brain cell is resting. ✨',
        'Starlit universe detected! Searching for thoughts...',
        'Zero thoughts, full heart. 🧡',
      ],
    },
    LETTER_EDITOR_OPENED: {
      expression: 'curious',
      captions: [
        'Writing letters? Need zero thoughts of help? 🐾',
        'Staring quietly at the blank parchment...',
        'Brain cell hovering over the inkpot.',
      ],
    },
    LETTER_DRAFT_SAVED: {
      expression: 'sleepy',
      captions: [
        'Draft saved! Brain cell battery recharge time. 💤',
        'Thoughts preserved safely! (All 0 of them)',
        'Progress secured. Nap initiated.',
      ],
    },
    LETTER_SENT: {
      expression: 'excited',
      captions: [
        'You pushed the button! It flew into the void! 🚀',
        'LETTER DISPATCHED INTO THE COSMOS! ✨',
        'Orange zoomies of accomplishment! 🐾',
      ],
    },
    LETTER_DELETED: {
      expression: 'confused',
      captions: [
        'Where did the parchment go? 🙀',
        'Gone into the shredder of the universe.',
        'Did I eat the draft? Error 404.',
      ],
    },
    SECRET_UNLOCKED: {
      expression: 'surprised',
      captions: [
        'A shiny lock clicked! Is there cheese inside?! 🙀',
        'BRAIN CELL SENSORS DETECTED UNLOCKED VAULT!',
        'A secret! My eyes are as wide as saucers!',
      ],
    },
    SECRET_CREATED: {
      expression: 'curious',
      captions: [
        'Ooh, a shiny new lock in the vault! 🗝️',
        'Guarding this secret with zero brain cells.',
      ],
    },
    MOMENT_ADDED: {
      expression: 'excited',
      captions: [
        'New shiny memory recorded! 📸',
        'Secured in the scrapbook of the universe! ✨',
      ],
    },
    WISH_COMPLETED: {
      expression: 'excited',
      captions: [
        'The lantern reached the stars! ✨',
        'Wish sent to the celestial realm! 🌟',
      ],
    },
    GLOBAL_ERROR: {
      expression: 'confused',
      captions: [
        'Bro. Error 404: Brain cell dropped offline. 📡',
        'Wait... something tripped over the wire! 🤔',
      ],
    },
    GLOBAL_SUCCESS: {
      expression: 'excited',
      captions: [
        'Success! Orange cat approved! 🐾',
        'Everything worked! Maximum victory! 🌟',
      ],
    },
  },

  'smudge-table-cat': {
    HOME_ENTERED: {
      expression: 'judgmental',
      captions: [
        'You have returned. Still no salad, I hope. 🥗',
        'I am sitting here observing the dashboard.',
      ],
    },
    LETTER_DRAFT_SAVED: {
      expression: 'neutral',
      captions: [
        'Draft saved. Still judging your phrasing.',
        'Progress acknowledged. Barely.',
      ],
    },
    LETTER_SENT: {
      expression: 'smug',
      captions: [
        'Finally sent. Took you long enough. 😼',
        'Dispatched. Hopefully no salad was mentioned.',
      ],
    },
    SECRET_UNLOCKED: {
      expression: 'judgmental',
      captions: [
        'A secret revealed. I am mildly interested.',
        'You found the key. Unsurprising.',
      ],
    },
    MOMENT_ADDED: {
      expression: 'neutral',
      captions: [
        'A photo was preserved. Was there salad in it?',
        'Another moment filed away.',
      ],
    },
    WISH_COMPLETED: {
      expression: 'smug',
      captions: [
        'Wish granted. As long as it is not vegetables.',
        'The lantern is clear of the dining table.',
      ],
    },
    GLOBAL_ERROR: {
      expression: 'judgmental',
      captions: [
        'You broke something. Unsurprising. 😾',
        'Squinting in mild disappointment.',
      ],
    },
    GLOBAL_SUCCESS: {
      expression: 'smug',
      captions: [
        'Clean execution. Acceptable.',
        'A rare moment of feline satisfaction. 😼',
      ],
    },
  },

  'polite-ollie-cat': {
    HOME_ENTERED: {
      expression: 'smug',
      captions: [
        'Welcome, honored guest. A lovely day! 😊',
        'Politely greeting you at the doorstep.',
      ],
    },
    LETTER_EDITOR_OPENED: {
      expression: 'curious',
      captions: [
        'May your pen write with exquisite elegance. ✒️',
        'Politely observing the composition.',
      ],
    },
    LETTER_DRAFT_SAVED: {
      expression: 'smug',
      captions: [
        'Politely preserved your lovely draft. 😊',
        'A civilized and prudent precaution.',
      ],
    },
    LETTER_SENT: {
      expression: 'excited',
      captions: [
        'Splendid correspondence sent with utmost care! ✨',
        'Truly marvelous! A postal triumph! ✉️',
      ],
    },
    SECRET_UNLOCKED: {
      expression: 'surprised',
      captions: [
        'Good heavens, a magnificent mystery unveiled! 🗝️',
        'Pardon my slight excitement at this discovery!',
      ],
    },
    MOMENT_ADDED: {
      expression: 'smug',
      captions: [
        'A truly charming memory safely filed away.',
        'Splendid addition to the collection.',
      ],
    },
    WISH_COMPLETED: {
      expression: 'excited',
      captions: [
        'May this delightful wish be blessed! ✨',
        'A dignified celebration for your wish.',
      ],
    },
    GLOBAL_ERROR: {
      expression: 'smug',
      captions: [
        'Pardon me, a slight technical hiccup occurred.',
        'Smiling politely through the minor obstacle.',
      ],
    },
    GLOBAL_SUCCESS: {
      expression: 'excited',
      captions: [
        'Splendid outcome! Splendid indeed! 🌟',
        'Everything proceeded with utmost perfection.',
      ],
    },
  },

  'grumpy-tardar': {
    HOME_ENTERED: {
      expression: 'angry',
      captions: [
        'You’re back. What a shame. 😾',
        'I liked it better when you were away.',
      ],
    },
    LETTER_DRAFT_SAVED: {
      expression: 'angry',
      captions: [
        'Draft saved. Why bother?',
        'Another file on the computer. Great.',
      ],
    },
    LETTER_SENT: {
      expression: 'angry',
      captions: [
        'You sent it. It was probably a mistake. 😾',
        'Dispatched into the world. Awful.',
      ],
    },
    SECRET_UNLOCKED: {
      expression: 'angry',
      captions: [
        'Unlocked. I don’t care what’s in there.',
        'A secret revealed. I still dislike it.',
      ],
    },
    WISH_COMPLETED: {
      expression: 'judgmental',
      captions: [
        'Wish granted. Don’t get used to it.',
        'The lantern flew away. Good riddance.',
      ],
    },
    GLOBAL_ERROR: {
      expression: 'angry',
      captions: [
        'Failed. Just as I expected. 😾',
        'Disaster strikes. Best news today.',
      ],
    },
    GLOBAL_SUCCESS: {
      expression: 'neutral',
      captions: [
        'It worked. How annoying.',
        'Meh.',
      ],
    },
  },

  'pop-oatmeal-cat': {
    HOME_ENTERED: {
      expression: 'excited',
      captions: [
        'POP! Welcome! Pop pop pop! 😮',
        ':O  :I  :O  :I',
      ],
    },
    LETTER_DRAFT_SAVED: {
      expression: 'excited',
      captions: [
        'Pop! Saved! Pop! 🐾',
        'Draft locked in with a crisp pop!',
      ],
    },
    LETTER_SENT: {
      expression: 'excited',
      captions: [
        'POP POP POP! LETTER FIRED! 🚀',
        '1000 POPS PER SECOND SENT!',
      ],
    },
    SECRET_UNLOCKED: {
      expression: 'shocked',
      captions: [
        'MEGA POP! VAULT OPENED! :O',
        'POOOOOOP! SECRET OUT!',
      ],
    },
    MOMENT_ADDED: {
      expression: 'excited',
      captions: [
        'POP! MEMORY CAUGHT! 📸',
        'Pop photo secured!',
      ],
    },
    WISH_COMPLETED: {
      expression: 'excited',
      captions: [
        'POP POP POP! WISH IN THE SKY! 🌟',
        'MAXIMUM POP FLIGHT!',
      ],
    },
    GLOBAL_ERROR: {
      expression: 'derp',
      captions: [
        'POP ERROR! :I',
        'Pop derailed. Recalibrating jaw.',
      ],
    },
    GLOBAL_SUCCESS: {
      expression: 'excited',
      captions: [
        'POP SUCCESS! 🚀',
        'POP POP POP POP POP!',
      ],
    },
  },

  'dramatic-screaming-cat': {
    HOME_ENTERED: {
      expression: 'shocked',
      captions: [
        'THE PROTAGONIST ENTERS THE GRAND STAGE! 🎭',
        'A HERO RETURNS TO THE COSMIC REALM!',
      ],
    },
    LETTER_DRAFT_SAVED: {
      expression: 'shocked',
      captions: [
        'A SOLEMN DRAFT COMMITTED TO DESTINY!',
        'THE WORDS ARE ETCHED IN PARCHMENT FOREVER! 📜',
      ],
    },
    LETTER_SENT: {
      expression: 'excited',
      captions: [
        'THE PARCHMENT WINGS ACROSS THE COSMOS! A MASTERPIECE! 🎭',
        'STANDING OVATION FOR THIS SENT LETTER! ✨',
      ],
    },
    SECRET_UNLOCKED: {
      expression: 'shocked',
      captions: [
        'THE SACRED VAULT IS BREACHED! WHAT FORBIDDEN LORE?! 🙀',
        'I AM BESIDE MYSELF WITH SHOCK!',
      ],
    },
    MOMENT_ADDED: {
      expression: 'excited',
      captions: [
        'IMMORTALIZED IN THE ANNALS OF TIME! 🌟',
        'A MONUMENTAL SCENE PRESERVED!',
      ],
    },
    WISH_COMPLETED: {
      expression: 'excited',
      captions: [
        'THE HEAVENS HAVE ANSWERED! AN ENCORE! 🌟',
        'A CELESTIAL BLESSING OF EPIC SCALE!',
      ],
    },
    GLOBAL_ERROR: {
      expression: 'shocked',
      captions: [
        'THE TRAGEDY! THE AUDACITY OF THIS SYSTEM FAILURE! 🎭',
        'CURTAINS FALL IN UTTER DISARRAY!',
      ],
    },
    GLOBAL_SUCCESS: {
      expression: 'excited',
      captions: [
        'A TRIUMPH! BRAVO! ENCORE! ✨',
        'THE STARS HAVE ALIGNED IN MAJESTY!',
      ],
    },
  },

  'heavy-breathing-cat': {
    HOME_ENTERED: {
      expression: 'surprised',
      captions: [
        'Subject detected at terminal... [HEAVY BREATHING] 🫁',
        'Surveillance sweep online.',
      ],
    },
    LETTER_DRAFT_SAVED: {
      expression: 'neutral',
      captions: [
        'Draft logged in database... [BREATHING]',
        'Data packet secured.',
      ],
    },
    LETTER_SENT: {
      expression: 'surprised',
      captions: [
        'Transmission dispatched... [HEAVY BREATHING] 🫁',
        'Letter packet confirmed in flight.',
      ],
    },
    SECRET_UNLOCKED: {
      expression: 'surprised',
      captions: [
        'Vault decrypted... monitoring payload. [BREATHING]',
        'Classification level: TOP SECRET.',
      ],
    },
    MOMENT_ADDED: {
      expression: 'surprised',
      captions: [
        'Visual evidence cataloged into archive...',
        'Artifact archived. [BREATHING]',
      ],
    },
    WISH_COMPLETED: {
      expression: 'surprised',
      captions: [
        'Target coordinates locked in sky...',
        'Trajectory confirmed. [BREATHING]',
      ],
    },
    GLOBAL_ERROR: {
      expression: 'confused',
      captions: [
        'System anomaly detected... breathing intensifies.',
        'Signal noise detected in quadrant 4.',
      ],
    },
    GLOBAL_SUCCESS: {
      expression: 'surprised',
      captions: [
        '[RAPID HYPERVENTILATION OF JOY]',
        'Operation concluded successfully.',
      ],
    },
  },

  'legendary-golden-brain-cell': {
    HOME_ENTERED: {
      expression: 'smug',
      captions: [
        '✨ Golden light shines upon your return. ✨',
        'The cosmic brain cell welcomes the traveler.',
      ],
    },
    LETTER_DRAFT_SAVED: {
      expression: 'smug',
      captions: [
        'Sacred script preserved in the astral archives. ✨',
        'Cosmic wisdom saved safely.',
      ],
    },
    LETTER_SENT: {
      expression: 'excited',
      captions: [
        '👑 Celestial winds carry your royal words across the stars. 👑',
        'UNLIMITED ORANGE POWER DISPATCHED!',
      ],
    },
    SECRET_UNLOCKED: {
      expression: 'excited',
      captions: [
        '🌟 Ancient prophecy unlocked before your eyes! 🌟',
        'The golden mystery is revealed to the chosen one!',
      ],
    },
    MOMENT_ADDED: {
      expression: 'smug',
      captions: [
        'A divine memory inscribed into eternity. 🌟',
        'Golden constellation updated.',
      ],
    },
    WISH_COMPLETED: {
      expression: 'excited',
      captions: [
        '✨ Cosmic blessings rain upon this completed wish! ✨',
        'A legendary wish ascends to the higher realm!',
      ],
    },
    GLOBAL_ERROR: {
      expression: 'derp',
      captions: [
        'A minor cosmic turbulence in the astral plane.',
        'Even supreme deities encounter glitches.',
      ],
    },
    GLOBAL_SUCCESS: {
      expression: 'excited',
      captions: [
        '👑 TRIUMPH IN THE HEAVENS! 👑',
        'Perfection manifested across dimensions!',
      ],
    },
  },
};

/**
 * Resolves a Starlit event into a cat-specific reaction (expression + caption + positioning + duration).
 */
export function resolveStarlitEventReaction(
  cat: CatDefinition,
  eventType: StarlitEventType,
  metadata?: StarlitEventMetadata
): {
  genericReaction: CatGenericReaction;
  expression: CatExpressionType;
  caption: string;
  position: CatPositionPreset;
  duration: number;
} {
  const rule = STARLIT_EVENT_RULES[eventType] || {
    priority: 'LOW',
    defaultReaction: 'curious',
    preferredPosition: 'bottom-right',
    baseDuration: 5000,
    probability: 0.5,
  };

  const genericReaction = rule.defaultReaction;
  let expression = cat.defaultExpression;
  let caption = metadata?.customCaptionHint;

  // Check if this cat has event-specific dialogue & expression
  const catDialogue = EVENT_PERSONALITY_CAPTIONS[cat.id]?.[eventType];
  if (catDialogue) {
    if (catDialogue.expression) {
      expression = catDialogue.expression;
    }
    if (!caption && catDialogue.captions.length > 0) {
      const idx = Math.floor(Math.random() * catDialogue.captions.length);
      caption = catDialogue.captions[idx];
    }
  }

  // Fallback to cat's standard reaction map for this generic reaction
  if (!caption) {
    const reactionRule = cat.reactionMap[genericReaction];
    if (reactionRule && reactionRule.captionPool.length > 0) {
      expression = reactionRule.expression;
      const idx = Math.floor(Math.random() * reactionRule.captionPool.length);
      caption = reactionRule.captionPool[idx];
    }
  }

  // Final fallback safe caption
  if (!caption) {
    caption = `${cat.displayName} observes this moment. 🐾`;
  }

  // Determine duration
  const baseDuration = rule.baseDuration || 5500;
  const modifier = cat.reactionMap[genericReaction]?.durationModifier || 1.0;
  const duration = Math.round(baseDuration * modifier);

  return {
    genericReaction,
    expression,
    caption,
    position: rule.preferredPosition || 'bottom-right',
    duration,
  };
}
