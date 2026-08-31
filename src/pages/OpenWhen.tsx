import React, { useState, useEffect } from 'react';
import { Mail, Sparkles, HeartHandshake } from 'lucide-react';
import { Container, ScrollFocusReveal } from '../components';
import { OpenWhenCard, OpenWhenDetailModal } from '../components/openWhen';
import { sampleOpenWhenLetters } from '../data';
import { OpenWhenLetter } from '../types';
import { recordDiscovery } from '../services/discoveryService';
import { getManagedOpenWhenLetters } from '../services/contentService';
import { useTheme, useStarlitCatBridge } from '../hooks';
import { useSfx } from '../contexts/SfxContext';
import { cn } from '../utils';
import { userTrackingService } from '../services/userTrackingService';
import {
  VintageOrnamentalDivider,
  VintageCornerFlourish,
} from '../components/letterArchive';

export default function OpenWhen() {
  const { theme } = useTheme();
  const { emitLetter } = useStarlitCatBridge();
  const { playSfx } = useSfx();
  const isLetterArchive = theme === 'letter-archive';

  const [letters, setLetters] = useState<OpenWhenLetter[]>(sampleOpenWhenLetters);
  const [selectedLetter, setSelectedLetter] = useState<OpenWhenLetter | null>(null);

  useEffect(() => {
    emitLetter('opened');
  }, [emitLetter]);

  useEffect(() => {
    let isMounted = true;
    getManagedOpenWhenLetters().then((items) => {
      if (isMounted) setLetters(items);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedIndex = selectedLetter
    ? letters.findIndex((l) => l.id === selectedLetter.id)
    : -1;

  const handleSelectLetter = (l: OpenWhenLetter | null) => {
    if (l) {
      playSfx('openWhen');
      recordDiscovery('openWhen', l.id);
      userTrackingService.trackItemOpen({
        itemId: l.id,
        itemType: 'open_when_letter',
        title: l.title,
        itemNumber: l.order,
        section: 'open_when',
      });
      if (l.image) {
        userTrackingService.trackMediaView({
          mediaId: l.id,
          mediaType: 'image',
          parentItemId: l.id,
          title: l.title,
          section: 'open_when',
        });
      }
    }
    setSelectedLetter(l);
  };

  const handlePrevLetter = () => {
    if (selectedIndex > 0) {
      playSfx('pageTurn');
      const prev = letters[selectedIndex - 1];
      handleSelectLetter(prev);
    }
  };

  const handleNextLetter = () => {
    if (selectedIndex >= 0 && selectedIndex < letters.length - 1) {
      playSfx('pageTurn');
      const next = letters[selectedIndex + 1];
      handleSelectLetter(next);
    }
  };

  return (
    <Container maxWidth="lg" className="py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Page Header Introduction */}
      {isLetterArchive ? (
        <div className="relative rounded-[18px] p-6 sm:p-9 bg-[#FAF5EC] border border-[rgba(138,110,89,0.32)] shadow-[0_12px_32px_-8px_rgba(60,42,33,0.12)] space-y-4 text-center sm:text-left overflow-hidden">
          {/* Paper Texture Overlay */}
          <div
            className="absolute inset-0 rounded-[18px] opacity-35 mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: '120px 120px',
            }}
          />

          <VintageCornerFlourish position="top-left" size={26} className="absolute top-2.5 left-2.5 opacity-50 pointer-events-none" />
          <VintageCornerFlourish position="top-right" size={26} className="absolute top-2.5 right-2.5 opacity-50 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium bg-[#F3EBE0] text-[#7A2E3B] border border-[rgba(138,110,89,0.28)]">
                <Mail className="h-3.5 w-3.5 text-[#C2934D]" />
                <span>Preserved Envelopes</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif text-[#2C221E] font-normal tracking-tight">
                OPEN WHEN...
              </h1>

              <p className="letter-script text-base sm:text-lg text-[#7A2E3B] tracking-wide">
                for the moments when you need a little something from me
              </p>

              <p className="text-sm text-[#6B5547] font-serif leading-relaxed pt-1">
                Choose the letter you need right now. A sanctuary of words written for quiet moments, unexpected days, and gentle reassurance.
              </p>
            </div>

            <div className="flex items-center gap-2 self-center sm:self-start shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif font-medium bg-[#F3ECE0] text-[#8A5B20] border border-[#C5A35A]/40 shadow-2xs">
                <HeartHandshake className="h-3.5 w-3.5 text-[#B58A45]" />
                ♡ {letters.length} Sealed Letters
              </span>
            </div>
          </div>

          <div className="relative z-10 pt-2">
            <VintageOrnamentalDivider className="my-2 opacity-70" />
          </div>
        </div>
      ) : theme === 'midnight-journal' ? (
        <div className="relative rounded-[18px] p-6 sm:p-9 bg-[rgba(13,23,40,0.85)] border border-[rgba(201,155,88,0.28)] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.55)] space-y-4 text-center sm:text-left overflow-hidden backdrop-blur-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium bg-[rgba(201,155,88,0.12)] text-[#E2BD78] border border-[rgba(201,155,88,0.25)]">
                <Mail className="h-3.5 w-3.5 text-[#E2BD78]" />
                <span>Midnight Envelopes</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#F2E4CF] tracking-tight">
                OPEN WHEN...
              </h1>

              <p className="font-serif italic text-base sm:text-lg text-[#E2BD78] tracking-wide">
                for the moments when you need a little something from me
              </p>

              <p className="text-sm text-[#C2AF99] font-serif leading-relaxed pt-1">
                Choose the letter you need right now. A sanctuary of words written for quiet moments, unexpected days, and gentle reassurance.
              </p>
            </div>

            <div className="flex items-center gap-2 self-center sm:self-start shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif font-medium bg-[rgba(201,155,88,0.14)] text-[#E2BD78] border border-[rgba(201,155,88,0.3)] shadow-2xs">
                <HeartHandshake className="h-3.5 w-3.5 text-[#E2BD78]" />
                ✦ {letters.length} Sealed Letters
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 opacity-50">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[rgba(201,155,88,0.35)] to-transparent" />
            <span className="text-[10px] text-[#E2BD78]">✦</span>
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[rgba(201,155,88,0.35)] to-transparent" />
          </div>
        </div>
      ) : (
        <div className="relative rounded-[18px] p-6 sm:p-9 bg-[rgba(16,30,20,0.85)] border border-[rgba(216,184,106,0.25)] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)] space-y-4 text-center sm:text-left overflow-hidden backdrop-blur-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium bg-[rgba(79,107,72,0.25)] text-[#D8B86A] border border-[rgba(216,184,106,0.3)]">
                <Mail className="h-3.5 w-3.5 text-[#D8B86A]" />
                <span>Storybook Envelopes</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#F7F1DF] tracking-tight">
                OPEN WHEN...
              </h1>

              <p className="font-serif italic text-base sm:text-lg text-[#D8B86A] tracking-wide">
                for the moments when you need a little something from me
              </p>

              <p className="text-sm text-[#B8C0AE] font-serif leading-relaxed pt-1">
                Choose the letter you need right now. A sanctuary of words written for quiet moments, unexpected days, and gentle reassurance.
              </p>
            </div>

            <div className="flex items-center gap-2 self-center sm:self-start shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif font-medium bg-[rgba(79,107,72,0.28)] text-[#D8B86A] border border-[rgba(216,184,106,0.35)] shadow-2xs">
                <HeartHandshake className="h-3.5 w-3.5 text-[#D8B86A]" />
                ✿ {letters.length} Sealed Letters
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 opacity-50">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[rgba(216,184,106,0.35)] to-transparent" />
            <span className="text-[10px] text-[#D8B86A]">✿</span>
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[rgba(216,184,106,0.35)] to-transparent" />
          </div>
        </div>
      )}

      {/* Grid Collection of Open When Letters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {letters.map((letter) => (
          <ScrollFocusReveal key={letter.id} className="h-full">
            <OpenWhenCard
              letter={letter}
              onSelect={handleSelectLetter}
            />
          </ScrollFocusReveal>
        ))}
      </div>

      {/* Detail Reading Modal */}
      <OpenWhenDetailModal
        letter={selectedLetter}
        isOpen={!!selectedLetter}
        onClose={() => setSelectedLetter(null)}
        onPrevLetter={handlePrevLetter}
        onNextLetter={handleNextLetter}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex >= 0 && selectedIndex < letters.length - 1}
      />

      {/* Footer Notice */}
      <div
        className={cn(
          "pt-4 text-center border-t",
          isLetterArchive
            ? "border-[rgba(138,110,89,0.25)]"
            : "border-[var(--color-border-light)]"
        )}
      >
        <p
          className={cn(
            "text-xs italic font-serif flex items-center justify-center gap-1.5",
            isLetterArchive
              ? "text-[#8A6E59]"
              : "text-[var(--color-muted)]"
          )}
        >
          <Sparkles
            className={cn(
              "h-3.5 w-3.5",
              isLetterArchive ? "text-[#C2934D]" : "text-[var(--color-primary)]"
            )}
          />
          Starlit Letters — Open When Archive
        </p>
      </div>
    </Container>
  );
}
