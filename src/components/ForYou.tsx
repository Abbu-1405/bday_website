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

const renderIcon = (name: string, isLetterArchive: boolean, isMidnight: boolean) => {
  switch (name) {
    case 'Sparkles':
      return <Sparkles className={cn("h-4 w-4 shrink-0", isLetterArchive ? "text-[#C2934D]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-accent)]")} />;
    case 'Lock':
      return <Lock className={cn("h-4 w-4 shrink-0", isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C99B58]" : "text-[var(--color-warning)]")} />;
    case 'BookOpen':
      return <BookOpen className={cn("h-4 w-4 shrink-0", isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-primary)]")} />;
    case 'Camera':
      return <Camera className={cn("h-4 w-4 shrink-0", isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C99B58]" : "text-[var(--color-secondary)]")} />;
    case 'Heart':
      return <Heart className={cn("h-4 w-4 shrink-0", isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-accent)]")} />;
    case 'Mail':
      return <Mail className={cn("h-4 w-4 shrink-0", isLetterArchive ? "text-[#C2934D]" : isMidnight ? "text-[#C99B58]" : "text-[var(--color-warning)]")} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={cn("h-4 w-4 shrink-0", isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-success)]")} />;
    case 'Compass':
    default:
      return <Compass className={cn("h-4 w-4 shrink-0", isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-primary)]")} />;
  }
};

export const ForYou: React.FC<ForYouProps> = ({ className, customRecommendation, ...props }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isWhimsical = theme === 'whimsical-scrapbook';
  const isMidnight = theme === 'midnight-journal';
  const isLetterArchive = theme === 'letter-archive';

  // Logged-out users do not see personalized recommendations
  if (!currentUser) {
    return null;
  }

  const rec = customRecommendation || getForYouRecommendation();

  return (
    <section className={cn('space-y-3.5', className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className={cn(
          "flex items-center gap-1.5",
          isWhimsical && "whimsical-label lowercase text-sm font-normal text-[var(--color-accent-soft-gold)]",
          isMidnight && "midnight-subtitle text-xs text-[#E2BD78]",
          isLetterArchive && "letter-script text-sm text-[#7A2E3B]",
          !isWhimsical && !isMidnight && !isLetterArchive && "text-xs font-serif font-semibold text-[var(--color-muted)] uppercase tracking-wider"
        )}>
          <Sparkles className={cn(
            "h-3.5 w-3.5 shrink-0",
            isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-accent)]"
          )} />
          {isWhimsical
            ? 'a little something waiting for you'
            : isMidnight
            ? 'starlit discovery for you'
            : isLetterArchive
            ? 'a curated page awaiting you'
            : 'Something waiting for you'}
        </h2>
        {rec.progressText && (
          <span className={cn(
            "text-[11px] font-serif",
            isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
          )}>
            {rec.progressText}
          </span>
        )}
      </div>

      <Surface
        variant="elevated"
        padding="md"
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          isLetterArchive && "bg-[#FAF5EC] border border-[rgba(138,110,89,0.3)] shadow-[0_4px_20px_rgba(60,42,33,0.06)] hover:border-[#7A2E3B]/40",
          isMidnight && "bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.25)] shadow-md hover:border-[#E2BD78]/40",
          isWhimsical && "rounded-[20px] bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.2)] shadow-sm hover:border-[#D8B86A]/40",
          !isLetterArchive && !isMidnight && !isWhimsical && "border border-[var(--color-border-light)] bg-[var(--color-card)] shadow-xs"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className={cn(
              "p-2.5 rounded-full border shrink-0 mt-0.5 sm:mt-0 transition-colors",
              isLetterArchive && "bg-[#F2E8DC] border-[rgba(138,110,89,0.3)]",
              isMidnight && "bg-[rgba(16,27,45,0.9)] border-[rgba(201,155,88,0.3)]",
              isWhimsical && "bg-[rgba(20,38,25,0.9)] border-[rgba(216,184,106,0.25)]",
              !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface-secondary)] border-[var(--color-border-light)]"
            )}>
              {renderIcon(rec.iconName, isLetterArchive, isMidnight)}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "text-[10px] font-serif font-medium uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
                  isLetterArchive && "bg-[#7A2E3B]/10 text-[#7A2E3B] border border-[#7A2E3B]/25",
                  isMidnight && "bg-[rgba(201,155,88,0.15)] text-[#E2BD78] border border-[rgba(201,155,88,0.3)]",
                  isWhimsical && "whimsical-subtitle text-xs text-[var(--color-accent-rose)] font-normal normal-case border-none bg-transparent px-0 py-0",
                  !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20"
                )}>
                  {isWhimsical ? `✨ ${rec.tag.toLowerCase()}` : rec.tag}
                </span>
              </div>

              <h3 className={cn(
                "text-sm sm:text-base font-serif font-semibold tracking-tight",
                isLetterArchive && "text-[#3B2A20]",
                isMidnight && "text-[#F2E4CF]",
                isWhimsical && "text-[var(--color-text)]"
              )}>
                {rec.title}
              </h3>

              <p className={cn(
                "text-xs sm:text-sm font-serif italic leading-relaxed",
                isLetterArchive ? "text-[#5C4A42]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
              )}>
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
              className={cn(
                "w-full sm:w-auto font-serif text-xs px-3.5 py-1.5 shadow-xs",
                isLetterArchive && "bg-[#7A2E3B] hover:bg-[#64242F] text-[#FFF9F0]",
                isMidnight && "bg-[#C99B58] hover:bg-[#D8AE6B] text-[#070E1A]",
                isWhimsical && "bg-[#D8B86A] hover:bg-[#E5C97F] text-[#0A160D]"
              )}
            >
              {rec.ctaText}
            </Button>
          </div>
        </div>
      </Surface>
    </section>
  );
};
