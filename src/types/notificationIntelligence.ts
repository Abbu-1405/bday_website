import { NotificationEventType } from './notification';

export type NotificationDecisionState = 'ALLOW' | 'DELAY' | 'SUPPRESS';

export type NotificationDecisionPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

export type NotificationDecisionReasonCode =
  | 'EMERGENCY_STOP'
  | 'USER_DISABLED'
  | 'CATEGORY_DISABLED'
  | 'QUIET_HOURS'
  | 'COOLDOWN'
  | 'HOURLY_LIMIT'
  | 'DAILY_LIMIT'
  | 'CATEGORY_DAILY_LIMIT'
  | 'SMART_DELAY'
  | 'SCHEDULED_FOR_LATER'
  | 'DUPLICATE_EVENT'
  | 'NO_DEVICE_TOKEN'
  | 'INVALID_TARGET'
  | 'LOW_RELEVANCE'
  | 'ALLOWED_IMMEDIATE'
  | 'ALLOWED_SCHEDULED'
  | 'ALLOWED_PREFERRED_WINDOW'
  | 'TEST_PUSH_BYPASS'
  | 'FALLBACK_ALLOWED';

export interface NotificationDecisionResult {
  decision: NotificationDecisionState;
  reason: NotificationDecisionReasonCode;
  reasonExplanation: string;
  priority: NotificationDecisionPriority;
  recommendedDeliveryAt?: string | null;
  cooldownUntil?: string | null;
  signalsUsed: string[];
  source: 'smart_engine' | 'user_prefs' | 'emergency_stop' | 'admin_test' | 'fallback_rule';
  metrics?: {
    sentPastHour?: number;
    sentPast24h?: number;
    categorySentPast24h?: number;
    categoryCTR?: number;
    preferredWindow?: string;
    isQuietHours?: boolean;
    timeSinceLastSentMinutes?: number;
  };
}

export interface NotificationIntelligenceConfig {
  enabled: boolean;
  maxPerHour: number;
  maxPerDay: number;
  categoryDailyLimits: Record<string, number>;
  minimumSpacingMinutes: number;
  quietHoursOptimization: boolean;
  preferredTimingOptimization: boolean;
  adaptiveCooldowns: boolean;
  minHistoryForOptimization: number;
  lastUpdatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_INTELLIGENCE_CONFIG: NotificationIntelligenceConfig = {
  enabled: true,
  maxPerHour: 3,
  maxPerDay: 8,
  categoryDailyLimits: {
    LETTER_AVAILABLE: 5,
    OPEN_WHEN_AVAILABLE: 3,
    SECRET_UNLOCKED: 3,
    MOMENT_AVAILABLE: 3,
    BIRTHDAY: 2,
    GENERAL: 2,
  },
  minimumSpacingMinutes: 15,
  quietHoursOptimization: true,
  preferredTimingOptimization: true,
  adaptiveCooldowns: true,
  minHistoryForOptimization: 5,
};

export interface UserEngagementSignals {
  totalEvents: number;
  totalSent: number;
  totalClicked: number;
  totalTargetOpened: number;
  overallCTR: number;
  overallOpenRate: number;
  sentPastHour: number;
  sentPast24h: number;
  lastSentTimestamp: number | null;
  categoryStats: Record<
    string,
    {
      sentCount: number;
      clickedCount: number;
      targetOpenedCount: number;
      ctr: number;
      openRate: number;
      sentPast24h: number;
      lastSentTimestamp: number | null;
    }
  >;
  preferredTimeWindow: 'morning' | 'afternoon' | 'evening' | 'night' | 'neutral';
  windowClickDistribution: Record<string, number>;
  hasSufficientData: boolean;
}

export interface NotificationIntelligenceAnalyticsSummary {
  totalDecisions: number;
  allowedCount: number;
  delayedCount: number;
  suppressedCount: number;
  allowedRate: number;
  delayedRate: number;
  suppressedRate: number;
  byReason: {
    reason: NotificationDecisionReasonCode | string;
    label: string;
    count: number;
    percentage: number;
  }[];
  byPriority: {
    priority: NotificationDecisionPriority;
    count: number;
    percentage: number;
  }[];
  savedByCooldowns: number;
  delayedByQuietHours: number;
  delayedBySmartWindow: number;
  avgDelayMinutes: number;
}
