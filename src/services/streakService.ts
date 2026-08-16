import { StreakData } from '../types/achievements';
import { recordActivity } from './activityService';

const STREAK_KEY = 'starlit_streaks_data';

export function getStreakData(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.currentStreak === 'number') {
        return parsed;
      }
    }
  } catch {
    // Safe fallback
  }

  const today = new Date().toISOString().split('T')[0];
  return {
    currentStreak: 1,
    longestStreak: 1,
    lastVisitDate: today,
    historyDates: [today],
  };
}

export function recordDailyVisit(): StreakData {
  const currentData = getStreakData();
  const today = new Date().toISOString().split('T')[0];

  if (currentData.lastVisitDate === today) {
    return currentData;
  }

  const last = new Date(currentData.lastVisitDate);
  const now = new Date(today);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let newCurrent = currentData.currentStreak;
  if (diffDays === 1) {
    newCurrent += 1;
  } else if (diffDays > 1) {
    newCurrent = 1;
  }

  const newLongest = Math.max(currentData.longestStreak || 1, newCurrent);
  const historySet = new Set(currentData.historyDates || []);
  historySet.add(today);

  const updated: StreakData = {
    currentStreak: newCurrent,
    longestStreak: newLongest,
    lastVisitDate: today,
    historyDates: Array.from(historySet),
  };

  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(updated));

    // Record activity event
    recordActivity({
      type: 'streak_updated',
      section: 'streaks',
      itemId: `streak-${updated.currentStreak}`,
      metadata: {
        currentStreak: updated.currentStreak,
        longestStreak: updated.longestStreak,
      },
    });
  } catch {
    // Local storage safe fallback
  }

  return updated;
}
