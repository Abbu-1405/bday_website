import React from 'react';
import { Heart, Sparkles, Image as ImageIcon } from 'lucide-react';
import { AdoreItem } from '../../types';
import { Surface } from '../Surface';
import { Badge } from '../Badge';
import { cn } from '../../utils';

export interface AdoreCardProps extends React.HTMLAttributes<HTMLDivElement> {
  item: AdoreItem;
  onSelect: (item: AdoreItem) => void;
}

export const AdoreCard: React.FC<AdoreCardProps> = ({
  item,
  onSelect,
  className,
  ...props
}) => {
  return (
    <Surface
      variant="elevated"
      padding="md"
      className={cn(
        'group relative flex flex-col justify-between transition-all duration-300 cursor-pointer border border-[var(--color-border-light)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1 rounded-[var(--radius-lg)] overflow-hidden h-full bg-[var(--color-surface)] min-h-[220px]',
        className
      )}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
      aria-label={`Read item ${item.order}: ${item.title}`}
      {...props}
    >
      {/* Top Header Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-full text-xs font-serif font-bold tracking-wider bg-[var(--color-surface-secondary)] text-[var(--color-primary)] border border-[var(--color-border-light)] group-hover:border-[var(--color-primary)] transition-colors">
            #{String(item.order).padStart(2, '0')}
          </span>

          {item.category && (
            <Badge variant="neutral" size="sm" className="text-[11px] font-sans">
              {item.category}
            </Badge>
          )}
        </div>

        {/* Thumbnail Preview if Image Present */}
        {item.image && (
          <div className="relative h-36 w-full rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            <span className="absolute bottom-2 right-2 p-1 rounded-full bg-black/40 text-white backdrop-blur-xs">
              <ImageIcon className="h-3.5 w-3.5" />
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-h4 font-serif font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 pt-1">
          {item.title}
        </h3>

        {/* Short Description */}
        <p className="text-body-sm text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed font-sans">
          {item.shortDescription}
        </p>
      </div>

      {/* Bottom Action Hint */}
      <div className="pt-4 mt-4 border-t border-[var(--color-border-light)] flex items-center justify-between text-xs text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors">
        <span className="font-medium font-serif flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-[var(--color-accent)] fill-current opacity-70 group-hover:opacity-100 transition-opacity" />
          Read Reflection
        </span>
        <Sparkles className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-primary)]" />
      </div>
    </Surface>
  );
};
