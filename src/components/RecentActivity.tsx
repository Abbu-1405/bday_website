import React from 'react';
import { BookOpen, Camera, Heart, Mail, Clock, Compass, Sparkles, Lock, Feather, CheckCircle2 } from 'lucide-react';
import { Surface } from './Surface';
import { cn } from '../utils';
import { getDiscoveryTimeline } from '../services/discoveryService';
import { useTheme } from '../hooks';

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
  const { theme } = useTheme();
  const isWhimsical = theme === 'whimsical-scrapbook';
  const isMidnight = theme === 'midnight-journal';
  const isLetterArchive = theme === 'letter-archive';

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
        <div>
          {isWhimsical && (
            <span className="whimsical-subtitle text-xs text-[var(--color-accent-rose)] block -mb-0.5 select-none">
              traces of time
            </span>
          )}
          {isMidnight && (
            <span className="midnight-subtitle text-xs text-[#E2BD78] block -mb-0.5 select-none">
              celestial record
            </span>
          )}
          {isLetterArchive && (
            <span className="letter-script text-sm text-[#7A2E3B] block -mb-0.5 select-none">
              chronicle of discovery
            </span>
          )}
          <h2 className={cn(
            "font-serif font-semibold tracking-tight text-h3 flex items-center gap-2",
            isLetterArchive ? "text-[#3B2A20]" : isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
          )}>
            <Clock className={cn(
              "h-4 w-4 shrink-0",
              isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-primary)]"
            )} />
            Recent Activity
          </h2>
        </div>
        <span className={cn(
          "text-xs font-serif",
          isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-muted)]"
        )}>
          Activity Log
        </span>
      </div>

      <Surface
        variant="elevated"
        padding="lg"
        className={cn(
          "transition-all",
          isLetterArchive && "bg-[#FAF5EC] border border-[rgba(138,110,89,0.3)] shadow-[0_4px_20px_rgba(60,42,33,0.06)]",
          isMidnight && "bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.25)] shadow-md",
          isWhimsical && "bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.2)] shadow-sm",
          !isLetterArchive && !isMidnight && !isWhimsical && "border border-[var(--color-border)]"
        )}
      >
        <div className={cn(
          "divide-y",
          isLetterArchive ? "divide-[rgba(138,110,89,0.18)]" : isMidnight ? "divide-[rgba(201,155,88,0.15)]" : "divide-[var(--color-border-light)]"
        )}>
          {displayItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className={cn(
                'py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 transition-colors',
                onItemClick &&
                  (isLetterArchive
                    ? 'cursor-pointer hover:bg-[#F2E8DC]/70 -mx-2 px-2 rounded-lg'
                    : isMidnight
                    ? 'cursor-pointer hover:bg-[rgba(201,155,88,0.1)] -mx-2 px-2 rounded-lg'
                    : isWhimsical
                    ? 'cursor-pointer hover:bg-[rgba(216,184,106,0.1)] -mx-2 px-2 rounded-lg'
                    : 'cursor-pointer hover:bg-[var(--color-surface-secondary)]/50 -mx-2 px-2 rounded-lg')
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={cn(
                  "p-2 rounded-full border shrink-0 transition-colors",
                  isLetterArchive && "bg-[#F2E8DC] border-[rgba(138,110,89,0.3)] text-[#7A2E3B]",
                  isMidnight && "bg-[rgba(16,27,45,0.9)] border-[rgba(201,155,88,0.25)] text-[#E2BD78]",
                  isWhimsical && "bg-[rgba(20,38,25,0.9)] border-[rgba(216,184,106,0.2)] text-[#D8B86A]",
                  !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface)] border-[var(--color-border-light)]"
                )}>
                  {item.icon}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className={cn(
                    "text-[11px] font-semibold uppercase tracking-wider font-serif",
                    isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-muted)]"
                  )}>
                    {item.sectionName}
                  </p>
                  <p className={cn(
                    "text-xs sm:text-sm font-medium truncate font-serif",
                    isLetterArchive ? "text-[#3B2A20]" : isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
                  )}>
                    {item.title}
                  </p>
                </div>
              </div>

              <span className={cn(
                "text-xs shrink-0 font-serif",
                isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-muted)]"
              )}>
                {item.timestamp}
              </span>
            </div>
          ))}
        </div>
      </Surface>
    </section>
  );
};

