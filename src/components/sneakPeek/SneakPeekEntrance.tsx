import React, { useState, useEffect, useCallback } from 'react';
import { SneakPeekLanding } from './SneakPeekLanding';
import { SneakPeekLetter } from './SneakPeekLetter';
import { userTrackingService } from '../../services/userTrackingService';

export const SNEAK_PEEK_SKIPPED_STORAGE_KEY = 'starlit_sneak_peek_skipped';

interface SneakPeekEntranceProps {
  onComplete: () => void;
  /**
   * If true, forces the letter to open directly (useful for the dedicated /sneak-peek route)
   */
  initialMode?: 'landing' | 'letter';
}

export const SneakPeekEntrance: React.FC<SneakPeekEntranceProps> = ({
  onComplete,
  initialMode = 'landing',
}) => {
  const [phase, setPhase] = useState<'landing' | 'opening' | 'letter' | 'closing'>(
    initialMode
  );
  const [isDismissing, setIsDismissing] = useState<boolean>(false);

  // Track entrance view on mount
  useEffect(() => {
    userTrackingService.trackSneakPeek('viewed');
  }, []);

  // Check if reduced motion is preferred
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleOpenLetter = useCallback(() => {
    setPhase('opening');
    const timer = setTimeout(() => {
      setPhase('letter');
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleSkip = useCallback(() => {
    userTrackingService.trackSneakPeek('skipped');
    try {
      // Record skip state to localStorage
      localStorage.setItem(SNEAK_PEEK_SKIPPED_STORAGE_KEY, new Date().toISOString());
    } catch {
      // Safely ignore private browsing quota errors
    }

    setIsDismissing(true);
    const duration = prefersReducedMotion ? 50 : 400;
    const timer = setTimeout(() => {
      onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [onComplete, prefersReducedMotion]);

  const handleGetStarted = useCallback(() => {
    userTrackingService.trackSneakPeek('completed');
    setPhase('closing');
    setIsDismissing(true);
    const duration = prefersReducedMotion ? 50 : 700;
    const timer = setTimeout(() => {
      onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [onComplete, prefersReducedMotion]);

  // Handle escape key to skip gracefully
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase === 'landing') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleSkip]);

  return (
    <div
      id="sneak-peek-entrance-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Sneak a Peek Welcome Entrance"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-500 select-none ${
        isDismissing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 
        Clean, Restrained Vintage Paper Background
        Subtle neutral aged paper texture with soft atmospheric lighting that never competes with the letter
      */}
      <div
        className="absolute inset-0 bg-[#ECE5DB]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 50% 40%, #F5EFEB 0%, #E8DFD3 75%, #DDD2C4 100%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Extremely subtle paper grain / crease texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-h-screen flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {phase === 'landing' || phase === 'opening' ? (
          <SneakPeekLanding
            onOpenLetter={handleOpenLetter}
            onSkip={handleSkip}
            isOpening={phase === 'opening'}
          />
        ) : (
          <SneakPeekLetter
            onGetStarted={handleGetStarted}
            isClosing={phase === 'closing'}
          />
        )}
      </div>
    </div>
  );
};
