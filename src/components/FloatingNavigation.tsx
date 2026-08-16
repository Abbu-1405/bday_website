import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Compass,
  Heart,
  Camera,
  Calendar,
  Mail,
  MoreHorizontal,
  Sparkles,
  HelpCircle,
  Lock,
  Settings as SettingsIcon,
  ChevronUp,
  BookOpen,
} from 'lucide-react';
import { ROUTES } from '../constants';
import { cn } from '../utils';

export interface FloatingNavigationProps {
  className?: string;
}

export const FloatingNavigation: React.FC<FloatingNavigationProps> = ({ className }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  const primaryNavItems = [
    { path: ROUTES.HOME, label: 'Home', icon: <HomeIcon className="h-3.5 w-3.5 shrink-0" /> },
    { path: ROUTES.JOURNEY, label: 'Journey', icon: <Compass className="h-3.5 w-3.5 shrink-0" /> },
    { path: ROUTES.ADORE, label: 'Adore', icon: <Heart className="h-3.5 w-3.5 shrink-0" /> },
    { path: ROUTES.MOMENTS, label: 'Moments', icon: <Camera className="h-3.5 w-3.5 shrink-0" /> },
    { path: ROUTES.NOTES_365, label: '365 Notes', icon: <Calendar className="h-3.5 w-3.5 shrink-0" /> },
    { path: ROUTES.OPEN_WHEN, label: 'Open When', icon: <Mail className="h-3.5 w-3.5 shrink-0" /> },
  ];

  const moreNavItems = [
    { path: ROUTES.WISHES, label: 'Wishes', icon: <Sparkles className="h-3.5 w-3.5 shrink-0" /> },
    { path: ROUTES.WHAT_AM_I_TO_YOU, label: 'What Am I To You', icon: <HelpCircle className="h-3.5 w-3.5 shrink-0" /> },
    { path: ROUTES.REFLECTIONS, label: 'Your Reflections', icon: <BookOpen className="h-3.5 w-3.5 shrink-0" /> },
    { path: ROUTES.SECRET_VAULT, label: 'Secret Vault', icon: <Lock className="h-3.5 w-3.5 shrink-0" /> },
    { path: ROUTES.SETTINGS, label: 'Settings', icon: <SettingsIcon className="h-3.5 w-3.5 shrink-0" /> },
  ];

  const isMoreActive = moreNavItems.some((item) => location.pathname === item.path);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false);
      }
    };

    if (isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoreOpen]);

  // Close popover when location changes
  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  return (
    <nav
      ref={navRef}
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] rounded-full bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)] p-1 shadow-[var(--shadow-soft)] transition-all',
        className
      )}
      aria-label="Main Navigation"
    >
      <ul className="flex items-center gap-0.5 sm:gap-1 min-w-max">
        {primaryNavItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer leading-tight',
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                )
              }
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          </li>
        ))}

        {/* "More" Trigger & Popover */}
        <li className="relative">
          <button
            type="button"
            onClick={() => setIsMoreOpen((prev) => !prev)}
            aria-expanded={isMoreOpen}
            aria-haspopup="true"
            aria-label="More navigation items"
            className={cn(
              'flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer leading-tight',
              isMoreActive
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold'
                : isMoreOpen
                ? 'bg-[var(--color-surface)] text-[var(--color-text)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
            )}
          >
            <MoreHorizontal className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">More</span>
            <ChevronUp
              className={cn(
                'h-3 w-3 transition-transform duration-200 hidden sm:inline',
                isMoreOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Popover Menu */}
          {isMoreOpen && (
            <div
              className="absolute bottom-full right-0 mb-2 w-48 rounded-[var(--radius-xl)] bg-[var(--color-card)]/95 backdrop-blur-md border border-[var(--color-border)] p-1.5 shadow-[var(--shadow-lg)] z-50 flex flex-col gap-0.5"
              role="menu"
            >
              {moreNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  role="menuitem"
                  onClick={() => setIsMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-lg)] text-xs font-medium transition-colors cursor-pointer',
                      isActive
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                    )
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};

