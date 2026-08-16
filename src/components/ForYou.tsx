import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  BookOpen,
  Camera,
  Heart,
  Mail,
  Compass,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Surface } from './Surface';
import { Button } from './Button';
import { cn } from '../utils';
import { useAuth, useTheme } from '../hooks';
import { getForYouRecommendation, ForYouRecommendation } from '../services/forYouService';

export interface ForYouProps extends React.HTMLAttributes<HTMLDivElement> {
  customRecommendation?: ForYouRecommendation;
}

const renderIcon = (name: string) => {
  switch (name) {
    case 'Sparkles':
      return <Sparkles className="h-4 w-4 text-[var(--color-accent)] shrink-0" />;
    case 'Lock':
      return <Lock className="h-4 w-4 text-[var(--color-warning)] shrink-0" />;
    case 'BookOpen':
      return <BookOpen className="h-4 w-4 text-[var(--color-primary)] shrink-0" />;
    case 'Camera':
      return <Camera className="h-4 w-4 text-[var(--color-secondary)] shrink-0" />;
    case 'Heart':
      return <Heart className="h-4 w-4 text-[var(--color-accent)] shrink-0" />;
    case 'Mail':
      return <Mail className="h-4 w-4 text-[var(--color-warning)] shrink-0" />;
    case 'CheckCircle2':
      return <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] shrink-0" />;
    case 'Compass':
    default:
      return <Compass className="h-4 w-4 text-[var(--color-primary)] shrink-0" />;
  }
};

export const ForYou: React.FC<ForYouProps> = ({ className, customRecommendation, ...props }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isWhimsical = theme === 'whimsical-scrapbook';

  // Logged-out users do not see personalized recommendations
  if (!currentUser) {
    return null;
  }

  const rec = customRecommendation || getForYouRecommendation();

  return (
    <section className={cn('space-y-3.5', className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className={cn("flex items-center gap-1.5", isWhimsical ? "whimsical-label lowercase text-sm font-normal text-[var(--color-accent)]" : "text-xs font-serif font-semibold text-[var(--color-muted)] uppercase tracking-wider")}>
          <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)] shrink-0" />
          {isWhimsical ? 'a little something waiting for you' : 'Something waiting for you'}
        </h2>
        {rec.progressText && (
          <span className="text-[11px] font-serif text-[var(--color-text-secondary)]">
            {rec.progressText}
          </span>
        )}
      </div>

      <Surface
        variant="elevated"
        padding="md"
        className={cn(
          "border border-[var(--color-border-light)] bg-[var(--color-card)] relative overflow-hidden transition-all shadow-xs",
          isWhimsical && "rounded-[20px] bg-[rgba(8,20,11,0.70)] border-[rgba(240,230,190,0.12)] p-4 sm:p-5 hover:border-[rgba(216,184,106,0.35)]"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className={cn(
              "p-2.5 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] shrink-0 mt-0.5 sm:mt-0",
              isWhimsical && "bg-[rgba(12,26,15,0.75)] border-[rgba(240,230,190,0.14)] text-[var(--color-accent)]"
            )}>
              {renderIcon(rec.iconName)}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "text-[10px] font-serif font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 shrink-0",
                  isWhimsical && "whimsical-subtitle text-xs text-[var(--color-accent-rose)] font-normal normal-case border-none bg-transparent px-0 py-0"
                )}>
                  {isWhimsical ? `✨ ${rec.tag.toLowerCase()}` : rec.tag}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-serif font-semibold text-[var(--color-text)] tracking-tight">
                {rec.title}
              </h3>

              <p className="text-xs sm:text-sm font-serif text-[var(--color-text-secondary)] italic leading-relaxed">
                &ldquo;{rec.description}&rdquo;
              </p>
            </div>
          </div>

          <div className="shrink-0 pt-1 sm:pt-0 self-end sm:self-center w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(rec.route)}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              className="w-full sm:w-auto font-serif text-xs px-3.5 py-1.5"
            >
              {rec.ctaText}
            </Button>
          </div>
        </div>
      </Surface>
    </section>
  );
};
