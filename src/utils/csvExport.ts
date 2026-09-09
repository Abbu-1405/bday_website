import { TrackedUserOverview } from '../types/tracking';

export interface ExportCsvOptions {
  filename?: string;
  filterLabel?: string;
}

export interface ExportCsvResult {
  success: boolean;
  filename: string;
  count: number;
}

/**
 * Escapes a field for safe CSV output according to RFC 4180.
 * Also mitigates CSV formula injection (=, +, -, @).
 */
function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) {
    return '';
  }

  let str = String(val);

  // Security: Prevent CSV formula injection by quoting formulas with a leading single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // If the value contains quotes, commas, or newlines, quote the entire field and escape quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Formats epoch timestamp to ISO UTC string or fallback.
 */
function formatUtcTimestamp(epoch: number | null | undefined): string {
  if (!epoch || isNaN(epoch)) return 'N/A';
  try {
    return new Date(epoch).toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return 'N/A';
  }
}

/**
 * Generates RFC 4180 compliant CSV string from tracked platform users.
 */
export function generateUsersCsvContent(
  users: TrackedUserOverview[],
  _options?: ExportCsvOptions
): string {
  const exportTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  const headers = [
    'User ID (UID)',
    'Display Name',
    'Email Address',
    'Role',
    'Status',
    'Total Visits',
    'Total Time Spent (Seconds)',
    'Total Time Spent (Formatted)',
    'First Seen (UTC)',
    'Last Active (UTC)',
    'Last Known Section',
    'Last Known Route',
    'Device Category',
    'Browser',
    'Operating System',
    'Notes Opened',
    'Moments Opened',
    'Wishes Collected',
    'Secrets Discovered',
    'Open When Opened',
    'Feelings Submitted',
    'Letters Submitted',
    'Badges Unlocked',
    'Export Timestamp',
  ];

  const rows: string[] = [headers.map(escapeCsvValue).join(',')];

  users.forEach((user) => {
    const summary = user.activitySummary || {};
    const row = [
      user.userId || '',
      user.displayName || 'Anonymous Explorer',
      user.email || 'No email provided',
      user.role || 'user',
      user.status || 'inactive',
      user.totalVisits ?? 0,
      user.totalTimeSpentSeconds ?? 0,
      user.totalTimeSpentFormatted || '0s',
      formatUtcTimestamp(user.firstVisitEpoch),
      formatUtcTimestamp(user.lastActiveEpoch),
      user.currentSection || 'N/A',
      user.currentRoute || 'N/A',
      user.deviceCategory || 'unknown',
      user.browser || 'unknown',
      user.os || 'unknown',
      summary.notesOpened ?? 0,
      summary.momentsOpened ?? 0,
      summary.wishesCollected ?? 0,
      summary.secretsDiscovered ?? 0,
      summary.openWhenOpened ?? 0,
      summary.feelingsSubmitted ?? 0,
      summary.lettersSubmitted ?? 0,
      summary.badgesUnlocked ?? 0,
      exportTimestamp,
    ];

    rows.push(row.map(escapeCsvValue).join(','));
  });

  return rows.join('\r\n');
}

/**
 * Triggers the browser download of a CSV file with UTF-8 BOM encoding.
 */
export function downloadCsvFile(filename: string, csvContent: string): void {
  // UTF-8 Byte Order Mark (\uFEFF) ensures Excel and Numbers render special characters cleanly
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * High-level export helper that formats users and downloads the CSV file.
 */
export function exportUsersToCsv(
  users: TrackedUserOverview[],
  options?: ExportCsvOptions
): ExportCsvResult {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = options?.filename || `starlit-letters-users-${dateStr}.csv`;
  const csvContent = generateUsersCsvContent(users, options);

  downloadCsvFile(filename, csvContent);

  return {
    success: true,
    filename,
    count: users.length,
  };
}
