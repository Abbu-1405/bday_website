import React, { useRef, useEffect } from 'react';
import { scrollFocusEngine, ScrollFocusOptions } from '../../services/scrollFocusEngine';
import { cn } from '../../utils';

export interface ScrollFocusRevealProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ScrollFocusOptions {
  children: React.ReactNode;
  as?: React.ElementType;
}

/**
 * ScrollFocusReveal
 * 
 * Reusable component wrapping scrollable cards/content items.
 * Continuously scales, focuses (de-blurs), and fades in items as they enter the
 * viewport center focus area, and smoothly reverses the effect when leaving.
 * 
 * Operates purely via direct GPU-accelerated DOM style updates (zero React state overhead).
 */
export const ScrollFocusReveal = React.forwardRef<HTMLDivElement, ScrollFocusRevealProps>(
  (
    {
      children,
      className,
      as: Component = 'div',
      minScale,
      maxBlur,
      minOpacity,
      focusZoneFraction,
      transitionDistanceFraction,
      disabled = false,
      style,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLDivElement | null>(null);

    // Merge internal and forwarded refs
    const setRefs = (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    useEffect(() => {
      const element = internalRef.current;
      if (!element) return;

      scrollFocusEngine.register(element, {
        minScale,
        maxBlur,
        minOpacity,
        focusZoneFraction,
        transitionDistanceFraction,
        disabled,
      });

      return () => {
        scrollFocusEngine.unregister(element);
      };
    }, []);

    useEffect(() => {
      const element = internalRef.current;
      if (!element) return;

      scrollFocusEngine.updateOptions(element, {
        minScale,
        maxBlur,
        minOpacity,
        focusZoneFraction,
        transitionDistanceFraction,
        disabled,
      });
    }, [
      minScale,
      maxBlur,
      minOpacity,
      focusZoneFraction,
      transitionDistanceFraction,
      disabled,
    ]);

    return (
      <Component
        ref={setRefs}
        className={cn(
          'scroll-focus-reveal relative will-change-[transform,filter,opacity]',
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

ScrollFocusReveal.displayName = 'ScrollFocusReveal';
