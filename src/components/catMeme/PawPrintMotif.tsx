import React from 'react';

export interface PawPrintMotifProps {
  className?: string;
  size?: number;
  opacity?: number;
  rotation?: number;
  color?: string;
}

export const PawPrintMotif: React.FC<PawPrintMotifProps> = ({
  className = '',
  size = 24,
  opacity = 0.08,
  rotation = 0,
  color = '#F97316',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{
        opacity,
        transform: `rotate(${rotation}deg)`,
      }}
      aria-hidden="true"
    >
      {/* Main Center Pad */}
      <path
        d="M12 10.5C9.8 10.5 8 12.3 8 15C8 17.5 9.8 19.5 12 19.5C14.2 19.5 16 17.5 16 15C16 12.3 14.2 10.5 12 10.5Z"
        fill={color}
      />
      {/* Top Left Toe Pad */}
      <circle cx="6.5" cy="8.5" r="2.2" fill={color} />
      {/* Top Center-Left Toe Pad */}
      <circle cx="10" cy="5.5" r="2.2" fill={color} />
      {/* Top Center-Right Toe Pad */}
      <circle cx="14" cy="5.5" r="2.2" fill={color} />
      {/* Top Right Toe Pad */}
      <circle cx="17.5" cy="8.5" r="2.2" fill={color} />
    </svg>
  );
};
