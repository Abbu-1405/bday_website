import React from 'react';
import {
  Lock,
  Unlock,
  Key,
  Eye,
  Feather,
  Sparkles,
  BookOpen,
  Shield,
  EyeOff,
  HelpCircle,
  LucideIcon,
  ArrowUpRight,
} from 'lucide-react';
import { SecretItem } from '../../types';
import { cn } from '../../utils';

const iconMap: Record<string, LucideIcon> = {
  Key,
  Lock,
  Eye,
  Feather,
  Sparkles,
  BookOpen,
  Shield,
};

export interface SecretCardProps extends React.HTMLAttributes<HTMLDivElement> {
  secret: SecretItem;
  isDiscovered: boolean;
  onDiscover: (secret: SecretItem) => void;
  onOpen: (secret: SecretItem) => void;
}

export const SecretCard: React.FC<SecretCardProps> = ({
  secret,
  isDiscovered,
  onDiscover,
  onOpen,
  className,
  ...props
}) => {
  const IconComponent = iconMap[secret.icon] || Key;

  const handleClick = () => {
    if (!isDiscovered) {
      onDiscover(secret);
    } else {
      onOpen(secret);
    }
  };

  const formattedOrder = String(secret.order).padStart(2, '0');

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={
        isDiscovered
          ? `Read secret #${secret.order}: ${secret.title}`
          : `Secret #${secret.order} is currently locked`
      }
      className={cn(
        'group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl cursor-pointer min-h-[220px] focus:outline-none focus:ring-2 focus:ring-[#B18A4A] focus:ring-offset-2 focus:ring-offset-[#0B1018]',
        isDiscovered ? 'vault-card-unlocked' : 'vault-card-locked',
        className
      )}
      {...props}
    >
      {/* 1. Archival Classification Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#B18A4A]/20 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-serif tracking-widest text-[#B18A4A] font-semibold uppercase">
            <span>SECRET {formattedOrder}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-serif">
            {isDiscovered ? (
              <span className="inline-flex items-center gap-1 text-[#E7D7B8] bg-[#55343B]/60 border border-[#B18A4A]/50 px-2.5 py-0.5 rounded-full">
                <Unlock className="w-3 h-3 text-[#B18A4A]" />
                <span>Discovered</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#A99E8B] bg-[#0B1018]/60 border border-[#B18A4A]/25 px-2.5 py-0.5 rounded-full">
                <Lock className="w-3 h-3 text-[#B18A4A]/70" />
                <span>Locked Archive</span>
              </span>
            )}
          </div>
        </div>

        {/* 2. Icon & Title */}
        <div className="flex items-start gap-3 pt-1">
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center shrink-0 border shadow-xs transition-colors',
              isDiscovered
                ? 'vault-wax-seal text-[#F0E5CF]'
                : 'bg-[#111927] border-[#B18A4A]/30 text-[#A99E8B]'
            )}
          >
            {isDiscovered ? (
              <IconComponent className="w-4 h-4 text-[#B18A4A]" />
            ) : secret.isHidden ? (
              <HelpCircle className="w-4 h-4 text-[#A99E8B]/70" />
            ) : (
              <Lock className="w-4 h-4 text-[#B18A4A]/60" />
            )}
          </div>

          <div className="space-y-1 flex-1">
            <h3 className="font-serif font-medium text-base sm:text-lg text-[#F0E5CF] line-clamp-1 tracking-tight">
              {isDiscovered ? (
                <span className="inline-flex items-center gap-1.5">
                  <span>{secret.title}</span>
                  {secret.emoji && <span className="text-sm opacity-90 not-italic">{secret.emoji}</span>}
                </span>
              ) : secret.isHidden ? (
                <span className="italic text-[#A99E8B] font-normal">
                  &ldquo;A confidential note lies here...&rdquo;
                </span>
              ) : (
                <span className="text-[#E7D7B8]">
                  {secret.title || `Classified Entry #${formattedOrder}`}
                </span>
              )}
            </h3>

            <p className="font-serif text-xs sm:text-sm text-[#A99E8B] line-clamp-2 leading-relaxed">
              {isDiscovered ? (
                secret.description
              ) : (
                <span className="italic text-[#A99E8B]/80">
                  Something is here, but you haven&apos;t earned access yet.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Footer Action */}
      <div className="pt-3 mt-4 border-t border-[#B18A4A]/20 flex items-center justify-between text-xs font-serif">
        <span className="text-[10px] uppercase tracking-wider text-[#A99E8B]/70">
          {isDiscovered ? `Archive: ${secret.unlockType}` : 'Sealed Vault Item'}
        </span>

        {isDiscovered ? (
          <span className="inline-flex items-center gap-1 text-[#B18A4A] font-medium group-hover:text-[#E7D7B8] transition-colors">
            <span>Read secret document</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDiscover(secret);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif bg-[#55343B] text-[#F0E5CF] border border-[#B18A4A]/70 hover:brightness-110 transition-all cursor-pointer"
          >
            <Key className="w-3 h-3 text-[#B18A4A]" />
            <span>Unveil secret</span>
          </button>
        )}
      </div>
    </article>
  );
};
