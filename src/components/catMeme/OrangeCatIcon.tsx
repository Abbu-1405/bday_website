import React from 'react';

export interface OrangeCatIconProps {
  className?: string;
  size?: number;
}

export const OrangeCatIcon: React.FC<OrangeCatIconProps> = ({
  className = 'h-4 w-4',
  size = 18,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Orange Cat Head Outline */}
      <path
        d="M3.5 8.5L2 3.5L7.5 5C9 4 15 4 16.5 5L22 3.5L20.5 8.5C22 11.5 22 16 18.5 19.5C15 22.5 9 22.5 5.5 19.5C2 16 2 11.5 3.5 8.5Z"
        fill="#F97316"
        stroke="#EA580C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Inner Ears */}
      <path d="M4 6.5L6.5 7.5L5 9.5" fill="#FDBA74" />
      <path d="M20 6.5L17.5 7.5L19 9.5" fill="#FDBA74" />

      {/* Unhinged Derpy Wide Eyes */}
      <circle cx="8" cy="12" r="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="0.75" />
      <circle cx="16" cy="12" r="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="0.75" />

      {/* Derpy Misaligned Pupils (One Brain Cell Energy) */}
      <circle cx="9" cy="11.5" r="1.2" fill="#0F172A" />
      <circle cx="15" cy="12.8" r="1.2" fill="#0F172A" />

      {/* Cute/Chaotic Pink Nose */}
      <polygon points="12,14.5 10.8,13.2 13.2,13.2" fill="#FDA4AF" />

      {/* Sassy Mouth */}
      <path
        d="M10.5 15.5C11 16.2 11.8 16.2 12 15.2C12.2 16.2 13 16.2 13.5 15.5"
        stroke="#431407"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* The Single Floating Brain Cell Antenna / Spark */}
      <path
        d="M12 4V1M10.5 2L13.5 2"
        stroke="#FBBF24"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="0.5" r="1" fill="#FDE047" />
    </svg>
  );
};
