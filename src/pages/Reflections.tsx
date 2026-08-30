import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Mail,
  Search,
  ArrowUpDown,
  BookOpen,
  Sparkles,
  X,
  LogIn,
  Feather,
  PlusCircle,
  Loader2,
  PenTool,
  Pen,
} from 'lucide-react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useAuth } from '../hooks';
import { ROUTES } from '../constants';
import {
  fetchUserFeelings,
  fetchUserLetters,
  UserFeelingRef,
  UserLetterRef,
} from '../services/reflectionsService';
import { ReflectionEntryCard } from '../components/reflections/ReflectionEntryCard';
import { ScrollFocusReveal } from '../components';
import { ReflectionWriter } from '../components/reflections/ReflectionWriter';
import { DoodleCanvasModal, DoodlesDrawer } from '../components/doodle';
import { DoodleItem } from '../types/doodle';
import '../components/reflections/reflections.css';

export default function Reflections() {
  const navigate = useNavigate();
  const { currentUser, loginWithGoogle } = useAuth();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Doodle State
  const [isDoodleModalOpen, setIsDoodleModalOpen] = useState(false);
  const [isDoodlesDrawerOpen, setIsDoodlesDrawerOpen] = useState(false);
  const [editingDoodle, setEditingDoodle] = useState<DoodleItem | null>(null);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.message && !err.message.includes('cancelled')) {
        setAuthError(err.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'feelings' | 'letters'>('feelings');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showWriter, setShowWriter] = useState(false);

  // Feelings State
  const [feelings, setFeelings] = useState<UserFeelingRef[]>([]);
  const [feelingsLastDoc, setFeelingsLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [feelingsHasMore, setFeelingsHasMore] = useState(false);
  const [feelingsLoading, setFeelingsLoading] = useState(false);
  const [feelingsLoadingMore, setFeelingsLoadingMore] = useState(false);

  // Letters State
  const [letters, setLetters] = useState<UserLetterRef[]>([]);
  const [lettersLastDoc, setLettersLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [lettersHasMore, setLettersHasMore] = useState(false);
  const [lettersLoading, setLettersLoading] = useState(false);
  const [lettersLoadingMore, setLettersLoadingMore] = useState(false);

  // Modal / Reader State
  const [selectedFeeling, setSelectedFeeling] = useState<UserFeelingRef | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<UserLetterRef | null>(null);

  // Fetch initial feelings
  const loadFeelings = useCallback(async () => {
    if (!currentUser) return;
    setFeelingsLoading(true);
    try {
      const res = await fetchUserFeelings(currentUser.uid, sortOrder, 20);
      setFeelings(res.items);
      setFeelingsLastDoc(res.lastDoc);
      setFeelingsHasMore(res.hasMore);
    } finally {
      setFeelingsLoading(false);
    }
  }, [currentUser, sortOrder]);

  // Fetch initial letters
  const loadLetters = useCallback(async () => {
    if (!currentUser) return;
    setLettersLoading(true);
    try {
      const res = await fetchUserLetters(currentUser.uid, sortOrder, 20);
      setLetters(res.items);
      setLettersLastDoc(res.lastDoc);
      setLettersHasMore(res.hasMore);
    } finally {
      setLettersLoading(false);
    }
  }, [currentUser, sortOrder]);

  // Trigger loading on mount or sort change
  useEffect(() => {
    loadFeelings();
    loadLetters();
  }, [loadFeelings, loadLetters]);

  // Handler after new reflection is written
  const handleReflectionSaved = () => {
    loadFeelings();
    loadLetters();
  };

  // Load More Feelings
  const handleLoadMoreFeelings = async () => {
    if (!currentUser || !feelingsLastDoc || feelingsLoadingMore) return;
    setFeelingsLoadingMore(true);
    try {
      const res = await fetchUserFeelings(currentUser.uid, sortOrder, 20, feelingsLastDoc);
      setFeelings((prev) => [...prev, ...res.items]);
      setFeelingsLastDoc(res.lastDoc);
      setFeelingsHasMore(res.hasMore);
    } finally {
      setFeelingsLoadingMore(false);
    }
  };

  // Load More Letters
  const handleLoadMoreLetters = async () => {
    if (!currentUser || !lettersLastDoc || lettersLoadingMore) return;
    setLettersLoadingMore(true);
    try {
      const res = await fetchUserLetters(currentUser.uid, sortOrder, 20, lettersLastDoc);
      setLetters((prev) => [...prev, ...res.items]);
      setLettersLastDoc(res.lastDoc);
      setLettersHasMore(res.hasMore);
    } finally {
      setLettersLoadingMore(false);
    }
  };

  // Filter Feelings by search term
  const filteredFeelings = useMemo(() => {
    if (!searchTerm.trim()) return feelings;
    const term = searchTerm.toLowerCase();
    return feelings.filter((f) => f.content.toLowerCase().includes(term));
  }, [feelings, searchTerm]);

  // Filter Letters by search term
  const filteredLetters = useMemo(() => {
    if (!searchTerm.trim()) return letters;
    const term = searchTerm.toLowerCase();
    return letters.filter(
      (l) => l.title.toLowerCase().includes(term) || l.content.toLowerCase().includes(term)
    );
  }, [letters, searchTerm]);

  // 1. Logged-out State (Atmospheric Journal Gate)
  if (!currentUser) {
    return (
      <main className="reflections-canvas py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border shadow-xl"
            style={{
              backgroundColor: '#151c2e',
              borderColor: '#C59A52',
            }}
          >
            <Feather className="h-8 w-8 text-[#C59A52]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight" style={{ color: '#F2E8D2' }}>
              Your Reflections
            </h1>
            <p className="text-sm sm:text-base font-serif italic" style={{ color: '#E8D8B8' }}>
              &ldquo;Sign in to keep your thoughts close.&rdquo;
            </p>
          </div>

          <p className="text-xs sm:text-sm font-serif leading-relaxed" style={{ color: '#9F927F' }}>
            Your personal feelings and written letters are preserved within a private midnight journal accessible only to you.
          </p>

          <div className="pt-2 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[48px] rounded-full text-sm font-serif font-medium shadow-xl transition-all cursor-pointer hover:brightness-110"
              style={{
                backgroundColor: '#6E3E42',
                color: '#F2E8D2',
                border: '1px solid #9F7A3D',
              }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#F2E8D2]" />
                  <span>Opening Journal...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 text-[#F2E8D2]" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {authError && (
              <p className="text-xs font-serif text-rose-300 max-w-xs text-center">
                {authError}
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="reflections-canvas py-8 sm:py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 1. Header Section */}
        <header
          className="space-y-4 text-center sm:text-left border-b pb-6"
          style={{ borderColor: 'rgba(197, 154, 82, 0.25)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-serif font-medium uppercase tracking-wider" style={{ color: '#C59A52' }}>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Personal Journal Sanctuary</span>
              </div>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight"
                style={{ color: '#F2E8D2' }}
              >
                Your Reflections
              </h1>
              <p className="text-xs sm:text-sm md:text-base font-serif italic max-w-xl" style={{ color: '#CDBFA8' }}>
                A quiet, private place for thoughts you have shared with this universe.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-center sm:justify-end gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setShowWriter((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 min-h-[44px] rounded-full text-xs sm:text-sm font-serif font-medium transition-all duration-200 cursor-pointer shadow-md hover:brightness-110"
                style={{
                  backgroundColor: showWriter ? '#6E3E42' : '#172033',
                  color: '#F2E8D2',
                  border: '1px solid #9F7A3D',
                }}
              >
                <PenTool className="w-4 h-4 text-[#C59A52]" />
                <span>{showWriter ? 'Hide Writing Desk' : 'Write in Journal'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingDoodle(null);
                  setIsDoodleModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 min-h-[44px] rounded-full text-xs sm:text-sm font-serif font-medium transition-all duration-200 cursor-pointer shadow-md hover:brightness-110"
                style={{
                  backgroundColor: '#6E3E42',
                  color: '#F2E8D2',
                  border: '1px solid #9F7A3D',
                }}
                title="Open doodle canvas"
              >
                <Pen className="w-4 h-4 text-[#F2E8D2]" />
                <span>Doodle</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDoodlesDrawerOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 min-h-[44px] rounded-full text-xs sm:text-sm font-serif transition-all duration-200 cursor-pointer hover:brightness-115"
                style={{
                  backgroundColor: '#151c2e',
                  color: '#E8D8B8',
                  border: '1px solid rgba(197, 154, 82, 0.4)',
                }}
                title="View your saved reflection doodles"
              >
                <Sparkles className="w-4 h-4 text-[#C59A52]" />
                <span>My Doodles</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(ROUTES.WHAT_AM_I_TO_YOU)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 min-h-[44px] rounded-full text-xs sm:text-sm font-serif transition-all duration-200 cursor-pointer hover:brightness-115"
                style={{
                  backgroundColor: '#151c2e',
                  color: '#E8D8B8',
                  border: '1px solid #806846',
                }}
              >
                <PlusCircle className="w-4 h-4 text-[#C59A52]" />
                <span>What Am I To You</span>
              </button>
            </div>
          </div>
        </header>

        {/* 2. Expandable Journal Writing Desk (Phase 32) */}
        {showWriter && (
          <div className="animate-fadeIn">
            <ReflectionWriter
              userId={currentUser.uid}
              onSaved={handleReflectionSaved}
            />
          </div>
        )}

        {/* 3. Controls & Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Navigation Tabs */}
          <div
            role="tablist"
            className="flex items-center p-1 rounded-full border self-start sm:self-auto"
            style={{
              backgroundColor: '#0f1424',
              borderColor: 'rgba(197, 154, 82, 0.25)',
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'feelings'}
              onClick={() => setActiveTab('feelings')}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 min-h-[40px] rounded-full text-xs sm:text-sm font-serif transition-all cursor-pointer"
              style={{
                backgroundColor: activeTab === 'feelings' ? '#6E3E42' : 'transparent',
                color: activeTab === 'feelings' ? '#F2E8D2' : '#CDBFA8',
                border: activeTab === 'feelings' ? '1px solid #9F7A3D' : '1px solid transparent',
              }}
            >
              <Heart
                className="h-3.5 w-3.5"
                style={{
                  color: activeTab === 'feelings' ? '#C59A52' : '#9F7A3D',
                  fill: activeTab === 'feelings' ? '#C59A52' : 'none',
                }}
              />
              <span>Your Feelings ({feelings.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'letters'}
              onClick={() => setActiveTab('letters')}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 min-h-[40px] rounded-full text-xs sm:text-sm font-serif transition-all cursor-pointer"
              style={{
                backgroundColor: activeTab === 'letters' ? '#6E3E42' : 'transparent',
                color: activeTab === 'letters' ? '#F2E8D2' : '#CDBFA8',
                border: activeTab === 'letters' ? '1px solid #9F7A3D' : '1px solid transparent',
              }}
            >
              <Mail
                className="h-3.5 w-3.5"
                style={{ color: activeTab === 'letters' ? '#C59A52' : '#9F7A3D' }}
              />
              <span>Written Letters ({letters.length})</span>
            </button>
          </div>

          {/* Filter Controls: Search & Sort */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9F927F]" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 min-h-[40px] text-xs sm:text-sm font-serif rounded-full transition-all focus:outline-none"
                style={{
                  backgroundColor: '#151c2e',
                  color: '#F2E8D2',
                  border: '1px solid rgba(197, 154, 82, 0.3)',
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9F927F] hover:text-[#F2E8D2]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-full text-xs font-serif transition-colors shrink-0 cursor-pointer"
              style={{
                backgroundColor: '#151c2e',
                color: '#E8D8B8',
                border: '1px solid rgba(197, 154, 82, 0.3)',
              }}
            >
              <ArrowUpDown className="h-3 w-3 text-[#C59A52]" />
              <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* 4. Tab Content - Feelings Section */}
        {activeTab === 'feelings' && (
          <section className="space-y-6">
            {feelingsLoading ? (
              <div className="text-center py-16 space-y-3">
                <Sparkles className="h-7 w-7 text-[#C59A52] animate-pulse mx-auto" />
                <p className="text-sm font-serif italic text-[#CDBFA8]">
                  Opening your journal reflections...
                </p>
              </div>
            ) : filteredFeelings.length === 0 ? (
              <div
                className="text-center py-14 px-6 rounded-2xl sm:rounded-3xl border max-w-lg mx-auto space-y-4 shadow-xl"
                style={{
                  backgroundColor: '#151c2e',
                  borderColor: 'rgba(197, 154, 82, 0.25)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-full mx-auto flex items-center justify-center border"
                  style={{
                    backgroundColor: 'rgba(197, 154, 82, 0.1)',
                    borderColor: '#C59A52',
                  }}
                >
                  <Heart className="h-6 w-6 text-[#C59A52]" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-lg font-serif font-medium" style={{ color: '#F2E8D2' }}>
                    {searchTerm
                      ? 'No matching feelings found.'
                      : 'An open journal waiting for your quiet thoughts.'}
                  </p>
                  <p className="text-xs sm:text-sm font-serif leading-relaxed" style={{ color: '#9F927F' }}>
                    {searchTerm
                      ? 'Try clearing your search keyword to view all preserved feelings.'
                      : 'Whenever you feel like leaving a small reflection, it will wait quietly here for you.'}
                  </p>
                </div>

                {!searchTerm && (
                  <button
                    type="button"
                    onClick={() => setShowWriter(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-full text-xs sm:text-sm font-serif font-medium shadow-md transition-all cursor-pointer hover:brightness-110"
                    style={{
                      backgroundColor: '#6E3E42',
                      color: '#F2E8D2',
                      border: '1px solid #9F7A3D',
                    }}
                  >
                    <Feather className="w-4 h-4 text-[#F2E8D2]" />
                    <span>Inscribe a Feeling</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {filteredFeelings.map((feeling, idx) => (
                  <ScrollFocusReveal key={feeling.id} className="h-full">
                    <ReflectionEntryCard
                      type="feeling"
                      item={feeling}
                      index={idx}
                      onSelect={() => setSelectedFeeling(feeling)}
                    />
                  </ScrollFocusReveal>
                ))}
              </div>
            )}

            {/* Load More Feelings Button */}
            {feelingsHasMore && !searchTerm && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={handleLoadMoreFeelings}
                  disabled={feelingsLoadingMore}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-full text-xs sm:text-sm font-serif transition-all cursor-pointer"
                  style={{
                    backgroundColor: '#151c2e',
                    color: '#E8D8B8',
                    border: '1px solid #806846',
                  }}
                >
                  {feelingsLoadingMore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Gathering entries...</span>
                    </>
                  ) : (
                    <span>Turn Page for More Feelings</span>
                  )}
                </button>
              </div>
            )}
          </section>
        )}

        {/* 5. Tab Content - Written Letters Section */}
        {activeTab === 'letters' && (
          <section className="space-y-6">
            {lettersLoading ? (
              <div className="text-center py-16 space-y-3">
                <Sparkles className="h-7 w-7 text-[#C59A52] animate-pulse mx-auto" />
                <p className="text-sm font-serif italic text-[#CDBFA8]">
                  Unfolding your preserved letters...
                </p>
              </div>
            ) : filteredLetters.length === 0 ? (
              <div
                className="text-center py-14 px-6 rounded-2xl sm:rounded-3xl border max-w-lg mx-auto space-y-4 shadow-xl"
                style={{
                  backgroundColor: '#151c2e',
                  borderColor: 'rgba(197, 154, 82, 0.25)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-full mx-auto flex items-center justify-center border"
                  style={{
                    backgroundColor: 'rgba(197, 154, 82, 0.1)',
                    borderColor: '#C59A52',
                  }}
                >
                  <Mail className="h-6 w-6 text-[#C59A52]" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-lg font-serif font-medium" style={{ color: '#F2E8D2' }}>
                    {searchTerm ? 'No matching letters found.' : 'There are no letters sealed here yet.'}
                  </p>
                  <p className="text-xs sm:text-sm font-serif leading-relaxed" style={{ color: '#9F927F' }}>
                    {searchTerm
                      ? 'Try adjusting your search keywords.'
                      : 'When you write a longer letter, it stays safely preserved inside your personal journal drawer.'}
                  </p>
                </div>

                {!searchTerm && (
                  <button
                    type="button"
                    onClick={() => setShowWriter(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-full text-xs sm:text-sm font-serif font-medium shadow-md transition-all cursor-pointer hover:brightness-110"
                    style={{
                      backgroundColor: '#6E3E42',
                      color: '#F2E8D2',
                      border: '1px solid #9F7A3D',
                    }}
                  >
                    <Feather className="w-4 h-4 text-[#F2E8D2]" />
                    <span>Inscribe a Letter</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {filteredLetters.map((letter, idx) => (
                  <ScrollFocusReveal key={letter.id} className="h-full">
                    <ReflectionEntryCard
                      type="letter"
                      item={letter}
                      index={idx}
                      onSelect={() => setSelectedLetter(letter)}
                    />
                  </ScrollFocusReveal>
                ))}
              </div>
            )}

            {/* Load More Letters Button */}
            {lettersHasMore && !searchTerm && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={handleLoadMoreLetters}
                  disabled={lettersLoadingMore}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-full text-xs sm:text-sm font-serif transition-all cursor-pointer"
                  style={{
                    backgroundColor: '#151c2e',
                    color: '#E8D8B8',
                    border: '1px solid #806846',
                  }}
                >
                  {lettersLoadingMore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Unfolding entries...</span>
                    </>
                  ) : (
                    <span>Turn Page for More Letters</span>
                  )}
                </button>
              </div>
            )}
          </section>
        )}

        {/* 6. Intimate Reading Sheet Modal for Feelings */}
        {selectedFeeling && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reading-feeling-heading"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs animate-fadeIn"
            onClick={() => setSelectedFeeling(null)}
          >
            <div
              className="reading-parchment-page rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#C8AD80]/40 pb-4">
                <div className="flex items-center gap-2 text-xs font-serif font-semibold text-[#6E3E42] uppercase tracking-wider">
                  <Heart className="h-4 w-4 fill-[#6E3E42]/20" />
                  <span id="reading-feeling-heading">Private Feeling</span>
                </div>
                <time className="text-xs font-serif text-[#7A6855] italic">
                  {selectedFeeling.createdAt}
                </time>
              </div>

              {/* Modal Content on Parchment */}
              <div className="py-3 sm:py-4 px-1 max-h-[60vh] overflow-y-auto">
                <p className="text-base sm:text-lg font-serif italic text-[#2B211B] leading-loose whitespace-pre-wrap">
                  &ldquo;{selectedFeeling.content}&rdquo;
                </p>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-[#C8AD80]/30 pt-4 flex items-center justify-between">
                <span className="text-[11px] font-serif text-[#8C7965] italic flex items-center gap-1">
                  <Feather className="w-3.5 h-3.5 text-[#9F7A3D]" />
                  <span>Held in your personal reflections</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedFeeling(null)}
                  className="px-5 py-2 min-h-[40px] rounded-full text-xs font-serif font-medium transition-all cursor-pointer hover:brightness-110"
                  style={{
                    backgroundColor: '#6E3E42',
                    color: '#F2E8D2',
                    border: '1px solid #9F7A3D',
                  }}
                >
                  Close Reflection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. Intimate Reading Sheet Modal for Letters */}
        {selectedLetter && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reading-letter-heading"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs animate-fadeIn"
            onClick={() => setSelectedLetter(null)}
          >
            <div
              className="reading-parchment-page rounded-2xl sm:rounded-3xl p-6 sm:p-9 max-w-2xl w-full space-y-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#C8AD80]/40 pb-4">
                <div className="flex items-center gap-2 text-xs font-serif font-semibold text-[#845E28] uppercase tracking-wider">
                  <Mail className="h-4 w-4 text-[#9F7A3D]" />
                  <span>Preserved Letter</span>
                </div>
                <time className="text-xs font-serif text-[#7A6855] italic">
                  {selectedLetter.createdAt}
                </time>
              </div>

              {/* Title & Body */}
              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                {selectedLetter.title && (
                  <h2
                    id="reading-letter-heading"
                    className="text-xl sm:text-2xl font-serif font-semibold text-[#2B211B] tracking-tight"
                  >
                    {selectedLetter.title}
                  </h2>
                )}

                <div className="p-4 sm:p-6 rounded-xl bg-[#F0E6D2]/60 border border-[#C8AD80]/40">
                  <p className="text-sm sm:text-base font-serif text-[#2B211B] leading-loose whitespace-pre-wrap">
                    {selectedLetter.content}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-[#C8AD80]/30 pt-4 flex items-center justify-between">
                <span className="text-[11px] font-serif text-[#8C7965] italic flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#9F7A3D]" />
                  <span>Archived in your reflections</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedLetter(null)}
                  className="px-5 py-2 min-h-[40px] rounded-full text-xs font-serif font-medium transition-all cursor-pointer hover:brightness-110"
                  style={{
                    backgroundColor: '#6E3E42',
                    color: '#F2E8D2',
                    border: '1px solid #9F7A3D',
                  }}
                >
                  Close Letter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Doodling System Modals */}
        <DoodleCanvasModal
          isOpen={isDoodleModalOpen}
          onClose={() => {
            setIsDoodleModalOpen(false);
            setEditingDoodle(null);
          }}
          section="your-reflections"
          initialDoodle={editingDoodle}
          onDoodleSaved={() => {
            // Keep modal open or let user continue editing
          }}
        />

        <DoodlesDrawer
          isOpen={isDoodlesDrawerOpen}
          onClose={() => setIsDoodlesDrawerOpen(false)}
          section="your-reflections"
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

      </div>
    </main>
  );
}
