import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Calendar,
  Heart,
  Camera,
  Sparkles,
  Mail,
  Feather,
  Lock,
  CheckCircle2,
  ArrowRight,
  Sparkle,
  Clock,
  Star,
  MapPin,
  HelpCircle,
  Eye,
  Award,
} from 'lucide-react';
import { Container, Surface, Badge, AchievementsSection, HiddenDiscoveryElement, UniverseExploration } from '../components';
import { BotanicalCorner, CloverStrip } from '../components/whimsical/WhimsicalDecorations';
import { MidnightCorner } from '../components/midnight/MidnightDecorations';
import { VintageCornerFlourish, VintageBotanicalSprig } from '../components/letterArchive/LetterArchiveDecorations';
import {
  getStageProgress,
  getOverallProgress,
  getDiscoveryTimeline,
  getRemainingDiscoveries,
  getCurrentExploration,
  getJourneyCompletionInfo,
  StageProgress,
} from '../services/discoveryService';
import { useTheme, useAuth } from '../hooks';
import { useAudio } from '../contexts';
import { cn } from '../utils';

// Helper to map icon names to Lucide Icon components safely
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Calendar,
  Heart,
  Camera,
  Sparkles,
  Mail,
  Feather,
  Lock,
  Compass,
  CheckCircle2,
  Sparkle,
};

export default function Journey() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { playMagicalClick, playShimmer } = useAudio();
  const [activeTab, setActiveTab] = useState<'stages' | 'achievements'>('stages');

  const isWhimsical = theme === 'whimsical-scrapbook';
  const isMidnight = theme === 'midnight-journal';
  const isLetterArchive = theme === 'letter-archive';

  const stages = getStageProgress();
  const overall = getOverallProgress();
  const timelineEvents = getDiscoveryTimeline();
  const remainingList = getRemainingDiscoveries();
  const currentStage = getCurrentExploration();
  const completionInfo = getJourneyCompletionInfo();

  const isBrandNewUser = overall.totalDiscovered === 0;
  const isFullyCompleted = overall.percentage === 100;

  const firstName = currentUser?.displayName
    ? currentUser.displayName.trim().split(' ')[0]
    : currentUser?.email
    ? currentUser.email.split('@')[0]
    : '';

  const handleStageNavigation = (route: string) => {
    playMagicalClick();
    navigate(route);
  };

  // Render status badge for stage state
  const renderStateBadge = (state: StageProgress['state']) => {
    switch (state) {
      case 'COMPLETED':
        return (
          <span className={cn(
            "inline-flex items-center text-[10px] font-serif font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs",
            isLetterArchive && "bg-[#7A2E3B]/10 text-[#7A2E3B] border-[#7A2E3B]/30",
            isMidnight && "bg-[rgba(226,189,120,0.15)] text-[#E2BD78] border-[rgba(226,189,120,0.35)]",
            isWhimsical && "bg-[rgba(111,141,98,0.2)] text-[#9ECB8E] border-[rgba(111,141,98,0.35)]",
            !isLetterArchive && !isMidnight && !isWhimsical && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          )}>
            <CheckCircle2 className="h-3 w-3 mr-1" />
            COMPLETED
          </span>
        );
      case 'PARTIALLY EXPLORED':
        return (
          <span className={cn(
            "inline-flex items-center text-[10px] font-serif font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border animate-pulse",
            isLetterArchive && "bg-[#C2934D]/15 text-[#8A6E59] border-[#C2934D]/35",
            isMidnight && "bg-[rgba(201,155,88,0.2)] text-[#F4D18A] border-[rgba(201,155,88,0.4)]",
            isWhimsical && "bg-[rgba(216,184,106,0.18)] text-[#D8B86A] border-[rgba(216,184,106,0.35)]",
            !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20"
          )}>
            <Sparkles className="h-3 w-3 mr-1" />
            PARTIALLY EXPLORED
          </span>
        );
      case 'NOT STARTED':
      default:
        return (
          <span className={cn(
            "inline-flex items-center text-[10px] font-serif font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border opacity-75",
            isLetterArchive && "bg-[#EDE2D2]/60 text-[#8A6E59] border-[rgba(138,110,89,0.25)]",
            isMidnight && "bg-[rgba(16,27,45,0.7)] text-[#9CA3AF] border-[rgba(201,155,88,0.2)]",
            isWhimsical && "bg-[rgba(12,26,15,0.7)] text-[#8CA687] border-[rgba(216,184,106,0.15)]",
            !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface-secondary)] text-[var(--color-muted)] border-[var(--color-border-light)]"
          )}>
            <Clock className="h-3 w-3 mr-1" />
            NOT STARTED
          </span>
        );
    }
  };

  return (
    <Container maxWidth="lg" className="py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* 1. Header Section */}
      <Surface
        variant="elevated"
        padding="lg"
        className={cn(
          "relative overflow-hidden space-y-5 text-center sm:text-left transition-all duration-300",
          isLetterArchive && "bg-[#FAF5EC] border border-[rgba(138,110,89,0.3)] shadow-[0_4px_20px_rgba(60,42,33,0.06)] rounded-2xl",
          isMidnight && "bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.25)] shadow-md rounded-2xl",
          isWhimsical && "rounded-[22px] bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.2)] shadow-sm",
          !isLetterArchive && !isMidnight && !isWhimsical && "border border-[var(--color-border-light)] bg-[var(--color-surface)] shadow-sm"
        )}
      >
        {isWhimsical && (
          <>
            <CloverStrip className="absolute top-0 left-0 right-0 -mt-1" />
            <BotanicalCorner position="top-right" className="absolute top-0 right-0 w-14 h-14 opacity-40 pointer-events-none" />
          </>
        )}
        {isMidnight && (
          <>
            <MidnightCorner position="top-left" className="absolute top-2 left-2 opacity-50" size={26} />
            <MidnightCorner position="top-right" className="absolute top-2 right-2 opacity-50" size={26} />
          </>
        )}
        {isLetterArchive && (
          <>
            <VintageCornerFlourish position="top-left" className="absolute top-2 left-2 opacity-40" size={24} />
            <VintageCornerFlourish position="top-right" className="absolute top-2 right-2 opacity-40" size={24} />
            <VintageBotanicalSprig position="right" className="absolute top-2 right-12 opacity-25 hidden sm:block" size={40} />
          </>
        )}

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            {/* Theme Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium border transition-colors">
              <Compass className={cn(
                "h-3.5 w-3.5",
                isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-primary)]"
              )} />
              <span className={cn(
                "tracking-wider text-[11px] uppercase",
                isLetterArchive && "text-[#7A2E3B] font-semibold",
                isMidnight && "text-[#E2BD78] font-semibold",
                isWhimsical && "text-[#D8B86A] font-semibold",
                !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-primary)]"
              )}>
                {isWhimsical ? 'our shared memory map' : isMidnight ? 'celestial chronicle' : isLetterArchive ? 'chronicles & milestones' : 'EXPLORATION & DISCOVERIES'}
              </span>
              <HiddenDiscoveryElement
                secretId="secret-06"
                label="Examine starlit compass star"
                className={cn(
                  "ml-1",
                  isLetterArchive ? "text-[#C2934D]" : isMidnight ? "text-[#F4D18A]" : "text-[var(--color-accent)]"
                )}
              />
            </div>

            <div>
              {isWhimsical && (
                <span className="whimsical-subtitle text-xs text-[var(--color-accent-rose)] block -mb-0.5 select-none">
                  the unfolding chapters
                </span>
              )}
              {isMidnight && (
                <span className="midnight-subtitle text-xs text-[#E2BD78] block -mb-0.5 select-none">
                  pathways across the quiet sky
                </span>
              )}
              {isLetterArchive && (
                <span className="letter-script text-sm text-[#7A2E3B] block -mb-0.5 select-none">
                  pages etched with memory
                </span>
              )}
              <h1 className={cn(
                "text-h1 font-serif font-bold tracking-tight",
                isLetterArchive && "text-[#3B2A20]",
                isMidnight && "text-[#F2E4CF]",
                isWhimsical && "text-[var(--color-text)]",
                !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-text)]"
              )}>
                YOUR JOURNEY
              </h1>
            </div>

            <p className={cn(
              "text-body font-serif italic leading-relaxed",
              isLetterArchive ? "text-[#5C4A42]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
            )}>
              &quot;{firstName ? `${firstName}, every` : 'Every'} little discovery becomes part of your story.&quot;
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end shrink-0 gap-1.5 self-center sm:self-start">
            <span className={cn(
              "inline-flex items-center text-xs font-serif font-medium px-3 py-1 rounded-full border shadow-2xs",
              isLetterArchive && "bg-[#F2E8DC] text-[#7A2E3B] border-[rgba(138,110,89,0.35)]",
              isMidnight && "bg-[rgba(16,27,45,0.9)] text-[#E2BD78] border-[rgba(201,155,88,0.35)]",
              isWhimsical && "bg-[rgba(20,38,25,0.9)] text-[#D8B86A] border-[rgba(216,184,106,0.3)]",
              !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface-secondary)] text-[var(--color-primary)] border-[var(--color-border-light)]"
            )}>
              <Star className={cn(
                "h-3.5 w-3.5 mr-1 fill-current",
                isLetterArchive ? "text-[#C2934D]" : isMidnight ? "text-[#F4D18A]" : "text-[var(--color-accent)]"
              )} />
              {overall.totalDiscovered} / {overall.totalUniverse} Discovered
            </span>
            <span className={cn(
              "text-xs font-serif",
              isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#A89885]" : "text-[var(--color-text-secondary)]"
            )}>
              Starlit Universe Progress
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className={cn(
          "pt-4 border-t flex items-center justify-center sm:justify-start gap-2 relative z-10",
          isLetterArchive && "border-[rgba(138,110,89,0.25)]",
          isMidnight && "border-[rgba(201,155,88,0.2)]",
          isWhimsical && "border-[rgba(216,184,106,0.15)]",
          !isLetterArchive && !isMidnight && !isWhimsical && "border-[var(--color-border-light)]"
        )}>
          <button
            type="button"
            onClick={() => {
              playMagicalClick();
              setActiveTab('stages');
            }}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-serif font-medium transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs',
              activeTab === 'stages'
                ? isLetterArchive
                  ? 'bg-[#7A2E3B] text-[#FFF9F0] font-semibold'
                  : isMidnight
                  ? 'bg-[#C99B58] text-[#070E1A] font-semibold'
                  : isWhimsical
                  ? 'bg-[#D8B86A] text-[#0A160D] font-semibold'
                  : 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold'
                : isLetterArchive
                ? 'bg-[#F2E8DC] text-[#6B5547] hover:text-[#3B2A20] hover:bg-[#EAE0D3] border border-[rgba(138,110,89,0.3)]'
                : isMidnight
                ? 'bg-[rgba(16,27,45,0.7)] text-[#C2AF99] hover:text-[#F2E4CF] hover:bg-[rgba(20,35,60,0.8)] border border-[rgba(201,155,88,0.25)]'
                : isWhimsical
                ? 'bg-[rgba(16,30,20,0.7)] text-[#BAC7B7] hover:text-[#F5EFEB] hover:bg-[rgba(20,38,25,0.8)] border border-[rgba(216,184,106,0.2)]'
                : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] border border-[var(--color-border-light)]'
            )}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Stages & Map</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playShimmer();
              setActiveTab('achievements');
            }}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-serif font-medium transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs',
              activeTab === 'achievements'
                ? isLetterArchive
                  ? 'bg-[#7A2E3B] text-[#FFF9F0] font-semibold'
                  : isMidnight
                  ? 'bg-[#C99B58] text-[#070E1A] font-semibold'
                  : isWhimsical
                  ? 'bg-[#D8B86A] text-[#0A160D] font-semibold'
                  : 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold'
                : isLetterArchive
                ? 'bg-[#F2E8DC] text-[#6B5547] hover:text-[#3B2A20] hover:bg-[#EAE0D3] border border-[rgba(138,110,89,0.3)]'
                : isMidnight
                ? 'bg-[rgba(16,27,45,0.7)] text-[#C2AF99] hover:text-[#F2E4CF] hover:bg-[rgba(20,35,60,0.8)] border border-[rgba(201,155,88,0.25)]'
                : isWhimsical
                ? 'bg-[rgba(16,30,20,0.7)] text-[#BAC7B7] hover:text-[#F5EFEB] hover:bg-[rgba(20,38,25,0.8)] border border-[rgba(216,184,106,0.2)]'
                : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] border border-[var(--color-border-light)]'
            )}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Achievements & Badges</span>
          </button>
        </div>
      </Surface>

      {/* Render active view tab */}
      {activeTab === 'achievements' ? (
        <AchievementsSection />
      ) : (
        <>
          {/* 2. Universe Exploration Summary */}
          <UniverseExploration showJourneyLink={false} />

          {/* 3 & 4. Visual Journey Path Section */}
          <section className="space-y-6">
            <div className="text-center sm:text-left space-y-1">
              {isWhimsical && (
                <span className="whimsical-subtitle text-xs text-[var(--color-accent-rose)] block -mb-0.5 select-none">
                  unfolding memory trails
                </span>
              )}
              {isMidnight && (
                <span className="midnight-subtitle text-xs text-[#E2BD78] block -mb-0.5 select-none">
                  celestial coordinates
                </span>
              )}
              {isLetterArchive && (
                <span className="letter-script text-sm text-[#7A2E3B] block -mb-0.5 select-none">
                  the chapters of our correspondence
                </span>
              )}
              <h2 className={cn(
                "text-h2 font-serif font-bold tracking-tight",
                isLetterArchive && "text-[#3B2A20]",
                isMidnight && "text-[#F2E4CF]",
                isWhimsical && "text-[var(--color-text)]",
                !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-text)]"
              )}>
                THE STAGES OF EXPLORATION
              </h2>
              <p className={cn(
                "text-body-sm font-serif leading-relaxed",
                isLetterArchive ? "text-[#5C4A42]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
              )}>
                Follow the starlit path connecting every experience in our quiet universe.
              </p>
            </div>

            {/* Winding Path Visual Component */}
            <div className="relative py-4">
              {/* Start Chapter Marker */}
              <div className="flex justify-center mb-8">
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-xs transition-colors",
                  isLetterArchive && "bg-[#FAF5EC] border-[rgba(138,110,89,0.35)] text-[#3B2A20]",
                  isMidnight && "bg-[rgba(13,23,40,0.9)] border-[rgba(201,155,88,0.35)] text-[#F2E4CF]",
                  isWhimsical && "bg-[rgba(16,30,20,0.9)] border-[rgba(216,184,106,0.3)] text-[#F5EFEB]",
                  !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-text)]"
                )}>
                  <MapPin className={cn(
                    "h-4 w-4",
                    isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : isWhimsical ? "text-[#D8B86A]" : "text-[var(--color-primary)]"
                  )} />
                  <span className="text-xs font-serif font-bold tracking-wider uppercase">
                    START — THE STARLIT GATE
                  </span>
                </div>
              </div>

              {/* Desktop & Mobile Path Grid */}
              <div className="relative space-y-8 md:space-y-12">
                {/* Background Line for desktop (centered) */}
                <div className="hidden md:block absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-0.5 pointer-events-none">
                  <div className={cn(
                    "w-full h-full rounded-full transition-all",
                    isLetterArchive && "bg-gradient-to-b from-[#7A2E3B]/60 via-[#C2934D]/60 to-[#8A6E59]/60",
                    isMidnight && "bg-gradient-to-b from-[#C99B58]/70 via-[#E2BD78]/70 to-[#C99B58]/40",
                    isWhimsical && "bg-gradient-to-b from-[#D8B86A]/60 via-[#6F8D62]/60 to-[#D8B86A]/40",
                    !isLetterArchive && !isMidnight && !isWhimsical && "bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)] opacity-40"
                  )} />
                </div>

                {/* Background Line for mobile (left-aligned under nodes) */}
                <div className="md:hidden absolute left-6 top-6 bottom-6 w-0.5 pointer-events-none">
                  <div className={cn(
                    "w-full h-full rounded-full",
                    isLetterArchive && "bg-[#8A6E59]/30",
                    isMidnight && "bg-[rgba(201,155,88,0.3)]",
                    isWhimsical && "bg-[rgba(216,184,106,0.25)]",
                    !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-border)]"
                  )} />
                </div>

                {stages.map((stage, idx) => {
                  const StageIcon = ICON_MAP[stage.iconName] || Compass;
                  const isEven = idx % 2 === 0;
                  const isCompleted = stage.state === 'COMPLETED';
                  const isStarted = stage.discovered > 0;

                  return (
                    <div
                      key={stage.key}
                      className={cn(
                        'relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 transition-all duration-300',
                        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                      )}
                    >
                      {/* Node Marker */}
                      <div className="flex items-center gap-3 md:block z-10 shrink-0">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center shadow-md shrink-0 transition-all duration-300",
                          isCompleted && "ring-2",
                          isLetterArchive && (
                            isCompleted
                              ? "bg-[#7A2E3B] text-[#FFF9F0] border-2 border-[#C2934D] ring-[#7A2E3B]/30"
                              : isStarted
                              ? "bg-[#FAF5EC] text-[#7A2E3B] border-2 border-[#7A2E3B]"
                              : "bg-[#F2E8DC] text-[#8A6E59] border border-[rgba(138,110,89,0.4)]"
                          ),
                          isMidnight && (
                            isCompleted
                              ? "bg-[#C99B58] text-[#070E1A] border-2 border-[#E2BD78] ring-[#E2BD78]/40 shadow-[0_0_12px_rgba(226,189,120,0.25)]"
                              : isStarted
                              ? "bg-[rgba(13,23,40,0.9)] text-[#E2BD78] border-2 border-[#C99B58]"
                              : "bg-[rgba(16,27,45,0.8)] text-[#9CA3AF] border border-[rgba(201,155,88,0.25)]"
                          ),
                          isWhimsical && (
                            isCompleted
                              ? "bg-[#D8B86A] text-[#0A160D] border-2 border-[#FFF8E8] ring-[#D8B86A]/40"
                              : isStarted
                              ? "bg-[rgba(16,30,20,0.9)] text-[#D8B86A] border-2 border-[#D8B86A]"
                              : "bg-[rgba(20,38,25,0.8)] text-[#8CA687] border border-[rgba(216,184,106,0.25)]"
                          ),
                          !isLetterArchive && !isMidnight && !isWhimsical && (
                            isCompleted
                              ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-2 border-[var(--color-accent)] ring-[var(--color-primary)]/20"
                              : isStarted
                              ? "bg-[var(--color-surface)] text-[var(--color-primary)] border-2 border-[var(--color-primary)]"
                              : "bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)]"
                          )
                        )}>
                          <StageIcon className="h-5 w-5" />
                        </div>
                        {/* Mobile Title preview next to marker for clarity */}
                        <div className="md:hidden min-w-0">
                          <span className={cn(
                            "text-xs font-serif font-bold uppercase tracking-wider block",
                            isLetterArchive && "text-[#7A2E3B]",
                            isMidnight && "text-[#E2BD78]",
                            isWhimsical && "text-[#D8B86A]",
                            !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-primary)]"
                          )}>
                            Stage {idx + 1}
                          </span>
                        </div>
                      </div>

                      {/* Content Card (Memory Fragment) */}
                      <div className="w-full md:w-[calc(50%-2.5rem)] pl-4 md:pl-0">
                        <Surface
                          variant="interactive"
                          padding="md"
                          onClick={() => handleStageNavigation(stage.route)}
                          className={cn(
                            "space-y-3 cursor-pointer group transition-all duration-200 rounded-xl",
                            isLetterArchive && "bg-[#FAF5EC] border border-[rgba(138,110,89,0.3)] hover:border-[#7A2E3B]/50 shadow-[0_3px_15px_rgba(60,42,33,0.05)]",
                            isMidnight && "bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.25)] hover:border-[#E2BD78]/40 shadow-md",
                            isWhimsical && "bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.2)] hover:border-[#D8B86A]/40 shadow-sm",
                            !isLetterArchive && !isMidnight && !isWhimsical && "border border-[var(--color-border-light)] bg-[var(--color-card)] hover:border-[var(--color-primary)] shadow-xs"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h3 className={cn(
                              "text-h3 font-serif font-bold tracking-tight transition-colors",
                              isLetterArchive && "text-[#3B2A20] group-hover:text-[#7A2E3B]",
                              isMidnight && "text-[#F2E4CF] group-hover:text-[#E2BD78]",
                              isWhimsical && "text-[var(--color-text)] group-hover:text-[#D8B86A]",
                              !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-text)] group-hover:text-[var(--color-primary)]"
                            )}>
                              {stage.title}
                            </h3>
                            {renderStateBadge(stage.state)}
                          </div>

                          <p className={cn(
                            "text-body-sm font-serif leading-relaxed",
                            isLetterArchive ? "text-[#5C4A42]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
                          )}>
                            {stage.description}
                          </p>

                          {/* Stage Progress Bar */}
                          <div className="space-y-1.5 pt-1">
                            <div className={cn(
                              "flex justify-between text-xs font-serif",
                              isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#A89885]" : "text-[var(--color-text-secondary)]"
                            )}>
                              <span>Discovered</span>
                              <span className="font-mono">
                                {stage.discovered} / {stage.total} ({stage.percentage}%)
                              </span>
                            </div>
                            <div className={cn(
                              "w-full h-1.5 rounded-full overflow-hidden border",
                              isLetterArchive && "bg-[#EDE2D2] border-[rgba(138,110,89,0.25)]",
                              isMidnight && "bg-[rgba(7,14,26,0.8)] border-[rgba(201,155,88,0.2)]",
                              isWhimsical && "bg-[rgba(8,20,11,0.8)] border-[rgba(216,184,106,0.15)]",
                              !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface-secondary)] border-[var(--color-border-light)]"
                            )}>
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-500',
                                  isLetterArchive
                                    ? stage.state === 'COMPLETED' ? 'bg-[#7A2E3B]' : 'bg-[#C2934D]'
                                    : isMidnight
                                    ? stage.state === 'COMPLETED' ? 'bg-[#E2BD78]' : 'bg-[#C99B58]'
                                    : isWhimsical
                                    ? stage.state === 'COMPLETED' ? 'bg-[#9ECB8E]' : 'bg-[#D8B86A]'
                                    : stage.state === 'COMPLETED' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-primary)]'
                                )}
                                style={{ width: `${stage.percentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Enter Stage Callout */}
                          <div className={cn(
                            "pt-2 flex items-center justify-end text-xs font-serif font-semibold group-hover:translate-x-1 transition-transform",
                            isLetterArchive && "text-[#7A2E3B]",
                            isMidnight && "text-[#E2BD78]",
                            isWhimsical && "text-[#D8B86A]",
                            !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-primary)]"
                          )}>
                            <span>Enter Experience</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </div>
                        </Surface>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* End Chapter Marker */}
              <div className="flex justify-center mt-8">
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-xs transition-colors",
                  isLetterArchive && "bg-[#FAF5EC] border-[rgba(138,110,89,0.35)] text-[#3B2A20]",
                  isMidnight && "bg-[rgba(13,23,40,0.9)] border-[rgba(201,155,88,0.35)] text-[#F2E4CF]",
                  isWhimsical && "bg-[rgba(16,30,20,0.9)] border-[rgba(216,184,106,0.3)] text-[#F5EFEB]",
                  !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-text)]"
                )}>
                  <Sparkles className={cn(
                    "h-4 w-4",
                    isLetterArchive ? "text-[#C2934D]" : isMidnight ? "text-[#F4D18A]" : isWhimsical ? "text-[#D8B86A]" : "text-[var(--color-accent)]"
                  )} />
                  <span className="text-xs font-serif font-bold tracking-wider uppercase">
                    MORE TO DISCOVER IN FUTURE HORIZONS
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Timeline of Discoveries */}
          <section className={cn(
            "space-y-4 pt-6 border-t",
            isLetterArchive && "border-[rgba(138,110,89,0.25)]",
            isMidnight && "border-[rgba(201,155,88,0.2)]",
            isWhimsical && "border-[rgba(216,184,106,0.15)]",
            !isLetterArchive && !isMidnight && !isWhimsical && "border-[var(--color-border-light)]"
          )}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Clock className={cn(
                  "h-5 w-5",
                  isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : isWhimsical ? "text-[#D8B86A]" : "text-[var(--color-primary)]"
                )} />
                <div>
                  {isWhimsical && (
                    <span className="whimsical-subtitle text-xs text-[var(--color-accent-rose)] block -mb-0.5 select-none">
                      echoes & recollections
                    </span>
                  )}
                  {isMidnight && (
                    <span className="midnight-subtitle text-xs text-[#E2BD78] block -mb-0.5 select-none">
                      chronological constellation
                    </span>
                  )}
                  {isLetterArchive && (
                    <span className="letter-script text-sm text-[#7A2E3B] block -mb-0.5 select-none">
                      inscribed moments in time
                    </span>
                  )}
                  <h2 className={cn(
                    "text-h3 font-serif font-bold tracking-tight",
                    isLetterArchive && "text-[#3B2A20]",
                    isMidnight && "text-[#F2E4CF]",
                    isWhimsical && "text-[var(--color-text)]",
                    !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-text)]"
                  )}>
                    TIMELINE OF DISCOVERIES
                  </h2>
                </div>
              </div>
              <span className={cn(
                "text-xs font-serif italic",
                isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
              )}>
                Your story unfolding over time
              </span>
            </div>

            <Surface
              variant="card"
              padding="md"
              className={cn(
                "space-y-4 shadow-xs rounded-xl",
                isLetterArchive && "bg-[#FAF5EC] border border-[rgba(138,110,89,0.3)]",
                isMidnight && "bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.25)]",
                isWhimsical && "bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.2)]",
                !isLetterArchive && !isMidnight && !isWhimsical && "border border-[var(--color-border-light)] bg-[var(--color-card)]"
              )}
            >
              {timelineEvents.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <Compass className={cn(
                    "h-8 w-8 mx-auto opacity-60",
                    isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-primary)]"
                  )} />
                  <p className={cn(
                    "text-sm font-serif font-semibold",
                    isLetterArchive && "text-[#3B2A20]",
                    isMidnight && "text-[#F2E4CF]",
                    isWhimsical && "text-[var(--color-text)]",
                    !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-text)]"
                  )}>
                    Your story is waiting to unfold.
                  </p>
                  <p className={cn(
                    "text-xs font-serif max-w-sm mx-auto",
                    isLetterArchive ? "text-[#5C4A42]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
                  )}>
                    Begin exploring any section above to make your first discovery and see your personal story take shape.
                  </p>
                </div>
              ) : (
                <div className={cn(
                  "relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5",
                  isLetterArchive && "before:bg-[rgba(138,110,89,0.25)]",
                  isMidnight && "before:bg-[rgba(201,155,88,0.25)]",
                  isWhimsical && "before:bg-[rgba(216,184,106,0.2)]",
                  !isLetterArchive && !isMidnight && !isWhimsical && "before:bg-[var(--color-border)]"
                )}>
                  {timelineEvents.map((evt, idx) => {
                    const EvtIcon = ICON_MAP[evt.iconName] || Star;
                    return (
                      <div key={`${evt.id}-${idx}`} className="relative group">
                        {/* Node Dot */}
                        <div
                          className={cn(
                            'absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110',
                            isLetterArchive && (
                              evt.type === 'start'
                                ? 'bg-[#FAF5EC] border-[#7A2E3B]'
                                : evt.type === 'milestone'
                                ? 'bg-[#FAF5EC] border-[#C2934D]'
                                : 'bg-[#FAF5EC] border-[#8A6E59]'
                            ),
                            isMidnight && (
                              evt.type === 'start'
                                ? 'bg-[rgba(13,23,40,0.9)] border-[#E2BD78]'
                                : evt.type === 'milestone'
                                ? 'bg-[rgba(13,23,40,0.9)] border-[#F4D18A]'
                                : 'bg-[rgba(13,23,40,0.9)] border-[#C99B58]'
                            ),
                            isWhimsical && (
                              evt.type === 'start'
                                ? 'bg-[rgba(16,30,20,0.9)] border-[#D8B86A]'
                                : evt.type === 'milestone'
                                ? 'bg-[rgba(16,30,20,0.9)] border-[#E5A8B8]'
                                : 'bg-[rgba(16,30,20,0.9)] border-[#6F8D62]'
                            ),
                            !isLetterArchive && !isMidnight && !isWhimsical && (
                              evt.type === 'start'
                                ? 'bg-[var(--color-surface)] border-[var(--color-primary)]'
                                : evt.type === 'milestone'
                                ? 'bg-[var(--color-surface)] border-[var(--color-accent)]'
                                : 'bg-[var(--color-surface)] border-[var(--color-secondary)]'
                            )
                          )}
                        />

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className={cn(
                              "text-xs font-serif font-bold flex items-center gap-1.5 tracking-wider",
                              isLetterArchive && "text-[#7A2E3B]",
                              isMidnight && "text-[#E2BD78]",
                              isWhimsical && "text-[#D8B86A]",
                              !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-primary)]"
                            )}>
                              <EvtIcon className="h-3.5 w-3.5 shrink-0" />
                              {evt.title}
                            </span>
                            {evt.dateDisplay && (
                              <span className={cn(
                                "text-[10px] font-mono shrink-0 px-2 py-0.5 rounded-full border",
                                isLetterArchive && "bg-[#F2E8DC] text-[#8A6E59] border-[rgba(138,110,89,0.3)]",
                                isMidnight && "bg-[rgba(16,27,45,0.8)] text-[#C2AF99] border-[rgba(201,155,88,0.25)]",
                                isWhimsical && "bg-[rgba(20,38,25,0.8)] text-[#BAC7B7] border-[rgba(216,184,106,0.2)]",
                                !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-light)]"
                              )}>
                                {evt.dateDisplay}
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            "text-xs sm:text-sm font-serif leading-relaxed",
                            isLetterArchive ? "text-[#5C4A42]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
                          )}>
                            {evt.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Surface>
          </section>

          {/* 6. Remaining Discoveries Section */}
          <section className={cn(
            "space-y-4 pt-6 border-t",
            isLetterArchive && "border-[rgba(138,110,89,0.25)]",
            isMidnight && "border-[rgba(201,155,88,0.2)]",
            isWhimsical && "border-[rgba(216,184,106,0.15)]",
            !isLetterArchive && !isMidnight && !isWhimsical && "border-[var(--color-border-light)]"
          )}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle className={cn(
                  "h-5 w-5",
                  isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C99B58]" : isWhimsical ? "text-[#6F8D62]" : "text-[var(--color-secondary)]"
                )} />
                <div>
                  {isWhimsical && (
                    <span className="whimsical-subtitle text-xs text-[var(--color-accent-rose)] block -mb-0.5 select-none">
                      hidden keepsakes
                    </span>
                  )}
                  {isMidnight && (
                    <span className="midnight-subtitle text-xs text-[#E2BD78] block -mb-0.5 select-none">
                      unmapped stars
                    </span>
                  )}
                  {isLetterArchive && (
                    <span className="letter-script text-sm text-[#7A2E3B] block -mb-0.5 select-none">
                      unopened folios
                    </span>
                  )}
                  <h2 className={cn(
                    "text-h3 font-serif font-bold tracking-tight",
                    isLetterArchive && "text-[#3B2A20]",
                    isMidnight && "text-[#F2E4CF]",
                    isWhimsical && "text-[var(--color-text)]",
                    !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-text)]"
                  )}>
                    WAITING TO BE DISCOVERED
                  </h2>
                </div>
              </div>
              <span className={cn(
                "text-xs font-serif",
                isLetterArchive ? "text-[#8A6E59]" : isMidnight ? "text-[#C2AF99]" : "text-[var(--color-text-secondary)]"
              )}>
                Explore pages to uncover hidden stories
              </span>
            </div>

            <Surface
              variant="card"
              padding="md"
              className={cn(
                "space-y-4 shadow-xs rounded-xl",
                isLetterArchive && "bg-[#FAF5EC] border border-[rgba(138,110,89,0.3)]",
                isMidnight && "bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.25)]",
                isWhimsical && "bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.2)]",
                !isLetterArchive && !isMidnight && !isWhimsical && "border border-[var(--color-border-light)] bg-[var(--color-card)]"
              )}
            >
              {remainingList.length === 0 ? (
                <div className="text-center py-4 space-y-1">
                  <CheckCircle2 className={cn(
                    "h-6 w-6 mx-auto",
                    isLetterArchive ? "text-[#7A2E3B]" : isMidnight ? "text-[#E2BD78]" : "text-[var(--color-success)]"
                  )} />
                  <p className={cn(
                    "text-sm font-serif font-semibold",
                    isLetterArchive && "text-[#3B2A20]",
                    isMidnight && "text-[#F2E4CF]",
                    isWhimsical && "text-[var(--color-text)]",
                    !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-text)]"
                  )}>
                    All currently available items have been discovered!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {remainingList.map((item) => (
                    <div
                      key={item.key}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border text-xs font-serif transition-colors",
                        isLetterArchive && "bg-[#F2E8DC] border-[rgba(138,110,89,0.3)]",
                        isMidnight && "bg-[rgba(16,27,45,0.8)] border-[rgba(201,155,88,0.25)]",
                        isWhimsical && "bg-[rgba(20,38,25,0.8)] border-[rgba(216,184,106,0.2)]",
                        !isLetterArchive && !isMidnight && !isWhimsical && "bg-[var(--color-surface-secondary)] border-[var(--color-border-light)]"
                      )}
                    >
                      <span className={cn(
                        "font-semibold",
                        isLetterArchive && "text-[#3B2A20]",
                        isMidnight && "text-[#F2E4CF]",
                        isWhimsical && "text-[var(--color-text)]",
                        !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-text)]"
                      )}>
                        {item.name}
                      </span>
                      <span className={cn(
                        "font-mono font-medium",
                        isLetterArchive && "text-[#7A2E3B]",
                        isMidnight && "text-[#E2BD78]",
                        isWhimsical && "text-[#D8B86A]",
                        !isLetterArchive && !isMidnight && !isWhimsical && "text-[var(--color-primary)]"
                      )}>
                        {item.remaining} remaining
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className={cn(
                "mt-4 pt-3 border-t text-[11px] font-serif flex items-center gap-1.5",
                isLetterArchive && "border-[rgba(138,110,89,0.2)] text-[#8A6E59]",
                isMidnight && "border-[rgba(201,155,88,0.2)] text-[#A89885]",
                isWhimsical && "border-[rgba(216,184,106,0.15)] text-[#8CA687]",
                !isLetterArchive && !isMidnight && !isWhimsical && "border-[var(--color-border-light)] text-[var(--color-text-secondary)]"
              )}>
                <Eye className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span>
                  Note: Secret Vault details and conditions remain strictly confidential until unlocked.
                </span>
              </div>
            </Surface>
          </section>
        </>
      )}
    </Container>
  );
}
