export type UnlockType = 'discovered' | 'interaction' | 'milestone' | 'manual' | 'date';
export type SecretState = 'LOCKED' | 'HIDDEN' | 'DISCOVERED' | 'VIEWED';

export interface SecretItem {
  id: string;
  order: number;
  title: string;
  description: string;
  shortDescription?: string;
  content: string;
  icon: string;
  isHidden: boolean;
  unlockType: UnlockType;
  unlockCondition?: string;
  secretHint?: string;
  image?: string;
  discoveredAt?: number;
}
