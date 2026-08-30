import { CatAudioDefinition, CatSoundSpec } from '../../types/catMeme';

/**
 * Standard exaggerated meme micro-action sound specifications (Phase 7).
 */
export const STANDARD_PET_SOUND: CatSoundSpec = {
  soundId: 'interaction-pet-purr',
  name: 'Exaggerated Meme Purr',
  synthType: 'purr',
  baseFreq: 75,
  duration: 0.9,
  warmth: 0.5,
};

export const STANDARD_TREAT_SOUND: CatSoundSpec = {
  soundId: 'interaction-treat-crunch',
  name: 'Exaggerated Meme Crunch',
  synthType: 'crunch',
  baseFreq: 420,
  duration: 0.55,
};

export const STANDARD_SHOO_SOUND: CatSoundSpec = {
  soundId: 'interaction-shoo-boing',
  name: 'Exaggerated Dramatic Boing',
  synthType: 'dramatic_boing',
  baseFreq: 540,
  duration: 0.45,
};

/**
 * Centralized audio registry for each Famous Cat in the One Brain Cell ecosystem.
 * Exactly ONE signature sound per cat + reaction-specific sound specs.
 */
export const FAMOUS_CAT_AUDIO_REGISTRY: Record<string, CatAudioDefinition> = {
  'orange-one-brain-cell': {
    catId: 'orange-one-brain-cell',
    signatureSound: {
      soundId: 'orange-antenna-ping',
      name: 'Brain Cell Antenna Ping',
      synthType: 'meow',
      baseFreq: 520,
      duration: 0.6,
      warmth: 0.2,
    },
    reactionSounds: {
      curious: {
        soundId: 'orange-react-curious',
        name: 'Orange Curious Sniff',
        synthType: 'chirp',
        baseFreq: 580,
        duration: 0.35,
      },
      surprised: {
        soundId: 'orange-react-surprised',
        name: 'Orange Thought Overload',
        synthType: 'screech',
        baseFreq: 700,
        duration: 0.3,
      },
      sleepy: {
        soundId: 'orange-react-sleepy',
        name: 'Orange Nap Purr',
        synthType: 'purr',
        baseFreq: 60,
        duration: 0.8,
        warmth: 0.6,
      },
      confused: {
        soundId: 'orange-react-confused',
        name: 'Orange Signal Search',
        synthType: 'glissando',
        baseFreq: 420,
        duration: 0.5,
      },
      excited: {
        soundId: 'orange-react-excited',
        name: 'Orange Zoomies Hum',
        synthType: 'wobble',
        baseFreq: 620,
        duration: 0.45,
      },
    },
  },

  'smudge-the-cat': {
    catId: 'smudge-the-cat',
    signatureSound: {
      soundId: 'smudge-salad-scoff',
      name: 'Salad Refusal Squeak',
      synthType: 'meow',
      baseFreq: 620,
      duration: 0.45,
      pitchMultiplier: 1.15,
    },
    reactionSounds: {
      confused: {
        soundId: 'smudge-confused-table',
        name: 'Confused Stare Ping',
        synthType: 'glissando',
        baseFreq: 490,
        duration: 0.4,
      },
      annoyed: {
        soundId: 'smudge-annoyed-vegetable',
        name: 'Vegetable Rejection',
        synthType: 'dramatic_boing',
        baseFreq: 480,
        duration: 0.35,
      },
      curious: {
        soundId: 'smudge-sniff-plate',
        name: 'Inspect Salad Plate',
        synthType: 'chirp',
        baseFreq: 560,
        duration: 0.25,
      },
    },
  },

  'grumpy-cat': {
    catId: 'grumpy-cat',
    signatureSound: {
      soundId: 'grumpy-signature-no',
      name: 'Resolute Low Grumble',
      synthType: 'deep_grumble',
      baseFreq: 130,
      duration: 0.65,
    },
    reactionSounds: {
      sleepy: {
        soundId: 'grumpy-reluctant-rest',
        name: 'Grumpy Nap Sigh',
        synthType: 'deep_grumble',
        baseFreq: 110,
        duration: 0.7,
      },
      annoyed: {
        soundId: 'grumpy-annoyed-sigh',
        name: 'Unimpressed Grumble',
        synthType: 'deep_grumble',
        baseFreq: 150,
        duration: 0.5,
      },
      confused: {
        soundId: 'grumpy-disdain-gliss',
        name: 'Disdainful Glance',
        synthType: 'glissando',
        baseFreq: 280,
        duration: 0.4,
      },
    },
  },

  'pop-cat': {
    catId: 'pop-cat',
    signatureSound: {
      soundId: 'popcat-signature-pop',
      name: 'Resonant Bubble Pop',
      synthType: 'pop',
      baseFreq: 680,
      duration: 0.12,
    },
    reactionSounds: {
      excited: {
        soundId: 'popcat-excited-pops',
        name: 'Rapid Pop Flourish',
        synthType: 'pop',
        baseFreq: 820,
        duration: 0.14,
      },
      curious: {
        soundId: 'popcat-curious-pop',
        name: 'Soft Inquisitive Pop',
        synthType: 'pop',
        baseFreq: 560,
        duration: 0.1,
      },
      surprised: {
        soundId: 'popcat-wide-pop',
        name: 'Wide Open Pop',
        synthType: 'pop',
        baseFreq: 920,
        duration: 0.15,
      },
    },
  },

  'bingus': {
    catId: 'bingus',
    signatureSound: {
      soundId: 'bingus-wholesome-squeak',
      name: 'Gentle Wholesome Chirp',
      synthType: 'chirp',
      baseFreq: 640,
      duration: 0.35,
      warmth: 0.5,
    },
    reactionSounds: {
      sleepy: {
        soundId: 'bingus-warm-purr',
        name: 'Bingus Warm Blanket Purr',
        synthType: 'purr',
        baseFreq: 80,
        duration: 0.8,
        warmth: 0.7,
      },
      excited: {
        soundId: 'bingus-cheerful-meow',
        name: 'Bingus Happy Greeting',
        synthType: 'meow',
        baseFreq: 580,
        duration: 0.5,
        warmth: 0.6,
      },
    },
  },

  'floppa': {
    catId: 'floppa',
    signatureSound: {
      soundId: 'floppa-ear-flop',
      name: 'Floppa Resonance Chime',
      synthType: 'meow',
      baseFreq: 340,
      duration: 0.6,
    },
    reactionSounds: {
      excited: {
        soundId: 'floppa-cement-crunch',
        name: 'Floppa Snack Chomp',
        synthType: 'crunch',
        baseFreq: 360,
        duration: 0.5,
      },
      confused: {
        soundId: 'floppa-ear-twitch',
        name: 'Floppa Tuft Twitch',
        synthType: 'chirp',
        baseFreq: 480,
        duration: 0.3,
      },
    },
  },

  'beluga': {
    catId: 'beluga',
    signatureSound: {
      soundId: 'beluga-polite-smirk',
      name: 'Polite Anime Smirk Chirp',
      synthType: 'chirp',
      baseFreq: 720,
      duration: 0.28,
    },
    reactionSounds: {
      surprised: {
        soundId: 'beluga-dramatic-gasp',
        name: 'Hecker Alert Glissando',
        synthType: 'glissando',
        baseFreq: 600,
        duration: 0.45,
      },
      confused: {
        soundId: 'beluga-discord-ping',
        name: 'Innocent Question Tone',
        synthType: 'meow',
        baseFreq: 550,
        duration: 0.4,
      },
    },
  },

  'maxwell': {
    catId: 'maxwell',
    signatureSound: {
      soundId: 'maxwell-spinning-theme',
      name: 'Rotary 360 Spin Hum',
      synthType: 'spinning_hum',
      baseFreq: 330,
      duration: 0.65,
    },
    reactionSounds: {
      excited: {
        soundId: 'maxwell-spin-fast',
        name: 'High Speed Rotation Hum',
        synthType: 'spinning_hum',
        baseFreq: 440,
        duration: 0.5,
      },
      curious: {
        soundId: 'maxwell-spin-tilt',
        name: 'Tilted Orbit Tone',
        synthType: 'wobble',
        baseFreq: 380,
        duration: 0.45,
      },
    },
  },

  'churu-craver': {
    catId: 'churu-craver',
    signatureSound: {
      soundId: 'churu-signature-slurp',
      name: 'Enthusiastic Churu Slurp',
      synthType: 'churu_slurp',
      baseFreq: 480,
      duration: 0.38,
    },
    reactionSounds: {
      excited: {
        soundId: 'churu-packet-crinkle',
        name: 'Treat Packet Sighting',
        synthType: 'crunch',
        baseFreq: 500,
        duration: 0.45,
      },
      surprised: {
        soundId: 'churu-snack-spotted',
        name: 'Target Treat Locked',
        synthType: 'chirp',
        baseFreq: 650,
        duration: 0.28,
      },
    },
  },

  'banana-cat': {
    catId: 'banana-cat',
    signatureSound: {
      soundId: 'bananacat-happy-gliss',
      name: 'Happy Banana Melody',
      synthType: 'meow',
      baseFreq: 580,
      duration: 0.55,
      warmth: 0.4,
    },
    reactionSounds: {
      sleepy: {
        soundId: 'bananacat-peel-nap',
        name: 'Tucked In Peel Purr',
        synthType: 'purr',
        baseFreq: 90,
        duration: 0.7,
      },
      surprised: {
        soundId: 'bananacat-tears-gasp',
        name: 'Dramatic Tear Drop',
        synthType: 'glissando',
        baseFreq: 520,
        duration: 0.4,
      },
    },
  },

  'el-wiwi': {
    catId: 'el-wiwi',
    signatureSound: {
      soundId: 'elwiwi-tiny-pip',
      name: 'Microscopic Wiwi Chirp',
      synthType: 'chirp',
      baseFreq: 850,
      duration: 0.22,
      warmth: 0.3,
    },
    reactionSounds: {
      curious: {
        soundId: 'elwiwi-micro-sniff',
        name: 'Tiny Curious Pip',
        synthType: 'chirp',
        baseFreq: 920,
        duration: 0.18,
      },
      excited: {
        soundId: 'elwiwi-tiny-step',
        name: 'Miniature Patter',
        synthType: 'pop',
        baseFreq: 760,
        duration: 0.12,
      },
    },
  },

  'heavy-breathing-cat': {
    catId: 'heavy-breathing-cat',
    signatureSound: {
      soundId: 'heavy-breathing-inhale',
      name: 'Concentrated Respiratory Hum',
      synthType: 'deep_grumble',
      baseFreq: 115,
      duration: 0.75,
    },
    reactionSounds: {
      confused: {
        soundId: 'heavy-breathing-calculate',
        name: 'Pondering Glissando',
        synthType: 'glissando',
        baseFreq: 220,
        duration: 0.5,
      },
      surprised: {
        soundId: 'heavy-breathing-intense',
        name: 'Heightened Focus Purr',
        synthType: 'purr',
        baseFreq: 70,
        duration: 0.7,
      },
    },
  },

  'screaming-cat': {
    catId: 'screaming-cat',
    signatureSound: {
      soundId: 'thurston-shrimp-shout',
      name: 'Passionate Thurston Yowl',
      synthType: 'screech',
      baseFreq: 820,
      duration: 0.42,
    },
    reactionSounds: {
      surprised: {
        soundId: 'thurston-outrage-shout',
        name: 'Theatrical Outrage Yowl',
        synthType: 'screech',
        baseFreq: 880,
        duration: 0.45,
      },
      excited: {
        soundId: 'thurston-triumph-call',
        name: 'Triumphant Battle Cry',
        synthType: 'screech',
        baseFreq: 780,
        duration: 0.38,
      },
    },
  },

  'standing-cat': {
    catId: 'standing-cat',
    signatureSound: {
      soundId: 'standing-cat-alert-ping',
      name: 'Bipedal Periscope Ping',
      synthType: 'chirp',
      baseFreq: 670,
      duration: 0.3,
    },
    reactionSounds: {
      surprised: {
        soundId: 'standing-cat-stand-tall',
        name: 'Postural Alert Glance',
        synthType: 'glissando',
        baseFreq: 580,
        duration: 0.35,
      },
      curious: {
        soundId: 'standing-cat-horizon-scan',
        name: 'Horizon Reconnaissance',
        synthType: 'chirp',
        baseFreq: 710,
        duration: 0.26,
      },
    },
  },

  'longcat': {
    catId: 'longcat',
    signatureSound: {
      soundId: 'longcat-infinite-meow',
      name: 'Elongated Stratosphere Meow',
      synthType: 'meow',
      baseFreq: 460,
      duration: 0.85,
    },
    reactionSounds: {
      excited: {
        soundId: 'longcat-reach-orbit',
        name: 'Ascending Note Wave',
        synthType: 'glissando',
        baseFreq: 400,
        duration: 0.65,
      },
    },
  },

  'tacgnol': {
    catId: 'tacgnol',
    signatureSound: {
      soundId: 'tacgnol-dark-matter-rumble',
      name: 'Cosmic Anti-Matter Tone',
      synthType: 'deep_grumble',
      baseFreq: 95,
      duration: 0.85,
    },
    reactionSounds: {
      confused: {
        soundId: 'tacgnol-void-shift',
        name: 'Abyssal Frequency Sweep',
        synthType: 'glissando',
        baseFreq: 180,
        duration: 0.55,
      },
    },
  },

  'keyboard-cat': {
    catId: 'keyboard-cat',
    signatureSound: {
      soundId: 'keyboard-cat-outro-melody',
      name: 'Play Him Off Keyboard Flourish',
      synthType: 'piano_tinkle',
      baseFreq: 523.25,
      duration: 0.55,
    },
    reactionSounds: {
      excited: {
        soundId: 'keyboard-cat-solo',
        name: 'Upbeat Keyboard Run',
        synthType: 'piano_tinkle',
        baseFreq: 659.25,
        duration: 0.6,
      },
      surprised: {
        soundId: 'keyboard-cat-chord-stab',
        name: 'Dramatic Keyboard Chord',
        synthType: 'piano_tinkle',
        baseFreq: 783.99,
        duration: 0.4,
      },
    },
  },

  'bongo-cat': {
    catId: 'bongo-cat',
    signatureSound: {
      soundId: 'bongo-tap-double',
      name: 'Twin Paw Bongo Tap',
      synthType: 'pop',
      baseFreq: 580,
      duration: 0.18,
    },
    reactionSounds: {
      excited: {
        soundId: 'bongo-drum-roll',
        name: 'Rapid Percussion Wave',
        synthType: 'pop',
        baseFreq: 720,
        duration: 0.22,
      },
    },
  },

  'nyan-cat': {
    catId: 'nyan-cat',
    signatureSound: {
      soundId: 'nyan-pop-tart-laser',
      name: 'Rainbow Cosmic Chime',
      synthType: 'laser',
      baseFreq: 1100,
      duration: 0.45,
    },
    reactionSounds: {
      excited: {
        soundId: 'nyan-rainbow-boost',
        name: 'Pastry Trail Acceleration',
        synthType: 'laser',
        baseFreq: 1350,
        duration: 0.35,
      },
    },
  },

  'maru': {
    catId: 'maru',
    signatureSound: {
      soundId: 'maru-box-slide-thump',
      name: 'Cardboard Box Dive',
      synthType: 'pop',
      baseFreq: 320,
      duration: 0.25,
    },
    reactionSounds: {
      sleepy: {
        soundId: 'maru-box-nap',
        name: 'Snug Box Purr',
        synthType: 'purr',
        baseFreq: 75,
        duration: 0.75,
      },
    },
  },

  'walter-cat': {
    catId: 'walter-cat',
    signatureSound: {
      soundId: 'walter-monotone-meow',
      name: 'Stoic Front-Facing Meow',
      synthType: 'meow',
      baseFreq: 390,
      duration: 0.5,
    },
    reactionSounds: {
      confused: {
        soundId: 'walter-stare-hum',
        name: 'Direct Camera Stare',
        synthType: 'wobble',
        baseFreq: 350,
        duration: 0.4,
      },
    },
  },

  'wobbly-cat': {
    catId: 'wobbly-cat',
    signatureSound: {
      soundId: 'wobbly-vibrating-pitch',
      name: 'Oscillating Kinetic Meow',
      synthType: 'wobble',
      baseFreq: 460,
      duration: 0.55,
    },
    reactionSounds: {
      excited: {
        soundId: 'wobbly-gyroscope-spin',
        name: 'Dynamic Balance Surge',
        synthType: 'wobble',
        baseFreq: 540,
        duration: 0.48,
      },
    },
  },

  'snack-thief-cat': {
    catId: 'snack-thief-cat',
    signatureSound: {
      soundId: 'snack-thief-sneaky-nom',
      name: 'Heist Nibble Sound',
      synthType: 'crunch',
      baseFreq: 490,
      duration: 0.42,
    },
    reactionSounds: {
      surprised: {
        soundId: 'snack-thief-busted',
        name: 'Caught Red-Pawed Boing',
        synthType: 'dramatic_boing',
        baseFreq: 620,
        duration: 0.38,
      },
    },
  },
};

/**
 * Returns audio definition for a cat ID or provides a graceful fallback.
 */
export function getCatAudioDefinition(catId: string): CatAudioDefinition {
  const custom = FAMOUS_CAT_AUDIO_REGISTRY[catId];
  if (custom) return custom;

  // Safe fallback
  return {
    catId,
    signatureSound: {
      soundId: `${catId}-generic-meow`,
      name: 'Meme Cat Meow',
      synthType: 'meow',
      baseFreq: 480,
      duration: 0.55,
    },
    reactionSounds: {
      curious: {
        soundId: `${catId}-generic-curious`,
        name: 'Curious Chirp',
        synthType: 'chirp',
        baseFreq: 560,
        duration: 0.3,
      },
      surprised: {
        soundId: `${catId}-generic-surprised`,
        name: 'Surprised Ping',
        synthType: 'screech',
        baseFreq: 720,
        duration: 0.28,
      },
      sleepy: {
        soundId: `${catId}-generic-purr`,
        name: 'Sleepy Purr',
        synthType: 'purr',
        baseFreq: 70,
        duration: 0.7,
      },
      confused: {
        soundId: `${catId}-generic-gliss`,
        name: 'Confused Glissando',
        synthType: 'glissando',
        baseFreq: 400,
        duration: 0.45,
      },
      excited: {
        soundId: `${catId}-generic-wobble`,
        name: 'Excited Wobble',
        synthType: 'wobble',
        baseFreq: 590,
        duration: 0.42,
      },
    },
  };
}
