import { recordActivity } from '../services/activityService';

const READ_NOTES_KEY = 'starlit_read_note_ids';
const FAVORITE_NOTES_KEY = 'starlit_favorite_note_ids';

/**
 * Service to manage 365 Notes read and favorite persistence locally.
 * Prepares isolated interface for future Firebase synchronization.
 */
export const notesProgressService = {
  getReadNoteIds(): string[] {
    try {
      const data = localStorage.getItem(READ_NOTES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getFavoriteNoteIds(): string[] {
    try {
      const data = localStorage.getItem(FAVORITE_NOTES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isNoteRead(noteId: string): boolean {
    const ids = this.getReadNoteIds();
    return ids.includes(noteId);
  },

  isNoteFavorite(noteId: string): boolean {
    const ids = this.getFavoriteNoteIds();
    return ids.includes(noteId);
  },

  markNoteAsRead(noteId: string): string[] {
    if (!noteId) return this.getReadNoteIds();
    const readIds = new Set<string>(this.getReadNoteIds());
    if (!readIds.has(noteId)) {
      readIds.add(noteId);
      const arr = [...readIds];
      try {
        localStorage.setItem(READ_NOTES_KEY, JSON.stringify(arr));
      } catch {
        // Safe fallback for restricted storage environments
      }

      // Record activity event
      recordActivity({
        type: 'note_opened',
        section: 'notes',
        itemId: noteId,
      });

      return arr;
    }
    return [...readIds];
  },

  toggleNoteFavorite(noteId: string): string[] {
    if (!noteId) return this.getFavoriteNoteIds();
    const favoriteIds = new Set<string>(this.getFavoriteNoteIds());
    if (favoriteIds.has(noteId)) {
      favoriteIds.delete(noteId);
    } else {
      favoriteIds.add(noteId);
    }
    const arr = [...favoriteIds];
    try {
      localStorage.setItem(FAVORITE_NOTES_KEY, JSON.stringify(arr));
    } catch {
      // Safe fallback for restricted storage environments
    }
    return arr;
  },

  clearNotesProgress(): void {
    try {
      localStorage.removeItem(READ_NOTES_KEY);
      localStorage.removeItem(FAVORITE_NOTES_KEY);
    } catch {
      // Safe fallback
    }
  },
};
