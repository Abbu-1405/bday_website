import React, { useMemo } from 'react';

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

  return (
    <div
      id="wishes-atmosphere-layer"
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 rounded-3xl ${className}`}
    >
      {/* 1. Deep Night Sky Radial & Linear Atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 75% at 50% 100%, #1c1535 0%, #111029 35%, #0a0d20 70%, #060914 100%)
          `,
        }}
      />

      {/* 2. Upper Moonlight Radiance (faint violet-silver mist in top right) */}
      <div
        className="absolute -top-16 -right-16 w-96 h-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(180, 190, 240, 0.18) 0%, rgba(140, 150, 210, 0.05) 50%, transparent 75%)',
          filter: 'blur(32px)',
        }}
      />

      {/* 3. Distant Warm Lantern Lantern-Glow at Horizon (soft golden twilight haze) */}
      <div
        className="absolute -bottom-10 left-0 right-0 h-48 opacity-35"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(245, 185, 95, 0.22) 0%, rgba(180, 110, 50, 0.08) 50%, transparent 80%)',
          filter: 'blur(20px)',
        }}
      />

      {/* 4. Atmospheric Starfield (Twinkling distant stars) */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className={`absolute rounded-full bg-amber-100 ${
            prefersReducedMotion ? '' : 'animate-star-twinkle'
          }`}
          style={
            {
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              boxShadow: star.size > 2 ? '0 0 4px 1px rgba(255, 235, 180, 0.6)' : undefined,
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
                backgroundColor: '#FFE699',
                boxShadow: '0 0 6px 2px rgba(255, 200, 90, 0.7)',
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
        className="absolute inset-0 rounded-3xl"
        style={{
          boxShadow: 'inset 0 0 60px 10px rgba(5, 7, 16, 0.7)',
        }}
      />
    </div>
  );
};
