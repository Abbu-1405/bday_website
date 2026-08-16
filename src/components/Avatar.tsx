import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt = 'Avatar',
  name,
  initials,
  size = 'md',
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (str?: string): string => {
    if (!str) return '';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const computedInitials = initials || getInitials(name);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none bg-[var(--color-surface-secondary)] text-[var(--color-primary)] font-semibold border border-[var(--color-border)] shadow-[var(--shadow-sm)]',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : computedInitials ? (
        <span>{computedInitials}</span>
      ) : (
        <User className={cn('text-[var(--color-muted)]', iconSizes[size])} />
      )}
    </div>
  );
};
