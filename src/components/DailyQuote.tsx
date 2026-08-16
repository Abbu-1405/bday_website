import React from 'react';
import { Quote, Heart, RefreshCw } from 'lucide-react';
import { Surface } from './Surface';
import { cn } from '../utils';

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

  return (
    <section className={cn('space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className="text-h3 font-serif text-[var(--color-text)] flex items-center gap-2">
          <Quote className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
          Daily Quote
        </h2>
        {category && (
          <span className="text-xs text-[var(--color-muted)]">
            {category}
          </span>
        )}
      </div>

      <Surface
        variant="elevated"
        padding="lg"
        className="max-w-2xl mx-auto text-center space-y-4 border border-[var(--color-border)] relative"
      >
        <span className="quote-mark text-5xl leading-none font-serif text-[var(--color-primary)] opacity-30 select-none block -mb-2">
          &ldquo;
        </span>

        <blockquote className="text-quote font-serif italic text-[var(--color-text)] text-lg sm:text-xl leading-relaxed">
          {quote}
        </blockquote>

        {author && (
          <p className="quote-author text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] tracking-wide pt-2 border-t border-[var(--color-border-light)] max-w-xs mx-auto">
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
                  'p-2 rounded-full border border-[var(--color-border-light)] transition-colors',
                  isFavorite
                    ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
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
                className="p-2 rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border-light)] transition-colors"
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
