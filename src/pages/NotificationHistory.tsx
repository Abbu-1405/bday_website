import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  Mail,
  FolderLock,
  Image,
  Gift,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  Filter,
  Calendar,
  Layers,
  ArrowLeft,
  LogIn,
  Settings as SettingsIcon,
  MousePointerClick,
} from 'lucide-react';
import { Container, Surface, Button, Badge } from '../components';
import { useAuth } from '../hooks';
import { ROUTES } from '../constants';
import { NotificationEvent, NotificationEventType } from '../types';
import { subscribeUserNotifications, recordNotificationClick } from '../services';

type StatusFilter = 'ALL' | 'DELIVERED' | 'SCHEDULED' | 'PENDING' | 'FAILED';
type CategoryFilter = 'ALL' | NotificationEventType;

const PAGE_SIZE = 10;

export default function NotificationHistory() {
  const { currentUser, loading: authLoading, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [allEvents, setAllEvents] = useState<NotificationEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Subscribe to the authenticated user's notification events in real time
  useEffect(() => {
    if (!currentUser?.uid) {
      setAllEvents([]);
      setLoadingEvents(false);
      return;
    }

    setLoadingEvents(true);
    // Fetch up to 100 recent events for the user
    const unsubscribe = subscribeUserNotifications(
      currentUser.uid,
      (events) => {
        setAllEvents(events);
        setLoadingEvents(false);
      },
      100
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  // Filter events client-side based on the authoritative user events fetched from Firestore
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      // Status filter
      if (statusFilter === 'DELIVERED' && event.status !== 'sent') return false;
      if (statusFilter === 'SCHEDULED' && event.status !== 'scheduled') return false;
      if (statusFilter === 'PENDING' && event.status !== 'pending' && event.status !== 'processing') return false;
      if (statusFilter === 'FAILED' && event.status !== 'failed') return false;

      // Category filter
      if (categoryFilter !== 'ALL' && event.type !== categoryFilter) return false;

      return true;
    });
  }, [allEvents, statusFilter, categoryFilter]);

  const paginatedEvents = useMemo(() => {
    return filteredEvents.slice(0, visibleCount);
  }, [filteredEvents, visibleCount]);

  const hasMore = visibleCount < filteredEvents.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  // Safe navigation handler when an event target is clicked
  const handleEventClick = (event: NotificationEvent) => {
    if (event.id) {
      // Non-blocking interaction tracking
      recordNotificationClick(event.id, 'history_click').catch(() => {});
    }
    const rawUrl = event.data?.url;
    if (typeof rawUrl === 'string' && rawUrl.startsWith('/') && !rawUrl.startsWith('//')) {
      const separator = rawUrl.includes('?') ? '&' : '?';
      const targetUrl = event.id ? `${rawUrl}${separator}nid=${encodeURIComponent(event.id)}&src=history` : rawUrl;
      navigate(targetUrl);
    }
  };

  // Category Icon & Label mapping
  const getCategoryMeta = (type: NotificationEventType | string) => {
    switch (type) {
      case 'LETTER_AVAILABLE':
        return {
          icon: <Mail className="h-4 w-4" />,
          label: 'Letter',
          badgeVariant: 'primary' as const,
        };
      case 'OPEN_WHEN_AVAILABLE':
        return {
          icon: <Mail className="h-4 w-4" />,
          label: 'Open When',
          badgeVariant: 'neutral' as const,
        };
      case 'SECRET_UNLOCKED':
        return {
          icon: <FolderLock className="h-4 w-4" />,
          label: 'Secret Vault',
          badgeVariant: 'secondary' as const,
        };
      case 'MOMENT_AVAILABLE':
        return {
          icon: <Image className="h-4 w-4" />,
          label: 'Moment',
          badgeVariant: 'neutral' as const,
        };
      case 'BIRTHDAY':
        return {
          icon: <Gift className="h-4 w-4" />,
          label: 'Birthday',
          badgeVariant: 'primary' as const,
        };
      case 'GENERAL':
      default:
        return {
          icon: <Sparkles className="h-4 w-4" />,
          label: 'General',
          badgeVariant: 'neutral' as const,
        };
    }
  };

  // Status mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="success" size="sm" className="font-mono text-[10px] flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Delivered</span>
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="primary" size="sm" className="font-mono text-[10px] flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Scheduled</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="neutral" size="sm" className="font-mono text-[10px] flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="neutral" size="sm" className="font-mono text-[10px] flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processing</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="error" size="sm" className="font-mono text-[10px] flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm" className="font-mono text-[10px] capitalize">
            {status}
          </Badge>
        );
    }
  };

  const statusFilterCounts = useMemo(() => {
    return {
      ALL: allEvents.length,
      DELIVERED: allEvents.filter((e) => e.status === 'sent').length,
      SCHEDULED: allEvents.filter((e) => e.status === 'scheduled').length,
      PENDING: allEvents.filter((e) => e.status === 'pending' || e.status === 'processing').length,
      FAILED: allEvents.filter((e) => e.status === 'failed').length,
    };
  }, [allEvents]);

  // Unauthenticated State
  if (!authLoading && !currentUser) {
    return (
      <Container maxWidth="md" className="py-10 sm:py-16 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)] mx-auto shadow-sm">
            <Bell className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text)]">
              Notification History
            </h1>
            <p className="text-xs sm:text-sm font-serif text-[var(--color-text-secondary)] leading-relaxed">
              Sign in to view your personal history of starlit messages, scheduled milestones, and unlocked secrets.
            </p>
          </div>
          <div className="pt-3">
            <Button
              variant="primary"
              size="md"
              onClick={loginWithGoogle}
              leftIcon={<LogIn className="h-4 w-4" />}
              className="font-serif min-h-[44px]"
            >
              Sign In with Google
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="py-6 sm:py-10 lg:py-14 space-y-6 sm:space-y-8">
      {/* Header & Breadcrumb */}
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Link
            to={ROUTES.SETTINGS}
            className="inline-flex items-center gap-1.5 text-xs font-serif text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Settings</span>
          </Link>

          <Link
            to={ROUTES.SETTINGS}
            className="inline-flex items-center gap-1.5 text-xs font-serif text-[var(--color-primary)] hover:underline"
          >
            <SettingsIcon className="h-3.5 w-3.5" />
            <span>Notification Preferences</span>
          </Link>
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium bg-[var(--color-surface-secondary)] text-[var(--color-primary)] border border-[var(--color-border-light)] shadow-2xs">
            <Bell className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
            <span>Message Log & Scheduled Events</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[var(--color-text)] tracking-tight">
            Notification History
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-serif max-w-2xl leading-relaxed">
            Your personal record of celestial announcements, letters, envelopes, and upcoming scheduled unlock times.
          </p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="space-y-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['ALL', 'DELIVERED', 'SCHEDULED', 'PENDING', 'FAILED'] as StatusFilter[]).map((st) => {
            const count = statusFilterCounts[st];
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-serif font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)] shadow-xs font-semibold'
                    : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-light)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                }`}
              >
                <span>{st === 'ALL' ? 'All Messages' : st.charAt(0) + st.slice(1).toLowerCase()}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-black/20 text-[var(--color-primary-foreground)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs font-serif text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1 text-[11px] text-[var(--color-muted)] font-medium pl-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'LETTER_AVAILABLE', label: 'Letters' },
            { id: 'OPEN_WHEN_AVAILABLE', label: 'Open When' },
            { id: 'SECRET_UNLOCKED', label: 'Secrets' },
            { id: 'MOMENT_AVAILABLE', label: 'Moments' },
            { id: 'BIRTHDAY', label: 'Birthday' },
            { id: 'GENERAL', label: 'General' },
          ].map((cat) => {
            const isActive = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat.id as CategoryFilter);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-xs ${
                  isActive
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/40'
                    : 'hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loadingEvents ? (
        <div className="p-12 text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)] mx-auto" />
          <p className="text-xs font-serif text-[var(--color-text-secondary)]">
            Loading your notification history...
          </p>
        </div>
      ) : paginatedEvents.length === 0 ? (
        /* Empty State */
        <Surface
          variant="elevated"
          padding="lg"
          className="p-8 sm:p-12 text-center rounded-3xl border border-[var(--color-border-light)] space-y-4 max-w-xl mx-auto shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)] mx-auto shadow-2xs">
            <Sparkles className="h-7 w-7 animate-pulse text-[var(--color-primary)]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[var(--color-text)]">
              No little messages yet ✨
            </h2>
            <p className="text-xs sm:text-sm font-serif text-[var(--color-text-secondary)] leading-relaxed max-w-sm mx-auto">
              {allEvents.length === 0
                ? 'When Starlit Letters sends you celestial reminders, unlocks, or scheduled memories, they will all be beautifully cataloged here.'
                : 'No notifications match your current filter selection.'}
            </p>
          </div>
          {allEvents.length > 0 && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                }}
                className="font-serif text-xs"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </Surface>
      ) : (
        /* Notification List */
        <div className="space-y-3">
          {paginatedEvents.map((evt) => {
            const catMeta = getCategoryMeta(evt.type);
            const hasDestination = Boolean(evt.data?.url && typeof evt.data.url === 'string' && evt.data.url.startsWith('/'));

            // Parse creation date
            let createdFormatted = evt.createdAt || 'Recently';
            if (typeof evt.createdAt === 'object' && evt.createdAt?.toDate) {
              createdFormatted = evt.createdAt.toDate().toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
            }

            // Parse scheduled date if applicable
            let scheduledFormatted: string | null = null;
            if (evt.scheduledAt) {
              const schedDate = new Date(evt.scheduledAt);
              if (!isNaN(schedDate.getTime())) {
                scheduledFormatted = schedDate.toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }
            }

            // Parse delivered date if applicable
            let sentFormatted: string | null = null;
            if (evt.sentAt) {
              const sentDate = typeof evt.sentAt === 'string' ? new Date(evt.sentAt) : evt.sentAt?.toDate ? evt.sentAt.toDate() : null;
              if (sentDate && !isNaN(sentDate.getTime())) {
                sentFormatted = sentDate.toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }
            }

            // Parse clicked date if applicable
            let clickedFormatted: string | null = null;
            if (evt.clickedAt) {
              const clickDate = typeof evt.clickedAt === 'string' ? new Date(evt.clickedAt) : evt.clickedAt?.toDate ? evt.clickedAt.toDate() : null;
              if (clickDate && !isNaN(clickDate.getTime())) {
                clickedFormatted = clickDate.toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }
            }

            return (
              <Surface
                key={evt.id}
                variant="elevated"
                padding="md"
                onClick={hasDestination ? () => handleEventClick(evt) : undefined}
                className={`rounded-2xl border border-[var(--color-border-light)] p-4 sm:p-5 transition-all space-y-3 ${
                  hasDestination
                    ? 'cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-secondary)]/70 hover:shadow-sm'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left Side: Icon & Title & Body */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)] shrink-0 mt-0.5 shadow-2xs">
                      {catMeta.icon}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--color-text)] truncate">
                          {evt.title}
                        </h3>
                        <Badge variant={catMeta.badgeVariant} size="sm" className="font-serif text-[10px] py-0 px-2">
                          {catMeta.label}
                        </Badge>
                      </div>

                      <p className="text-xs sm:text-sm font-serif text-[var(--color-text-secondary)] leading-relaxed">
                        {evt.body}
                      </p>

                      {/* Timestamps Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] font-mono text-[var(--color-muted)]">
                        <span>Created: {createdFormatted}</span>

                        {scheduledFormatted && evt.status === 'scheduled' && (
                          <span className="text-[var(--color-primary)] flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Scheduled for: {scheduledFormatted}
                          </span>
                        )}

                        {sentFormatted && evt.status === 'sent' && (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Delivered: {sentFormatted}
                          </span>
                        )}

                        {clickedFormatted && (
                          <span className="text-[var(--color-primary)] flex items-center gap-1">
                            <MousePointerClick className="h-3 w-3" /> Clicked: {clickedFormatted}
                            {evt.openedCount && evt.openedCount > 1 ? ` (${evt.openedCount}x)` : ''}
                          </span>
                        )}

                        {evt.targetOpenedAt && (
                          <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1 font-medium">
                            <Sparkles className="h-3 w-3" /> Opened Target Content
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Status Badge & Destination Arrow */}
                  <div className="flex items-center gap-2 shrink-0 self-start">
                    {getStatusBadge(evt.status)}

                    {hasDestination && (
                      <div className="p-1 rounded-full text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors hidden sm:block">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional destination footer button for mobile clarity */}
                {hasDestination && (
                  <div className="pt-2 border-t border-[var(--color-border-light)]/60 flex items-center justify-between text-xs font-serif text-[var(--color-primary)]">
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Open in Starlit Letters
                    </span>
                    <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                      {evt.data?.url}
                    </span>
                  </div>
                )}
              </Surface>
            );
          })}

          {/* Load More Pagination */}
          {hasMore && (
            <div className="pt-4 text-center">
              <Button
                variant="outline"
                size="md"
                onClick={handleLoadMore}
                className="font-serif text-xs min-h-[40px] px-6"
              >
                Load More Notifications ({filteredEvents.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
