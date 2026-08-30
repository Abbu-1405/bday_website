import React from 'react';
import { CatExpressionType } from '../../types/catMeme';

export interface CatVariantGraphicProps {
  variant: CatExpressionType;
  catId?: string;
  archetypeColor?: string;
  size?: number;
  className?: string;
}

export const CatVariantGraphic: React.FC<CatVariantGraphicProps> = ({
  variant,
  catId,
  archetypeColor = '#F97316',
  size = 80,
  className = '',
}) => {
  // Determine fur and border colors based on archetype
  const isSmudge = catId === 'smudge-table-cat';
  const isGrumpy = catId === 'grumpy-tardar';
  const isGolden = catId === 'legendary-golden-brain-cell';
  const isPolite = catId === 'polite-ollie-cat';
  const isScreaming = catId === 'dramatic-screaming-cat';

  const baseFurColor = isGolden
    ? '#F59E0B'
    : isSmudge
    ? '#F8FAFC'
    : isPolite
    ? '#E2E8F0'
    : isGrumpy
    ? '#D6D3D1'
    : archetypeColor;

  const strokeColor = isGolden
    ? '#D97706'
    : isSmudge
    ? '#94A3B8'
    : isPolite
    ? '#64748B'
    : isGrumpy
    ? '#57534E'
    : '#EA580C';

  const innerEarColor = isSmudge ? '#FDA4AF' : isGolden ? '#FDE68A' : '#FDBA74';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none drop-shadow-[0_8px_24px_rgba(249,115,22,0.28)] ${className}`}
      aria-hidden="true"
    >
      {/* Soft Ambient Starlight Glow */}
      <circle
        cx="50"
        cy="55"
        r="38"
        fill={isGolden ? 'rgba(245, 158, 11, 0.28)' : 'rgba(249, 115, 22, 0.14)'}
        filter="blur(8px)"
      />

      {/* Cat Head Outline */}
      <path
        d="M15 42L10 16L32 24C38 20 62 20 68 24L90 16L85 42C92 56 90 76 76 88C62 98 38 98 24 88C10 76 8 56 15 42Z"
        fill={baseFurColor}
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Inner Ears */}
      <path d="M18 26L30 31L22 39" fill={innerEarColor} />
      <path d="M82 26L70 31L78 39" fill={innerEarColor} />

      {/* Forehead Stripes / Accents (except for solid white cats) */}
      {!isSmudge && (
        <path
          d="M50 24V34M42 27L46 35M58 27L54 35"
          stroke={isGolden ? '#B45309' : isGrumpy ? '#78716C' : '#C2410C'}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}

      {/* Grumpy Eye Mask Patches */}
      {isGrumpy && (
        <>
          <ellipse cx="35" cy="50" rx="14" ry="12" fill="#78716C" opacity="0.4" />
          <ellipse cx="65" cy="50" rx="14" ry="12" fill="#78716C" opacity="0.4" />
        </>
      )}

      {/* ================================================================= */}
      {/* EXPRESSION RENDERING                                              */}
      {/* ================================================================= */}

      {variant === 'sleepy' ? (
        <>
          {/* Closed Sleeping Eyes */}
          <path d="M26 54C30 58 38 58 42 54" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          <path d="M58 54C62 58 70 58 74 54" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          <text x="74" y="38" fill="#FDBA74" fontSize="14" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="82" y="28" fill="#FDBA74" fontSize="11" fontWeight="bold" fontFamily="sans-serif">z</text>
        </>
      ) : variant === 'surprised' ? (
        <>
          {/* Huge Wide O_O Eyes */}
          <circle cx="34" cy="50" r="13" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="66" cy="50" r="13" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="34" cy="50" r="6" fill="#0F172A" />
          <circle cx="66" cy="50" r="6" fill="#0F172A" />
          <circle cx="36" cy="47" r="2.5" fill="#FFFFFF" />
          <circle cx="68" cy="47" r="2.5" fill="#FFFFFF" />
        </>
      ) : variant === 'confused' ? (
        <>
          {/* Asymmetric Perplexed Eyes */}
          <circle cx="33" cy="52" r="12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="67" cy="52" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="36" cy="50" r="4.5" fill="#0F172A" />
          <circle cx="64" cy="55" r="3.5" fill="#0F172A" />
          <circle cx="38" cy="48" r="1.5" fill="#FFFFFF" />
          <circle cx="65" cy="53" r="1.5" fill="#FFFFFF" />
          <text x="78" y="36" fill="#FBBF24" fontSize="16" fontWeight="bold" fontFamily="sans-serif">?</text>
        </>
      ) : variant === 'judgmental' ? (
        <>
          {/* Squinting Disdainful Eyes (Smudge Style) */}
          <path d="M24 50C30 46 38 46 44 50" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M56 50C62 46 70 46 76 50" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="34" cy="51" r="2.5" fill="#0F172A" />
          <circle cx="66" cy="51" r="2.5" fill="#0F172A" />
          <path d="M26 44L42 47" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <path d="M74 44L58 47" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : variant === 'angry' ? (
        <>
          {/* Angry / Grumpy Angled Eyes & Furrowed Brows */}
          <path d="M24 43L42 50" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M76 43L58 50" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="33" cy="53" r="6" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
          <circle cx="67" cy="53" r="6" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
          <circle cx="34" cy="53" r="2.5" fill="#0F172A" />
          <circle cx="66" cy="53" r="2.5" fill="#0F172A" />
        </>
      ) : variant === 'smug' ? (
        <>
          {/* Smug / Polite Awkward Smile & Wide Calm Eyes */}
          <circle cx="34" cy="51" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="66" cy="51" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="35" cy="51" r="4.5" fill="#0F172A" />
          <circle cx="67" cy="51" r="4.5" fill="#0F172A" />
          <circle cx="37" cy="49" r="1.5" fill="#FFFFFF" />
          <circle cx="69" cy="49" r="1.5" fill="#FFFFFF" />
          <path d="M26 44C32 41 40 44 42 46" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : variant === 'shocked' ? (
        <>
          {/* Dramatic Screaming / Shocked Gasps */}
          <circle cx="34" cy="46" r="13" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
          <circle cx="66" cy="46" r="13" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
          <circle cx="34" cy="46" r="4" fill="#0F172A" />
          <circle cx="66" cy="46" r="4" fill="#0F172A" />
          {/* Dramatic tear / sweat drop */}
          <path d="M80 46C82 52 86 52 86 46C86 40 80 46 80 46Z" fill="#38BDF8" />
        </>
      ) : variant === 'curious' ? (
        <>
          {/* Inquisitive Up-Right Gaze */}
          <circle cx="34" cy="52" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="66" cy="52" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="38" cy="47" r="4.5" fill="#0F172A" />
          <circle cx="70" cy="47" r="4.5" fill="#0F172A" />
          <circle cx="40" cy="45" r="1.5" fill="#FFFFFF" />
          <circle cx="72" cy="45" r="1.5" fill="#FFFFFF" />
        </>
      ) : variant === 'excited' ? (
        <>
          {/* Joyful Happy Curved Eyes */}
          <path d="M26 50C28 44 38 44 42 50" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          <path d="M58 50C60 44 70 44 74 50" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          <path d="M48 40L50 35L52 40L57 42L52 44L50 49L48 44L43 42L48 40Z" fill="#FDE047" />
        </>
      ) : variant === 'neutral' ? (
        <>
          {/* Calm Serene Neutral Eyes */}
          <circle cx="34" cy="52" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="66" cy="52" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="34" cy="52" r="4" fill="#0F172A" />
          <circle cx="66" cy="52" r="4" fill="#0F172A" />
        </>
      ) : (
        <>
          {/* Derp / Default One Brain Cell Gaze */}
          <circle cx="34" cy="52" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="66" cy="52" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="37" cy="50" r="4.5" fill="#0F172A" />
          <circle cx="62" cy="55" r="4.5" fill="#0F172A" />
          <circle cx="39" cy="48" r="1.5" fill="#FFFFFF" />
          <circle cx="64" cy="53" r="1.5" fill="#FFFFFF" />
        </>
      )}

      {/* Nose */}
      <polygon points="50,65 44,58 56,58" fill="#FDA4AF" />

      {/* Mouth based on expression & cat */}
      {variant === 'shocked' || isScreaming ? (
        /* Wide Screaming/Gasping Mouth */
        <ellipse cx="50" cy="74" rx="9" ry="12" fill="#991B1B" stroke="#0F172A" strokeWidth="2.5" />
      ) : variant === 'angry' || isGrumpy ? (
        /* Intense Frown Mouth */
        <path d="M40 73C46 66 54 66 60 73" stroke="#431407" strokeWidth="3" strokeLinecap="round" />
      ) : variant === 'smug' || isPolite ? (
        /* Polite / Tight Smug Smile */
        <path d="M38 68C44 72 56 72 62 67" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" />
      ) : variant === 'judgmental' ? (
        /* Flat Unimpressed Mouth Line */
        <path d="M42 68L58 68" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" />
      ) : variant === 'excited' ? (
        /* Open Happy Smile */
        <path d="M42 67C46 76 54 76 58 67" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" fill="#991B1B" />
      ) : (
        /* Classic W-style Cat Mouth */
        <path
          d="M44 67C46 71 49 71 50 67C51 71 54 71 56 67"
          stroke="#431407"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}

      {/* Whiskers */}
      <path d="M22 60L8 57M22 66L6 68M22 72L10 77" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <path d="M78 60L92 57M78 66L94 68M78 72L90 77" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />

      {/* Spark or Antenna (for Orange Cat & Golden Brain Cell) */}
      {(catId === 'orange-one-brain-cell' || isGolden || variant === 'derp') && (
        <>
          <path d="M50 18V6" stroke={isGolden ? '#F59E0B' : '#FBBF24'} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 3" />
          <circle cx="50" cy="5" r={isGolden ? 5 : 3.5} fill={isGolden ? '#FBBF24' : '#FDE047'} stroke="#F59E0B" strokeWidth="1" />
          <path d="M46 5L54 5M50 1L50 9" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};
