/**
 * 365 Notes Weekly Unlock Logic
 *
 * Collection Start Date: 27 September 2026 (Sunday)
 * Collection Duration: 365 Days (Ends 26 September 2027)
 * Unlock Rule: Weekly (Sunday to Saturday)
 */

export const COLLECTION_START_DATE = '2026-09-27';
export const TOTAL_COLLECTION_DAYS = 365;

/**
 * Parses a YYYY-MM-DD date string into a local Date object without UTC timezone shifts.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(year, month - 1, day);
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the Sunday at the beginning of the week for a given date.
 */
export function getSundayOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfWeek = result.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  result.setDate(result.getDate() - dayOfWeek);
  return result;
}

/**
 * Returns the Saturday at the end of the week for a given date.
 */
export function getSaturdayOfWeek(date: Date): Date {
  const sunday = getSundayOfWeek(date);
  const saturday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate());
  saturday.setDate(saturday.getDate() + 6);
  return saturday;
}

/**
 * Returns the End Date of the 365-day collection (26 September 2027).
 */
export function getCollectionEndDate(): string {
  const start = parseLocalDate(COLLECTION_START_DATE);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + TOTAL_COLLECTION_DAYS - 1);
  return formatLocalDate(end);
}

/**
 * Determines whether a given note date is unlocked relative to a reference date.
 *
 * Rules:
 * 1. Note date must be within the 365-day collection range (2026-09-27 to 2027-09-26).
 * 2. Unlocks occur on a weekly basis (Sunday through Saturday).
 * 3. Any note up to the Saturday of the reference date's week is unlocked.
 * 4. Future weeks remain locked.
 *
 * @param noteDate YYYY-MM-DD string of the note
 * @param referenceDate Optional YYYY-MM-DD or Date (defaults to current date, minimum COLLECTION_START_DATE)
 */
export function isNoteUnlocked(
  noteDate: string,
  referenceDate?: string | Date
): boolean {
  const startDateStr = COLLECTION_START_DATE;
  const endDateStr = getCollectionEndDate();

  // Rule 1: Note date must be within 365-day collection bounds
  if (noteDate < startDateStr || noteDate > endDateStr) {
    return false;
  }

  // Resolve reference date
  let refDateObj: Date;
  if (!referenceDate) {
    refDateObj = new Date();
  } else if (typeof referenceDate === 'string') {
    refDateObj = parseLocalDate(referenceDate);
  } else {
    refDateObj = referenceDate;
  }

  const refDateStr = formatLocalDate(refDateObj);

  // If reference date is prior to collection start date, treat start date as minimum active reference
  const activeRefDateObj = refDateStr < startDateStr ? parseLocalDate(startDateStr) : refDateObj;

  // Rule 2 & 3: Find Saturday of current reference week
  const saturdayOfRefWeek = getSaturdayOfWeek(activeRefDateObj);
  const saturdayStr = formatLocalDate(saturdayOfRefWeek);

  // Note is unlocked if noteDate <= saturdayStr
  return noteDate <= saturdayStr;
}

/**
 * Returns the Sunday date string on which a locked note will become unlocked.
 */
export function getUnlockSundayForNote(noteDate: string): string {
  const noteDateObj = parseLocalDate(noteDate);
  const sunday = getSundayOfWeek(noteDateObj);
  return formatLocalDate(sunday);
}

import { validate365NotesDataset } from '../data/notes365Data';

/**
 * Diagnostic test runner for Phase 4.3 weekly unlock test cases and dataset validation.
 */
export function runUnlockTests(): { name: string; passed: boolean; details: string }[] {
  const datasetValidation = validate365NotesDataset();

  const results = [
    {
      name: 'Dataset Integrity Test: 365 consecutive notes from 2026-09-27 to 2027-09-26',
      passed: datasetValidation.isValid,
      details: datasetValidation.isValid
        ? `Validated ${datasetValidation.totalNotes} notes (${datasetValidation.firstDate} to ${datasetValidation.lastDate})`
        : datasetValidation.errors.join('; '),
    },
    {
      name: 'Test 1: Current date 27 Sep 2026 (27 Sep - 3 Oct unlocked, 4 Oct locked)',
      passed:
        isNoteUnlocked('2026-09-27', '2026-09-27') === true &&
        isNoteUnlocked('2026-10-03', '2026-09-27') === true &&
        isNoteUnlocked('2026-10-04', '2026-09-27') === false,
      details: 'Evaluated 27 Sep 2026 reference date',
    },
    {
      name: 'Test 2: Current date 30 Sep 2026 (27 Sep - 3 Oct unlocked)',
      passed:
        isNoteUnlocked('2026-09-27', '2026-09-30') === true &&
        isNoteUnlocked('2026-10-03', '2026-09-30') === true &&
        isNoteUnlocked('2026-10-04', '2026-09-30') === false,
      details: 'Evaluated mid-week reference date 30 Sep 2026',
    },
    {
      name: 'Test 3: Current date 3 Oct 2026 (27 Sep - 3 Oct unlocked)',
      passed:
        isNoteUnlocked('2026-09-27', '2026-10-03') === true &&
        isNoteUnlocked('2026-10-03', '2026-10-03') === true &&
        isNoteUnlocked('2026-10-04', '2026-10-03') === false,
      details: 'Evaluated Saturday end-of-week reference date 3 Oct 2026',
    },
    {
      name: 'Test 4: Current date 4 Oct 2026 (27 Sep - 10 Oct unlocked)',
      passed:
        isNoteUnlocked('2026-09-27', '2026-10-04') === true &&
        isNoteUnlocked('2026-10-04', '2026-10-04') === true &&
        isNoteUnlocked('2026-10-10', '2026-10-04') === true &&
        isNoteUnlocked('2026-10-11', '2026-10-04') === false,
      details: 'Evaluated new Sunday unlock on 4 Oct 2026',
    },
    {
      name: 'Test 5: Current date 10 Oct 2026 (27 Sep - 10 Oct unlocked)',
      passed:
        isNoteUnlocked('2026-09-27', '2026-10-10') === true &&
        isNoteUnlocked('2026-10-10', '2026-10-10') === true &&
        isNoteUnlocked('2026-10-11', '2026-10-10') === false,
      details: 'Evaluated end of second week 10 Oct 2026',
    },
    {
      name: 'Test 6: Current date 11 Oct 2026 (27 Sep - 17 Oct unlocked)',
      passed:
        isNoteUnlocked('2026-09-27', '2026-10-11') === true &&
        isNoteUnlocked('2026-10-11', '2026-10-11') === true &&
        isNoteUnlocked('2026-10-17', '2026-10-11') === true &&
        isNoteUnlocked('2026-10-18', '2026-10-11') === false,
      details: 'Evaluated third Sunday unlock 11 Oct 2026',
    },
    {
      name: 'Test 7: Date beyond 365-note collection (2027-10-01 is locked)',
      passed: isNoteUnlocked('2027-10-01', '2026-10-11') === false,
      details: 'Evaluated note date outside 365-day range',
    },
  ];
  return results;
}
