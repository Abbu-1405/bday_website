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
        <Loader2 className="w-8 h-8 text-[#8C6B5E] animate-spin shrink-0" />
        <p className="text-sm font-serif italic text-[#7D6B5E] tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
