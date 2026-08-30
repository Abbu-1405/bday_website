import React from 'react';

/**
 * Letter Archive Atmosphere Background
 * Multi-layered aged parchment with realistic crumpled paper wrinkles,
 * crease highlights & shadows, organic paper grain, antique-gold star watermarks,
 * and an authentic aged-paper edge vignette.
 */
export const LetterArchiveBackground: React.FC = () => {
  return (
    <div
      id="letter-archive-background"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Base Antique Aged Parchment Foundation */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 110% 90% at 50% 35%, #F7EFE2 0%, #EEDEC4 35%, #E2CFAD 70%, #D4BE98 90%, #C4AC82 100%)',
        }}
      />

      {/* 2. Large-Scale Uneven Oxidation & Organic Handling Tones */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(circle 600px at 15% 20%, rgba(255, 252, 245, 0.45) 0%, transparent 70%), ' +
            'radial-gradient(circle 500px at 85% 75%, rgba(186, 150, 110, 0.25) 0%, transparent 65%), ' +
            'radial-gradient(circle 450px at 30% 85%, rgba(160, 128, 92, 0.22) 0%, transparent 60%), ' +
            'radial-gradient(circle 700px at 70% 25%, rgba(245, 230, 205, 0.35) 0%, transparent 75%)',
        }}
      />

      {/* 3. Subtle Faceted Crumple Planes (Light/Shadow shifts from paper memory) */}
      <div
        className="absolute inset-0 opacity-[0.22] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(115deg, rgba(255,255,255,0.4) 0%, transparent 40%), ' +
            'linear-gradient(245deg, rgba(74,53,37,0.3) 0%, transparent 50%), ' +
            'linear-gradient(35deg, rgba(255,255,255,0.25) 30%, rgba(74,53,37,0.25) 70%)',
        }}
      />

      {/* 4. Procedural Diffuse-Light Crumple Relief & Paper Deformation */}
      <div
        className="absolute inset-0 opacity-[0.52] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperCrumpleRelief'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012 0.018' numOctaves='5' seed='73' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23FFF8EB' surfaceScale='2.4' result='light'%3E%3CfeDistantLight azimuth='125' elevation='52'/%3E%3C/feDiffuseLighting%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='0.92'/%3E%3CfeFuncG type='linear' slope='0.86'/%3E%3CfeFuncB type='linear' slope='0.76'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperCrumpleRelief)'/%3E%3C/svg%3E")`,
          backgroundSize: '750px 750px',
        }}
      />

      {/* 5. Realistic Physical Postal Folds & Handled Crease Networks (Highlight & Shadow Pairs) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-45 mix-blend-overlay pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <defs>
          {/* Valley Shadow Gradients */}
          <linearGradient id="foldValleyPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3E2B1E" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#4A3525" stopOpacity="0.25" />
            <stop offset="80%" stopColor="#3E2B1E" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3E2B1E" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="foldValleySecondary" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3E2B1E" stopOpacity="0.38" />
            <stop offset="50%" stopColor="#4A3525" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3E2B1E" stopOpacity="0.32" />
          </linearGradient>

          {/* Ridge Highlight Gradients */}
          <linearGradient id="foldRidgePrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#FFFDF7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFDF7" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="foldRidgeSecondary" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#FFFDF7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFDF7" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* --- Primary Letter Tri-Fold 1: Upper Horizontal Soft Fold Line --- */}
        <path d="M-40 310 Q360 295 720 312 T1480 298" stroke="url(#foldValleyPrimary)" strokeWidth="2.8" fill="none" />
        <path d="M-40 308 Q360 293 720 310 T1480 296" stroke="url(#foldRidgePrimary)" strokeWidth="1.6" fill="none" />

        {/* --- Primary Letter Tri-Fold 2: Lower Horizontal Soft Fold Line --- */}
        <path d="M-40 620 Q480 635 960 618 T1480 626" stroke="url(#foldValleyPrimary)" strokeWidth="3.0" fill="none" />
        <path d="M-40 622 Q480 637 960 620 T1480 628" stroke="url(#foldRidgePrimary)" strokeWidth="1.8" fill="none" />

        {/* --- Major Diagonal Envelope Handling Crease (Top-Left to Mid-Right) --- */}
        <path d="M-20 120 Q320 280 780 430 T1460 590" stroke="url(#foldValleyPrimary)" strokeWidth="2.4" fill="none" />
        <path d="M-20 118 Q320 278 780 428 T1460 588" stroke="url(#foldRidgePrimary)" strokeWidth="1.5" fill="none" />

        {/* --- Cross Diagonal Fold (Top-Right to Bottom-Left) --- */}
        <path d="M1460 140 Q1050 390 620 640 T-20 860" stroke="url(#foldValleySecondary)" strokeWidth="2.6" fill="none" />
        <path d="M1460 142 Q1050 392 620 642 T-20 862" stroke="url(#foldRidgeSecondary)" strokeWidth="1.6" fill="none" />

        {/* --- Organic Medium Wrinkle Radiations (Branching from fold stress points) --- */}
        {/* Branch Upper Left */}
        <path d="M210 295 Q170 210 240 130" stroke="url(#foldValleySecondary)" strokeWidth="1.5" strokeOpacity="0.75" fill="none" />
        <path d="M211 295 Q171 210 241 130" stroke="url(#foldRidgeSecondary)" strokeWidth="1.0" strokeOpacity="0.8" fill="none" />

        {/* Branch Center Top */}
        <path d="M720 312 Q670 180 740 60" stroke="url(#foldValleyPrimary)" strokeWidth="1.6" strokeOpacity="0.7" fill="none" />
        <path d="M722 312 Q672 180 742 60" stroke="url(#foldRidgePrimary)" strokeWidth="1.1" strokeOpacity="0.75" fill="none" />

        {/* Branch Lower Center */}
        <path d="M620 640 Q690 730 650 890" stroke="url(#foldValleySecondary)" strokeWidth="1.8" strokeOpacity="0.7" fill="none" />
        <path d="M622 640 Q692 730 652 890" stroke="url(#foldRidgeSecondary)" strokeWidth="1.2" strokeOpacity="0.75" fill="none" />

        {/* Branch Right Flank */}
        <path d="M1180 300 Q1260 460 1200 620" stroke="url(#foldValleyPrimary)" strokeWidth="1.8" strokeOpacity="0.65" fill="none" />
        <path d="M1182 300 Q1262 460 1202 620" stroke="url(#foldRidgePrimary)" strokeWidth="1.2" strokeOpacity="0.7" fill="none" />

        {/* Corner crush creases */}
        <path d="M0 45 Q70 95 150 70" stroke="url(#foldValleyPrimary)" strokeWidth="1.8" fill="none" />
        <path d="M1320 860 Q1380 810 1440 825" stroke="url(#foldValleyPrimary)" strokeWidth="1.8" fill="none" />
      </svg>

      {/* 6. Fine Paper Pulp Grain (Static Micro-Fractal Cotton & Linen Texture) */}
      <div
        className="absolute inset-0 opacity-[0.42] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='pulpGrain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.70   0 0 0 0 0.56   0 0 0 0 0.40  0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23pulpGrain)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      {/* 7. Microscopic Embedded Cellulose Pulp Fibers & Flecks */}
      <div
        className="absolute inset-0 opacity-[0.32] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='220' height='220' viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%237D5C40' stroke-width='0.5' stroke-linecap='round' fill='none' opacity='0.55'%3E%3Cpath d='M14 28 C22 34, 30 29, 42 33' /%3E%3Cpath d='M118 92 C126 88, 134 94, 146 90' /%3E%3Cpath d='M48 165 C58 160, 68 168, 78 162' /%3E%3Cpath d='M168 45 C176 52, 184 48, 194 54' /%3E%3Cpath d='M182 178 C190 172, 198 180, 208 174' /%3E%3Cpath d='M85 212 C92 206, 98 214, 108 208' /%3E%3Ccircle cx='92' cy='48' r='0.6' fill='%236A4B32' stroke='none' opacity='0.4' /%3E%3Ccircle cx='154' cy='134' r='0.5' fill='%236A4B32' stroke='none' opacity='0.35' /%3E%3Ccircle cx='32' cy='112' r='0.55' fill='%236A4B32' stroke='none' opacity='0.4' /%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '220px 220px',
        }}
      />

      {/* 8. Faint Celestial Constellation Watermark (Embedded dry watermark in paper pulp) */}
      <div
        className="absolute top-14 right-[7%] w-[480px] h-[480px] opacity-[0.13] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 80 L110 50 L170 90 L220 60 L260 110' stroke='%238A652E' stroke-width='0.75' stroke-dasharray='3 3'/%3E%3Ccircle cx='50' cy='80' r='2.5' fill='%238A652E'/%3E%3Ccircle cx='110' cy='50' r='3.5' fill='%238A652E'/%3E%3Ccircle cx='170' cy='90' r='2' fill='%238A652E'/%3E%3Ccircle cx='220' cy='60' r='3' fill='%238A652E'/%3E%3Ccircle cx='260' cy='110' r='2.5' fill='%238A652E'/%3E%3Cpath d='M70 190 L130 170 L180 210 L230 180' stroke='%238A652E' stroke-width='0.6' stroke-dasharray='2 2'/%3E%3Ccircle cx='70' cy='190' r='2' fill='%238A652E'/%3E%3Ccircle cx='130' cy='170' r='2.8' fill='%238A652E'/%3E%3Ccircle cx='180' cy='210' r='2' fill='%238A652E'/%3E%3Ccircle cx='230' cy='180' r='2.5' fill='%238A652E'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* 9. Authentic Aged Tea / Moisture Ring Marks & Mineral Foxing Spots */}
      <div
        className="absolute bottom-16 left-[8%] w-[340px] h-[340px] rounded-full pointer-events-none opacity-[0.13]"
        style={{
          background:
            'radial-gradient(circle, transparent 56%, rgba(135, 95, 62, 0.45) 68%, rgba(115, 78, 48, 0.22) 84%, transparent 100%)',
        }}
      />
      <div
        className="absolute top-24 left-[22%] w-[180px] h-[180px] rounded-full pointer-events-none opacity-[0.08]"
        style={{
          background:
            'radial-gradient(circle, transparent 50%, rgba(140, 100, 65, 0.35) 66%, transparent 95%)',
        }}
      />

      {/* 10. Natural Paper Edge Aging, Desk Oxidation & Perimeter Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 95% 85% at 50% 50%, transparent 58%, rgba(145, 110, 75, 0.16) 78%, rgba(85, 58, 36, 0.36) 92%, rgba(42, 26, 14, 0.52) 100%)',
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

/**
 * Vintage Burgundy Wax Seal with Antique Gold Stamped Emblem
 * Authentic dimensional wax seal with organic melted rim, deep wine burgundy body,
 * and an embossed antique gold star emblem in the center.
 */
export const VintageWaxSeal: React.FC<{
  size?: number;
  className?: string;
  symbol?: string;
}> = ({ size = 44, className = '', symbol = '✦' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_3px_6px_rgba(60,20,30,0.32)]"
      >
        <defs>
          {/* Dimensional wax lighting gradient */}
          <radialGradient id="waxGradient" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#9B3B4B" />
            <stop offset="35%" stopColor="#7A2E3B" />
            <stop offset="75%" stopColor="#5E202B" />
            <stop offset="100%" stopColor="#42141C" />
          </radialGradient>
          {/* Inner basin gradient */}
          <radialGradient id="waxBasin" cx="42%" cy="40%" r="58%">
            <stop offset="0%" stopColor="#8A3240" />
            <stop offset="60%" stopColor="#6C2633" />
            <stop offset="100%" stopColor="#4E1A23" />
          </radialGradient>
        </defs>

        {/* Organic melted wax outer boundary */}
        <path
          d="M26 2C32 1.8 37 4.5 42 7.5C47 10.5 50.5 15.5 51 21C51.5 26.5 49 32 46 37C43 42 38.5 46.5 33 48.5C27.5 50.5 21.5 50.2 16 48C10.5 45.8 6.5 41.5 4 36C1.5 30.5 0.5 24.5 2 19C3.5 13.5 7.5 9 12.5 6C17.5 3 22 2.2 26 2Z"
          fill="url(#waxGradient)"
        />

        {/* Outer wax puddle rim highlight */}
        <path
          d="M26 4C31 3.8 35.5 6 39.5 8.5C44 11 47 15 47.5 20C48 24.5 46 29.5 43.5 34C41 38.5 37 42 32.5 44C27.5 45.8 22.5 45.5 17.5 43.5C12.5 41.5 9 37.5 7 33C5 28.5 4.2 23.5 5.5 18.5C6.8 13.5 10 9.8 14.5 7C18.5 4.5 22.5 4.2 26 4Z"
          stroke="#B55162"
          strokeWidth="0.8"
          strokeOpacity="0.45"
          fill="none"
        />

        {/* Inner pressed matrix basin */}
        <circle cx="26" cy="26" r="17" fill="url(#waxBasin)" />
        <circle
          cx="26"
          cy="26"
          r="17"
          stroke="#42141C"
          strokeWidth="1.2"
          strokeOpacity="0.75"
        />
        <circle
          cx="26"
          cy="26"
          r="15"
          stroke="#C2934D"
          strokeWidth="0.75"
          strokeDasharray="2.5 1.5"
          strokeOpacity="0.7"
        />

        {/* Antique Gold Stamped Emblem (Star / Monogram) */}
        <path
          d="M26 15L28 22.5L35.5 24.5L29.5 29L31.5 36.5L26 32.5L20.5 36.5L22.5 29L16.5 24.5L24 22.5Z"
          fill="#DFB978"
          fillOpacity="0.88"
          stroke="#9B753A"
          strokeWidth="0.6"
        />
        <circle cx="26" cy="26" r="2.2" fill="#FFE5B0" />
      </svg>
    </div>
  );
};

/**
 * Vintage Archival Record Stamp (Watermark / Inset)
 * Faint pressed archival verification ring for record folios.
 */
export const VintageArchivalStamp: React.FC<{
  size?: number;
  className?: string;
  label?: string;
  year?: string;
}> = ({ size = 96, className = '', label = 'STARLIT ARCHIVE', year = '1926' }) => {
  return (
    <div
      className={`inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="#7A2E3B"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="#8A6E59"
          strokeWidth="0.8"
        />
        <circle
          cx="50"
          cy="50"
          r="26"
          stroke="#7A2E3B"
          strokeWidth="0.6"
        />
        <path
          d="M50 18 L50 22 M50 78 L50 82 M18 50 L22 50 M78 50 L82 50"
          stroke="#8A6E59"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Curving text simulated / clean typography */}
        <text
          x="50"
          y="34"
          textAnchor="middle"
          fill="#7A2E3B"
          fontSize="7"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="700"
          letterSpacing="1.8"
        >
          {label}
        </text>
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fill="#5C4A42"
          fontSize="11"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontWeight="700"
          letterSpacing="1"
        >
          {year}
        </text>
        <text
          x="50"
          y="68"
          textAnchor="middle"
          fill="#8A6E59"
          fontSize="6"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="600"
          letterSpacing="1.5"
        >
          RECORD FOLIO
        </text>
        {/* Tiny stars */}
        <path
          d="M32 50 L33.5 52 L36 53 L33.5 54 L32 56 L30.5 54 L28 53 L30.5 52 Z"
          fill="#C2934D"
        />
        <path
          d="M68 50 L69.5 52 L72 53 L69.5 54 L68 56 L66.5 54 L64 53 L66.5 52 Z"
          fill="#C2934D"
        />
      </svg>
    </div>
  );
};

