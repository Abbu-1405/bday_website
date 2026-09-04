import React, { useState, useEffect } from 'react';
import { Terminal, Menu, X, ShieldAlert, Wifi } from 'lucide-react';
import { AdminHeaderControls } from './AdminHeaderControls';

interface AdminHeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format as ISO-like UTC timestamp: YYYY-MM-DD HH:mm:ss UTC
      const iso = now.toISOString().replace('T', ' ').substring(0, 19);
      setCurrentTime(`${iso} UTC`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#030712]/95 backdrop-blur-md border-b border-emerald-500/20 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-all select-none font-mono">
      {/* Left Branding & Mobile Menu Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="sm:hidden p-1.5 rounded-lg bg-[#050811] text-emerald-400 border border-emerald-500/30 hover:bg-emerald-950/40 hover:text-emerald-300 transition-colors shrink-0"
          aria-label={isMobileMenuOpen ? 'Close terminal navigation' : 'Open terminal navigation'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Terminal Icon Prompt Badge */}
        <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
          <Terminal className="w-4 h-4" />
        </div>

        {/* Title & Console Metadata */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xs sm:text-sm font-semibold tracking-wider text-emerald-300 whitespace-nowrap">
              STARLIT LETTERS
            </h1>
            <span className="text-[10px] text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 shrink-0 tracking-widest">
              ADMIN_CONSOLE v2.4
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/30 border border-emerald-500/20 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
              SYS:ONLINE
            </span>
          </div>
          <p className="text-[10px] text-emerald-600/90 truncate hidden xs:block sm:block tracking-wide">
            // PRIVATE UNIVERSE TELEMETRY // AUTHORIZED PERSONNEL ONLY
          </p>
        </div>
      </div>

      {/* Center Live System Time (Hidden on small mobile) */}
      <div className="hidden lg:flex items-center gap-4 text-[11px] text-emerald-400/80 border-x border-emerald-500/20 px-4 py-1">
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">PROTO:</span>
          <span className="text-cyan-300">WSS/TLS1.3</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">CLOCK:</span>
          <span className="text-emerald-300 font-medium tracking-tight">
            {currentTime || 'SYNCHRONIZING...'}
          </span>
        </div>
      </div>

      {/* Right Dedicated Admin Controls Bar */}
      <div className="flex items-center justify-end">
        <AdminHeaderControls />
      </div>
    </header>
  );
};
