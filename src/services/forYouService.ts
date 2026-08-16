import { getOverallProgress, getStageProgress } from './discoveryService';
import { getCollectedWishIds } from '../utils/wishesStorage';
import { getDiscoveredSecretIds } from '../utils/secretVaultStorage';
import { ROUTES } from '../constants';

export interface ForYouRecommendation {
  id: string;
  tag: string;
  title: string;
  description: string;
  ctaText: string;
  route: string;
  iconName: string;
  progressText?: string;
  percentage?: number;
  isCompleted?: boolean;
}

export function getForYouRecommendation(): ForYouRecommendation {
  const overall = getOverallProgress();
  const stages = getStageProgress();
  const collectedWishes = getCollectedWishIds();
  const discoveredSecrets = getDiscoveredSecretIds();

  // 1. First-time user state (0 discoveries)
  if (overall.totalDiscovered === 0) {
    return {
      id: 'for-you-beginning',
      tag: 'Something Waiting For You',
      title: 'Your little universe is waiting.',
      description:
        'Every quiet corner holds a small reflection or letter written just for you. Step inside whenever you feel ready.',
      ctaText: 'Begin Exploring',
      route: ROUTES.NOTES_365,
      iconName: 'Sparkles',
      progressText: `0 of ${overall.totalUniverse} discoveries`,
      percentage: 0,
    };
  }

  // 2. Completed state (100% discovered)
  if (overall.percentage === 100) {
    return {
      id: 'for-you-completed',
      tag: 'Full Circle',
      title: "You've found every little corner.",
      description:
        'Every star in this horizon has been brought into light. Perhaps it is time to wander through your favorite discoveries again.',
      ctaText: 'Revisit Discoveries',
      route: ROUTES.JOURNEY,
      iconName: 'CheckCircle2',
      progressText: `${overall.totalUniverse} / ${overall.totalUniverse} discovered`,
      percentage: 100,
      isCompleted: true,
    };
  }

  // Build candidate list for incomplete experiences
  const candidates: { recommendation: ForYouRecommendation; ratio: number; priority: number }[] = [];

  // Candidate A: Wishes (20 lanterns total)
  if (collectedWishes.length < 20) {
    const remaining = 20 - collectedWishes.length;
    const ratio = collectedWishes.length / 20;
    candidates.push({
      recommendation: {
        id: 'for-you-wishes',
        tag: 'Wishes',
        title: 'Some little wishes are still floating above.',
        description: `${remaining} wish ${
          remaining === 1 ? 'lantern is' : 'lanterns are'
        } still floating in the night sky, waiting to be caught.`,
        ctaText: 'Catch a Wish',
        route: ROUTES.WISHES,
        iconName: 'Sparkles',
        progressText: `${collectedWishes.length} / 20 wish lanterns`,
        percentage: Math.round(ratio * 100),
      },
      ratio,
      priority: collectedWishes.length > 0 ? ratio + 1 : 0.5,
    });
  }

  // Candidate B: Secret Vault (7 secrets total)
  if (discoveredSecrets.length < 7) {
    const remaining = 7 - discoveredSecrets.length;
    const ratio = discoveredSecrets.length / 7;
    candidates.push({
      recommendation: {
        id: 'for-you-secrets',
        tag: 'Secret Vault',
        title: 'Something hidden is still waiting.',
        description: `There ${
          remaining === 1 ? 'is still a quiet corner' : 'are still quiet corners'
        } in this universe you haven't found.`,
        ctaText: 'Keep Exploring',
        route: ROUTES.SECRET_VAULT,
        iconName: 'Lock',
        progressText: `${discoveredSecrets.length} / 7 secrets found`,
        percentage: Math.round(ratio * 100),
      },
      ratio,
      priority: discoveredSecrets.length > 0 ? ratio + 1 : 0.4,
    });
  }

  // Candidate C: 365 Notes
  const notesStage = stages.find((s) => s.key === 'notes365');
  if (notesStage && notesStage.discovered < notesStage.total) {
    const ratio = notesStage.discovered / notesStage.total;
    candidates.push({
      recommendation: {
        id: 'for-you-notes',
        tag: '365 Notes',
        title: 'A little piece of the story is waiting.',
        description: 'A daily reflection is ready to be opened whenever you need a gentle moment.',
        ctaText: 'Open a Note',
        route: ROUTES.NOTES_365,
        iconName: 'BookOpen',
        progressText: `${notesStage.discovered} / 365 notes read`,
        percentage: Math.round(ratio * 100),
      },
      ratio,
      priority: notesStage.discovered > 0 ? ratio + 1 : 0.6,
    });
  }

  // Candidate D: Moments
  const momentsStage = stages.find((s) => s.key === 'moments');
  if (momentsStage && momentsStage.discovered < momentsStage.total) {
    const ratio = momentsStage.discovered / momentsStage.total;
    candidates.push({
      recommendation: {
        id: 'for-you-moments',
        tag: 'Memories',
        title: 'Some memories are still waiting to be revisited.',
        description: 'Shared keepsakes and treasured photographs are quietly waiting in your gallery.',
        ctaText: 'Explore Moments',
        route: ROUTES.MOMENTS,
        iconName: 'Camera',
        progressText: `${momentsStage.discovered} / 10 memories visited`,
        percentage: Math.round(ratio * 100),
      },
      ratio,
      priority: momentsStage.discovered > 0 ? ratio + 1 : 0.3,
    });
  }

  // Candidate E: Adore
  const adoreStage = stages.find((s) => s.key === 'adore');
  if (adoreStage && adoreStage.discovered < adoreStage.total) {
    const ratio = adoreStage.discovered / adoreStage.total;
    candidates.push({
      recommendation: {
        id: 'for-you-adore',
        tag: 'Adore',
        title: 'There are still a few little things worth noticing.',
        description: 'Words of appreciation and cherished traits are tucked safely inside.',
        ctaText: 'Discover More',
        route: ROUTES.ADORE,
        iconName: 'Heart',
        progressText: `${adoreStage.discovered} / 20 traits explored`,
        percentage: Math.round(ratio * 100),
      },
      ratio,
      priority: adoreStage.discovered > 0 ? ratio + 1 : 0.2,
    });
  }

  // Candidate F: Open When
  const openWhenStage = stages.find((s) => s.key === 'openWhen');
  if (openWhenStage && openWhenStage.discovered < openWhenStage.total) {
    const ratio = openWhenStage.discovered / openWhenStage.total;
    candidates.push({
      recommendation: {
        id: 'for-you-open-when',
        tag: 'Open When',
        title: "There's a letter waiting for an unexpected moment.",
        description: 'Sealed envelopes are holding gentle words for whenever you feel a particular way.',
        ctaText: 'Open Letter',
        route: ROUTES.OPEN_WHEN,
        iconName: 'Mail',
        progressText: `${openWhenStage.discovered} / 12 envelopes opened`,
        percentage: Math.round(ratio * 100),
      },
      ratio,
      priority: openWhenStage.discovered > 0 ? ratio + 1 : 0.1,
    });
  }

  // Sort candidates by priority descending (highest ratio among started sections first)
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.priority - a.priority);
    return candidates[0].recommendation;
  }

  // Fallback to Journey continuation
  return {
    id: 'for-you-journey-fallback',
    tag: 'Your Journey',
    title: "Your story isn't quite finished here.",
    description: 'Step into your personal timeline to see how your universe is unfolding.',
    ctaText: 'Continue Your Journey',
    route: ROUTES.JOURNEY,
    iconName: 'Compass',
    progressText: `${overall.percentage}% overall explored`,
    percentage: overall.percentage,
  };
}
