import { Note365 } from '../types';
import { DAYS_001_060_DATA } from './notes365Days001_060Data';
import { DAYS_061_120_DATA } from './notes365Days061_120Data';
import { DAYS_121_180_DATA } from './notes365Days121_180Data';
import { DAYS_181_240_DATA } from './notes365Days181_240Data';
import { DAYS_241_300_DATA } from './notes365Days241_300Data';
import { DAYS_301_365_DATA } from './notes365Days301_365Data';

/**
 * Utility helper to format YYYY-MM-DD to "D MMMM YYYY" (e.g. "27 September 2026")
 */
export function formatCalendarDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    return dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return dateString;
  }
}

/**
 * Custom overrides for specific initial & key milestone days
 */
const SPECIAL_NOTES_MAP: Record<number, Partial<Note365>> = {
  1: {
    title: 'The Beginning of Our Starlit Pages',
    preview: 'A quiet moment under the starlight, captured in a gentle note...',
    content:
      'Welcome to the very first page of our starlit journey. On this day, 27 September 2026, we begin capturing daily reflections, quiet thoughts, and cherished memories. Every single day carries a small story worth keeping.',
    isRead: true,
    isFavorite: true,
    mediaItems: [
      {
        id: 'm1-img',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
        title: 'Starlit Mountain Horizon',
        description: 'Captured under the quiet midnight sky on 27 September.',
      },
    ],
  },
  2: {
    title: 'Midnight Whispers & Quiet Stars',
    preview: 'Reflecting on how small moments make up the largest parts of life...',
    content:
      'As midnight approaches, the world softens. Today was filled with small unexpected smiles and warm conversations. Finding peace in the routine and joy in the quiet hours.',
    isRead: true,
    mediaItems: [
      {
        id: 'm2-aud',
        type: 'audio',
        src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=soft-rain-ambient-111154.mp3',
        title: 'Midnight Soft Rain Ambient',
        description: 'A 30-second soothing acoustic rain recording.',
      },
    ],
  },
  3: {
    title: 'Coffee Conversations',
    preview: 'A morning filled with warmth, steam rising from ceramic mugs...',
    content:
      'There is a subtle magic in early morning coffee. The world is still asleep, and time moves just a little slower. A reminder to stay present in every moment.',
    mediaItems: [
      {
        id: 'm3-vid',
        type: 'video',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        title: 'Golden Hour Reflection Clip',
        description: 'A short ambient clip recorded during golden hour.',
      },
    ],
  },
  4: {
    title: 'Moments in Autumn Light',
    preview: 'Golden hour leaves drifting across the quiet path...',
    content:
      'September draws to a close today. Looking back at the last four days, each note is becoming a stepping stone across time.',
    mediaItems: [
      {
        id: 'm4-doc',
        type: 'document',
        src: '#',
        title: 'Autumn Travels & Reflection Excerpt.pdf',
        description: 'Formatted 3-page travel journal excerpt and reading notes.',
      },
    ],
  },
  5: {
    title: 'A Letter to Tomorrow',
    preview: 'A new month arrives with new hopes and quiet promises...',
    content:
      'Welcome to October. Today brings a crisp breeze and a fresh page. May this month be gentle and full of light.',
    mediaItems: [
      {
        id: 'm5-img',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        title: 'Sunset Over Calm Waters',
        description: 'Twilight fading along the peaceful coast.',
      },
      {
        id: 'm5-aud',
        type: 'audio',
        src: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=piano-moment-10331.mp3',
        title: 'Twilight Piano Sketch',
        description: 'A brief original piano theme.',
      },
      {
        id: 'm5-doc',
        type: 'document',
        src: '#',
        title: 'October Goals & Reflections.pdf',
        description: 'Formatted checklist document.',
      },
    ],
  },
  365: {
    title: '365 Days Under the Starlit Sky',
    preview: 'Celebrating a full year of shared reflections, quiet memories, and bright hope...',
    content:
      'Three hundred and sixty-five days of starlit pages. From 27 September 2026 to 26 September 2027, every single day has added a unique thread to our shared tapestry. Thank you for walking through every page.',
    isFavorite: true,
  },
};

const TITLE_TEMPLATES = [
  'Coffee & Morning Quiet',
  'A Soft Afternoon Breeze',
  'Small Joys in Simple Things',
  'Unwritten Thoughts at Sunset',
  'Listening to the Rain Outside',
  'A Gentle Moment of Reflection',
  'Starry Skylines & Whispering Leaves',
  'The Warmth of Shared Smiles',
  'Finding Balance in Quiet Hours',
  'Starlight on the Windowpane',
  'Echoes of a Melodic Song',
  'Gratitude in the Smallest Things',
  'A Pause Between Busy Hours',
  'Golden Hour Glow',
  'Savoring a Quiet Cup of Tea',
  'Late Night Musings',
  'The Magic of Routine Days',
  'A Memory to Keep Close',
  'Walking Under Clear Skies',
  'Soft Whispers of the Evening',
  'Capturing a Fleeting Moment',
  'A Quiet Smile to Start the Day',
  'Counting Small Blessings',
  'Looking Out Across the Horizon',
  'The Beauty of Unhurried Time',
  'Notes Saved for Tomorrow',
  'A Spark of Joy in the Everyday',
  'Evening Calm & Quiet Peace',
  'Under the Starlit Canopy',
  'Reflections on a Peaceful Day',
];

const PREVIEW_TEMPLATES = [
  'Reflecting on the gentle rhythm of today and finding joy in quiet moments...',
  'A small reminder that even quiet days hold unexpected warmth and brightness...',
  'Notes written in the soft twilight, capturing thoughts before the day ends...',
  'Watching the sunlight shift across the room and appreciating the calm pace...',
  'A simple observation saved for later—small details that make life feel sweet...',
  'Taking a moment to breathe deeply and reflect on everything accomplished today...',
  'A gentle thought sent across the distance, wrapped in starlight and care...',
  'Looking back at the day with a grateful heart and a quiet smile...',
  'Finding beauty in routine tasks and finding space for peaceful thoughts...',
  'A quiet entry to mark another page in our 365-day starlit journey...',
];

const CONTENT_TEMPLATES = [
  'Today brought a soft reminder that small moments often make up the largest parts of our memories. Taking time to notice the quiet warmth around us.',
  'As evening settles in, the sky glows with gentle colors. It is nice to pause at the end of the day and write down a brief reflection.',
  'A morning that started with quiet coffee and peaceful thoughts. There is a simple grace in starting the day slowly and without hurry.',
  'Sometimes the best moments are the unscripted ones—a quiet joke, an unexpected view, or a warm cup of tea enjoyed in silence.',
  'Today was productive and grounding. Reminding myself that step by step, day by day, we are building something meaningful and lasting.',
  'Listening to soft music while looking out at the sky. Some days do not need grand events to feel special and memorable.',
  'A gentle thought for today: hold onto peace, celebrate tiny victories, and keep looking up at the starlight.',
  'Looking back over the week so far, every day adds a small unique tile to our memory wall. Grateful for this continuous journey.',
  'An afternoon walk under crisp skies. The changing season brings a fresh perspective and quiet energy for the days ahead.',
  'Wrapping up today with a thankful mind. Writing down this note as a gentle bookmark in time for future days.',
];

/**
 * Generator function that constructs all 365 temporary Note365 objects
 * spanning from 27 September 2026 to 26 September 2027.
 */
export function generate365Notes(): Note365[] {
  const notes: Note365[] = [];

  // Map Days 001-060, 061-120, 121-180, 181-240, and 241-300 by exact index
  const day001_060_map = new Map(DAYS_001_060_DATA.map((d) => [d.dayIndex, d]));
  const day061_120_map = new Map(DAYS_061_120_DATA.map((d) => [d.dayIndex, d]));
  const day121_180_map = new Map(DAYS_121_180_DATA.map((d) => [d.dayIndex, d]));
  const day181_240_map = new Map(DAYS_181_240_DATA.map((d) => [d.dayIndex, d]));
  const day241_300_map = new Map(DAYS_241_300_DATA.map((d) => [d.dayIndex, d]));
  const day301_365_map = new Map(DAYS_301_365_DATA.map((d) => [d.dayIndex, d]));

  for (let i = 0; i < 365; i++) {
    const dayIndex = i + 1;
    // Base date: 2026-09-27
    const currentDate = new Date(Date.UTC(2026, 8, 27 + i));
    const year = currentDate.getUTCFullYear();
    const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const displayDate = formatCalendarDate(dateStr);

    const day001_060 = day001_060_map.get(dayIndex);
    const day061_120 = day061_120_map.get(dayIndex);
    const day121_180 = day121_180_map.get(dayIndex);
    const day181_240 = day181_240_map.get(dayIndex);
    const day241_300 = day241_300_map.get(dayIndex);
    const day301_365 = day301_365_map.get(dayIndex);

    let title: string;
    let preview: string;
    let content: string;
    let category: string | undefined;

    if (day001_060) {
      // Days 001 - 060: Exact content and title from master document
      title = day001_060.title;
      content = day001_060.content;
      category = day001_060.category;
      
      // Clean, faithful preview from first paragraph/line
      const firstLine = day001_060.content
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)[0] || day001_060.title;
      preview = firstLine.length > 110 ? firstLine.slice(0, 107) + '...' : firstLine;
    } else if (day061_120) {
      // Days 061 - 120: Exact content and title from master document
      title = day061_120.title;
      content = day061_120.content;
      category = day061_120.category;

      // Clean, faithful preview from first paragraph/line
      const firstLine = day061_120.content
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)[0] || day061_120.title;
      preview = firstLine.length > 110 ? firstLine.slice(0, 107) + '...' : firstLine;
    } else if (day121_180) {
      // Days 121 - 180: Exact content and title from master document
      title = day121_180.title;
      content = day121_180.content;
      category = day121_180.category;

      // Clean, faithful preview from first paragraph/line
      const firstLine = day121_180.content
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)[0] || day121_180.title;
      preview = firstLine.length > 110 ? firstLine.slice(0, 107) + '...' : firstLine;
    } else if (day181_240) {
      // Days 181 - 240: Exact content and title from master document
      title = day181_240.title;
      content = day181_240.content;
      category = day181_240.category;

      // Clean, faithful preview from first paragraph/line
      const firstLine = day181_240.content
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)[0] || day181_240.title;
      preview = firstLine.length > 110 ? firstLine.slice(0, 107) + '...' : firstLine;
    } else if (day241_300) {
      // Days 241 - 300: Exact content and title from master document
      title = day241_300.title;
      content = day241_300.content;
      category = day241_300.category;

      // Clean, faithful preview from first paragraph/line
      const firstLine = day241_300.content
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)[0] || day241_300.title;
      preview = firstLine.length > 110 ? firstLine.slice(0, 107) + '...' : firstLine;
    } else if (day301_365) {
      // Days 301 - 365: Exact content and title from master document
      title = day301_365.title;
      content = day301_365.content;
      category = day301_365.category;

      // Clean, faithful preview from first paragraph/line
      const firstLine = day301_365.content
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)[0] || day301_365.title;
      preview = firstLine.length > 110 ? firstLine.slice(0, 107) + '...' : firstLine;
    } else {
      const special = SPECIAL_NOTES_MAP[dayIndex];
      const titleIndex = (dayIndex * 7 + 3) % TITLE_TEMPLATES.length;
      const previewIndex = (dayIndex * 11 + 5) % PREVIEW_TEMPLATES.length;
      const contentIndex = (dayIndex * 13 + 2) % CONTENT_TEMPLATES.length;

      title = special?.title ?? `Day ${dayIndex}: ${TITLE_TEMPLATES[titleIndex]}`;
      preview = special?.preview ?? PREVIEW_TEMPLATES[previewIndex];
      content = special?.content ?? `${CONTENT_TEMPLATES[contentIndex]} (Note #${dayIndex} for ${displayDate})`;
    }

    const special = SPECIAL_NOTES_MAP[dayIndex];
    const mediaItems = special?.mediaItems ?? [];
    const media = special?.media ?? (mediaItems.length > 0 ? mediaItems[0] : { type: 'none' });

    notes.push({
      id: `note-${dateStr}`,
      date: dateStr,
      displayDate,
      dayIndex,
      title,
      preview,
      content,
      category,
      media,
      mediaItems,
      isRead: special?.isRead ?? false,
      isFavorite: special?.isFavorite ?? false,
      isUnlocked: special?.isUnlocked ?? false, // Will be dynamically evaluated by unlock logic
    });
  }

  return notes;
}

/**
 * Exported 365 Notes dataset containing exactly 365 calendar notes.
 */
export const sampleNotes365: Note365[] = generate365Notes();

/**
 * Development validation check utility to verify 365 Notes dataset integrity.
 */
export function validate365NotesDataset(notes: Note365[] = sampleNotes365): {
  isValid: boolean;
  errors: string[];
  totalNotes: number;
  firstDate: string;
  lastDate: string;
} {
  const errors: string[] = [];

  if (notes.length !== 365) {
    errors.push(`Expected 365 notes, found ${notes.length}`);
  }

  if (notes.length > 0) {
    const firstDate = notes[0].date;
    const lastDate = notes[notes.length - 1].date;

    if (firstDate !== '2026-09-27') {
      errors.push(`First note date must be 2026-09-27, got ${firstDate}`);
    }

    if (lastDate !== '2027-09-26') {
      errors.push(`Last note date must be 2027-09-26, got ${lastDate}`);
    }
  }

  const seenDates = new Set<string>();
  let prevDateStr = '';

  notes.forEach((note, index) => {
    if (seenDates.has(note.date)) {
      errors.push(`Duplicate date detected at index ${index}: ${note.date}`);
    }
    seenDates.add(note.date);

    if (prevDateStr && note.date <= prevDateStr) {
      errors.push(
        `Non-chronological date sequence at index ${index}: ${note.date} comes after ${prevDateStr}`
      );
    }
    prevDateStr = note.date;
  });

  return {
    isValid: errors.length === 0,
    errors,
    totalNotes: notes.length,
    firstDate: notes[0]?.date ?? '',
    lastDate: notes[notes.length - 1]?.date ?? '',
  };
}
