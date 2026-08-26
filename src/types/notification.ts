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

export type NotificationEventStatus = 'pending' | 'processing' | 'sent' | 'failed';

export interface NotificationEvent {
  id?: string;
  userId: string;
  type: NotificationEventType | string;
  title: string;
  body: string;
  data?: Record<string, any>;
  createdAt?: any;
  status: NotificationEventStatus;
  processedAt?: any | null;
  sentAt?: any | null;
  successfulTokenCount?: number;
  failedTokenCount?: number;
  failureReason?: string | null;
  error?: string | null;
}

export interface NotificationPreferences {
  enabled: boolean;
  letters: boolean;
  openWhen: boolean;
  secrets: boolean;
  moments: boolean;
  birthday: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  letters: true,
  openWhen: true,
  secrets: true,
  moments: true,
  birthday: true,
};

export interface CreateNotificationEventParams {
  userId: string;
  type: NotificationEventType | string;
  title: string;
  body: string;
  data?: Record<string, any>;
  eventKey?: string;
}
