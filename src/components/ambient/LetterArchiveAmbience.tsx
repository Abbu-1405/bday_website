import React from 'react';

interface DustMote {
  id: string;
  top: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
  driftType: 'a' | 'b';
  opacity: number;
}

// Deterministic particle coordinates & timings (no random re-renders)
const LETTER_ARCHIVE_MOTES: DustMote[] = [
  { id: 'lam-1', top: '18%', left: '22%', size: 2.5, duration: '19s', delay: '0s', driftType: 'a', opacity: 0.28 },
  { id: 'lam-2', top: '35%', left: '78%', size: 3, duration: '23s', delay: '3.5s', driftType: 'b', opacity: 0.32 },
  { id: 'lam-3', top: '62%', left: '15%', size: 2, duration: '17s', delay: '7s', driftType: 'a', opacity: 0.22 },
  { id: 'lam-4', top: '78%', left: '68%', size: 2.5, duration: '21s', delay: '1.5s', driftType: 'b', opacity: 0.26 },
  { id: 'lam-5', top: '48%', left: '42%', size: 3, duration: '25s', delay: '9s', driftType: 'a', opacity: 0.3 },
  { id: 'lam-6', top: '85%', left: '30%', size: 2, duration: '18s', delay: '5s', driftType: 'b', opacity: 0.2 },
  { id: 'lam-7', top: '25%', left: '88%', size: 2.5, duration: '22s', delay: '11s', driftType: 'a', opacity: 0.25 },
];

/**
 * Letter Archive Ambient Atmosphere
 * Extremely subtle warm light movement and gentle drifting archival dust motes
 * over static aged parchment.
 */
export const LetterArchiveAmbience: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Subtle, slow warm ambient light breathing across the upper desk / parchment */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[850px] h-[650px] rounded-full ambient-glow-breathe pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(245, 230, 200, 0.14) 0%, rgba(220, 185, 140, 0.06) 50%, transparent 75%)',
        }}
      />

      {/* 2. Microscopic warm dust motes gently drifting in ambient light */}
      {LETTER_ARCHIVE_MOTES.map((mote) => (
        <span
          key={mote.id}
          className={`absolute rounded-full transform-gpu ${
            mote.driftType === 'a' ? 'ambient-dust-drift-a' : 'ambient-dust-drift-b'
          }`}
          style={
            {
              top: mote.top,
              left: mote.left,
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              backgroundColor: '#D4A373',
              boxShadow: '0 0 4px rgba(212, 163, 115, 0.4)',
              '--drift-duration': mote.duration,
              '--drift-delay': mote.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
