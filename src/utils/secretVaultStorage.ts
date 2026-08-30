import { recordActivity } from '../services/activityService';
import { notifySecretUnlocked } from '../services/notificationService';
import { auth } from '../firebase';

const STORAGE_KEY = 'starlit_secret_vault_discovered';
const STORAGE_TIMESTAMPS_KEY = 'starlit_secret_vault_timestamps';
const STORAGE_OVERRIDE_KEY = 'starlit_secret_vault_override_unlocked';

// Exact override question as required
export const SECRETS_OVERRIDE_QUESTION =
  'Who is Batman? Nijam oppuku ipatiki ayina, answer motham sentence type chesi saav.';

/**
 * Normalizes user input for exact sentence matching:
 * - Lowercases and trims
 * - Removes enclosing / inline punctuation
 * - Collapses repeated whitespace
 */
export function normalizeOverrideAnswer(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[\u2018\u2019\u201C\u201D]/g, '')
    .replace(/[.,!?;:'"~`_(){}[\]<>@#$%^&*+=/\\|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Accepted valid complete-sentence formulations (strictly rejecting single words or fragments)
 */
const ACCEPTED_SENTENCE_PATTERNS = new Set<string>([
  'nuvve batman',
  'nuvvu batman',
  'nuvve batman ra',
  'nuvve batman re',
  'nuvve batman andi',
  'nuvve ga batman',
  'nuvve kadha batman',
  'nuvve kada batman',
  'nenu kaadu nuvve batman',
  'nenu kadu nuvve batman',
  'batman nuvve',
  'batman nuvvu',
  'batman nuvve ra',
  'nuvve nijamaina batman',
  'nuvvu nijamaina batman',
  'nijamga nuvve batman',
  'nijam ga nuvve batman',
  'nijam oppukuntunna nuvve batman',
  'nijam oppukunna nuvve batman',
  'you are batman',
  'you are the batman',
  'youre batman',
  'you re batman',
  'u are batman',
  'u are the batman',
  'abuzar is batman',
  'abuzar is the batman',
  'abuzar batman',
  'mohammed abuzar is batman',
  'mohammed abuzar shaik is batman',
  'shaik abuzar is batman',
  'nene batman',
  'nenu batman',
  'nene batman ra',
  'nenu the batman',
  'nene the batman',
  'i am batman',
  'i am the batman',
  'im batman',
  'i m batman',
  'nuvve naa batman',
  'nuvve na batman',
  'nuvve ma batman',
  'nuvve maa batman',
  'you are my batman',
  'nuvve bat man',
  'bat man nuvve',
  'nene bat man',
  'i am bat man',
  'you are bat man',
]);

/**
 * Validates the complete sentence answer without logging or exposing values
 */
export function validateSecretsOverrideAnswer(input: string): boolean {
  const normalized = normalizeOverrideAnswer(input);
  if (!normalized) return false;
  return ACCEPTED_SENTENCE_PATTERNS.has(normalized);
}

// Check if secrets override backdoor was already activated
export function isSecretsOverrideUnlocked(): boolean {
  try {
    return localStorage.getItem(STORAGE_OVERRIDE_KEY) === 'true';
  } catch {
    return false;
  }
}

// Helper to retrieve list of discovered secret IDs from localStorage
export function getDiscoveredSecretIds(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Default: Secret #1 is pre-discovered to give an initial glimpse
      return ['secret-01'];
    }
    return JSON.parse(data) as string[];
  } catch {
    return ['secret-01'];
  }
}

// Helper to retrieve timestamps map
export function getDiscoveredTimestamps(): Record<string, number> {
  try {
    const data = localStorage.getItem(STORAGE_TIMESTAMPS_KEY);
    return data ? JSON.parse(data) : { 'secret-01': Date.now() };
  } catch {
    return { 'secret-01': Date.now() };
  }
}

// Check if a specific secret ID is discovered
export function isSecretDiscovered(secretId: string): boolean {
  const ids = getDiscoveredSecretIds();
  return ids.includes(secretId);
}

// Unlock all secrets through the secret override backdoor
export function unlockSecretsOverride(allSecretIds: string[]): string[] {
  try {
    const currentIds = getDiscoveredSecretIds();
    const timestamps = getDiscoveredTimestamps();
    const now = Date.now();

    const mergedIds = Array.from(new Set([...currentIds, ...allSecretIds]));
    const updatedTimestamps = { ...timestamps };

    allSecretIds.forEach((id) => {
      if (!updatedTimestamps[id]) {
        updatedTimestamps[id] = now;
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedIds));
    localStorage.setItem(STORAGE_TIMESTAMPS_KEY, JSON.stringify(updatedTimestamps));
    localStorage.setItem(STORAGE_OVERRIDE_KEY, 'true');

    // Record activity event
    recordActivity({
      type: 'secret_discovered',
      section: 'secret_vault',
      itemId: 'override-all',
    });

    // Notify window listeners
    window.dispatchEvent(
      new CustomEvent('starlit_secret_discovered', { detail: { secretId: 'override-all' } })
    );

    return mergedIds;
  } catch {
    return allSecretIds;
  }
}

// Mark a secret as discovered locally
export function discoverSecret(secretId: string): string[] {
  try {
    const ids = getDiscoveredSecretIds();
    const timestamps = getDiscoveredTimestamps();

    if (!ids.includes(secretId)) {
      const updatedIds = [...ids, secretId];
      const updatedTimestamps = { ...timestamps, [secretId]: Date.now() };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIds));
      localStorage.setItem(STORAGE_TIMESTAMPS_KEY, JSON.stringify(updatedTimestamps));

      // Record activity event
      recordActivity({
        type: 'secret_discovered',
        section: 'secret_vault',
        itemId: secretId,
      });

      // Queue notification event if user is signed in
      const currentUid = auth.currentUser?.uid;
      if (currentUid) {
        notifySecretUnlocked(currentUid, secretId).catch((err) => {
          console.warn('[NotificationEngine] Non-blocking secret notification notice:', err);
        });
      }

      return updatedIds;
    }
    return ids;
  } catch {
    return getDiscoveredSecretIds();
  }
}

// Reset discovered secrets (useful for testing)
export function resetDiscoveredSecrets(): string[] {
  try {
    const initial = ['secret-01'];
    const initialTimestamps = { 'secret-01': Date.now() };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    localStorage.setItem(STORAGE_TIMESTAMPS_KEY, JSON.stringify(initialTimestamps));
    localStorage.removeItem(STORAGE_OVERRIDE_KEY);

    return initial;
  } catch {
    return ['secret-01'];
  }
}
