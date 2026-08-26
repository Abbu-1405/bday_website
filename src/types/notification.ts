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
}
