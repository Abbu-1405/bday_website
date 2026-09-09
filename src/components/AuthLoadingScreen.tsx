import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthLoadingScreenProps {
  message?: string;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  message = 'Listening to the stars...',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden select-none"
    >
      {/* Background aged paper radial gradient */}
      <div
        className="absolute inset-0 bg-[#ECE5DB]"
        style={{
          backgroundImage: `radial-gradient(ellipse at 50% 40%, #F5EFEB 0%, #E8DFD3 75%, #DDD2C4 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Subtle paper grain texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
        aria-hidden="true"
      />

      {/* Atmospheric Loading Indicator */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-3.5 text-center">
        <div className="relative w-12 h-12 rounded-full bg-[#050811] border border-[#E5B85A]/40 shadow-[0_4px_16px_rgba(5,8,17,0.2)] overflow-hidden flex items-center justify-center animate-pulse">
          <img
            src="/gaalimaatalu-favicon.png"
            alt="Gaalimaatalu"
            className="w-full h-full object-contain rounded-full select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
        </div>
        <Loader2 className="w-5 h-5 text-[#8C6B5E] animate-spin shrink-0" />
        <p className="text-sm font-serif italic text-[#7D6B5E] tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
