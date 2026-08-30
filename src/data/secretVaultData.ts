import { SecretItem } from '../types';

export const sampleSecrets: SecretItem[] = [
  {
    id: 'secret-01',
    order: 1,
    title: 'The Haircut Shock',
    emoji: '💇',
    description: 'Nee haircut tarvata ninnu chusina appudu oka second naaku em cheppalo kuda artham kaaledu...',
    shortDescription: 'Nee haircut tarvata shock...',
    content: `Nee haircut tarvata ninnu chusina appudu oka second naaku em cheppalo kuda artham kaaledu 😭

Actually konchem shock ayya 😂

Chala simple moment ae, kani enduko adi naaku ippatiki gurthundi.`,
    icon: 'Key',
    isHidden: false,
    unlockType: 'discovered',
    unlockCondition: 'Discovered upon entering the quiet chamber for the first time.',
    secretHint: 'Step inside the vault.',
  },
  {
    id: 'secret-02',
    order: 2,
    title: 'The Photographer Who Failed Us',
    emoji: '📸',
    description: 'Mana first photos kosam chala excited ga unna. Photos vachaka chuste...',
    shortDescription: 'The story behind our first photos...',
    content: `Mana first photos kosam chala excited ga unna.

Photos vachaka chuste... 😂

Asalu photographer em chesado naaku ippatiki artham kaadu 😭

Kani emaina sare, avi mana first photos kada... so avi alaane special.`,
    icon: 'Lock',
    isHidden: false,
    unlockType: 'interaction',
    unlockCondition: 'Unveiled through quiet interaction inside the vault.',
    secretHint: 'Look closely at the locked notes.',
  },
  {
    id: 'secret-03',
    order: 3,
    title: 'The Things That Happened Before This',
    emoji: '💻💥',
    description: 'Ee website ki enni versions unnayo naake sariga teliyadu...',
    shortDescription: 'All the versions & crashes before this...',
    content: `Ee website ki enni versions unnayo naake sariga teliyadu 😂

Oka idea vasthe adi build cheyadam, nachakapothe marchadam, malli inkoti try cheyadam... ila chala chesa.

Konni things naa mind lo super ga anipinchayi, build chesaka matram "idi enti ra babu" anipinchindi 😭

Madhyalo Starlit Letters crash kuda ayindi.

Antha work chesi build chesina tarvata motham break avvadam chala irritating ga anipinchindi.

Kani malli fix chesa, malli build chesa.

Ippudu nuvvu chustunna version venaka ila chala mess undi 😂`,
    icon: 'Eye',
    isHidden: true,
    unlockType: 'interaction',
    unlockCondition: 'Discovered by tapping the subtle glowing star in the vault chamber.',
    secretHint: 'Find the glowing starlit key hidden in the chamber.',
  },
  {
    id: 'secret-04',
    order: 4,
    title: 'Why I Called It Starlit Letters',
    emoji: '🗝️',
    description: 'Actually "Starlit Letters" ane name enduku pettano exact ga oka big reason ani cheppalenu...',
    shortDescription: 'Why the name Starlit Letters was chosen...',
    content: `Actually "Starlit Letters" ane name enduku pettano exact ga oka big reason ani cheppalenu 😂

Kani aa name vinagane letters, memories, night sky... ila oka feeling vastundi.

Anduke naaku aa name nachindi.

So finally Starlit Letters ani fix chesa. 🌌`,
    icon: 'Feather',
    isHidden: false,
    unlockType: 'milestone',
    unlockCondition: 'Unlocked as you explore deeper into Starlit Letters.',
    secretHint: 'Continue your journey through the letters.',
  },
  {
    id: 'secret-05',
    order: 5,
    title: 'The Three Slips & First Flowers',
    emoji: '🌸🎟️',
    description: 'Aa roju nuvvu three slips ichi ekkadiki teesukeltunnavo guess cheyamannav...',
    shortDescription: 'Three slips, ISKCON clues & first flowers...',
    content: `Aa roju nuvvu three slips ichi ekkadiki teesukeltunnavo guess cheyamannav 😂

Nenu clues follow chestu vachesa.

ISKCON lo nee kosam first time flowers konna.

Chinna thing ae... kani aa roju tho kalisi adi kuda naaku gurthundipoyindi. 🌸`,
    icon: 'Sparkles',
    isHidden: true,
    unlockType: 'interaction',
    unlockCondition: 'Discovered by exploring subtle details across Starlit Letters.',
    secretHint: 'Look for something subtle in the quiet air.',
  },
  {
    id: 'secret-06',
    order: 6,
    title: 'The Things We Made for Each Other',
    emoji: '🎁',
    description: 'Friendship Day time lo nenu nee kosam webpage chesa. Nuvvu naa kosam photos tho collection chesav...',
    shortDescription: 'Creating things for each other...',
    content: `Friendship Day time lo nenu nee kosam webpage chesa.

Nuvvu naa kosam photos tho collection chesav.

Naaku interesting ga anipinchedi enti ante, iddaram okariki okaram edo create chesam... kani okati code, inkoti photos 😂

Different ga unna, rendu kuda mana daggare unnayi.`,
    icon: 'BookOpen',
    isHidden: true,
    unlockType: 'date',
    unlockCondition: 'Unfolds naturally as time passes in our universe.',
    secretHint: 'Return in quiet moments.',
  },
  {
    id: 'secret-07',
    order: 7,
    title: 'The Story of Starlit Letters',
    emoji: '🌌',
    description: 'Starlit Letters ippudu unnattu first nunchi ledu. Chala things change ayyayi...',
    shortDescription: 'How this became our small world...',
    content: `Starlit Letters ippudu unnattu first nunchi ledu.

Chala things change ayyayi, chala ideas vachayi, konni work ayyayi, konni assalu work avvaledu 😂

Slow ga anni kalisi ippudu unna version vachindi.

Inka entha change chesthano naake teliyadu 😭

Kani oka point ki idi just oka website laga kakunda, manam create chesina oka small world laga anipinchindi.

Anduke idi naaku konchem special. 🌌`,
    icon: 'Shield',
    isHidden: false,
    unlockType: 'manual',
    unlockCondition: 'Uncovered after exploring the secrets of Starlit Letters.',
    secretHint: 'Uncover the surrounding secrets first.',
  },
];
