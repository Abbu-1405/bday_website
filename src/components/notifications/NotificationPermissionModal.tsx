import React, { useState } from 'react';
import { Bell, Sparkles, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Surface } from '../Surface';
import { useAuth } from '../../hooks';
import {
  requestAndRegisterNotification,
  dismissNotificationPrompt,
} from '../../services/notificationService';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAllow = async () => {
    if (!currentUser) {
      setErrorMessage('Please sign in to enable push notifications.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const result = await requestAndRegisterNotification(currentUser);

    setLoading(false);

    if (result.success) {
      onSuccess?.();
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to enable notifications.');
    }
  };

  const handleDismiss = () => {
    dismissNotificationPrompt();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
    >
      <Surface
        variant="elevated"
        padding="lg"
        className="w-full max-w-md border border-[var(--color-border-light)] shadow-2xl relative space-y-5 rounded-3xl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close notification prompt"
          className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Visual */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-primary)] shadow-sm">
            <Sparkles className="h-7 w-7 animate-pulse text-[var(--color-primary)]" />
          </div>

          <div className="space-y-1.5">
            <h2
              id="notification-modal-title"
              className="text-xl sm:text-2xl font-serif font-bold text-[var(--color-text)]"
            >
              A little magic? ✨
            </h2>
            <p className="text-sm font-serif text-[var(--color-text-secondary)] leading-relaxed px-2">
              Starlit Letters can send you occasional little messages when something is waiting for you in your universe.
            </p>
          </div>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-600 dark:text-rose-400 font-serif">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1 leading-relaxed">
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <Button
            variant="primary"
            size="md"
            onClick={handleAllow}
            disabled={loading}
            leftIcon={
              loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )
            }
            className="w-full sm:flex-1 font-serif min-h-[44px]"
          >
            {loading ? 'Enabling...' : 'Allow Notifications'}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleDismiss}
            disabled={loading}
            className="w-full sm:w-auto font-serif min-h-[44px] text-[var(--color-text-secondary)]"
          >
            Not Now
          </Button>
        </div>
      </Surface>
    </div>
  );
};
