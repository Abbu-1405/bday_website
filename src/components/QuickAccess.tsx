import React from 'react';
import { Heart, Camera, BookOpen, Mail, Sparkles, HelpCircle, ChevronRight } from 'lucide-react';
import { Surface } from './Surface';
import { cn } from '../utils';
import { getStageProgress } from '../services/discoveryService';
import { useTheme } from '../hooks';

export interface QuickAccessItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  onClick?: () => void;
}

export interface QuickAccessProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: QuickAccessItem[];
  onItemClick?: (id: string) => void;
}

export const QuickAccess: React.FC<QuickAccessProps> = ({
  className,
  items,
  onItemClick,
  ...props
}) => {
  const { theme } = useTheme();
  const isWhimsical = theme === 'whimsical-scrapbook';
  const isMidnight = theme === 'midnight-journal';
  const isLetterArchive = theme === 'letter-archive';

  const stages = getStageProgress();

  const getStageBadge = (id: string): string | undefined => {
    const keyMap: Record<string, string> = {
      'adore': 'adore',
      'moments': 'moments',
      '365-notes': 'notes365',
      'open-when': 'openWhen',
      'wishes': 'wishes',
      'what-am-i-to-you': 'whatAmIToYou',
    };
    const stageKey = keyMap[id];
    if (!stageKey) return undefined;
    const stage = stages.find((s) => s.key === stageKey);
    if (!stage) return undefined;
    if (stage.discovered > 0) {
      return `${stage.discovered} / ${stage.total}`;
    }
    return undefined;
  };

  const defaultItems: QuickAccessItem[] = [
    {
      id: 'adore',
      title: 'Adore',
      description: 'Heartfelt appreciation and quiet words of gratitude.',
      icon: <Heart className="h-4 sm:h-5 w-4 sm:w-5 text-[var(--color-accent)] shrink-0" />,
      badge: getStageBadge('adore'),
    },
    {
      id: 'moments',
      title: 'Moments',
      description: 'A curated gallery of treasured memories and photographs.',
      icon: <Camera className="h-4 sm:h-5 w-4 sm:w-5 text-[var(--color-secondary)] shrink-0" />,
      badge: getStageBadge('moments'),
    },
    {
      id: '365-notes',
      title: '365 Notes',
      description: 'Daily reflections and small letters written for every day.',
      icon: <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 text-[var(--color-primary)] shrink-0" />,
      badge: getStageBadge('365-notes'),
    },
    {
      id: 'open-when',
      title: 'Open When',
      description: 'Envelopes sealed for specific feelings and unexpected days.',
      icon: <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-[var(--color-warning)] shrink-0" />,
      badge: getStageBadge('open-when'),
    },
    {
      id: 'wishes',
      title: 'Wishes',
      description: 'A glowing constellation of hopes and shared dreams.',
      icon: <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 text-[var(--color-accent)] shrink-0" />,
      badge: getStageBadge('wishes'),
    },
    {
      id: 'what-am-i-to-you',
      title: 'What Am I To You?',
      description: 'Reflective thoughts and sincere answers about our bond.',
      icon: <HelpCircle className="h-4 sm:h-5 w-4 sm:w-5 text-[var(--color-primary)] shrink-0" />,
      badge: getStageBadge('what-am-i-to-you'),
    },
  ];

  const displayItems = items || defaultItems;

  return (
    <section className={cn('space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
          {isWhimsical && (
            <span className="whimsical-subtitle text-xs text-[var(--color-accent-rose)] block -mb-0.5 select-none">
              paths to wander
            </span>
          )}
          {isMidnight && (
            <span className="midnight-subtitle text-xs text-[#E2BD78] block -mb-0.5 select-none">
              constellations
            </span>
          )}
          {isLetterArchive && (
            <span className="letter-script text-sm text-[#7A2E3B] block -mb-0.5 select-none">
              archival alcoves
            </span>
          )}
          <h2 className={cn(
            "font-serif font-semibold tracking-tight text-h3",
            isLetterArchive ? "text-[#3B2A20]" : isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
          )}>
            Quick Access
          </h2>
        </div>
        <span className={cn(
          "text-xs font-serif",
          isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-muted)]"
        )}>
          Shortcuts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {displayItems.map((item) => (
          <Surface
            key={item.id}
            variant="elevated"
            padding="md"
            className={cn(
              "group flex items-start justify-between gap-3.5 transition-all duration-200 cursor-pointer relative hover:-translate-y-0.5",
              isLetterArchive && "bg-[#FAF5EC] border border-[rgba(138,110,89,0.25)] hover:border-[#7A2E3B]/60 shadow-[0_3px_14px_rgba(60,42,33,0.05)]",
              isMidnight && "bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.22)] hover:border-[#E2BD78]/60 shadow-[0_4px_16px_rgba(0,0,0,0.35)]",
              isWhimsical && "bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.18)] hover:border-[#D8B86A]/50 shadow-[0_4px_16px_rgba(0,0,0,0.35)]",
              !isLetterArchive && !isMidnight && !isWhimsical && "border border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
            )}
            onClick={() => onItemClick?.(item.id)}
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={cn(
                "p-2.5 rounded-[12px] transition-colors shrink-0",
                isLetterArchive && "bg-[#F2E8DC] border border-[rgba(138,110,89,0.25)] group-hover:bg-[#EADBCC]",
                isMidnight && "bg-[rgba(16,27,45,0.9)] border border-[rgba(201,155,88,0.25)] group-hover:bg-[rgba(25,40,65,0.9)]",
                isWhimsical && "bg-[rgba(20,38,25,0.9)] border border-[rgba(216,184,106,0.2)] group-hover:bg-[rgba(30,55,36,0.9)]",
                !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface)] border border-[var(--color-border-light)] group-hover:bg-[var(--color-surface-secondary)]"
              )}>
                {item.icon}
              </div>
              <div className="min-w-0 space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={cn(
                    "text-sm sm:text-base font-semibold font-serif transition-colors truncate",
                    isLetterArchive && "text-[#3B2A20] group-hover:text-[#7A2E3B]",
                    isMidnight && "text-[#F2E4CF] group-hover:text-[#E2BD78]",
                    isWhimsical && "text-[var(--color-text)] group-hover:text-[#D8B86A]",
                    !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-text)] group-hover:text-[var(--color-primary)]"
                  )}>
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-serif font-medium shrink-0",
                      isLetterArchive && "bg-[#7A2E3B]/10 text-[#7A2E3B] border border-[#7A2E3B]/25",
                      isMidnight && "bg-[rgba(201,155,88,0.15)] text-[#E2BD78] border border-[rgba(201,155,88,0.3)]",
                      isWhimsical && "bg-[rgba(216,184,106,0.15)] text-[#D8B86A] border border-[rgba(216,184,106,0.25)]",
                      !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface-secondary)] text-[var(--color-primary)] border border-[var(--color-border-light)]"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className={cn(
                  "text-xs font-serif leading-relaxed line-clamp-2",
                  isLetterArchive ? "text-[#5C4A42]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
                )}>
                  {item.description}
                </p>
              </div>
            </div>

            <div className={cn(
              "p-1.5 rounded-full group-hover:translate-x-0.5 transition-all shrink-0 self-center",
              isLetterArchive && "text-[#8A6E59] group-hover:text-[#7A2E3B]",
              isMidnight && "text-[#C2AF99] group-hover:text-[#E2BD78]",
              isWhimsical && "text-[#B8C0AE] group-hover:text-[#D8B86A]",
              !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-muted)] group-hover:text-[var(--color-primary)]"
            )}>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Surface>
        ))}
      </div>
    </section>
  );
};

