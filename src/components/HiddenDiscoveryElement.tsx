import React, { useState, useRef } from 'react';
import { Sparkles, LucideIcon } from 'lucide-react';
import { sampleSecrets } from '../data/secretVaultData';
import { SecretItem } from '../types';
import { isSecretDiscovered } from '../utils/secretVaultStorage';
import { recordDiscovery } from '../services/discoveryService';
import { evaluateBadges } from '../services/badgeService';
import { HiddenDiscoveryModal } from './HiddenDiscoveryModal';
import { useSfx } from '../contexts/SfxContext';
import { cn } from '../utils';

export interface HiddenDiscoveryElementProps extends React.HTMLAttributes<HTMLButtonElement> {
  secretId: string;
  label: string;
  children?: React.ReactNode;
  triggerType?: 'click' | 'repeated-tap' | 'long-press';
  requiredTaps?: number;
  className?: string;
  icon?: LucideIcon;
}

export const HiddenDiscoveryElement: React.FC<HiddenDiscoveryElementProps> = ({
  secretId,
  label,
  children,
  triggerType = 'click',
  requiredTaps = 3,
  className,
  icon: CustomIcon,
  ...props
}) => {
  const [tapCount, setTapCount] = useState(0);
  const [activeSecret, setActiveSecret] = useState<SecretItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlreadyUnlocked, setIsAlreadyUnlocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { playSfx } = useSfx();

  const secretObj = sampleSecrets.find((s) => s.id === secretId);

  const handleTriggerDiscovery = () => {
    if (!secretObj) return;

    const discovered = isSecretDiscovered(secretId);
    setIsAlreadyUnlocked(discovered);

    if (!discovered) {
      playSfx('secretUnlock');
      recordDiscovery('secret', secretId);
      evaluateBadges();
      // Dispatch global window event for live state updates across tabs/components
      window.dispatchEvent(new CustomEvent('starlit_secret_discovered', { detail: { secretId } }));
    }

    setActiveSecret(secretObj);
    setIsModalOpen(true);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (triggerType === 'click') {
      handleTriggerDiscovery();
    } else if (triggerType === 'repeated-tap') {
      const nextCount = tapCount + 1;
      setTapCount(nextCount);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setTapCount(0);
      }, 1500);

      if (nextCount >= requiredTaps) {
        setTapCount(0);
        handleTriggerDiscovery();
      }
    }
  };

  const IconToRender = CustomIcon || Sparkles;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center p-1.5 rounded-full text-[var(--color-primary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-secondary)]/80 transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] group relative',
          className
        )}
        {...props}
      >
        {children ? (
          children
        ) : (
          <IconToRender className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
        )}

        {/* Subtle visual pulse indicator */}
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-ping opacity-75" />
      </button>

      {/* Discovery Reveal Modal */}
      <HiddenDiscoveryModal
        secret={activeSecret}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isAlreadyDiscovered={isAlreadyUnlocked}
      />
    </>
  );
};
