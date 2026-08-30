import React from 'react';
import { PawPrintMotif } from './PawPrintMotif';

export const CatBackground: React.FC = () => {
  return (
    <div
      id="cat-meme-background"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Deep Dark Charcoal Base Layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#090A0D',
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(249, 115, 22, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(234, 88, 12, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 0% 100%, rgba(245, 158, 11, 0.04) 0%, transparent 40%)
          `,
        }}
      />

      {/* Subtle Carbon Grid / Fine Noise Overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(#F97316 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Decorative Low-Opacity Paw Prints Floating in the Dark */}
      <div className="absolute top-16 left-8 sm:left-24">
        <PawPrintMotif size={36} opacity={0.04} rotation={-15} />
      </div>
      <div className="absolute top-28 left-16 sm:left-36">
        <PawPrintMotif size={28} opacity={0.03} rotation={10} />
      </div>

      <div className="absolute bottom-24 right-12 sm:right-32">
        <PawPrintMotif size={44} opacity={0.045} rotation={25} />
      </div>
      <div className="absolute bottom-40 right-20 sm:right-48">
        <PawPrintMotif size={32} opacity={0.035} rotation={-8} />
      </div>

      <div className="hidden lg:block absolute top-1/3 right-16">
        <PawPrintMotif size={30} opacity={0.025} rotation={45} />
      </div>
      <div className="hidden lg:block absolute top-2/3 left-20">
        <PawPrintMotif size={34} opacity={0.03} rotation={-30} />
      </div>

      {/* Ambient Vignette Framing for Depth & Contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.75) 100%)',
        }}
      />
    </div>
  );
};
