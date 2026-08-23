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
import { useTheme } from '../../hooks';
import { VintageOpenWhenCard } from './VintageOpenWhenCard';

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

interface ThemedEnvelopeStyle {
  envelopeBg: string;
  envelopeBorder: string;
  envelopeShadow: string;
  envelopeHoverShadow: string;
  envelopeHoverBorder: string;
  flapStroke: string;
  sealGradient: string;
  sealBorder: string;
  sealTextColor: string;
  stampBg: string;
  stampBorder: string;
  stampTextColor: string;
  stampLabel: string;
  accentBadgeBg: string;
  accentBadgeBorder: string;
  accentBadgeText: string;
  titleColor: string;
  titleHoverColor: string;
  triggerBg: string;
  triggerBorder: string;
  triggerTextColor: string;
  descColor: string;
  footerTextColor: string;
  footerActionColor: string;
  focusRingColor: string;
}

const getThemedEnvelopeStyle = (
  letter: OpenWhenLetter,
  theme: string
): ThemedEnvelopeStyle => {
  const icon = letter.icon || '';
  const title = letter.title.toLowerCase();
  const isScrapbook = theme === 'whimsical-scrapbook';

  if (isScrapbook) {
    // Whimsical Scrapbook: Enchanted Forest & Pressed Botanical
    let sealGradient = 'radial-gradient(circle at 35% 35%, #4F6B48 0%, #354E30 60%, #1A2B16 100%)';
    let sealBorder = 'rgba(216, 184, 106, 0.55)';
    let sealTextColor = '#FFF8E8';
    let stampBg = 'rgba(79, 107, 72, 0.25)';
    let stampBorder = 'rgba(216, 184, 106, 0.35)';
    let stampTextColor = '#D8B86A';
    let stampLabel = 'BOTANICAL';
    let accentBadgeBg = 'rgba(79, 107, 72, 0.2)';
    let accentBadgeBorder = 'rgba(216, 184, 106, 0.25)';
    let accentBadgeText = '#D8B86A';

    if (icon === 'Moon' || title.includes('sleep') || title.includes('night')) {
      sealGradient = 'radial-gradient(circle at 35% 35%, #8D6DA2 0%, #5B3F6E 60%, #322040 100%)';
      sealBorder = 'rgba(198, 166, 216, 0.6)';
      sealTextColor = '#F5ECFA';
      stampBg = 'rgba(141, 109, 162, 0.25)';
      stampBorder = 'rgba(198, 166, 216, 0.4)';
      stampTextColor = '#C6A6D8';
      stampLabel = 'SLUMBER';
      accentBadgeBg = 'rgba(141, 109, 162, 0.18)';
      accentBadgeBorder = 'rgba(198, 166, 216, 0.3)';
      accentBadgeText = '#C6A6D8';
    } else if (icon === 'Smile' || icon === 'Sun' || title.includes('smile') || title.includes('celebrating') || title.includes('special')) {
      sealGradient = 'radial-gradient(circle at 35% 35%, #D8B86A 0%, #A48439 60%, #5C4416 100%)';
      sealBorder = 'rgba(255, 235, 175, 0.65)';
      sealTextColor = '#FFFDF5';
      stampBg = 'rgba(216, 184, 106, 0.22)';
      stampBorder = 'rgba(216, 184, 106, 0.45)';
      stampTextColor = '#D8B86A';
      stampLabel = 'SUNLIGHT';
      accentBadgeBg = 'rgba(216, 184, 106, 0.18)';
      accentBadgeBorder = 'rgba(216, 184, 106, 0.35)';
      accentBadgeText = '#D8B86A';
    } else if (icon === 'Flame' || icon === 'Shield' || title.includes('motivation') || title.includes('courage')) {
      sealGradient = 'radial-gradient(circle at 35% 35%, #9E5B3D 0%, #763F28 60%, #462214 100%)';
      sealBorder = 'rgba(230, 160, 120, 0.55)';
      sealTextColor = '#FDF0E9';
      stampBg = 'rgba(158, 91, 61, 0.25)';
      stampBorder = 'rgba(230, 160, 120, 0.4)';
      stampTextColor = '#E89C76';
      stampLabel = 'COURAGE';
      accentBadgeBg = 'rgba(158, 91, 61, 0.18)';
      accentBadgeBorder = 'rgba(230, 160, 120, 0.3)';
      accentBadgeText = '#E89C76';
    } else if (icon === 'Heart' || title.includes('miss') || title.includes('loved')) {
      sealGradient = 'radial-gradient(circle at 35% 35%, #A65476 0%, #7A3653 60%, #471C2E 100%)';
      sealBorder = 'rgba(230, 160, 196, 0.55)';
      sealTextColor = '#FDEBF2';
      stampBg = 'rgba(166, 84, 118, 0.22)';
      stampBorder = 'rgba(230, 160, 196, 0.4)';
      stampTextColor = '#E6A0C4';
      stampLabel = 'HEART';
      accentBadgeBg = 'rgba(166, 84, 118, 0.18)';
      accentBadgeBorder = 'rgba(230, 160, 196, 0.3)';
      accentBadgeText = '#E6A0C4';
    }

    return {
      envelopeBg: 'linear-gradient(145deg, rgba(16, 30, 20, 0.85) 0%, rgba(10, 22, 13, 0.92) 100%)',
      envelopeBorder: 'rgba(216, 184, 106, 0.22)',
      envelopeShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.25)',
      envelopeHoverShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.65), 0 0 20px rgba(79, 107, 72, 0.25)',
      envelopeHoverBorder: 'rgba(216, 184, 106, 0.45)',
      flapStroke: 'rgba(216, 184, 106, 0.22)',
      sealGradient,
      sealBorder,
      sealTextColor,
      stampBg,
      stampBorder,
      stampTextColor,
      stampLabel,
      accentBadgeBg,
      accentBadgeBorder,
      accentBadgeText,
      titleColor: '#F7F1DF',
      titleHoverColor: '#D8B86A',
      triggerBg: 'rgba(79, 107, 72, 0.22)',
      triggerBorder: 'rgba(216, 184, 106, 0.25)',
      triggerTextColor: '#D8B86A',
      descColor: '#B8C0AE',
      footerTextColor: '#7F8B78',
      footerActionColor: '#D8B86A',
      focusRingColor: '#D8B86A',
    };
  }

  // Midnight Journal: Celestial Night Envelopes with Antique Gold Accents
  let sealGradient = 'radial-gradient(circle at 35% 35%, #C99B58 0%, #9E7432 60%, #4D330E 100%)';
  let sealBorder = 'rgba(226, 189, 120, 0.65)';
  let sealTextColor = '#FFF8E8';
  let stampBg = 'rgba(201, 155, 88, 0.15)';
  let stampBorder = 'rgba(201, 155, 88, 0.35)';
  let stampTextColor = '#E2BD78';
  let stampLabel = 'MIDNIGHT';
  let accentBadgeBg = 'rgba(201, 155, 88, 0.14)';
  let accentBadgeBorder = 'rgba(201, 155, 88, 0.3)';
  let accentBadgeText = '#E2BD78';

  if (icon === 'Moon' || title.includes('sleep') || title.includes('night')) {
    sealGradient = 'radial-gradient(circle at 35% 35%, #6D526F 0%, #4B364D 60%, #2A1A2C 100%)';
    sealBorder = 'rgba(180, 145, 185, 0.6)';
    sealTextColor = '#F3EAF5';
    stampBg = 'rgba(109, 82, 111, 0.25)';
    stampBorder = 'rgba(180, 145, 185, 0.4)';
    stampTextColor = '#9A789C';
    stampLabel = 'SLUMBER';
    accentBadgeBg = 'rgba(109, 82, 111, 0.18)';
    accentBadgeBorder = 'rgba(180, 145, 185, 0.3)';
    accentBadgeText = '#9A789C';
  } else if (icon === 'Compass' || icon === 'CloudRain' || title.includes('lost') || title.includes('bad day')) {
    sealGradient = 'radial-gradient(circle at 35% 35%, #3B5B7E 0%, #243D59 60%, #122233 100%)';
    sealBorder = 'rgba(140, 175, 215, 0.55)';
    sealTextColor = '#E0EDFA';
    stampBg = 'rgba(59, 91, 126, 0.25)';
    stampBorder = 'rgba(140, 175, 215, 0.4)';
    stampTextColor = '#8EB8E5';
    stampLabel = 'SOLACE';
    accentBadgeBg = 'rgba(59, 91, 126, 0.18)';
    accentBadgeBorder = 'rgba(140, 175, 215, 0.3)';
    accentBadgeText = '#8EB8E5';
  } else if (icon === 'Flame' || icon === 'Shield' || title.includes('motivation') || title.includes('courage')) {
    sealGradient = 'radial-gradient(circle at 35% 35%, #C99B58 0%, #9A6F30 60%, #543912 100%)';
    sealBorder = 'rgba(244, 209, 138, 0.65)';
    sealTextColor = '#FFFDF5';
    stampBg = 'rgba(201, 155, 88, 0.2)';
    stampBorder = 'rgba(244, 209, 138, 0.45)';
    stampTextColor = '#F4D18A';
    stampLabel = 'COURAGE';
    accentBadgeBg = 'rgba(201, 155, 88, 0.16)';
    accentBadgeBorder = 'rgba(244, 209, 138, 0.35)';
    accentBadgeText = '#F4D18A';
  } else if (icon === 'Heart' || title.includes('miss') || title.includes('loved')) {
    sealGradient = 'radial-gradient(circle at 35% 35%, #8B4459 0%, #632C3D 60%, #3B1623 100%)';
    sealBorder = 'rgba(215, 145, 168, 0.55)';
    sealTextColor = '#FCEBF1';
    stampBg = 'rgba(139, 68, 89, 0.22)';
    stampBorder = 'rgba(215, 145, 168, 0.4)';
    stampTextColor = '#E59FB6';
    stampLabel = 'DEVOTION';
    accentBadgeBg = 'rgba(139, 68, 89, 0.18)';
    accentBadgeBorder = 'rgba(215, 145, 168, 0.3)';
    accentBadgeText = '#E59FB6';
  }

  return {
    envelopeBg: 'linear-gradient(145deg, rgba(13, 23, 40, 0.85) 0%, rgba(7, 14, 26, 0.94) 100%)',
    envelopeBorder: 'rgba(201, 155, 88, 0.25)',
    envelopeShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.3)',
    envelopeHoverShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.75), 0 0 22px rgba(201, 155, 88, 0.2)',
    envelopeHoverBorder: 'rgba(201, 155, 88, 0.5)',
    flapStroke: 'rgba(201, 155, 88, 0.22)',
    sealGradient,
    sealBorder,
    sealTextColor,
    stampBg,
    stampBorder,
    stampTextColor,
    stampLabel,
    accentBadgeBg,
    accentBadgeBorder,
    accentBadgeText,
    titleColor: '#F2E4CF',
    titleHoverColor: '#E2BD78',
    triggerBg: 'rgba(201, 155, 88, 0.1)',
    triggerBorder: 'rgba(201, 155, 88, 0.22)',
    triggerTextColor: '#E2BD78',
    descColor: '#C2AF99',
    footerTextColor: '#817568',
    footerActionColor: '#E2BD78',
    focusRingColor: '#C99B58',
  };
};

export interface OpenWhenCardProps extends React.HTMLAttributes<HTMLDivElement> {
  letter: OpenWhenLetter;
  onSelect: (letter: OpenWhenLetter) => void;
}

export const OpenWhenCard: React.FC<OpenWhenCardProps> = ({
  letter,
  onSelect,
  className,
  ...props
}) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';

  if (isLetterArchive) {
    return (
      <VintageOpenWhenCard
        letter={letter}
        onSelect={onSelect}
        className={className}
        {...props}
      />
    );
  }

  const IconComponent = iconMap[letter.icon] || Mail;
  const style = getThemedEnvelopeStyle(letter, theme);

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
        'border backdrop-blur-xs transition-all duration-300 min-h-[250px] sm:min-h-[260px] overflow-hidden',
        'hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:hover:transform-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        className
      )}
      style={{
        background: style.envelopeBg,
        borderColor: style.envelopeBorder,
        boxShadow: style.envelopeShadow,
        // @ts-ignore
        '--tw-ring-color': style.focusRingColor,
        '--tw-ring-offset-color': '#050A16',
      }}
      {...props}
    >
      {/* Envelope Flap Seam Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
        viewBox="0 0 300 240"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 0 L150 110 L300 0"
          stroke={style.flapStroke}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M0 240 L115 110 M300 240 L185 110"
          stroke={style.flapStroke}
          strokeWidth="0.8"
          strokeDasharray="4 3"
        />
      </svg>

      {/* Top Header: Letter Order & Themed Postage Stamp */}
      <div className="relative z-10 flex items-start justify-between gap-3 pt-0.5">
        <div className="space-y-1">
          <span className="text-[11px] font-serif uppercase tracking-wider text-[var(--color-muted)] block">
            Correspondence № {String(letter.order).padStart(2, '0')}
          </span>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-serif font-medium px-2 py-0.5 rounded border"
            style={{
              backgroundColor: style.accentBadgeBg,
              borderColor: style.accentBadgeBorder,
              color: style.accentBadgeText,
            }}
          >
            Sealed Envelope
          </span>
        </div>

        {/* Perforated Stamp with Cancellation Mark */}
        <div
          className="relative px-2 py-1.5 rounded-[4px] border flex flex-col items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-200"
          style={{
            backgroundColor: style.stampBg,
            borderColor: style.stampBorder,
          }}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <IconComponent
              className="h-3.5 w-3.5"
              style={{ color: style.stampTextColor }}
            />
            <span
              className="text-[8.5px] font-mono font-bold tracking-widest"
              style={{ color: style.stampTextColor }}
            >
              ✦
            </span>
          </div>
          <span
            className="text-[7.5px] font-serif uppercase tracking-wider font-semibold opacity-90"
            style={{ color: style.stampTextColor }}
          >
            {style.stampLabel}
          </span>
          {/* Subtle cancellation line */}
          <div
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-[1px] opacity-40"
            style={{ backgroundColor: style.stampTextColor }}
          />
        </div>
      </div>

      {/* Center Presentation: Tactile Seal & Letter Title */}
      <div className="relative z-10 my-3.5 space-y-2.5">
        <div className="flex items-center gap-3">
          {/* Tactile Wax/Foil Seal */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-[0_3px_10px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-all duration-300"
            style={{
              background: style.sealGradient,
              border: `1.5px solid ${style.sealBorder}`,
            }}
          >
            <IconComponent
              className="h-4 w-4"
              style={{ color: style.sealTextColor }}
            />
          </div>

          {/* Letter Title */}
          <h3
            className="text-base sm:text-lg font-serif font-medium leading-snug line-clamp-2 transition-colors duration-200"
            style={{ color: style.titleColor }}
          >
            {letter.title}
          </h3>
        </div>

        {/* Trigger Context Box */}
        <div
          className="rounded-[8px] p-2 sm:p-2.5 border"
          style={{
            backgroundColor: style.triggerBg,
            borderColor: style.triggerBorder,
          }}
        >
          <p className="text-[10px] uppercase font-sans font-medium text-[var(--color-muted)] tracking-wider mb-0.5">
            To be opened:
          </p>
          <p
            className="text-xs sm:text-[12.5px] font-serif italic leading-snug line-clamp-2"
            style={{ color: style.triggerTextColor }}
          >
            "{letter.trigger}"
          </p>
        </div>

        {/* Short Description */}
        <p
          className="text-xs font-serif line-clamp-2 leading-relaxed pt-0.5"
          style={{ color: style.descColor }}
        >
          {letter.shortDescription}
        </p>
      </div>

      {/* Card Footer: Open Hint */}
      <div className="relative z-10 pt-3 border-t border-[var(--color-border-light)] flex items-center justify-between text-xs font-serif">
        <span
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium group-hover:underline"
          style={{ color: style.footerActionColor }}
        >
          <MailOpen className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
          <span>Unfold & read letter</span>
        </span>
        <span
          className="text-[10.5px] font-serif italic"
          style={{ color: style.footerTextColor }}
        >
          Waiting quietly
        </span>
      </div>
    </div>
  );
};

