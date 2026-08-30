/**
 * High-Performance Scroll Focus Engine for Starlit Letters
 * 
 * Provides a continuous, scroll-position-based focus, scale, blur, and opacity
 * transformation for content cards as they approach the center focus zone of the viewport.
 * 
 * Performance & Architecture:
 * - Operates entirely through direct DOM style mutations via requestAnimationFrame.
 * - ZERO React state re-renders during scrolling.
 * - Singleton scroll & resize listeners with passive event options.
 * - IntersectionObserver to only compute and apply styles to elements in/near the viewport.
 * - Full support for `prefers-reduced-motion: reduce`.
 * - Clean cleanup on unmount.
 */

export interface ScrollFocusOptions {
  minScale?: number;
  maxBlur?: number; // in px
  minOpacity?: number;
  focusZoneFraction?: number; // central fraction of viewport considered in 100% focus
  transitionDistanceFraction?: number; // fraction of viewport over which interpolation occurs
  disabled?: boolean;
}

interface TrackedElement {
  element: HTMLElement;
  options: Required<ScrollFocusOptions>;
  isIntersecting: boolean;
}

class ScrollFocusEngine {
  private items = new Map<HTMLElement, TrackedElement>();
  private isTicking = false;
  private observer: IntersectionObserver | null = null;
  private reducedMotionMediaQuery: MediaQueryList | null = null;
  private isReducedMotion = false;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initReducedMotion();
      this.initObserver();
    }
  }

  private initReducedMotion() {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    this.reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = this.reducedMotionMediaQuery.matches;

    try {
      this.reducedMotionMediaQuery.addEventListener('change', (e) => {
        this.isReducedMotion = e.matches;
        if (this.isReducedMotion) {
          this.resetAllElements();
        } else {
          this.requestTick();
        }
      });
    } catch {
      // Fallback for older Safari/browsers
      this.reducedMotionMediaQuery.addListener?.((e) => {
        this.isReducedMotion = e.matches;
        if (this.isReducedMotion) {
          this.resetAllElements();
        } else {
          this.requestTick();
        }
      });
    }
  }

  private initObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        let shouldTick = false;
        for (const entry of entries) {
          const item = this.items.get(entry.target as HTMLElement);
          if (item) {
            item.isIntersecting = entry.isIntersecting;
            if (entry.isIntersecting) {
              shouldTick = true;
            }
          }
        }
        if (shouldTick) {
          this.requestTick();
        }
      },
      {
        root: null,
        rootMargin: '100px 0px 100px 0px',
        threshold: 0,
      }
    );
  }

  private startListeners() {
    if (this.isListening || typeof window === 'undefined') return;
    this.isListening = true;

    window.addEventListener('scroll', this.handleScrollOrResize, { passive: true });
    window.addEventListener('resize', this.handleScrollOrResize, { passive: true });
    window.addEventListener('orientationchange', this.handleScrollOrResize, { passive: true });
  }

  private stopListeners() {
    if (!this.isListening || typeof window === 'undefined') return;
    this.isListening = false;

    window.removeEventListener('scroll', this.handleScrollOrResize);
    window.removeEventListener('resize', this.handleScrollOrResize);
    window.removeEventListener('orientationchange', this.handleScrollOrResize);
  }

  private handleScrollOrResize = () => {
    this.requestTick();
  };

  public requestTick() {
    if (this.isTicking || this.isReducedMotion) return;
    this.isTicking = true;
    requestAnimationFrame(this.updateAll);
  }

  private updateAll = () => {
    this.isTicking = false;
    if (this.isReducedMotion || typeof window === 'undefined') return;

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
    const viewportCenterY = viewportHeight / 2;

    this.items.forEach((item) => {
      if (!item.isIntersecting || item.options.disabled) {
        return;
      }

      this.updateItem(item, viewportHeight, viewportCenterY);
    });
  };

  private updateItem(item: TrackedElement, viewportHeight: number, viewportCenterY: number) {
    const { element, options } = item;
    const rect = element.getBoundingClientRect();

    // Quick cull if totally off-screen
    if (rect.bottom < -50 || rect.top > viewportHeight + 50) {
      return;
    }

    const elementCenterY = rect.top + rect.height / 2;
    const distFromCenter = Math.abs(elementCenterY - viewportCenterY);

    // Focus zone around the center portion of viewport (generous, comfortable zone)
    const focusZoneRadius = (viewportHeight * options.focusZoneFraction) / 2;
    const transitionDistance = viewportHeight * options.transitionDistanceFraction;

    let progress: number;
    if (distFromCenter <= focusZoneRadius) {
      progress = 1.0;
    } else {
      const outsideDist = distFromCenter - focusZoneRadius;
      const linearFactor = Math.min(1.0, Math.max(0.0, outsideDist / transitionDistance));
      const linearProgress = 1.0 - linearFactor;
      // Smooth continuous S-curve (cosine easing)
      progress = 0.5 * (1.0 - Math.cos(Math.PI * linearProgress));
    }

    // Continuous calculations based on exact position
    const scale = options.minScale + (1.0 - options.minScale) * progress;
    const blur = options.maxBlur * (1.0 - progress);
    const opacity = options.minOpacity + (1.0 - options.minOpacity) * progress;

    // Apply direct style updates for zero reflow/repaint bottlenecks
    if (progress >= 0.998) {
      element.style.transform = 'none';
      element.style.filter = 'none';
      element.style.opacity = '1';
    } else {
      element.style.transform = `scale(${scale.toFixed(4)}) translateZ(0)`;
      element.style.filter = `blur(${blur.toFixed(2)}px)`;
      element.style.opacity = opacity.toFixed(3);
    }
  }

  private resetElement(element: HTMLElement) {
    element.style.transform = '';
    element.style.filter = '';
    element.style.opacity = '';
  }

  private resetAllElements() {
    this.items.forEach((item) => {
      this.resetElement(item.element);
    });
  }

  public register(element: HTMLElement, customOptions?: ScrollFocusOptions) {
    if (!element) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    const resolvedOptions: Required<ScrollFocusOptions> = {
      minScale: customOptions?.minScale ?? (isMobile ? 0.96 : 0.95),
      maxBlur: customOptions?.maxBlur ?? (isMobile ? 3.5 : 4.0),
      minOpacity: customOptions?.minOpacity ?? (isMobile ? 0.80 : 0.75),
      focusZoneFraction: customOptions?.focusZoneFraction ?? 0.32,
      transitionDistanceFraction: customOptions?.transitionDistanceFraction ?? 0.38,
      disabled: customOptions?.disabled ?? false,
    };

    const trackedItem: TrackedElement = {
      element,
      options: resolvedOptions,
      isIntersecting: true, // assume true until observer evaluates
    };

    this.items.set(element, trackedItem);

    if (this.observer) {
      this.observer.observe(element);
    }

    if (this.items.size === 1) {
      this.startListeners();
    }

    // Set hardware acceleration hints on element
    element.style.transformOrigin = 'center center';
    element.style.backfaceVisibility = 'hidden';

    // Initial positioning calculation
    this.requestTick();
  }

  public updateOptions(element: HTMLElement, customOptions?: ScrollFocusOptions) {
    const item = this.items.get(element);
    if (!item) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    item.options = {
      minScale: customOptions?.minScale ?? item.options.minScale ?? (isMobile ? 0.96 : 0.95),
      maxBlur: customOptions?.maxBlur ?? item.options.maxBlur ?? (isMobile ? 3.5 : 4.0),
      minOpacity: customOptions?.minOpacity ?? item.options.minOpacity ?? (isMobile ? 0.80 : 0.75),
      focusZoneFraction: customOptions?.focusZoneFraction ?? item.options.focusZoneFraction ?? 0.32,
      transitionDistanceFraction:
        customOptions?.transitionDistanceFraction ?? item.options.transitionDistanceFraction ?? 0.38,
      disabled: customOptions?.disabled ?? false,
    };

    if (item.options.disabled || this.isReducedMotion) {
      this.resetElement(element);
    } else {
      this.requestTick();
    }
  }

  public unregister(element: HTMLElement) {
    if (!element) return;

    if (this.observer) {
      this.observer.unobserve(element);
    }

    this.resetElement(element);
    this.items.delete(element);

    if (this.items.size === 0) {
      this.stopListeners();
    }
  }
}

export const scrollFocusEngine = new ScrollFocusEngine();
