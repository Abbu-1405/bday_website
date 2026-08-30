import React, { useRef, useEffect } from 'react';
import { Volume2, VolumeX, SlidersHorizontal, Music } from 'lucide-react';
import { useAudio, AMBIENT_TRACKS } from '../contexts';
import { cn } from '../utils';

export interface AudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPlaying?: boolean;
  onToggle?: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  isFloating?: boolean;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  isPlaying: externalIsPlaying,
  onToggle: externalOnToggle,
  label,
  size = 'md',
  isFloating = false,
  className,
  ...props
}) => {
  const {
    isPlaying: contextIsPlaying,
    volume,
    currentTrack,
    isMixerOpen,
    togglePlay,
    setVolume,
    setTrack,
    toggleMixer,
    closeMixer,
  } = useAudio();

  const isControlled = externalIsPlaying !== undefined;
  const isPlaying = isControlled ? externalIsPlaying : contextIsPlaying;
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        closeMixer();
      }
    };
    if (isMixerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMixerOpen, closeMixer]);

  const handleToggle = () => {
    if (externalOnToggle) {
      externalOnToggle();
    } else {
      togglePlay();
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs gap-1.5 rounded-full',
    md: 'h-10 px-3.5 text-sm gap-2 rounded-full',
    lg: 'h-12 px-4.5 text-base gap-2.5 rounded-full',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const isStatic = className?.includes('static');

  return (
    <div
      ref={popoverRef}
      className={cn(
        !isStatic && isFloating && 'fixed top-4 right-16 z-40',
        'relative inline-block',
        className
      )}
    >
      <div className="flex items-center">
        {/* Main Mute / Play Audio Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'inline-flex items-center justify-center font-medium border border-[var(--color-border)] bg-[var(--color-card)]/90 backdrop-blur-md text-[var(--color-text)] hover:bg-[var(--color-surface)] shadow-[var(--shadow-soft)] transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-out cursor-pointer rounded-l-full [@media(hover:hover)]:hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 motion-reduce:transform-none',
            isPlaying && 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-card)]',
            !isFloating && sizeClasses[size],
            (isFloating || isStatic) && 'h-10 px-3 justify-center gap-1.5',
            className
          )}
          aria-label={label || (isPlaying ? 'Mute ambient sound' : 'Unmute ambient sound')}
          title={label || (isPlaying ? 'Mute ambient sound (Playing)' : 'Unmute ambient sound (Muted)')}
          {...props}
        >
          {isPlaying ? (
            <Volume2 className={cn(iconSizes[size], 'animate-pulse text-[var(--color-primary)] shrink-0')} />
          ) : (
            <VolumeX className={cn(iconSizes[size], 'text-[var(--color-muted)] shrink-0')} />
          )}
          <span className="text-xs font-serif font-medium hidden sm:inline">
            {isPlaying ? 'Mute' : 'Play'}
          </span>
          {label && <span>{label}</span>}
        </button>

        {/* Mixer Trigger */}
        <button
          type="button"
          onClick={toggleMixer}
          aria-expanded={isMixerOpen}
          aria-label="Audio Mixer & Track Settings"
          title="Audio Mixer & Track Settings"
          className={cn(
            'flex items-center justify-center h-10 w-8 rounded-r-full border-y border-r border-[var(--color-border)] bg-[var(--color-card)]/90 backdrop-blur-md text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] shadow-[var(--shadow-soft)] transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-out cursor-pointer [@media(hover:hover)]:hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 motion-reduce:transform-none',
            isPlaying && 'border-r-[var(--color-primary)] border-y-[var(--color-primary)]'
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Hidden-by-default Audio Mixer Popover */}
      {isMixerOpen && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-[var(--radius-xl)] bg-[var(--color-card)]/95 backdrop-blur-md border border-[var(--color-border)] p-3.5 shadow-[var(--shadow-lg)] z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150"
          role="region"
          aria-label="Audio Mixer Controls"
        >
          {/* Header & Quick Mute Toggle */}
          <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[var(--color-text)]">
              <Music className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              <span>Ambient Soundscape</span>
            </div>

            <button
              type="button"
              onClick={togglePlay}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-serif font-medium transition-[transform,background-color,border-color,color] duration-150 ease-out cursor-pointer border active:scale-95',
                isPlaying
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-[var(--color-surface-secondary)] text-[var(--color-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
              )}
              title={isPlaying ? 'Click to Mute' : 'Click to Play'}
            >
              {isPlaying ? (
                <>
                  <Volume2 className="h-3 w-3 animate-pulse" />
                  <span>Playing (Mute)</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3 w-3" />
                  <span>Muted (Play)</span>
                </>
              )}
            </button>
          </div>

          {/* Volume Control Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-serif text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1 font-medium">
                {volume === 0 || !isPlaying ? (
                  <VolumeX className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                )}
                Volume
              </span>
              <span className="font-mono text-[11px] font-semibold text-[var(--color-text)]">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-[var(--color-primary)] cursor-pointer h-1.5 bg-[var(--color-surface-secondary)] rounded-lg"
              aria-label="Ambient volume slider"
            />
          </div>

          {/* Track Selection */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-serif text-[var(--color-muted)] font-semibold uppercase tracking-wider">
              Soundscape Melody
            </span>
            <div className="space-y-1">
              {AMBIENT_TRACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTrack(t.id)}
                  className={cn(
                    'w-full text-left p-2 rounded-[var(--radius-lg)] text-xs font-serif transition-[transform,background-color,color] duration-150 ease-out cursor-pointer flex flex-col active:scale-[0.985] motion-reduce:transform-none',
                    currentTrack === t.id
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                  )}
                >
                  <span className="font-medium">{t.label}</span>
                  <span
                    className={cn(
                      'text-[10px] font-sans font-normal mt-0.5',
                      currentTrack === t.id
                        ? 'text-[var(--color-primary-foreground)]/80'
                        : 'text-[var(--color-muted)]'
                    )}
                  >
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
