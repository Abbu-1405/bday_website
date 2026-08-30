import {
  CatDefinition,
  CatGenericReaction,
  CatPositionPreset,
  MemeRarity,
} from '../../types/catMeme';

/**
 * Built-in registry of famous meme cats with deterministic identities,
 * personalities, signature behaviors, expressions, and caption pools.
 */
export const FAMOUS_CAT_REGISTRY: Record<string, CatDefinition> = {
  'orange-one-brain-cell': {
    id: 'orange-one-brain-cell',
    displayName: 'One Brain Cell',
    personality: 'clueless',
    personalityTags: ['orange', 'head-empty', 'vibrating', 'antenna'],
    signatureBehavior: 'Stares into the cosmos while the antenna searches for signal.',
    defaultExpression: 'derp',
    availableExpressions: ['derp', 'curious', 'surprised', 'sleepy', 'confused', 'excited'],
    appearanceWeight: 35,
    rarity: 'common',
    archetypeColor: '#F97316',
    enabled: true,
    idleCaptions: [
      'Searching for the brain cell... 📡',
      'No thoughts. Head completely empty. ✨',
      'Connection lost: Retrying server...',
      'Just a little guy doing his best 🐾',
      'Vibrating at a frequency only orange cats hear.',
    ],
    reactionMap: {
      curious: {
        expression: 'curious',
        captionPool: [
          'Sniffing this component... 🐾',
          'Is this edible or interactive?',
          'Investigating with 10% processing power.',
        ],
      },
      surprised: {
        expression: 'surprised',
        captionPool: [
          'A thought attempted to enter! 🙀',
          'Brain cell overload detected!',
          'What did I just witness?!',
        ],
      },
      sleepy: {
        expression: 'sleepy',
        captionPool: [
          'Low battery. Entering nap mode. 💤',
          'One brain cell needs 14 hours of sleep.',
          'Zzz... dreaming of cheese wrappers...',
        ],
        durationModifier: 1.2,
      },
      confused: {
        expression: 'confused',
        captionPool: [
          'Calculating... error 404: thought not found.',
          'Where did the cursor go?',
          'Wait, is today Tuesday?',
        ],
      },
      excited: {
        expression: 'excited',
        captionPool: [
          'ORANGE ZOOMIES INITIATED! 🚀',
          'Found the brain cell! (Lost it immediately)',
          'Maximum chaos unlocked! ✨',
        ],
        durationModifier: 0.9,
      },
    },
    memeVariants: [
      {
        id: 'orange-basic-sticker',
        catId: 'orange-one-brain-cell',
        presentationType: 'sticker',
        expression: 'derp',
        captionTemplate: 'Single thought processing...',
        rarity: 'common',
        enabled: true,
      },
      {
        id: 'orange-antenna-reaction',
        catId: 'orange-one-brain-cell',
        presentationType: 'reaction',
        expression: 'surprised',
        captionTemplate: 'Brain cell ping received!',
        rarity: 'common',
        enabled: true,
      },
    ],
    progression: {
      maxLevel: 7,
      levels: [
        {
          level: 1,
          name: 'Stranger',
          minPoints: 0,
          description: 'Staring straight past you into the cosmic void.',
          unlockedBehaviors: ['basic_derp_idle'],
          acknowledgementQuotes: [
            'Searching for the brain cell... 📡',
            'No thoughts. Head empty. ✨',
          ],
        },
        {
          level: 2,
          name: 'Blurry Outline',
          minPoints: 50,
          description: 'Noticed an orange blob exists in the room.',
          unlockedBehaviors: ['curious_sniff'],
          acknowledgementQuotes: [
            'I think I saw you before... or was that a moth? 🐾',
            'Wait... someone is here?',
          ],
        },
        {
          level: 3,
          name: 'Signal Detector',
          minPoints: 150,
          description: 'Antenna twitches in your general direction.',
          unlockedBehaviors: ['antenna_pulse', 'quicker_snack_react'],
          acknowledgementQuotes: [
            'Antenna locked onto your signal! 📡',
            'A familiar frequency detected!',
          ],
        },
        {
          level: 4,
          name: 'Regular Feeder',
          minPoints: 320,
          description: 'Associates your clicks with potential treats.',
          unlockedBehaviors: ['treat_begging', 'excited_wobble'],
          acknowledgementQuotes: [
            'Did you bring snacks? You always have good clicks! 🍪',
            'My favorite human arrived!',
          ],
        },
        {
          level: 5,
          name: 'Warm Radiator',
          minPoints: 580,
          description: 'Sits near your active tab for thermal comfort.',
          unlockedBehaviors: ['warm_loaf', 'screen_purr'],
          acknowledgementQuotes: [
            'Purring softly next to your letters... 💤',
            'This tab is nice and warm.',
          ],
        },
        {
          level: 6,
          name: 'Brain Cell Trustee',
          minPoints: 920,
          description: 'Entrusted you with holding the single brain cell (lost it immediately).',
          unlockedBehaviors: ['trustee_crown', 'super_zoomies'],
          acknowledgementQuotes: [
            'I trust you with the brain cell! ...where did it go? 🙀',
            'Best friends across the multiverse!',
          ],
        },
        {
          level: 7,
          name: 'Cosmic Antenna',
          minPoints: 1400,
          description: 'Permanent telepathic orange frequency established.',
          unlockedBehaviors: ['cosmic_orange_glow', 'eternal_bond'],
          acknowledgementQuotes: [
            'We share the eternal orange frequency forever! 🌟',
            'Soulmates of the zero-thought realm. ✨',
          ],
        },
      ],
      customMilestones: {
        encounterMilestones: [1, 5, 20, 50, 100],
        interactionMilestones: [1, 10, 25, 50],
      },
    },
  },

  'smudge-table-cat': {
    id: 'smudge-table-cat',
    displayName: 'Smudge',
    personality: 'judgmental',
    personalityTags: ['table-cat', 'salad-hater', 'unimpressed', 'squint'],
    signatureBehavior: 'Sits at the dining table squinting disdainfully at green vegetables.',
    defaultExpression: 'judgmental',
    availableExpressions: ['judgmental', 'neutral', 'confused', 'smug'],
    appearanceWeight: 25,
    rarity: 'common',
    archetypeColor: '#E2E8F0',
    enabled: true,
    idleCaptions: [
      'I did not ask for salad. 🥗',
      'Silently judging your decisions.',
      'Unimpressed by everything happening here.',
      'Why are they yelling across the table again?',
    ],
    reactionMap: {
      curious: {
        expression: 'neutral',
        captionPool: [
          'Glancing at you with mild skepticism.',
          'Is that food or just more salad?',
          'I am observing your mistakes.',
        ],
      },
      surprised: {
        expression: 'judgmental',
        captionPool: [
          'You actually did that? Seriously?',
          'The audacity to place that in front of me.',
          'Squinting with intense disapproval.',
        ],
      },
      sleepy: {
        expression: 'judgmental',
        captionPool: [
          'I am tired of looking at this table.',
          'Wake me when meat arrives.',
          'Dismissing this entire conversation.',
        ],
      },
      confused: {
        expression: 'confused',
        captionPool: [
          'Why are two women yelling at me?',
          'What is that green thing on my plate?',
          'I don’t know what you want from me.',
        ],
      },
      excited: {
        expression: 'smug',
        captionPool: [
          'The salad has been knocked off the table. 😼',
          'Victory. The plate is clear.',
          'A rare moment of feline satisfaction.',
        ],
      },
    },
    memeVariants: [
      {
        id: 'smudge-salad-reaction',
        catId: 'smudge-table-cat',
        presentationType: 'reaction',
        expression: 'judgmental',
        captionTemplate: 'No vegetables allowed.',
        rarity: 'common',
        enabled: true,
      },
    ],
    progression: {
      maxLevel: 7,
      levels: [
        {
          level: 1,
          name: 'Salad Giver',
          minPoints: 0,
          description: 'Despises your choice of vegetables and human dinner habits.',
          unlockedBehaviors: ['disdainful_squint'],
          acknowledgementQuotes: [
            'I did not ask for salad. 🥗',
            'Silently judging your dinner choices.',
          ],
        },
        {
          level: 2,
          name: 'Table Intruder',
          minPoints: 50,
          description: 'Squints with intense dining skepticism across the table.',
          unlockedBehaviors: ['table_peek'],
          acknowledgementQuotes: [
            'You are back at my table again?',
            'Still holding that fork, I see.',
          ],
        },
        {
          level: 3,
          name: 'Plate Inspector',
          minPoints: 150,
          description: 'Verifies whether actual meat is present on your plate.',
          unlockedBehaviors: ['snack_audit', 'frown_nod'],
          acknowledgementQuotes: [
            'Let me inspect this tab for vegetables.',
            'Acceptable content. Not great, but acceptable.',
          ],
        },
        {
          level: 4,
          name: 'Tolerated Diner',
          minPoints: 320,
          description: 'Graciously permits you to occupy the seat opposite his plate.',
          unlockedBehaviors: ['table_paw_rest', 'chair_claim'],
          acknowledgementQuotes: [
            'You may sit there. Just do not pass the greens.',
            'A tolerable dining companion.',
          ],
        },
        {
          level: 5,
          name: 'Anti-Greens Ally',
          minPoints: 580,
          description: 'Nods in approval when you push the broccoli away.',
          unlockedBehaviors: ['synchronized_squint', 'condescending_purr'],
          acknowledgementQuotes: [
            'We agree: vegetables were a mistake. 😼',
            'United against healthy greens.',
          ],
        },
        {
          level: 6,
          name: 'Feasting Companion',
          minPoints: 920,
          description: 'Shares a mutual disdain for leafy meals and loud arguments.',
          unlockedBehaviors: ['plate_swipe', 'table_throne'],
          acknowledgementQuotes: [
            'Only the finest treats for our table.',
            'You have earned my culinary respect.',
          ],
        },
        {
          level: 7,
          name: 'VIP Table Partner',
          minPoints: 1400,
          description: 'Knocks the salad bowl off the table in your honor.',
          unlockedBehaviors: ['legendary_salad_swat', 'table_monarch'],
          acknowledgementQuotes: [
            'The salad is gone. Our bond is eternal. 👑',
            'Top tier dining partner in crime!',
          ],
        },
      ],
      customMilestones: {
        encounterMilestones: [1, 5, 20, 50, 100],
        interactionMilestones: [1, 10, 25, 50],
      },
    },
  },

  'polite-ollie-cat': {
    id: 'polite-ollie-cat',
    displayName: 'Polite Ollie',
    personality: 'polite',
    personalityTags: ['polite-smile', 'awkward', 'gentleman', 'well-mannered'],
    signatureBehavior: 'Maintains a polite, tight-lipped smile through awkward moments.',
    defaultExpression: 'smug',
    availableExpressions: ['smug', 'neutral', 'curious', 'surprised'],
    appearanceWeight: 20,
    rarity: 'common',
    archetypeColor: '#CBD5E1',
    enabled: true,
    idleCaptions: [
      'Just smiling politely. 😊',
      'Patiently waiting for your command, sir.',
      'Maintaining diplomatic composure.',
      'Yes, hello. Very nice website.',
    ],
    reactionMap: {
      curious: {
        expression: 'curious',
        captionPool: [
          'Pardon me, what might this be?',
          'Inquiring with the utmost respect.',
          'May I inspect this element, please?',
        ],
      },
      surprised: {
        expression: 'surprised',
        captionPool: [
          'Oh goodness gracious! 🐱',
          'My apologies for the slight startle.',
          'Good heavens, that was unexpected!',
        ],
      },
      sleepy: {
        expression: 'smug',
        captionPool: [
          'Politely drifting into slumber.',
          'Excuse me while I rest my gentle eyes.',
          'Napping in a very civilized manner.',
        ],
      },
      confused: {
        expression: 'smug',
        captionPool: [
          'Smiling through the utter bewilderment.',
          'I have no idea what is happening, but yes.',
          'I agree with whatever you just did.',
        ],
      },
      excited: {
        expression: 'excited',
        captionPool: [
          'Splendid! Truly marvelous! ✨',
          'A refined and dignified celebration.',
          'Politely thrilled by this development.',
        ],
      },
    },
    progression: {
      maxLevel: 7,
      levels: [
        {
          level: 1,
          name: 'Formal Stranger',
          minPoints: 0,
          description: 'Politely nods from a dignified distance.',
          unlockedBehaviors: ['polite_nod'],
          acknowledgementQuotes: [
            'Greetings, honored visitor. 😊',
            'A very pleasant day to you.',
          ],
        },
        {
          level: 2,
          name: 'Polite Acquaintance',
          minPoints: 50,
          description: 'Tight-lipped courteous greeting on arrival.',
          unlockedBehaviors: ['gentle_bow'],
          acknowledgementQuotes: [
            'Delighted to cross paths once more.',
            'Welcome back, kind friend.',
          ],
        },
        {
          level: 3,
          name: 'Diplomatic Ally',
          minPoints: 150,
          description: 'Offers a gentle bow and pleasant salutation.',
          unlockedBehaviors: ['refined_paw_wave'],
          acknowledgementQuotes: [
            'A true pleasure to assist your correspondence.',
            'Always at your polite service.',
          ],
        },
        {
          level: 4,
          name: 'Esteemed Guest',
          minPoints: 320,
          description: 'Warm, respectful smile reserved for valued visitors.',
          unlockedBehaviors: ['civilized_purr'],
          acknowledgementQuotes: [
            'My dearest acquaintance! How marvelous! ✨',
            'Splendid to share this moment together.',
          ],
        },
        {
          level: 5,
          name: 'Trusted Confidant',
          minPoints: 580,
          description: 'A relaxed, genuine grin of mutual understanding.',
          unlockedBehaviors: ['relaxed_polite_grin'],
          acknowledgementQuotes: [
            'Between us gentlemen, you write wonderfully.',
            'I hold our friendship in highest esteem.',
          ],
        },
        {
          level: 6,
          name: 'Distinguished Companion',
          minPoints: 920,
          description: 'Invites you to polite feline afternoon tea.',
          unlockedBehaviors: ['high_tea_toast'],
          acknowledgementQuotes: [
            'May I offer a warm cup of celebratory tea? ☕',
            'A bond of aristocratic nobility!',
          ],
        },
        {
          level: 7,
          name: 'Dearest Life Friend',
          minPoints: 1400,
          description: 'Unbroken bond of utmost courtesy and affection.',
          unlockedBehaviors: ['noble_smile_glow'],
          acknowledgementQuotes: [
            'You are family to me, my dearest friend. 💖',
            'Forever your loyal, polite companion.',
          ],
        },
      ],
    },
  },

  'grumpy-tardar': {
    id: 'grumpy-tardar',
    displayName: 'Grumpy Cat',
    personality: 'angry',
    personalityTags: ['grumpy', 'frown', 'disappointed', 'no'],
    signatureBehavior: 'Maintains an iconic, unyielding frown of pure disappointment.',
    defaultExpression: 'angry',
    availableExpressions: ['angry', 'judgmental', 'neutral'],
    appearanceWeight: 14,
    rarity: 'uncommon',
    archetypeColor: '#A8A29E',
    enabled: true,
    idleCaptions: [
      'No. 😾',
      'I had fun once. It was awful.',
      'If you’re happy and you know it... stop.',
      'There are two types of people. I dislike both.',
    ],
    reactionMap: {
      curious: {
        expression: 'angry',
        captionPool: [
          'I took a look. I hated it.',
          'Do not click that. Or do. I don’t care.',
          'Pointless curiosity.',
        ],
      },
      surprised: {
        expression: 'angry',
        captionPool: [
          'Disaster! Excellent news.',
          'Terrible. Just as expected.',
          'My disappointment is immeasurable.',
        ],
      },
      sleepy: {
        expression: 'judgmental',
        captionPool: [
          'Go away. I am sleeping.',
          'Nap time is the only acceptable time.',
          'Do not disturb my frown.',
        ],
      },
      confused: {
        expression: 'angry',
        captionPool: [
          'I don’t understand, and I don’t care.',
          'Why are you asking me?',
          'Still no.',
        ],
      },
      excited: {
        expression: 'angry',
        captionPool: [
          'Everything went wrong. Best day ever.',
          'A slight decrease in my eternal annoyance.',
          'Meh.',
        ],
      },
    },
    progression: {
      maxLevel: 7,
      levels: [
        {
          level: 1,
          name: 'Complete Nuisance',
          minPoints: 0,
          description: 'Despises your entire presence and clicks.',
          unlockedBehaviors: ['unyielding_frown'],
          acknowledgementQuotes: [
            'No. 😾',
            'Why are you still here?',
          ],
        },
        {
          level: 2,
          name: 'Tolerated Annoyance',
          minPoints: 50,
          description: 'Dislikes you slightly less than everyone else in the world.',
          unlockedBehaviors: ['grumpy_glance'],
          acknowledgementQuotes: [
            'You again. Joy.',
            'I hate this page less when you are quiet.',
          ],
        },
        {
          level: 3,
          name: 'Acceptable Silence',
          minPoints: 150,
          description: 'Allows you to be miserable in the same room.',
          unlockedBehaviors: ['reluctant_sit'],
          acknowledgementQuotes: [
            'Fine. You can type. Do not smile.',
            'We can sit here and hate everything together.',
          ],
        },
        {
          level: 4,
          name: 'Fellow Pessimist',
          minPoints: 320,
          description: 'Shares a mutual distaste for overly cheerful things.',
          unlockedBehaviors: ['sour_nod'],
          acknowledgementQuotes: [
            'Your grumpiness is almost adequate.',
            'Another terrible day. Glad you are here to see it.',
          ],
        },
        {
          level: 5,
          name: 'Designated Frown Target',
          minPoints: 580,
          description: 'Frowns specifically in your direction with loyal consistency.',
          unlockedBehaviors: ['custom_frown_tilt'],
          acknowledgementQuotes: [
            'I saved my worst frown for you. You’re welcome.',
            'You are the only acceptable nuisance.',
          ],
        },
        {
          level: 6,
          name: 'Reluctant Accomplice',
          minPoints: 920,
          description: 'Admitted today was only 98% terrible.',
          unlockedBehaviors: ['frown_softening'],
          acknowledgementQuotes: [
            'Today was slightly less horrible because of you.',
            'Do not tell anyone, but you’re alright.',
          ],
        },
        {
          level: 7,
          name: 'Best Worst Friend',
          minPoints: 1400,
          description: 'Will frown loyally by your side through anything.',
          unlockedBehaviors: ['eternal_grumpy_guardian'],
          acknowledgementQuotes: [
            'I hate everyone else. You can stay forever. 😾❤️',
            'Partners in eternal grumpiness.',
          ],
        },
      ],
    },
  },

  'pop-oatmeal-cat': {
    id: 'pop-oatmeal-cat',
    displayName: 'Pop Cat',
    personality: 'chaotic',
    personalityTags: ['pop-pop', 'wide-mouth', 'bouncing', 'speed'],
    signatureBehavior: 'Opens mouth in rapid rhythmic pops with boundless kinetic energy.',
    defaultExpression: 'excited',
    availableExpressions: ['excited', 'surprised', 'derp', 'shocked'],
    appearanceWeight: 14,
    rarity: 'uncommon',
    archetypeColor: '#FBBF24',
    enabled: true,
    idleCaptions: [
      'POP! 😮',
      'Pop pop pop pop pop!',
      'Resting between pop intervals...',
      ':O  :I  :O  :I',
    ],
    reactionMap: {
      curious: {
        expression: 'surprised',
        captionPool: [
          'Tiny inquisitive pop? 🐱',
          'pop...',
          'Sniffing with open mouth :O',
        ],
      },
      surprised: {
        expression: 'shocked',
        captionPool: [
          'MEGA POP ACTIVATED! :O',
          'POOOOOOOP!',
          'Jaws unhinged in pure awe!',
        ],
      },
      sleepy: {
        expression: 'derp',
        captionPool: [
          'Slow gentle micro-pop... 💤',
          'Sleepy popping...',
          'Closing mouth for the night.',
        ],
      },
      confused: {
        expression: 'derp',
        captionPool: [
          'Pop? Pop who? Pop what?',
          'Pop syntax error.',
          ':I',
        ],
      },
      excited: {
        expression: 'excited',
        captionPool: [
          'POP POP POP POP POP! 🚀',
          '1000 POPS PER SECOND!',
          'MAXIMUM POP SPEED REACHED!',
        ],
        durationModifier: 0.8,
      },
    },
    progression: {
      maxLevel: 7,
      levels: [
        {
          level: 1,
          name: 'Slow Pop',
          minPoints: 0,
          description: 'Curious quiet :O testing the acoustics.',
          unlockedBehaviors: ['single_pop'],
          acknowledgementQuotes: ['pop! :O', ':I  :O'],
        },
        {
          level: 2,
          name: 'Rhythm Matcher',
          minPoints: 50,
          description: 'Synchronizes popping with your clicks and navigation.',
          unlockedBehaviors: ['double_pop'],
          acknowledgementQuotes: ['Pop pop! Welcome back! :O', 'Popping in sync!'],
        },
        {
          level: 3,
          name: 'High-Speed Popper',
          minPoints: 150,
          description: 'Rapid pop barrage when entering your screen!',
          unlockedBehaviors: ['triple_pop_speed'],
          acknowledgementQuotes: ['POP POP POP! 🚀', 'Can’t stop popping! :O'],
        },
        {
          level: 4,
          name: 'Kinetic Partner',
          minPoints: 320,
          description: 'Pop-dancing enthusiastically alongside your letters.',
          unlockedBehaviors: ['pop_dance_bounce'],
          acknowledgementQuotes: ['POP PARTY IN YOUR HONOR! ✨', 'Fastest pops in the West!'],
        },
        {
          level: 5,
          name: 'Pop Resonance',
          minPoints: 580,
          description: 'Harmonic pop frequency vibrating at 200 BPM!',
          unlockedBehaviors: ['sonic_pop_wave'],
          acknowledgementQuotes: ['SUPER POP OVERDRIVE! :O', 'Pure pop joy!'],
        },
        {
          level: 6,
          name: 'Hypersonic Pop',
          minPoints: 920,
          description: 'Pop sonic shockwave breaking the sound barrier!',
          unlockedBehaviors: ['hypersonic_pops'],
          acknowledgementQuotes: ['POP MACH 5 ACHIEVED! 💨', 'Boundless popping energy!'],
        },
        {
          level: 7,
          name: 'Eternal Pop Champion',
          minPoints: 1400,
          description: 'The fastest, most legendary popping companion in the universe.',
          unlockedBehaviors: ['eternal_pop_sparkle'],
          acknowledgementQuotes: ['FOREVER POPPING WITH YOU! 🌟 :O', 'Ultimate Pop Soulmates! ✨'],
        },
      ],
    },
  },

  'dramatic-screaming-cat': {
    id: 'dramatic-screaming-cat',
    displayName: 'Dramatic Screaming Cat',
    personality: 'dramatic',
    personalityTags: ['screaming', 'melodramatic', 'opera', 'chaos'],
    signatureBehavior: 'Gasps dramatically and acts out a complete three-act opera.',
    defaultExpression: 'shocked',
    availableExpressions: ['shocked', 'surprised', 'excited', 'confused'],
    appearanceWeight: 7,
    rarity: 'rare',
    archetypeColor: '#F43F5E',
    enabled: true,
    idleCaptions: [
      'THE TENSION IN THIS AIR! 🎭',
      'A tragedy of Shakespearean proportions!',
      'Gasping silently for effect...',
      'Why must the universe test me so?!',
    ],
    reactionMap: {
      curious: {
        expression: 'surprised',
        captionPool: [
          'A clue?! In THIS timeline?!',
          'Hark! What mystery approaches?',
          'Leaning in with profound suspense...',
        ],
      },
      surprised: {
        expression: 'shocked',
        captionPool: [
          'THE BETRAYAL! THE AUDACITY! 🙀',
          'I AM BESIDE MYSELF WITH SHOCK!',
          'A PLOT TWIST OF EPIC SCALE!',
        ],
        durationModifier: 1.25,
      },
      sleepy: {
        expression: 'shocked',
        captionPool: [
          'Fainting dramatically onto the chaise lounge!',
          'I expire... of sheer exhaustion...',
          'Curtains falling on today’s act.',
        ],
      },
      confused: {
        expression: 'confused',
        captionPool: [
          'WHAT DOES THE SCRIPT EVEN MEAN?!',
          'My motivation in this scene is unclear!',
          'Chaos in the writers’ room!',
        ],
      },
      excited: {
        expression: 'excited',
        captionPool: [
          'A TRIUMPH! BRAVO! ENCORE! ✨',
          'STANDING OVATION FOR THIS ACTION!',
          'THE STARS HAVE ALIGNED!',
        ],
      },
    },
    progression: {
      maxLevel: 7,
      levels: [
        {
          level: 1,
          name: 'Audience Member',
          minPoints: 0,
          description: 'Gasps dramatically at your unexpected entrance.',
          unlockedBehaviors: ['theatrical_gasp'],
          acknowledgementQuotes: [
            'AN AUDIENCE MEMBER APPEARS! 🎭',
            'Hark! Who enters my theatre?!',
          ],
        },
        {
          level: 2,
          name: 'Understudy',
          minPoints: 50,
          description: 'Critiques your dramatic pauses and UI timing.',
          unlockedBehaviors: ['dramatic_pause'],
          acknowledgementQuotes: [
            'Ah, my faithful understudy returns!',
            'More passion in that click, darling!',
          ],
        },
        {
          level: 3,
          name: 'Scene Partner',
          minPoints: 150,
          description: 'Rehearses three-act tragic monologues with you.',
          unlockedBehaviors: ['duet_shriek'],
          acknowledgementQuotes: [
            'Cue the dramatic lighting! We perform together!',
            'A stage presence second only to mine!',
          ],
        },
        {
          level: 4,
          name: 'Co-Star in Melodrama',
          minPoints: 320,
          description: 'Duet of operatic theatrical screams echoing through the tab.',
          unlockedBehaviors: ['chaise_lounge_faint'],
          acknowledgementQuotes: [
            'OUR HEARTS BEAT AS ONE DRAMATIC OPERA! 🙀',
            'Bravo! The drama is exquisite!',
          ],
        },
        {
          level: 5,
          name: 'Standing Ovation',
          minPoints: 580,
          description: 'Faints onto velvet cushions in your praise.',
          unlockedBehaviors: ['rose_toss_ovation'],
          acknowledgementQuotes: [
            'I WEEP TEARS OF UNBRIDLED ARTISTIC JOY! ✨',
            'Encore! Encore for my dearest co-star!',
          ],
        },
        {
          level: 6,
          name: 'Prima Donna’s Muse',
          minPoints: 920,
          description: 'Dedicates an entire operatic tragedy symphony to you.',
          unlockedBehaviors: ['symphonic_screech'],
          acknowledgementQuotes: [
            'You inspire every high C I reach! 🎶',
            'My greatest muse across all stages!',
          ],
        },
        {
          level: 7,
          name: 'Broadway Legend',
          minPoints: 1400,
          description: 'Final curtain call together with golden confetti and thunderous applause.',
          unlockedBehaviors: ['golden_curtain_call'],
          acknowledgementQuotes: [
            'THE SHOW OF A LIFETIME! ETERNAL STANDING OVATION! 👑🎭',
            'Legends of the starlit stage forever!',
          ],
        },
      ],
    },
  },

  'heavy-breathing-cat': {
    id: 'heavy-breathing-cat',
    displayName: 'Heavy Breathing Cat',
    personality: 'suspicious',
    personalityTags: ['heavy-breathing', 'intense-stare', 'investigating', 'mystery'],
    signatureBehavior: 'Stares directly through your monitor with heavy, intense breathing.',
    defaultExpression: 'surprised',
    availableExpressions: ['surprised', 'confused', 'judgmental', 'neutral'],
    appearanceWeight: 5,
    rarity: 'rare',
    archetypeColor: '#64748B',
    enabled: true,
    idleCaptions: [
      '[HEAVY BREATHING] 🫁',
      'Unblinking surveillance in progress.',
      'I know what you clicked.',
      'Breathing intensifies...',
    ],
    reactionMap: {
      curious: {
        expression: 'surprised',
        captionPool: [
          'Approaching lens... [BREATHING]',
          'Target acquired and tracked.',
          'Enhanced zoom on cursor.',
        ],
      },
      surprised: {
        expression: 'surprised',
        captionPool: [
          '[TACTICAL BREATHING SPIKE] 🙀',
          'The data... it is confirmed.',
          'Heart rate elevated to 400 BPM.',
        ],
      },
      sleepy: {
        expression: 'neutral',
        captionPool: [
          '[Heavy rhythmic sleep breathing] 💤',
          'Sleeping with one eye open.',
          'Standby power surveillance.',
        ],
      },
      confused: {
        expression: 'confused',
        captionPool: [
          'Recalibrating sensor matrix...',
          'Breathing with perplexed intensity.',
          'Anomaly detected in sector 7.',
        ],
      },
      excited: {
        expression: 'surprised',
        captionPool: [
          '[RAPID HYPERVENTILATION OF JOY]',
          'The prophecy unfolds before my eyes.',
          'Maximum intensity engaged!',
        ],
      },
    },
    progression: {
      maxLevel: 7,
      levels: [
        {
          level: 1,
          name: 'Unidentified Subject',
          minPoints: 0,
          description: '[DISTANT HEAVY BREATHING] Tracking unknown subject.',
          unlockedBehaviors: ['tactical_stare'],
          acknowledgementQuotes: [
            '[HEAVY BREATHING] Target spotted.',
            'Subject detected in perimeter.',
          ],
        },
        {
          level: 2,
          name: 'Tracked Entity',
          minPoints: 50,
          description: '[TACTICAL ZOOM] Continuous optical surveillance.',
          unlockedBehaviors: ['zoomed_surveillance'],
          acknowledgementQuotes: [
            '[BREATHING INTENSIFIES] Subject logged in database.',
            'Maintaining unblinking eye contact.',
          ],
        },
        {
          level: 3,
          name: 'Monitored Contact',
          minPoints: 150,
          description: '[RESPIRATORY RATE STABILIZING] Familiar presence registered.',
          unlockedBehaviors: ['steady_gaze'],
          acknowledgementQuotes: [
            '[Calibrated breathing] You are recognized.',
            'Surveillance status: Friendly asset.',
          ],
        },
        {
          level: 4,
          name: 'Verified Target',
          minPoints: 320,
          description: '[BREATHES IN SYNC WITH YOUR CLICKS] Operational synergy.',
          unlockedBehaviors: ['synchronized_breathing'],
          acknowledgementQuotes: [
            '[HARMONIZED INHALE] Good click, operative.',
            'Synchronized tracking active.',
          ],
        },
        {
          level: 5,
          name: 'Classified Asset',
          minPoints: 580,
          description: '[PURRING BLENDED WITH HEAVY BREATHING] High clearance level.',
          unlockedBehaviors: ['tactical_purr'],
          acknowledgementQuotes: [
            '[DEEP PURR-BREATHING] Security clearance granted.',
            'My most trusted collaborator.',
          ],
        },
        {
          level: 6,
          name: 'Chief Operative',
          minPoints: 920,
          description: '[EXHALES DRAMATIC SIGH OF APPROVAL] Full tactical partnership.',
          unlockedBehaviors: ['covert_nod'],
          acknowledgementQuotes: [
            '[SATISFIED EXHALE] Mission success guaranteed with you.',
            'Top agent in the field.',
          ],
        },
        {
          level: 7,
          name: 'Top Secret Partner',
          minPoints: 1400,
          description: '[PERFECT BREATHING EQUILIBRIUM] Eternal classified bond.',
          unlockedBehaviors: ['tactical_aura_shield'],
          acknowledgementQuotes: [
            '[ETERNAL HARMONIC BREATHING] Lifetime partnership confirmed. 🔒❤️',
            'Classified soulmates forever.',
          ],
        },
      ],
    },
  },

  'legendary-golden-brain-cell': {
    id: 'legendary-golden-brain-cell',
    displayName: 'The Golden Brain Cell',
    personality: 'smug',
    personalityTags: ['golden', 'transcendent', 'all-knowing', 'prophesied'],
    signatureBehavior: 'Floats in golden majesty holding the single legendary cosmic brain cell.',
    defaultExpression: 'smug',
    availableExpressions: ['smug', 'excited', 'derp', 'curious'],
    appearanceWeight: 2,
    rarity: 'legendary',
    archetypeColor: '#F59E0B',
    enabled: true,
    idleCaptions: [
      '✨ You have been visited by The Prophesied One. ✨',
      'The single brain cell of the universe is mine.',
      'Basking in radiant orange enlightenment.',
      'Cosmic wisdom: Eat snacks, take naps. 🌟',
    ],
    reactionMap: {
      curious: {
        expression: 'curious',
        captionPool: [
          'The cosmic threads weave an interesting pattern...',
          'Observing from the astral plane.',
          'A curious vibration in the multiverse.',
        ],
      },
      surprised: {
        expression: 'excited',
        captionPool: [
          '🌟 A GLORIOUS SURPRISE IN THE HEAVENS! 🌟',
          'The golden brain cell vibrates with energy!',
          'A legendary alignment of celestial stars!',
        ],
        durationModifier: 1.3,
      },
      sleepy: {
        expression: 'derp',
        captionPool: [
          'Even deities require twenty hours of slumber.',
          'The cosmos enters astral dreamland.',
          'Golden snores echoing through eternity...',
        ],
      },
      confused: {
        expression: 'derp',
        captionPool: [
          'Even with infinite knowledge, I am baffled.',
          'A glitch in the cosmic fabric.',
          'Head empty, but in golden HD.',
        ],
      },
      excited: {
        expression: 'excited',
        captionPool: [
          '👑 TRANSCENDENT COSMIC ZOOMIES! 👑',
          'UNLIMITED ORANGE POWER!',
          'Blessings of luck upon this letter!',
        ],
        durationModifier: 1.2,
      },
    },
    progression: {
      maxLevel: 7,
      levels: [
        {
          level: 1,
          name: 'Mortal Seeker',
          minPoints: 0,
          description: 'Basks you in distant golden celestial rays.',
          unlockedBehaviors: ['golden_celestial_glow'],
          acknowledgementQuotes: [
            '✨ You stand in the presence of the Prophesied One. ✨',
            'A mortal gaze upon the golden brain cell.',
          ],
        },
        {
          level: 2,
          name: 'Cosmic Novice',
          minPoints: 50,
          description: 'Bestows a glowing speck of cosmic dust upon your cursor.',
          unlockedBehaviors: ['stardust_trail'],
          acknowledgementQuotes: [
            'The celestial cosmos recognizes your persistence. 🌟',
            'A speck of wisdom falls upon your path.',
          ],
        },
        {
          level: 3,
          name: 'Starlit Disciple',
          minPoints: 150,
          description: 'Reveals the ancient secrets of the 18-hour cat nap.',
          unlockedBehaviors: ['astral_blessing'],
          acknowledgementQuotes: [
            'You learn well, seeker of starlight.',
            'The golden brain cell pulses in your favor.',
          ],
        },
        {
          level: 4,
          name: 'Astral Wanderer',
          minPoints: 320,
          description: 'Shares visions of infinite golden catnip galaxies.',
          unlockedBehaviors: ['golden_halo_pulse'],
          acknowledgementQuotes: [
            'Together we travel the orange cosmos! 🚀',
            'A magnificent soul walks beside royalty.',
          ],
        },
        {
          level: 5,
          name: 'Celestial Companion',
          minPoints: 580,
          description: 'Golden aura shields your written memories with starlight.',
          unlockedBehaviors: ['starlit_protection'],
          acknowledgementQuotes: [
            'Your letters shall be preserved in cosmic starlight. ✨',
            'Blessed by the golden aura of feline royalty.',
          ],
        },
        {
          level: 6,
          name: 'Brain Cell Guardian',
          minPoints: 920,
          description: 'Permits you to bask in 100% golden brain cell clarity.',
          unlockedBehaviors: ['divine_clarity_spark'],
          acknowledgementQuotes: [
            'You are worthy to guard the golden brain cell! 👑',
            'The cosmos sings of our eternal bond.',
          ],
        },
        {
          level: 7,
          name: 'Sovereign of the Cosmos',
          minPoints: 1400,
          description: 'United in eternal cosmic orange glory across all dimensions.',
          unlockedBehaviors: ['omnipotent_orange_transcendence'],
          acknowledgementQuotes: [
            'WE ARE ONE WITH THE COSMIC BRAIN CELL FOREVER! 🌟👑✨',
            'Sovereigns of Starlit Letters across eternity!',
          ],
        },
      ],
    },
  },
};

/**
 * Helper: Retrieve all registered and enabled cats.
 */
export function getAllRegisteredCats(): CatDefinition[] {
  return Object.values(FAMOUS_CAT_REGISTRY).filter((c) => c.enabled);
}

/**
 * Helper: Retrieve a specific cat definition by ID with fallback.
 */
export function getCatDefinition(id: string): CatDefinition {
  return FAMOUS_CAT_REGISTRY[id] || FAMOUS_CAT_REGISTRY['orange-one-brain-cell'];
}

/**
 * Weighted random cat selection avoiding recent duplicate spawns.
 */
export function selectWeightedRandomCat(
  recentCatIds: string[] = [],
  candidatePool?: CatDefinition[]
): CatDefinition {
  const cats = candidatePool || getAllRegisteredCats();
  if (cats.length === 0) {
    return FAMOUS_CAT_REGISTRY['orange-one-brain-cell'];
  }

  // Filter out recent cats if alternatives exist
  const recentSet = new Set(recentCatIds);
  const candidates =
    cats.filter((c) => !recentSet.has(c.id)).length > 0
      ? cats.filter((c) => !recentSet.has(c.id))
      : cats;

  const totalWeight = candidates.reduce(
    (sum, cat) => sum + (cat.appearanceWeight || 10),
    0
  );

  let randomVal = Math.random() * totalWeight;
  for (const cat of candidates) {
    const weight = cat.appearanceWeight || 10;
    if (randomVal <= weight) {
      return cat;
    }
    randomVal -= weight;
  }

  return candidates[0] || FAMOUS_CAT_REGISTRY['orange-one-brain-cell'];
}
