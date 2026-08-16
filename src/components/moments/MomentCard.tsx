import React from 'react';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import { Moment } from '../../types';
import { Surface } from '../Surface';
import { cn } from '../../utils';

export interface MomentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  moment: Moment;
  onSelect: (moment: Moment) => void;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  onSelect,
  aspectRatio = 'square',
  className,
  ...props
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[4/5]',
  }[aspectRatio];

  return (
    <Surface
      variant="elevated"
      padding="none"
      className={cn(
        'group relative flex flex-col justify-between transition-all duration-300 cursor-pointer border border-[var(--color-border-light)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface)] h-full',
        className
      )}
      onClick={() => onSelect(moment)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(moment);
        }
      }}
      aria-label={`View memory ${moment.order}: ${moment.title}`}
      {...props}
    >
      {/* Top Image Container */}
      <div className={cn('relative w-full overflow-hidden bg-[var(--color-surface-secondary)]', aspectClasses)}>
        <img
          src={moment.image}
          alt={moment.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-serif font-bold tracking-wider bg-black/50 backdrop-blur-xs text-white border border-white/20">
          #{String(moment.order).padStart(2, '0')}
        </span>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col justify-between flex-grow space-y-3">
        <div className="space-y-2">
          {/* Metadata Row */}
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] flex-wrap font-sans">
            <span className="flex items-center gap-1 text-[var(--color-primary)] font-medium">
              <Calendar className="h-3 w-3" />
              {moment.date}
            </span>
            <span className="text-[var(--color-border)]">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {moment.location}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-h4 font-serif font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
            {moment.title}
          </h3>

          {/* Short Description */}
          <p className="text-body-sm text-[var(--color-text-secondary)] font-serif line-clamp-2 leading-relaxed">
            {moment.shortDescription}
          </p>
        </div>

        {/* Card Footer Hint */}
        <div className="pt-3 border-t border-[var(--color-border-light)] flex items-center justify-between text-xs text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors">
          <span className="font-serif italic text-[11px]">View memory story</span>
          <Sparkles className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-primary)]" />
        </div>
      </div>
    </Surface>
  );
};
