import React from 'react';

/**
 * Letter Archive Atmosphere Background
 * Multi-layered aged parchment with ultra-subtle paper grain, fibers,
 * warm candlelight radiance, antique-gold highlights, and a soft dark-sepia perimeter vignette.
 */
export const LetterArchiveBackground: React.FC = () => {
  return (
    <div
      id="letter-archive-background"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Base aged paper gradient with organic parchment warm tones */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #F9F4EB 0%, #F4ECE0 28%, #EDE2D2 65%, #E5D7C3 100%)',
        }}
      />

      {/* 2. Natural physical paper texture & micro-fiber grain SVG layer */}
      <div
        className="absolute inset-0 opacity-[0.45] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.85   0 0 0 0 0.78   0 0 0 0 0.68  0 0 0 0.22 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.7'/%3E%3Cpath d='M12 34 Q24 38 48 35 M98 120 Q112 116 134 122 M40 150 Q60 148 75 154' stroke='%23B89F82' stroke-width='0.4' stroke-opacity='0.25' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      {/* 3. Soft warm candlelight illumination centered near top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, rgba(245, 230, 200, 0.55) 0%, rgba(235, 215, 175, 0.25) 45%, transparent 75%)',
        }}
      />

      {/* 4. Antique-gold highlights across the upper visual field */}
      <div
        className="absolute top-12 right-[15%] w-[450px] h-[350px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(217, 185, 130, 0.12) 0%, transparent 60%)',
        }}
      />

      {/* 5. Delicate vintage perimeter vignette for aged book & desk framing */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(138, 110, 89, 0.08) 75%, rgba(74, 53, 39, 0.16) 100%)',
        }}
      />
    </div>
  );
};

/**
 * Vintage Letter Archive Postage Mark
 * Faded rubber postage stamp in walnut / burgundy ink with wavy cancellation lines.
 */
export const VintagePostmark: React.FC<{
  size?: number;
  className?: string;
  year?: string;
}> = ({ size = 72, className = '', year = '1926' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 pointer-events-none select-none opacity-50 hover:opacity-75 transition-opacity ${className}`}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer dashed postmark circle */}
        <circle
          cx="32"
          cy="32"
          r="30"
          stroke="#7A2E3B"
          strokeWidth="1.25"
          strokeDasharray="4 2.5"
          strokeOpacity="0.85"
        />
        {/* Inner concentric fine circle */}
        <circle
          cx="32"
          cy="32"
          r="24"
          stroke="#8A6E59"
          strokeWidth="0.75"
          strokeOpacity="0.65"
        />
        {/* Curved text arcs */}
        <text
          x="32"
          y="18"
          textAnchor="middle"
          fill="#5C4A42"
          fontSize="5.5"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="600"
          letterSpacing="1.5"
        >
          STARLIT ARCHIVE
        </text>
        <text
          x="32"
          y="35"
          textAnchor="middle"
          fill="#7A2E3B"
          fontSize="9"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontWeight="700"
          letterSpacing="0.8"
        >
          {year}
        </text>
        <text
          x="32"
          y="48"
          textAnchor="middle"
          fill="#8A6E59"
          fontSize="4.8"
          fontFamily="'Caveat', cursive"
          fontWeight="600"
          letterSpacing="0.8"
        >
          quiet correspondence
        </text>
        {/* Tiny star marks */}
        <path
          d="M14 32L15 34L17 35L15 36L14 38L13 36L11 35L13 34Z"
          fill="#C2934D"
        />
        <path
          d="M50 32L51 34L53 35L51 36L50 38L49 36L47 35L49 34Z"
          fill="#C2934D"
        />
      </svg>

      {/* Faded postmark wavy cancellation lines */}
      <svg
        width={size * 0.75}
        height={size * 0.45}
        viewBox="0 0 48 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-70"
      >
        <path
          d="M0 6C8 3 16 9 24 6C32 3 40 9 48 6"
          stroke="#8A6E59"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <path
          d="M0 12C8 9 16 15 24 12C32 9 40 15 48 12"
          stroke="#7A2E3B"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <path
          d="M0 18C8 15 16 21 24 18C32 15 40 21 48 18"
          stroke="#8A6E59"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

/**
 * Vintage Pressed Botanical Sprig
 * Minimalist engraved botanical flourish with fine dried leaves and tiny wildflower bud.
 */
export const VintageBotanicalSprig: React.FC<{
  position?: 'left' | 'right';
  className?: string;
  size?: number;
}> = ({ position = 'left', className = '', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{ transform: position === 'right' ? 'scaleX(-1)' : 'none' }}
      aria-hidden="true"
    >
      {/* Central slender stem */}
      <path
        d="M6 42C12 30 20 18 40 8"
        stroke="#8A6E59"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Pressed leaves in muted antique olive & sepia */}
      <path
        d="M18 30C16 25 18 21 24 23C26 27 22 31 18 30Z"
        fill="#9E8268"
        fillOpacity="0.45"
        stroke="#745A46"
        strokeWidth="0.75"
      />
      <path
        d="M27 22C30 17 34 18 33 24C29 26 27 24 27 22Z"
        fill="#7A2E3B"
        fillOpacity="0.35"
        stroke="#7A2E3B"
        strokeWidth="0.75"
      />
      {/* Tiny dried blossom at tip */}
      <circle cx="41" cy="7" r="2.2" fill="#C2934D" fillOpacity="0.85" />
      <circle cx="41" cy="7" r="4" stroke="#C2934D" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
    </svg>
  );
};

/**
 * Vintage Ornamental Divider
 * Classic bookplate line with central antique-gold star and diamond accents.
 */
export const VintageOrnamentalDivider: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div
      className={`flex items-center justify-center gap-3 my-6 pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[rgba(138,110,89,0.3)] to-[rgba(138,110,89,0.65)]" />
      <div className="flex items-center gap-2 text-[#C2934D] opacity-90">
        <span className="w-1 h-1 rounded-full bg-[#8A6E59] opacity-70" />
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Classic four-point antique gold star */}
          <path
            d="M7 0L8.2 4.8L13 6L8.2 7.2L7 12L5.8 7.2L1 6L5.8 4.8Z"
            fill="#C2934D"
          />
        </svg>
        <span className="w-1 h-1 rounded-full bg-[#8A6E59] opacity-70" />
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[rgba(138,110,89,0.3)] to-[rgba(138,110,89,0.65)]" />
    </div>
  );
};

/**
 * Vintage Corner Flourish
 * Elegant antique book corner bracket in sepia and antique gold.
 */
export const VintageCornerFlourish: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  size?: number;
}> = ({ position = 'top-left', className = '', size = 32 }) => {
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
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{ transform: getTransform() }}
      aria-hidden="true"
    >
      {/* Outer corner line */}
      <path
        d="M2 30V4C2 2.89543 2.89543 2 4 2H30"
        stroke="#8A6E59"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      {/* Inner fine accent line */}
      <path
        d="M6 26V8C6 6.89543 6.89543 6 8 6H26"
        stroke="#C2934D"
        strokeWidth="0.65"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
      {/* Corner diamond */}
      <rect
        x="9"
        y="9"
        width="3.5"
        height="3.5"
        transform="rotate(45 9 9)"
        fill="#7A2E3B"
        fillOpacity="0.75"
      />
    </svg>
  );
};
