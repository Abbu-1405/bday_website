import React from 'react';

export interface CatThemeElementProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom';
  customStyle?: React.CSSProperties;
  rotation?: number;
  label?: string;
  visible?: boolean;
}

export const CatThemeElement: React.FC<CatThemeElementProps> = ({
  className = '',
  size = 'md',
  position = 'bottom-right',
  customStyle = {},
  rotation = 0,
  label = 'One Brain Cell Placeholder Cat',
  visible = true,
}) => {
  if (!visible) return null;

  const sizeDimensions = {
    sm: { width: 48, height: 48 },
    md: { width: 72, height: 72 },
    lg: { width: 104, height: 104 },
    xl: { width: 140, height: 140 },
  };

  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'fixed bottom-4 left-4 sm:bottom-6 sm:left-6',
    'top-right': 'fixed top-20 right-4 sm:top-20 sm:right-6',
    'top-left': 'fixed top-20 left-4 sm:top-20 sm:left-6',
    custom: '',
  };

  const { width, height } = sizeDimensions[size];

  return (
    <div
      className={`pointer-events-none select-none z-10 ${position !== 'custom' ? positionClasses[position] : ''} ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        ...customStyle,
      }}
      aria-hidden="true"
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_8px_20px_rgba(249,115,22,0.25)] transition-transform duration-300 hover:scale-105"
      >
        {/* Soft Ambient Glow Behind Cat */}
        <circle cx="50" cy="55" r="38" fill="rgba(249, 115, 22, 0.12)" filter="blur(8px)" />

        {/* Orange Cat Body / Head Silhouette */}
        <path
          d="M15 42L10 16L32 24C38 20 62 20 68 24L90 16L85 42C92 56 90 76 76 88C62 98 38 98 24 88C10 76 8 56 15 42Z"
          fill="#F97316"
          stroke="#EA580C"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Inner Ears */}
        <path d="M18 26L30 31L22 39" fill="#FDBA74" />
        <path d="M82 26L70 31L78 39" fill="#FDBA74" />

        {/* Orange Fur Forehead Markings (Tabby Stripes) */}
        <path d="M50 24V34M42 27L46 35M58 27L54 35" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />

        {/* Unhinged Derpy Wide Eyes */}
        <circle cx="34" cy="52" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
        <circle cx="66" cy="52" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />

        {/* Chaotic / Misaligned Pupils (The One Brain Cell Gaze) */}
        <circle cx="37" cy="50" r="4.5" fill="#0F172A" />
        <circle cx="62" cy="55" r="4.5" fill="#0F172A" />

        {/* Eye Sparkles */}
        <circle cx="39" cy="48" r="1.5" fill="#FFFFFF" />
        <circle cx="64" cy="53" r="1.5" fill="#FFFFFF" />

        {/* Adorable Pink Nose */}
        <polygon points="50,65 44,58 56,58" fill="#FDA4AF" />

        {/* Sassy Whisker Muzzle & Mouth */}
        <path
          d="M44 67C46 71 49 71 50 67C51 71 54 71 56 67"
          stroke="#431407"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Whiskers */}
        <path d="M22 60L8 57M22 66L6 68M22 72L10 77" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
        <path d="M78 60L92 57M78 66L94 68M78 72L90 77" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />

        {/* Single Brain Cell Antenna / Spark Floating on top */}
        <path d="M50 18V6" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 3" />
        <circle cx="50" cy="5" r="3.5" fill="#FDE047" stroke="#F59E0B" strokeWidth="1" />
        <path d="M46 5L54 5M50 1L50 9" stroke="#FFF" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};
