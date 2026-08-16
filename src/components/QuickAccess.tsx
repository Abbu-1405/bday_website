import React from 'react';
import { Heart, Camera, BookOpen, Mail, Sparkles, HelpCircle, ChevronRight } from 'lucide-react';
import { Surface } from './Surface';
import { cn } from '../utils';
import { getStageProgress } from '../services/discoveryService';

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
      icon: <Heart className="h-5 w-5 text-[var(--color-accent)] shrink-0" />,
      badge: getStageBadge('adore'),
    },
    {
      id: 'moments',
      title: 'Moments',
      description: 'A curated gallery of treasured memories and photographs.',
      icon: <Camera className="h-5 w-5 text-[var(--color-secondary)] shrink-0" />,
      badge: getStageBadge('moments'),
    },
    {
      id: '365-notes',
      title: '365 Notes',
      description: 'Daily reflections and small letters written for every day.',
      icon: <BookOpen className="h-5 w-5 text-[var(--color-primary)] shrink-0" />,
      badge: getStageBadge('365-notes'),
    },
    {
      id: 'open-when',
      title: 'Open When',
      description: 'Envelopes sealed for specific feelings and unexpected days.',
      icon: <Mail className="h-5 w-5 text-[var(--color-warning)] shrink-0" />,
      badge: getStageBadge('open-when'),
    },
    {
      id: 'wishes',
      title: 'Wishes',
      description: 'A glowing constellation of hopes and shared dreams.',
      icon: <Sparkles className="h-5 w-5 text-[var(--color-accent)] shrink-0" />,
      badge: getStageBadge('wishes'),
    },
    {
      id: 'what-am-i-to-you',
      title: 'What Am I To You?',
      description: 'Reflective thoughts and sincere answers about our bond.',
      icon: <HelpCircle className="h-5 w-5 text-[var(--color-primary)] shrink-0" />,
      badge: getStageBadge('what-am-i-to-you'),
    },
  ];

  const displayItems = items || defaultItems;

  return (
    <section className={cn('space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className="text-h3 font-serif text-[var(--color-text)]">
          Quick Access
        </h2>
        <span className="text-xs text-[var(--color-muted)] font-serif">Shortcuts</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayItems.map((item) => (
          <Surface
            key={item.id}
            variant="elevated"
            padding="md"
            className="group flex items-start justify-between gap-4 border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-all cursor-pointer relative"
            onClick={() => onItemClick?.(item.id)}
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-light)] group-hover:bg-[var(--color-surface-secondary)] transition-colors shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0 space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-body font-semibold font-serif text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-serif font-medium bg-[var(--color-surface-secondary)] text-[var(--color-primary)] border border-[var(--color-border-light)] shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] font-serif leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="p-1.5 rounded-full text-[var(--color-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5 transition-all shrink-0 self-center">
              <ChevronRight className="h-4 w-4" />
            </div>
          </Surface>
        ))}
      </div>
    </section>
  );
};

