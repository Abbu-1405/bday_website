import React from 'react';

/**
 * Midnight Corner Ornaments
 * Antique gold corner brackets with celestial star and delicate filigree flourishes
 */
export const MidnightCorner: React.FC<{
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
        stroke="#C99B58"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />
      {/* Inner fine accent line */}
      <path
        d="M6 26V8C6 6.89543 6.89543 6 8 6H26"
        stroke="#E2BD78"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
      {/* Tiny 4-point corner star */}
      <path
        d="M10 10L11 12.5L13.5 13.5L11 14.5L10 17L9 14.5L6.5 13.5L9 12.5Z"
        fill="#F4D18A"
        fillOpacity="0.85"
      />
      {/* Micro starlight dot */}
      <circle cx="20" cy="10" r="1" fill="#E2BD78" fillOpacity="0.6" />
      <circle cx="10" cy="20" r="1" fill="#E2BD78" fillOpacity="0.6" />
    </svg>
  );
};

/**
 * Antique Gold Divider with Central Celestial Star
 */
export const MidnightGoldDivider: React.FC<{
  className?: string;
  withStar?: boolean;
}> = ({ className = '', withStar = true }) => {
  return (
    <div className={`flex items-center justify-center gap-3 my-4 pointer-events-none select-none ${className}`} aria-hidden="true">
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[rgba(201,155,88,0.35)] to-[rgba(201,155,88,0.6)]" />
      {withStar && (
        <div className="flex items-center gap-1.5 text-[#C99B58] opacity-85">
          <span className="w-1 h-1 rounded-full bg-[#E2BD78] opacity-60" />
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 0L7.2 4.2L11.4 5.4L7.2 6.6L6 10.8L4.8 6.6L0.6 5.4L4.8 4.2Z"
              fill="#F4D18A"
            />
          </svg>
          <span className="w-1 h-1 rounded-full bg-[#E2BD78] opacity-60" />
        </div>
      )}
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[rgba(201,155,88,0.35)] to-[rgba(201,155,88,0.6)]" />
    </div>
  );
};

/**
 * Wax Seal Stamp Badge
 */
export const MidnightWaxSeal: React.FC<{
  size?: number;
  label?: string;
  className?: string;
}> = ({ size = 28, label = '✦', className = '' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 shadow-md ${className}`}
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 35% 35%, #8A2D3A 0%, #5E1D27 70%, #3B1017 100%)',
        border: '1px solid rgba(226, 189, 120, 0.45)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
      }}
      aria-hidden="true"
    >
      <span className="text-[10px] font-serif font-bold text-[#F4D18A] drop-shadow-xs select-none">
        {label}
      </span>
    </div>
  );
};

/**
 * Mini Wish Lantern Graphic for Cards & Sidebar
 */
export const MiniWishLantern: React.FC<{
  size?: number;
  isLit?: boolean;
  className?: string;
}> = ({ size = 24, isLit = true, className = '' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} aria-hidden="true">
      {isLit && (
        <div
          className="absolute inset-0 rounded-full blur-xs pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(244, 209, 138, 0.45) 0%, transparent 70%)',
          }}
        />
      )}
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 20 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Top wood cap */}
        <rect x="5" y="1" width="10" height="2" rx="1" fill="#C99B58" />
        {/* Lantern glass vessel */}
        <path
          d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V18C17 20.2091 15.2091 22 13 22H7C4.79086 22 3 20.2091 3 18V4Z"
          fill={isLit ? 'url(#lanternLight)' : '#142035'}
          stroke="#C99B58"
          strokeWidth="1"
          strokeOpacity="0.8"
        />
        {/* Inner flame */}
        {isLit && (
          <>
            <circle cx="10" cy="12" r="3.5" fill="#F4D18A" fillOpacity="0.9" />
            <circle cx="10" cy="11.5" r="1.5" fill="#FFF8E8" />
          </>
        )}
        {/* Base bracket */}
        <rect x="6" y="22" width="8" height="2" rx="1" fill="#C99B58" />
        <line x1="10" y1="24" x2="10" y2="26" stroke="#C99B58" strokeWidth="1" />
        <defs>
          <radialGradient id="lanternLight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F4D18A" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#C99B58" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#101B2D" stopOpacity="0.8" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};
