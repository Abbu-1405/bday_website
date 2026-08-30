import React, { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

export interface AnimatedProgressNumberProps {
  value: number;
  duration?: number;
  precision?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * AnimatedProgressNumber
 * Smoothly transitions displayed progress numbers over a subtle easing duration (250–400ms).
 * Handles rapid updates by converging directly from the current interpolated value to the new target.
 * Respects prefers-reduced-motion by updating immediately without easing.
 */
export const AnimatedProgressNumber: React.FC<AnimatedProgressNumberProps> = ({
  value,
  duration = 300,
  precision = 0,
  prefix = '',
  suffix = '',
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(value);
  const currentValRef = useRef<number>(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // If reduced motion is requested or value matches current, update directly
    if (shouldReduceMotion) {
      currentValRef.current = value;
      setDisplayValue(value);
      return;
    }

    if (currentValRef.current === value) {
      return;
    }

    const startVal = currentValRef.current;
    const endVal = value;
    const startTime = performance.now();

    // Ease-out cubic curve for elegant, restrained, and cinematic feel
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      const current = startVal + (endVal - startVal) * eased;
      currentValRef.current = current;

      if (precision === 0) {
        setDisplayValue(Math.round(current));
      } else {
        const factor = Math.pow(10, precision);
        setDisplayValue(Math.round(current * factor) / factor);
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        currentValRef.current = endVal;
        setDisplayValue(endVal);
        rafRef.current = null;
      }
    };

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [value, duration, precision, shouldReduceMotion]);

  const formattedValue =
    precision === 0
      ? Math.round(displayValue)
      : displayValue.toFixed(precision);

  return (
    <span className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};
