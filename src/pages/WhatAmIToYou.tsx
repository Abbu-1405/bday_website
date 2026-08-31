import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Feather,
  Send,
  Sparkles,
  LogIn,
  Loader2,
  BookOpen,
  AlertCircle,
  Pen,
} from 'lucide-react';
import { Container, DoodleCanvasModal, DoodlesDrawer } from '../components';
import { useAuth } from '../hooks';
import { ROUTES } from '../constants';
import { submitFeeling, submitLetter } from '../services';
import { DoodleItem } from '../types/doodle';
import { KeepsakeReveal } from '../components/whatAmIToYou';
import { userTrackingService } from '../services/userTrackingService';
import '../components/whatAmIToYou/whatAmIToYou.css';

export default function WhatAmIToYou() {
  const navigate = useNavigate();
  const { currentUser, loginWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Doodle State
  const [isDoodleModalOpen, setIsDoodleModalOpen] = useState(false);
  const [isDoodlesDrawerOpen, setIsDoodlesDrawerOpen] = useState(false);
  const [editingDoodle, setEditingDoodle] = useState<DoodleItem | null>(null);

  // Mode selection: 'feeling' (quiet thought) vs 'letter' (written letter)
  const [activeMode, setActiveMode] = useState<'feeling' | 'letter'>('feeling');

  React.useEffect(() => {
    userTrackingService.trackFilter({
      section: 'what_am_i_to_you',
      filterType: 'mode',
      selectedValue: activeMode,
    });
  }, [activeMode]);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.message && !err.message.includes('cancelled')) {
        setAuthError(err.message);
        userTrackingService.trackError({
          category: 'auth',
          message: err.message,
          section: 'what_am_i_to_you',
          operation: 'loginWithGoogle',
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Feeling state
  const [feelingText, setFeelingText] = useState('');
  const [isSubmittingFeeling, setIsSubmittingFeeling] = useState(false);
  const [feelingSuccess, setFeelingSuccess] = useState<string | null>(null);
  const [feelingError, setFeelingError] = useState<string | null>(null);

  // Letter state
  const [letterTitle, setLetterTitle] = useState('');
  const [letterBody, setLetterBody] = useState('');
  const [isSubmittingLetter, setIsSubmittingLetter] = useState(false);
  const [letterSuccess, setLetterSuccess] = useState<string | null>(null);
  const [letterError, setLetterError] = useState<string | null>(null);

  const handleSendFeeling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feelingText.trim() || isSubmittingFeeling || !currentUser) return;

    setIsSubmittingFeeling(true);
    setFeelingError(null);
    setFeelingSuccess(null);

    try {
      await submitFeeling(currentUser.uid, feelingText);
      setFeelingSuccess('Your words are held safely in the quiet sanctuary of your reflections.');
      setFeelingText('');
    } catch (err: any) {
      console.error('Failed to submit feeling:', err);
      setFeelingError('Unable to send. Please check your connection and try again.');
      userTrackingService.trackError({
        category: 'user_submission',
        message: err.message || 'Failed to submit feeling',
        section: 'what_am_i_to_you',
        operation: 'submitFeeling',
      });
    } finally {
      setIsSubmittingFeeling(false);
    }
  };

  const handleSendLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterBody.trim() || isSubmittingLetter || !currentUser) return;

    setIsSubmittingLetter(true);
    setLetterError(null);
    setLetterSuccess(null);

    try {
      await submitLetter(currentUser.uid, letterTitle, letterBody);
      setLetterSuccess('Your letter has been inscribed and safely preserved in your private reflections.');
      setLetterTitle('');
      setLetterBody('');
    } catch (err: any) {
      console.error('Failed to submit letter:', err);
      setLetterError('Unable to send letter. Please check your connection and try again.');
      userTrackingService.trackError({
        category: 'user_submission',
        message: err.message || 'Failed to submit letter',
        section: 'what_am_i_to_you',
        operation: 'submitLetter',
      });
    } finally {
      setIsSubmittingLetter(false);
    }
  };

  return (
    <div className="what-am-i-bg w-full min-h-screen py-4 sm:py-8 transition-colors duration-300">
      <Container size="md" className="space-y-6 sm:space-y-8 min-h-[calc(100vh-140px)] flex flex-col justify-between relative overflow-x-hidden">
        
        {/* 1. Atmospheric Chapter Header Card (#172033 Midnight Blue) */}
        <header
          className="relative w-full rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center space-y-3 shadow-2xl border backdrop-blur-md"
          style={{
            backgroundColor: '#172033',
            borderColor: 'rgba(197, 154, 82, 0.25)',
            boxShadow: '0 20px 50px -10px rgba(13, 20, 34, 0.8), 0 0 30px rgba(197, 154, 82, 0.08)',
          }}
        >
          {/* Soft Ambient Radiance Aura */}
          <div
            aria-hidden="true"
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-32 blur-3xl pointer-events-none animate-ambient-aura"
            style={{ backgroundColor: 'rgba(197, 154, 82, 0.12)' }}
          />

          <div className="relative z-10 space-y-2 max-w-xl mx-auto">
            {/* Chapter Pill Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-serif font-medium shadow-xs"
              style={{
                backgroundColor: 'rgba(197, 154, 82, 0.12)',
                border: '1px solid rgba(197, 154, 82, 0.45)',
                color: '#C59A52',
              }}
            >
              <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" style={{ color: '#C59A52' }} />
              <span>Private Sanctuary</span>
            </div>

            {/* Chapter Title (Light Parchment #F2E8D2) */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight drop-shadow-md"
              style={{ color: '#F2E8D2' }}
            >
              What Am I To You?
            </h1>

            <p
              className="text-xs sm:text-sm md:text-base font-serif leading-relaxed italic max-w-lg mx-auto"
              style={{ color: '#CDBFA8' }}
            >
              A private writing space where you can leave your unedited feelings, quiet thoughts, and personal letters.
            </p>
          </div>

          {/* User Sanctuary Status Row & Doodle Controls */}
          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
            {currentUser ? (
              <button
                type="button"
                onClick={() => navigate(ROUTES.REFLECTIONS)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-serif shadow-xs transition-all cursor-pointer touch-manipulation hover:brightness-115"
                style={{
                  backgroundColor: '#172033',
                  color: '#E8D8B8',
                  border: '1px solid #9F7A3D',
                }}
              >
                <BookOpen className="h-3.5 w-3.5" style={{ color: '#C59A52' }} />
                <span>View Your Reflections</span>
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-serif italic" style={{ color: '#9F927F' }}>
                  Sign in is optional, but secures your reflections privately
                </span>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-serif shadow-xs transition-all cursor-pointer touch-manipulation disabled:opacity-50 hover:brightness-115"
                  style={{
                    backgroundColor: '#172033',
                    color: '#E8D8B8',
                    border: '1px solid #9F7A3D',
                  }}
                >
                  {isLoggingIn ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: '#C59A52' }} />
                  ) : (
                    <LogIn className="h-3.5 w-3.5" style={{ color: '#C59A52' }} />
                  )}
                  <span>{isLoggingIn ? 'Signing In...' : 'Sign in with Google'}</span>
                </button>
                {authError && (
                  <span className="text-[11px] font-serif text-center" style={{ color: '#A87978' }}>
                    {authError}
                  </span>
                )}
              </div>
            )}

            {/* Doodling System Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingDoodle(null);
                  setIsDoodleModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif shadow-xs transition-all cursor-pointer touch-manipulation hover:brightness-115"
                style={{
                  backgroundColor: '#6E3E42',
                  color: '#F2E8D2',
                  border: '1px solid #9F7A3D',
                }}
                title="Open drawing desk to doodle"
              >
                <Pen className="h-3.5 w-3.5 text-[#F2E8D2]" />
                <span>Doodle</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDoodlesDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif shadow-xs transition-all cursor-pointer touch-manipulation hover:brightness-115"
                style={{
                  backgroundColor: '#172033',
                  color: '#E8D8B8',
                  border: '1px solid rgba(197, 154, 82, 0.4)',
                }}
                title="View your saved doodles"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#C59A52]" />
                <span>My Doodles</span>
              </button>
            </div>
          </div>
        </header>

        {/* 2. Main Question & Writing Experience Container */}
        <main className="relative z-10 w-full space-y-6">

          {/* If Feeling was just successfully submitted, show the interactive keepsake reveal */}
          {feelingSuccess ? (
            <KeepsakeReveal
              type="feeling"
              title="A Quiet Thought Confided"
              message={feelingSuccess}
              onReset={() => setFeelingSuccess(null)}
            />
          ) : letterSuccess ? (
            /* If Letter was just successfully submitted, show the interactive keepsake reveal */
            <KeepsakeReveal
              type="letter"
              title="Your Letter Has Been Inscribed"
              message={letterSuccess}
              onReset={() => setLetterSuccess(null)}
            />
          ) : (
            /* Main Interactive Writing Forms */
            <div className="space-y-5">
              
              {/* Mode Selection Chapter Cards (Feelings vs. Letters) */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-4 px-1">
                {/* Option 1: A Quiet Feeling */}
                <button
                  type="button"
                  id="mode-feeling-tab"
                  onClick={() => setActiveMode('feeling')}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] rounded-full text-xs sm:text-sm font-serif transition-all duration-300 cursor-pointer touch-manipulation border shadow-xs"
                  style={{
                    backgroundColor: activeMode === 'feeling' ? '#6E3E42' : '#172033',
                    borderColor: activeMode === 'feeling' ? '#9F7A3D' : '#806846',
                    color: activeMode === 'feeling' ? '#F2E8D2' : '#CDBFA8',
                    fontWeight: activeMode === 'feeling' ? 500 : 400,
                  }}
                >
                  <Heart
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                    style={{
                      color: activeMode === 'feeling' ? '#C59A52' : '#9F7A3D',
                      fill: activeMode === 'feeling' ? '#C59A52' : 'none',
                    }}
                  />
                  <span>A Quiet Feeling</span>
                </button>

                {/* Option 2: Inscribe a Letter */}
                <button
                  type="button"
                  id="mode-letter-tab"
                  onClick={() => setActiveMode('letter')}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] rounded-full text-xs sm:text-sm font-serif transition-all duration-300 cursor-pointer touch-manipulation border shadow-xs"
                  style={{
                    backgroundColor: activeMode === 'letter' ? '#6E3E42' : '#172033',
                    borderColor: activeMode === 'letter' ? '#9F7A3D' : '#806846',
                    color: activeMode === 'letter' ? '#F2E8D2' : '#CDBFA8',
                    fontWeight: activeMode === 'letter' ? 500 : 400,
                  }}
                >
                  <Feather
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                    style={{ color: activeMode === 'letter' ? '#C59A52' : '#9F7A3D' }}
                  />
                  <span>Inscribe a Letter</span>
                </button>
              </div>

              {/* FORM 1: QUIET FEELING (Midnight Card + Warm Parchment Input) */}
              {activeMode === 'feeling' && (
                <section
                  key="mode-feeling-section"
                  aria-labelledby="feeling-prompt-heading"
                  className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border space-y-5 backdrop-blur-md animate-chapter-fade"
                  style={{
                    backgroundColor: '#172033',
                    borderColor: 'rgba(197, 154, 82, 0.25)',
                    boxShadow: '0 20px 50px -10px rgba(13, 20, 34, 0.9), 0 0 30px rgba(197, 154, 82, 0.08)',
                  }}
                >
                  {/* Prompt Focal Point */}
                  <div
                    className="text-center space-y-1.5 pb-3 border-b"
                    style={{ borderColor: 'rgba(197, 154, 82, 0.2)' }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className="text-[11px] sm:text-xs font-serif tracking-[0.18em] uppercase font-medium"
                        style={{ color: '#C59A52' }}
                      >
                        ✦ Unspoken Thoughts ✦
                      </span>
                    </div>
                    <h2
                      id="feeling-prompt-heading"
                      className="text-xl sm:text-2xl md:text-3xl font-serif tracking-tight font-medium"
                      style={{ color: '#F2E8D2' }}
                    >
                      Write Your Feeling
                    </h2>
                    <p className="text-xs sm:text-sm font-serif italic" style={{ color: '#E8D8B8' }}>
                      &ldquo;Whatever you're feeling, you can leave it here.&rdquo;
                    </p>
                  </div>

                  <form onSubmit={handleSendFeeling} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="feeling-input" className="sr-only">
                        Whatever you're feeling, you can leave it here
                      </label>
                      <div className="relative rounded-2xl overflow-hidden shadow-inner">
                        <textarea
                          id="feeling-input"
                          value={feelingText}
                          onChange={(e) => {
                            setFeelingText(e.target.value);
                            if (feelingError) setFeelingError(null);
                          }}
                          placeholder="Whatever you're feeling, you can leave it here..."
                          rows={6}
                          maxLength={3000}
                          disabled={!currentUser || isSubmittingFeeling}
                          className="w-full font-serif text-sm sm:text-base p-4 sm:p-5 rounded-2xl transition-all resize-y min-h-[160px] sm:min-h-[180px] stationery-parchment-lines"
                        />
                      </div>
                      <div className="flex flex-row items-center justify-between text-[11px] sm:text-xs font-serif px-1 pt-0.5 gap-2" style={{ color: '#9F927F' }}>
                        <span className="italic truncate">Held privately within your reflections</span>
                        <span className="shrink-0 tabular-nums">{feelingText.length} / 3000</span>
                      </div>
                    </div>

                    {feelingError && (
                      <div
                        className="flex items-center gap-2 text-xs sm:text-sm font-serif p-3 rounded-xl border"
                        style={{
                          backgroundColor: 'rgba(110, 62, 66, 0.25)',
                          borderColor: 'rgba(168, 121, 120, 0.4)',
                          color: '#F2E8D2',
                        }}
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" style={{ color: '#A87978' }} />
                        <span>{feelingError}</span>
                      </div>
                    )}

                    {/* Submission Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      {!currentUser ? (
                        <span className="text-xs font-serif italic text-center sm:text-left" style={{ color: '#9F927F' }}>
                          Please sign in above to safely inscribe your feeling.
                        </span>
                      ) : (
                        <span className="text-xs font-serif italic hidden sm:inline" style={{ color: '#9F927F' }}>
                          Preserved in your sanctuary
                        </span>
                      )}

                      <button
                        type="submit"
                        id="send-feeling-button"
                        disabled={!currentUser || !feelingText.trim() || isSubmittingFeeling}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 min-h-[44px] rounded-full text-xs sm:text-sm font-serif font-medium shadow-md transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation hover:brightness-110"
                        style={{
                          backgroundColor: '#6E3E42',
                          color: '#F2E8D2',
                          border: '1px solid #9F7A3D',
                        }}
                      >
                        {isSubmittingFeeling ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#F2E8D2' }} />
                            <span>Confiding...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" style={{ color: '#F2E8D2' }} />
                            <span>Send Feeling</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </section>
              )}

              {/* FORM 2: WRITTEN LETTERS (Midnight Card + Warm Parchment Inputs) */}
              {activeMode === 'letter' && (
                <section
                  key="mode-letter-section"
                  aria-labelledby="letter-prompt-heading"
                  className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border space-y-5 backdrop-blur-md animate-chapter-fade"
                  style={{
                    backgroundColor: '#172033',
                    borderColor: 'rgba(197, 154, 82, 0.25)',
                    boxShadow: '0 20px 50px -10px rgba(13, 20, 34, 0.9), 0 0 30px rgba(197, 154, 82, 0.08)',
                  }}
                >
                  {/* Prompt Focal Point */}
                  <div
                    className="text-center space-y-1.5 pb-3 border-b"
                    style={{ borderColor: 'rgba(197, 154, 82, 0.2)' }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className="text-[11px] sm:text-xs font-serif tracking-[0.18em] uppercase font-medium"
                        style={{ color: '#C59A52' }}
                      >
                        ✦ Personal Correspondence ✦
                      </span>
                    </div>
                    <h2
                      id="letter-prompt-heading"
                      className="text-xl sm:text-2xl md:text-3xl font-serif tracking-tight font-medium"
                      style={{ color: '#F2E8D2' }}
                    >
                      Written Letters
                    </h2>
                    <p className="text-xs sm:text-sm font-serif italic" style={{ color: '#E8D8B8' }}>
                      &ldquo;I want to write you a letter.&rdquo;
                    </p>
                  </div>

                  <form onSubmit={handleSendLetter} className="space-y-4">
                    {/* Optional Letter Title */}
                    <div className="space-y-1.5">
                      <label htmlFor="letter-title" className="block text-xs font-serif" style={{ color: '#E8D8B8' }}>
                        Letter Title <span className="font-normal" style={{ color: '#9F927F' }}>(optional)</span>
                      </label>
                      <input
                        id="letter-title"
                        type="text"
                        value={letterTitle}
                        onChange={(e) => {
                          setLetterTitle(e.target.value);
                          if (letterError) setLetterError(null);
                        }}
                        placeholder="Give your letter a title..."
                        disabled={!currentUser || isSubmittingLetter}
                        className="w-full font-serif text-sm sm:text-base px-4 py-2.5 sm:py-3 rounded-xl transition-all stationery-parchment-sheet"
                      />
                    </div>

                    {/* Letter Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="letter-body" className="block text-xs font-serif" style={{ color: '#E8D8B8' }}>
                          Letter Content <span style={{ color: '#C59A52' }}>*</span>
                        </label>
                        <span className="text-[11px] font-serif italic" style={{ color: '#9F927F' }}>
                          Inscribed onto parchment
                        </span>
                      </div>
                      <div className="relative rounded-2xl overflow-hidden shadow-inner">
                        <textarea
                          id="letter-body"
                          value={letterBody}
                          onChange={(e) => {
                            setLetterBody(e.target.value);
                            if (letterError) setLetterError(null);
                          }}
                          placeholder="Dear..."
                          rows={10}
                          maxLength={10000}
                          disabled={!currentUser || isSubmittingLetter}
                          className="w-full font-serif text-sm sm:text-base p-4 sm:p-5 rounded-2xl transition-all resize-y min-h-[220px] sm:min-h-[280px] stationery-parchment-lines"
                        />
                      </div>
                      <div className="flex flex-row items-center justify-between text-[11px] sm:text-xs font-serif px-1 pt-0.5 gap-2" style={{ color: '#9F927F' }}>
                        <span className="italic truncate">Written letters are sealed & preserved securely</span>
                        <span className="shrink-0 tabular-nums">{letterBody.length} / 10000</span>
                      </div>
                    </div>

                    {letterError && (
                      <div
                        className="flex items-center gap-2 text-xs sm:text-sm font-serif p-3 rounded-xl border"
                        style={{
                          backgroundColor: 'rgba(110, 62, 66, 0.25)',
                          borderColor: 'rgba(168, 121, 120, 0.4)',
                          color: '#F2E8D2',
                        }}
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" style={{ color: '#A87978' }} />
                        <span>{letterError}</span>
                      </div>
                    )}

                    {/* Submission Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      {!currentUser ? (
                        <span className="text-xs font-serif italic text-center sm:text-left" style={{ color: '#9F927F' }}>
                          Please sign in above to seal your letter.
                        </span>
                      ) : (
                        <span className="text-xs font-serif italic hidden sm:inline" style={{ color: '#9F927F' }}>
                          Inscribed safely into reflections
                        </span>
                      )}

                      <button
                        type="submit"
                        id="send-letter-button"
                        disabled={!currentUser || !letterBody.trim() || isSubmittingLetter}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 min-h-[44px] rounded-full text-xs sm:text-sm font-serif font-medium shadow-md transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation hover:brightness-110"
                        style={{
                          backgroundColor: '#6E3E42',
                          color: '#F2E8D2',
                          border: '1px solid #9F7A3D',
                        }}
                      >
                        {isSubmittingLetter ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#F2E8D2' }} />
                            <span>Sealing Letter...</span>
                          </>
                        ) : (
                          <>
                            <Feather className="h-4 w-4" style={{ color: '#F2E8D2' }} />
                            <span>Send Letter</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </section>
              )}

            </div>
          )}
        </main>

        {/* 3. Subtle Archival Footer Marker */}
        <footer className="pt-4 text-center border-t" style={{ borderColor: 'rgba(197, 154, 82, 0.2)' }}>
          <p className="text-xs italic font-serif flex items-center justify-center gap-1.5" style={{ color: '#9F927F' }}>
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#C59A52' }} />
            <span>Starlit Letters — What Am I To You Sanctuary</span>
          </p>
        </footer>

        {/* Doodling System Modals */}
        <DoodleCanvasModal
          isOpen={isDoodleModalOpen}
          onClose={() => {
            setIsDoodleModalOpen(false);
            setEditingDoodle(null);
          }}
          section="what-am-i-to-you"
          initialDoodle={editingDoodle}
          onDoodleSaved={() => {
            // Keep modal open or let user continue editing
          }}
        />

        <DoodlesDrawer
          isOpen={isDoodlesDrawerOpen}
          onClose={() => setIsDoodlesDrawerOpen(false)}
          section="what-am-i-to-you"
          onSelectDoodle={(doodle) => {
            setEditingDoodle(doodle);
            setIsDoodlesDrawerOpen(false);
            setIsDoodleModalOpen(true);
          }}
          onNewDoodle={() => {
            setEditingDoodle(null);
            setIsDoodlesDrawerOpen(false);
            setIsDoodleModalOpen(true);
          }}
        />

      </Container>
    </div>
  );
}

