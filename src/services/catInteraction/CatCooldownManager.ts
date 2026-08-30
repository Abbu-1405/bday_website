import {
  ReactionCooldownConfig,
  StarlitEventPriority,
} from '../../types/catMeme';

export const DEFAULT_COOLDOWN_CONFIG: ReactionCooldownConfig = {
  lowPriorityCooldownMs: 16000,     // 16 seconds between low priority reactions
  mediumPriorityCooldownMs: 8000,   // 8 seconds between medium priority reactions
  highPriorityCooldownMs: 2500,     // 2.5 seconds minimum for high priority
  errorPriorityCooldownMs: 3500,    // 3.5 seconds for error reactions
  maxReactionsPerMinuteDesktop: 4,  // Maximum 4 reactions per minute
  maxReactionsPerMinuteMobile: 2,   // Maximum 2 reactions per minute on mobile
  windowMs: 60000,                  // 1 minute sliding window
  probability: {
    LOW: 0.25,     // 25% chance for low-priority (page open, navigation)
    MEDIUM: 0.70,  // 70% chance for medium-priority (saved draft, wish created)
    HIGH: 1.0,     // 100% chance for high-priority (letter sent, secret unlocked)
    ERROR: 0.80,   // 80% chance for errors (supplemental feedback)
  },
};

export class CatCooldownManagerClass {
  private config: ReactionCooldownConfig;
  private lastTriggerTimeByPriority: Map<StarlitEventPriority, number> = new Map();
  private globalLastTriggerTime = 0;
  private triggerTimestamps: number[] = [];

  constructor(config: Partial<ReactionCooldownConfig> = {}) {
    this.config = {
      ...DEFAULT_COOLDOWN_CONFIG,
      ...config,
      probability: {
        ...DEFAULT_COOLDOWN_CONFIG.probability,
        ...(config.probability || {}),
      },
    };
  }

  /**
   * Evaluates whether an event with given priority is allowed to trigger a reaction.
   */
  public canTrigger(
    priority: StarlitEventPriority,
    isMobile = false,
    bypassProbability = false
  ): boolean {
    const now = Date.now();

    // 1. Clean sliding window
    this.cleanSlidingWindow(now);

    // 2. Check sliding window rate limit
    const maxPerMinute = isMobile
      ? this.config.maxReactionsPerMinuteMobile
      : this.config.maxReactionsPerMinuteDesktop;

    if (this.triggerTimestamps.length >= maxPerMinute) {
      // HIGH priority may still proceed if at least 5 seconds have passed since absolute last trigger
      if (priority === 'HIGH' && now - this.globalLastTriggerTime >= 5000) {
        // Allowed bypass
      } else {
        return false;
      }
    }

    // 3. Check priority-specific cooldown
    const cooldownMs = this.getCooldownForPriority(priority);
    const lastPriorityTime = this.lastTriggerTimeByPriority.get(priority) || 0;

    if (now - lastPriorityTime < cooldownMs) {
      return false;
    }

    // 4. Check global minimum spacing (1.5s to prevent visual overlapping animations)
    if (now - this.globalLastTriggerTime < 1500) {
      return false;
    }

    // 5. Probability Roll (unless bypassed explicitly)
    if (!bypassProbability) {
      const probability = this.config.probability[priority] ?? 0.5;
      if (Math.random() > probability) {
        return false;
      }
    }

    return true;
  }

  /**
   * Record a successful reaction trigger.
   */
  public recordTrigger(priority: StarlitEventPriority): void {
    const now = Date.now();
    this.globalLastTriggerTime = now;
    this.lastTriggerTimeByPriority.set(priority, now);
    this.triggerTimestamps.push(now);
    this.cleanSlidingWindow(now);
  }

  /**
   * Reset cooldown state on theme deactivation or test teardown.
   */
  public reset(): void {
    this.lastTriggerTimeByPriority.clear();
    this.globalLastTriggerTime = 0;
    this.triggerTimestamps = [];
  }

  private cleanSlidingWindow(now: number): void {
    const cutoff = now - this.config.windowMs;
    this.triggerTimestamps = this.triggerTimestamps.filter((t) => t > cutoff);
  }

  private getCooldownForPriority(priority: StarlitEventPriority): number {
    switch (priority) {
      case 'HIGH':
        return this.config.highPriorityCooldownMs;
      case 'ERROR':
        return this.config.errorPriorityCooldownMs;
      case 'MEDIUM':
        return this.config.mediumPriorityCooldownMs;
      case 'LOW':
      default:
        return this.config.lowPriorityCooldownMs;
    }
  }
}

export const CatCooldownManager = new CatCooldownManagerClass();
