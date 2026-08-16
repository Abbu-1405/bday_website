import React from 'react';
import {
  Heart,
  CloudRain,
  Compass,
  Moon,
  Flame,
  Smile,
  Shield,
  Frown,
  Coffee,
  Sparkles,
  Sun,
  Anchor,
  Mail,
  MailOpen,
  LucideIcon,
} from 'lucide-react';
import { OpenWhenLetter } from '../../types';
import { cn } from '../../utils';
import {
  VintageCornerFlourish,
} from '../letterArchive/LetterArchiveDecorations';

const iconMap: Record<string, LucideIcon> = {
  Heart,
  CloudRain,
  Compass,
  Moon,
  Flame,
  Smile,
  Shield,
  Frown,
  Coffee,
  Sparkles,
  Sun,
  Anchor,
};

interface PersonalityStyle {
  sealGradient: string;
  sealBorder: string;
  sealTextColor: string;
  stampBorder: string;
  stampBg: string;
  stampTextColor: string;
  stampLabel: string;
  accentBadgeBg: string;
  accentBadgeBorder: string;
  accentBadgeText: string;
}

const getPersonality = (letter: OpenWhenLetter): PersonalityStyle => {
  const icon = letter.icon || '';
  const title = letter.title.toLowerCase();

  // 1. Slumber / Night
  if (icon === 'Moon' || title.includes('sleep') || title.includes('night')) {
    return {
      sealGradient: 'radial-gradient(circle at 35% 35%, #4B3860 0%, #352547 60%, #1F152C 100%)',
      sealBorder: 'rgba(180, 150, 210, 0.55)',
      sealTextColor: '#E6DCF5',
      stampBorder: 'rgba(120, 95, 150, 0.45)',
      stampBg: '#EDE4F2',
      stampTextColor: '#352547',
      stampLabel: 'SLUMBER',
      accentBadgeBg: '#F1E9F6',
      accentBadgeBorder: 'rgba(120, 95, 150, 0.3)',
      accentBadgeText: '#352547',
    };
  }

  // 2. Navigation / Lost / Bad Day
  if (icon === 'Compass' || icon === 'CloudRain' || title.includes('lost') || title.includes('bad day')) {
    return {
      sealGradient: 'radial-gradient(circle at 35% 35%, #4C5D73 0%, #364457 60%, #202A36 100%)',
      sealBorder: 'rgba(150, 175, 205, 0.55)',
      sealTextColor: '#DDE7F2',
      stampBorder: 'rgba(90, 115, 145, 0.45)',
      stampBg: '#E4ECF4',
      stampTextColor: '#2B3848',
      stampLabel: 'SOLACE',
      accentBadgeBg: '#EAF0F6',
      accentBadgeBorder: 'rgba(90, 115, 145, 0.3)',
      accentBadgeText: '#2B3848',
    };
  }

  // 3. Anger / Conflict / Peace
  if (icon === 'Frown' || icon === 'Coffee' || title.includes('angry') || title.includes('frustrated') || title.includes('understand')) {
    return {
      sealGradient: 'radial-gradient(circle at 35% 35%, #8B4032 0%, #682828 60%, #451818 100%)',
      sealBorder: 'rgba(210, 140, 100, 0.55)',
      sealTextColor: '#F6DFD7',
      stampBorder: 'rgba(150, 80, 70, 0.45)',
      stampBg: '#F3E5E2',
      stampTextColor: '#5C241B',
      stampLabel: 'PEACE',
      accentBadgeBg: '#F6EAE7',
      accentBadgeBorder: 'rgba(150, 80, 70, 0.3)',
      accentBadgeText: '#5C241B',
    };
  }

  // 4. Courage / Motivation / Strength
  if (icon === 'Flame' || icon === 'Shield' || title.includes('motivation') || title.includes('alone') || title.includes('courage')) {
    return {
      sealGradient: 'radial-gradient(circle at 35% 35%, #C2934D 0%, #9E7432 60%, #63471A 100%)',
      sealBorder: 'rgba(235, 205, 135, 0.65)',
      sealTextColor: '#FFF4DE',
      stampBorder: 'rgba(194, 147, 77, 0.5)',
      stampBg: '#F5ECE0',
      stampTextColor: '#7A5B1D',
      stampLabel: 'COURAGE',
      accentBadgeBg: '#F7EFE4',
      accentBadgeBorder: 'rgba(194, 147, 77, 0.35)',
      accentBadgeText: '#7A5B1D',
    };
  }

  // 5. Joy / Sunshine / Radiance
  if (icon === 'Smile' || icon === 'Sun' || icon === 'Sparkles' || title.includes('smile') || title.includes('special') || title.includes('celebrating')) {
    return {
      sealGradient: 'radial-gradient(circle at 35% 35%, #B87333 0%, #945319 60%, #5E320D 100%)',
      sealBorder: 'rgba(230, 170, 100, 0.55)',
      sealTextColor: '#FDF1E2',
      stampBorder: 'rgba(184, 115, 51, 0.45)',
      stampBg: '#F5ECE2',
      stampTextColor: '#6B3C0F',
      stampLabel: 'RADIANCE',
      accentBadgeBg: '#F7EFE6',
      accentBadgeBorder: 'rgba(184, 115, 51, 0.3)',
      accentBadgeText: '#6B3C0F',
    };
  }

  // Default: Classic Muted Burgundy (Affection / Miss Me / Loved)
  return {
    sealGradient: 'radial-gradient(circle at 35% 35%, #9E384A 0%, #7A2E3B 60%, #4E1B24 100%)',
    sealBorder: 'rgba(194, 147, 77, 0.55)',
    sealTextColor: '#FBE8EC',
    stampBorder: 'rgba(122, 46, 59, 0.45)',
    stampBg: '#F3E4E7',
    stampTextColor: '#7A2E3B',
    stampLabel: 'AFFECTION',
    accentBadgeBg: '#F6EAEB',
    accentBadgeBorder: 'rgba(122, 46, 59, 0.3)',
    accentBadgeText: '#7A2E3B',
  };
};

export interface VintageOpenWhenCardProps extends React.HTMLAttributes<HTMLDivElement> {
  letter: OpenWhenLetter;
  onSelect: (letter: OpenWhenLetter) => void;
}

export const VintageOpenWhenCard: React.FC<VintageOpenWhenCardProps> = ({
  letter,
  onSelect,
  className,
  ...props
}) => {
  const IconComponent = iconMap[letter.icon] || Mail;
  const personality = getPersonality(letter);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(letter)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(letter);
        }
      }}
      aria-label={`Open letter: ${letter.title}`}
      className={cn(
        'group relative flex flex-col justify-between p-5 sm:p-6 rounded-[16px] select-none cursor-pointer',
        'bg-[#FAF5EC] border border-[rgba(138,110,89,0.35)]',
        'shadow-[0_8px_24px_-4px_rgba(60,42,33,0.12),0_2px_6px_rgba(60,42,33,0.06)]',
        'hover:-translate-y-1.5 hover:shadow-[0_18px_38px_-6px_rgba(60,42,33,0.2),0_4px_12px_rgba(60,42,33,0.08)] hover:border-[rgba(138,110,89,0.55)]',
        'transition-all duration-300 min-h-[260px] overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Paper Texture Overlay */}
      <div
        className="absolute inset-0 rounded-[16px] opacity-40 mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
        }}
      />

      {/* Diagonal Envelope Flap Seam Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
        viewBox="0 0 300 240"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 0 L150 110 L300 0"
          stroke="#8A6E59"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M0 240 L115 110 M300 240 L185 110"
          stroke="#8A6E59"
          strokeWidth="0.8"
          strokeDasharray="4 3"
        />
      </svg>

      {/* Subtle Corner Flourishes */}
      <VintageCornerFlourish position="top-left" size={24} className="absolute top-2 left-2 opacity-50 pointer-events-none" />
      <VintageCornerFlourish position="bottom-right" size={20} className="absolute bottom-2 right-2 opacity-35 pointer-events-none" />

      {/* Top Header: Letter Index & Themed Postage Stamp */}
      <div className="relative z-10 flex items-start justify-between gap-3 pt-0.5">
        <div className="space-y-1">
          <span className="text-[11px] font-serif uppercase tracking-wider text-[#8C776C] block">
            Correspondence № {String(letter.order).padStart(2, '0')}
          </span>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-serif font-medium px-2 py-0.5 rounded border"
            style={{
              backgroundColor: personality.accentBadgeBg,
              borderColor: personality.accentBadgeBorder,
              color: personality.accentBadgeText,
            }}
          >
            Sealed Envelope
          </span>
        </div>

        {/* Vintage Themed Stamp with Perforations */}
        <div
          className="relative px-2 py-1.5 rounded-[4px] border flex flex-col items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-200"
          style={{
            backgroundColor: personality.stampBg,
            borderColor: personality.stampBorder,
          }}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <IconComponent
              className="h-3.5 w-3.5"
              style={{ color: personality.stampTextColor }}
            />
            <span
              className="text-[8.5px] font-mono font-bold tracking-widest"
              style={{ color: personality.stampTextColor }}
            >
              1926
            </span>
          </div>
          <span
            className="text-[7.5px] font-serif uppercase tracking-wider font-semibold opacity-85"
            style={{ color: personality.stampTextColor }}
          >
            {personality.stampLabel}
          </span>
          {/* Subtle wavy rubber cancel mark */}
          <div
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-[1px] opacity-40"
            style={{ backgroundColor: personality.stampTextColor }}
          />
        </div>
      </div>

      {/* Center Presentation: Tactile Wax Seal & Title */}
      <div className="relative z-10 my-3.5 space-y-2.5">
        <div className="flex items-center gap-3">
          {/* Tactile Wax Seal with subtle highlight on hover */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-[0_3px_10px_rgba(60,20,30,0.3),inset_0_1px_2px_rgba(255,255,255,0.35)] group-hover:shadow-[0_4px_14px_rgba(60,20,30,0.42),inset_0_1px_2px_rgba(255,255,255,0.5)] transition-all duration-300 group-hover:scale-105"
            style={{
              background: personality.sealGradient,
              border: `1.5px solid ${personality.sealBorder}`,
            }}
          >
            <IconComponent
              className="h-4 w-4"
              style={{ color: personality.sealTextColor }}
            />
          </div>

          {/* Letter Title */}
          <h3 className="text-base sm:text-lg font-serif font-medium text-[#2C221E] group-hover:text-[#7A2E3B] transition-colors leading-snug line-clamp-2">
            {letter.title}
          </h3>
        </div>

        {/* Trigger Situation Inscribed in Warm Burgundy Italic Script */}
        <div className="bg-[#F2E8DC]/70 border border-[rgba(138,110,89,0.25)] rounded-[8px] p-2 sm:p-2.5">
          <p className="text-[10px] uppercase font-sans font-medium text-[#8C776C] tracking-wider mb-0.5">
            To be opened:
          </p>
          <p className="text-xs sm:text-[12.5px] font-serif italic text-[#7A2E3B] leading-snug line-clamp-2">
            "{letter.trigger}"
          </p>
        </div>

        {/* Short Description */}
        <p className="text-xs text-[#6B5547] font-serif line-clamp-2 leading-relaxed pt-0.5">
          {letter.shortDescription}
        </p>
      </div>

      {/* Card Footer: Vintage Open Hint */}
      <div className="relative z-10 pt-3 border-t border-[rgba(138,110,89,0.2)] flex items-center justify-between text-xs font-serif text-[#7A6253]">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[#7A2E3B] font-medium group-hover:underline">
          <MailOpen className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
          <span>Unfold & read letter</span>
        </span>
        <span className="text-[10.5px] font-serif italic text-[#8C776C]">
          Waiting quietly
        </span>
      </div>
    </div>
  );
};
