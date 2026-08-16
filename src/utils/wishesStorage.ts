import { recordActivity } from '../services/activityService';

const STORAGE_KEY = 'starlit_wishes_collected';

export function getCollectedWishIds(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as string[];
  } catch {
    return [];
  }
}

export function isWishCollected(wishId: string): boolean {
  return getCollectedWishIds().includes(wishId);
}

export function collectWish(wishId: string): string[] {
  try {
    const current = getCollectedWishIds();
    if (!current.includes(wishId)) {
      const updated = [...current, wishId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Record activity event
      recordActivity({
        type: 'wish_collected',
        section: 'wishes',
        itemId: wishId,
      });

      return updated;
    }
    return current;
  } catch {
    return getCollectedWishIds();
  }
}

export function resetCollectedWishes(): string[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch {
    return [];
  }
}
