import { DoodleItem, DoodleSection } from '../types/doodle';

const DB_NAME = 'starlit_letters_doodles_db';
const DB_VERSION = 1;
const STORE_NAME = 'doodles';
const LOCAL_STORAGE_FALLBACK_KEY = 'starlit_letters_doodles_local';

/**
 * Fallback helpers for LocalStorage
 */
function getFromLocalStorage(): DoodleItem[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('LocalStorage fallback read error:', err);
    return [];
  }
}

function saveToLocalStorage(items: DoodleItem[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(items));
    }
  } catch (err) {
    console.warn('LocalStorage fallback write error:', err);
  }
}

/**
 * Check if IndexedDB is currently usable and the document is active/visible.
 */
function isIndexedDbUsable(): boolean {
  if (typeof window === 'undefined' || !window.indexedDB) return false;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return false;
  return true;
}

/**
 * Executes an operation with a cleanly managed IndexedDB connection.
 * Automatically handles closing connections and gracefully falls back on error.
 */
function withDB<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore, resolve: (val: T) => void, reject: (err: unknown) => void) => void
): Promise<T | null> {
  return new Promise((resolve) => {
    if (!isIndexedDbUsable()) {
      return resolve(null);
    }

    let request: IDBOpenDBRequest;
    try {
      request = window.indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      return resolve(null);
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
      } catch {
        resolve(null);
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      let isCleanedUp = false;

      const safeClose = () => {
        if (!isCleanedUp) {
          isCleanedUp = true;
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
        isCleanedUp = true;
      };

      try {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);

        transaction.oncomplete = () => {
          safeClose();
        };
        transaction.onabort = (e: any) => {
          try {
            e?.preventDefault?.();
            e?.stopPropagation?.();
          } catch {}
          safeClose();
          resolve(null);
        };
        transaction.onerror = (e: any) => {
          try {
            e?.preventDefault?.();
            e?.stopPropagation?.();
          } catch {}
          safeClose();
          resolve(null);
        };

        action(
          store,
          (val) => {
            resolve(val);
          },
          () => {
            safeClose();
            resolve(null);
          }
        );
      } catch {
        safeClose();
        resolve(null);
      }
    };

    request.onerror = (e: any) => {
      try {
        e?.preventDefault?.();
        e?.stopPropagation?.();
      } catch {}
      resolve(null);
    };
    request.onblocked = (e: any) => {
      try {
        e?.preventDefault?.();
        e?.stopPropagation?.();
      } catch {}
      resolve(null);
    };
  });
}

/**
 * Save or update a doodle in local storage (IndexedDB with LocalStorage fallback).
 */
export async function saveDoodleLocally(doodle: DoodleItem): Promise<void> {
  const saveToLocal = () => {
    const existing = getFromLocalStorage();
    const index = existing.findIndex((item) => item.id === doodle.id);
    if (index >= 0) {
      existing[index] = doodle;
    } else {
      existing.unshift(doodle);
    }
    saveToLocalStorage(existing);
  };

  if (!isIndexedDbUsable()) {
    saveToLocal();
    return;
  }

  try {
    const result = await withDB<boolean>('readwrite', (store, resolve, reject) => {
      try {
        const req = store.put(doodle);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });

    if (result === null) {
      saveToLocal();
    }
  } catch {
    saveToLocal();
  }
}

/**
 * Fetch all local doodles, optionally filtered by section and userId.
 */
export async function getLocalDoodles(
  section?: DoodleSection,
  userId?: string
): Promise<DoodleItem[]> {
  const getFallback = () => {
    const items = getFromLocalStorage();
    return items
      .filter((item) => {
        if (section && item.section !== section) return false;
        if (userId && item.userId !== userId && item.userId !== 'anonymous') return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  if (!isIndexedDbUsable()) {
    return getFallback();
  }

  try {
    const allItems = await withDB<DoodleItem[]>('readonly', (store, resolve, reject) => {
      try {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });

    if (!allItems) {
      return getFallback();
    }

    return allItems
      .filter((item) => {
        if (section && item.section !== section) return false;
        if (userId && item.userId !== userId && item.userId !== 'anonymous') return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return getFallback();
  }
}

/**
 * Fetch a single doodle by ID from local storage.
 */
export async function getLocalDoodleById(id: string): Promise<DoodleItem | null> {
  const getFallback = () => {
    const items = getFromLocalStorage();
    return items.find((item) => item.id === id) || null;
  };

  if (!isIndexedDbUsable()) {
    return getFallback();
  }

  try {
    const item = await withDB<DoodleItem | null>('readonly', (store, resolve, reject) => {
      try {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });

    if (item === undefined || item === null) {
      return getFallback();
    }
    return item;
  } catch {
    return getFallback();
  }
}

/**
 * Delete a doodle from local storage.
 */
export async function deleteDoodleLocally(id: string): Promise<void> {
  const deleteFallback = () => {
    const items = getFromLocalStorage().filter((item) => item.id !== id);
    saveToLocalStorage(items);
  };

  if (!isIndexedDbUsable()) {
    deleteFallback();
    return;
  }

  try {
    const res = await withDB<boolean>('readwrite', (store, resolve, reject) => {
      try {
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });

    if (res === null) {
      deleteFallback();
    }
  } catch {
    deleteFallback();
  }
}
