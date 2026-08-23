import React from 'react';
import { useTheme } from '../../hooks';

/**
 * VintageInkPot
 * 
 * An exquisite antique glass ink bottle crafted specifically for the Letter Archive theme.
 * Positioned in the bottom-right corner with a subtle idle floating/breathing animation,
 * respecting prefers-reduced-motion and staying safely layered below all modals and navigation.
 */
export const VintageInkPot: React.FC = () => {
  const { theme } = useTheme();

  // Strictly render ONLY when the active theme is 'letter-archive'
  if (theme !== 'letter-archive') {
    return null;
  }

  return (
    <aside
      id="vintage-ink-pot-container"
      aria-label="Vintage writing desk ink pot decoration"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-20 pointer-events-auto select-none transition-transform duration-300 ease-out group"
    >
      <style>{`
        @keyframes inkPotBreathe {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-3px) rotate(0.4deg);
          }
        }

        @keyframes inkGlint {
          0%, 100% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.75;
          }
        }

        .vintage-ink-pot-idle {
          animation: inkPotBreathe 6s ease-in-out infinite;
        }

        .vintage-ink-pot-glint {
          animation: inkGlint 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .vintage-ink-pot-idle,
          .vintage-ink-pot-glint {
            animation: none !important;
          }
        }
      `}</style>

      <div
        id="vintage-ink-pot-wrapper"
        className="vintage-ink-pot-idle relative cursor-default filter drop-shadow-[0_8px_16px_rgba(74,53,39,0.22)] group-hover:scale-105 transition-transform duration-300"
        title="Letter Archive • Sepia Ink Pot"
      >
        <svg
          width="54"
          height="64"
          viewBox="0 0 54 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-11 h-13 sm:w-[50px] sm:h-[60px]"
          role="img"
          aria-hidden="true"
        >
          <defs>
            {/* Glass body gradient */}
            <linearGradient id="glassBodyGrad" x1="6" y1="22" x2="48" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D9C9B4" stopOpacity="0.75" />
              <stop offset="25%" stopColor="#8A6E59" stopOpacity="0.4" />
              <stop offset="75%" stopColor="#4A3527" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#2E1F16" stopOpacity="0.95" />
            </linearGradient>

            {/* Deep Sepia Ink gradient */}
            <linearGradient id="sepiaInkGrad" x1="10" y1="32" x2="44" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5A3A28" />
              <stop offset="40%" stopColor="#3B2418" />
              <stop offset="100%" stopColor="#1E120A" />
            </linearGradient>

            {/* Brass stopper metallic gradient */}
            <linearGradient id="brassStopperGrad" x1="20" y1="4" x2="34" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5E4B8" />
              <stop offset="30%" stopColor="#C2934D" />
              <stop offset="70%" stopColor="#8A6025" />
              <stop offset="100%" stopColor="#5E4017" />
            </linearGradient>

            {/* Glass reflection highlight */}
            <linearGradient id="glassReflectionGrad" x1="12" y1="24" x2="16" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
              <stop offset="60%" stopColor="#F9F4EB" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Parchment Label gradient */}
            <linearGradient id="parchmentLabelGrad" x1="14" y1="36" x2="40" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F7EEDF" />
              <stop offset="100%" stopColor="#E5D3B8" />
            </linearGradient>
          </defs>

          {/* Soft Ground Shadow */}
          <ellipse cx="27" cy="61" rx="20" ry="3" fill="#4A3527" fillOpacity="0.3" />

          {/* Glass Base Flask Outer Shape (octagonal vintage apothecary cut) */}
          <path
            d="M17 22H37L46 31V54C46 57.3137 43.3137 60 40 60H14C10.6863 60 8 57.3137 8 54V31L17 22Z"
            fill="url(#glassBodyGrad)"
            stroke="#6E513D"
            strokeWidth="1.2"
          />

          {/* Deep Sepia Writing Ink Fluid Layer */}
          <path
            d="M9.5 35C9.5 35 18 33 27 34C36 35 44.5 33.5 44.5 33.5V54C44.5 56.4853 42.4853 58.5 40 58.5H14C11.5147 58.5 9.5 56.4853 9.5 54V35Z"
            fill="url(#sepiaInkGrad)"
          />

          {/* Ink Meniscus / Liquid Surface Wave */}
          <path
            d="M9.5 35C16 33.5 24 35.5 32 34C38 33 44.5 33.5 44.5 33.5"
            stroke="#9E6E4A"
            strokeWidth="0.8"
            strokeOpacity="0.75"
            strokeLinecap="round"
          />

          {/* Aged Parchment Ink Pot Label */}
          <rect
            x="14"
            y="39"
            width="26"
            height="14"
            rx="2"
            fill="url(#parchmentLabelGrad)"
            stroke="#A38265"
            strokeWidth="0.65"
          />
          {/* Label inner line */}
          <rect
            x="15.5"
            y="40.5"
            width="23"
            height="11"
            rx="1"
            fill="none"
            stroke="#8A6E59"
            strokeWidth="0.4"
            strokeDasharray="1.5 1"
          />
          {/* Label mini insignia */}
          <circle cx="27" cy="43.5" r="1.5" fill="#7A2E3B" />
          <path d="M21 47.5H33" stroke="#5C4231" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M23 49.5H31" stroke="#8A6E59" strokeWidth="0.4" strokeLinecap="round" />

          {/* Fluted Neck of the Glass Bottle */}
          <path
            d="M20 18H34V22H20V18Z"
            fill="#8A6E59"
            stroke="#5C4231"
            strokeWidth="0.9"
          />
          <line x1="20" y1="20" x2="34" y2="20" stroke="#B89F82" strokeWidth="0.5" />

          {/* Antique Brass Stopper / Cork */}
          <path
            d="M22 10C22 7.79086 23.7909 6 26 6H28C30.2091 6 32 7.79086 32 10V18H22V10Z"
            fill="url(#brassStopperGrad)"
            stroke="#5E4017"
            strokeWidth="0.8"
          />
          {/* Stopper Brass Finial Sphere on top */}
          <circle
            cx="27"
            cy="5"
            r="3.2"
            fill="url(#brassStopperGrad)"
            stroke="#5E4017"
            strokeWidth="0.8"
          />
          {/* Finial glint */}
          <circle cx="25.8" cy="3.8" r="0.8" fill="#FFF8E7" />

          {/* Glass Left Edge Specular Glint Reflection */}
          <path
            d="M11 31L18 24V23L11 30.5V54C11 55.5 11.8 56.8 13 57.5L12 58.5C10.2 57.5 9 55.5 9 54V31Z"
            fill="url(#glassReflectionGrad)"
          />
          {/* Right Corner Accent Highlight */}
          <path
            d="M43 32V53"
            stroke="#F2E8D2"
            strokeWidth="0.75"
            strokeOpacity="0.45"
            strokeLinecap="round"
          />

          {/* Subtle Magical Starlight Speck on Ink Surface */}
          <path
            d="M36 33.5L37 31.5L38 33.5L40 34.5L38 35.5L37 37.5L36 35.5L34 34.5Z"
            fill="#F5E4B8"
            className="vintage-ink-pot-glint"
          />
        </svg>
      </div>
    </aside>
  );
};
