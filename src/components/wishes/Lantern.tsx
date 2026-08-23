import React, { useState } from 'react';
import { Wish } from '../../types';
import { cn } from '../../utils';
import './wishes.css';

export interface LanternProps {
  wish: Wish;
  isCollected: boolean;
  onClick: (wish: Wish) => void;
  index?: number;
  style?: React.CSSProperties;
  className?: string;
  prefersReducedMotion?: boolean;
}

// 4 Natural Paper Palettes (Warm Ivory, Soft Cream, Faded Peach, Muted Pale Amber)
interface PaperPalette {
  topGrad: string;
  midGrad: string;
  botGrad: string;
  coreGlow: string;
  ribStroke: string;
  rimColor: string;
  inkColor: string;
}

const PAPER_PALETTES: PaperPalette[] = [
  // 1. Warm Ivory & Honey Amber
  {
    topGrad: '#FBF5E6',
    midGrad: '#F7E6BE',
    botGrad: '#EAC585',
    coreGlow: '#FFF0B8',
    ribStroke: 'rgba(165, 110, 50, 0.22)',
    rimColor: '#6B4423',
    inkColor: '#5C381E',
  },
  // 2. Soft Cream & Golden Amber
  {
    topGrad: '#FAF3E8',
    midGrad: '#F8E9C7',
    botGrad: '#ECCB90',
    coreGlow: '#FFF6D6',
    ribStroke: 'rgba(175, 120, 60, 0.20)',
    rimColor: '#744A28',
    inkColor: '#563519',
  },
  // 3. Faded Peach & Muted Sunset Blush
  {
    topGrad: '#FCF3ED',
    midGrad: '#F8DFCE',
    botGrad: '#EBBFA3',
    coreGlow: '#FFEADA',
    ribStroke: 'rgba(180, 105, 75, 0.22)',
    rimColor: '#7A432F',
    inkColor: '#633423',
  },
  // 4. Muted Pale Amber & Candlelight Gold
  {
    topGrad: '#FAF4E3',
    midGrad: '#F4E2B5',
    botGrad: '#E5BF77',
    coreGlow: '#FFF2C2',
    ribStroke: 'rgba(160, 105, 45, 0.22)',
    rimColor: '#6E4522',
    inkColor: '#573618',
  },
];

export const Lantern: React.FC<LanternProps> = ({
  wish,
  isCollected,
  onClick,
  index = 0,
  style,
  className,
  prefersReducedMotion = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const formattedNumber = String(wish.number).padStart(2, '0');

  // Palette variant based on wish number/index
  const palette = PAPER_PALETTES[index % PAPER_PALETTES.length];

  // Unique gradient IDs to prevent DOM conflicts across 20 lanterns
  const gradId = `lantern-grad-${wish.id}`;
  const coreGlowId = `lantern-core-${wish.id}`;
  const flameGlowId = `lantern-flame-${wish.id}`;
  const spillId = `lantern-spill-${wish.id}`;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center group', className)}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Interactive Trigger Button */}
      <button
        type="button"
        id={`lantern-button-${wish.id}`}
        onClick={() => onClick(wish)}
        aria-label={`Wish #${formattedNumber}: ${wish.title}. ${isCollected ? 'Collected' : 'Tap to reveal and collect.'}`}
        className="relative z-10 block p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-full cursor-pointer touch-manipulation transition-all duration-300 group-hover:-translate-y-1 group-hover:brightness-105 active:scale-[0.97]"
      >
        {/* Soft Ambient Outer Diffusion (Illumination cast into the surrounding night sky) */}
        <div
          className={cn(
            'absolute -inset-3 rounded-full pointer-events-none transition-all duration-500 blur-xl',
            isCollected
              ? 'bg-amber-300/35 opacity-90 group-hover:opacity-100 group-hover:bg-amber-300/50'
              : 'bg-amber-400/20 opacity-60 group-hover:opacity-95 group-hover:bg-amber-300/40'
          )}
        />

        {/* Physical Paper Sky Lantern SVG */}
        <div className="relative w-[68px] h-[88px] sm:w-[78px] sm:h-[102px] drop-shadow-md">
          <svg
            viewBox="0 0 100 130"
            className="w-full h-full overflow-visible select-none pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Vertical Translucent Paper Gradient */}
              <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={palette.topGrad} stopOpacity="0.94" />
                <stop offset="45%" stopColor={palette.midGrad} stopOpacity="0.90" />
                <stop offset="85%" stopColor={palette.botGrad} stopOpacity="0.95" />
                <stop offset="100%" stopColor={palette.botGrad} stopOpacity="0.98" />
              </linearGradient>

              {/* Internal Candlelight Radial Glow */}
              <radialGradient
                id={coreGlowId}
                cx="50%"
                cy="75%"
                r="65%"
                fx="50%"
                fy="80%"
              >
                <stop offset="0%" stopColor="#FFFDF2" stopOpacity="0.95" />
                <stop offset="35%" stopColor={palette.coreGlow} stopOpacity="0.75" />
                <stop offset="70%" stopColor="#F9C66F" stopOpacity="0.40" />
                <stop offset="100%" stopColor="#DF8B2E" stopOpacity="0.0" />
              </radialGradient>

              {/* Flame Radial Aura */}
              <radialGradient id={flameGlowId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="40%" stopColor="#FFE066" stopOpacity="0.9" />
                <stop offset="75%" stopColor="#FF9F1C" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#E76F51" stopOpacity="0" />
              </radialGradient>

              {/* Downward Light Spill Linear Gradient */}
              <linearGradient id={spillId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFD166" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#FFAA00" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FF9F1C" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* 1. Downward Light Spill (Light radiating out of the bottom aperture) */}
            <path
              d="M 32,108 L 18,126 L 82,126 L 68,108 Z"
              fill={`url(#${spillId})`}
              opacity={isHovered ? 0.40 : 0.22}
              className="transition-opacity duration-300"
            />

            {/* 2. Paper Lantern Main Body (Classic Sky Lantern Silhouette with subtle curvature) */}
            <path
              d="M 28,12 C 16,36 14,72 23,106 C 36,113 64,113 77,106 C 86,72 84,36 72,12 C 61,8 39,8 28,12 Z"
              fill={`url(#${gradId})`}
              stroke="rgba(110, 70, 30, 0.35)"
              strokeWidth="0.8"
            />

            {/* 3. Internal Candlelight Illumination Layer (Originating from the flame within) */}
            <path
              d="M 29,13 C 18,37 16,71 24,105 C 37,112 63,112 76,105 C 84,71 82,37 71,13 C 60,9 40,9 29,13 Z"
              fill={`url(#${coreGlowId})`}
              className={prefersReducedMotion ? '' : 'animate-paper-breathe'}
            />

            {/* 4. Structural Bamboo Ribs (Delicate vertical folds & supports) */}
            <g stroke={palette.ribStroke} strokeWidth="0.75" fill="none">
              {/* Outer Left Rib */}
              <path d="M 37,10.5 C 28,40 28,78 35,108" />
              {/* Center Left Rib */}
              <path d="M 44,9.5 C 42,42 42,76 45,109.5" />
              {/* Center Right Rib */}
              <path d="M 56,9.5 C 58,42 58,76 55,109.5" />
              {/* Outer Right Rib */}
              <path d="M 63,10.5 C 72,40 72,78 65,108" />
            </g>

            {/* 5. Horizontal Wire Rings (Faint structural hoops) */}
            <ellipse
              cx="50"
              cy="42"
              rx="30"
              ry="3.5"
              fill="none"
              stroke={palette.ribStroke}
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.7"
            />
            <ellipse
              cx="50"
              cy="74"
              rx="31"
              ry="3.8"
              fill="none"
              stroke={palette.ribStroke}
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.7"
            />

            {/* 6. Top Bamboo Crown / Aperture Rim */}
            <ellipse
              cx="50"
              cy="11.5"
              rx="22"
              ry="3.5"
              fill={palette.rimColor}
              fillOpacity="0.85"
              stroke="rgba(40, 20, 10, 0.4)"
              strokeWidth="0.5"
            />
            <ellipse
              cx="50"
              cy="11"
              rx="18"
              ry="2.2"
              fill="#2A160A"
              fillOpacity="0.75"
            />

            {/* 7. Wish Number Inscribed on Translucent Paper */}
            <text
              x="50"
              y="60"
              textAnchor="middle"
              dominantBaseline="central"
              fill={palette.inkColor}
              fillOpacity={isCollected ? 0.95 : 0.82}
              style={{
                fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                filter: 'drop-shadow(0px 1px 1px rgba(255, 240, 200, 0.7))',
              }}
            >
              {formattedNumber}
            </text>

            {/* Subtle Wish Category Watermark under the number */}
            <text
              x="50"
              y="74"
              textAnchor="middle"
              dominantBaseline="central"
              fill={palette.inkColor}
              fillOpacity={isCollected ? 0.75 : 0.55}
              style={{
                fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                fontSize: '7px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {wish.category}
            </text>

            {/* 8. Bottom Opening Bamboo Collar Frame */}
            <ellipse
              cx="50"
              cy="107"
              rx="27"
              ry="4.5"
              fill={palette.rimColor}
              fillOpacity="0.9"
              stroke="rgba(40, 20, 10, 0.5)"
              strokeWidth="0.6"
            />
            <ellipse
              cx="50"
              cy="107.5"
              rx="23"
              ry="3.2"
              fill="#1F0F06"
              fillOpacity="0.85"
            />

            {/* 9. Cross-Wire Burner Bracket & Fuel Pad */}
            <line
              x1="32"
              y1="107"
              x2="68"
              y2="107"
              stroke="#D4A373"
              strokeWidth="0.8"
              strokeOpacity="0.8"
            />
            <line
              x1="50"
              y1="103.5"
              x2="50"
              y2="110.5"
              stroke="#D4A373"
              strokeWidth="0.8"
              strokeOpacity="0.8"
            />

            {/* Small Fuel Wax Pad */}
            <rect
              x="47"
              y="105.5"
              width="6"
              height="2.5"
              rx="1"
              fill="#B87333"
            />

            {/* 10. Candlelight Flame Core (Glowing tear-drop flame with subtle flicker) */}
            <g
              className={prefersReducedMotion ? '' : 'animate-wish-flame'}
              style={{ transformOrigin: '50px 105px' }}
            >
              {/* Flame Outer Halo */}
              <circle
                cx="50"
                cy="102"
                r="6"
                fill={`url(#${flameGlowId})`}
                opacity="0.85"
              />
              {/* Teardrop Candle Flame */}
              <path
                d="M 50,96 C 47.5,101 47,104 50,105.5 C 53,104 52.5,101 50,96 Z"
                fill="#FFF9E6"
                stroke="#FFB703"
                strokeWidth="0.4"
              />
              {/* Inner White Flame Core */}
              <circle cx="50" cy="103" r="1.2" fill="#FFFFFF" />
            </g>

            {/* 11. Starlit Collected Badge (A delicate antique-gold archival star marker when collected) */}
            {isCollected && (
              <g transform="translate(68, 14)">
                <circle cx="0" cy="0" r="4.5" fill="#FFE57F" opacity="0.9" />
                <path
                  d="M 0,-4 L 1,-1 L 4,0 L 1,1 L 0,4 L -1,1 L -4,0 L -1,-1 Z"
                  fill="#7A4B00"
                />
              </g>
            )}
          </svg>
        </div>
      </button>

      {/* Atmospheric Hover Tooltip / Wish Preview (Desktop) */}
      <div
        role="tooltip"
        className={cn(
          'absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-30 transition-all duration-200 hidden sm:block',
          isHovered
            ? 'opacity-100 transform -translate-y-1'
            : 'opacity-0 transform translate-y-1'
        )}
      >
        <div className="px-3 py-1 rounded-full bg-[var(--color-surface-secondary)]/95 border border-[var(--color-border)] text-[var(--color-text)] text-xs font-serif whitespace-nowrap shadow-lg backdrop-blur-xs flex items-center gap-1.5">
          <span className="font-bold text-[var(--color-primary)]">#{formattedNumber}</span>
          <span className="text-[var(--color-text-secondary)] truncate max-w-[140px]">
            {wish.title.replace(/^Wish\s*#?\d+\s*[-—:]\s*/i, '')}
          </span>
        </div>
      </div>
    </div>
  );
};
