import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Clock,
  Heart,
  Sparkles,
  X,
  Zap,
  Info,
  Sliders,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Egg,
} from 'lucide-react';
import {
  CatDefinition,
  UserCatMemory,
  UserCatPreferences,
  CatAudioSettings,
  EasterEggDiscovery,
} from '../../types/catMeme';
import { CatMemoryService } from '../../services/catInteraction/CatMemoryService';
import {
  CatCustomizationService,
  MAX_NICKNAME_LENGTH,
} from '../../services/catInteraction/CatCustomizationService';
import { getCatDefinition } from '../../services/catInteraction/catRegistry';
import { CatAudioService } from '../../services/catInteraction/CatAudioService';
import { getCatAudioDefinition } from '../../services/catInteraction/catAudioRegistry';
import { getEasterEggsForCat } from '../../services/catInteraction/easterEggRegistry';
import { EasterEggDiscoveryRepository } from '../../services/catInteraction/EasterEggDiscoveryRepository';
import { CatVariantGraphic } from './CatVariantGraphic';

export interface CatProfileModalProps {
  catId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CatProfileModal: React.FC<CatProfileModalProps> = ({
  catId,
  isOpen,
  onClose,
}) => {
  const [memory, setMemory] = useState<UserCatMemory | null>(null);
  const [preferences, setPreferences] = useState<UserCatPreferences | null>(null);
  const [discoveries, setDiscoveries] = useState<Record<string, EasterEggDiscovery>>(
    () => EasterEggDiscoveryRepository.getInstance().getAllDiscoveries()
  );
  const [activeTab, setActiveTab] = useState<
    'progress' | 'milestones' | 'moments' | 'customize' | 'secrets'
  >('progress');

  // Customization form state
  const [nicknameInput, setNicknameInput] = useState<string>('');
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [audioSettings, setAudioSettings] = useState<CatAudioSettings>(() =>
    CatAudioService.getInstance().getSettings()
  );

  useEffect(() => {
    if (!catId || !isOpen) return;

    // Load initial memory & preferences
    setMemory(CatMemoryService.getCatMemory(catId));
    const currentPrefs = CatCustomizationService.getPreference(catId);
    setPreferences(currentPrefs);
    setNicknameInput(currentPrefs?.customName || '');
    setSaveStatusMessage(null);
    setNameError(null);
    setAudioSettings(CatAudioService.getInstance().getSettings());

    // Subscribe to memory updates
    const unsubscribeMemory = CatMemoryService.subscribe((all) => {
      if (all[catId]) {
        setMemory(all[catId]);
      }
    });

    // Subscribe to preference updates
    const unsubscribePrefs = CatCustomizationService.subscribe((all) => {
      if (all[catId]) {
        setPreferences(all[catId]);
      }
    });

    // Subscribe to audio settings updates
    const unsubscribeAudio = CatAudioService.getInstance().subscribe((audioState) => {
      setAudioSettings({
        masterVolume: audioState.volume,
        muted: audioState.muted,
        autoplayBlocked: audioState.autoplayBlocked,
      });
    });

    // Subscribe to Easter egg discovery updates
    const unsubscribeDiscoveries = EasterEggDiscoveryRepository.getInstance().subscribe(
      (disc) => {
        setDiscoveries(disc);
      }
    );

    return () => {
      unsubscribeMemory();
      unsubscribePrefs();
      unsubscribeAudio();
      unsubscribeDiscoveries();
    };
  }, [catId, isOpen]);

  if (!isOpen || !catId) return null;

  const catDef: CatDefinition = getCatDefinition(catId);
  const progress = CatMemoryService.getProgressionProgress(catId);
  const isGuest = !memory?.userId || memory.userId === 'guest-session';
  const isLegendary = catDef.rarity === 'legendary';

  const effectiveDisplayName =
    preferences?.customName && preferences.customName.trim().length > 0
      ? preferences.customName.trim()
      : catDef.displayName;

  const isCustomNameSet = Boolean(
    preferences?.customName && preferences.customName.trim().length > 0
  );

  const isHidden = Boolean(preferences?.hidden) && !isLegendary;

  const handleSaveNickname = async () => {
    setNameError(null);
    const result = await CatCustomizationService.setNickname(
      catId,
      nicknameInput
    );
    if (!result.success) {
      setNameError(result.error || 'Failed to update nickname.');
    } else {
      setSaveStatusMessage('Nickname saved!');
      setTimeout(() => setSaveStatusMessage(null), 2500);
    }
  };

  const handleResetNickname = async () => {
    setNicknameInput('');
    setNameError(null);
    await CatCustomizationService.setNickname(catId, '');
    setSaveStatusMessage('Reset to official name.');
    setTimeout(() => setSaveStatusMessage(null), 2500);
  };

  const handleToggleHidden = async (hidden: boolean) => {
    if (isLegendary && hidden) return;
    const result = await CatCustomizationService.setHidden(catId, hidden);
    if (result.success) {
      setSaveStatusMessage(hidden ? 'Cat hidden from spawns.' : 'Cat is visible.');
      setTimeout(() => setSaveStatusMessage(null), 2500);
    }
  };

  const handleToggleInteraction = async (
    interaction: 'petEnabled' | 'treatEnabled' | 'shooEnabled',
    enabled: boolean
  ) => {
    await CatCustomizationService.setInteraction(catId, interaction, enabled);
  };

  const handlePlaySignature = () => {
    CatAudioService.getInstance().playSignatureSound(
      catId,
      memory?.relationshipLevel || 1,
      'high'
    );
  };

  const audioDef = getCatAudioDefinition(catId);

  return (
    <AnimatePresence>
      <div
        id="cat-profile-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          id="cat-profile-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#0F172A] border border-[#F97316]/30 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-5 pb-4 border-b border-slate-800 bg-gradient-to-r from-[#1E293B] to-[#0F172A] flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`relative p-2 rounded-xl bg-slate-900/80 border ${
                  isLegendary ? 'border-amber-500/50' : 'border-[#F97316]/40'
                }`}
              >
                <CatVariantGraphic
                  catId={catDef.id}
                  archetypeColor={catDef.archetypeColor}
                  variant={catDef.defaultExpression}
                  size={56}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-wide">
                    {effectiveDisplayName}
                  </h2>
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                      isLegendary
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    }`}
                  >
                    {catDef.rarity}
                  </span>
                  {isHidden && (
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Hidden
                    </span>
                  )}
                </div>
                {isCustomNameSet && (
                  <p className="text-[11px] text-orange-400/80 font-mono">
                    Official name: {catDef.displayName}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-0.5 italic">
                  {catDef.signatureBehavior}
                </p>

                {audioDef && (
                  <button
                    id={`play-signature-sound-${catDef.id}`}
                    onClick={handlePlaySignature}
                    title={`Play ${catDef.displayName}'s signature sound`}
                    className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/60 hover:bg-orange-900/80 border border-orange-500/30 text-orange-300 text-[11px] font-mono transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                    <span>Signature Sound: {audioDef.signatureSound.name}</span>
                  </button>
                )}
              </div>
            </div>

            <button
              id="close-cat-profile-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Cat Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Relationship Level Card */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span className="text-sm font-semibold text-white">
                    Level {progress.currentLevel}: {progress.currentLevelName}
                  </span>
                </div>
                <span className="text-xs font-mono text-orange-300 font-bold">
                  {progress.currentPoints} Bond Points
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {progress.isMaxLevel
                    ? 'Maximum Relationship Reached! 👑'
                    : `${progress.remainingPointsToNext} pts to ${progress.nextLevelName}`}
                </span>
                <span>{progress.progressPercent}%</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center justify-center text-center">
                <Clock className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-base font-bold text-white font-mono">
                  {memory?.encounterCount || 0}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Visits
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center justify-center text-center">
                <Zap className="w-4 h-4 text-orange-400 mb-1" />
                <span className="text-base font-bold text-white font-mono">
                  {memory?.meaningfulInteractionCount || 0}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Moments
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center justify-center text-center">
                <Award className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-base font-bold text-white font-mono">
                  {memory?.milestoneHistory.length || 0}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Milestones
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
              <button
                id="cat-tab-progress"
                onClick={() => setActiveTab('progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'progress'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Behaviors
              </button>
              <button
                id="cat-tab-milestones"
                onClick={() => setActiveTab('milestones')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'milestones'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Milestones ({memory?.milestoneHistory.length || 0})
              </button>
              <button
                id="cat-tab-moments"
                onClick={() => setActiveTab('moments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'moments'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Moments
              </button>
              <button
                id="cat-tab-customize"
                onClick={() => setActiveTab('customize')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  activeTab === 'customize'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Customize</span>
              </button>
              <button
                id="cat-tab-secrets"
                onClick={() => setActiveTab('secrets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  activeTab === 'secrets'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Egg className="w-3.5 h-3.5" />
                <span>Secrets</span>
              </button>
            </div>

            {/* Tab: Progress & Behaviors */}
            {activeTab === 'progress' && (
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Progression Tiers
                </h4>
                <div className="space-y-2">
                  {catDef.progression?.levels.map((lvl) => {
                    const isReached = (memory?.relationshipPoints || 0) >= lvl.minPoints;
                    const isCurrent = progress.currentLevel === lvl.level;

                    return (
                      <div
                        key={lvl.level}
                        className={`p-3 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-orange-950/30 border-orange-500/50 shadow-sm'
                            : isReached
                            ? 'bg-slate-800/40 border-slate-700/50 opacity-90'
                            : 'bg-slate-900/40 border-slate-800/40 opacity-40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                                isCurrent
                                  ? 'bg-orange-500 text-slate-950'
                                  : isReached
                                  ? 'bg-slate-700 text-slate-200'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              Lvl {lvl.level}
                            </span>
                            <span className="text-sm font-semibold text-white">
                              {lvl.name}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-slate-400">
                            {lvl.minPoints} pts
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 ml-1 mb-2">
                          {lvl.description}
                        </p>

                        {/* Unlocked behaviors badges */}
                        {lvl.unlockedBehaviors && lvl.unlockedBehaviors.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 ml-1">
                            {lvl.unlockedBehaviors.map((b) => (
                              <span
                                key={b}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-orange-300"
                              >
                                ✦ {b.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Milestones */}
            {activeTab === 'milestones' && (
              <div className="space-y-2">
                {memory?.milestoneHistory && memory.milestoneHistory.length > 0 ? (
                  memory.milestoneHistory.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-3"
                    >
                      <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-semibold text-white">
                            {m.title}
                          </h5>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(m.achievedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs italic">
                    No milestones recorded yet. Keep interacting to unlock memories!
                  </div>
                )}
              </div>
            )}

            {/* Tab: Recent Moments */}
            {activeTab === 'moments' && (
              <div className="space-y-2">
                {memory?.memorableInteractionReferences &&
                memory.memorableInteractionReferences.length > 0 ? (
                  memory.memorableInteractionReferences.map((ref) => (
                    <div
                      key={ref.eventId}
                      className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/40 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            ref.impactPoints >= 0 ? 'bg-orange-400' : 'bg-red-400'
                          }`}
                        />
                        <span className="text-slate-200">{ref.summary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-[11px] ${
                            ref.impactPoints >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {ref.impactPoints >= 0 ? `+${ref.impactPoints}` : ref.impactPoints} pts
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(ref.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs italic">
                    No recent moments recorded in this session.
                  </div>
                )}
              </div>
            )}

            {/* Tab: Customization */}
            {activeTab === 'customize' && (
              <div className="space-y-4">
                {/* Feedback Message */}
                {saveStatusMessage && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{saveStatusMessage}</span>
                  </div>
                )}

                {/* Nickname Section */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="custom-cat-nickname-input"
                      className="text-xs uppercase font-bold text-slate-300 tracking-wider"
                    >
                      Cat Custom Nickname
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">
                      {nicknameInput.length}/{MAX_NICKNAME_LENGTH}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="custom-cat-nickname-input"
                      type="text"
                      maxLength={MAX_NICKNAME_LENGTH}
                      value={nicknameInput}
                      onChange={(e) => {
                        setNicknameInput(e.target.value);
                        setNameError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveNickname();
                        }
                      }}
                      placeholder={`e.g. ${catDef.displayName}`}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60"
                    />
                    <button
                      id="save-cat-nickname-btn"
                      onClick={handleSaveNickname}
                      className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors"
                    >
                      Save
                    </button>
                    {isCustomNameSet && (
                      <button
                        id="reset-cat-nickname-btn"
                        onClick={handleResetNickname}
                        title="Reset to official name"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {nameError && (
                    <p className="text-[11px] text-rose-400">{nameError}</p>
                  )}

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Custom nicknames change how this cat appears throughout the app without altering their personality or relationship history.
                  </p>
                </div>

                {/* Visibility Section */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                      Cat Visibility
                    </span>
                    {isLegendary && (
                      <span className="text-[10px] font-mono text-amber-400 font-semibold">
                        Protected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="cat-visibility-show-btn"
                      onClick={() => handleToggleHidden(false)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        !isHidden
                          ? 'bg-orange-500/20 border-orange-500/50 text-orange-300 shadow-sm'
                          : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Visible (Spawns)</span>
                    </button>

                    <button
                      id="cat-visibility-hide-btn"
                      disabled={isLegendary}
                      onClick={() => handleToggleHidden(true)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        isLegendary
                          ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600'
                          : isHidden
                          ? 'bg-slate-700/50 border-slate-500 text-white shadow-sm'
                          : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <EyeOff className="w-4 h-4" />
                      <span>Hidden</span>
                    </button>
                  </div>

                  {isLegendary ? (
                    <p className="text-[11px] text-amber-300/80 leading-relaxed font-mono">
                      👑 Legendary cats cannot be hidden. Their presence is eternal.
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Hidden cats will not spawn idle or react to events, but their relationship points and milestones remain permanently saved.
                    </p>
                  )}
                </div>

                {/* Interactions Customization Section */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <span className="text-xs uppercase font-bold text-slate-300 tracking-wider block">
                    Available Micro-Interactions
                  </span>

                  <div className="space-y-2">
                    {/* Pet Checkbox */}
                    <label
                      htmlFor="pref-pet-checkbox"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">🐾</span>
                        <div>
                          <p className="text-xs font-semibold text-white">Pet Action</p>
                          <p className="text-[10px] text-slate-400">+8 Relationship Points</p>
                        </div>
                      </div>
                      <input
                        id="pref-pet-checkbox"
                        type="checkbox"
                        checked={preferences?.interactions?.petEnabled !== false}
                        onChange={(e) =>
                          handleToggleInteraction('petEnabled', e.target.checked)
                        }
                        className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* Treat Checkbox */}
                    <label
                      htmlFor="pref-treat-checkbox"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">🍪</span>
                        <div>
                          <p className="text-xs font-semibold text-white">Treat Action</p>
                          <p className="text-[10px] text-slate-400">+12 Relationship Points</p>
                        </div>
                      </div>
                      <input
                        id="pref-treat-checkbox"
                        type="checkbox"
                        checked={preferences?.interactions?.treatEnabled !== false}
                        onChange={(e) =>
                          handleToggleInteraction('treatEnabled', e.target.checked)
                        }
                        className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* Shoo Checkbox */}
                    <label
                      htmlFor="pref-shoo-checkbox"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">✕</span>
                        <div>
                          <p className="text-xs font-semibold text-white">Shoo / Dismiss</p>
                          <p className="text-[10px] text-slate-400">-10 Relationship Points</p>
                        </div>
                      </div>
                      <input
                        id="pref-shoo-checkbox"
                        type="checkbox"
                        checked={preferences?.interactions?.shooEnabled !== false}
                        onChange={(e) =>
                          handleToggleInteraction('shooEnabled', e.target.checked)
                        }
                        className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Cat Audio & Volume Control Section */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                      Cat Sound & Volume
                    </span>
                    <button
                      id="toggle-cat-audio-mute-btn"
                      onClick={() => CatAudioService.getInstance().toggleMute()}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        audioSettings.muted
                          ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {audioSettings.muted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                          <span>Muted</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Sound Active</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-400">0%</span>
                    <input
                      id="cat-audio-volume-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={audioSettings.masterVolume}
                      onChange={(e) =>
                        CatAudioService.getInstance().setVolume(parseFloat(e.target.value))
                      }
                      className="flex-1 accent-orange-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg appearance-none"
                    />
                    <span className="text-[11px] font-mono text-orange-300 min-w-[36px]">
                      {Math.round(audioSettings.masterVolume * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Procedural synthesized sound effects.
                    </p>
                    <button
                      id="test-cat-sound-btn"
                      onClick={handlePlaySignature}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-orange-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Test Sound</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Secrets & Easter Eggs */}
            {activeTab === 'secrets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                    Hidden Easter Eggs & Secrets
                  </h4>
                  <span className="text-[11px] font-mono text-amber-400 font-semibold">
                    {
                      getEasterEggsForCat(catDef.id).filter(
                        (egg) => Boolean(discoveries[egg.id])
                      ).length
                    }{' '}
                    /{' '}
                    {getEasterEggsForCat(catDef.id).length} Discovered
                  </span>
                </div>

                <div className="space-y-2.5">
                  {getEasterEggsForCat(catDef.id).length > 0 ? (
                    getEasterEggsForCat(catDef.id).map((egg) => {
                      const isDiscovered = Boolean(discoveries[egg.id]);
                      const discovery = discoveries[egg.id];

                      return (
                        <div
                          key={egg.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isDiscovered
                              ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                              : 'bg-slate-900/50 border-slate-800/80 opacity-75'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                isDiscovered
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700/60'
                              }`}
                            >
                              {isDiscovered ? (
                                <Sparkles className="w-4 h-4" />
                              ) : (
                                <Egg className="w-4 h-4" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h5
                                  className={`text-sm font-semibold truncate ${
                                    isDiscovered ? 'text-white' : 'text-slate-400'
                                  }`}
                                >
                                  {isDiscovered ? egg.title : '??? (Undiscovered)'}
                                </h5>
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                                    isDiscovered
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                                  }`}
                                >
                                  {isDiscovered ? 'Discovered' : 'Hidden'}
                                </span>
                              </div>

                              {isDiscovered ? (
                                <>
                                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                    {egg.description}
                                  </p>
                                  <p className="text-[11px] text-amber-300/90 italic mt-1 font-mono">
                                    "{egg.caption}"
                                  </p>
                                  {discovery?.discoveredAt && (
                                    <p className="text-[10px] text-slate-500 font-mono mt-1.5">
                                      Discovered on{' '}
                                      {new Date(
                                        discovery.discoveredAt
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <div className="mt-1">
                                  <p className="text-xs text-slate-400 italic">
                                    {egg.hint.clueText}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    Interact with this cat in different situations to uncover the secret.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs italic">
                      No specific Easter eggs cataloged for this cat yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer with Persistent Sync Status */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-orange-400" />
              <span>
                {isGuest
                  ? 'Temporary guest session (Sign in to sync preferences)'
                  : 'Preferences synced to your authenticated profile'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
