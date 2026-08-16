import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Container, Surface, Badge } from '../components';
import {
  FeaturedMomentCard,
  MomentCard,
  MomentDetailModal,
} from '../components/moments';
import { sampleMoments } from '../data';
import { Moment } from '../types';
import { recordDiscovery } from '../services/discoveryService';
import { getManagedMoments } from '../services/contentService';

export default function Moments() {
  const [moments, setMoments] = useState<Moment[]>(sampleMoments);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);

  useEffect(() => {
    let isMounted = true;
    getManagedMoments().then((items) => {
      if (isMounted) setMoments(items);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Identify featured moment or default to first
  const featuredMoment =
    moments.find((m) => m.featured) || moments[0];
  const supportingMoments = moments.filter(
    (m) => m.id !== (featuredMoment ? featuredMoment.id : '')
  );

  const selectedIndex = selectedMoment
    ? moments.findIndex((m) => m.id === selectedMoment.id)
    : -1;

  const handlePrevMoment = () => {
    if (selectedIndex > 0) {
      setSelectedMoment(moments[selectedIndex - 1]);
    }
  };

  const handleNextMoment = () => {
    if (selectedIndex >= 0 && selectedIndex < moments.length - 1) {
      setSelectedMoment(moments[selectedIndex + 1]);
    }
  };

  return (
    <Container maxWidth="lg" className="py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Page Header */}
      <Surface
        variant="elevated"
        padding="lg"
        className="relative overflow-hidden border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4 text-center sm:text-left"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium bg-[var(--color-surface-secondary)] text-[var(--color-primary)] border border-[var(--color-border-light)]">
              <Camera className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              <span>Memory Archive</span>
            </div>

            <h1 className="text-h1 font-serif font-bold text-[var(--color-text)] tracking-tight">
              Moments
            </h1>

            <p className="text-body text-[var(--color-text-secondary)] font-serif leading-relaxed">
              A visual gallery of quiet places, soft twilight hours, and treasured memories preserved in time.
            </p>
          </div>

          <div className="flex items-center gap-2 self-center sm:self-start shrink-0">
            <Badge variant="primary" size="md" className="font-serif">
              <ImageIcon className="h-3.5 w-3.5 mr-1" />
              {moments.length} Memories
            </Badge>
          </div>
        </div>
      </Surface>

      {/* Featured Moment Highlight */}
      {featuredMoment && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-serif font-medium text-[var(--color-muted)] px-1">
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            <span>Featured Reflection</span>
          </div>
          <FeaturedMomentCard
            moment={featuredMoment}
            onSelect={(m) => {
              setSelectedMoment(m);
              if (m) recordDiscovery('moments', m.id);
            }}
          />
        </div>
      )}

      {/* Memory Gallery Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-serif font-medium text-[var(--color-muted)] px-1">
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
              <MomentCard
                key={moment.id}
                moment={moment}
                aspectRatio={aspectRatio}
                onSelect={(m) => {
                  setSelectedMoment(m);
                  if (m) recordDiscovery('moments', m.id);
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <MomentDetailModal
        moment={selectedMoment}
        isOpen={!!selectedMoment}
        onClose={() => setSelectedMoment(null)}
        onPrevMoment={handlePrevMoment}
        onNextMoment={handleNextMoment}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex >= 0 && selectedIndex < sampleMoments.length - 1}
      />

      {/* Footer Note */}
      <div className="pt-4 text-center border-t border-[var(--color-border-light)]">
        <p className="text-xs text-[var(--color-muted)] italic font-serif flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          Starlit Letters — Memory Gallery Archive
        </p>
      </div>
    </Container>
  );
}
