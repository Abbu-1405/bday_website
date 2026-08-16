import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../utils';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  showHomeIcon?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  className,
  items,
  showHomeIcon = true,
  ...props
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-xs font-medium text-[var(--color-muted)]', className)}
      {...props}
    >
      <ol className="flex items-center flex-wrap gap-1.5 leading-none">
        {showHomeIcon && (
          <li className="inline-flex items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
              title="Home"
            >
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}

        {showHomeIcon && items.length > 0 && (
          <li aria-hidden="true" className="text-[var(--color-border)] select-none">
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <li className="inline-flex items-center">
                {item.path && !isLast ? (
                  <Link
                    to={item.path}
                    className="inline-flex items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={cn(
                      'inline-flex items-center gap-1',
                      isLast
                        ? 'text-[var(--color-text)] font-semibold'
                        : 'text-[var(--color-muted)]'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>

              {!isLast && (
                <li aria-hidden="true" className="text-[var(--color-border)] select-none">
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
