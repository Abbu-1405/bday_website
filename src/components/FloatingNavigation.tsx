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
  Film,
} from 'lucide-react';
import { ROUTES } from '../constants';
import { cn } from '../utils';
import { useTheme } from '../hooks';

export interface FloatingNavigationProps {
  className?: string;
}

export const FloatingNavigation: React.FC<FloatingNavigationProps> = ({ className }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

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
    { path: ROUTES.BTS, label: 'BTS', icon: <Film className="h-3.5 w-3.5 shrink-0" /> },
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
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] rounded-full p-1 shadow-lg transition-all',
        isLetterArchive
          ? 'bg-[#FAF5EC]/95 backdrop-blur-md border border-[rgba(138,110,89,0.35)] shadow-[0_10px_30px_-6px_rgba(60,42,33,0.18)]'
          : isScrapbook
          ? 'bg-[rgba(16,30,20,0.92)] backdrop-blur-md border border-[rgba(216,184,106,0.3)] shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
          : 'bg-[rgba(13,23,40,0.92)] backdrop-blur-md border border-[rgba(201,155,88,0.3)] shadow-[0_10px_30px_rgba(0,0,0,0.7)]',
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
                  'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-serif font-medium transition-colors whitespace-nowrap cursor-pointer leading-tight focus-visible:outline-none focus-visible:ring-2',
                  isActive
                    ? isLetterArchive
                      ? 'bg-[#7A2E3B] text-[#FFF9F0] font-semibold shadow-xs'
                      : isScrapbook
                      ? 'bg-[#D8B86A] text-[#0A160D] font-semibold shadow-xs'
                      : 'bg-[#C99B58] text-[#070E1A] font-semibold shadow-xs'
                    : isLetterArchive
                    ? 'text-[#6B5547] hover:text-[#3B2A20] hover:bg-[#F2E8DC]'
                    : isScrapbook
                    ? 'text-[#B8C0AE] hover:text-[#F7F1DF] hover:bg-[rgba(79,107,72,0.3)]'
                    : 'text-[#C2AF99] hover:text-[#F2E4CF] hover:bg-[rgba(201,155,88,0.15)]'
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
              'flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-serif font-medium transition-colors whitespace-nowrap cursor-pointer leading-tight focus-visible:outline-none focus-visible:ring-2',
              isMoreActive
                ? isLetterArchive
                  ? 'bg-[#7A2E3B] text-[#FFF9F0] font-semibold shadow-xs'
                  : isScrapbook
                  ? 'bg-[#D8B86A] text-[#0A160D] font-semibold shadow-xs'
                  : 'bg-[#C99B58] text-[#070E1A] font-semibold shadow-xs'
                : isMoreOpen
                ? isLetterArchive
                  ? 'bg-[#F2E8DC] text-[#3B2A20]'
                  : isScrapbook
                  ? 'bg-[rgba(79,107,72,0.35)] text-[#F7F1DF]'
                  : 'bg-[rgba(201,155,88,0.2)] text-[#F2E4CF]'
                : isLetterArchive
                ? 'text-[#6B5547] hover:text-[#3B2A20] hover:bg-[#F2E8DC]'
                : isScrapbook
                ? 'text-[#B8C0AE] hover:text-[#F7F1DF] hover:bg-[rgba(79,107,72,0.3)]'
                : 'text-[#C2AF99] hover:text-[#F2E4CF] hover:bg-[rgba(201,155,88,0.15)]'
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
              className={cn(
                'absolute bottom-full right-0 mb-2 w-52 rounded-[16px] p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150',
                isLetterArchive
                  ? 'bg-[#FAF5EC] border border-[rgba(138,110,89,0.35)] shadow-[0_12px_32px_rgba(60,42,33,0.2)]'
                  : isScrapbook
                  ? 'bg-[rgba(16,30,20,0.96)] border border-[rgba(216,184,106,0.3)] shadow-[0_12px_32px_rgba(0,0,0,0.7)]'
                  : 'bg-[rgba(13,23,40,0.96)] border border-[rgba(201,155,88,0.3)] shadow-[0_12px_32px_rgba(0,0,0,0.8)]'
              )}
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
                      'flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-serif font-medium transition-colors cursor-pointer',
                      isActive
                        ? isLetterArchive
                          ? 'bg-[#7A2E3B] text-[#FFF9F0] font-semibold'
                          : isScrapbook
                          ? 'bg-[#D8B86A] text-[#0A160D] font-semibold'
                          : 'bg-[#C99B58] text-[#070E1A] font-semibold'
                        : isLetterArchive
                        ? 'text-[#5C4A42] hover:bg-[#F2E8DC] hover:text-[#7A2E3B]'
                        : isScrapbook
                        ? 'text-[#B8C0AE] hover:bg-[rgba(79,107,72,0.3)] hover:text-[#F7F1DF]'
                        : 'text-[#C2AF99] hover:bg-[rgba(201,155,88,0.18)] hover:text-[#F2E4CF]'
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

