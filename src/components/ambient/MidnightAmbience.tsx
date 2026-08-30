import React from 'react';

interface CelestialStar {
  id: string;
  top: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
  color: string;
  glowColor: string;
}

interface StardustMote {
  id: string;
  top: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
  driftType: 'a' | 'b';
}

const MIDNIGHT_STARS: CelestialStar[] = [
  { id: 'ms-1', top: '14%', left: '18%', size: 2.5, duration: '4.5s', delay: '0s', color: '#F4D18A', glowColor: 'rgba(244, 209, 138, 0.45)' },
  { id: 'ms-2', top: '22%', left: '82%', size: 3, duration: '6s', delay: '1.8s', color: '#E2BD78', glowColor: 'rgba(226, 189, 120, 0.5)' },
  { id: 'ms-3', top: '42%', left: '12%', size: 2, duration: '5.2s', delay: '3.1s', color: '#BAE6FD', glowColor: 'rgba(186, 230, 253, 0.4)' },
  { id: 'ms-4', top: '58%', left: '92%', size: 2.5, duration: '6.8s', delay: '0.8s', color: '#FFFDF7', glowColor: 'rgba(255, 253, 247, 0.5)' },
  { id: 'ms-5', top: '72%', left: '26%', size: 2, duration: '4.8s', delay: '2.5s', color: '#F4D18A', glowColor: 'rgba(244, 209, 138, 0.35)' },
  { id: 'ms-6', top: '28%', left: '48%', size: 3, duration: '7.5s', delay: '4.2s', color: '#BAE6FD', glowColor: 'rgba(186, 230, 253, 0.45)' },
  { id: 'ms-7', top: '82%', left: '74%', size: 2, duration: '5.5s', delay: '1.2s', color: '#E2BD78', glowColor: 'rgba(226, 189, 120, 0.35)' },
  { id: 'ms-8', top: '38%', left: '68%', size: 2.5, duration: '6.2s', delay: '3.6s', color: '#FFFDF7', glowColor: 'rgba(255, 253, 247, 0.4)' },
];

const MIDNIGHT_STARDUST: StardustMote[] = [
  { id: 'sd-1', top: '20%', left: '32%', size: 2, duration: '22s', delay: '0s', driftType: 'a' },
  { id: 'sd-2', top: '48%', left: '80%', size: 2.5, duration: '26s', delay: '4s', driftType: 'b' },
  { id: 'sd-3', top: '68%', left: '16%', size: 2, duration: '20s', delay: '8s', driftType: 'a' },
  { id: 'sd-4', top: '32%', left: '62%', size: 2.5, duration: '24s', delay: '2s', driftType: 'b' },
  { id: 'sd-5', top: '84%', left: '45%', size: 2, duration: '21s', delay: '10s', driftType: 'a' },
  { id: 'sd-6', top: '12%', left: '75%', size: 2, duration: '25s', delay: '6s', driftType: 'b' },
];

/**
 * Midnight Journal Ambient Atmosphere
 * Quiet night atmosphere with slowly twinkling stars, faint celestial dust,
 * and very subtle moonlit atmospheric glow.
 */
export const MidnightAmbience: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Subtle, slow celestial glow breathing in the upper atmospheric night */}
      <div
        className="absolute top-[-8%] left-[20%] w-[900px] h-[600px] rounded-full ambient-glow-breathe pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(30, 58, 138, 0.18) 0%, rgba(14, 28, 70, 0.08) 55%, transparent 75%)',
        }}
      />

      {/* 2. Delicate Celestial Twinkling Stars */}
      {MIDNIGHT_STARS.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full transform-gpu ambient-star-twinkle"
          style={
            {
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              boxShadow: `0 0 6px ${star.glowColor}`,
              '--twinkle-duration': star.duration,
              '--twinkle-delay': star.delay,
            } as React.CSSProperties
          }
        />
      ))}

      {/* 3. Faint drifting stardust particles */}
      {MIDNIGHT_STARDUST.map((dust) => (
        <span
          key={dust.id}
          className={`absolute rounded-full transform-gpu ${
            dust.driftType === 'a' ? 'ambient-dust-drift-a' : 'ambient-dust-drift-b'
          }`}
          style={
            {
              top: dust.top,
              left: dust.left,
              width: `${dust.size}px`,
              height: `${dust.size}px`,
              backgroundColor: '#BAE6FD',
              boxShadow: '0 0 3px rgba(186, 230, 253, 0.35)',
              '--drift-duration': dust.duration,
              '--drift-delay': dust.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
