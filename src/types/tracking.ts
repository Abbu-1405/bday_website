export type DeviceCategory = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export type SessionStatus = 'active' | 'ended';

export interface DeviceInfo {
  category: DeviceCategory;
  browser: string;
  browserVersion?: string;
  os: string;
  osVersion?: string;
  userAgent: string;
  language: string;
  timezone: string;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  orientation?: 'portrait' | 'landscape';
  touchCapable: boolean;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  status: SessionStatus;
  startedAt: any;
  lastActivityAt: any;
  endedAt?: any;
  durationSeconds?: number;
  initialRoute: string;
  currentRoute: string;
  device: DeviceInfo;
  eventCount?: number;
  createdAtClientEpoch: number;
  lastActivityClientEpoch: number;
}

export type TrackingEventType =
  | 'website_opened'
  | 'section_entered'
  | 'section_left'
  | 'navigation'
  | 'item_opened'
  | 'item_revisited'
  | 'media_viewed'
  | 'search_performed'
  | 'filter_applied'
  | 'sneak_peek_viewed'
  | 'sneak_peek_skipped'
  | 'sneak_peek_completed'
  | 'error';

export interface SectionEnteredMetadata {
  sectionId: string;
  sectionName: string;
  route: string;
}

export interface SectionLeftMetadata {
  sectionId: string;
  sectionName: string;
  route: string;
  durationSeconds: number;
}

export interface NavigationMetadata {
  fromSection: string;
  toSection: string;
  fromRoute: string;
  toRoute: string;
}

export interface ItemActivityMetadata {
  itemId: string;
  itemType: string;
  title?: string;
  itemNumber?: number | string;
  section?: string;
  openCount?: number;
  [key: string]: any;
}

export interface MediaViewedMetadata {
  mediaId: string;
  mediaType: string;
  parentItemId?: string;
  title?: string;
  section?: string;
  route?: string;
  [key: string]: any;
}

export interface SearchPerformedMetadata {
  section: string;
  searchTerm: string;
  route?: string;
  resultCount?: number;
}

export interface FilterAppliedMetadata {
  section: string;
  filterType: string;
  selectedValue: string;
  route?: string;
  resultCount?: number;
}

export interface SneakPeekMetadata {
  action: 'viewed' | 'skipped' | 'completed';
  timestamp?: number;
}

export interface ErrorTrackingMetadata {
  category: string;
  message: string;
  component?: string;
  section?: string;
  route?: string;
  operation?: string;
}

export interface TrackingEvent {
  eventId: string;
  sessionId: string;
  userId: string;
  type: TrackingEventType | string;
  category?: string;
  route?: string;
  timestamp: any;
  metadata?: Record<string, any>;
  clientEpoch: number;
}

export interface UserVisitSummary {
  totalVisits: number;
  firstVisitAt?: any;
  lastVisitAt?: any;
  lastSessionId?: string;
}

export interface TrackedUserOverview {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'admin';
  totalVisits: number;
  firstVisitEpoch: number | null;
  firstVisitFormatted: string;
  lastActiveEpoch: number | null;
  lastActiveFormatted: string;
  totalTimeSpentSeconds: number;
  totalTimeSpentFormatted: string;
  currentSection: string;
  currentRoute: string;
  status: 'online' | 'recent' | 'inactive';
  deviceCategory?: DeviceCategory;
  browser?: string;
  os?: string;
  activeSessionId?: string;
}

export interface TrackingSummaryMetrics {
  totalTrackedUsers: number;
  totalVisits: number;
  totalTrackedTimeSeconds: number;
  totalTrackedTimeFormatted: string;
  activeUsers24h: number;
  activeUsers7d: number;
  onlineUsersNow: number;
}

// ==========================================
// Phase 3B User Detail & Exploration Types
// ==========================================

export interface SectionExplorationStat {
  sectionId: string;
  sectionName: string;
  route: string;
  visitCount: number;
  uniqueItemsCount: number;
  totalItemOpens: number;
  totalActiveTimeSeconds: number;
  totalActiveTimeFormatted: string;
  lastExploredEpoch: number | null;
  lastExploredFormatted: string;
}

export interface ItemExplorationStat {
  itemKey: string;
  itemId: string;
  itemType: string;
  title: string;
  itemNumber?: number | string;
  section: string;
  firstOpenedEpoch: number | null;
  firstOpenedFormatted: string;
  lastOpenedEpoch: number | null;
  lastOpenedFormatted: string;
  totalOpens: number;
  revisitCount: number;
}

export interface MediaExplorationStat {
  mediaKey: string;
  mediaId: string;
  mediaType: string;
  parentItemId?: string;
  title?: string;
  section?: string;
  viewCount: number;
  firstViewedEpoch: number | null;
  firstViewedFormatted: string;
  lastViewedEpoch: number | null;
  lastViewedFormatted: string;
}

export interface SearchHistoryItem {
  eventId: string;
  sessionId: string;
  section: string;
  searchTerm: string;
  resultCount?: number;
  timestampEpoch: number;
  timestampFormatted: string;
  route?: string;
}

export interface FilterHistoryItem {
  eventId: string;
  sessionId: string;
  section: string;
  filterType: string;
  selectedValue: string;
  resultCount?: number;
  timestampEpoch: number;
  timestampFormatted: string;
  route?: string;
}

export interface SneakPeekHistoryItem {
  eventId: string;
  sessionId: string;
  action: 'viewed' | 'skipped' | 'completed' | string;
  timestampEpoch: number;
  timestampFormatted: string;
}

export interface NavigationHistoryItem {
  eventId: string;
  sessionId: string;
  fromSection: string;
  toSection: string;
  fromRoute: string;
  toRoute: string;
  timestampEpoch: number;
  timestampFormatted: string;
}

export interface ErrorHistoryItem {
  eventId: string;
  sessionId: string;
  category: string;
  message: string;
  component?: string;
  section?: string;
  operation?: string;
  route?: string;
  timestampEpoch: number;
  timestampFormatted: string;
}

export interface SessionHistoryItem {
  sessionId: string;
  startedAtEpoch: number;
  startedAtFormatted: string;
  endedAtEpoch: number | null;
  endedAtFormatted: string;
  durationSeconds: number;
  durationFormatted: string;
  initialRoute: string;
  currentRoute: string;
  deviceCategory: DeviceCategory;
  browser: string;
  os: string;
  screenWidth?: number;
  screenHeight?: number;
  status: SessionStatus;
  eventCount: number;
  events?: TrackingEvent[];
}

export interface TrackedUserDetail {
  user: TrackedUserOverview;
  sessions: SessionHistoryItem[];
  sectionExploration: SectionExplorationStat[];
  itemExploration: ItemExplorationStat[];
  mediaExploration: MediaExplorationStat[];
  searchHistory: SearchHistoryItem[];
  filterHistory: FilterHistoryItem[];
  sneakPeekHistory: SneakPeekHistoryItem[];
  navigationHistory: NavigationHistoryItem[];
  errorHistory: ErrorHistoryItem[];
  events: TrackingEvent[];
}

// ==========================================
// Phase 3C Live Activity Monitor Types
// ==========================================

export type LiveConnectionStatus = 'connected' | 'connecting' | 'error' | 'offline';

export type LiveUserStatus = 'online' | 'recent' | 'offline';

export interface LiveSessionInfo {
  sessionId: string;
  deviceCategory: DeviceCategory;
  browser: string;
  os: string;
  currentRoute: string;
  currentSection: string;
  startedAtEpoch: number;
  lastActivityEpoch: number;
  lastActivityFormatted: string;
}

export interface LiveActiveUser {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'admin';
  status: LiveUserStatus;
  sessions: LiveSessionInfo[];
  primarySection: string;
  primaryRoute: string;
  lastActivityEpoch: number;
  lastActivityFormatted: string;
  latestEventSnippet?: string;
  latestEventTimeFormatted?: string;
  activeSessionCount: number;
}

export interface LiveFeedItem {
  eventId: string;
  sessionId: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  userPhotoURL?: string;
  userRole?: 'user' | 'admin';
  type: TrackingEventType | string;
  actionTitle: string;
  actionDescription: string;
  section: string;
  route?: string;
  timestampEpoch: number;
  timestampFormatted: string;
  deviceCategory?: DeviceCategory;
  isError?: boolean;
  metadata?: Record<string, any>;
}

export interface LiveFeedFilters {
  selectedUserId: string; // 'all' or userId
  selectedSection: string; // 'all' or section name
  selectedEventType: string; // 'all' or specific type
  searchQuery: string;
}


