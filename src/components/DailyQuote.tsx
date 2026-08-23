import React from 'react';
import { Quote, Heart, RefreshCw } from 'lucide-react';
import { Surface } from './Surface';
import { cn } from '../utils';
import { useTheme } from '../hooks';

export interface QuoteData {
  id?: string;
  quote: string;
  author?: string;
  category?: string;
  date?: string;
  isFavorite?: boolean;
}

export interface DailyQuoteProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: QuoteData;
  onFavoriteToggle?: (id?: string) => void;
  onRefreshQuote?: () => void;
  showActions?: boolean;
}

const defaultQuoteData: QuoteData = {
  id: 'daily-1',
  quote: 'Every memory deserves a place to live.',
  author: 'Starlit Letters',
  category: 'Reflection',
  date: 'Today',
  isFavorite: false,
};

export const DailyQuote: React.FC<DailyQuoteProps> = ({
  className,
  data = defaultQuoteData,
  onFavoriteToggle,
  onRefreshQuote,
  showActions = false,
  ...props
}) => {
  const { quote, author, category, isFavorite } = data;
  const { theme } = useTheme();
  const isWhimsical = theme === 'whimsical-scrapbook';
  const isMidnight = theme === 'midnight-journal';
  const isLetterArchive = theme === 'letter-archive';

  return (
    <section className={cn('space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
          {isWhimsical && (
            <span className="whimsical-subtitle text-xs text-[var(--color-accent-rose)] block -mb-0.5 select-none">
              whispered thoughts
            </span>
          )}
          {isMidnight && (
            <span className="midnight-subtitle text-xs text-[#E2BD78] block -mb-0.5 select-none">
              starlight verse
            </span>
          )}
          {isLetterArchive && (
            <span className="letter-script text-sm text-[#7A2E3B] block -mb-0.5 select-none">
              inscribed reflection
            </span>
          )}
          <h2 className={cn(
            "font-serif font-semibold tracking-tight text-h3 flex items-center gap-2",
            isLetterArchive ? "text-[#3B2A20]" : isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
          )}>
            <Quote className={cn(
              "h-4 w-4 shrink-0",
              isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-primary)]"
            )} />
            Daily Quote
          </h2>
        </div>
        {category && (
          <span className={cn(
            "text-xs font-serif",
            isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-muted)]"
          )}>
            {category}
          </span>
        )}
      </div>

      <Surface
        variant="elevated"
        padding="lg"
        className={cn(
          "max-w-2xl mx-auto text-center space-y-4 relative transition-all",
          isLetterArchive && "bg-[#FAF5EC] border border-[rgba(138,110,89,0.3)] shadow-[0_4px_20px_rgba(60,42,33,0.06)]",
          isMidnight && "bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.25)] shadow-md",
          isWhimsical && "bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.2)] shadow-sm",
          !isLetterArchive && !isMidnight && !isWhimsical && "border border-[var(--color-border)]"
        )}
      >
        <span className={cn(
          "quote-mark text-5xl leading-none font-serif select-none block -mb-2 opacity-35",
          isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#C99B58]" : "text-[var(--color-primary)]"
        )}>
          &ldquo;
        </span>

        <blockquote className={cn(
          "text-quote font-serif italic text-base sm:text-xl leading-relaxed max-w-xl mx-auto",
          isLetterArchive ? "text-[#3B2A20]" : isMidnight ? "text-[#F2E4CF]" : "text-[var(--color-text)]"
        )}>
          {quote}
        </blockquote>

        {author && (
          <p className={cn(
            "quote-author text-xs sm:text-sm font-medium font-serif tracking-wide pt-2 border-t max-w-xs mx-auto",
            isLetterArchive
              ? "text-[#7A2E3B] border-[rgba(138,110,89,0.2)]"
              : isMidnight
              ? "text-[#E2BD78] border-[rgba(201,155,88,0.18)]"
              : "text-[var(--color-text-secondary)] border-[var(--color-border-light)]"
          )}>
            &mdash; {author}
          </p>
        )}

        {showActions && (
          <div className="flex items-center justify-center gap-3 pt-2">
            {onFavoriteToggle && (
              <button
                type="button"
                onClick={() => onFavoriteToggle(data.id)}
                className={cn(
                  'p-2 rounded-full border transition-colors cursor-pointer',
                  isLetterArchive
                    ? isFavorite
                      ? 'text-[#7A2E3B] bg-[#7A2E3B]/10 border-[#7A2E3B]/30'
                      : 'text-[#8A6E59] hover:text-[#3B2A20] border-[rgba(138,110,89,0.3)]'
                    : isMidnight
                    ? isFavorite
                      ? 'text-[#E2BD78] bg-[rgba(201,155,88,0.2)] border-[rgba(201,155,88,0.4)]'
                      : 'text-[#C2AF99] hover:text-[#F2E4CF] border-[rgba(201,155,88,0.25)]'
                    : isFavorite
                    ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)] border-[var(--color-border-light)]'
                )}
                aria-label="Favorite quote"
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>
            )}
            {onRefreshQuote && (
              <button
                type="button"
                onClick={onRefreshQuote}
                className={cn(
                  'p-2 rounded-full border transition-colors cursor-pointer',
                  isLetterArchive
                    ? 'text-[#8A6E59] hover:text-[#3B2A20] border-[rgba(138,110,89,0.3)]'
                    : isMidnight
                    ? 'text-[#C2AF99] hover:text-[#F2E4CF] border-[rgba(201,155,88,0.25)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)] border-[var(--color-border-light)]'
                )}
                aria-label="Refresh quote"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </Surface>
    </section>
  );
};
