import React, { useState } from 'react';
import {
  Key,
  Sparkles,
  Lock,
  Eye,
  RefreshCw,
  Sparkle,
  CheckCircle2,
  Scroll,
} from 'lucide-react';
import { SecretCard, SecretDetailModal, SecretsOverrideModal } from '../components/secretVault';
import { ScrollFocusReveal } from '../components';
import '../components/secretVault/secretVault.css';
import { sampleSecrets } from '../data';
import { SecretItem } from '../types';
import { useAudio } from '../contexts';
import { useSfx } from '../contexts/SfxContext';
import { getManagedSecrets } from '../services/contentService';
import {
  getDiscoveredSecretIds,
  getDiscoveredTimestamps,
  resetDiscoveredSecrets,
  isSecretsOverrideUnlocked,
  unlockSecretsOverride,
} from '../utils';
import { recordDiscovery } from '../services/discoveryService';
import { evaluateBadges } from '../services/badgeService';
import { useStarlitCatBridge } from '../hooks';

export default function SecretVault() {
  const [secrets, setSecrets] = useState<SecretItem[]>(sampleSecrets);
  const [discoveredIds, setDiscoveredIds] = useState<string[]>(() => getDiscoveredSecretIds());
  const [timestamps, setTimestamps] = useState<Record<string, number>>(() => getDiscoveredTimestamps());
  const [selectedSecret, setSelectedSecret] = useState<SecretItem | null>(null);
  const [justRevealedSecret, setJustRevealedSecret] = useState<SecretItem | null>(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isOverrideActive, setIsOverrideActive] = useState<boolean>(() => isSecretsOverrideUnlocked());
  const { playSecretReveal, playMagicalClick } = useAudio();
  const { playSfx } = useSfx();
  const { emitSecret } = useStarlitCatBridge();

  React.useEffect(() => {
    emitSecret('opened');
  }, [emitSecret]);

  React.useEffect(() => {
    let isMounted = true;
    getManagedSecrets().then((items) => {
      if (isMounted) setSecrets(items);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    const syncVaultState = () => {
      setDiscoveredIds(getDiscoveredSecretIds());
      setTimestamps(getDiscoveredTimestamps());
      setIsOverrideActive(isSecretsOverrideUnlocked());
    };

    window.addEventListener('starlit_secret_discovered', syncVaultState);
    window.addEventListener('storage', syncVaultState);

    return () => {
      window.removeEventListener('starlit_secret_discovered', syncVaultState);
      window.removeEventListener('storage', syncVaultState);
    };
  }, []);

  const handleDiscover = (secret: SecretItem) => {
    playSfx('secretUnlock');
    recordDiscovery('secret', secret.id);
    setDiscoveredIds(getDiscoveredSecretIds());
    setTimestamps(getDiscoveredTimestamps());

    // Trigger centralized badge evaluation (will unlock "Curious" badge if first secret)
    evaluateBadges();

    // Dispatch cat reaction for unlocked secret (HIGH priority, privacy-safe metadata only)
    emitSecret('unlocked', secret.id);

    // Dispatch global window event
    window.dispatchEvent(new CustomEvent('starlit_secret_discovered', { detail: { secretId: secret.id } }));

    // Show gentle secret reveal modal
    setJustRevealedSecret(secret);
  };

  const handleOverrideSuccess = () => {
    playSfx('secretUnlock');
    const allIds = secrets.map((s) => s.id);
    const updated = unlockSecretsOverride(allIds);
    setDiscoveredIds(updated);
    setTimestamps(getDiscoveredTimestamps());
    setIsOverrideActive(true);
    evaluateBadges();
    emitSecret('unlocked', 'override-all');
  };

  const handleReset = () => {
    playMagicalClick();
    const initial = resetDiscoveredSecrets();
    setDiscoveredIds(initial);
    setTimestamps(getDiscoveredTimestamps());
    setIsOverrideActive(false);
    setSelectedSecret(null);
    setJustRevealedSecret(null);
    evaluateBadges();
    emitSecret('locked');
  };

  const discoveredCount = discoveredIds.length;
  const totalCount = secrets.length;
  const isConstellationSecretDiscovered = discoveredIds.includes('secret-03');

  return (
    <main className="vault-canvas py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        
        {/* 1. Vault Header Introduction & Discovery Progress */}
        <header
          className="vault-surface rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden space-y-6 text-center sm:text-left"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-serif font-medium bg-[#172235] text-[#E7D7B8] border border-[#B18A4A]/40 shadow-xs">
                <Key className="h-3.5 w-3.5 text-[#B18A4A]" />
                <span className="tracking-widest uppercase text-[10px]">QUIET CHAMBER</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-[#F0E5CF] tracking-tight">
                Secret Vault
              </h1>

              <p className="text-xs sm:text-sm md:text-base font-serif text-[#A99E8B] leading-relaxed italic">
                A locked room containing things that were never meant to be found casually. Private pieces, quiet unwritten notes, and hidden thoughts waiting to be revealed.
              </p>
            </div>

            {/* Discovery Progress Counter, Override & Reset */}
            <div className="flex flex-col items-center sm:items-end gap-2.5 shrink-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-serif bg-[#172235] text-[#E7D7B8] border border-[#B18A4A]/50 shadow-md">
                <Eye className="h-3.5 w-3.5 text-[#B18A4A]" />
                <span className="font-semibold">{discoveredCount} / {totalCount} Unveiled</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                <button
                  type="button"
                  id="secrets-override-trigger"
                  onClick={() => setIsOverrideModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-[#A99E8B] hover:text-[#F0E5CF] bg-[#0B1018]/60 hover:bg-[#172235] border border-[#B18A4A]/30 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                  title="Chamber Override Verification"
                  aria-label="Open Secrets Override verification"
                >
                  <Key className="h-3 w-3 text-[#B18A4A]" />
                  <span>{isOverrideActive ? 'Override Active 🔓' : '🔐 Secrets Override'}</span>
                </button>

                {discoveredCount > 0 && (
                  <button
                    type="button"
                    id="secrets-reset-button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-[11px] font-serif text-[#A99E8B] hover:text-[#F0E5CF] transition-colors cursor-pointer px-1 py-0.5"
                    aria-label="Reset discovered secrets"
                  >
                    <RefreshCw className="h-2.5 w-2.5 text-[#B18A4A]" />
                    <span>Reset discoveries</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. Interactive Hidden Discovery Sparkle Element */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#0B1018]/70 border border-[#B18A4A]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-serif">
            <div className="flex items-center gap-2.5 text-[#E7D7B8] text-center sm:text-left">
              <Sparkles className="h-4 w-4 text-[#B18A4A] shrink-0 animate-pulse" />
              <span>
                {isConstellationSecretDiscovered
                  ? '✨ You uncovered the starlit constellation key hidden within this quiet chamber.'
                  : '✨ A quiet starlit sparkle catches your eye in the corner of this chamber...'}
              </span>
            </div>

            {!isConstellationSecretDiscovered ? (
              <button
                type="button"
                onClick={() => {
                  const constellationSecret = secrets.find((s) => s.id === 'secret-03');
                  if (constellationSecret) handleDiscover(constellationSecret);
                }}
                className="px-4 py-2 min-h-[38px] rounded-full bg-[#55343B] border border-[#B18A4A] text-[#F0E5CF] font-medium hover:brightness-115 transition-all cursor-pointer shrink-0 shadow-sm"
              >
                Examine Sparkle ✦
              </button>
            ) : (
              <span className="text-[11px] font-serif text-[#E7D7B8] bg-[#172235] px-3 py-1 rounded-full border border-[#B18A4A]/40 shrink-0 inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#B18A4A]" />
                <span>Constellation Uncovered</span>
              </span>
            )}
          </div>
        </header>

        {/* 3. Grid of Secrets Archive */}
        <section aria-label="Vault Archive Grid" className="space-y-5">
          <div className="flex items-center justify-between border-b border-[#B18A4A]/25 pb-3">
            <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#F0E5CF] flex items-center gap-2 tracking-tight">
              <Lock className="h-4 w-4 text-[#B18A4A]" />
              <span>Vault Archive</span>
            </h2>
            <span className="text-xs font-serif italic text-[#A99E8B]">
              Tap any discovered card to read full message
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {secrets.map((secret) => {
              const isDiscovered = discoveredIds.includes(secret.id);
              return (
                <ScrollFocusReveal key={secret.id} className="h-full">
                  <SecretCard
                    secret={secret}
                    isDiscovered={isDiscovered}
                    onDiscover={handleDiscover}
                    onOpen={(s) => setSelectedSecret(s)}
                  />
                </ScrollFocusReveal>
              );
            })}
          </div>
        </section>

        {/* 4. Atmospheric Reveal Sequence for Newly Unveiled Secret */}
        {justRevealedSecret && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setJustRevealedSecret(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-full max-w-md animate-vault-reveal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="vault-parchment-document rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-5 relative">
                <div className="flex justify-center items-center gap-2 pt-1">
                  <Sparkle className="h-3.5 w-3.5 text-[#B18A4A]" />
                  <span className="text-xs font-serif tracking-widest text-[#55343B] uppercase font-semibold">
                    SEAL BROKEN • SECRET UNCOVERED
                  </span>
                  <Sparkle className="h-3.5 w-3.5 text-[#B18A4A]" />
                </div>

                <div className="mx-auto w-14 h-14 rounded-full vault-wax-seal flex items-center justify-center text-[#F0E5CF] shadow-md">
                  <Key className="h-6 w-6 text-[#B18A4A]" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#2B211B] tracking-tight">
                    {justRevealedSecret.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-serif italic text-[#5C4D3E] px-2 leading-relaxed">
                    &ldquo;{justRevealedSecret.description}&rdquo;
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const secretToOpen = justRevealedSecret;
                      setJustRevealedSecret(null);
                      setSelectedSecret(secretToOpen);
                    }}
                    className="w-full py-2.5 min-h-[42px] font-serif text-xs sm:text-sm font-medium rounded-full bg-[#55343B] text-[#F0E5CF] border border-[#B18A4A] hover:brightness-110 transition-all cursor-pointer"
                  >
                    Read Secret Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setJustRevealedSecret(null)}
                    className="w-full py-2.5 min-h-[42px] font-serif text-xs rounded-full text-[#7A6855] hover:text-[#2B211B] transition-colors cursor-pointer"
                  >
                    Return to Chamber
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Secret Reader Modal */}
        <SecretDetailModal
          secret={selectedSecret}
          isOpen={!!selectedSecret}
          onClose={() => setSelectedSecret(null)}
          discoveredAt={selectedSecret ? timestamps[selectedSecret.id] : undefined}
        />

        {/* 6. Secrets Override Modal */}
        <SecretsOverrideModal
          isOpen={isOverrideModalOpen}
          onClose={() => setIsOverrideModalOpen(false)}
          onSuccess={handleOverrideSuccess}
        />

        {/* 7. Footer Archive Notice */}
        <footer className="pt-6 border-t border-[#B18A4A]/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-[#A99E8B] italic font-serif flex items-center justify-center sm:justify-start gap-1.5">
            <Scroll className="h-3.5 w-3.5 text-[#B18A4A]" />
            <span>Starlit Letters — Secret Vault Archive</span>
          </p>
          <button
            type="button"
            id="secrets-override-footer-link"
            onClick={() => setIsOverrideModalOpen(true)}
            className="text-[11px] font-mono text-[#8C7A6B] hover:text-[#D8B86A] transition-colors cursor-pointer flex items-center gap-1 opacity-75 hover:opacity-100"
          >
            <span>{isOverrideActive ? '🔓 override active' : '🔐 override locked?'}</span>
          </button>
        </footer>

      </div>
    </main>
  );
}
