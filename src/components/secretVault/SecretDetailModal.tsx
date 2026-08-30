import React, { useEffect } from 'react';
import {
  Key,
  Lock,
  Eye,
  Feather,
  Sparkles,
  BookOpen,
  Shield,
  Unlock,
  LucideIcon,
  X,
  Scroll,
} from 'lucide-react';
import { SecretItem } from '../../types';

const iconMap: Record<string, LucideIcon> = {
  Key,
  Lock,
  Eye,
  Feather,
  Sparkles,
  BookOpen,
  Shield,
};

export interface SecretDetailModalProps {
  secret: SecretItem | null;
  isOpen: boolean;
  onClose: () => void;
  discoveredAt?: number;
}

export const SecretDetailModal: React.FC<SecretDetailModalProps> = ({
  secret,
  isOpen,
  onClose,
  discoveredAt,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !secret) return null;

  const IconComponent = iconMap[secret.icon] || Key;
  const formattedOrder = String(secret.order).padStart(2, '0');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs transition-opacity overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="secret-modal-title"
    >
      <div
        className="relative w-full max-w-2xl my-6 animate-vault-reveal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Parchment Archive Document Sheet */}
        <div className="vault-parchment-document rounded-2xl sm:rounded-3xl p-6 sm:p-9 space-y-6 relative">
          {/* Close / Return X Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Return to vault"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-[#7A6855] hover:text-[#2B211B] rounded-full hover:bg-[#DBCBA9] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Archival Classification Header */}
          <div className="space-y-3 pb-4 border-b border-[#B18A4A]/35 pr-10">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full vault-wax-seal flex items-center justify-center text-[#F0E5CF] shadow-sm">
                  <IconComponent className="h-4 w-4 text-[#B18A4A]" />
                </span>

                <span className="text-xs font-serif font-semibold tracking-wider text-[#55343B] uppercase">
                  CLASSIFIED ARCHIVE • SECRET #{formattedOrder}
                </span>
              </div>

              {discoveredAt && (
                <time className="text-xs font-serif italic text-[#7A6855]">
                  Unveiled{' '}
                  {new Date(discoveredAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
              )}
            </div>

            {/* Secret Title */}
            <h2
              id="secret-modal-title"
              className="text-2xl sm:text-3xl font-serif font-semibold text-[#2B211B] leading-tight tracking-tight pt-1 flex items-center gap-2 flex-wrap"
            >
              <span>{secret.title}</span>
              {secret.emoji && <span className="text-xl sm:text-2xl not-italic">{secret.emoji}</span>}
            </h2>

            {/* Description / Confidential Subtitle */}
            <p className="text-xs sm:text-sm font-serif italic text-[#5C4D3E] pl-3 border-l-2 border-[#B18A4A] py-0.5">
              &ldquo;{secret.description}&rdquo;
            </p>
          </div>

          {/* Secret Content Body in Warm Ink */}
          <div className="text-[#2B211B] font-serif text-sm sm:text-base md:text-lg leading-loose space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {secret.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Archival Footer & Return Action */}
          <div className="pt-4 border-t border-[#B18A4A]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif text-[#7A6855]">
            <span className="flex items-center gap-1.5 italic">
              <Scroll className="h-3.5 w-3.5 text-[#B18A4A]" />
              <span>Preserved permanently in the Secret Vault archive</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 min-h-[40px] rounded-full text-xs font-serif font-medium bg-[#55343B] text-[#F0E5CF] border border-[#B18A4A] hover:brightness-110 shadow-sm transition-all cursor-pointer"
            >
              Return to Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
