import React from 'react';
import {
  Heart,
  CloudRain,
  Compass,
  Moon,
  Flame,
  Smile,
  Shield,
  Frown,
  Coffee,
  Sparkles,
  Sun,
  Anchor,
  Mail,
  MailOpen,
  LucideIcon,
} from 'lucide-react';
import { OpenWhenLetter } from '../../types';
import { Surface } from '../Surface';
import { Badge } from '../Badge';
import { cn } from '../../utils';
import { useTheme } from '../../hooks';
import { VintageOpenWhenCard } from './VintageOpenWhenCard';

const iconMap: Record<string, LucideIcon> = {
  Heart,
  CloudRain,
  Compass,
  Moon,
  Flame,
  Smile,
  Shield,
  Frown,
  Coffee,
  Sparkles,
  Sun,
  Anchor,
};

export interface OpenWhenCardProps extends React.HTMLAttributes<HTMLDivElement> {
  letter: OpenWhenLetter;
  onSelect: (letter: OpenWhenLetter) => void;
}

export const OpenWhenCard: React.FC<OpenWhenCardProps> = ({
  letter,
  onSelect,
  className,
  ...props
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';

  if (isLetterArchive) {
    return (
      <VintageOpenWhenCard
        letter={letter}
        onSelect={onSelect}
        className={className}
        {...props}
      />
    );
  }

  const IconComponent = iconMap[letter.icon] || Mail;

  return (
    <Surface
      variant="elevated"
      padding="md"
      className={cn(
        'group relative flex flex-col justify-between transition-all duration-300 cursor-pointer border border-[var(--color-border-light)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface)] min-h-[220px]',
        className
      )}
      onClick={() => onSelect(letter)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(letter);
        }
      }}
      aria-label={`Open letter: ${letter.title}`}
      {...props}
    >
      {/* Top Header Row with Icon & Badge */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="w-9 h-9 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] group-hover:border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] transition-colors">
            <IconComponent className="h-4 w-4" />
          </div>

          <Badge variant="neutral" size="sm" className="text-[11px] font-serif">
            <Mail className="h-3 w-3 mr-1 text-[var(--color-primary)]" />
            Letter #{String(letter.order).padStart(2, '0')}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-h4 font-serif font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 pt-1">
          {letter.title}
        </h3>

        {/* Trigger / Situation */}
        <p className="text-xs font-serif italic text-[var(--color-primary)] bg-[var(--color-surface-secondary)] px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border-light)] inline-block w-full line-clamp-1">
          "{letter.trigger}"
        </p>

        {/* Short Description */}
        <p className="text-body-sm text-[var(--color-text-secondary)] font-serif line-clamp-2 leading-relaxed pt-1">
          {letter.shortDescription}
        </p>
      </div>

      {/* Card Footer Action Hint */}
      <div className="pt-4 mt-4 border-t border-[var(--color-border-light)] flex items-center justify-between text-xs text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors">
        <span className="font-serif italic text-[11px] flex items-center gap-1.5">
          <MailOpen className="h-3.5 w-3.5 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
          Open letter
        </span>
        <span className="text-[11px] font-mono text-[var(--color-muted)] group-hover:text-[var(--color-primary)]">
          Ready
        </span>
      </div>
    </Surface>
  );
};
