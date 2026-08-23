import React, { useMemo } from 'react';
import { useTheme } from '../../hooks';

interface WishesAtmosphereProps {
  className?: string;
  prefersReducedMotion?: boolean;
}

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

interface SparkMote {
  id: number;
  bottom: number;
  left: number;
  size: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
}

export const WishesAtmosphere: React.FC<WishesAtmosphereProps> = ({
  className = '',
  prefersReducedMotion = false,
}) => {
  const { theme } = useTheme();

  // Deterministic celestial stars scattered across the upper sky
  const stars: Star[] = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => {
      const top = 3 + ((i * 19 + 7) % 78);
      const left = 2 + ((i * 31 + 13) % 96);
      const size = 1 + (i % 3 === 0 ? 1.5 : 0) + (i % 7 === 0 ? 1 : 0);
      const opacity = 0.25 + (i % 5) * 0.14;
      const duration = 2.8 + (i % 4) * 1.1;
      const delay = -((i * 1.7) % 4.5);

      return {
        id: i,
        top,
        left,
        size,
        opacity,
        duration,
        delay,
      };
    });
  }, []);

  // Soft drifting golden motes / fireflies near the lower horizon
  const sparkMotes: SparkMote[] = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const bottom = 4 + ((i * 17 + 5) % 45);
      const left = 5 + ((i * 27 + 11) % 90);
      const size = 1.5 + (i % 3) * 0.8;
      const driftX = ((i % 5) - 2) * 16;
      const driftY = -45 - (i % 4) * 18;
      const duration = 8 + (i % 5) * 2.5;
      const delay = -((i * 2.3) % 8);

      return {
        id: i,
        bottom,
        left,
        size,
        driftX,
        driftY,
        duration,
        delay,
      };
    });
  }, []);

  // Theme-specific sky background, ambient mist and horizon glow
  const skyStyle = useMemo(() => {
    if (theme === 'letter-archive') {
      return {
        background:
          'radial-gradient(ellipse 90% 75% at 50% 100%, #2E1E22 0%, #221417 35%, #180D10 70%, #0F090B 100%)',
        mistGrad:
          'radial-gradient(circle, rgba(230, 185, 140, 0.18) 0%, rgba(180, 120, 90, 0.05) 50%, transparent 75%)',
        horizonGrad:
          'radial-gradient(ellipse at 50% 100%, rgba(225, 155, 80, 0.26) 0%, rgba(160, 80, 50, 0.09) 50%, transparent 80%)',
        vignette: 'inset 0 0 60px 10px rgba(15, 9, 11, 0.75)',
        starColor: '#FFF4E0',
        sparkColor: '#FFDF9E',
      };
    }
    if (theme === 'whimsical-scrapbook') {
      return {
        background:
          'radial-gradient(ellipse 90% 75% at 50% 100%, #142818 0%, #0E1E12 35%, #08130B 70%, #040A06 100%)',
        mistGrad:
          'radial-gradient(circle, rgba(180, 230, 165, 0.16) 0%, rgba(110, 175, 105, 0.04) 50%, transparent 75%)',
        horizonGrad:
          'radial-gradient(ellipse at 50% 100%, rgba(210, 225, 115, 0.22) 0%, rgba(135, 160, 65, 0.08) 50%, transparent 80%)',
        vignette: 'inset 0 0 60px 10px rgba(4, 10, 6, 0.75)',
        starColor: '#F7F6E4',
        sparkColor: '#E6F0A0',
      };
    }
    // Default: midnight-journal
    return {
      background:
        'radial-gradient(ellipse 90% 75% at 50% 100%, #1c1535 0%, #111029 35%, #0a0d20 70%, #060914 100%)',
      mistGrad:
        'radial-gradient(circle, rgba(180, 190, 240, 0.18) 0%, rgba(140, 150, 210, 0.05) 50%, transparent 75%)',
      horizonGrad:
        'radial-gradient(ellipse at 50% 100%, rgba(245, 185, 95, 0.22) 0%, rgba(180, 110, 50, 0.08) 50%, transparent 80%)',
      vignette: 'inset 0 0 60px 10px rgba(5, 7, 16, 0.7)',
      starColor: '#FFF8E7',
      sparkColor: '#FFE699',
    };
  }, [theme]);

  return (
    <div
      id="wishes-atmosphere-layer"
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 rounded-2xl sm:rounded-3xl ${className}`}
    >
      {/* 1. Deep Night Sky Radial & Linear Atmosphere */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: skyStyle.background,
        }}
      />

      {/* 2. Upper Moonlight Radiance (faint mist in top right) */}
      <div
        className="absolute -top-16 -right-16 w-96 h-96 rounded-full opacity-30"
        style={{
          background: skyStyle.mistGrad,
          filter: 'blur(32px)',
        }}
      />

      {/* 3. Distant Warm Lantern Lantern-Glow at Horizon (soft twilight haze) */}
      <div
        className="absolute -bottom-10 left-0 right-0 h-48 opacity-35"
        style={{
          background: skyStyle.horizonGrad,
          filter: 'blur(20px)',
        }}
      />

      {/* 4. Atmospheric Starfield (Twinkling distant stars) */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className={`absolute rounded-full ${
            prefersReducedMotion ? '' : 'animate-star-twinkle'
          }`}
          style={
            {
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: skyStyle.starColor,
              opacity: star.opacity,
              boxShadow: star.size > 2 ? `0 0 4px 1px ${skyStyle.starColor}` : undefined,
              '--twinkle-dur': `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* 5. Ambient Golden Spark Motes */}
      {!prefersReducedMotion &&
        sparkMotes.map((mote) => (
          <div
            key={`mote-${mote.id}`}
            className="absolute rounded-full animate-spark-drift"
            style={
              {
                bottom: `${mote.bottom}%`,
                left: `${mote.left}%`,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
                backgroundColor: skyStyle.sparkColor,
                boxShadow: `0 0 6px 2px ${skyStyle.sparkColor}`,
                '--drift-x': `${mote.driftX}px`,
                '--drift-y': `${mote.driftY}px`,
                '--spark-dur': `${mote.duration}s`,
                animationDelay: `${mote.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}

      {/* 6. Delicate Celestial Horizon Line & Vignette Framing */}
      <div
        className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
        style={{
          boxShadow: skyStyle.vignette,
        }}
      />
    </div>
  );
};
