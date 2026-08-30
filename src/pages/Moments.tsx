import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Container, ScrollFocusReveal, EmptyState } from '../components';
import { VintageEmptyState } from '../components/letterArchive/VintageEmptyState';
import {
  FeaturedMomentCard,
  MomentCard,
  MomentDetailModal,
} from '../components/moments';
import { sampleMoments } from '../data';
import { Moment } from '../types';
import { recordDiscovery } from '../services/discoveryService';
import { getManagedMoments } from '../services/contentService';
import { useTheme, useStarlitCatBridge } from '../hooks';
import { useSfx } from '../contexts/SfxContext';
import { cn } from '../utils';

export default function Moments() {
  const { theme } = useTheme();
  const { emitMoment } = useStarlitCatBridge();
  const { playSfx } = useSfx();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

  const [moments, setMoments] = useState<Moment[]>(sampleMoments);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);

  useEffect(() => {
    emitMoment('opened');
  }, [emitMoment]);

  useEffect(() => {
    let isMounted = true;
    getManagedMoments().then((items) => {
      if (isMounted) {
        const sorted = [...items].sort((a, b) => a.order - b.order);
        setMoments(sorted);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Ensure explicit ranking order (1-20)
  const orderedMoments = [...moments].sort((a, b) => a.order - b.order);

  // Identify featured moment or default to first
  const featuredMoment =
    orderedMoments.find((m) => m.featured) || orderedMoments[0];
  const supportingMoments = orderedMoments.filter(
    (m) => m.id !== (featuredMoment ? featuredMoment.id : '')
  );

  const selectedIndex = selectedMoment
    ? orderedMoments.findIndex((m) => m.id === selectedMoment.id)
    : -1;

  const handlePrevMoment = () => {
    if (selectedIndex > 0) {
      playSfx('pageTurn');
      setSelectedMoment(orderedMoments[selectedIndex - 1]);
    }
  };

  const handleNextMoment = () => {
    if (selectedIndex >= 0 && selectedIndex < orderedMoments.length - 1) {
      playSfx('pageTurn');
      setSelectedMoment(orderedMoments[selectedIndex + 1]);
    }
  };

  return (
    <Container maxWidth="lg" className="py-6 sm:py-10 space-y-7 sm:space-y-9">
      {/* Themed Page Header */}
      <div
        className={cn(
          'relative overflow-hidden rounded-[20px] p-6 sm:p-8 select-none transition-all duration-300',
          isLetterArchive
            ? 'bg-[#FAF5EC] border border-[rgba(138,110,89,0.38)] shadow-[0_10px_30px_-6px_rgba(60,42,33,0.14)]'
            : isScrapbook
            ? 'bg-[linear-gradient(145deg,rgba(16,30,20,0.92)_0%,rgba(10,22,13,0.96)_100%)] border border-[rgba(216,184,106,0.3)] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.55),0_0_24px_rgba(79,107,72,0.2)]'
            : 'bg-[linear-gradient(145deg,rgba(13,23,40,0.92)_0%,rgba(7,14,26,0.96)_100%)] border border-[rgba(201,155,88,0.32)] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.65),0_0_24px_rgba(201,155,88,0.18)]'
        )}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
          <div className="space-y-2 max-w-2xl">
            {/* Header Badge */}
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium shadow-xs',
                isLetterArchive
                  ? 'bg-[#F2E8DC] text-[#7A2E3B] border border-[rgba(138,110,89,0.35)]'
                  : isScrapbook
                  ? 'bg-[rgba(79,107,72,0.25)] text-[#D8B86A] border border-[rgba(216,184,106,0.3)]'
                  : 'bg-[rgba(201,155,88,0.14)] text-[#E2BD78] border border-[rgba(201,155,88,0.3)]'
              )}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Memory Archive</span>
            </div>

            {/* Title */}
            <h1
              className={cn(
                'text-3xl sm:text-4xl lg:text-[40px] font-serif font-normal tracking-tight leading-tight',
                isLetterArchive
                  ? 'text-[#3B2A20]'
                  : isScrapbook
                  ? 'text-[#F7F1DF]'
                  : 'text-[#F2E4CF]'
              )}
            >
              Moments
            </h1>

            {/* Subtitle */}
            <p
              className={cn(
                'text-sm sm:text-base font-serif leading-relaxed',
                isLetterArchive
                  ? 'text-[#5C4A42]'
                  : isScrapbook
                  ? 'text-[#B8C0AE]'
                  : 'text-[#C2AF99]'
              )}
            >
              A visual gallery of quiet places, soft twilight hours, and treasured memories preserved in time.
            </p>
          </div>

          {/* Counter Badge */}
          <div className="flex items-center gap-2 self-center sm:self-start shrink-0">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif font-medium border shadow-xs',
                isLetterArchive
                  ? 'bg-[#FAF5EC] text-[#7A2E3B] border-[rgba(138,110,89,0.4)]'
                  : isScrapbook
                  ? 'bg-[rgba(16,30,20,0.8)] text-[#D8B86A] border-[rgba(216,184,106,0.35)]'
                  : 'bg-[rgba(7,14,26,0.8)] text-[#E2BD78] border-[rgba(201,155,88,0.35)]'
              )}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>{moments.length} Memories</span>
            </span>
          </div>
        </div>
      </div>

      {/* Moments Content or Empty State */}
      {orderedMoments.length === 0 ? (
        isLetterArchive ? (
          <VintageEmptyState
            title="No preserved moments found"
            message="No memory photographs or quiet reflections are currently archived in this season."
          />
        ) : (
          <EmptyState
            icon={<Camera className="h-6 w-6" />}
            title="No preserved moments found"
            description="No memory photographs or quiet reflections are currently archived in this season."
          />
        )
      ) : (
        <>
          {/* Featured Moment Highlight */}
          {featuredMoment && (
            <div className="space-y-3">
              <div
                className={cn(
                  'flex items-center gap-2 text-xs font-serif font-medium px-1',
                  isLetterArchive
                    ? 'text-[#7A6253]'
                    : isScrapbook
                    ? 'text-[#7F8B78]'
                    : 'text-[#817568]'
                )}
              >
                <Sparkles
                  className={cn(
                    'h-3.5 w-3.5',
                    isLetterArchive
                      ? 'text-[#7A2E3B]'
                      : isScrapbook
                      ? 'text-[#D8B86A]'
                      : 'text-[#E2BD78]'
                  )}
                />
                <span>Featured Reflection</span>
              </div>
              <ScrollFocusReveal className="w-full">
                <FeaturedMomentCard
                  moment={featuredMoment}
                  onSelect={(m) => {
                    if (m) {
                      playSfx('photoOpen');
                      recordDiscovery('moments', m.id);
                    }
                    setSelectedMoment(m);
                  }}
                />
              </ScrollFocusReveal>
            </div>
          )}

          {/* Memory Gallery Grid */}
          <div className="space-y-4">
            <div
              className={cn(
                'flex items-center justify-between text-xs font-serif font-medium px-1',
                isLetterArchive
                  ? 'text-[#7A6253]'
                  : isScrapbook
                  ? 'text-[#7F8B78]'
                  : 'text-[#817568]'
              )}
            >
              <span>Curated Memory Collection</span>
              <span>{supportingMoments.length} items</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {supportingMoments.map((moment, index) => {
                // Assign varied aspect ratio styles for an editorial gallery look
                const aspectRatio =
                  index % 3 === 0
                    ? 'portrait'
                    : index % 3 === 1
                    ? 'square'
                    : 'video';

                return (
                  <ScrollFocusReveal key={moment.id} className="h-full">
                    <MomentCard
                      moment={moment}
                      aspectRatio={aspectRatio}
                      onSelect={(m) => {
                        if (m) {
                          playSfx('photoOpen');
                          recordDiscovery('moments', m.id);
                        }
                        setSelectedMoment(m);
                      }}
                    />
                  </ScrollFocusReveal>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      <MomentDetailModal
        moment={selectedMoment}
        isOpen={!!selectedMoment}
        onClose={() => setSelectedMoment(null)}
        onPrevMoment={handlePrevMoment}
        onNextMoment={handleNextMoment}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex >= 0 && selectedIndex < moments.length - 1}
      />

      {/* Footer Note */}
      <div
        className={cn(
          'pt-4 text-center border-t',
          isLetterArchive
            ? 'border-[rgba(138,110,89,0.22)] text-[#8A6E59]'
            : isScrapbook
            ? 'border-[rgba(216,184,106,0.18)] text-[#7F8B78]'
            : 'border-[rgba(201,155,88,0.18)] text-[#817568]'
        )}
      >
        <p className="text-xs italic font-serif flex items-center justify-center gap-1.5">
          <Sparkles
            className={cn(
              'h-3.5 w-3.5',
              isLetterArchive
                ? 'text-[#7A2E3B]'
                : isScrapbook
                ? 'text-[#D8B86A]'
                : 'text-[#E2BD78]'
            )}
          />
          <span>Starlit Letters — Memory Gallery Archive</span>
        </p>
      </div>
    </Container>
  );
}

