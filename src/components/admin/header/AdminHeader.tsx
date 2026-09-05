import React from 'react';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { AdminHeaderControls } from './AdminHeaderControls';

interface AdminHeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 transition-all select-none">
      {/* Left Branding & Mobile Menu Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="sm:hidden p-2 rounded-xl bg-slate-800/90 text-slate-300 border border-slate-700/80 hover:bg-slate-700 transition-colors shrink-0"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Shield Icon Badge */}
        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        {/* Title & Subtitle */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-xs sm:text-sm font-semibold text-slate-100 tracking-tight whitespace-nowrap">
              Starlit Letters
            </h1>
            <span className="text-[10px] sm:text-xs text-indigo-400 font-mono font-medium px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/20 shrink-0">
              Admin
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate hidden xs:block sm:block">
            Owner Dashboard & Monitor
          </p>
        </div>
      </div>

      {/* Right Dedicated Admin Controls Bar (User, Audio, Mixer, Theme, Sign Out) */}
      <div className="flex items-center justify-end">
        <AdminHeaderControls />
      </div>
    </header>
  );
};
