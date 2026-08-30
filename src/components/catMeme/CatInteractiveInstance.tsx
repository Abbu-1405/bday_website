import React, { useEffect, useState } from 'react';
import {
  ActiveCatInstance,
  ActiveEasterEggEvent,
  UserCatMemory,
  UserCatPreferences,
} from '../../types/catMeme';
import { getSafePositionStyles } from '../../services/catInteraction/CatPositioning';
import { formatPersonalityLabel } from '../../services/catInteraction/CatPersonalityResolver';
import { CatMemoryService } from '../../services/catInteraction/CatMemoryService';
import { CatCustomizationService } from '../../services/catInteraction/CatCustomizationService';
import { CatAudioService } from '../../services/catInteraction/CatAudioService';
import { EasterEggService } from '../../services/catInteraction/EasterEggService';
import { getEasterEggsForCat } from '../../services/catInteraction/easterEggRegistry';
import { CatVariantGraphic } from './CatVariantGraphic';
import { CatProfileModal } from './CatProfileModal';

export interface CatInteractiveInstanceProps {
  instance: ActiveCatInstance;
}

export const CatInteractiveInstance: React.FC<CatInteractiveInstanceProps> = ({
  instance,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [memory, setMemory] = useState<UserCatMemory | null>(() => {
    return CatMemoryService.getCatMemory(instance.catDefinitionId);
  });

  const [preferences, setPreferences] = useState<UserCatPreferences>(() => {
    return CatCustomizationService.getPreference(instance.catDefinitionId);
  });

  const [activeEasterEgg, setActiveEasterEgg] = useState<ActiveEasterEggEvent | null>(
    () => {
      return (
        EasterEggService.getInstance().getActiveEventForCat(
          instance.catDefinitionId
        ) || null
      );
    }
  );

  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Subtle visual hint cue (rendered occasionally on idle)
  const [showHintCue] = useState<boolean>(() => {
    const eggs = getEasterEggsForCat(instance.catDefinitionId);
    return eggs.length > 0 && Math.random() < 0.25;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    window.addEventListener('resize', handleResize);
    motionQuery.addEventListener('change', handleMotionChange);

    // Subscribe to memory updates for this cat
    const unsubscribeMemory = CatMemoryService.subscribe((all) => {
      if (all[instance.catDefinitionId]) {
        setMemory(all[instance.catDefinitionId]);
      }
    });

    // Subscribe to preference updates for this cat
    const unsubscribePrefs = CatCustomizationService.subscribe((all) => {
      if (all[instance.catDefinitionId]) {
        setPreferences(all[instance.catDefinitionId]);
      }
    });

    // Subscribe to active Easter egg events
    const unsubscribeEasterEggs = EasterEggService.getInstance().subscribeActiveEvents(
      (events) => {
        const currentEvent = events.get(instance.catDefinitionId) || null;
        setActiveEasterEgg(currentEvent);
      }
    );

    return () => {
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
      unsubscribeMemory();
      unsubscribePrefs();
      unsubscribeEasterEggs();
    };
  }, [instance.catDefinitionId]);

  const { cssStyle, rotation, scale } = getSafePositionStyles(
    instance.position,
    isMobile
  );

  // Transition & Animation classes
  let animationClasses = 'transition-all duration-350 ease-out';
  if (prefersReducedMotion) {
    animationClasses = 'transition-opacity duration-150';
  }

  let stateClasses = 'opacity-100 scale-100 translate-y-0';
  if (instance.state === 'entering') {
    stateClasses = prefersReducedMotion
      ? 'opacity-0 scale-100'
      : 'opacity-0 scale-90 translate-y-3';
  } else if (instance.state === 'exiting') {
    stateClasses = prefersReducedMotion
      ? 'opacity-0 scale-100'
      : 'opacity-0 scale-95 translate-y-2';
  } else if (instance.state === 'reacting') {
    stateClasses = prefersReducedMotion
      ? 'opacity-100 scale-100'
      : 'opacity-100 scale-105 -translate-y-1';
  }

  const isLeftAligned =
    instance.position === 'bottom-left' ||
    instance.position === 'top-left' ||
    instance.position === 'center-left' ||
    instance.position === 'card-peek-left';

  const personalityLabel = formatPersonalityLabel(instance.personality);
  const isLegendary = instance.rarity === 'legendary';

  // Customized display name or fallback
  const effectiveDisplayName =
    preferences?.customName && preferences.customName.trim().length > 0
      ? preferences.customName.trim()
      : instance.displayName;

  // Interaction preference toggles
  const petEnabled = preferences?.interactions?.petEnabled !== false;
  const treatEnabled = preferences?.interactions?.treatEnabled !== false;
  const shooEnabled = preferences?.interactions?.shooEnabled !== false;

  const handlePet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!petEnabled) return;

    // 1. Evaluate Phase 8 Easter Egg trigger
    await EasterEggService.getInstance().evaluateAction(
      instance.catDefinitionId,
      'pet',
      effectiveDisplayName
    );

    // 2. Record standard Phase 5 interaction memory
    CatMemoryService.recordPet(instance.catDefinitionId);

    // 3. Play interaction sound
    CatAudioService.getInstance().playInteractionSound(
      'pet',
      instance.catDefinitionId,
      memory?.relationshipLevel || 1
    );
  };

  const handleTreat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!treatEnabled) return;

    // 1. Evaluate Phase 8 Easter Egg trigger
    await EasterEggService.getInstance().evaluateAction(
      instance.catDefinitionId,
      'treat',
      effectiveDisplayName
    );

    // 2. Record standard Phase 5 interaction memory
    CatMemoryService.recordTreat(instance.catDefinitionId);

    // 3. Play interaction sound
    CatAudioService.getInstance().playInteractionSound(
      'treat',
      instance.catDefinitionId,
      memory?.relationshipLevel || 1
    );
  };

  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shooEnabled) return;

    // 1. Evaluate Phase 8 Easter Egg trigger
    await EasterEggService.getInstance().evaluateAction(
      instance.catDefinitionId,
      'shoo',
      effectiveDisplayName
    );

    // 2. Record standard Phase 5 interaction memory
    CatMemoryService.recordDismissal(instance.catDefinitionId);

    // 3. Play interaction sound
    CatAudioService.getInstance().playInteractionSound(
      'shoo',
      instance.catDefinitionId,
      memory?.relationshipLevel || 1
    );
  };

  const handleOpenProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProfileOpen(true);
  };

  // Determine active caption (Easter egg caption takes priority during active event)
  const displayCaption = activeEasterEgg
    ? activeEasterEgg.definition.caption
    : instance.caption;

  // Custom animation styles for Easter egg
  const isSpinningEgg =
    activeEasterEgg?.definition.animationType === 'perpetual_spin';
  const isShockedSalad =
    activeEasterEgg?.definition.animationType === 'salad_recoil';
  const isAntennaOverdrive =
    activeEasterEgg?.definition.animationType === 'antenna_overdrive';
  const isPopSymphony =
    activeEasterEgg?.definition.animationType === 'rapid_pop_symphony';
  const isSyncJam = activeEasterEgg?.definition.animationType === 'sync_jam';
  const isUnfazed = activeEasterEgg?.definition.animationType === 'unfazed_stare';

  return (
    <>
      <div
        id={`cat-instance-${instance.id}`}
        className={`fixed z-20 pointer-events-auto select-none ${animationClasses} ${stateClasses}`}
        style={{
          ...cssStyle,
          transform: `${cssStyle.transform || ''} rotate(${rotation}deg) scale(${scale})`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`${effectiveDisplayName} the cat`}
      >
        <div className="relative flex flex-col items-center group">
          {/* Subtle Cat Identity & Caption Bubble */}
          {(effectiveDisplayName || displayCaption) && (
            <div
              className={`mb-1.5 max-w-[280px] flex flex-col gap-1 px-3 py-2 rounded-xl bg-[#141720]/95 border ${
                activeEasterEgg
                  ? 'border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.4)] animate-pulse ring-1 ring-amber-400/50'
                  : isLegendary
                  ? 'border-[#F59E0B]/60 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : 'border-[#F97316]/30 shadow-[0_4px_16px_rgba(0,0,0,0.6)]'
              } backdrop-blur-sm ${
                isLeftAligned ? 'self-start ml-2' : 'self-end mr-2'
              }`}
            >
              {/* Subtle Name & Relationship Level Indicator */}
              {effectiveDisplayName && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-semibold text-[#F97316]">
                    <span>
                      {activeEasterEgg ? '✨' : isLegendary ? '👑' : '🐾'}
                    </span>
                    <span className="text-[#F8FAFC]">
                      {effectiveDisplayName}
                    </span>
                    <span className="text-[#64748B]">•</span>
                    <span className="text-[#94A3B8] lowercase italic">
                      {activeEasterEgg
                        ? activeEasterEgg.definition.title
                        : personalityLabel}
                    </span>
                  </div>

                  {memory && (
                    <button
                      id={`cat-level-badge-${instance.id}`}
                      onClick={handleOpenProfile}
                      title="View Cat Relationship Profile"
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-500/30 hover:bg-orange-900/80 transition-colors"
                    >
                      Lv.{memory.relationshipLevel}
                    </button>
                  )}
                </div>
              )}

              {/* Personality or Easter Egg Caption */}
              {displayCaption && (
                <div
                  className={`text-[11px] font-mono tracking-tight whitespace-normal leading-snug ${
                    activeEasterEgg
                      ? 'text-amber-200 font-semibold'
                      : 'text-[#E2E8F0]'
                  }`}
                >
                  {displayCaption}
                </div>
              )}

              {/* Interactive Quick Actions (Pet, Treat, Dismiss, Profile) */}
              <div className="flex items-center gap-1 mt-0.5 pt-1 border-t border-slate-800/80 text-[10px]">
                {petEnabled && (
                  <button
                    id={`cat-action-pet-${instance.id}`}
                    onClick={handlePet}
                    title="Pet the cat (+8 bond)"
                    className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-orange-500/20 text-orange-300 border border-slate-700/60 hover:border-orange-500/40 transition-colors"
                  >
                    🐾 Pet
                  </button>
                )}
                {treatEnabled && (
                  <button
                    id={`cat-action-treat-${instance.id}`}
                    onClick={handleTreat}
                    title="Feed a treat (+12 bond)"
                    className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-amber-500/20 text-amber-300 border border-slate-700/60 hover:border-amber-500/40 transition-colors"
                  >
                    🍪 Treat
                  </button>
                )}
                <button
                  id={`cat-action-profile-${instance.id}`}
                  onClick={handleOpenProfile}
                  title="Open relationship, secrets & customization"
                  className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors ml-auto"
                >
                  Profile
                </button>
                {shooEnabled && (
                  <button
                    id={`cat-action-dismiss-${instance.id}`}
                    onClick={handleDismiss}
                    title="Shoo away (-10 bond)"
                    className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700/60 hover:border-red-500/40 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Graphic with Cat Archetype & Expression Variant */}
          <div
            onClick={handleOpenProfile}
            className={`cursor-pointer relative transition-transform duration-300 ${
              isSpinningEgg && !prefersReducedMotion
                ? 'animate-spin duration-1000'
                : 'hover:scale-105'
            } ${isShockedSalad ? 'animate-bounce' : ''}`}
            title={`Click to view ${effectiveDisplayName}'s profile & secrets`}
          >
            {/* Easter Egg Overlay Visuals */}
            {isShockedSalad && (
              <div className="absolute -top-4 -right-2 text-xl animate-ping select-none pointer-events-none">
                🥗
              </div>
            )}
            {isAntennaOverdrive && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-xs bg-amber-950/80 border border-amber-400/60 text-amber-300 px-1.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse">
                <span>💡</span>
                <span className="font-mono text-[9px] font-bold">100%</span>
              </div>
            )}
            {isPopSymphony && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm animate-bounce select-none pointer-events-none">
                🫧 🫧 🫧
              </div>
            )}
            {isSyncJam && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-sm flex gap-1 animate-pulse select-none pointer-events-none">
                <span>🎵</span>
                <span>🥁</span>
                <span>🎶</span>
              </div>
            )}
            {isUnfazed && (
              <div className="absolute -top-2 -right-1 text-sm select-none pointer-events-none">
                ✨😎
              </div>
            )}

            {/* Subtle Hint Cue (Occasional on idle) */}
            {showHintCue && !activeEasterEgg && (
              <div
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-ping"
                title="A hidden secret might be near..."
              />
            )}

            <CatVariantGraphic
              catId={instance.catDefinitionId}
              archetypeColor={instance.archetypeColor}
              variant={
                isShockedSalad
                  ? 'shocked'
                  : isPopSymphony
                  ? 'surprised'
                  : instance.variant
              }
              size={isMobile ? 64 : 84}
            />
          </div>
        </div>
      </div>

      {/* Cat Profile Modal */}
      <CatProfileModal
        catId={instance.catDefinitionId}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};
