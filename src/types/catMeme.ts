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

export type CatReactionEvent =
  | 'LETTER_OPENED'
  | 'LETTER_SENT'
  | 'SECRET_UNLOCKED'
  | 'SECRET_LOCKED'
  | 'MOMENT_OPENED'
  | 'EMPTY_STATE'
  | 'ERROR'
  | 'LOADING'
  | 'SUCCESS'
  | 'NOTIFICATION_RECEIVED'
  | 'USER_IDLE';

export type ChaosLevel = 'NORMAL' | 'ACTIVE' | 'CHAOS';

export type MemeRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface CatMemeItem {
  id: string;
  category: CatMemeCategory;
  title: string;
  svgKey: string;
  caption?: string;
  teluguCaption?: string;
  rarity: MemeRarity;
  trigger?: CatReactionEvent;
  animation?: string;
}

export type CatEventType =
  | 'walk'
  | 'peek'
  | 'fall'
  | 'run'
  | 'judgment'
  | 'sit'
  | 'pawprints'
  | 'caption'
  | 'cursor_react'
  | 'system_override'
  | 'invasion';

export interface ActiveCatEvent {
  id: string;
  type: CatEventType;
  memeId: string;
  caption?: string;
  x?: number; // percentage 0-100
  y?: number; // percentage 0-100
  duration: number; // ms
  createdAt: number;
  direction?: 'left' | 'right';
  interactive?: boolean;
}

export interface CatReactionPayload {
  event: CatReactionEvent;
  meme: CatMemeItem;
  caption: string;
  customDetail?: string;
}

export interface CatEasterEgg {
  id: string;
  name: string;
  hint: string;
  unlocked: boolean;
  discoveredAt?: number;
}
