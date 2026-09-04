import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Eye,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Terminal,
  Cpu,
  Lock,
  Unlock,
  Radio,
  Clock,
  Compass,
  Zap,
  Edit3,
  Shuffle,
  FileText,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Note365 } from '../../../types';
import { sampleNotes365 } from '../../../data';
import { getManagedNotes365, saveContentItem } from '../../../services/contentService';
import { ContentItemEditorModal } from '../content/ContentItemEditorModal';
import { useSfx } from '../../../contexts';

interface AdminNotes365PreviewProps {
  onNavigateToContent?: () => void;
}

export const AdminNotes365Preview: React.FC<AdminNotes365PreviewProps> = ({
  onNavigateToContent,
}) => {
  const { playSfx } = useSfx();
  const [notes, setNotes] = useState<Note365[]>(sampleNotes365);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulation controls state
  const [simulatedDay, setSimulatedDay] = useState<number>(42);
  const [isLeapYear, setIsLeapYear] = useState<boolean>(false);
  const [warpInputDay, setWarpInputDay] = useState<string>('42');
  const [simulatedDate, setSimulatedDate] = useState<string>('2026-10-12');
  const [selectedNote, setSelectedNote] = useState<Note365 | null>(null);

  // Decryption effect state
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [decryptionProgress, setDecryptionProgress] = useState<number>(100);

  // Editor Modal
  const [editingNote, setEditingNote] = useState<Note365 | null>(null);

  // Hovered day tooltip
  const [hoveredNote, setHoveredNote] = useState<Note365 | null>(null);

  const totalDays = isLeapYear ? 366 : 365;

  // Load live managed notes dataset
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getManagedNotes365()
      .then((managedNotes) => {
        if (isMounted && managedNotes && managedNotes.length > 0) {
          setNotes(managedNotes);
        }
      })
      .catch((err) => {
        console.warn('Error loading notes for chronometric simulator:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Set initial selected note
  useEffect(() => {
    if (notes.length > 0 && !selectedNote) {
      const match = notes.find((n) => (n.dayIndex ?? 1) === simulatedDay) || notes[0];
      setSelectedNote(match);
    }
  }, [notes, simulatedDay, selectedNote]);

  // Handle note selection with decryption animation
  const handleSelectDay = (dayIndex: number) => {
    playSfx('letterOpen');
    setSimulatedDay(dayIndex);
    setWarpInputDay(String(dayIndex));

    const found = notes.find((n) => (n.dayIndex ?? 1) === dayIndex);
    if (found) {
      setSelectedNote(found);
      triggerDecryptionSequence();
    }
  };

  const triggerDecryptionSequence = () => {
    setIsDecrypting(true);
    setDecryptionProgress(0);
    const interval = setInterval(() => {
      setDecryptionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDecrypting(false);
          return 100;
        }
        return prev + 25;
      });
    }, 45);
  };

  // Jump to real today
  const handleJumpToToday = () => {
    playSfx('pageTurn');
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const today = new Date();
    const diff = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const bounded = Math.min(Math.max(diff, 1), totalDays);
    handleSelectDay(bounded);
    setSimulatedDate(today.toISOString().split('T')[0]);
  };

  // Jump to random day
  const handleRandomDay = () => {
    playSfx('navigation');
    const rand = Math.floor(Math.random() * totalDays) + 1;
    handleSelectDay(rand);
  };

  // Step prev / next
  const handleStepDay = (step: number) => {
    playSfx('pageTurn');
    const nextDay = Math.min(Math.max(simulatedDay + step, 1), totalDays);
    handleSelectDay(nextDay);
  };

  // Handle manual day warp
  const handleApplyWarp = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(warpInputDay, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalDays) {
      handleSelectDay(parsed);
    }
  };

  // Calculate emotional resonance score mathematically
  const resonanceTelemetry = useMemo(() => {
    if (!selectedNote) return { score: 0, tone: 'NEUTRAL', wordCount: 0, charCount: 0 };
    const text = (selectedNote.content || '') + ' ' + (selectedNote.preview || '');
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = text.length;

    // Sentiment weight lookup
    const emotionalRegex = /\b(love|forever|heart|cherish|stars|celestial|promise|eternity|always|miss|hold|warmth|sweet|gentle|smile|darling|infinite|dream|remember|breathe|tender)\b/gi;
    const matches = text.match(emotionalRegex) || [];
    const intensity = matches.length;

    // Formula yields between 82.0% and 99.8%
    let baseScore = 84.5 + Math.min(intensity * 1.8, 12.0) + Math.min(wordCount * 0.03, 3.3);
    if (baseScore > 99.8) baseScore = 99.8;

    let tone = 'AFFECTIONATE';
    if (intensity > 5) tone = 'DEEP_DEVOTION';
    else if (/miss|hold|remember/i.test(text)) tone = 'NOSTALGIC_LONGING';
    else if (/stars|universe|celestial/i.test(text)) tone = 'COSMIC_INTIMACY';
    else if (intensity <= 2) tone = 'GENTLE_REFLECTION';

    return {
      score: baseScore.toFixed(1),
      tone,
      wordCount,
      charCount,
    };
  }, [selectedNote]);

  // Milestone check
  const isMilestoneDay = (day: number) => {
    return day === 1 || day === 100 || day === 200 || day === 300 || day === 365 || day === 366;
  };

  // Generate 365 day slots
  const allDaysList = useMemo(() => {
    const list = [];
    for (let i = 1; i <= totalDays; i++) {
      const noteMatch = notes.find((n) => (n.dayIndex ?? 1) === i);
      list.push({
        dayIndex: i,
        note: noteMatch,
        isUnlocked: i <= simulatedDay,
        isCurrent: i === simulatedDay,
        isMilestone: isMilestoneDay(i),
      });
    }
    return list;
  }, [totalDays, simulatedDay, notes]);

  return (
    <div className="space-y-4 font-mono select-none" id="admin-365-chronometric-simulator">
      {/* Header */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_20px_rgba(16,185,129,0.03)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#020408] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '24s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-emerald-400 font-bold tracking-wider">
                  [CHRONOMETRIC_SIMULATOR // 365_NOTES_PREVIEW]
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  TEMPORAL_CLOCK::SYNCED
                </span>
                <span className="text-[10px] text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  [SANDBOX_MODE // READ_ONLY]
                </span>
              </div>
              <p className="text-[11px] text-emerald-600/90 font-mono mt-0.5">
                // Simulating user-side chronometric unlock state, memory block allocation, and decryption forensics.
              </p>
            </div>
          </div>

          {onNavigateToContent && (
            <button
              onClick={onNavigateToContent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-colors cursor-pointer self-start md:self-auto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>[RETURN_TO_CONTENT_DEPOT]</span>
            </button>
          )}
        </div>

        {/* Simulation Control Header */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 pt-3 border-t border-emerald-950/60">
          {/* Simulated Day Counter */}
          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">SIMULATED CHRONO DAY</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-cyan-300">
                DAY [{String(simulatedDay).padStart(3, '0')} / {totalDays}]
              </span>
              <span className="text-[10px] text-emerald-400">
                ({((simulatedDay / totalDays) * 100).toFixed(0)}% UNLOCKED)
              </span>
            </div>
            <div className="w-full bg-[#050811] h-1.5 rounded-full mt-2 overflow-hidden border border-emerald-950">
              <div
                className="bg-cyan-400 h-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{ width: `${(simulatedDay / totalDays) * 100}%` }}
              />
            </div>
          </div>

          {/* Temporal Warp Controls */}
          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                TEMPORAL JUMP // WARP CONTROLS
              </span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <button
                  onClick={() => setIsLeapYear(!isLeapYear)}
                  className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                    isLeapYear
                      ? 'bg-amber-950 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-[#050811] text-slate-400 border-emerald-950'
                  }`}
                >
                  LEAP_YEAR: {isLeapYear ? '366d' : '365d'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleJumpToToday}
                className="px-2.5 py-1 rounded bg-[#050811] hover:bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-colors cursor-pointer"
              >
                [TODAY]
              </button>

              <button
                onClick={handleRandomDay}
                className="px-2.5 py-1 rounded bg-[#050811] hover:bg-purple-950/40 text-purple-300 border border-purple-500/30 text-xs font-mono transition-colors cursor-pointer"
              >
                [RANDOM_DAY]
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStepDay(-1)}
                  className="px-2 py-1 rounded bg-[#050811] hover:bg-emerald-950 text-emerald-300 border border-emerald-950 text-xs cursor-pointer"
                >
                  &lt; -1D
                </button>
                <button
                  onClick={() => handleStepDay(1)}
                  className="px-2 py-1 rounded bg-[#050811] hover:bg-emerald-950 text-emerald-300 border border-emerald-950 text-xs cursor-pointer"
                >
                  +1D &gt;
                </button>
              </div>

              {/* Form for manual day warp */}
              <form onSubmit={handleApplyWarp} className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max={totalDays}
                  value={warpInputDay}
                  onChange={(e) => setWarpInputDay(e.target.value)}
                  className="w-16 px-1.5 py-1 bg-[#050811] border border-emerald-500/30 text-emerald-200 text-xs rounded focus:outline-none focus:border-emerald-400 font-mono text-center"
                />
                <button
                  type="submit"
                  className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs cursor-pointer font-bold"
                >
                  [WARP]
                </button>
              </form>
            </div>
          </div>

          {/* Quick Date Simulation */}
          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">SIMULATED CALENDAR DATE</span>
            <input
              type="date"
              value={simulatedDate}
              onChange={(e) => {
                setSimulatedDate(e.target.value);
                const d = new Date(e.target.value);
                if (!isNaN(d.getTime())) {
                  const startOfYear = new Date(d.getFullYear(), 0, 1);
                  const diff = Math.floor((d.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  const bounded = Math.min(Math.max(diff, 1), totalDays);
                  handleSelectDay(bounded);
                }
              }}
              className="w-full bg-[#050811] border border-emerald-500/30 rounded px-2 py-1 text-xs text-emerald-200 font-mono focus:outline-none focus:border-emerald-400 cursor-pointer"
            />
            <p className="text-[9px] text-slate-400">Target unlock timestamp</p>
          </div>
        </div>
      </div>

      {/* Main Split-View: Timeline Memory Map & Decrypted Note Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Memory Allocation Map (Left/Top: 7 columns on desktop) */}
        <div className="lg:col-span-7 bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">
                // CHRONOMETRIC_MEMORY_MAP [365_BLOCKS]
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-[9px] text-slate-400 flex-wrap justify-end">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400 border border-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                [TODAY]
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-950 border border-emerald-500/40" />
                [UNLOCKED]
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-950 border border-amber-500/50" />
                [MILESTONE]
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#020408] border border-emerald-950" />
                [LOCKED]
              </span>
            </div>
          </div>

          {/* Memory Grid Allocation Map */}
          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950/80 overflow-y-auto max-h-[500px]">
            <div className="grid grid-cols-14 sm:grid-cols-18 md:grid-cols-20 lg:grid-cols-15 xl:grid-cols-18 gap-1.5">
              {allDaysList.map(({ dayIndex, note, isUnlocked, isCurrent, isMilestone }) => {
                let cellClass = 'bg-[#020408] text-slate-700 border-emerald-950/40 hover:border-emerald-800';

                if (isCurrent) {
                  cellClass =
                    'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.7)] animate-pulse font-bold scale-105';
                } else if (isMilestone && isUnlocked) {
                  cellClass =
                    'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)] font-bold';
                } else if (isMilestone && !isUnlocked) {
                  cellClass =
                    'bg-amber-950/30 text-amber-700 border-amber-900/40';
                } else if (isUnlocked) {
                  cellClass =
                    'bg-emerald-950/80 text-emerald-400 border-emerald-500/30 hover:border-emerald-400 hover:text-emerald-200';
                }

                const isSelected = (selectedNote?.dayIndex ?? 1) === dayIndex;
                if (isSelected && !isCurrent) {
                  cellClass += ' ring-2 ring-emerald-400 font-bold';
                }

                return (
                  <button
                    key={dayIndex}
                    onClick={() => handleSelectDay(dayIndex)}
                    onMouseEnter={() => setHoveredNote(note || null)}
                    onMouseLeave={() => setHoveredNote(null)}
                    className={`h-7 rounded text-[10px] font-mono border transition-all flex items-center justify-center cursor-pointer relative ${cellClass}`}
                    title={`Day ${dayIndex}: ${note?.title || 'Note Locked'}`}
                  >
                    {dayIndex}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hover Telemetry Footer */}
          <div className="h-6 flex items-center justify-between text-[10px] text-slate-400 px-1">
            {hoveredNote ? (
              <span className="text-cyan-400 truncate">
                &gt; HOVER::DAY_{hoveredNote.dayIndex}: "{hoveredNote.title}" // DATE: {hoveredNote.date}
              </span>
            ) : (
              <span className="text-slate-400">
                &gt; HOVER OVER ANY MEMORY BLOCK TO PREVIEW REGISTER METADATA
              </span>
            )}
            <span className="text-emerald-500 shrink-0">MEMORY_BLOCKS: {totalDays}</span>
          </div>
        </div>

        {/* Note Inspector Panel (Right/Bottom: 5 columns on desktop) */}
        <div className="lg:col-span-5 bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            {/* Decryption Header */}
            <div className="flex items-center justify-between pb-2 border-b border-emerald-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">
                  {isDecrypting
                    ? `[DECRYPTING_DAY_${selectedNote?.dayIndex || simulatedDay}...]`
                    : `[PAYLOAD_DECRYPTED // DAY_${selectedNote?.dayIndex || simulatedDay}]`}
                </span>
              </div>
              <button
                onClick={() => selectedNote && setEditingNote(selectedNote)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#020408] hover:bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>[EDIT_PAYLOAD]</span>
              </button>
            </div>

            {/* Decryption Progress Bar */}
            {isDecrypting && (
              <div className="w-full bg-[#020408] h-1 rounded-full my-2 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-75"
                  style={{ width: `${decryptionProgress}%` }}
                />
              </div>
            )}

            {/* Note Metadata Telemetry */}
            <div className="grid grid-cols-2 gap-2 my-3 text-[10px]">
              <div className="bg-[#020408] p-2 rounded border border-emerald-950">
                <span className="text-slate-400">UNLOCK_SCHEDULE:</span>
                <div className="text-cyan-300 font-bold mt-0.5">
                  {selectedNote?.date || 'SCHEDULED'}
                </div>
              </div>
              <div className="bg-[#020408] p-2 rounded border border-emerald-950">
                <span className="text-slate-400">EMOTIONAL_RESONANCE:</span>
                <div className="text-amber-300 font-bold mt-0.5">
                  {resonanceTelemetry.score}% // {resonanceTelemetry.tone}
                </div>
              </div>
              <div className="bg-[#020408] p-2 rounded border border-emerald-950">
                <span className="text-slate-400">WORD / CHAR COUNT:</span>
                <div className="text-emerald-300 font-bold mt-0.5">
                  {resonanceTelemetry.wordCount} words / {resonanceTelemetry.charCount} chars
                </div>
              </div>
              <div className="bg-[#020408] p-2 rounded border border-emerald-950">
                <span className="text-slate-400">SIMULATION_STATUS:</span>
                <div className="text-cyan-400 font-bold mt-0.5">
                  {(selectedNote?.dayIndex ?? 1) <= simulatedDay ? '[UNLOCKED_LIVE]' : '[CHRONO_LOCKED]'}
                </div>
              </div>
            </div>

            {/* Decrypted Payload Content */}
            <div className="bg-[#020408] p-4 rounded-lg border border-emerald-500/30 space-y-2 overflow-y-auto max-h-[320px]">
              <div className="text-[11px] text-cyan-400 font-bold">
                PAYLOAD::"{selectedNote?.title || 'Untitled Note'}"
              </div>

              {selectedNote?.preview && (
                <div className="p-2 rounded bg-[#050811] text-[11px] text-amber-300/90 italic border border-emerald-950/80">
                  "{selectedNote.preview}"
                </div>
              )}

              <div className="text-xs text-emerald-100 whitespace-pre-wrap leading-relaxed select-text font-mono pt-1">
                {selectedNote?.content || 'No text content decoded for this chronological register.'}
              </div>
            </div>
          </div>

          {/* Quick Navigation Footer Controls */}
          <div className="pt-2 border-t border-emerald-950 flex items-center justify-between text-xs">
            <button
              onClick={() => handleStepDay(-1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950 text-emerald-300 border border-emerald-950 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>[PREV_DAY]</span>
            </button>

            <button
              onClick={handleJumpToToday}
              className="px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-cyan-950 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer text-xs"
            >
              [TODAY]
            </button>

            <button
              onClick={() => handleStepDay(1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950 text-emerald-300 border border-emerald-950 transition-colors cursor-pointer"
            >
              <span>[NEXT_DAY]</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Editor Modal if launched from simulator */}
      {editingNote && (
        <ContentItemEditorModal
          category="notes"
          item={editingNote}
          isOpen={!!editingNote}
          onClose={() => setEditingNote(null)}
          onSaveSuccess={(updated) => {
            setNotes((prev) => prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)));
            if (selectedNote?.id === updated.id) {
              setSelectedNote((prev) => (prev ? { ...prev, ...updated } : null));
            }
          }}
        />
      )}
    </div>
  );
};
