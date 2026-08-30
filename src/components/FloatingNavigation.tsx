import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
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
  Bell,
  ChevronUp,
  BookOpen,
  Film,
} from 'lucide-react';
import { ROUTES } from '../constants';
import { cn } from '../utils';
import { useTheme } from '../hooks';
import { useSfx } from '../contexts';

export interface FloatingNavigationProps {
  className?: string;
}

export const FloatingNavigation: React.FC<FloatingNavigationProps> = ({ className }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { playSfx } = useSfx();
  const shouldReduceMotion = useReducedMotion();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';
  const isMidnight = theme === 'midnight-journal';

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
    { path: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: <Bell className="h-3.5 w-3.5 shrink-0" /> },
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
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] rounded-full p-1 shadow-lg transition-[background-color,border-color,box-shadow,color] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        isLetterArchive
          ? 'bg-[#E8D7B8]/95 backdrop-blur-md border border-[rgba(100,75,52,0.18)] shadow-[0_8px_24px_-4px_rgba(51,38,29,0.14)]'
          : isScrapbook
          ? 'bg-[rgba(16,30,20,0.92)] backdrop-blur-md border border-[rgba(216,184,106,0.3)] shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
          : isMidnight
          ? 'bg-[#0B1428]/95 backdrop-blur-md border border-[rgba(243,213,138,0.20)] shadow-[0_10px_32px_rgba(2,6,18,0.7)]'
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
              onClick={() => {
                if (location.pathname !== item.path) {
                  playSfx('navigation');
                }
              }}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-serif font-medium whitespace-nowrap cursor-pointer leading-tight focus-visible:outline-none focus-visible:ring-2 transition-[transform,color,background-color] duration-150 active:scale-[0.96] motion-reduce:transform-none',
                  isActive
                    ? isLetterArchive
                      ? 'text-[#6F3040] font-semibold focus-visible:ring-[#7A2E3B]/40'
                      : isScrapbook
                      ? 'text-[#0A160D] font-semibold'
                      : isMidnight
                      ? 'text-[#F3D58A] font-semibold focus-visible:ring-[#F3D58A]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B1428]'
                      : 'text-[#070E1A] font-semibold'
                    : isLetterArchive
                    ? 'text-[#705846] hover:text-[#4A3525] hover:bg-[rgba(100,75,52,0.08)] border border-transparent focus-visible:ring-[#7A2E3B]/40'
                    : isScrapbook
                    ? 'text-[#B8C0AE] hover:text-[#F7F1DF] hover:bg-[rgba(79,107,72,0.3)] border border-transparent'
                    : isMidnight
                    ? 'text-[#B8C3D8] hover:text-[#E2EAF8] hover:bg-[rgba(220,230,255,0.08)] border border-transparent focus-visible:ring-[#F3D58A]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B1428]'
                    : 'text-[#C2AF99] hover:text-[#F2E4CF] hover:bg-[rgba(201,155,88,0.15)] border border-transparent'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="floatingNavActiveIndicator"
                      className={cn(
                        'absolute inset-0 rounded-full pointer-events-none transition-[background-color,border-color,box-shadow] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
                        isLetterArchive
                          ? 'bg-[rgba(111,48,64,0.09)] border border-[rgba(181,138,80,0.30)] shadow-2xs after:content-[\'\'] after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-[1.5px] after:bg-[#7A2E3B] after:rounded-full after:opacity-85'
                          : isScrapbook
                          ? 'bg-[#D8B86A] shadow-xs'
                          : isMidnight
                          ? 'bg-[rgba(243,213,138,0.10)] border border-[rgba(243,213,138,0.28)] shadow-[0_0_12px_rgba(243,213,138,0.12)] after:content-[\'\'] after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-[1.5px] after:bg-[#D8B866] after:rounded-full after:opacity-90'
                          : 'bg-[#C99B58] shadow-xs'
                      )}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : {
                              type: 'tween',
                              ease: [0.25, 0.1, 0.25, 1],
                              duration: 0.32,
                            }
                      }
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                </>
              )}
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
              'relative flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-serif font-medium whitespace-nowrap cursor-pointer leading-tight focus-visible:outline-none focus-visible:ring-2 transition-[transform,color,background-color] duration-150 active:scale-[0.96] motion-reduce:transform-none',
              isMoreActive
                ? isLetterArchive
                  ? 'text-[#6F3040] font-semibold focus-visible:ring-[#7A2E3B]/40'
                  : isScrapbook
                  ? 'text-[#0A160D] font-semibold'
                  : isMidnight
                  ? 'text-[#F3D58A] font-semibold focus-visible:ring-[#F3D58A]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B1428]'
                  : 'text-[#070E1A] font-semibold'
                : isMoreOpen
                ? isLetterArchive
                  ? 'bg-[rgba(100,75,52,0.10)] text-[#4A3525] border border-transparent focus-visible:ring-[#7A2E3B]/40'
                  : isScrapbook
                  ? 'bg-[rgba(79,107,72,0.35)] text-[#F7F1DF]'
                  : isMidnight
                  ? 'bg-[rgba(220,230,255,0.09)] text-[#E2EAF8] border border-[rgba(243,213,138,0.18)] focus-visible:ring-[#F3D58A]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B1428]'
                  : 'bg-[rgba(201,155,88,0.2)] text-[#F2E4CF]'
                : isLetterArchive
                ? 'text-[#705846] hover:text-[#4A3525] hover:bg-[rgba(100,75,52,0.08)] border border-transparent focus-visible:ring-[#7A2E3B]/40'
                : isScrapbook
                ? 'text-[#B8C0AE] hover:text-[#F7F1DF] hover:bg-[rgba(79,107,72,0.3)]'
                : isMidnight
                ? 'text-[#B8C3D8] hover:text-[#E2EAF8] hover:bg-[rgba(220,230,255,0.08)] border border-transparent focus-visible:ring-[#F3D58A]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B1428]'
                : 'text-[#C2AF99] hover:text-[#F2E4CF] hover:bg-[rgba(201,155,88,0.15)]'
            )}
          >
            {isMoreActive && (
              <motion.div
                layoutId="floatingNavActiveIndicator"
                className={cn(
                  'absolute inset-0 rounded-full pointer-events-none transition-[background-color,border-color,box-shadow] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
                  isLetterArchive
                    ? 'bg-[rgba(111,48,64,0.09)] border border-[rgba(181,138,80,0.30)] shadow-2xs after:content-[\'\'] after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-[1.5px] after:bg-[#7A2E3B] after:rounded-full after:opacity-85'
                    : isScrapbook
                    ? 'bg-[#D8B86A] shadow-xs'
                    : isMidnight
                    ? 'bg-[rgba(243,213,138,0.10)] border border-[rgba(243,213,138,0.28)] shadow-[0_0_12px_rgba(243,213,138,0.12)] after:content-[\'\'] after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-[1.5px] after:bg-[#D8B866] after:rounded-full after:opacity-90'
                    : 'bg-[#C99B58] shadow-xs'
                )}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        type: 'tween',
                        ease: [0.25, 0.1, 0.25, 1],
                        duration: 0.32,
                      }
                }
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <MoreHorizontal className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">More</span>
              <ChevronUp
                className={cn(
                  'h-3 w-3 transition-transform duration-200 hidden sm:inline',
                  isMoreOpen && 'rotate-180'
                )}
              />
            </span>
          </button>

          {/* Popover Menu */}
          {isMoreOpen && (
            <div
              className={cn(
                'absolute bottom-full right-0 mb-2 w-52 rounded-[16px] p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150 transition-[background-color,border-color,box-shadow,color] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
                isLetterArchive
                  ? 'bg-[#E8D7B8] border border-[rgba(100,75,52,0.22)] shadow-[0_12px_28px_rgba(51,38,29,0.18)]'
                  : isScrapbook
                  ? 'bg-[rgba(16,30,20,0.96)] border border-[rgba(216,184,106,0.3)] shadow-[0_12px_32px_rgba(0,0,0,0.7)]'
                  : isMidnight
                  ? 'bg-[#0B1428]/98 backdrop-blur-md border border-[rgba(243,213,138,0.22)] shadow-[0_16px_36px_rgba(2,6,18,0.85)]'
                  : 'bg-[rgba(13,23,40,0.96)] border border-[rgba(201,155,88,0.3)] shadow-[0_12px_32px_rgba(0,0,0,0.8)]'
              )}
              role="menu"
            >
              {moreNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  role="menuitem"
                  onClick={() => {
                    if (location.pathname !== item.path) {
                      playSfx('navigation');
                    }
                    setIsMoreOpen(false);
                  }}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-serif font-medium transition-[background-color,border-color,box-shadow,color,transform] duration-150 ease-out cursor-pointer active:scale-[0.985] motion-reduce:transform-none',
                      isActive
                        ? isLetterArchive
                          ? 'bg-[rgba(111,48,64,0.09)] text-[#6F3040] font-semibold border-l-2 border-[#7A2E3B]'
                          : isScrapbook
                          ? 'bg-[#D8B86A] text-[#0A160D] font-semibold'
                          : isMidnight
                          ? 'bg-[rgba(243,213,138,0.10)] text-[#F3D58A] font-semibold border-l-2 border-[#D8B866]'
                          : 'bg-[#C99B58] text-[#070E1A] font-semibold'
                        : isLetterArchive
                        ? 'text-[#705846] hover:bg-[rgba(100,75,52,0.08)] hover:text-[#4A3525]'
                        : isScrapbook
                        ? 'text-[#B8C0AE] hover:bg-[rgba(79,107,72,0.3)] hover:text-[#F7F1DF]'
                        : isMidnight
                        ? 'text-[#B8C3D8] hover:bg-[rgba(220,230,255,0.07)] hover:text-[#E2EAF8]'
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

