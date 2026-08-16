import React from 'react';
import { Calendar, Lock, Check, Heart } from 'lucide-react';
import { Note365 } from '../../types';
import { cn } from '../../utils';

export interface VintageEnvelopeTileProps extends React.HTMLAttributes<HTMLDivElement> {
  note: Note365;
  isToday?: boolean;
  onSelectNote?: (note: Note365) => void;
  onLockedClick?: (note: Note365) => void;
}

// Paper color variations for natural, curated correspondence collection
const PAPER_VARIANTS = [
  {
    bg: '#F6EFE3',
    flap: '#EFE5D5',
    border: 'rgba(138, 110, 89, 0.28)',
    innerShadow: 'rgba(90, 68, 50, 0.08)',
  },
  {
    bg: '#F3ECE0',
    flap: '#EADFCF',
    border: 'rgba(138, 110, 89, 0.30)',
    innerShadow: 'rgba(90, 68, 50, 0.09)',
  },
  {
    bg: '#F6EFEB',
    flap: '#EDE2DC',
    border: 'rgba(145, 105, 105, 0.28)',
    innerShadow: 'rgba(110, 70, 70, 0.08)',
  },
  {
    bg: '#F1EFEB',
    flap: '#E6E4DC',
    border: 'rgba(115, 125, 115, 0.28)',
    innerShadow: 'rgba(70, 90, 70, 0.08)',
  },
  {
    bg: '#F7F1E6',
    flap: '#EFE7D8',
    border: 'rgba(150, 125, 90, 0.28)',
    innerShadow: 'rgba(100, 80, 50, 0.08)',
  },
  {
    bg: '#F4EFEA',
    flap: '#EBE3DB',
    border: 'rgba(130, 110, 100, 0.28)',
    innerShadow: 'rgba(90, 70, 60, 0.08)',
  },
];

// Wax Seal color & symbol styles
const WAX_SEALS = [
  {
    color: 'radial-gradient(circle at 35% 35%, #9E384A 0%, #7A2E3B 60%, #4E1B24 100%)',
    border: 'rgba(194, 147, 77, 0.45)',
    type: 'botanical',
  },
  {
    color: 'radial-gradient(circle at 35% 35%, #8A4836 0%, #6E3324 60%, #441D12 100%)',
    border: 'rgba(194, 147, 77, 0.45)',
    type: 'star',
  },
  {
    color: 'radial-gradient(circle at 35% 35%, #8B3A4F 0%, #682637 60%, #411420 100%)',
    border: 'rgba(194, 147, 77, 0.45)',
    type: 'moon',
  },
  {
    color: 'radial-gradient(circle at 35% 35%, #6A4B3F 0%, #4D342B 60%, #301F18 100%)',
    border: 'rgba(194, 147, 77, 0.45)',
    type: 'heart',
  },
];

export const VintageEnvelopeTile: React.FC<VintageEnvelopeTileProps> = ({
  className,
  note,
  isToday = false,
  onSelectNote,
  onLockedClick,
  ...props
}) => {
  const { displayDate, title, preview, isUnlocked, isRead, isFavorite } = note;
  const dayIndex = note.dayIndex ?? 1;

  // Deterministic styling variations
  const paperVariant = PAPER_VARIANTS[dayIndex % PAPER_VARIANTS.length];
  const waxVariant = WAX_SEALS[dayIndex % WAX_SEALS.length];
  const stampVariant = dayIndex % 4; // 0: Wildflower, 1: Moon & Star, 2: Fern, 3: Dove
  const rotClass =
    dayIndex % 3 === 0
      ? '-rotate-[0.6deg]'
      : dayIndex % 3 === 1
      ? 'rotate-[0.6deg]'
      : 'rotate-0';

  const handleClick = () => {
    if (isUnlocked && onSelectNote) {
      onSelectNote(note);
    } else if (!isUnlocked) {
      if (onLockedClick) {
        onLockedClick(note);
      } else if (onSelectNote) {
        onSelectNote(note);
      }
    }
  };

  // State-specific physical parameters
  const isUnopened = isUnlocked && !isRead;
  const isOpened = isUnlocked && isRead;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Letter for ${displayDate}: ${title} (${
        !isUnlocked
          ? 'Sealed and locked'
          : isRead
          ? 'Opened letter'
          : 'Unopened sealed letter'
      }${isFavorite ? ', Treasured' : ''})`}
      className={cn(
        'group relative flex flex-col justify-between select-none transition-all duration-300 ease-out cursor-pointer',
        'rounded-[14px] p-4 sm:p-5 min-h-[190px]',
        'focus-visible:ring-2 focus-visible:ring-[#B58A45] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF5EC] focus:outline-none',
        'motion-reduce:hover:transform-none motion-reduce:transition-none',
        rotClass,
        // Elevation & Physical Shadows for Unopened vs Opened vs Locked
        !isUnlocked &&
          'opacity-80 shadow-[0_4px_14px_-2px_rgba(60,42,33,0.08)] hover:-translate-y-1 hover:shadow-[0_8px_20px_-3px_rgba(60,42,33,0.12)]',
        isUnopened &&
          'shadow-[0_8px_24px_-4px_rgba(60,42,33,0.15),0_3px_8px_-2px_rgba(60,42,33,0.08)] hover:-translate-y-1.5 hover:shadow-[0_16px_32px_-4px_rgba(60,42,33,0.22),0_6px_12px_-2px_rgba(60,42,33,0.10)]',
        isOpened &&
          'shadow-[0_4px_16px_-3px_rgba(60,42,33,0.08),0_1px_4px_-1px_rgba(60,42,33,0.04)] hover:-translate-y-1 hover:shadow-[0_10px_22px_-3px_rgba(60,42,33,0.13)]',
        isToday && 'ring-2 ring-[#7A2E3B] ring-offset-2 ring-offset-[#F7F2EB]',
        className
      )}
      style={{
        backgroundColor: !isUnlocked
          ? '#EDE4DA'
          : isUnopened
          ? paperVariant.bg
          : '#FAF6EF',
        borderColor: !isUnlocked
          ? 'rgba(138, 110, 89, 0.22)'
          : isUnopened
          ? paperVariant.border
          : 'rgba(138, 110, 89, 0.24)',
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Background Paper Micro-Texture & Natural Grain */}
      <div
        className={cn(
          'absolute inset-0 rounded-[14px] mix-blend-multiply pointer-events-none transition-opacity duration-300',
          isUnopened ? 'opacity-42' : 'opacity-30'
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
        }}
      />

      {/* Triangular Envelope Flap Geometry */}
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none overflow-hidden rounded-t-[14px]">
        <svg
          className="w-full h-full"
          viewBox="0 0 300 70"
          preserveAspectRatio="none"
        >
          {/* Top flap triangular fill with gradient */}
          <polygon
            points="0,0 300,0 150,60"
            fill={
              !isUnlocked
                ? '#E5DCD0'
                : isUnopened
                ? paperVariant.flap
                : '#F2EADF'
            }
            stroke={
              isUnopened
                ? paperVariant.border
                : 'rgba(138, 110, 89, 0.22)'
            }
            strokeWidth="0.85"
          />

          {/* Flap top highlight line */}
          <line
            x1="0"
            y1="0"
            x2="150"
            y2="60"
            stroke={
              isUnopened
                ? 'rgba(255, 255, 255, 0.55)'
                : 'rgba(255, 255, 255, 0.35)'
            }
            strokeWidth="0.75"
          />
          <line
            x1="300"
            y1="0"
            x2="150"
            y2="60"
            stroke="rgba(138, 110, 89, 0.25)"
            strokeWidth="0.75"
          />

          {/* Opened Letter subtle secondary crease line */}
          {isOpened && (
            <line
              x1="20"
              y1="4"
              x2="150"
              y2="54"
              stroke="rgba(138, 110, 89, 0.18)"
              strokeWidth="0.65"
              strokeDasharray="4 2"
            />
          )}
        </svg>
      </div>

      {/* Diagonal Envelope Bottom Fold Lines */}
      <div className="absolute inset-0 rounded-[14px] pointer-events-none overflow-hidden">
        <svg
          className={cn(
            'w-full h-full transition-opacity duration-300',
            isUnopened ? 'opacity-40' : 'opacity-25'
          )}
          viewBox="0 0 300 200"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="200"
            x2="132"
            y2="108"
            stroke="#8A6E59"
            strokeWidth="0.75"
            strokeDasharray="4 3"
          />
          <line
            x1="300"
            y1="200"
            x2="168"
            y2="108"
            stroke="#8A6E59"
            strokeWidth="0.75"
            strokeDasharray="4 3"
          />
        </svg>
      </div>

      {/* Central Physical Wax Seal at Flap Apex */}
      <div
        className={cn(
          'absolute top-9 sm:top-10 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center select-none transition-all duration-300',
          'w-8 h-8 rounded-full',
          'motion-reduce:transition-none motion-reduce:group-hover:scale-100',
          isUnopened &&
            'shadow-[0_4px_10px_rgba(60,20,30,0.38),inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.45)] group-hover:scale-105 group-hover:brightness-110',
          isOpened &&
            'shadow-[0_2px_6px_rgba(60,20,30,0.22),inset_0_1px_1.5px_rgba(255,255,255,0.25),inset_0_-1px_1.5px_rgba(0,0,0,0.35)] opacity-92 group-hover:opacity-100',
          !isUnlocked &&
            'shadow-[0_2px_5px_rgba(40,30,25,0.35),inset_0_1px_1px_rgba(255,255,255,0.15)] opacity-85'
        )}
        style={{
          background: !isUnlocked
            ? 'radial-gradient(circle at 35% 35%, #5A433A 0%, #3D2B24 60%, #241712 100%)'
            : isUnopened
            ? waxVariant.color
            : 'radial-gradient(circle at 35% 35%, #8B3847 0%, #682632 60%, #42161E 100%)',
          border: !isUnlocked
            ? '1px solid rgba(138, 110, 89, 0.4)'
            : isUnopened
            ? `1px solid ${waxVariant.border}`
            : '1px solid rgba(194, 147, 77, 0.35)',
        }}
        title={
          !isUnlocked
            ? 'Sealed & Locked'
            : isRead
            ? 'Opened Letter'
            : 'Sealed & Waiting'
        }
      >
        {/* Wax seal embossed emblem */}
        {!isUnlocked ? (
          <Lock className="w-3.5 h-3.5 text-[#EFE0C1] opacity-85" />
        ) : isOpened ? (
          /* Opened/Broken Wax Seal: Authentic parting fissure across the emblem */
          <div className="relative w-full h-full flex items-center justify-center text-[#DFB978]">
            {/* Softened broken emblem */}
            <div className="opacity-80">
              {waxVariant.type === 'botanical' && (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2C8 6 5 9 3 13M8 6C10 5 13 6 13 8C11 10 9 9 8 6ZM5 9C6 7 8 8 7 10C5.5 11 5 10 5 9Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
              )}
              {waxVariant.type === 'star' && (
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 1L8.2 5.2L12.5 6.5L8.2 7.8L7 12L5.8 7.8L1.5 6.5L5.8 5.2Z" fill="currentColor" />
                </svg>
              )}
              {waxVariant.type === 'moon' && (
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 7C11 10 8.5 12.5 5.5 12.5C4 12.5 2.8 11.8 2 11C4 11 7 9.5 7 5.5C7 3.8 6.2 2.5 5 2C8 2 11 4.5 11 7Z" fill="currentColor" />
                </svg>
              )}
              {waxVariant.type === 'heart' && (
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 12S2 8.5 2 5.2C2 3.4 3.4 2 5.2 2C6.3 2 7 2.6 7 2.6S7.7 2 8.8 2C10.6 2 12 3.4 12 5.2C12 8.5 7 12 7 12Z" fill="currentColor" />
                </svg>
              )}
            </div>

            {/* Fine natural hairline split indicating unsealed wax */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                d="M16 2 L15.2 10 L16.8 16 L15 22 L16 30"
                stroke="rgba(30, 10, 15, 0.7)"
                strokeWidth="0.85"
                strokeLinecap="round"
              />
              <path
                d="M16.5 2.5 L15.7 10.5 L17.3 16.5 L15.5 22.5 L16.5 30"
                stroke="rgba(255, 230, 180, 0.45)"
                strokeWidth="0.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : (
          /* Unopened Intact Seal: Pristine lustrous emblem */
          <div className="text-[#DFB978] opacity-95 transition-transform duration-200">
            {waxVariant.type === 'botanical' && (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2C8 6 5 9 3 13M8 6C10 5 13 6 13 8C11 10 9 9 8 6ZM5 9C6 7 8 8 7 10C5.5 11 5 10 5 9Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            )}
            {waxVariant.type === 'star' && (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1L8.2 5.2L12.5 6.5L8.2 7.8L7 12L5.8 7.8L1.5 6.5L5.8 5.2Z" fill="currentColor" />
              </svg>
            )}
            {waxVariant.type === 'moon' && (
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 7C11 10 8.5 12.5 5.5 12.5C4 12.5 2.8 11.8 2 11C4 11 7 9.5 7 5.5C7 3.8 6.2 2.5 5 2C8 2 11 4.5 11 7Z" fill="currentColor" />
              </svg>
            )}
            {waxVariant.type === 'heart' && (
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 12S2 8.5 2 5.2C2 3.4 3.4 2 5.2 2C6.3 2 7 2.6 7 2.6S7.7 2 8.8 2C10.6 2 12 3.4 12 5.2C12 8.5 7 12 7 12Z" fill="currentColor" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Top Header Layer: Date, Stamp & Favorite Mark */}
      <div className="relative z-10 flex items-start justify-between gap-2 pt-1">
        {/* Left: Date & Status Text in Vintage Calligraphy */}
        <div className="space-y-0.5 max-w-[60%]">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-serif font-medium text-[#7A6253] tracking-wide">
            <Calendar className="h-3 w-3 text-[#7A2E3B] shrink-0" />
            {displayDate}
          </span>
          <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
            {isToday && (
              <span className="text-[10px] uppercase font-semibold text-[#7A2E3B] bg-[#7A2E3B]/10 px-1.5 py-0.5 rounded border border-[#7A2E3B]/25">
                Today
              </span>
            )}
            {isFavorite && (
              <span
                className="inline-flex items-center gap-1 text-[10.5px] font-serif text-[#8A5B20] bg-[#F5EAD7] px-1.5 py-0.5 rounded border border-[#C5A35A]/45 shadow-2xs group-hover:border-[#B58A45] transition-colors"
                title="Treasured correspondence"
              >
                <Heart className="h-3 w-3 fill-[#B58A45] text-[#B58A45] transition-transform duration-200 group-hover:scale-110" />
                <span className="text-[9px] font-semibold tracking-wider uppercase text-[#8A5B20]">
                  Treasured
                </span>
              </span>
            )}
            {!isUnlocked && (
              <span className="text-[10px] text-[#8C776C] italic font-serif">
                (Sealed)
              </span>
            )}
            {isUnlocked && isRead && (
              <span className="text-[10px] text-[#6B5547] font-serif italic">
                (Opened)
              </span>
            )}
            {isUnlocked && !isRead && (
              <span className="text-[10px] text-[#7A2E3B] font-serif italic">
                (Sealed)
              </span>
            )}
          </div>
        </div>

        {/* Right: Vintage Postage Stamp */}
        <div
          className={cn(
            'relative flex flex-col items-center justify-center',
            'w-10 h-12 rounded-[2px] bg-[#FAF4EA] shadow-xs',
            'border border-dashed border-[#8A6E59]/60 p-1 select-none shrink-0'
          )}
          style={{
            transform: dayIndex % 2 === 0 ? 'rotate(1.5deg)' : 'rotate(-1.2deg)',
          }}
        >
          {/* Inner stamp frame */}
          <div className="w-full h-full border border-[rgba(138,110,89,0.3)] flex flex-col items-center justify-between p-0.5 bg-[#FAF6F0]">
            <span className="text-[6.5px] font-sans font-semibold tracking-wider text-[#8A6E59] uppercase">
              POST
            </span>

            {/* Stamp artwork */}
            <div className="text-[#7A2E3B] opacity-80 my-auto">
              {stampVariant === 0 && (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 14V7M8 7C6 5 4 6 4 8C4 10 7 11 8 7ZM8 7C10 5 12 6 12 8C12 10 9 11 8 7ZM8 4A1 1 0 108 2A1 1 0 008 4Z" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" />
                </svg>
              )}
              {stampVariant === 1 && (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8C12 11.5 9 13.5 6 13.5C4 13.5 2.5 12.5 2 11.5C4 11.5 7 10 7 6C7 4.2 6 3 5 2.5C9 2.5 12 5 12 8Z" fill="#C2934D" fillOpacity="0.75" />
                  <circle cx="11.5" cy="4" r="1" fill="#7A2E3B" />
                </svg>
              )}
              {stampVariant === 2 && (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 14C6 11 10 7 13 3M7 10C5 9 4 10 4 11M9 8C11 7 12 8 11 9M11 5C13 4 14 5 13 6" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" />
                </svg>
              )}
              {stampVariant === 3 && (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 9C5 8 9 5 13 3C11 7 10 11 6 13C5 11 3 10 2 9Z" fill="#7A2E3B" fillOpacity="0.65" stroke="currentColor" strokeWidth="0.6" />
                </svg>
              )}
            </div>

            <span className="text-[6px] font-mono text-[#8C776C]">
              2026
            </span>
          </div>

          {/* Cancellation ink wave overlay */}
          <div className="absolute -left-2 top-2 pointer-events-none opacity-45">
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
              <path d="M0 3C4 1 8 5 12 3C16 1 20 5 24 3" stroke="#5C4A42" strokeWidth="0.7" />
              <path d="M0 7C4 5 8 9 12 7C16 5 20 9 24 7" stroke="#7A2E3B" strokeWidth="0.7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Envelope Body: Title & Inscription */}
      <div className="relative z-10 mt-6 pt-3 space-y-1.5">
        {/* Letter Title written in warm espresso ink */}
        <h3
          className={cn(
            'font-serif text-[1.125rem] sm:text-[1.2rem] leading-snug line-clamp-1 transition-colors duration-200',
            !isUnlocked
              ? 'text-[#8C776C] font-normal italic'
              : isUnopened
              ? 'text-[#2C221E] group-hover:text-[#7A2E3B] font-semibold'
              : 'text-[#3E312B] group-hover:text-[#7A2E3B] font-normal'
          )}
        >
          {title}
        </h3>

        {/* Handwritten / Calligraphic Excerpt */}
        <p
          className={cn(
            'text-[12px] sm:text-[12.5px] line-clamp-2 leading-relaxed font-serif italic',
            !isUnlocked
              ? 'text-[#8C776C]'
              : isUnopened
              ? 'text-[#5C4A42]'
              : 'text-[#6B5547]'
          )}
        >
          {isUnlocked
            ? preview
            : 'This letter remains quietly sealed until its weekly unlock.'}
        </p>
      </div>

      {/* Envelope Footer: Day Index & Postal Inscription */}
      <div className="relative z-10 pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-[rgba(138,110,89,0.22)] flex items-center justify-between text-[11px] text-[#8C776C] font-serif">
        <span className="tracking-wide text-[10.5px] sm:text-[11px]">
          Correspondence № {dayIndex}
        </span>
        {isUnopened && (
          <span className="text-[#7A2E3B] font-medium tracking-wide opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 text-[10.5px] sm:text-[11px]">
            Unfold &rarr;
          </span>
        )}
        {isOpened && (
          <span className="text-[#8A6E59] font-medium tracking-wide opacity-75 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 text-[10.5px] sm:text-[11px]">
            Read &rarr;
          </span>
        )}
        {!isUnlocked && (
          <span className="text-[#8C776C] italic text-[10px]">
            Locked
          </span>
        )}
      </div>
    </div>
  );
};
