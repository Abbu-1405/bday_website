import { SecretItem } from '../types';

export const sampleSecrets: SecretItem[] = [
  {
    id: 'secret-01',
    order: 1,
    title: 'A Whispered Beginning',
    description: 'A gentle echo from the day this quiet sanctuary began.',
    shortDescription: 'The initial whisper of our starlit space.',
    content: `Some stories don't start with fireworks or loud declarations. They start quietly, like a gentle whisper in a crowded room that somehow catches your full attention.

This vault holds those unwritten, quiet moments—the thoughts meant specifically for your eyes when the world goes still. Thank you for finding this first piece.`,
    icon: 'Key',
    isHidden: false,
    unlockType: 'discovered',
    unlockCondition: 'Discovered upon entering the quiet chamber for the first time.',
    secretHint: 'Step inside the vault.',
  },
  {
    id: 'secret-02',
    order: 2,
    title: 'Unspoken Gratitude',
    description: 'Something felt deeply, even when words failed to express it.',
    shortDescription: 'Unspoken words held in quiet appreciation.',
    content: `There are moments when gratitude is so overwhelming that spoken words feel too small to contain it.

I wanted a private place to record how much your presence means, even on days when I don't say it out loud. You bring a subtle grace into every room you enter.`,
    icon: 'Lock',
    isHidden: false,
    unlockType: 'interaction',
    unlockCondition: 'Unveiled through quiet interaction inside the vault.',
    secretHint: 'Look closely at the locked notes.',
  },
  {
    id: 'secret-03',
    order: 3,
    title: 'The Constellation Note',
    description: 'A quiet constellation mapped out in memory.',
    shortDescription: 'A starlit map of quiet understanding.',
    content: `If every shared laugh and quiet understanding was a star, we would have an entire galaxy mapped between us.

This note is a reminder to keep looking upward whenever things feel dark or uncertain. There is always light waiting to be discovered.`,
    icon: 'Eye',
    isHidden: true,
    unlockType: 'interaction',
    unlockCondition: 'Discovered by tapping the subtle glowing star in the vault chamber.',
    secretHint: 'Find the glowing starlit key hidden in the chamber.',
  },
  {
    id: 'secret-04',
    order: 4,
    title: 'A Promise to Remember',
    description: 'A commitment written for future quiet evenings.',
    shortDescription: 'A quiet promise preserved for silent hours.',
    content: `No matter how busy life becomes or how fast time seems to fly, I promise to always preserve this quiet, thoughtful corner for us.

A space where honesty, warmth, and genuine care will always take precedence over noise.`,
    icon: 'Feather',
    isHidden: false,
    unlockType: 'milestone',
    unlockCondition: 'Unlocked as you explore deeper into Starlit Letters.',
    secretHint: 'Continue your journey through the letters.',
  },
  {
    id: 'secret-05',
    order: 5,
    title: 'Midnight Paper Boat',
    description: 'A gentle secret set afloat under moonlight.',
    shortDescription: 'Setting subtle doubts afloat under moonlight.',
    content: `Imagine writing down every worry or doubt on a small sheet of paper, folding it into a boat, and letting the quiet river stream carry it far away into the night.

Whenever you feel weighed down, let this secret serve as your paper boat—a gentle reminder to release what you cannot control.`,
    icon: 'Sparkles',
    isHidden: true,
    unlockType: 'interaction',
    unlockCondition: 'Discovered by listening closely to the quiet chamber atmosphere.',
    secretHint: 'Look for something subtle in the quiet air.',
  },
  {
    id: 'secret-06',
    order: 6,
    title: 'The Unwritten Stanza',
    description: 'A line reserved for a future memory yet to unfold.',
    shortDescription: 'A blank line held for our next chapter.',
    content: `Some pages in a journal remain blank not because there is nothing to say, but because the best stories are still waiting to be written.

This stanza belongs to our next adventure, our next shared quiet moment, and the memories we have yet to build.`,
    icon: 'BookOpen',
    isHidden: true,
    unlockType: 'date',
    unlockCondition: 'Unfolds naturally as time passes in our universe.',
    secretHint: 'Return in quiet moments.',
  },
  {
    id: 'secret-07',
    order: 7,
    title: 'The Last Reflection',
    description: 'A final quiet message hidden at the edge of the vault.',
    shortDescription: 'A quiet message at the edge of curiosity.',
    content: `You reached the edge of this quiet vault. Finding these hidden notes shows your curiosity and thoughtfulness.

Remember that true connection isn't built in grand gestures alone, but in the quiet, patient care we extend to one another every day.`,
    icon: 'Shield',
    isHidden: false,
    unlockType: 'manual',
    unlockCondition: 'Uncovered after exploring the secrets of Starlit Letters.',
    secretHint: 'Uncover the surrounding secrets first.',
  },
];
