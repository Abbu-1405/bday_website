import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../utils';

export interface CrossFadeImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  durationMs?: number;
}

/**
 * CrossFadeImage
 * Renders an image with a subtle 150ms opacity cross-fade when the `src` prop changes.
 * Avoids layout shifts by overlapping outgoing and incoming images in a single CSS grid cell.
 * Prevents white/blank flashes by retaining the previous image until the new image finishes loading.
 */
export const CrossFadeImage: React.FC<CrossFadeImageProps> = ({
  src,
  alt = '',
  className,
  containerClassName,
  durationMs = 150,
  loading = 'lazy',
  referrerPolicy = 'no-referrer',
  onLoad,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [outgoingSrc, setOutgoingSrc] = useState<string | null>(null);
  const [isIncomingLoaded, setIsIncomingLoaded] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevSrcRef = useRef(src);

  useEffect(() => {
    if (src !== prevSrcRef.current) {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }

      // Store the previous image to crossfade out from
      setOutgoingSrc(prevSrcRef.current);
      setCurrentSrc(src);
      setIsIncomingLoaded(false);
      setIsFading(true);
      prevSrcRef.current = src;
    }
  }, [src]);

  const handleIncomingLoad = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setIsIncomingLoaded(true);
    if (onLoad) {
      onLoad(e);
    }

    if (outgoingSrc) {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }
      cleanupTimerRef.current = setTimeout(() => {
        setOutgoingSrc(null);
        setIsFading(false);
      }, durationMs);
    }
  };

  useEffect(() => {
    return () => {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }
    };
  }, []);

  // When no transition is active, render a standard img element directly
  if (!outgoingSrc) {
    return (
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        referrerPolicy={referrerPolicy}
        className={className}
        onLoad={onLoad}
        {...props}
      />
    );
  }

  // During transition, use a single CSS grid cell (col-start-1 row-start-1) to perfectly align layers
  return (
    <div
      className={cn(
        'grid grid-cols-1 grid-rows-1 relative w-full h-full items-center justify-center',
        containerClassName
      )}
    >
      {/* Outgoing Image (Layer 1 - fades out) */}
      <img
        src={outgoingSrc}
        alt={alt}
        aria-hidden="true"
        referrerPolicy={referrerPolicy}
        className={cn(
          className,
          'col-start-1 row-start-1 pointer-events-none transition-opacity ease-out',
          isIncomingLoaded && isFading ? 'opacity-0' : 'opacity-100'
        )}
        style={{
          transitionDuration: `${durationMs}ms`,
        }}
      />

      {/* Incoming Image (Layer 2 - fades in) */}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        referrerPolicy={referrerPolicy}
        onLoad={handleIncomingLoad}
        className={cn(
          className,
          'col-start-1 row-start-1 transition-opacity ease-out',
          isIncomingLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          transitionDuration: `${durationMs}ms`,
        }}
        {...props}
      />
    </div>
  );
};
