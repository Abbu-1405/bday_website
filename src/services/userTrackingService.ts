import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { TrackingEvent, TrackingEventType, UserSession } from '../types/tracking';
import { getDeviceInfo } from '../utils/deviceInfo';

const SESSION_STORAGE_KEY = 'starlit_active_session_id';
const SESSION_START_TIME_KEY = 'starlit_session_start_epoch';
const ACTIVITY_THROTTLE_MS = 2 * 60 * 1000; // 2 minutes between passive activity writes to keep volume low
const MAX_QUEUE_SIZE = 50;
const MAX_RETRY_ATTEMPTS = 3;
const BATCH_FLUSH_INTERVAL_MS = 30 * 1000; // 30 seconds

export interface SectionMetadata {
  id: string;
  name: string;
}

export function getSectionFromPath(pathname: string): SectionMetadata {
  const cleanPath = (pathname || '/').split('?')[0].split('#')[0];
  switch (cleanPath) {
    case '/':
    case '/home':
      return { id: 'home', name: 'Home' };
    case '/journey':
      return { id: 'journey', name: 'Journey' };
    case '/sneak-peek':
      return { id: 'sneak_peek', name: 'Sneak a Peek' };
    case '/adore':
      return { id: 'adore', name: 'Adore' };
    case '/moments':
      return { id: 'moments', name: 'Moments' };
    case '/notes-365':
      return { id: 'notes_365', name: '365 Notes' };
    case '/open-when':
      return { id: 'open_when', name: 'Open When' };
    case '/wishes':
      return { id: 'wishes', name: 'Wishes' };
    case '/what-am-i-to-you':
      return { id: 'what_am_i_to_you', name: 'What Am I To You' };
    case '/reflections':
      return { id: 'reflections', name: 'Your Reflections' };
    case '/bts':
      return { id: 'bts', name: 'Behind The Scenes' };
    case '/secret-vault':
      return { id: 'secret_vault', name: 'Secret Vault' };
    case '/settings':
      return { id: 'settings', name: 'Settings' };
    case '/notifications':
      return { id: 'notifications', name: 'Notifications' };
    case '/admin':
      return { id: 'admin', name: 'Admin Portal' };
    default:
      return {
        id: cleanPath.replace(/^\//, '').replace(/\//g, '_') || 'unknown',
        name: cleanPath.replace(/^\//, '').replace(/[-_]/g, ' ') || 'Unknown Section',
      };
  }
}

class UserTrackingService {
  private activeSessionId: string | null = null;
  private activeUserId: string | null = null;
  private sessionCreatedAtClientEpoch: number = 0;
  private lastActivityClientEpoch: number = 0;
  private lastSyncedActivityClientEpoch: number = 0;
  private currentRoute: string = '/';
  private isSessionStartedInDb: boolean = false;
  private isEndingSession: boolean = false;
  private hasTrackedWebsiteOpened: boolean = false;

  // Active section duration tracker
  private currentSection: {
    id: string;
    name: string;
    route: string;
    enteredAtEpoch: number;
    accumulatedActiveMs: number;
    isPaused: boolean;
  } | null = null;

  // Revisit & deduplication state
  private seenItemIds: Set<string> = new Set();
  private itemOpenCounts: Map<string, number> = new Map();
  private lastSearchQueries: Map<string, string> = new Map();
  private lastFilterValues: Map<string, string> = new Map();
  private lastMediaViewedKey: string | null = null;
  private lastMediaViewedTime: number = 0;
  private sneakPeekActionsTracked: Set<string> = new Set();

  private eventQueue: TrackingEvent[] = [];
  private isFlushingQueue: boolean = false;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.setupPeriodicFlush();
  }

  /**
   * Retrieves or creates a unique session ID for the current browser/tab instance.
   */
  public getOrCreateSessionId(): string {
    if (this.activeSessionId) {
      return this.activeSessionId;
    }

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const storedId = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (storedId && typeof storedId === 'string' && storedId.startsWith('sess_')) {
          this.activeSessionId = storedId;
          const storedStartTime = window.sessionStorage.getItem(SESSION_START_TIME_KEY);
          this.sessionCreatedAtClientEpoch = storedStartTime
            ? parseInt(storedStartTime, 10) || Date.now()
            : Date.now();
          return storedId;
        }
      }
    } catch {
      // sessionStorage unavailable/sandboxed
    }

    const timestamp = Date.now();
    const randomPartA = Math.random().toString(36).substring(2, 9);
    const randomPartB = Math.random().toString(36).substring(2, 6);
    const newSessionId = `sess_${timestamp}_${randomPartA}_${randomPartB}`;

    this.activeSessionId = newSessionId;
    this.sessionCreatedAtClientEpoch = timestamp;

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
        window.sessionStorage.setItem(SESSION_START_TIME_KEY, timestamp.toString());
      }
    } catch {
      // sessionStorage unavailable
    }

    return newSessionId;
  }

  /**
   * Initializes or resumes a user tracking session when authenticated.
   */
  public async initializeUserSession(userId: string, initialRoute: string = '/'): Promise<void> {
    if (!isFirebaseConfigured || !userId) return;

    // If already tracking this exact session and user, update route/activity
    if (this.activeUserId === userId && this.isSessionStartedInDb) {
      this.handleRouteChange(initialRoute);
      return;
    }

    this.activeUserId = userId;
    this.currentRoute = initialRoute || '/';
    const sessionId = this.getOrCreateSessionId();
    const nowEpoch = Date.now();
    this.lastActivityClientEpoch = nowEpoch;
    this.lastSyncedActivityClientEpoch = nowEpoch;

    const deviceInfo = getDeviceInfo();

    try {
      const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
      const userRef = doc(db, 'users', userId);

      const sessionPayload: Partial<UserSession> = {
        sessionId,
        userId,
        status: 'active',
        startedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
        initialRoute: this.currentRoute,
        currentRoute: this.currentRoute,
        device: deviceInfo,
        createdAtClientEpoch: this.sessionCreatedAtClientEpoch || nowEpoch,
        lastActivityClientEpoch: nowEpoch,
        eventCount: 0,
      };

      // Create or merge session document
      await setDoc(sessionRef, sessionPayload, { merge: true });
      this.isSessionStartedInDb = true;

      // Track website_opened exactly once per session
      this.trackWebsiteOpened(this.currentRoute);

      // Initialize first section tracking
      this.handleRouteChange(this.currentRoute);

      // Increment total visits and update lastSeen on the user's root profile
      await setDoc(
        userRef,
        {
          lastSeenAt: serverTimestamp(),
          lastSessionId: sessionId,
          visitSummary: {
            totalVisits: increment(1),
            lastVisitAt: serverTimestamp(),
          },
        },
        { merge: true }
      ).catch((profileErr) => {
        console.warn('[Tracking] Profile summary sync notice:', profileErr);
      });
    } catch (error) {
      console.warn('[Tracking] Failed to initialize session in Firestore:', error);
    }
  }

  /**
   * Tracks website_opened exactly once per session.
   */
  public trackWebsiteOpened(route: string = '/'): void {
    if (this.hasTrackedWebsiteOpened) return;

    const sessionId = this.getOrCreateSessionId();
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const storedFlag = window.sessionStorage.getItem(`starlit_website_opened_${sessionId}`);
        if (storedFlag) {
          this.hasTrackedWebsiteOpened = true;
          return;
        }
      }
    } catch {}

    this.hasTrackedWebsiteOpened = true;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(`starlit_website_opened_${sessionId}`, 'true');
      }
    } catch {}

    this.queueEvent({
      type: 'website_opened',
      route,
      metadata: {
        initialRoute: route,
        sessionId,
      },
    });
  }

  /**
   * Handles section transitions, timing, and navigation tracking when route changes.
   */
  public handleRouteChange(newPathname: string): void {
    if (!newPathname) return;
    const newSection = getSectionFromPath(newPathname);

    // If already in the exact same section and route, return
    if (this.currentSection && this.currentSection.route === newPathname) {
      return;
    }

    const now = Date.now();

    // If we were previously in a section, finalize and queue section_left & navigation
    if (this.currentSection) {
      let finalDurationMs = this.currentSection.accumulatedActiveMs;
      if (!this.currentSection.isPaused) {
        finalDurationMs += Math.max(0, now - this.currentSection.enteredAtEpoch);
      }
      const durationSeconds = Math.max(0, Math.floor(finalDurationMs / 1000));

      // Queue section_left
      this.queueEvent({
        type: 'section_left',
        route: this.currentSection.route,
        metadata: {
          sectionId: this.currentSection.id,
          sectionName: this.currentSection.name,
          route: this.currentSection.route,
          durationSeconds: isFinite(durationSeconds) ? durationSeconds : 0,
        },
      });

      // Queue navigation
      this.queueEvent({
        type: 'navigation',
        route: newPathname,
        metadata: {
          fromSection: this.currentSection.name,
          toSection: newSection.name,
          fromRoute: this.currentSection.route,
          toRoute: newPathname,
        },
      });
    }

    // Start new section
    const isHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
    this.currentSection = {
      id: newSection.id,
      name: newSection.name,
      route: newPathname,
      enteredAtEpoch: now,
      accumulatedActiveMs: 0,
      isPaused: isHidden,
    };

    this.currentRoute = newPathname;

    // Queue section_entered
    this.queueEvent({
      type: 'section_entered',
      route: newPathname,
      metadata: {
        sectionId: newSection.id,
        sectionName: newSection.name,
        route: newPathname,
      },
    });

    this.recordActivitySignal(true);
  }

  /**
   * Updates the current active route and syncs activity.
   */
  public updateRoute(newRoute: string): void {
    this.handleRouteChange(newRoute);
  }

  /**
   * Handles visibility changes to prevent inflating section exploration time.
   */
  public handleVisibilityChange(isHidden: boolean): void {
    const now = Date.now();
    if (this.currentSection) {
      if (isHidden) {
        if (!this.currentSection.isPaused) {
          this.currentSection.accumulatedActiveMs += Math.max(
            0,
            now - this.currentSection.enteredAtEpoch
          );
          this.currentSection.isPaused = true;
        }
      } else {
        if (this.currentSection.isPaused) {
          this.currentSection.enteredAtEpoch = now;
          this.currentSection.isPaused = false;
        }
      }
    }

    if (isHidden) {
      this.recordActivitySignal(true);
      this.flushEventQueue().catch(() => {});
    } else {
      this.recordActivitySignal(false);
    }
  }

  /**
   * Tracks an item open or revisit with automatic deduplication.
   */
  public trackItemOpen(params: {
    itemId: string;
    itemType: string;
    title?: string;
    itemNumber?: number | string;
    section?: string;
    metadata?: Record<string, any>;
  }): void {
    if (!params.itemId) return;

    const itemKey = `${params.itemType}_${params.itemId}`;
    const isRevisit = this.seenItemIds.has(itemKey);
    const currentCount = (this.itemOpenCounts.get(itemKey) || 0) + 1;
    this.itemOpenCounts.set(itemKey, currentCount);
    this.seenItemIds.add(itemKey);

    const eventType: TrackingEventType = isRevisit ? 'item_revisited' : 'item_opened';

    this.queueEvent({
      type: eventType,
      route: this.currentRoute,
      metadata: {
        itemId: params.itemId,
        itemType: params.itemType,
        title: params.title,
        itemNumber: params.itemNumber,
        section: params.section || (this.currentSection ? this.currentSection.id : undefined),
        openCount: currentCount,
        ...params.metadata,
      },
    });
  }

  /**
   * Tracks meaningful media views.
   */
  public trackMediaView(params: {
    mediaId: string;
    mediaType: string;
    parentItemId?: string;
    title?: string;
    section?: string;
    route?: string;
    metadata?: Record<string, any>;
  }): void {
    if (!params.mediaId) return;

    const now = Date.now();
    const mediaKey = `${params.mediaType}_${params.mediaId}`;

    // Guard against duplicate rapid events (e.g., within 2 seconds)
    if (this.lastMediaViewedKey === mediaKey && now - this.lastMediaViewedTime < 2000) {
      return;
    }
    this.lastMediaViewedKey = mediaKey;
    this.lastMediaViewedTime = now;

    this.queueEvent({
      type: 'media_viewed',
      route: params.route || this.currentRoute,
      metadata: {
        mediaId: params.mediaId,
        mediaType: params.mediaType,
        parentItemId: params.parentItemId,
        title: params.title,
        section: params.section || (this.currentSection ? this.currentSection.id : undefined),
        route: params.route || this.currentRoute,
        ...params.metadata,
      },
    });
  }

  /**
   * Tracks debounced search queries.
   */
  public trackSearch(params: {
    section: string;
    searchTerm: string;
    route?: string;
    resultCount?: number;
  }): void {
    const trimmed = (params.searchTerm || '').trim();
    if (!trimmed) return;

    const lastTerm = this.lastSearchQueries.get(params.section);
    if (lastTerm === trimmed) return;
    this.lastSearchQueries.set(params.section, trimmed);

    this.queueEvent({
      type: 'search_performed',
      route: params.route || this.currentRoute,
      metadata: {
        section: params.section,
        searchTerm: trimmed,
        route: params.route || this.currentRoute,
        resultCount: typeof params.resultCount === 'number' ? params.resultCount : undefined,
      },
    });
  }

  /**
   * Tracks filter selections.
   */
  public trackFilter(params: {
    section: string;
    filterType: string;
    selectedValue: string;
    route?: string;
    resultCount?: number;
  }): void {
    const filterKey = `${params.section}_${params.filterType}`;
    const lastVal = this.lastFilterValues.get(filterKey);
    if (lastVal === params.selectedValue) return;
    this.lastFilterValues.set(filterKey, params.selectedValue);

    this.queueEvent({
      type: 'filter_applied',
      route: params.route || this.currentRoute,
      metadata: {
        section: params.section,
        filterType: params.filterType,
        selectedValue: params.selectedValue,
        route: params.route || this.currentRoute,
        resultCount: typeof params.resultCount === 'number' ? params.resultCount : undefined,
      },
    });
  }

  /**
   * Tracks Sneak a Peek lifecycle events.
   */
  public trackSneakPeek(action: 'viewed' | 'skipped' | 'completed'): void {
    const actionKey = `sneak_peek_${action}`;
    if (this.sneakPeekActionsTracked.has(actionKey)) return;
    this.sneakPeekActionsTracked.add(actionKey);

    const eventType: TrackingEventType =
      action === 'viewed'
        ? 'sneak_peek_viewed'
        : action === 'skipped'
        ? 'sneak_peek_skipped'
        : 'sneak_peek_completed';

    this.queueEvent({
      type: eventType,
      route: this.currentRoute,
      metadata: {
        action,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Tracks sanitized, user-facing error events.
   */
  public trackError(params: {
    category: string;
    message: string;
    component?: string;
    section?: string;
    route?: string;
    operation?: string;
  }): void {
    const safeMessage = (params.message || 'Unknown error').slice(0, 300);

    this.queueEvent({
      type: 'error',
      category: params.category,
      route: params.route || this.currentRoute,
      metadata: {
        category: params.category,
        message: safeMessage,
        component: params.component,
        section: params.section || (this.currentSection ? this.currentSection.id : undefined),
        route: params.route || this.currentRoute,
        operation: params.operation,
      },
    });
  }

  /**
   * Records a user interaction signal (click, keypress, touch, navigation) with throttling.
   */
  public recordActivitySignal(forceSync: boolean = false): void {
    const now = Date.now();
    this.lastActivityClientEpoch = now;

    if (!this.activeUserId || !this.activeSessionId || !this.isSessionStartedInDb) {
      return;
    }

    const elapsedSinceLastSync = now - this.lastSyncedActivityClientEpoch;
    if (forceSync || elapsedSinceLastSync >= ACTIVITY_THROTTLE_MS) {
      this.lastSyncedActivityClientEpoch = now;
      this.syncSessionActivityToDb(now).catch(() => {});
    }
  }

  /**
   * Syncs latest activity timestamp and current route to the active session document.
   */
  private async syncSessionActivityToDb(clientEpoch: number): Promise<void> {
    if (!this.activeUserId || !this.activeSessionId || !this.isSessionStartedInDb) return;

    try {
      const sessionRef = doc(db, 'users', this.activeUserId, 'sessions', this.activeSessionId);
      await updateDoc(sessionRef, {
        lastActivityAt: serverTimestamp(),
        lastActivityClientEpoch: clientEpoch,
        currentRoute: this.currentRoute,
        status: 'active',
      });
    } catch (err) {
      // Non-blocking update failure
      console.warn('[Tracking] Activity sync notice:', err);
    }
  }

  /**
   * Queue an activity event into the bounded in-memory buffer.
   */
  public queueEvent(params: {
    type: TrackingEventType | string;
    category?: string;
    route?: string;
    metadata?: Record<string, any>;
  }): void {
    if (!this.activeUserId || !this.activeSessionId) return;

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const event: TrackingEvent = {
      eventId,
      sessionId: this.activeSessionId,
      userId: this.activeUserId,
      type: params.type,
      category: params.category,
      route: params.route || this.currentRoute,
      timestamp: serverTimestamp(),
      metadata: params.metadata ? { ...params.metadata } : undefined,
      clientEpoch: Date.now(),
    };

    if (this.eventQueue.length >= MAX_QUEUE_SIZE) {
      // Bounded queue: discard oldest item to prevent memory leaks
      this.eventQueue.shift();
    }

    this.eventQueue.push(event);
    this.recordActivitySignal();
  }

  /**
   * Flush queued events to Firestore using atomic batch writes.
   */
  public async flushEventQueue(): Promise<void> {
    if (
      this.isFlushingQueue ||
      this.eventQueue.length === 0 ||
      !this.activeUserId ||
      !this.activeSessionId ||
      !isFirebaseConfigured
    ) {
      return;
    }

    this.isFlushingQueue = true;
    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    let attempt = 0;
    let success = false;

    while (attempt < MAX_RETRY_ATTEMPTS && !success) {
      attempt++;
      try {
        const batch = writeBatch(db);
        const sessionRef = doc(
          db,
          'users',
          this.activeUserId,
          'sessions',
          this.activeSessionId
        );

        for (const evt of eventsToFlush) {
          const eventRef = doc(
            db,
            'users',
            this.activeUserId,
            'sessions',
            this.activeSessionId,
            'events',
            evt.eventId
          );
          batch.set(eventRef, {
            ...evt,
            timestamp: serverTimestamp(),
          });
        }

        // Increment event counter on session
        batch.update(sessionRef, {
          eventCount: increment(eventsToFlush.length),
          lastActivityAt: serverTimestamp(),
        });

        await batch.commit();
        success = true;
      } catch (error) {
        console.warn(`[Tracking] Batch write attempt ${attempt} failed:`, error);
        if (attempt < MAX_RETRY_ATTEMPTS) {
          await new Promise((res) => setTimeout(res, 500 * Math.pow(2, attempt)));
        }
      }
    }

    if (!success) {
      console.warn('[Tracking] Dropping batch after max retries to protect memory bounds.');
    }

    this.isFlushingQueue = false;
  }

  /**
   * Handles browser unload/visibility change to end session safely.
   */
  public async handleSessionEnd(): Promise<void> {
    if (
      this.isEndingSession ||
      !this.activeUserId ||
      !this.activeSessionId ||
      !this.isSessionStartedInDb ||
      !isFirebaseConfigured
    ) {
      return;
    }

    this.isEndingSession = true;

    // If currently in a section, record final section_left
    if (this.currentSection) {
      const now = Date.now();
      let finalDurationMs = this.currentSection.accumulatedActiveMs;
      if (!this.currentSection.isPaused) {
        finalDurationMs += Math.max(0, now - this.currentSection.enteredAtEpoch);
      }
      const durationSeconds = Math.max(0, Math.floor(finalDurationMs / 1000));

      this.queueEvent({
        type: 'section_left',
        route: this.currentSection.route,
        metadata: {
          sectionId: this.currentSection.id,
          sectionName: this.currentSection.name,
          route: this.currentSection.route,
          durationSeconds: isFinite(durationSeconds) ? durationSeconds : 0,
        },
      });
      this.currentSection = null;
    }

    // Flush any pending queued events first
    await this.flushEventQueue().catch(() => {});

    try {
      const now = Date.now();
      const startEpoch = this.sessionCreatedAtClientEpoch || now;
      const durationSeconds = Math.max(0, Math.floor((now - startEpoch) / 1000));

      const sessionRef = doc(db, 'users', this.activeUserId, 'sessions', this.activeSessionId);

      await updateDoc(sessionRef, {
        status: 'ended',
        endedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
        durationSeconds: isFinite(durationSeconds) ? durationSeconds : 0,
        lastActivityClientEpoch: now,
      });
    } catch (err) {
      console.warn('[Tracking] Session end flush notice:', err);
    }
  }

  /**
   * Resets internal state on user logout.
   */
  public handleUserLogout(): void {
    this.handleSessionEnd().catch(() => {});
    this.activeUserId = null;
    this.isSessionStartedInDb = false;
    this.isEndingSession = false;
    this.hasTrackedWebsiteOpened = false;
    this.currentSection = null;
    this.seenItemIds.clear();
    this.itemOpenCounts.clear();
    this.lastSearchQueries.clear();
    this.lastFilterValues.clear();
    this.sneakPeekActionsTracked.clear();
    this.eventQueue = [];
  }

  private setupPeriodicFlush(): void {
    if (typeof window !== 'undefined') {
      this.flushTimer = setInterval(() => {
        if (this.eventQueue.length > 0) {
          this.flushEventQueue().catch(() => {});
        }
      }, BATCH_FLUSH_INTERVAL_MS);
    }
  }

  public cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// Singleton tracking service instance
export const userTrackingService = new UserTrackingService();
