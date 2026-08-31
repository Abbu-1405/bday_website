import React from 'react';

interface BotanicalProps {
  className?: string;
  size?: number;
}

/**
 * Delicate Pressed Lotus Botanical Artwork
 * Translucent petals, soft rose/sage pressed texture, authentic pressed flower appearance
 */
export const PressedLotus: React.FC<BotanicalProps> = ({ className = '', size = 56 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="lotusPetalGrad1" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5D0D6" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#E2AAB4" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#C98995" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id="lotusPetalGrad2" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FCE7EB" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#E8B5BD" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#D499A3" stopOpacity="0.4" />
        </radialGradient>
        <linearGradient id="lotusStemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8A9A7E" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#6C7A62" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Gentle Pressed Stem & Base */}
      <path
        d="M50 92 C48 80, 49 68, 50 58"
        stroke="url(#lotusStemGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M48 70 C42 66, 36 68, 32 72"
        stroke="url(#lotusStemGrad)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Outer Back Petals */}
      <path
        d="M50 58 C30 52, 18 36, 26 24 C34 16, 44 38, 50 58 Z"
        fill="url(#lotusPetalGrad1)"
        opacity="0.7"
      />
      <path
        d="M50 58 C70 52, 82 36, 74 24 C66 16, 56 38, 50 58 Z"
        fill="url(#lotusPetalGrad1)"
        opacity="0.7"
      />

      {/* Mid Petals */}
      <path
        d="M50 58 C36 46, 28 26, 38 15 C46 8, 48 36, 50 58 Z"
        fill="url(#lotusPetalGrad2)"
        opacity="0.8"
      />
      <path
        d="M50 58 C64 46, 72 26, 62 15 C54 8, 52 36, 50 58 Z"
        fill="url(#lotusPetalGrad2)"
        opacity="0.8"
      />

      {/* Center Crown Petal */}
      <path
        d="M50 58 C42 42, 44 18, 50 8 C56 18, 58 42, 50 58 Z"
        fill="url(#lotusPetalGrad2)"
        opacity="0.9"
      />

      {/* Delicate Pressed Vein Details */}
      <path
        d="M50 14 Q50 34 50 54"
        stroke="#B26C78"
        strokeWidth="0.6"
        strokeDasharray="1 1"
        opacity="0.5"
      />
      <path
        d="M40 20 Q44 36 49 52"
        stroke="#B26C78"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <path
        d="M60 20 Q56 36 51 52"
        stroke="#B26C78"
        strokeWidth="0.5"
        opacity="0.4"
      />

      {/* Seed Pod Center Stamen */}
      <circle cx="50" cy="52" r="3.5" fill="#D8BE7A" opacity="0.8" />
      <circle cx="48" cy="51" r="0.8" fill="#8B6A2B" opacity="0.7" />
      <circle cx="51" cy="50" r="0.8" fill="#8B6A2B" opacity="0.7" />
      <circle cx="52" cy="53" r="0.8" fill="#8B6A2B" opacity="0.7" />
    </svg>
  );
};

/**
 * Delicate Pressed Sunflower Botanical Artwork
 * Warm amber/ochre petals, authentic vintage pressed flower texture, natural seed center
 */
export const PressedSunflower: React.FC<BotanicalProps> = ({ className = '', size = 56 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sunflowerPetalGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F9E282" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#E5B842" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#C48E28" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id="sunflowerCenterGrad" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#6E4822" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#4A2F13" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#2E1C0A" stopOpacity="0.85" />
        </radialGradient>
        <linearGradient id="sunflowerStemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7F8D69" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#5E6B4B" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Slender Pressed Stem */}
      <path
        d="M50 92 C51 78, 50 64, 50 50"
        stroke="url(#sunflowerStemGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M50 72 C56 68, 64 69, 70 73"
        stroke="url(#sunflowerStemGrad)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Radiating Pressed Petals */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, idx) => (
        <g key={angle} transform={`rotate(${angle} 50 48)`}>
          <path
            d="M50 48 C46 36, 47 18, 50 12 C53 18, 54 36, 50 48 Z"
            fill="url(#sunflowerPetalGrad)"
            opacity={idx % 2 === 0 ? '0.85' : '0.7'}
          />
          {/* Subtle petal vein */}
          <path
            d="M50 18 L50 44"
            stroke="#9E6B15"
            strokeWidth="0.4"
            opacity="0.4"
          />
        </g>
      ))}

      {/* Inner Pressed Disc Center */}
      <circle cx="50" cy="48" r="14" fill="url(#sunflowerCenterGrad)" />
      
      {/* Pressed Seed Pattern Accents */}
      <circle cx="50" cy="48" r="10" stroke="#C49A45" strokeWidth="0.5" strokeDasharray="1.5 1.5" opacity="0.6" />
      <circle cx="50" cy="48" r="6" stroke="#D8B560" strokeWidth="0.5" strokeDasharray="1 1" opacity="0.5" />
      <circle cx="47" cy="46" r="1.2" fill="#E8C87A" opacity="0.5" />
      <circle cx="53" cy="49" r="1" fill="#E8C87A" opacity="0.4" />
      <circle cx="50" cy="51" r="1.1" fill="#E8C87A" opacity="0.45" />
    </svg>
  );
};
