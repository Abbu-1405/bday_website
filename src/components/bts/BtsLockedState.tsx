import React, { useState, useEffect } from 'react';
import { Film, Lock, Calendar, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useTheme } from '../../hooks';
import { cn } from '../../utils';

interface BtsLockedStateProps {
  unlockDate: string;
}

export const BtsLockedState: React.FC<BtsLockedStateProps> = ({
  unlockDate,
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date('2026-10-04T00:00:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        'min-h-[75vh] flex flex-col items-center justify-center px-4 sm:px-6 py-12 text-center select-none transition-colors'
      )}
    >
      <div
        className={cn(
          'w-full max-w-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl border relative overflow-hidden backdrop-blur-md space-y-6 animate-in fade-in zoom-in-95 duration-300',
          isLetterArchive
            ? 'bg-[#FAF6F0]/95 border-[rgba(138,110,89,0.3)] shadow-[0_16px_40px_rgba(60,42,33,0.14)] text-[#2C221E]'
            : isScrapbook
            ? 'bg-[rgba(16,30,20,0.92)] border-[rgba(216,184,106,0.3)] shadow-[0_16px_40px_rgba(0,0,0,0.6)] text-[#F7F1DF]'
            : 'bg-[rgba(13,23,40,0.92)] border-[rgba(201,155,88,0.3)] shadow-[0_16px_40px_rgba(0,0,0,0.7)] text-[#F2E4CF]'
        )}
      >
        {/* Subtle decorative background glow */}
        <div
          className={cn(
            'absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none',
            isLetterArchive ? 'bg-[#7A2E3B]' : isScrapbook ? 'bg-[#D8B86A]' : 'bg-[#C99B58]'
          )}
        />
        <div
          className={cn(
            'absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none',
            isLetterArchive ? 'bg-[#C2934D]' : isScrapbook ? 'bg-[#4F6B48]' : 'bg-[#1E3A5F]'
          )}
        />

        {/* Film / Clapperboard Icon with Lock */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div
            className={cn(
              'w-20 h-20 rounded-2xl border flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105',
              isLetterArchive
                ? 'bg-[#EDE4D8] border-[rgba(138,110,89,0.35)] text-[#7A2E3B]'
                : isScrapbook
                ? 'bg-[rgba(27,47,33,0.8)] border-[rgba(216,184,106,0.4)] text-[#D8B86A]'
                : 'bg-[rgba(19,34,58,0.8)] border-[rgba(201,155,88,0.4)] text-[#C99B58]'
            )}
          >
            <Film className="w-9 h-9" />
          </div>
          <div
            className={cn(
              'absolute -bottom-1 -right-1 w-8 h-8 rounded-full border flex items-center justify-center shadow-md',
              isLetterArchive
                ? 'bg-[#7A2E3B] text-[#FAF6F0] border-[#FAF6F0]'
                : isScrapbook
                ? 'bg-[#D8B86A] text-[#0A160D] border-[#0A160D]'
                : 'bg-[#C99B58] text-[#070E1A] border-[#070E1A]'
            )}
          >
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-semibold tracking-wider uppercase border opacity-90">
            <Sparkles className="w-3.5 h-3.5" />
            Behind The Scenes
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
            Not yet.
          </h1>
          <p className="text-sm sm:text-base opacity-80 max-w-md mx-auto leading-relaxed">
            The behind-the-scenes archive opens{' '}
            <strong className="font-semibold underline underline-offset-4 decoration-amber-500/50">
              October 4, 2026
            </strong>
            .
          </p>
        </div>

        {/* Countdown Timer Display */}
        <div
          className={cn(
            'grid grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border max-w-md mx-auto',
            isLetterArchive
              ? 'bg-[#EDE4DC]/80 border-[rgba(138,110,89,0.25)]'
              : isScrapbook
              ? 'bg-[rgba(20,38,25,0.7)] border-[rgba(216,184,106,0.25)]'
              : 'bg-[rgba(15,26,46,0.7)] border-[rgba(201,155,88,0.25)]'
          )}
        >
          <div className="space-y-1">
            <span className="block text-xl sm:text-2xl font-serif font-bold tracking-tight">
              {timeLeft.days}
            </span>
            <span className="block text-[10px] sm:text-xs uppercase tracking-wider opacity-75 font-sans">
              Days
            </span>
          </div>
          <div className="space-y-1">
            <span className="block text-xl sm:text-2xl font-serif font-bold tracking-tight">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="block text-[10px] sm:text-xs uppercase tracking-wider opacity-75 font-sans">
              Hours
            </span>
          </div>
          <div className="space-y-1">
            <span className="block text-xl sm:text-2xl font-serif font-bold tracking-tight">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="block text-[10px] sm:text-xs uppercase tracking-wider opacity-75 font-sans">
              Mins
            </span>
          </div>
          <div className="space-y-1">
            <span className="block text-xl sm:text-2xl font-serif font-bold tracking-tight">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="block text-[10px] sm:text-xs uppercase tracking-wider opacity-75 font-sans">
              Secs
            </span>
          </div>
        </div>

        <p className="text-xs opacity-65 italic">
          Candid outtakes, studio recordings, design scraps, and bloopers are being carefully curated under lock and key.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-center">
          <Link
            to={ROUTES.HOME}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-serif font-medium transition-all shadow-sm cursor-pointer',
              isLetterArchive
                ? 'bg-[#7A2E3B] text-[#FFF9F0] hover:bg-[#63242F]'
                : isScrapbook
                ? 'bg-[#D8B86A] text-[#0A160D] hover:bg-[#C9A859]'
                : 'bg-[#C99B58] text-[#070E1A] hover:bg-[#B58A47]'
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Starlit Letters
          </Link>
        </div>
      </div>
    </div>
  );
};
