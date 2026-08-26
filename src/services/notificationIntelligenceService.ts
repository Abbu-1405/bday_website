import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import {
  NotificationDecisionResult,
  NotificationDecisionState,
  NotificationDecisionPriority,
  NotificationDecisionReasonCode,
  NotificationIntelligenceConfig,
  DEFAULT_INTELLIGENCE_CONFIG,
  UserEngagementSignals,
  NotificationEventType,
  NotificationPreferences,
  NotificationEvent,
} from '../types';
import { adjustForQuietHours, getDetectedTimezone } from './notificationService';

const INTELLIGENCE_CONFIG_CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache
let cachedConfig: { config: NotificationIntelligenceConfig; timestamp: number } | null = null;

const CATEGORY_LABELS: Record<string, string> = {
  LETTER_AVAILABLE: 'Letters',
  OPEN_WHEN_AVAILABLE: 'Open When',
  SECRET_UNLOCKED: 'Secret Vault',
  MOMENT_AVAILABLE: 'Moments',
  BIRTHDAY: 'Birthday',
  GENERAL: 'General',
};

/**
 * Retrieves the centralized Smart Notification Intelligence configuration
 */
export async function getIntelligenceConfig(): Promise<NotificationIntelligenceConfig> {
  const now = Date.now();
  if (cachedConfig && now - cachedConfig.timestamp < INTELLIGENCE_CONFIG_CACHE_TTL_MS) {
    return cachedConfig.config;
  }

  // Check localStorage for offline / fast fallback
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('starlit_notification_intelligence_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          const merged: NotificationIntelligenceConfig = {
            ...DEFAULT_INTELLIGENCE_CONFIG,
            ...parsed,
            categoryDailyLimits: {
              ...DEFAULT_INTELLIGENCE_CONFIG.categoryDailyLimits,
              ...(parsed.categoryDailyLimits || {}),
            },
          };
          cachedConfig = { config: merged, timestamp: now };
        }
      }
    } catch {
      // Ignore parse failure
    }
  }

  if (!isFirebaseConfigured) {
    return cachedConfig?.config || DEFAULT_INTELLIGENCE_CONFIG;
  }

  try {
    const docRef = doc(db, 'adminMeta', 'notificationIntelligence');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const resolved: NotificationIntelligenceConfig = {
        enabled: data.enabled !== false,
        maxPerHour: typeof data.maxPerHour === 'number' ? data.maxPerHour : DEFAULT_INTELLIGENCE_CONFIG.maxPerHour,
        maxPerDay: typeof data.maxPerDay === 'number' ? data.maxPerDay : DEFAULT_INTELLIGENCE_CONFIG.maxPerDay,
        categoryDailyLimits: {
          ...DEFAULT_INTELLIGENCE_CONFIG.categoryDailyLimits,
          ...(data.categoryDailyLimits || {}),
        },
        minimumSpacingMinutes:
          typeof data.minimumSpacingMinutes === 'number'
            ? data.minimumSpacingMinutes
            : DEFAULT_INTELLIGENCE_CONFIG.minimumSpacingMinutes,
        quietHoursOptimization: data.quietHoursOptimization !== false,
        preferredTimingOptimization: data.preferredTimingOptimization !== false,
        adaptiveCooldowns: data.adaptiveCooldowns !== false,
        minHistoryForOptimization:
          typeof data.minHistoryForOptimization === 'number'
            ? data.minHistoryForOptimization
            : DEFAULT_INTELLIGENCE_CONFIG.minHistoryForOptimization,
        lastUpdatedAt: data.lastUpdatedAt || undefined,
        updatedBy: data.updatedBy || undefined,
      };

      cachedConfig = { config: resolved, timestamp: Date.now() };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('starlit_notification_intelligence_config', JSON.stringify(resolved));
      }
      return resolved;
    }
  } catch (err) {
    console.warn('[NotificationIntelligence] Notice loading intelligence config from Firestore:', err);
  }

  return cachedConfig?.config || DEFAULT_INTELLIGENCE_CONFIG;
}

/**
 * Updates the Smart Notification Intelligence configuration (Admin only)
 */
export async function updateIntelligenceConfig(
  updates: Partial<NotificationIntelligenceConfig>,
  adminUid?: string
): Promise<{ success: boolean; config?: NotificationIntelligenceConfig; error?: string }> {
  try {
    const current = await getIntelligenceConfig();
    const cleanMaxPerHour = Math.max(1, Math.min(20, updates.maxPerHour ?? current.maxPerHour));
    const cleanMaxPerDay = Math.max(1, Math.min(50, updates.maxPerDay ?? current.maxPerDay));
    const cleanSpacing = Math.max(0, Math.min(180, updates.minimumSpacingMinutes ?? current.minimumSpacingMinutes));
    const cleanMinHistory = Math.max(1, Math.min(50, updates.minHistoryForOptimization ?? current.minHistoryForOptimization));

    const updated: NotificationIntelligenceConfig = {
      ...current,
      ...updates,
      maxPerHour: cleanMaxPerHour,
      maxPerDay: cleanMaxPerDay,
      minimumSpacingMinutes: cleanSpacing,
      minHistoryForOptimization: cleanMinHistory,
      categoryDailyLimits: {
        ...current.categoryDailyLimits,
        ...(updates.categoryDailyLimits || {}),
      },
      lastUpdatedAt: new Date().toISOString(),
      updatedBy: adminUid || 'admin',
    };

    cachedConfig = { config: updated, timestamp: Date.now() };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('starlit_notification_intelligence_config', JSON.stringify(updated));
    }

    if (isFirebaseConfigured) {
      const docRef = doc(db, 'adminMeta', 'notificationIntelligence');
      await setDoc(docRef, updated, { merge: true });
    }

    return { success: true, config: updated };
  } catch (err: any) {
    console.error('[NotificationIntelligence] Failed to update config:', err);
    return {
      success: false,
      error: err?.message || 'Failed to save intelligence configuration.',
    };
  }
}

/**
 * Determines default explainable priority based on category
 */
export function getCategoryDefaultPriority(category: string): NotificationDecisionPriority {
  switch (category) {
    case 'LETTER_AVAILABLE':
    case 'SECRET_UNLOCKED':
      return 'HIGH';
    case 'OPEN_WHEN_AVAILABLE':
    case 'MOMENT_AVAILABLE':
    case 'BIRTHDAY':
      return 'NORMAL';
    case 'GENERAL':
      return 'LOW';
    default:
      return 'NORMAL';
  }
}

/**
 * Derives lightweight, privacy-preserving behavioral signals from user's notification history
 * Strictly analyzes notification interaction timestamps and categories. Never inspects message contents.
 */
export async function getUserEngagementSignals(
  userId: string,
  timezone?: string
): Promise<UserEngagementSignals> {
  const fallbackSignals: UserEngagementSignals = {
    totalEvents: 0,
    totalSent: 0,
    totalClicked: 0,
    totalTargetOpened: 0,
    overallCTR: 0,
    overallOpenRate: 0,
    sentPastHour: 0,
    sentPast24h: 0,
    lastSentTimestamp: null,
    categoryStats: {},
    preferredTimeWindow: 'neutral',
    windowClickDistribution: { morning: 0, afternoon: 0, evening: 0, night: 0 },
    hasSufficientData: false,
  };

  if (!userId || !isFirebaseConfigured) {
    return fallbackSignals;
  }

  try {
    const eventsRef = collection(db, 'notificationEvents');
    const q = query(eventsRef, where('userId', '==', userId), limit(60));
    const snap = await getDocs(q);

    if (snap.empty) {
      return fallbackSignals;
    }

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    let totalEvents = 0;
    let totalSent = 0;
    let totalClicked = 0;
    let totalTargetOpened = 0;
    let sentPastHour = 0;
    let sentPast24h = 0;
    let lastSentTimestamp: number | null = null;

    const categoryStats: Record<
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
    > = {};

    const windowClicks: Record<'morning' | 'afternoon' | 'evening' | 'night', number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

    const targetTimezone = timezone || getDetectedTimezone();

    snap.forEach((docSnap) => {
      const data = docSnap.data() as NotificationEvent;
      totalEvents++;

      const type = data.type || 'GENERAL';
      if (!categoryStats[type]) {
        categoryStats[type] = {
          sentCount: 0,
          clickedCount: 0,
          targetOpenedCount: 0,
          ctr: 0,
          openRate: 0,
          sentPast24h: 0,
          lastSentTimestamp: null,
        };
      }

      // Parse creation and sent timestamps
      let eventTime: number = 0;
      if (data.createdAt?.toMillis) {
        eventTime = data.createdAt.toMillis();
      } else if (data.createdAt?.seconds) {
        eventTime = data.createdAt.seconds * 1000;
      } else if (data.sentAt) {
        eventTime = new Date(data.sentAt).getTime();
      }

      if (data.status === 'sent' || data.sentAt) {
        totalSent++;
        categoryStats[type].sentCount++;

        if (eventTime > 0) {
          if (!lastSentTimestamp || eventTime > lastSentTimestamp) {
            lastSentTimestamp = eventTime;
          }
          if (
            !categoryStats[type].lastSentTimestamp ||
            eventTime > (categoryStats[type].lastSentTimestamp as number)
          ) {
            categoryStats[type].lastSentTimestamp = eventTime;
          }

          if (eventTime >= oneHourAgo) {
            sentPastHour++;
          }
          if (eventTime >= twentyFourHoursAgo) {
            sentPast24h++;
            categoryStats[type].sentPast24h++;
          }
        }
      }

      // Track clicks & target opens
      if (data.clickedAt) {
        totalClicked++;
        categoryStats[type].clickedCount++;

        // Bucket click time into local hour
        try {
          const clickDate = typeof data.clickedAt === 'string' ? new Date(data.clickedAt) : data.clickedAt?.toDate ? data.clickedAt.toDate() : null;
          if (clickDate && !isNaN(clickDate.getTime())) {
            const timeStr = clickDate.toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              timeZone: targetTimezone,
            });
            const hour = parseInt(timeStr, 10);
            if (hour >= 7 && hour < 12) {
              windowClicks.morning++;
            } else if (hour >= 12 && hour < 17) {
              windowClicks.afternoon++;
            } else if (hour >= 17 && hour < 22) {
              windowClicks.evening++;
            } else {
              windowClicks.night++;
            }
          }
        } catch {
          // Ignore timezone formatting errors
        }
      }

      if (data.targetOpenedAt) {
        totalTargetOpened++;
        categoryStats[type].targetOpenedCount++;
      }
    });

    // Derive category percentages
    Object.keys(categoryStats).forEach((cat) => {
      const c = categoryStats[cat];
      c.ctr = c.sentCount > 0 ? Math.round((c.clickedCount / c.sentCount) * 100) : 0;
      c.openRate = c.clickedCount > 0 ? Math.round((c.targetOpenedCount / c.clickedCount) * 100) : 0;
    });

    const overallCTR = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
    const overallOpenRate = totalClicked > 0 ? Math.round((totalTargetOpened / totalClicked) * 100) : 0;

    // Determine preferred window if >= 2 clicks and >= 45% cluster in one non-night window
    let preferredTimeWindow: 'morning' | 'afternoon' | 'evening' | 'night' | 'neutral' = 'neutral';
    if (totalClicked >= 2) {
      const candidates: ('morning' | 'afternoon' | 'evening')[] = ['morning', 'afternoon', 'evening'];
      for (const cand of candidates) {
        const count = windowClicks[cand];
        if (count / totalClicked >= 0.45) {
          preferredTimeWindow = cand;
          break;
        }
      }
    }

    const config = await getIntelligenceConfig();
    const hasSufficientData = totalEvents >= config.minHistoryForOptimization;

    return {
      totalEvents,
      totalSent,
      totalClicked,
      totalTargetOpened,
      overallCTR,
      overallOpenRate,
      sentPastHour,
      sentPast24h,
      lastSentTimestamp,
      categoryStats,
      preferredTimeWindow,
      windowClickDistribution: windowClicks,
      hasSufficientData,
    };
  } catch (err) {
    console.warn('[NotificationIntelligence] Notice extracting user engagement signals:', err);
    return fallbackSignals;
  }
}

export interface EvaluateDecisionParams {
  userId: string;
  type: NotificationEventType | string;
  userPrefs: NotificationPreferences;
  explicitScheduledDate?: Date | null;
  isExplicitlyScheduled?: boolean;
  timezone?: string;
  isTest?: boolean;
  globalEnabled?: boolean;
  globalPauseReason?: string;
  cooldownCategory?: string;
  explicitPriority?: NotificationDecisionPriority;
  bypassPreferences?: boolean;
  bypassQuietHours?: boolean;
}

/**
 * Centralized deterministic, explainable, rule-based Smart Notification Decision Engine
 * Evaluates priority, user preferences, frequency limits, quiet hours, and timing optimization.
 */
export async function evaluateNotificationDecision(
  params: EvaluateDecisionParams
): Promise<NotificationDecisionResult> {
  const {
    userId,
    type,
    userPrefs,
    explicitScheduledDate,
    isExplicitlyScheduled,
    timezone,
    isTest,
    globalEnabled,
    globalPauseReason,
    explicitPriority,
    bypassPreferences,
    bypassQuietHours,
  } = params;

  const defaultPriority = explicitPriority || getCategoryDefaultPriority(type);
  const resolvedTimezone = timezone || userPrefs?.timezone || getDetectedTimezone();
  const now = new Date();
  const signalsUsed: string[] = [];

  // =========================================================================
  // 1. ADMIN TEST PUSH BYPASS
  // =========================================================================
  if (isTest) {
    return {
      decision: 'ALLOW',
      reason: 'TEST_PUSH_BYPASS',
      reasonExplanation: 'Administrator test push intentionally bypasses all smart limits and filters.',
      priority: 'URGENT',
      source: 'admin_test',
      signalsUsed: ['admin_test_push: true'],
    };
  }

  // =========================================================================
  // 2. GLOBAL EMERGENCY STOP CHECK
  // =========================================================================
  if (globalEnabled === false) {
    return {
      decision: 'SUPPRESS',
      reason: 'EMERGENCY_STOP',
      reasonExplanation: `Notification paused by global administrator emergency control (${
        globalPauseReason || 'All notifications paused'
      }).`,
      priority: 'LOW',
      source: 'emergency_stop',
      signalsUsed: ['adminMeta/notifications.globalEnabled: false'],
    };
  }

  // =========================================================================
  // 3. USER PREFERENCES (GLOBAL & CATEGORY)
  // =========================================================================
  if (!bypassPreferences && userPrefs) {
    if (userPrefs.enabled === false) {
      return {
        decision: 'SUPPRESS',
        reason: 'USER_DISABLED',
        reasonExplanation: 'Notifications are turned off in your account notification settings.',
        priority: defaultPriority,
        source: 'user_prefs',
        signalsUsed: ['userPreferences.enabled: false'],
      };
    }

    let isCategoryEnabled = true;
    switch (type) {
      case 'LETTER_AVAILABLE':
        isCategoryEnabled = userPrefs.letters !== false;
        break;
      case 'OPEN_WHEN_AVAILABLE':
        isCategoryEnabled = userPrefs.openWhen !== false;
        break;
      case 'SECRET_UNLOCKED':
        isCategoryEnabled = userPrefs.secrets !== false;
        break;
      case 'MOMENT_AVAILABLE':
        isCategoryEnabled = userPrefs.moments !== false;
        break;
      case 'BIRTHDAY':
        isCategoryEnabled = userPrefs.birthday !== false;
        break;
      case 'GENERAL':
      default:
        isCategoryEnabled = true;
        break;
    }

    if (!isCategoryEnabled) {
      const catLabel = CATEGORY_LABELS[type] || type;
      return {
        decision: 'SUPPRESS',
        reason: 'CATEGORY_DISABLED',
        reasonExplanation: `The '${catLabel}' notification category is disabled in your account preferences.`,
        priority: defaultPriority,
        source: 'user_prefs',
        signalsUsed: [`userPreferences.${type}: false`],
      };
    }
  }

  try {
    // Load centralized intelligence config & user engagement signals
    const config = await getIntelligenceConfig();
    const signals = await getUserEngagementSignals(userId, resolvedTimezone);

    signalsUsed.push(
      `priority: ${defaultPriority}`,
      `history_count: ${signals.totalEvents}`,
      `sent_past_24h: ${signals.sentPast24h}`,
      `sent_past_1h: ${signals.sentPastHour}`
    );

    // =========================================================================
    // 4. INTELLIGENCE ENGINE DISABLED (Fallback to Phase 2-4 standard quiet hours)
    // =========================================================================
    if (!config.enabled) {
      if (userPrefs?.quietHoursEnabled && !bypassQuietHours) {
        const targetDate = explicitScheduledDate || now;
        const adjustedDate = adjustForQuietHours(targetDate, resolvedTimezone, {
          enabled: userPrefs.quietHoursEnabled,
          start: userPrefs.quietHoursStart,
          end: userPrefs.quietHoursEnd,
        });

        if (adjustedDate.getTime() > targetDate.getTime()) {
          return {
            decision: 'DELAY',
            reason: 'QUIET_HOURS',
            reasonExplanation: 'Delivery scheduled after your quiet hours end.',
            priority: defaultPriority,
            recommendedDeliveryAt: adjustedDate.toISOString(),
            source: 'fallback_rule',
            signalsUsed: ['intelligence_config.enabled: false', 'quiet_hours: active'],
          };
        }
      }

      return {
        decision: 'ALLOW',
        reason: isExplicitlyScheduled ? 'ALLOWED_SCHEDULED' : 'ALLOWED_IMMEDIATE',
        reasonExplanation: isExplicitlyScheduled
          ? 'Scheduled for specified delivery date.'
          : 'Eligible for immediate delivery.',
        priority: defaultPriority,
        source: 'fallback_rule',
        signalsUsed: ['intelligence_config.enabled: false'],
      };
    }

    // =========================================================================
    // 5. FREQUENCY & ADAPTIVE COOLDOWN LIMITS
    // =========================================================================
    const catStats = signals.categoryStats[type] || {
      sentCount: 0,
      clickedCount: 0,
      targetOpenedCount: 0,
      ctr: 0,
      openRate: 0,
      sentPast24h: 0,
      lastSentTimestamp: null,
    };

    const categoryLimit = config.categoryDailyLimits[type] ?? 3;

    // Compute next morning safe time (tomorrow past quiet hours, e.g. 08:00)
    const computeNextMorning = (): Date => {
      const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return adjustForQuietHours(nextDay, resolvedTimezone, {
        enabled: true,
        start: userPrefs?.quietHoursStart || '22:00',
        end: userPrefs?.quietHoursEnd || '07:00',
      });
    };

    // A. Check Category Daily Limit
    if (catStats.sentPast24h >= categoryLimit && type !== 'BIRTHDAY') {
      signalsUsed.push(`category_limit_reached: ${catStats.sentPast24h}/${categoryLimit}`);
      if (defaultPriority === 'HIGH' || defaultPriority === 'URGENT') {
        // FAIL-OPEN PRESERVATION: Delay to tomorrow morning so letters are never lost
        const nextMorning = computeNextMorning();
        return {
          decision: 'DELAY',
          reason: 'CATEGORY_DAILY_LIMIT',
          reasonExplanation: `Daily limit reached for ${CATEGORY_LABELS[type] || type}. Scheduled for tomorrow morning to preserve delivery.`,
          priority: defaultPriority,
          recommendedDeliveryAt: nextMorning.toISOString(),
          source: 'smart_engine',
          signalsUsed,
          metrics: { categorySentPast24h: catStats.sentPast24h, sentPast24h: signals.sentPast24h },
        };
      } else {
        return {
          decision: 'SUPPRESS',
          reason: 'CATEGORY_DAILY_LIMIT',
          reasonExplanation: `Paused because the daily limit of ${categoryLimit} notifications for ${CATEGORY_LABELS[type] || type} was reached.`,
          priority: defaultPriority,
          source: 'smart_engine',
          signalsUsed,
          metrics: { categorySentPast24h: catStats.sentPast24h, sentPast24h: signals.sentPast24h },
        };
      }
    }

    // B. Check Global Daily Limit
    if (signals.sentPast24h >= config.maxPerDay) {
      signalsUsed.push(`global_daily_limit_reached: ${signals.sentPast24h}/${config.maxPerDay}`);
      if (defaultPriority === 'HIGH' || defaultPriority === 'URGENT') {
        // FAIL-OPEN PRESERVATION: Delay to tomorrow morning
        const nextMorning = computeNextMorning();
        return {
          decision: 'DELAY',
          reason: 'DAILY_LIMIT',
          reasonExplanation: `Daily limit reached. Scheduled for tomorrow morning so your letter arrives safely.`,
          priority: defaultPriority,
          recommendedDeliveryAt: nextMorning.toISOString(),
          source: 'smart_engine',
          signalsUsed,
          metrics: { sentPast24h: signals.sentPast24h },
        };
      } else {
        return {
          decision: 'SUPPRESS',
          reason: 'DAILY_LIMIT',
          reasonExplanation: `Paused because your daily limit of ${config.maxPerDay} notifications was reached.`,
          priority: defaultPriority,
          source: 'smart_engine',
          signalsUsed,
          metrics: { sentPast24h: signals.sentPast24h },
        };
      }
    }

    // C. Check Hourly Limit
    if (signals.sentPastHour >= config.maxPerHour && defaultPriority !== 'URGENT') {
      signalsUsed.push(`hourly_limit_reached: ${signals.sentPastHour}/${config.maxPerHour}`);
      const delayTime = new Date(now.getTime() + (config.minimumSpacingMinutes || 15) * 60 * 1000);
      return {
        decision: 'DELAY',
        reason: 'HOURLY_LIMIT',
        reasonExplanation: `Briefly spaced out to prevent notification bursts (hourly limit reached).`,
        priority: defaultPriority,
        recommendedDeliveryAt: delayTime.toISOString(),
        source: 'smart_engine',
        signalsUsed,
        metrics: { sentPastHour: signals.sentPastHour },
      };
    }

    // D. Check Minimum Spacing / Adaptive Cooldown
    if (
      config.adaptiveCooldowns &&
      config.minimumSpacingMinutes > 0 &&
      signals.lastSentTimestamp &&
      defaultPriority !== 'URGENT'
    ) {
      const timeSinceLastSent = now.getTime() - signals.lastSentTimestamp;
      const spacingMs = config.minimumSpacingMinutes * 60 * 1000;
      if (timeSinceLastSent < spacingMs) {
        const remainingMinutes = Math.ceil((spacingMs - timeSinceLastSent) / 60000);
        const delayTarget = new Date(signals.lastSentTimestamp + spacingMs + 60 * 1000);
        signalsUsed.push(`minimum_spacing_active: ${remainingMinutes}m remaining`);
        return {
          decision: 'DELAY',
          reason: 'COOLDOWN',
          reasonExplanation: `Briefly delayed by ${remainingMinutes}m to avoid sudden notification grouping.`,
          priority: defaultPriority,
          recommendedDeliveryAt: delayTarget.toISOString(),
          source: 'smart_engine',
          signalsUsed,
          metrics: { timeSinceLastSentMinutes: Math.round(timeSinceLastSent / 60000) },
        };
      }
    }

    // =========================================================================
    // 6. QUIET HOURS OPTIMIZATION
    // =========================================================================
    const targetDate = explicitScheduledDate || now;
    if (userPrefs?.quietHoursEnabled && !bypassQuietHours) {
      const adjustedDate = adjustForQuietHours(targetDate, resolvedTimezone, {
        enabled: userPrefs.quietHoursEnabled,
        start: userPrefs.quietHoursStart,
        end: userPrefs.quietHoursEnd,
      });

      if (adjustedDate.getTime() > targetDate.getTime()) {
        signalsUsed.push(`quiet_hours_active: adjusted to ${adjustedDate.toISOString()}`);
        return {
          decision: 'DELAY',
          reason: 'QUIET_HOURS',
          reasonExplanation: 'Quiet hours are active. Delivery scheduled after your quiet hours end.',
          priority: defaultPriority,
          recommendedDeliveryAt: adjustedDate.toISOString(),
          source: 'smart_engine',
          signalsUsed,
          metrics: { isQuietHours: true },
        };
      }
    }

    // =========================================================================
    // 7. PREFERRED TIMING OPTIMIZATION
    // =========================================================================
    if (
      config.preferredTimingOptimization &&
      !isExplicitlyScheduled &&
      defaultPriority === 'LOW' &&
      signals.hasSufficientData &&
      signals.preferredTimeWindow === 'evening'
    ) {
      try {
        const timeStr = now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          timeZone: resolvedTimezone,
        });
        const currentLocalHour = parseInt(timeStr, 10);
        // If it is morning/afternoon (< 17:00), gently delay to 18:00 local time
        if (currentLocalHour < 17) {
          const hoursToAdd = 18 - currentLocalHour;
          const eveningDate = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
          signalsUsed.push(`preferred_window: evening (local hour ${currentLocalHour} -> 18:00)`);
          return {
            decision: 'DELAY',
            reason: 'ALLOWED_PREFERRED_WINDOW',
            reasonExplanation: 'Optimized for your preferred evening reading time.',
            priority: defaultPriority,
            recommendedDeliveryAt: eveningDate.toISOString(),
            source: 'smart_engine',
            signalsUsed,
            metrics: { preferredWindow: 'evening' },
          };
        }
      } catch {
        // Fall through to immediate if timezone math fails
      }
    }

    // =========================================================================
    // 8. UNCONSTRAINED ALLOWED DELIVERY
    // =========================================================================
    if (isExplicitlyScheduled && explicitScheduledDate && explicitScheduledDate.getTime() > now.getTime()) {
      return {
        decision: 'ALLOW',
        reason: 'ALLOWED_SCHEDULED',
        reasonExplanation: 'Scheduled for requested delivery time.',
        priority: defaultPriority,
        recommendedDeliveryAt: explicitScheduledDate.toISOString(),
        source: 'smart_engine',
        signalsUsed,
      };
    }

    return {
      decision: 'ALLOW',
      reason: 'ALLOWED_IMMEDIATE',
      reasonExplanation: 'Eligible for immediate delivery within frequency and timing limits.',
      priority: defaultPriority,
      source: 'smart_engine',
      signalsUsed,
    };
  } catch (err: any) {
    // Fail-open fallback: never lose an important letter due to a calculation error
    console.warn('[NotificationIntelligence] Non-blocking rule engine fallback:', err);
    return {
      decision: 'ALLOW',
      reason: 'FALLBACK_ALLOWED',
      reasonExplanation: 'Delivered using safe system fallback rules.',
      priority: defaultPriority,
      source: 'fallback_rule',
      signalsUsed: ['engine_fallback: true'],
    };
  }
}
