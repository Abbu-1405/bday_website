import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Award } from 'lucide-react';
import {
  Container,
  Button,
  Divider,
  Logo,
  ContinueJourney,
  QuickAccess,
  JourneyProgress,
  DailyQuote,
  RecentActivity,
  Footer,
  HiddenDiscoveryElement,
  Surface,
  Badge,
  ForYou,
} from '../components';
import { BotanicalCorner, MagicalSwirlGraphic } from '../components/whimsical/WhimsicalDecorations';
import { MidnightCorner, MidnightGoldDivider } from '../components/midnight/MidnightDecorations';
import { MidnightSidebarPanels } from '../components/midnight/MidnightSidebarPanels';
import {
  VintageCornerFlourish,
  VintageOrnamentalDivider,
  VintagePostmark,
  VintageBotanicalSprig,
} from '../components/letterArchive/LetterArchiveDecorations';
import { ROUTES } from '../constants';
import { useAuth, useTheme } from '../hooks';
import { useAudio } from '../contexts';
import { getOverallProgress, getCurrentExploration } from '../services/discoveryService';
import { getStreakData } from '../services/streakService';
import { evaluateBadges } from '../services/badgeService';
import { cn } from '../utils';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { playMagicalClick, playShimmer } = useAudio();
  const isWhimsical = theme === 'whimsical-scrapbook';
  const isMidnight = theme === 'midnight-journal';
  const isLetterArchive = theme === 'letter-archive';

  const overall = getOverallProgress();
  const streak = getStreakData();
  const { badges } = evaluateBadges();
  const currentExploration = getCurrentExploration();

  const unlockedBadges = badges.filter((b) => b.unlocked).slice(0, 3);

  const formatDisplayName = (name: string) => {
    if (!name) return '';
    return name
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const rawName = currentUser?.displayName
    ? currentUser.displayName.trim().split(' ')[0]
    : currentUser?.email
    ? currentUser.email.split('@')[0]
    : '';

  const firstName = formatDisplayName(rawName);

  const isFirstTimeUser = currentUser && overall.totalDiscovered === 0;

  // Hero greeting logic based on auth & progress state
  let heroTitle = 'Welcome back.';
  let heroSubtitle = 'This little universe has been quietly waiting for you.';

  if (currentUser) {
    if (isFirstTimeUser) {
      heroTitle = firstName ? `Your universe is waiting, ${firstName}.` : 'Your universe is waiting.';
      heroSubtitle = 'Stepping into this quiet space for the first time. Every little discovery is waiting for you.';
    } else {
      heroTitle = firstName ? `Welcome back, ${firstName}.` : 'Welcome back to your little universe.';
      heroSubtitle = 'Your little universe is still here, holding your discoveries.';
    }
  }

  const primaryCtaText = isFirstTimeUser ? 'Begin Exploring' : 'Continue Journey';
  const primaryCtaRoute = currentExploration?.route || ROUTES.NOTES_365;

  const handleCtaClick = (route: string) => {
    playMagicalClick();
    navigate(route);
  };

  const handleQuickAccessClick = (id: string) => {
    playMagicalClick();
    switch (id) {
      case 'adore':
        navigate(ROUTES.ADORE);
        break;
      case 'moments':
        navigate(ROUTES.MOMENTS);
        break;
      case '365-notes':
        navigate(ROUTES.NOTES_365);
        break;
      case 'open-when':
        navigate(ROUTES.OPEN_WHEN);
        break;
      case 'wishes':
        navigate(ROUTES.WISHES);
        break;
      case 'what-am-i-to-you':
        navigate(ROUTES.WHAT_AM_I_TO_YOU);
        break;
      case 'secret-vault':
        navigate(ROUTES.SECRET_VAULT);
        break;
      default:
        break;
    }
  };

  return (
    <Container size="lg" className={cn("py-8 sm:py-12 relative", isWhimsical ? "space-y-12 sm:space-y-16" : "space-y-10")}>
      {/* 1. Hero Section - Floating Enchanted / Midnight Journal / Letter Archive Page */}
      <Surface
        variant="elevated"
        className={cn(
          "relative text-center mx-auto space-y-5 flex flex-col items-center justify-center transition-all",
          isWhimsical && "max-w-xl py-8 sm:py-10 px-6 sm:px-10 rounded-[22px] bg-[rgba(8,20,11,0.70)] border border-[rgba(240,230,190,0.14)] shadow-[0_10px_32px_rgba(0,0,0,0.35)]",
          isMidnight && "max-w-2xl py-9 sm:py-12 px-6 sm:px-12 rounded-[22px] bg-[rgba(5,10,22,0.80)] border border-[rgba(201,155,88,0.25)] shadow-[0_12px_35px_rgba(0,0,0,0.35)]",
          isLetterArchive && "max-w-2xl py-10 sm:py-12 px-6 sm:px-12 rounded-[20px] bg-[#FAF5EC] border border-[rgba(138,110,89,0.25)] shadow-[0_8px_28px_-6px_rgba(60,42,33,0.09)]",
          !isWhimsical && !isMidnight && !isLetterArchive && "max-w-2xl py-10 sm:py-14 px-6 sm:px-12 rounded-3xl bg-[var(--color-card)] border border-[var(--color-border-light)] shadow-lg"
        )}
      >
        {/* Letter Archive Vintage Botanical & Corner Flourishes */}
        {isLetterArchive && (
          <>
            <VintageCornerFlourish
              position="top-left"
              size={32}
              className="absolute top-2 left-2 opacity-75 pointer-events-none"
            />
            <VintageCornerFlourish
              position="top-right"
              size={32}
              className="absolute top-2 right-2 opacity-75 pointer-events-none"
            />
            <VintageCornerFlourish
              position="bottom-left"
              size={24}
              className="absolute bottom-2 left-2 opacity-45 pointer-events-none"
            />
            <VintageCornerFlourish
              position="bottom-right"
              size={24}
              className="absolute bottom-2 right-2 opacity-45 pointer-events-none"
            />
            <div className="hidden sm:block absolute top-4 right-6 pointer-events-none">
              <VintagePostmark size={58} className="opacity-45" />
            </div>
          </>
        )}

        {/* Whimsical Botanical Floral Corner Decorations */}
        {isWhimsical && (
          <>
            <BotanicalCorner
              position="top-left"
              className="absolute top-2 left-2 w-12 h-12 sm:w-14 sm:h-14 opacity-70 pointer-events-none"
            />
            <BotanicalCorner
              position="top-right"
              className="absolute top-2 right-2 w-12 h-12 sm:w-14 sm:h-14 opacity-70 pointer-events-none"
            />
          </>
        )}

        {/* Midnight Antique Gold Corner Ornaments */}
        {isMidnight && (
          <>
            <MidnightCorner
              position="top-left"
              size={36}
              className="absolute top-2 left-2 opacity-75 pointer-events-none"
            />
            <MidnightCorner
              position="top-right"
              size={36}
              className="absolute top-2 right-2 opacity-75 pointer-events-none"
            />
            <MidnightCorner
              position="bottom-left"
              size={28}
              className="absolute bottom-2 left-2 opacity-40 pointer-events-none"
            />
            <MidnightCorner
              position="bottom-right"
              size={28}
              className="absolute bottom-2 right-2 opacity-40 pointer-events-none"
            />
          </>
        )}

        {/* Logo Component */}
        <Logo size="md" showText={false} className="mx-auto" />

        <div className="space-y-2.5 max-w-md">
          {isWhimsical && (
            <span className="whimsical-subtitle text-xs sm:text-sm text-[var(--color-accent-rose)] inline-block select-none -mb-0.5">
              a little universe made just for you
            </span>
          )}

          {isMidnight && (
            <span className="midnight-subtitle text-xs sm:text-sm text-[#E2BD78] inline-block select-none -mb-0.5">
              written for quiet hours beneath the starlight
            </span>
          )}

          {isLetterArchive && (
            <span className="letter-script text-sm sm:text-base text-[#7A2E3B] inline-block select-none -mb-0.5 tracking-wide">
              a collection of preserved letters & quiet memories
            </span>
          )}

          <h1 className={cn(
            "font-serif font-bold text-[var(--color-text)] tracking-tight leading-snug",
            isWhimsical ? "text-2xl sm:text-3xl" : "text-h1",
            isLetterArchive && "text-[#3B2A20] text-2xl sm:text-3xl font-normal"
          )}>
            {heroTitle}
          </h1>

          <p className={cn(
            "text-xs sm:text-sm text-[var(--color-text-secondary)] italic font-serif leading-relaxed flex items-center justify-center gap-1.5 flex-wrap",
            isLetterArchive && "text-[#5C4A42]"
          )}>
            <span>{heroSubtitle}</span>
            <HiddenDiscoveryElement
              secretId="secret-04"
              label="Examine subtle starlit sparkle"
              className="inline-flex text-[var(--color-accent)] shrink-0"
            />
          </p>

          {/* Statistics Presentation */}
          {currentUser && streak.currentStreak > 0 && (
            <div className="pt-2 flex justify-center">
              {isLetterArchive ? (
                <div className="flex items-center justify-center gap-2 sm:gap-3 text-[11px] font-serif text-[#5C4A42] tracking-wider uppercase flex-wrap">
                  <span className="font-semibold text-[#7A2E3B]">{streak.currentStreak} {streak.currentStreak === 1 ? 'DAY' : 'DAYS'} ACTIVE</span>
                  <span className="text-[#C2934D] opacity-70">✦</span>
                  <span className="font-semibold text-[#5C4A42]">{overall.totalDiscovered} DISCOVERIES</span>
                  <span className="text-[#C2934D] opacity-70">✦</span>
                  <span className="text-[#8C776C]">STARLIT ARCHIVE</span>
                </div>
              ) : (
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif shadow-xs",
                  isMidnight
                    ? "bg-[rgba(16,27,45,0.85)] text-[#C2AF99] border border-[rgba(201,155,88,0.25)]"
                    : "bg-[var(--color-surface)]/80 text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                )}>
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                  <span>{streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'} of little discoveries</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={() => handleCtaClick(primaryCtaRoute)}
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            className="w-full sm:w-auto min-w-[160px] font-serif shadow-sm"
          >
            {primaryCtaText}
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => handleCtaClick(ROUTES.MOMENTS)}
            className="w-full sm:w-auto px-4 font-serif"
          >
            Explore Memories
          </Button>
        </div>
      </Surface>

      {isMidnight ? (
        <MidnightGoldDivider />
      ) : isLetterArchive ? (
        <VintageOrnamentalDivider />
      ) : (
        <Divider />
      )}

      {/* MIDNIGHT JOURNAL STRUCTURED MULTI-PANEL DASHBOARD */}
      {isMidnight ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Column (For You, Journey, Progress, Badges, Quick Access, Quotes, Activity) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Personalized For You Section */}
            <ForYou />

            {/* Grid for Continue Journey & Progress */}
            <div className="grid grid-cols-1 gap-6 items-stretch">
              <ContinueJourney
                onResume={() => handleCtaClick(primaryCtaRoute)}
                onStartFromHome={() => handleCtaClick(ROUTES.JOURNEY)}
              />

              <JourneyProgress />
            </div>

            {/* Unlocked Badges */}
            {unlockedBadges.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-h3 font-serif text-[var(--color-text)] flex items-center gap-2">
                    <Award className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                    Your Discoveries
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      playShimmer();
                      navigate(ROUTES.JOURNEY);
                    }}
                    className="text-xs text-[var(--color-primary)] hover:underline font-serif cursor-pointer"
                  >
                    View All Badges →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {unlockedBadges.map((b) => (
                    <Surface
                      key={b.id}
                      variant="elevated"
                      padding="md"
                      className="border border-[var(--color-border-light)] flex items-center gap-3"
                    >
                      <div className="p-2 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-primary)] shrink-0">
                        <Award className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-serif font-bold text-[var(--color-text)] truncate">
                          {b.title}
                        </h3>
                        <p className="text-[11px] font-serif text-[var(--color-text-secondary)] truncate">
                          {b.description}
                        </p>
                      </div>
                    </Surface>
                  ))}
                </div>
              </section>
            )}

            {/* Quick Access Section */}
            <QuickAccess onItemClick={handleQuickAccessClick} />

            {/* Daily Quote Section */}
            <DailyQuote />

            {/* Recent Activity Section */}
            <RecentActivity
              onItemClick={(item) => {
                playMagicalClick();
                if (item.sectionName === '365 Notes') navigate(ROUTES.NOTES_365);
                else if (item.sectionName === 'Moments') navigate(ROUTES.MOMENTS);
                else if (item.sectionName === 'Adore') navigate(ROUTES.ADORE);
                else if (item.sectionName === 'Open When') navigate(ROUTES.OPEN_WHEN);
                else if (item.sectionName === 'Wishes') navigate(ROUTES.WISHES);
                else if (item.sectionName === 'Secret Vault') navigate(ROUTES.SECRET_VAULT);
                else navigate(ROUTES.JOURNEY);
              }}
            />
          </div>

          {/* Right Column / Dedicated Side Panels (Wishes, Open When, Secret Vault) */}
          <div className="lg:col-span-4 space-y-6">
            <MidnightSidebarPanels />
          </div>
        </div>
      ) : (
        /* STANDARD & WHIMSICAL LINEAR/FOCUSED DASHBOARD */
        <>
          {/* Personalized For You Section */}
          <ForYou />

          {/* Grid Layout for Continue Journey & Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* 2. Continue Journey Section */}
            <ContinueJourney
              className="lg:col-span-7 flex flex-col justify-between"
              onResume={() => handleCtaClick(primaryCtaRoute)}
              onStartFromHome={() => handleCtaClick(ROUTES.JOURNEY)}
            />

            {/* 3. Journey Progress Section */}
            <JourneyProgress className="lg:col-span-5 flex flex-col justify-between" />
          </div>

          {/* 4. Unlocked Badges Summary */}
          {unlockedBadges.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-h3 font-serif text-[var(--color-text)] flex items-center gap-2">
                  <Award className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                  Your Discoveries
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    playShimmer();
                    navigate(ROUTES.JOURNEY);
                  }}
                  className="text-xs text-[var(--color-primary)] hover:underline font-serif cursor-pointer"
                >
                  View All Badges →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {unlockedBadges.map((b) => (
                  <Surface
                    key={b.id}
                    variant="elevated"
                    padding="md"
                    className="border border-[var(--color-border-light)] flex items-center gap-3"
                  >
                    <div className="p-2 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-primary)] shrink-0">
                      <Award className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-serif font-bold text-[var(--color-text)] truncate">
                        {b.title}
                      </h3>
                      <p className="text-[11px] font-serif text-[var(--color-text-secondary)] truncate">
                        {b.description}
                      </p>
                    </div>
                  </Surface>
                ))}
              </div>
            </section>
          )}

          {/* Quick Access Section */}
          <QuickAccess onItemClick={handleQuickAccessClick} />

          {/* 5. Daily Quote Section */}
          <DailyQuote />

          {/* 6. Recent Activity Section */}
          <RecentActivity
            onItemClick={(item) => {
              playMagicalClick();
              if (item.sectionName === '365 Notes') navigate(ROUTES.NOTES_365);
              else if (item.sectionName === 'Moments') navigate(ROUTES.MOMENTS);
              else if (item.sectionName === 'Adore') navigate(ROUTES.ADORE);
              else if (item.sectionName === 'Open When') navigate(ROUTES.OPEN_WHEN);
              else if (item.sectionName === 'Wishes') navigate(ROUTES.WISHES);
              else if (item.sectionName === 'Secret Vault') navigate(ROUTES.SECRET_VAULT);
              else navigate(ROUTES.JOURNEY);
            }}
          />
        </>
      )}

      {/* Footer Section */}
      <Footer />
    </Container>
  );
}


