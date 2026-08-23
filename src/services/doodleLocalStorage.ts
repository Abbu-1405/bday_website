import { DoodleItem, DoodleSection } from '../types/doodle';

const DB_NAME = 'starlit_letters_doodles_db';
const DB_VERSION = 1;
const STORE_NAME = 'doodles';
const LOCAL_STORAGE_FALLBACK_KEY = 'starlit_letters_doodles_local';

/**
 * Executes an operation with a cleanly managed IndexedDB connection.
 * Automatically closes connections and gracefully handles hidden/closing states.
 */
function withDB<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore, resolve: (val: T) => void, reject: (err: unknown) => void) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not available'));
    }
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return reject(new Error('Database is closing/hidden'));
    }

    let request: IDBOpenDBRequest;
    try {
      request = window.indexedDB.open(DB_NAME, DB_VERSION);
    } catch (err) {
      return reject(err);
    }

    request.onupgradeneeded = (event) => {
      try {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('section', 'section', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      } catch (err) {
        reject(err);
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      let isClosed = false;

      const safeClose = () => {
        if (!isClosed) {
          isClosed = true;
          try {
            db.close();
          } catch {
            // Ignore closure errors
          }
        }
      };

      db.onversionchange = () => {
        safeClose();
      };
      db.onclose = () => {
        isClosed = true;
      };

      try {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);

        transaction.oncomplete = () => {
          safeClose();
        };
        transaction.onabort = () => {
          safeClose();
        };
        transaction.onerror = (e) => {
          safeClose();
          reject(transaction.error || e);
        };

        action(
          store,
          (val) => {
            resolve(val);
          },
          (err) => {
            safeClose();
            reject(err);
          }
        );
      } catch (txErr) {
        safeClose();
        reject(txErr);
      }
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
    request.onblocked = () => {
      reject(new Error('IndexedDB blocked'));
    };
  });
}

/**
 * Fallback helpers for LocalStorage
 */
function getFromLocalStorage(): DoodleItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('LocalStorage fallback read error:', err);
    return [];
  }
}

function saveToLocalStorage(items: DoodleItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('LocalStorage fallback write error:', err);
  }
}

/**
 * Save or update a doodle in local storage (IndexedDB with LocalStorage fallback).
 */
export async function saveDoodleLocally(doodle: DoodleItem): Promise<void> {
  try {
    await withDB<void>('readwrite', (store, resolve, reject) => {
      const req = store.put(doodle);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Graceful fallback to LocalStorage on closing, hidden or unavailable IndexedDB
    const existing = getFromLocalStorage();
    const index = existing.findIndex((item) => item.id === doodle.id);
    if (index >= 0) {
      existing[index] = doodle;
    } else {
      existing.unshift(doodle);
    }
    saveToLocalStorage(existing);
  }
}

/**
 * Fetch all local doodles, optionally filtered by section and userId.
 */
export async function getLocalDoodles(
  section?: DoodleSection,
  userId?: string
): Promise<DoodleItem[]> {
  try {
    const allItems = await withDB<DoodleItem[]>('readonly', (store, resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    return allItems
      .filter((item) => {
        if (section && item.section !== section) return false;
        if (userId && item.userId !== userId && item.userId !== 'anonymous') return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    // Graceful fallback to LocalStorage
    const items = getFromLocalStorage();
    return items
      .filter((item) => {
        if (section && item.section !== section) return false;
        if (userId && item.userId !== userId && item.userId !== 'anonymous') return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

/**
 * Fetch a single doodle by ID from local storage.
 */
export async function getLocalDoodleById(id: string): Promise<DoodleItem | null> {
  try {
    return await withDB<DoodleItem | null>('readonly', (store, resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Graceful fallback to LocalStorage
    const items = getFromLocalStorage();
    return items.find((item) => item.id === id) || null;
  }
}

/**
 * Delete a doodle from local storage.
 */
export async function deleteDoodleLocally(id: string): Promise<void> {
  try {
    await withDB<void>('readwrite', (store, resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Graceful fallback to LocalStorage
    const items = getFromLocalStorage().filter((item) => item.id !== id);
    saveToLocalStorage(items);
  }
}
