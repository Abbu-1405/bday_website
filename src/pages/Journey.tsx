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
          <Badge variant="success" size="sm" className="font-serif shadow-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            COMPLETED
          </Badge>
        );
      case 'PARTIALLY EXPLORED':
        return (
          <Badge variant="primary" size="sm" className="font-serif animate-pulse">
            <Sparkles className="h-3 w-3 mr-1" />
            PARTIALLY EXPLORED
          </Badge>
        );
      case 'NOT STARTED':
      default:
        return (
          <Badge variant="secondary" size="sm" className="font-serif opacity-75">
            <Clock className="h-3 w-3 mr-1" />
            NOT STARTED
          </Badge>
        );
    }
  };

  return (
    <Container maxWidth="lg" className="py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* 1. Header Section */}
      <Surface
        variant="elevated"
        padding="lg"
        className="relative overflow-hidden border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4 text-center sm:text-left shadow-sm"
      >
        {isWhimsical && <CloverStrip className="absolute top-0 left-0 right-0 -mt-1" />}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium bg-[var(--color-surface-secondary)] text-[var(--color-primary)] border border-[var(--color-border-light)]">
              <Compass className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              <span>EXPLORATION & DISCOVERIES</span>
              <HiddenDiscoveryElement
                secretId="secret-06"
                label="Examine starlit compass star"
                className="ml-1 text-[var(--color-accent)]"
              />
            </div>

            <h1 className="text-h1 font-serif font-bold text-[var(--color-text)] tracking-tight">
              YOUR JOURNEY
            </h1>

            <p className="text-body text-[var(--color-text-secondary)] font-serif italic leading-relaxed">
              &quot;{firstName ? `${firstName}, every` : 'Every'} little discovery becomes part of your story.&quot;
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end shrink-0 gap-1.5 self-center sm:self-start">
            <Badge variant="primary" size="md" className="font-serif">
              <Star className="h-3.5 w-3.5 mr-1 text-[var(--color-accent)] fill-current" />
              {overall.totalDiscovered} / {overall.totalUniverse} Discovered
            </Badge>
            <span className="text-xs text-[var(--color-text-secondary)] font-serif">
              Starlit Universe Progress
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="pt-3 border-t border-[var(--color-border-light)] flex items-center justify-center sm:justify-start gap-2">
          <button
            type="button"
            onClick={() => {
              playMagicalClick();
              setActiveTab('stages');
            }}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-serif font-medium transition-all cursor-pointer inline-flex items-center gap-1.5',
              activeTab === 'stages'
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold shadow-2xs'
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
              'px-4 py-2 rounded-full text-xs font-serif font-medium transition-all cursor-pointer inline-flex items-center gap-1.5',
              activeTab === 'achievements'
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold shadow-2xs'
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
              <h2 className="text-h2 font-serif font-bold text-[var(--color-text)] tracking-tight">
                THE STAGES OF EXPLORATION
              </h2>
              <p className="text-body-sm font-serif text-[var(--color-text-secondary)]">
                Follow the starlit path connecting every experience in our quiet universe.
              </p>
            </div>

            {/* Winding Path Visual Component */}
            <div className="relative py-4">
              {/* Start Chapter Marker */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] shadow-xs">
                  <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-xs font-serif font-bold tracking-wider text-[var(--color-text)] uppercase">
                    START — THE STARLIT GATE
                  </span>
                </div>
              </div>

              {/* Desktop & Mobile Path Grid */}
              <div className="relative space-y-8 md:space-y-12">
                {/* Background SVG Path line for desktop */}
                <div className="hidden md:block absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-1 pointer-events-none opacity-40">
                  <div className="w-full h-full bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)] rounded-full" />
                </div>

                {stages.map((stage, idx) => {
                  const StageIcon = ICON_MAP[stage.iconName] || Compass;
                  const isEven = idx % 2 === 0;

                  return (
                    <div
                      key={stage.key}
                      className={cn(
                        'relative flex flex-col md:flex-row items-center gap-4 md:gap-8 transition-all duration-300',
                        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                      )}
                    >
                      {/* Node Marker */}
                      <div className="z-10 w-12 h-12 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-primary)] flex items-center justify-center shadow-md shrink-0">
                        <StageIcon className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>

                      {/* Content Card */}
                      <div className="w-full md:w-[calc(50%-2.5rem)]">
                        <Surface
                          variant="interactive"
                          padding="md"
                          onClick={() => handleStageNavigation(stage.route)}
                          className="border border-[var(--color-border-light)] bg-[var(--color-card)] hover:border-[var(--color-primary)] space-y-3 shadow-xs cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-h3 font-serif font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                              {stage.title}
                            </h3>
                            {renderStateBadge(stage.state)}
                          </div>

                          <p className="text-body-sm font-serif text-[var(--color-text-secondary)] leading-relaxed">
                            {stage.description}
                          </p>

                          {/* Stage Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-serif text-[var(--color-text-secondary)]">
                              <span>Discovered</span>
                              <span>
                                {stage.discovered} / {stage.total} ({stage.percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-[var(--color-surface-secondary)] h-1.5 rounded-full overflow-hidden border border-[var(--color-border-light)]">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-500',
                                  stage.state === 'COMPLETED'
                                    ? 'bg-[var(--color-success)]'
                                    : 'bg-[var(--color-primary)]'
                                )}
                                style={{ width: `${stage.percentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Enter Stage Callout */}
                          <div className="pt-2 flex items-center justify-end text-xs font-serif font-semibold text-[var(--color-primary)] group-hover:translate-x-1 transition-transform">
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] shadow-xs">
                  <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                  <span className="text-xs font-serif font-bold tracking-wider text-[var(--color-text)] uppercase">
                    MORE TO DISCOVER IN FUTURE HORIZONS
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Timeline of Discoveries */}
          <section className="space-y-4 pt-4 border-t border-[var(--color-border-light)]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[var(--color-primary)]" />
                <h2 className="text-h3 font-serif font-bold text-[var(--color-text)] tracking-tight">
                  TIMELINE OF DISCOVERIES
                </h2>
              </div>
              <span className="text-xs font-serif text-[var(--color-text-secondary)] italic">
                Your story unfolding over time
              </span>
            </div>

            <Surface
              variant="card"
              padding="md"
              className="border border-[var(--color-border-light)] bg-[var(--color-card)] space-y-4 shadow-xs"
            >
              {timelineEvents.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <Compass className="h-8 w-8 text-[var(--color-primary)] mx-auto opacity-60" />
                  <p className="text-sm font-serif text-[var(--color-text)] font-semibold">
                    Your story is waiting to unfold.
                  </p>
                  <p className="text-xs font-serif text-[var(--color-text-secondary)] max-w-sm mx-auto">
                    Begin exploring any section above to make your first discovery and see your personal story take shape.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-border)]">
                  {timelineEvents.map((evt, idx) => {
                    const EvtIcon = ICON_MAP[evt.iconName] || Star;
                    return (
                      <div key={`${evt.id}-${idx}`} className="relative group">
                        {/* Node Dot */}
                        <div
                          className={cn(
                            'absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-[var(--color-surface)] border-2 flex items-center justify-center',
                            evt.type === 'start'
                              ? 'border-[var(--color-primary)]'
                              : evt.type === 'milestone'
                              ? 'border-[var(--color-accent)]'
                              : 'border-[var(--color-secondary)]'
                          )}
                        />

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-xs font-serif font-bold text-[var(--color-primary)] flex items-center gap-1.5 tracking-wider">
                              <EvtIcon className="h-3.5 w-3.5 shrink-0" />
                              {evt.title}
                            </span>
                            {evt.dateDisplay && (
                              <span className="text-[10px] font-mono text-[var(--color-text-secondary)] shrink-0">
                                {evt.dateDisplay}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-serif text-[var(--color-text-secondary)] leading-relaxed">
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
          <section className="space-y-4 pt-4 border-t border-[var(--color-border-light)]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[var(--color-secondary)]" />
                <h2 className="text-h3 font-serif font-bold text-[var(--color-text)] tracking-tight">
                  WAITING TO BE DISCOVERED
                </h2>
              </div>
              <span className="text-xs font-serif text-[var(--color-text-secondary)]">
                Explore pages to uncover hidden stories
              </span>
            </div>

            <Surface
              variant="card"
              padding="md"
              className="border border-[var(--color-border-light)] bg-[var(--color-card)] shadow-xs"
            >
              {remainingList.length === 0 ? (
                <div className="text-center py-4 space-y-1">
                  <CheckCircle2 className="h-6 w-6 text-[var(--color-success)] mx-auto" />
                  <p className="text-sm font-serif text-[var(--color-text)] font-semibold">
                    All currently available items have been discovered!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {remainingList.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-xs font-serif"
                    >
                      <span className="text-[var(--color-text)] font-semibold">{item.name}</span>
                      <span className="text-[var(--color-primary)] font-mono font-medium">
                        {item.remaining} remaining
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-[var(--color-border-light)] text-[11px] font-serif text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-[var(--color-muted)] shrink-0" />
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

