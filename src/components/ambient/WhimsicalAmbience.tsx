import React from 'react';

interface ScrapbookFiber {
  id: string;
  top: string;
  left: string;
  width: number;
  height: number;
  duration: string;
  delay: string;
  color: string;
  borderRadius: string;
  type: 'sway' | 'driftA' | 'driftB';
}

const WHIMSICAL_FIBERS: ScrapbookFiber[] = [
  { id: 'wf-1', top: '22%', left: '16%', width: 3, height: 2, duration: '15s', delay: '0s', color: '#D8B86A', borderRadius: '40%', type: 'sway' },
  { id: 'wf-2', top: '38%', left: '84%', width: 2.5, height: 2.5, duration: '19s', delay: '3.2s', color: '#6F8D62', borderRadius: '50%', type: 'driftA' },
  { id: 'wf-3', top: '65%', left: '24%', width: 2, height: 3, duration: '17s', delay: '6.5s', color: '#E6A0C4', borderRadius: '35%', type: 'sway' },
  { id: 'wf-4', top: '76%', left: '76%', width: 3, height: 2, duration: '21s', delay: '1.8s', color: '#D8B86A', borderRadius: '50%', type: 'driftB' },
  { id: 'wf-5', top: '48%', left: '55%', width: 2, height: 2, duration: '16s', delay: '8.4s', color: '#6F8D62', borderRadius: '50%', type: 'driftA' },
  { id: 'wf-6', top: '15%', left: '70%', width: 2.5, height: 2.5, duration: '22s', delay: '4.7s', color: '#E6A0C4', borderRadius: '40%', type: 'driftB' },
];

/**
 * Whimsical Scrapbook Ambient Atmosphere
 * Gentle handmade-paper atmosphere with drifting tiny paper fibers,
 * organic dust, and warm starlight glow over enchanted forest artwork.
 */
export const WhimsicalAmbience: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Subtle warm starlight glow breathing over the upper hero area */}
      <div
        className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[750px] h-[500px] rounded-full ambient-glow-breathe pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(216, 184, 106, 0.08) 0%, rgba(79, 107, 72, 0.04) 50%, transparent 70%)',
        }}
      />

      {/* 2. Microscopic handmade paper fibers & scrapbook dust */}
      {WHIMSICAL_FIBERS.map((fiber) => {
        let animationClass = 'ambient-fiber-sway';
        if (fiber.type === 'driftA') animationClass = 'ambient-dust-drift-a';
        if (fiber.type === 'driftB') animationClass = 'ambient-dust-drift-b';

        return (
          <span
            key={fiber.id}
            className={`absolute transform-gpu ${animationClass}`}
            style={
              {
                top: fiber.top,
                left: fiber.left,
                width: `${fiber.width}px`,
                height: `${fiber.height}px`,
                backgroundColor: fiber.color,
                borderRadius: fiber.borderRadius,
                boxShadow: `0 0 3px ${fiber.color}40`,
                '--sway-duration': fiber.duration,
                '--sway-delay': fiber.delay,
                '--drift-duration': fiber.duration,
                '--drift-delay': fiber.delay,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
};
