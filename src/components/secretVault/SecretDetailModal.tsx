import React, { useEffect, useMemo } from 'react';
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
import { useTheme } from '../../hooks';
import './secretVault.css';

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
  const { theme } = useTheme();

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

  const modalStyle = useMemo(() => {
    if (theme === 'letter-archive') {
      return {
        bg: '#F5ECE1',
        bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(255, 252, 245, 0.96) 0%, rgba(245, 236, 225, 0.9) 50%, rgba(235, 222, 206, 0.96) 100%)',
        border: '1px solid rgba(177, 138, 74, 0.45)',
        boxShadow: '0 24px 70px -15px rgba(60, 42, 33, 0.4), inset 0 0 40px rgba(210, 170, 115, 0.2)',
        closeBtn: 'text-[#7A6855] hover:text-[#2B211B] hover:bg-[#DBCBA9]',
        headerBorder: 'border-[#B18A4A]/35',
        sealBg: 'vault-wax-seal text-[#F0E5CF]',
        sealIcon: 'text-[#B18A4A]',
        classification: 'text-[#55343B]',
        date: 'text-[#7A6855]',
        title: 'text-[#2B211B]',
        desc: 'text-[#5C4D3E] border-[#B18A4A]',
        body: 'text-[#2B211B]',
        footerBorder: 'border-[#B18A4A]/30',
        footerText: 'text-[#7A6855]',
        scrollIcon: 'text-[#B18A4A]',
        returnBtn: 'bg-[#55343B] text-[#F0E5CF] border-[#B18A4A] hover:brightness-110',
      };
    }
    if (theme === 'whimsical-scrapbook') {
      return {
        bg: '#FAF1DF',
        bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(250, 241, 223, 0.98) 0%, rgba(245, 232, 208, 0.92) 100%)',
        border: '1px solid rgba(120, 140, 107, 0.45)',
        boxShadow: '0 24px 70px -15px rgba(74, 64, 56, 0.25), 0 0 35px rgba(210, 168, 74, 0.15), inset 0 0 30px rgba(229, 209, 176, 0.3)',
        closeBtn: 'text-[#6D655B] hover:text-[#4A4038] hover:bg-[#E5D1B0]/60',
        headerBorder: 'border-[#788C6B]/30',
        sealBg: 'bg-[#FAF1DF] border border-[#788C6B]/40 text-[#D2A84A]',
        sealIcon: 'text-[#D2A84A]',
        classification: 'text-[#788C6B]',
        date: 'text-[#8C8376]',
        title: 'text-[#4A4038]',
        desc: 'text-[#6D655B] border-[#788C6B]',
        body: 'text-[#4A4038]',
        footerBorder: 'border-[#788C6B]/25',
        footerText: 'text-[#6D655B]',
        scrollIcon: 'text-[#788C6B]',
        returnBtn: 'bg-[#788C6B]/15 hover:bg-[#788C6B]/25 text-[#4A4038] border border-[#788C6B]/40 shadow-sm',
      };
    }
    // Default: midnight-journal
    return {
      bg: '#101A2B',
      bgGradient: 'linear-gradient(160deg, #142238 0%, #101A2B 60%, #0B1424 100%)',
      border: '1px solid #344761',
      boxShadow: '0 24px 70px -15px rgba(0, 0, 0, 0.85), 0 0 40px rgba(145, 169, 200, 0.12), inset 0 0 30px rgba(11, 20, 36, 0.5)',
      closeBtn: 'text-[#9EADC2] hover:text-[#E9EDF4] hover:bg-[#18273B]',
      headerBorder: 'border-[#273951]',
      sealBg: 'bg-[#142238] border border-[#344761] text-[#D6B56C]',
      sealIcon: 'text-[#D6B56C]',
      classification: 'text-[#91A9C8]',
      date: 'text-[#74859D]',
      title: 'text-[#E9EDF4]',
      desc: 'text-[#9EADC2] border-[#D6B56C]',
      body: 'text-[#C5D0DF]',
      footerBorder: 'border-[#273951]',
      footerText: 'text-[#74859D]',
      scrollIcon: 'text-[#D6B56C]',
      returnBtn: 'bg-[#18273B] hover:bg-[#273951] text-[#E9EDF4] border border-[#344761] shadow-sm',
    };
  }, [theme]);

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
        {/* Document Sheet */}
        <div
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-9 space-y-6 relative transition-all duration-300"
          style={{
            backgroundColor: modalStyle.bg,
            backgroundImage: modalStyle.bgGradient,
            border: modalStyle.border,
            boxShadow: modalStyle.boxShadow,
          }}
        >
          {/* Close / Return X Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Return to vault"
            className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full transition-colors cursor-pointer ${modalStyle.closeBtn}`}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Archival Classification Header */}
          <div className={`space-y-3 pb-4 border-b pr-10 ${modalStyle.headerBorder}`}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${modalStyle.sealBg}`}>
                  <IconComponent className={`h-4 w-4 ${modalStyle.sealIcon}`} />
                </span>

                <span className={`text-xs font-serif font-semibold tracking-wider uppercase ${modalStyle.classification}`}>
                  CLASSIFIED ARCHIVE • SECRET #{formattedOrder}
                </span>
              </div>

              {discoveredAt && (
                <time className={`text-xs font-serif italic ${modalStyle.date}`}>
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
              className={`text-2xl sm:text-3xl font-serif font-semibold leading-tight tracking-tight pt-1 flex items-center gap-2 flex-wrap ${modalStyle.title}`}
            >
              <span>{secret.title}</span>
              {secret.emoji && <span className="text-xl sm:text-2xl not-italic">{secret.emoji}</span>}
            </h2>

            {/* Description / Confidential Subtitle */}
            <p className={`text-xs sm:text-sm font-serif italic pl-3 border-l-2 py-0.5 ${modalStyle.desc}`}>
              &ldquo;{secret.description}&rdquo;
            </p>
          </div>

          {/* Secret Content Body */}
          <div className={`font-serif text-sm sm:text-base md:text-lg leading-loose space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1 ${modalStyle.body}`}>
            {secret.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Archival Footer & Return Action */}
          <div className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif ${modalStyle.footerBorder} ${modalStyle.footerText}`}>
            <span className="flex items-center gap-1.5 italic">
              <Scroll className={`h-3.5 w-3.5 ${modalStyle.scrollIcon}`} />
              <span>Preserved permanently in the Secret Vault archive</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 min-h-[40px] rounded-full text-xs font-serif font-medium cursor-pointer transition-all ${modalStyle.returnBtn}`}
            >
              Return to Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
