import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../utils';
import { useSfx } from '../contexts';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}) => {
  const { playSfx } = useSfx();

  const handleClose = () => {
    playSfx('click');
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full rounded-[var(--radius-xl)] bg-[var(--color-card)] text-[var(--color-text)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200',
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
            <div>
              {title && <h3 className="text-h3 font-semibold text-[var(--color-text)]">{title}</h3>}
              {description && (
                <p className="text-small text-[var(--color-muted)] mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] p-1 rounded-[var(--radius-md)] transition-[transform,background-color,color] duration-150 ease-out cursor-pointer active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 motion-reduce:transform-none"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
