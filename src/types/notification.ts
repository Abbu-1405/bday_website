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
