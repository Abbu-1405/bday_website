import React from 'react';
import { BookOpen, Camera, Heart, Mail, Clock, Compass, Sparkles, Lock, Feather, CheckCircle2 } from 'lucide-react';
import { Surface } from './Surface';
import { cn } from '../utils';
import { getDiscoveryTimeline } from '../services/discoveryService';

export interface ActivityItem {
  id: string;
  sectionName: string;
  title: string;
  timestamp: string;
  icon?: React.ReactNode;
  path?: string;
}

export interface RecentActivityProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: ActivityItem[];
  onItemClick?: (item: ActivityItem) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Compass: <Compass className="h-4 w-4 text-[var(--color-primary)] shrink-0" />,
  Calendar: <BookOpen className="h-4 w-4 text-[var(--color-primary)] shrink-0" />,
  Heart: <Heart className="h-4 w-4 text-[var(--color-accent)] shrink-0" />,
  Camera: <Camera className="h-4 w-4 text-[var(--color-secondary)] shrink-0" />,
  Sparkles: <Sparkles className="h-4 w-4 text-[var(--color-accent)] shrink-0" />,
  Mail: <Mail className="h-4 w-4 text-[var(--color-warning)] shrink-0" />,
  Feather: <Feather className="h-4 w-4 text-[var(--color-primary)] shrink-0" />,
  Lock: <Lock className="h-4 w-4 text-[var(--color-warning)] shrink-0" />,
  CheckCircle2: <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] shrink-0" />,
};

const initialPlaceholderActivities: ActivityItem[] = [
  {
    id: 'start',
    sectionName: 'Journey',
    title: 'The Journey Begins',
    timestamp: 'First Step',
    icon: <Compass className="h-4 w-4 text-[var(--color-primary)] shrink-0" />,
  },
  {
    id: 'notes',
    sectionName: '365 Notes',
    title: '365 Reflections awaiting discovery',
    timestamp: 'Daily',
    icon: <BookOpen className="h-4 w-4 text-[var(--color-secondary)] shrink-0" />,
  },
  {
    id: 'wishes',
    sectionName: 'Wishes',
    title: '20 Wish Lanterns floating',
    timestamp: 'Awaiting',
    icon: <Sparkles className="h-4 w-4 text-[var(--color-accent)] shrink-0" />,
  },
  {
    id: 'vault',
    sectionName: 'Secret Vault',
    title: '7 Quiet Secrets tucked away',
    timestamp: 'Hidden',
    icon: <Lock className="h-4 w-4 text-[var(--color-warning)] shrink-0" />,
  },
];

export const RecentActivity: React.FC<RecentActivityProps> = ({
  className,
  items,
  onItemClick,
  ...props
}) => {
  const timelineEvents = getDiscoveryTimeline();

  let displayItems: ActivityItem[] = [];

  if (items && items.length > 0) {
    displayItems = items;
  } else if (timelineEvents.length > 0) {
    displayItems = timelineEvents.map((evt) => ({
      id: evt.id,
      sectionName: evt.type === 'start' ? 'Journey' : 'Discovery',
      title: `${evt.title} — ${evt.description}`,
      timestamp: evt.dateDisplay || 'Recently',
      icon: ICON_MAP[evt.iconName] || <Sparkles className="h-4 w-4 text-[var(--color-primary)] shrink-0" />,
    }));
  }

  if (displayItems.length === 0) {
    displayItems = initialPlaceholderActivities;
  }

  return (
    <section className={cn('space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className="text-h3 font-serif text-[var(--color-text)] flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
          Recent Activity
        </h2>
        <span className="text-xs text-[var(--color-muted)] font-serif">Activity Log</span>
      </div>

      <Surface variant="elevated" padding="lg" className="border border-[var(--color-border)]">
        <div className="divide-y divide-[var(--color-border-light)]">
          {displayItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className={cn(
                'py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4',
                onItemClick &&
                  'cursor-pointer hover:bg-[var(--color-surface-secondary)]/50 -mx-2 px-2 rounded-lg transition-colors'
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-light)] shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] font-serif">
                    {item.sectionName}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-[var(--color-text)] truncate font-serif">
                    {item.title}
                  </p>
                </div>
              </div>

              <span className="text-xs text-[var(--color-muted)] shrink-0 font-serif">
                {item.timestamp}
              </span>
            </div>
          ))}
        </div>
      </Surface>
    </section>
  );
};

