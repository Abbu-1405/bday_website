import { recordActivity } from '../services/activityService';

const STORAGE_KEY = 'starlit_secret_vault_discovered';
const STORAGE_TIMESTAMPS_KEY = 'starlit_secret_vault_timestamps';

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

    return initial;
  } catch {
    return ['secret-01'];
  }
}
