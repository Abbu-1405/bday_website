import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Calendar,
  Heart,
  Camera,
  Mail,
  Feather,
  Lock,
  CheckCircle2,
  Award,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Surface } from './Surface';
import { Badge } from './Badge';
import { Button } from './Button';
import { cn } from '../utils';
import { ROUTES } from '../constants';
import { useAuth } from '../hooks';
import {
  getOverallProgress,
  getStageProgress,
  getJourneyCompletionInfo,
  getRemainingDiscoveries,
} from '../services/discoveryService';
import { evaluateBadges } from '../services/badgeService';

export interface UniverseExplorationProps extends React.HTMLAttributes<HTMLDivElement> {
  showJourneyLink?: boolean;
}

export const UniverseExploration: React.FC<UniverseExplorationProps> = ({
  className,
  showJourneyLink = true,
  ...props
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const overall = getOverallProgress();
  const stages = getStageProgress();
  const completionInfo = getJourneyCompletionInfo();
  const remainingList = getRemainingDiscoveries();
  const { badges, summary } = evaluateBadges();

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const isFullCircle = overall.percentage === 100;

  const firstName = currentUser?.displayName
    ? currentUser.displayName.trim().split(' ')[0]
    : currentUser?.email
    ? currentUser.email.split('@')[0]
    : '';

  const titleText = currentUser && firstName
    ? `${firstName}'s Little Universe`
    : 'Your Little Universe';

  // Constellation node position definitions for SVG layout
  const constellationNodes = [
    { key: 'notes365', label: '365 Notes', x: 200, y: 50, icon: Calendar },
    { key: 'adore', label: 'Adore', x: 80, y: 120, icon: Heart },
    { key: 'moments', label: 'Moments', x: 320, y: 120, icon: Camera },
    { key: 'wishes', label: 'Wishes', x: 50, y: 220, icon: Sparkles },
    { key: 'openWhen', label: 'Open When', x: 350, y: 220, icon: Mail },
    { key: 'whatAmIToYou', label: 'Reflections', x: 120, y: 310, icon: Feather },
    { key: 'secretVault', label: 'Secrets', x: 280, y: 310, icon: Lock },
  ];

  // SVG lines connecting nodes in a soft starlit network
  const connections = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 6], [0, 5], [1, 2]
  ];

  return (
    <Surface
      variant="elevated"
      padding="lg"
      className={cn(
        'border border-[var(--color-border-light)] bg-[var(--color-card)] space-y-6 shadow-xs relative overflow-hidden transition-all',
        isFullCircle && 'ring-1 ring-[var(--color-accent)]/30 bg-gradient-to-b from-[var(--color-card)] via-[var(--color-surface)] to-[var(--color-surface-secondary)]',
        className
      )}
      {...props}
    >
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-serif font-semibold text-[var(--color-primary)] uppercase tracking-wider">
            <Compass className="h-3.5 w-3.5" />
            <span>Universe Exploration</span>
          </div>
          <h2 className="text-h2 font-serif font-bold text-[var(--color-text)] tracking-tight">
            {titleText}
          </h2>
          <p className="text-xs sm:text-sm font-serif italic text-[var(--color-text-secondary)]">
            &ldquo;{completionInfo.description}&rdquo;
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end shrink-0 gap-1.5 self-start sm:self-center">
          <div className="flex items-center gap-2">
            <span className="text-h1 font-serif font-extrabold text-[var(--color-primary)]">
              {overall.percentage}%
            </span>
            <Badge
              variant={isFullCircle ? 'success' : 'primary'}
              size="md"
              className="font-serif uppercase tracking-wider"
            >
              {isFullCircle ? (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-[var(--color-accent)] fill-current" />
                  FULL CIRCLE
                </span>
              ) : (
                completionInfo.label
              )}
            </Badge>
          </div>
          <span className="text-xs font-serif text-[var(--color-text-secondary)] font-medium">
            You&apos;ve discovered {overall.totalDiscovered} of {overall.totalUniverse} little pieces.
          </span>
        </div>
      </div>

      {/* 2. Visual Constellation Progress Indicator */}
      <div className="relative p-4 sm:p-6 rounded-[var(--radius-xl)] bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] overflow-hidden">
        <div className="text-center space-y-1 mb-4">
          <span className="text-[11px] font-serif font-semibold text-[var(--color-muted)] uppercase tracking-widest">
            {isFullCircle ? 'All Stars Illuminated' : 'Starlit Constellation'}
          </span>
        </div>

        {/* Constellation SVG Diagram */}
        <div className="relative w-full max-w-md mx-auto aspect-[4/3] flex items-center justify-center">
          <svg
            viewBox="0 0 400 360"
            className="w-full h-full overflow-visible transition-all duration-700"
            aria-label={`Constellation showing ${overall.percentage}% exploration`}
            role="img"
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Lines */}
            {connections.map(([sourceIdx, targetIdx], i) => {
              const srcNode = constellationNodes[sourceIdx];
              const tgtNode = constellationNodes[targetIdx];
              const srcStage = stages.find((s) => s.key === srcNode.key);
              const tgtStage = stages.find((s) => s.key === tgtNode.key);

              const isSrcActive = srcStage && srcStage.discovered > 0;
              const isTgtActive = tgtStage && tgtStage.discovered > 0;
              const isBothActive = isSrcActive && isTgtActive;

              return (
                <line
                  key={`link-${i}`}
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  stroke={
                    isFullCircle || isBothActive
                      ? 'var(--color-primary)'
                      : isSrcActive || isTgtActive
                      ? 'var(--color-border)'
                      : 'var(--color-border-light)'
                  }
                  strokeWidth={isBothActive || isFullCircle ? 2 : 1}
                  strokeDasharray={isBothActive || isFullCircle ? undefined : '3,3'}
                  className="transition-all duration-500"
                  opacity={isBothActive || isFullCircle ? 0.8 : 0.4}
                />
              );
            })}

            {/* Central Core Emblem if Full Circle */}
            {isFullCircle && (
              <g transform="translate(200, 185)">
                <circle
                  r="32"
                  fill="var(--color-accent)"
                  opacity="0.15"
                  className="animate-pulse"
                />
                <circle
                  r="24"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="1.5"
                  strokeDasharray="4,2"
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  fontSize="10"
                  fontFamily="serif"
                  fontWeight="bold"
                  fill="var(--color-text)"
                >
                  ✦ 100% ✦
                </text>
              </g>
            )}

            {/* Star Nodes */}
            {constellationNodes.map((node) => {
              const stage = stages.find((s) => s.key === node.key);
              const discovered = stage?.discovered ?? 0;
              const total = stage?.total ?? 1;
              const pct = stage?.percentage ?? 0;
              const isCompleted = stage?.state === 'COMPLETED';
              const isDiscovered = discovered > 0;

              return (
                <g
                  key={node.key}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => stage?.route && navigate(stage.route)}
                >
                  {/* Outer Glow Halo */}
                  {(isCompleted || isFullCircle) && (
                    <circle
                      r="16"
                      fill="var(--color-accent)"
                      opacity="0.25"
                      className="animate-pulse"
                      filter="url(#glow)"
                    />
                  )}

                  {/* Star Base Circle */}
                  <circle
                    r={isCompleted ? '12' : isDiscovered ? '10' : '8'}
                    fill={
                      isCompleted
                        ? 'var(--color-primary)'
                        : isDiscovered
                        ? 'var(--color-surface)'
                        : 'var(--color-surface-secondary)'
                    }
                    stroke={
                      isDiscovered ? 'var(--color-primary)' : 'var(--color-border)'
                    }
                    strokeWidth={isDiscovered ? 2 : 1}
                    className="transition-all duration-300 group-hover:scale-125"
                  />

                  {/* Star Icon or Dot */}
                  <circle
                    r={isCompleted ? '4' : '2'}
                    fill={
                      isCompleted
                        ? 'var(--color-primary-foreground)'
                        : isDiscovered
                        ? 'var(--color-primary)'
                        : 'var(--color-muted)'
                    }
                  />

                  {/* Node Label */}
                  <text
                    textAnchor="middle"
                    dy="24"
                    fontSize="10"
                    fontFamily="serif"
                    fill="var(--color-text)"
                    className="font-medium group-hover:fill-[var(--color-primary)] transition-colors"
                  >
                    {node.label}
                  </text>

                  {/* Percentage or Count Label */}
                  <text
                    textAnchor="middle"
                    dy="35"
                    fontSize="8"
                    fontFamily="monospace"
                    fill="var(--color-text-secondary)"
                  >
                    {node.key === 'secretVault'
                      ? `${discovered}/${total} found`
                      : `${discovered}/${total}`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Full Circle Celebration Overlay Banner */}
        {isFullCircle && (
          <div className="mt-4 p-3 rounded-lg bg-[var(--color-card)] border border-[var(--color-accent)]/40 text-center space-y-1 shadow-2xs">
            <p className="text-xs font-serif font-bold text-[var(--color-text)] flex items-center justify-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
              FULL CIRCLE REACHED
            </p>
            <p className="text-[11px] font-serif text-[var(--color-text-secondary)] italic">
              You&apos;ve explored every little corner that was waiting for you. Every star is lit.
            </p>
          </div>
        )}
      </div>

      {/* 3. Section Progress Breakdown */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-serif font-semibold text-[var(--color-text)] uppercase tracking-wider flex items-center justify-between">
          <span>Discovery Breakdown</span>
          <span className="text-[10px] text-[var(--color-muted)] font-normal font-sans">
            7 Major Sections
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stages.map((stage) => {
            const isSecret = stage.key === 'secretVault';
            const displayTitle = isSecret ? 'Secrets' : stage.title;
            const displayCount = isSecret
              ? `${stage.discovered} / ${stage.total} discovered`
              : `${stage.discovered} / ${stage.total}`;

            return (
              <div
                key={stage.key}
                onClick={() => navigate(stage.route)}
                className="p-2.5 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] hover:border-[var(--color-primary)]/40 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-serif">
                  <span className="font-semibold text-[var(--color-text)] truncate">
                    {displayTitle}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--color-text-secondary)] shrink-0">
                    {displayCount}
                  </span>
                </div>

                {/* Subtle progress bar */}
                <div
                  className="w-full bg-[var(--color-card)] h-1.5 rounded-full overflow-hidden border border-[var(--color-border-light)]"
                  role="progressbar"
                  aria-valuenow={stage.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${stage.title} progress`}
                >
                  <div
                    className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Badges / Milestones Summary */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-light)] flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-serif text-[var(--color-text-secondary)]">
          <Award className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
          <span>
            <strong className="text-[var(--color-text)]">{summary.unlockedBadges}</strong> of{' '}
            {summary.totalBadges} little milestones discovered.
          </span>
        </div>

        {showJourneyLink && (
          <Button
            variant="text"
            size="sm"
            onClick={() => navigate(ROUTES.JOURNEY)}
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            className="text-xs font-serif p-0 h-auto hover:underline text-[var(--color-primary)]"
          >
            See Your Journey
          </Button>
        )}
      </div>

      {/* 5. Remaining Discoveries Banner */}
      {!isFullCircle && remainingList.length > 0 && (
        <div className="text-center pt-1">
          <p className="text-xs font-serif text-[var(--color-muted)] italic">
            ✨ There&apos;s still more waiting. Some little corners remain unexplored.
          </p>
        </div>
      )}
    </Surface>
  );
};
