import React, { useState, useMemo } from 'react';
import { BookOpen, Calendar, Sparkles, Lock, X, Feather } from 'lucide-react';
import { Container, Surface, Badge, HiddenDiscoveryElement } from '../components';
import {
  NotesGrid,
  NoteReader,
  MonthNavigation,
  NoteFilterBar,
  SortOption,
} from '../components/notes';
import { sampleNotes365, formatCalendarDate } from '../data';
import { Note365 } from '../types';
import { getManagedNotes365 } from '../services/contentService';
import {
  isNoteUnlocked,
  COLLECTION_START_DATE,
  formatLocalDate,
  getUnlockSundayForNote,
  notesProgressService,
} from '../utils';
import { useTheme } from '../hooks';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function Notes365() {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';

  const [rawNotes, setRawNotes] = useState<Note365[]>(() => {
    const readIds = new Set(notesProgressService.getReadNoteIds());
    const favoriteIds = new Set(notesProgressService.getFavoriteNoteIds());
    return sampleNotes365.map((n) => ({
      ...n,
      isRead: readIds.has(n.id) || n.isRead,
      isFavorite: favoriteIds.has(n.id) || n.isFavorite,
    }));
  });
  const [selectedNote, setSelectedNote] = useState<Note365 | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // September 2026

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [monthScope, setMonthScope] = useState<'current' | 'all'>('current');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [favoriteOnly, setFavoriteOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('oldest');

  // Reference date state for unlock logic evaluation (defaults to actual local date or COLLECTION_START_DATE if prior)
  const actualTodayStr = formatLocalDate(new Date());
  const defaultRefDate =
    actualTodayStr >= COLLECTION_START_DATE
      ? actualTodayStr
      : COLLECTION_START_DATE;
  const [referenceDate] = useState<string>(defaultRefDate);

  // Fetch managed content overrides from Firestore if available
  React.useEffect(() => {
    let isMounted = true;
    getManagedNotes365().then((managedNotes) => {
      if (!isMounted) return;
      const readIds = new Set(notesProgressService.getReadNoteIds());
      const favoriteIds = new Set(notesProgressService.getFavoriteNoteIds());
      setRawNotes(
        managedNotes.map((n) => ({
          ...n,
          isRead: readIds.has(n.id) || n.isRead,
          isFavorite: favoriteIds.has(n.id) || n.isFavorite,
        }))
      );
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Subtle notice state when a locked note is clicked
  const [lockedNotice, setLockedNotice] = useState<{
    displayDate: string;
    unlockSunday: string;
  } | null>(null);

  // Derive active notes with deterministic weekly unlock state based on note.date + referenceDate
  const notes: Note365[] = rawNotes.map((note) => ({
    ...note,
    isUnlocked: isNoteUnlocked(note.date, referenceDate),
  }));

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((prev) => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((prev) => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const selectedMonthKey = `${currentYear}-${String(currentMonth).padStart(
    2,
    '0'
  )}`;
  const currentMonthName = `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`;

  // Multi-criteria derived filtering
  const filteredNotes = notes.filter((n) => {
    // 1. Month scope
    if (monthScope === 'current') {
      if (!n.date.startsWith(selectedMonthKey)) return false;
    }

    // 2. Read filter
    if (readFilter === 'read' && !n.isRead) return false;
    if (readFilter === 'unread' && n.isRead) return false;

    // 3. Favorites filter
    if (favoriteOnly && !n.isFavorite) return false;

    // 4. Case-insensitive search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesTitle = n.title.toLowerCase().includes(q);
      const matchesPreview = n.preview.toLowerCase().includes(q);
      const matchesContent = n.content.toLowerCase().includes(q);
      const matchesDate = n.date.toLowerCase().includes(q);
      const matchesDisplayDate = n.displayDate.toLowerCase().includes(q);

      if (
        !matchesTitle &&
        !matchesPreview &&
        !matchesContent &&
        !matchesDate &&
        !matchesDisplayDate
      ) {
        return false;
      }
    }

    return true;
  });

  // Derived sorting
  const sortedNotes = useMemo(() => {
    const result = [...filteredNotes];
    if (sortBy === 'newest') {
      result.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sortBy === 'unopened') {
      result.sort((a, b) => {
        if (a.isRead === b.isRead) return a.date.localeCompare(b.date);
        return a.isRead ? 1 : -1;
      });
    } else if (sortBy === 'opened') {
      result.sort((a, b) => {
        if (a.isRead === b.isRead) return a.date.localeCompare(b.date);
        return a.isRead ? -1 : 1;
      });
    }
    return result;
  }, [filteredNotes, sortBy]);

  // Calculate active filter count for quick reset button
  let activeFiltersCount = 0;
  if (searchQuery.trim()) activeFiltersCount += 1;
  if (monthScope === 'all') activeFiltersCount += 1;
  if (readFilter !== 'all') activeFiltersCount += 1;
  if (favoriteOnly) activeFiltersCount += 1;
  if (sortBy !== 'oldest') activeFiltersCount += 1;

  const handleClearFilters = () => {
    setSearchQuery('');
    setMonthScope('current');
    setReadFilter('all');
    setFavoriteOnly(false);
    setSortBy('oldest');
  };

  const todayDate = actualTodayStr;

  const handleSelectNote = (note: Note365) => {
    if (note.isUnlocked) {
      setLockedNotice(null);
      // Mark as read when opened if not read already
      if (!note.isRead) {
        notesProgressService.markNoteAsRead(note.id);
        setRawNotes((prev) =>
          prev.map((n) => (n.id === note.id ? { ...n, isRead: true } : n))
        );
        setSelectedNote({ ...note, isRead: true });
      } else {
        setSelectedNote(note);
      }
    } else {
      handleLockedClick(note);
    }
  };

  const handleLockedClick = (note: Note365) => {
    const unlockSundayStr = getUnlockSundayForNote(note.date);
    const formattedSunday = formatCalendarDate(unlockSundayStr);
    setLockedNotice({
      displayDate: note.displayDate,
      unlockSunday: formattedSunday,
    });
  };

  const handleCloseReader = () => {
    setSelectedNote(null);
  };

  // Navigation inside NoteReader across the entire 365-note collection chronologically
  const selectedNoteIndex = selectedNote
    ? notes.findIndex((n) => n.id === selectedNote.id)
    : -1;

  const previousNoteCandidate =
    selectedNoteIndex > 0 ? notes[selectedNoteIndex - 1] : null;
  const nextNoteCandidate =
    selectedNoteIndex >= 0 && selectedNoteIndex < notes.length - 1
      ? notes[selectedNoteIndex + 1]
      : null;

  const hasPreviousNote = Boolean(
    previousNoteCandidate && previousNoteCandidate.isUnlocked
  );
  const hasNextNote = Boolean(
    nextNoteCandidate && nextNoteCandidate.isUnlocked
  );

  const handlePreviousNote = () => {
    if (previousNoteCandidate && previousNoteCandidate.isUnlocked) {
      handleSelectNote(previousNoteCandidate);
      // Synchronize currentYear and currentMonth to match target note's month
      const [y, m] = previousNoteCandidate.date.split('-').map(Number);
      if (y && m) {
        setCurrentYear(y);
        setCurrentMonth(m);
      }
    }
  };

  const handleNextNote = () => {
    if (nextNoteCandidate && nextNoteCandidate.isUnlocked) {
      handleSelectNote(nextNoteCandidate);
      // Synchronize currentYear and currentMonth to match target note's month
      const [y, m] = nextNoteCandidate.date.split('-').map(Number);
      if (y && m) {
        setCurrentYear(y);
        setCurrentMonth(m);
      }
    }
  };

  const handleToggleFavorite = (noteId: string) => {
    const target = notes.find((n) => n.id === noteId);
    if (!target || !target.isUnlocked) return;

    notesProgressService.toggleNoteFavorite(noteId);
    setRawNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, isFavorite: !n.isFavorite } : n
      )
    );
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    }
  };

  const handleMarkAsRead = (noteId: string) => {
    const target = notes.find((n) => n.id === noteId);
    if (!target || !target.isUnlocked) return;

    notesProgressService.markNoteAsRead(noteId);
    setRawNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isRead: true } : n))
    );
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote((prev) => (prev ? { ...prev, isRead: true } : null));
    }
  };

  const handleClearProgress = () => {
    notesProgressService.clearNotesProgress();
    setRawNotes((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: false,
        isFavorite: false,
      }))
    );
    if (selectedNote) {
      setSelectedNote((prev) =>
        prev ? { ...prev, isRead: false, isFavorite: false } : null
      );
    }
  };

  const unlockedCount = notes.filter((n) => n.isUnlocked).length;
  const readCount = notes.filter((n) => n.isRead).length;

  return (
    <Container size="lg" className="py-8 sm:py-12 space-y-8">
      {/* Header Section */}
      <header className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <Badge variant="primary" size="sm" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                365 Notes Archive
              </Badge>
              <span className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Starts 27 September 2026
              </span>
              <HiddenDiscoveryElement
                secretId="secret-05"
                label="Examine subtle paper boat ornament"
                icon={Feather}
                className="text-[var(--color-accent)]"
              />
            </div>

            <h1 className="text-2xl sm:text-h1 font-serif text-[var(--color-text)]">
              Daily Reflections
            </h1>
            <p className="text-sm sm:text-body text-[var(--color-text-secondary)] font-serif max-w-xl mt-0.5 sm:mt-1 leading-relaxed">
              A collection of daily notes captured across the year, starting on 27 September 2026.
            </p>
          </div>

          <Surface variant="elevated" padding="sm" className="inline-flex sm:flex items-center justify-around sm:justify-start gap-3 sm:gap-4 border border-[var(--color-border-light)] shrink-0 self-start sm:self-auto py-2 px-3 sm:py-2.5 sm:px-4">
            <div className="text-center px-1.5 sm:px-2">
              <span className="block text-base sm:text-h4 font-serif text-[var(--color-primary)]">
                {readCount} / {notes.length}
              </span>
              <span className="text-[10px] sm:text-[11px] text-[var(--color-muted)] uppercase tracking-wider">
                Notes Read
              </span>
            </div>
            <div className="h-7 sm:h-8 w-px bg-[var(--color-border-light)]" />
            <div className="text-center px-1.5 sm:px-2">
              <span className="block text-base sm:text-h4 font-serif text-[var(--color-secondary)]">
                {unlockedCount}
              </span>
              <span className="text-[10px] sm:text-[11px] text-[var(--color-muted)] uppercase tracking-wider">
                Unlocked
              </span>
            </div>
          </Surface>
        </div>
      </header>

      {/* Locked Note Feedback Notice Banner */}
      {lockedNotice && (
        <Surface
          variant="elevated"
          padding="sm"
          className="flex items-center justify-between gap-3 border border-[var(--color-warning)]/40 bg-[var(--color-surface-secondary)] px-4 py-3 text-xs rounded-[var(--radius-md)] text-[var(--color-text)] animate-in fade-in transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-[var(--color-warning)] shrink-0" />
            <span>
              <strong>{lockedNotice.displayDate}</strong> is currently locked. This note unlocks on Sunday, {lockedNotice.unlockSunday}.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLockedNotice(null)}
            className="text-[var(--color-muted)] hover:text-[var(--color-text)] p-1 rounded-full transition-colors"
            aria-label="Close notice"
          >
            <X className="h-4 w-4" />
          </button>
        </Surface>
      )}

      {/* Main Content Area */}
      {selectedNote ? (
        /* Dedicated Note Reader View when a tile is clicked */
        <NoteReader
          note={selectedNote}
          onClose={handleCloseReader}
          onPreviousNote={handlePreviousNote}
          onNextNote={handleNextNote}
          hasPreviousNote={hasPreviousNote}
          hasNextNote={hasNextNote}
          onToggleFavorite={handleToggleFavorite}
          onMarkAsRead={handleMarkAsRead}
        />
      ) : (
        /* 365 Notes Tile Grid View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-h3 font-serif text-[var(--color-text)] flex items-center gap-2">
              Memory Archive
            </h2>

            {/* Compact Month Navigation */}
            <MonthNavigation
              currentYear={currentYear}
              currentMonth={currentMonth}
              minYear={2026}
              minMonth={9}
              maxYear={2027}
              maxMonth={9}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              className="w-full sm:w-auto"
            />
          </div>

          {/* Interactive Search & Filter Bar */}
          <NoteFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            monthScope={monthScope}
            onMonthScopeChange={setMonthScope}
            readFilter={readFilter}
            onReadFilterChange={setReadFilter}
            favoriteOnly={favoriteOnly}
            onFavoriteOnlyChange={setFavoriteOnly}
            sortBy={sortBy}
            onSortChange={setSortBy}
            currentMonthName={currentMonthName}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
            totalResultsCount={sortedNotes.length}
          />

          {/* Letter Archive Treasured Letters Header (when Favorites filter is active) */}
          {isLetterArchive && favoriteOnly && (
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-1 pt-1 border-b border-[rgba(138,110,89,0.22)] animate-in fade-in duration-200">
              <div className="space-y-0.5">
                <h3 className="text-xl sm:text-2xl font-serif text-[#3B2A20] font-normal tracking-tight">
                  Treasured Letters
                </h3>
                <p className="letter-script text-xs sm:text-sm text-[#7A2E3B] tracking-wide">
                  the ones worth keeping a little closer
                </p>
              </div>
              <span className="text-xs font-serif text-[#8A5B20] italic">
                ♡ {sortedNotes.length} {sortedNotes.length === 1 ? 'treasured letter' : 'treasured letters'}
              </span>
            </div>
          )}

          {/* Notes Grid */}
          <NotesGrid
            notes={sortedNotes}
            todayDate={todayDate}
            onSelectNote={handleSelectNote}
            onLockedClick={handleLockedClick}
            isFavoriteFilter={favoriteOnly}
            isSearchEmpty={Boolean(searchQuery.trim() && sortedNotes.length === 0)}
            emptyTitle={
              isLetterArchive
                ? searchQuery.trim()
                  ? 'No letter was found.'
                  : favoriteOnly
                  ? 'Nothing tucked away here yet.'
                  : readFilter === 'unread'
                  ? 'All correspondence unfolded'
                  : readFilter === 'read'
                  ? 'No opened letters in this selection'
                  : activeFiltersCount > 0
                  ? 'No correspondence matches this filter'
                  : 'No letters here yet.'
                : activeFiltersCount > 0
                ? 'No matching notes found'
                : 'No notes recorded for this month'
            }
            emptyMessage={
              isLetterArchive
                ? searchQuery.trim()
                  ? "Perhaps the correspondence you're looking for is filed under a different date or written in another chapter."
                  : favoriteOnly
                  ? 'As you unfold and read correspondence, save the ones that mean a little more to keep them close.'
                  : readFilter === 'unread'
                  ? 'Every letter preserved in this collection has been unfolded and read.'
                  : readFilter === 'read'
                  ? 'Select an unopened envelope above to unseal and read its preserved message.'
                  : activeFiltersCount > 0
                  ? 'Try adjusting your search query, scope, or filter selections.'
                  : 'Perhaps one is still waiting to be written, or tucked away in another season.'
                : activeFiltersCount > 0
                ? 'Try adjusting your search query, scope, or filter selections.'
                : 'Navigate to another month to explore starlit reflections in the 365 Notes collection.'
            }
            onClearFilters={activeFiltersCount > 0 ? handleClearFilters : undefined}
          />
        </div>
      )}

      {/* Architecture Footer */}
      <div className="pt-4 text-center border-t border-[var(--color-border-light)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-muted)]">
        <p className="italic font-serif flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          Weekly unlock schedule active (Sunday to Saturday boundaries).
        </p>

        {process.env.NODE_ENV !== 'production' && (
          <button
            type="button"
            onClick={handleClearProgress}
            className="hover:underline text-[var(--color-muted)] hover:text-[var(--color-warning)] text-[11px] font-mono transition-colors"
            title="Development tool to reset local read and favorite progress"
          >
            [Dev: Reset Progress]
          </button>
        )}
      </div>
    </Container>
  );
}


