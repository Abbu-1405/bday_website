import React from 'react';
import { Calendar, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { Moment } from '../../types';
import { Surface } from '../Surface';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { cn } from '../../utils';

export interface FeaturedMomentCardProps {
  moment: Moment;
  onSelect: (moment: Moment) => void;
  className?: string;
}

export const FeaturedMomentCard: React.FC<FeaturedMomentCardProps> = ({
  moment,
  onSelect,
  className,
}) => {
  return (
    <Surface
      variant="elevated"
      padding="none"
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-light)] hover:border-[var(--color-primary)] transition-all duration-300 bg-[var(--color-surface)] shadow-[var(--shadow-md)] cursor-pointer',
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
      aria-label={`Featured memory: ${moment.title}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] sm:min-h-[420px]">
        {/* Featured Image Banner */}
        <div className="lg:col-span-7 relative overflow-hidden bg-[var(--color-surface-secondary)] min-h-[240px] lg:min-h-full">
          <img
            src={moment.image}
            alt={moment.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/30" />
          
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="primary" size="sm" className="font-serif shadow-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Featured Memory
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Metadata Badges */}
            <div className="flex items-center gap-3 text-xs text-[var(--color-muted)] flex-wrap font-sans">
              <span className="flex items-center gap-1 font-medium text-[var(--color-primary)]">
                <Calendar className="h-3.5 w-3.5" />
                {moment.date}
              </span>
              <span className="text-[var(--color-border)]">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {moment.location}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-h2 font-serif font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-tight">
              {moment.title}
            </h2>

            {/* Short Description */}
            <p className="text-body text-[var(--color-text-secondary)] font-serif leading-relaxed line-clamp-3 sm:line-clamp-4">
              "{moment.shortDescription}"
            </p>
          </div>

          {/* Action Trigger */}
          <div className="pt-4 border-t border-[var(--color-border-light)] flex items-center justify-between">
            <span className="text-xs font-serif italic text-[var(--color-muted)]">
              Reflection #{String(moment.order).padStart(2, '0')}
            </span>

            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
              className="text-xs group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)] min-h-[40px]"
            >
              Open Memory
            </Button>
          </div>
        </div>
      </div>
    </Surface>
  );
};
