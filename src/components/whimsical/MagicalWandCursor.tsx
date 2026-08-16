import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../hooks';
import purpleWandIcon from '../../assets/icons/purple_magic_wand_animated.webp';

export const MagicalWandCursor: React.FC = () => {
  const { theme } = useTheme();
  const isWhimsical = theme === 'whimsical-scrapbook';

  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  // Check pointer capability (mouse vs touch) & system preferences
  useEffect(() => {
    const finePointerQuery = window.matchMedia('(pointer: fine)');
    setIsFinePointer(finePointerQuery.matches);

    const handlePointerChange = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches);
    };

    finePointerQuery.addEventListener('change', handlePointerChange);
    return () => {
      finePointerQuery.removeEventListener('change', handlePointerChange);
    };
  }, []);

  // Update cursor position directly via translate3d only when mouse moves
  useEffect(() => {
    if (!isWhimsical || !isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) {
        setIsVisible(true);
      }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isWhimsical, isFinePointer, isVisible]);

  // Only activate for Whimsical theme on fine pointer devices
  if (!isWhimsical || !isFinePointer) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      id="whimsical-magical-wand-cursor"
      className={`fixed top-0 left-0 pointer-events-none z-[99999] select-none transition-opacity duration-150 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transform: 'translate3d(-100px, -100px, 0)',
        willChange: 'transform',
      }}
      aria-hidden="true"
    >
      <img
        src={purpleWandIcon}
        alt=""
        width={44}
        height={44}
        className="w-[44px] h-[44px] object-contain pointer-events-none select-none block drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
        draggable={false}
      />
    </div>
  );
};
