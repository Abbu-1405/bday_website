import React from 'react';

// Lightweight, crisp SVG botanical sprigs & flowers for scrapbook corners & borders
export const BotanicalCorner: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}> = ({ position = 'top-left', className = '' }) => {
  const getTransform = () => {
    switch (position) {
      case 'top-right':
        return 'scaleX(-1)';
      case 'bottom-left':
        return 'scaleY(-1)';
      case 'bottom-right':
        return 'scale(-1, -1)';
      default:
        return 'none';
    }
  };

  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{ transform: getTransform() }}
      aria-hidden="true"
    >
      {/* Delicate leafy stem */}
      <path
        d="M6 74C8 52 20 28 58 12C68 8 76 6 76 6"
        stroke="#4F6B48"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Clover leaf cluster */}
      <circle cx="28" cy="42" r="5" fill="#6F8D62" fillOpacity="0.85" />
      <circle cx="36" cy="38" r="4.5" fill="#4F6B48" fillOpacity="0.9" />
      <circle cx="31" cy="48" r="4" fill="#293D25" fillOpacity="0.85" />

      {/* Wildflower (Pink & Soft Gold center) */}
      <circle cx="56" cy="18" r="6" fill="#172218" />
      <circle cx="56" cy="18" r="2.8" fill="#D8B86A" />
      <circle cx="52" cy="14" r="3" fill="#E6A0C4" fillOpacity="0.9" />
      <circle cx="60" cy="14" r="3" fill="#E6A0C4" fillOpacity="0.9" />
      <circle cx="61" cy="22" r="3" fill="#C6A6D8" fillOpacity="0.9" />
      <circle cx="51" cy="22" r="3" fill="#C6A6D8" fillOpacity="0.9" />

      {/* Tiny gold star & stardust */}
      <path
        d="M20 20L21.5 24L25.5 25.5L21.5 27L20 31L18.5 27L14.5 25.5L18.5 24Z"
        fill="#D8B86A"
      />
      <circle cx="68" cy="32" r="1.5" fill="#FFF8E8" />
      <circle cx="44" cy="62" r="1.5" fill="#D8B86A" />
    </svg>
  );
};

// Clover checker pattern strip for card headers, ribbons & dividers
export const CloverStrip: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`h-3 w-full bg-repeat-x opacity-70 rounded-t-sm pointer-events-none select-none ${className}`}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='12' viewBox='0 0 32 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='12' fill='%23172218'/%3E%3Crect x='16' width='16' height='12' fill='%23101810'/%3E%3Ccircle cx='8' cy='6' r='2.5' fill='%234F6B48'/%3E%3Ccircle cx='24' cy='6' r='2.5' fill='%23D8B86A'/%3E%3C/svg%3E")`,
      backgroundSize: '32px 12px',
    }}
    aria-hidden="true"
  />
);

// Magical Swirl celestial motif (lightweight vector)
export const MagicalSwirlGraphic: React.FC<{
  size?: number;
  className?: string;
  glowColor?: string;
}> = ({ size = 220, className = '', glowColor = '#D8B86A' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="swirlGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.20" />
        <stop offset="60%" stopColor="#4F6B48" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#0B100D" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="90" fill="url(#swirlGlow)" />

    {/* Hand-painted swirling curves */}
    <path
      d="M100 20C144 20 180 56 180 100C180 144 144 180 100 180C60 180 30 150 30 110C30 75 55 50 85 50C115 50 135 70 135 95C135 115 120 130 105 130C92 130 82 120 82 108C82 98 90 90 100 90C106 90 110 94 110 100"
      stroke="#D8B86A"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeDasharray="4 6"
      opacity="0.65"
    />
    <path
      d="M100 35C135 35 165 65 165 100C165 135 135 165 100 165C70 165 45 140 45 110C45 80 65 60 92 60C118 60 128 78 128 98C128 114 115 124 102 124"
      stroke="#6F8D62"
      strokeWidth="1.25"
      strokeLinecap="round"
      opacity="0.5"
    />

    {/* Constellation stars */}
    <path d="M100 12L102 18L108 20L102 22L100 28L98 22L92 20L98 18Z" fill="#FFF8E8" />
    <path d="M175 95L177 99L181 100L177 101L175 105L173 101L169 100L173 99Z" fill="#D8B86A" />
    <path d="M100 172L101.5 176L105.5 177.5L101.5 179L100 183L98.5 179L94.5 177.5L98.5 176Z" fill="#FFF8E8" />
    <path d="M35 105L36.5 109L40.5 110.5L36.5 112L35 116L33.5 112L29.5 110.5L33.5 109Z" fill="#D8B86A" />
    <circle cx="100" cy="100" r="3" fill="#FFF8E8" />
    <circle cx="100" cy="100" r="5.5" stroke="#D8B86A" strokeWidth="0.75" />
  </svg>
);

// Scrapbook Postage Stamp Badge
export const ScrapbookStamp: React.FC<{
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}> = ({ label = 'Starlit', icon, className = '' }) => (
  <div
    className={`relative inline-flex items-center gap-1.5 px-3 py-1 bg-[#172218]/90 text-[#F7F1DF] border border-[rgba(255,248,232,0.12)] rounded shadow-sm text-xs font-serif select-none ${className}`}
    style={{
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
    }}
  >
    {icon}
    <span className="tracking-wider uppercase text-[10px] font-bold text-[#D8B86A]">{label}</span>
  </div>
);

// Scrapbook Washi Tape Strip
export const WashiTape: React.FC<{
  color?: 'sage' | 'peach' | 'gold' | 'coral';
  className?: string;
  tilt?: 'left' | 'right' | 'none';
}> = ({ color = 'sage', className = '', tilt = 'left' }) => {
  const bgColors = {
    sage: 'bg-[#4F6B48]/35 text-[#F7F1DF] border border-[#6F8D62]/30',
    peach: 'bg-[#E6A0C4]/25 text-[#F7F1DF] border border-[#E6A0C4]/30',
    gold: 'bg-[#D8B86A]/25 text-[#F7F1DF] border border-[#D8B86A]/30',
    coral: 'bg-[#C6A6D8]/25 text-[#F7F1DF] border border-[#C6A6D8]/30',
  };

  const rotations = {
    left: '-rotate-2',
    right: 'rotate-2',
    none: 'rotate-0',
  };

  return (
    <div
      className={`h-4 w-16 sm:w-20 ${bgColors[color]} ${rotations[tilt]} shadow-xs opacity-85 backdrop-blur-xs select-none pointer-events-none rounded-xs ${className}`}
      style={{
        clipPath: 'polygon(0% 0%, 96% 2%, 100% 98%, 4% 96%)',
      }}
      aria-hidden="true"
    />
  );
};

