import { EasterEggDefinition, EasterEggTriggerAction } from '../../types/catMeme';

/**
 * Phase 8: Centralized Easter Egg Registry for the One Brain Cell theme.
 * Contains a curated collection of 7 personality-driven Easter eggs.
 * Extensible for future additions.
 */
export const EASTER_EGG_REGISTRY: Record<string, EasterEggDefinition> = {
  'smudge-salad-incident': {
    id: 'smudge-salad-incident',
    title: 'The Salad Incident',
    catIds: ['smudge-the-cat'],
    triggerAction: 'pet',
    hint: {
      visualCue: 'salad_glance',
      clueText: 'Smudge squints suspiciously at incoming hands, checking for unwanted leafy greens.',
    },
    animationType: 'salad_recoil',
    caption: '...is that VEGETATION on your hand?! 🥗',
    soundId: 'smudge-refusal-squeak',
    description: 'Smudge recoils in culinary shock at the mere suspicion of approaching vegetables.',
    enabled: true,
  },

  'grumpy-fine': {
    id: 'grumpy-fine',
    title: 'Fine.',
    catIds: ['grumpy-cat'],
    triggerAction: 'treat',
    hint: {
      visualCue: 'suspicious_squint',
      clueText: 'Grumpy Cat glares at treats with unwavering disapproval.',
    },
    animationType: 'stoic_accept',
    caption: 'I ate it. I still hated it.',
    soundId: 'grumpy-low-grumble',
    description: 'Grumpy Cat reluctantly consumes a treat with complete, unwavering stoicism.',
    enabled: true,
  },

  'orange-single-spark': {
    id: 'orange-single-spark',
    title: 'Brain Cell Spark',
    catIds: ['orange-one-brain-cell'],
    triggerAction: 'pet',
    hint: {
      visualCue: 'antenna_flicker',
      clueText: 'Orange Cat’s antenna vibrates momentarily as if receiving a cosmic broadcast.',
    },
    animationType: 'antenna_overdrive',
    caption: 'Searching for signal... 0% packet loss! 🧠⚡',
    soundId: 'orange-antenna-ping',
    description: 'A miraculous moment where the single brain cell makes full contact with the mothership.',
    enabled: true,
  },

  'pop-rapid-symphony': {
    id: 'pop-rapid-symphony',
    title: 'Snack Pop Symphony',
    catIds: ['pop-cat'],
    triggerAction: 'treat',
    hint: {
      visualCue: 'bubble_twitch',
      clueText: 'Pop Cat’s lips quiver with the anticipation of an acoustic burst.',
    },
    animationType: 'rapid_pop_symphony',
    caption: 'POP! POP! POP! DELICIOUS. 🫧',
    soundId: 'pop-bubble-pop',
    description: 'Pop Cat delivers a rapid-fire triad of joyful acoustic pops upon tasting a treat.',
    enabled: true,
  },

  'maxwell-perpetual-motion': {
    id: 'maxwell-perpetual-motion',
    title: 'Perpetual Motion',
    catIds: ['maxwell'],
    triggerAction: 'pet',
    hint: {
      visualCue: 'spin_wobble',
      clueText: 'Maxwell gently wobbles on a frictionless rotational axis.',
    },
    animationType: 'perpetual_spin',
    caption: 'Angular momentum preserved. 🔄✨',
    soundId: 'maxwell-spin-hum',
    description: 'Maxwell achieves frictionless 360-degree rotational physics in defiance of classical mechanics.',
    enabled: true,
  },

  'beluga-unfazed-politician': {
    id: 'beluga-unfazed-politician',
    title: 'Unfazed Politician',
    catIds: ['beluga'],
    triggerAction: 'shoo',
    hint: {
      visualCue: 'polite_nod',
      clueText: 'Beluga nods with an immovable diplomatic smirk.',
    },
    animationType: 'unfazed_stare',
    caption: 'Your dismissal has been noted and archived. :) ✨',
    soundId: 'beluga-smirk-chirp',
    description: 'Beluga completely ignores your dismissal with polite, unwavering meme diplomacy.',
    enabled: true,
  },

  'concert-pop-bongo': {
    id: 'concert-pop-bongo',
    title: 'Unexpected Concert',
    catIds: ['pop-cat', 'bongo-cat'],
    triggerAction: 'combination',
    hint: {
      visualCue: 'musical_sparkle',
      clueText: 'When Pop Cat and Bongo Cat meet, musical clefs shimmer in the atmosphere.',
    },
    animationType: 'sync_jam',
    caption: '♪ Bongo beat + Pop tempo = Starlit harmony! ♫🥁',
    soundId: 'bongo-twin-tap',
    description: 'Pop Cat and Bongo Cat unite in an impromptu percussion jam across the viewport.',
    enabled: true,
    isCombination: true,
  },
};

/**
 * Retrieves an Easter egg definition by its immutable ID.
 */
export function getEasterEgg(eggId: string): EasterEggDefinition | undefined {
  return EASTER_EGG_REGISTRY[eggId];
}

/**
 * Returns all registered Easter egg definitions.
 */
export function getAllEasterEggs(): EasterEggDefinition[] {
  return Object.values(EASTER_EGG_REGISTRY);
}

/**
 * Returns all Easter eggs associated with a specific cat.
 */
export function getEasterEggsForCat(catId: string): EasterEggDefinition[] {
  return Object.values(EASTER_EGG_REGISTRY).filter(
    (egg) => egg.enabled && egg.catIds.includes(catId)
  );
}

/**
 * Finds a matching Easter egg for a given cat and trigger action,
 * taking into account active companion cats for combination eggs.
 */
export function findMatchingEasterEgg(
  catId: string,
  action: EasterEggTriggerAction,
  activeCatIds: string[] = []
): EasterEggDefinition | null {
  // 1. Check for combination eggs first if multiple cats are present
  if (activeCatIds.length > 1) {
    const comboEgg = Object.values(EASTER_EGG_REGISTRY).find((egg) => {
      if (!egg.enabled || !egg.isCombination) return false;
      // All required cat IDs in egg.catIds must be active
      const allRequiredActive = egg.catIds.every((id) => activeCatIds.includes(id));
      return allRequiredActive && egg.catIds.includes(catId);
    });

    if (comboEgg) {
      return comboEgg;
    }
  }

  // 2. Check for single-cat eggs matching the action
  const singleEgg = Object.values(EASTER_EGG_REGISTRY).find((egg) => {
    if (!egg.enabled || egg.isCombination) return false;
    return egg.catIds.includes(catId) && egg.triggerAction === action;
  });

  return singleEgg || null;
}
