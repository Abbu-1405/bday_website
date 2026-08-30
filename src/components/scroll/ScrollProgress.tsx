import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export interface ScrollProgressProps {
  className?: string;
}

/**
  * ScrollProgress
  * 
  * Reusable, high-performance scroll progress indicator.
  * Sits at the very top edge of the viewport (fixed, 2px height, pointer-events-none).
  * Direct GPU-accelerated style updates via scaleX (zero continuous React re-renders).
  * Smoothly coordinates colors with the active theme and hides on non-scrollable pages.
  */
export const ScrollProgress: React.FC<ScrollProgressProps> = ({ className }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const updateProgressRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let rafId: number | null = null;
    let lastProgress = -1;
    let isVisible = false;

    const updateProgress = () => {
      const doc = document.documentElement;
      const body = document.body;

      const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
      const scrollHeight = Math.max(doc.scrollHeight, body.scrollHeight, 0);
      const clientHeight = doc.clientHeight || window.innerHeight || 0;

      const maxScroll = scrollHeight - clientHeight;

      // If page has no scrollable headroom, gracefully hide the progress indicator
      if (maxScroll <= 6) {
        if (isVisible && containerRef.current) {
          containerRef.current.style.opacity = '0';
          isVisible = false;
        }
        return;
      }

      const rawProgress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      // Round to 4 decimal places to prevent sub-pixel jitter
      const progress = Math.round(rawProgress * 10000) / 10000;

      if (containerRef.current && !isVisible) {
        containerRef.current.style.opacity = '1';
        isVisible = true;
      }

      if (barRef.current && progress !== lastProgress) {
        barRef.current.style.transform = `scaleX(${progress})`;
        lastProgress = progress;
      }
    };

    updateProgressRef.current = updateProgress;

    const onScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          updateProgress();
          rafId = null;
        });
      }
    };

    const onResize = () => {
      updateProgress();
    };

    // Calculate initial position on mount
    updateProgress();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Handle dynamic DOM/content resizing across routes or loaded data
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateProgress();
      });
      resizeObserver.observe(document.body);
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // Recalculate progress on route navigation
  useEffect(() => {
    if (updateProgressRef.current) {
      updateProgressRef.current();
      const timer = setTimeout(() => {
        if (updateProgressRef.current) {
          updateProgressRef.current();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none select-none transition-opacity duration-300 ${
        className || ''
      }`}
      style={{ opacity: 0 }}
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full w-full bg-[var(--scroll-progress-color,var(--color-accent))] origin-left will-change-transform transition-[background-color] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
        style={{
          transform: 'scaleX(0)',
        }}
      />
    </div>
  );
};
