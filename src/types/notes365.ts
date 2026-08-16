export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'none';

export interface NoteMediaItem {
  id?: string;
  type: MediaType;
  src?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  // Legacy / alias fields for backward compatibility
  url?: string;
  caption?: string;
}

export type NoteMedia = NoteMediaItem;

export interface Note365 {
  id: string;
  date: string; // ISO date format YYYY-MM-DD (e.g. "2026-09-27")
  displayDate?: string; // Human-readable date string (e.g. "27 September 2026")
  dayIndex?: number; // Day number 1-365
  title: string;
  content: string;
  preview: string;
  media?: NoteMediaItem;
  mediaItems?: NoteMediaItem[];
  isRead: boolean;
  isFavorite: boolean;
  isUnlocked: boolean;
}

