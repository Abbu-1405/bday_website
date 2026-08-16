import React, { useEffect } from 'react';
import { Key, Sparkles, X, Unlock, CheckCircle2 } from 'lucide-react';
import { SecretItem } from '../types';
import { Surface } from './Surface';
import { Button } from './Button';
import { Badge } from './Badge';

export interface HiddenDiscoveryModalProps {
  secret: SecretItem | null;
  isOpen: boolean;
  onClose: () => void;
  isAlreadyDiscovered?: boolean;
}

export const HiddenDiscoveryModal: React.FC<HiddenDiscoveryModalProps> = ({
  secret,
  isOpen,
  onClose,
  isAlreadyDiscovered = false,
}) => {
  const [showFullContent, setShowFullContent] = React.useState(false);

  useEffect(() => {
    setShowFullContent(false);
  }, [secret]);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hidden-discovery-modal-title"
    >
      <div
        className="relative w-full max-w-lg my-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Surface
          variant="elevated"
          padding="lg"
          className="border border-[var(--color-border-light)] bg-[var(--color-card)] shadow-xl space-y-5 relative rounded-2xl"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close secret reveal"
            className="absolute top-4 right-4 p-1.5 text-[var(--color-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header Badge */}
          <div className="flex items-center gap-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
              <Key className="h-4 w-4 text-[var(--color-primary)]" />
            </div>

            <Badge variant="primary" size="sm" className="font-serif">
              {isAlreadyDiscovered ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1 text-[var(--color-success)]" />
                  Secret Discovered
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1 text-[var(--color-accent)] animate-pulse" />
                  Hidden Secret Found
                </>
              )}
            </Badge>
          </div>

          {/* Title & Preview */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] block">
              {!isAlreadyDiscovered ? 'Oh... you found something quiet.' : 'Preserved Secret'}
            </span>

            <h2 id="hidden-discovery-modal-title" className="text-h2 font-serif font-bold text-[var(--color-text)]">
              {secret.title}
            </h2>

            <p className="text-body-sm font-serif italic text-[var(--color-text-secondary)] pl-3 border-l-2 border-[var(--color-primary)] py-0.5">
              &quot;{secret.description}&quot;
            </p>
          </div>

          {/* Body Content */}
          {showFullContent ? (
            <div className="text-[var(--color-text)] font-serif text-base leading-relaxed space-y-3 pt-2 max-h-[60vh] overflow-y-auto pr-2 border-t border-[var(--color-border-light)]">
              {secret.content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)]/80 border border-[var(--color-border-light)] text-xs font-serif text-[var(--color-text-secondary)] leading-relaxed space-y-1">
              <p>
                This secret has been permanently saved to your <strong>Secret Vault</strong>.
              </p>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-[var(--color-border-light)] flex flex-col sm:flex-row items-center justify-between gap-3">
            {!showFullContent ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowFullContent(true)}
                className="w-full sm:w-auto font-serif text-xs rounded-full cursor-pointer"
              >
                <Unlock className="h-3.5 w-3.5 mr-1.5" />
                Read Secret Content
              </Button>
            ) : (
              <span className="text-[11px] font-serif italic text-[var(--color-muted)]">
                Stored in Secret Vault
              </span>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto font-serif text-xs rounded-full cursor-pointer"
            >
              Close
            </Button>
          </div>
        </Surface>
      </div>
    </div>
  );
};
