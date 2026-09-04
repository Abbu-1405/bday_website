export interface NotificationToken {
  id: string;
  uid: string;
  token: string;
  platform: string;
  browser: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
}

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface NotificationStatusInfo {
  isSupported: boolean;
  permission: NotificationPermissionState;
  hasToken: boolean;
  hasVapidKey: boolean;
  token?: string | null;
  loading: boolean;
  error?: string | null;
}

export type NotificationEventType =
  | 'LETTER_AVAILABLE'
  | 'OPEN_WHEN_AVAILABLE'
  | 'SECRET_UNLOCKED'
  | 'MOMENT_AVAILABLE'
  | 'BIRTHDAY'
  | 'GENERAL';

export type NotificationEventStatus = 'scheduled' | 'pending' | 'processing' | 'sent' | 'failed';

export type NotificationDeliveryMode = 'immediate' | 'scheduled';

export interface NotificationEvent {
  id?: string;
  userId: string;
  type: NotificationEventType | string;
  title: string;
  body: string;
  templateId?: string | null;
  templateVersion?: number | null;
  data?: Record<string, any>;
  createdAt?: any;
  status: NotificationEventStatus;
  deliveryMode?: NotificationDeliveryMode;
  scheduledAt?: any | string | null;
  timezone?: string | null;
  cooldownCategory?: string | null;
  attemptCount?: number;
  lastAttemptAt?: any | null;
  nextAttemptAt?: any | null;
  processedAt?: any | null;
  sentAt?: any | null;
  successfulTokenCount?: number;
  failedTokenCount?: number;
  failureReason?: string | null;
  error?: string | null;

  // Phase 7: Engagement & Interaction Tracking (sentAt ≠ clickedAt ≠ targetOpenedAt)
  clickedAt?: any | string | null;
  lastClickedAt?: any | string | null;
  openedCount?: number;
  targetOpenedAt?: any | string | null;
  interactionSource?: 'push_notification' | 'in_app' | 'history_click' | string | null;

  // Phase 8: Smart Notification Intelligence & Audit Trail
  decision?: 'ALLOW' | 'DELAY' | 'SUPPRESS' | string | null;
  decisionReason?: string | null;
  decisionReasonExplanation?: string | null;
  decisionPriority?: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW' | string | null;
  decisionAt?: any | string | null;
  decisionSource?: string | null;
  recommendedDeliveryAt?: any | string | null;
  signalsUsed?: string[] | null;
}

export interface NotificationTemplate {
  id: string;
  category: NotificationEventType;
  title: string;
  body: string;
  enabled: boolean;
  version: number;
  variables: string[];
  actionRoute: string;
  updatedAt: string;
  updatedBy?: string;
  description?: string;
}

export interface TemplateVariables {
  userName?: string;
  letterTitle?: string;
  openWhenTitle?: string;
  momentTitle?: string;
  secretTitle?: string;
  scheduledDate?: string;
  appName?: string;
  [key: string]: string | undefined;
}

export interface RenderedTemplateResult {
  title: string;
  body: string;
  templateId: string;
  templateVersion: number;
  actionRoute: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  letters: boolean;
  openWhen: boolean;
  secrets: boolean;
  moments: boolean;
  birthday: boolean;
  timezone?: string;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "07:00"
  birthDate?: string; // "YYYY-MM-DD" or "MM-DD"
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  letters: true,
  openWhen: true,
  secrets: true,
  moments: true,
  birthday: true,
  timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

export interface CreateNotificationEventParams {
  userId: string;
  type: NotificationEventType | string;
  title?: string;
  body?: string;
  templateId?: string;
  templateVariables?: TemplateVariables;
  data?: Record<string, any>;
  eventKey?: string;
  deliveryMode?: NotificationDeliveryMode;
  scheduledAt?: any;
  timezone?: string;
  cooldownCategory?: string;
  bypassPreferences?: boolean;
  bypassQuietHours?: boolean;
  bypassDiscoveryBurst?: boolean;
}

export type NotificationTimeRange = 'today' | '7d' | '30d' | 'all';

export interface NotificationAnalyticsSummary {
  total: number;
  pending: number;
  scheduled: number;
  processing: number;
  sent: number;
  failed: number;
  successRate: number; // percentage (0 - 100)
  immediateCount: number;
  scheduledCount: number;
  quietHoursDelayedCount: number;
  totalTokensAttempted: number;
  totalTokensSuccessful: number;
  totalTokensFailed: number;
  tokenDeliverySuccessRate: number;
  avgProcessingTimeMs: number;
  avgAttemptCount: number;
}

export interface NotificationCategoryStatItem {
  category: NotificationEventType;
  label: string;
  count: number;
  percentage: number;
  sent: number;
  failed: number;
  pending: number;
  scheduled: number;
  successRate: number;
}

export interface NotificationTimeSeriesPoint {
  dateKey: string;
  label: string;
  timestamp: number;
  total: number;
  sent: number;
  failed: number;
  scheduled: number;
  pending: number;
}

export interface NotificationFailureItem {
  id: string;
  eventId: string;
  category: NotificationEventType | string;
  reason: string;
  reasonGroup: 'NO_TOKENS' | 'INVALID_TOKEN' | 'PREFERENCES_DISABLED' | 'FCM_ERROR' | 'TIMEOUT' | 'OTHER';
  timestamp: string;
  userId: string;
  title: string;
}

export interface NotificationFailureGroup {
  group: string;
  label: string;
  count: number;
  percentage: number;
  description: string;
  recentExamples: NotificationFailureItem[];
}

export interface NotificationTokenHealth {
  totalRegisteredTokens: number;
  enabledTokens: number;
  invalidatedTokens: number;
  invalidTokenRate: number; // percentage
  platformBreakdown: { name: string; count: number; percentage: number }[];
  browserBreakdown: { name: string; count: number; percentage: number }[];
  recentInvalidatedTokens: {
    id: string;
    userId: string;
    platform: string;
    browser: string;
    invalidReason?: string;
    invalidatedAt?: string;
  }[];
}

export interface NotificationGlobalControl {
  globalEnabled: boolean;
  emergencyDisabledAt?: string | null;
  disabledBy?: string | null;
  reason?: string | null;
  lastUpdatedAt?: string | null;
  updatedBy?: string | null;
}

export interface NotificationSystemHealth {
  status: 'healthy' | 'degraded' | 'error';
  vapidConfigured: boolean;
  isPushSupported: boolean;
  cloudFunctionsTriggerReady: boolean;
  pendingQueueCount: number;
  processingCount: number;
  recentFailureRate24h: number;
  activeTokenCount: number;
  invalidTokenCount: number;
  globalEnabled: boolean;
  lastCheckedAt: string;
}

export interface NotificationHistoryFilterState {
  status: 'all' | NotificationEventStatus;
  category: 'all' | NotificationEventType;
  deliveryMode: 'all' | NotificationDeliveryMode;
  timeRange: NotificationTimeRange;
  searchQuery: string;
  templateId: string;
  hasFailureOnly: boolean;
}

// Phase 7: Engagement & Interaction Analytics
export interface NotificationCategoryEngagement {
  category: NotificationEventType;
  label: string;
  sent: number;
  clicked: number;
  ctr: number; // Click-through rate (%)
  targetOpened: number;
  contentOpenRate: number; // Content open rate (%)
}

export interface NotificationTemplateEngagement {
  templateId: string;
  templateVersion: number;
  title: string;
  category: NotificationEventType | string;
  sent: number;
  clicked: number;
  ctr: number; // Click-through rate (%)
  targetOpened: number;
  contentOpenRate: number;
}

export interface NotificationEngagementSummary {
  totalSent: number;
  totalClicked: number;
  uniqueClickedEvents: number;
  clickThroughRate: number; // uniqueClicked / totalSent (%)
  totalTargetOpened: number;
  contentOpenRate: number; // targetOpened / uniqueClicked (%)
  avgTimeToClickMs: number;
  avgTimeToContentOpenMs: number;
  byCategory: NotificationCategoryEngagement[];
  byTemplate: NotificationTemplateEngagement[];
  byDeliveryMode: {
    immediate: { sent: number; clicked: number; ctr: number; targetOpened: number; contentOpenRate: number };
    scheduled: { sent: number; clicked: number; ctr: number; targetOpened: number; contentOpenRate: number };
  };
}

export * from './notificationIntelligence';

