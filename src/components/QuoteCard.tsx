import React from 'react';
import { Card } from './Card';
import { cn } from '../utils';

export interface QuoteCardProps {
  quote: string;
  author?: string;
  source?: string;
  className?: string;
  variant?: 'default' | 'flat' | 'bordered';
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  author,
  source,
  className,
  variant = 'default',
}) => {
  return (
    <Card variant={variant} className={cn('relative overflow-hidden', className)}>
      <div className="flex flex-col gap-3">
        <span className="quote-mark text-4xl leading-none font-serif text-[var(--color-primary)] opacity-40 select-none">
          “
        </span>
        <blockquote className="text-quote italic font-serif text-[var(--color-text)] -mt-2">
          {quote}
        </blockquote>
        {(author || source) && (
          <div className="quote-author flex items-center gap-2 pt-2 border-t border-[var(--color-border)] text-small text-[var(--color-muted)]">
            {author && <span className="font-medium text-[var(--color-text)]">— {author}</span>}
            {source && <span className="text-xs italic">({source})</span>}
          </div>
        )}
      </div>
    </Card>
  );
};
