import React, { useState, useEffect, useMemo } from 'react';
import {
  Pen,
  Filter,
  Search,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Trash2,
  Calendar,
  User,
  Sparkles,
  Loader2,
  X,
  Download,
  Terminal,
  Crosshair,
  Maximize2,
  SlidersHorizontal,
  FileCode,
} from 'lucide-react';
import { DoodleItem, DoodleSection } from '../../../types/doodle';
import { fetchAdminDoodles, deleteUserDoodle } from '../../../services/doodleService';
import { useAuth } from '../../../hooks';

export const AdminDoodlesDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [doodles, setDoodles] = useState<DoodleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState<'all' | DoodleSection>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoodle, setSelectedDoodle] = useState<DoodleItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Forensic modal view options
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [showGridOverlay, setShowGridOverlay] = useState(true);

  const loadDoodles = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminDoodles(
        sectionFilter === 'all' ? undefined : sectionFilter,
        100
      );
      setDoodles(data);
    } catch (err) {
      console.warn('Error loading admin doodles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoodles();
  }, [sectionFilter]);

  const handleDelete = async (doodle: DoodleItem) => {
    if (!window.confirm(`CONFIRM DESTRUCTION: Purge evidence item "${doodle.title || 'Untitled'}" [UID: ${doodle.userId}]?`)) {
      return;
    }

    setDeletingId(doodle.id);
    try {
      await deleteUserDoodle(doodle.id, doodle.userId);
      setDoodles((prev) => prev.filter((d) => d.id !== doodle.id));
      if (selectedDoodle?.id === doodle.id) {
        setSelectedDoodle(null);
      }
    } catch (err) {
      console.warn('Failed to delete doodle from admin:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportRaw = (doodle: DoodleItem) => {
    if (!doodle.thumbnailDataUrl) return;
    const a = document.createElement('a');
    a.href = doodle.thumbnailDataUrl;
    a.download = `evidence_doodle_${doodle.id.substring(0, 8)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const calculateByteWeight = (dataUrl?: string) => {
    if (!dataUrl) return '0.0 KB';
    const bytes = (dataUrl.length * 3) / 4;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...doodles];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.title?.toLowerCase().includes(term) ||
          d.userDisplayName?.toLowerCase().includes(term) ||
          d.userEmail?.toLowerCase().includes(term) ||
          d.userId.toLowerCase().includes(term) ||
          d.id.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? tB - tA : tA - tB;
    });

    return result;
  }, [doodles, searchTerm, sortOrder]);

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Top Filter & Forensic Status Bar */}
      <div className="bg-[#050811]/90 p-4 sm:p-5 rounded-xl border border-emerald-500/20 space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#020408] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-emerald-400 font-bold tracking-wider">
                  [FORENSIC_INSPECTION // DOODLES_AND_ART]
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  VAULT::ONLINE
                </span>
                <span className="text-[10px] text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  [EVIDENCE_ITEMS: {doodles.length}]
                </span>
              </div>
              <p className="text-[11px] text-emerald-600/90 font-mono mt-0.5">
                // Classified evidence depository for user drawings and graphical submissions.
              </p>
            </div>
          </div>

          <button
            onClick={loadDoodles}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
            <span>{loading ? '[SCANNING...]' : '[REFRESH_INDEX]'}</span>
          </button>
        </div>

        {/* Filters and Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-emerald-950/60">
          {/* Section Filter */}
          <div className="flex items-center gap-2 bg-[#020408] px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs">
            <Filter className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-[10px] text-emerald-600 font-semibold uppercase">TAG:</span>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value as any)}
              className="bg-transparent text-emerald-300 focus:outline-none w-full font-mono cursor-pointer text-xs"
            >
              <option value="all" className="bg-[#050811] text-emerald-300">[ALL_SECTIONS]</option>
              <option value="what-am-i-to-you" className="bg-[#050811] text-emerald-300">[WHAT_AM_I_TO_YOU]</option>
              <option value="your-reflections" className="bg-[#050811] text-emerald-300">[YOUR_REFLECTIONS]</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2 bg-[#020408] px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span className="text-[10px] text-cyan-600 font-semibold uppercase">SORT:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-transparent text-cyan-300 focus:outline-none w-full font-mono cursor-pointer text-xs"
            >
              <option value="newest" className="bg-[#050811] text-cyan-300">[NEWEST_FIRST]</option>
              <option value="oldest" className="bg-[#050811] text-cyan-300">[OLDEST_FIRST]</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 bg-[#020408] px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs">
            <Search className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <input
              type="text"
              placeholder="Search UID, author, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-emerald-200 placeholder:text-emerald-800 focus:outline-none w-full font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Grid of Evidence Cards */}
      {loading ? (
        <div className="text-center py-20 bg-[#050811]/90 rounded-xl border border-emerald-500/20 space-y-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-emerald-400">&gt; BUFFERING_FORENSIC_EVIDENCE_STREAM...</p>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-center py-16 bg-[#050811]/90 rounded-xl border border-emerald-500/20 space-y-2 font-mono">
          <Crosshair className="w-8 h-8 text-emerald-800 mx-auto" />
          <p className="text-xs font-semibold text-emerald-400">&gt; ZERO FORENSIC RECORDS MATCHING QUERY</p>
          <p className="text-[10px] text-slate-400">
            {searchTerm ? 'Adjust filter matrix criteria.' : 'Evidence cache currently unoccupied.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredAndSorted.map((doodle) => {
            const byteSize = calculateByteWeight(doodle.thumbnailDataUrl);

            return (
              <div
                key={doodle.id}
                onClick={() => setSelectedDoodle(doodle)}
                className="group bg-[#050811] hover:bg-[#080d1a] border border-emerald-500/30 hover:border-cyan-400/60 rounded-xl p-3.5 space-y-3 cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between relative overflow-hidden"
              >
                {/* Tech corner ticks */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-400/60 pointer-events-none" />

                {/* Top User Info & Tag Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-200 truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {doodle.userDisplayName || 'ANONYMOUS_AUTHOR'}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono truncate select-all">
                      UID: {doodle.userId ? `${doodle.userId.substring(0, 12)}...` : 'N/A'}
                    </p>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                      doodle.section === 'what-am-i-to-you'
                        ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                        : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {doodle.section === 'what-am-i-to-you' ? 'WHAT_AM_I' : 'REFLECTIONS'}
                  </span>
                </div>

                {/* Thumbnail Frame (Forensic Canvas Frame) */}
                <div className="w-full h-36 bg-[#020408] rounded-lg overflow-hidden flex items-center justify-center border border-emerald-950 group-hover:border-cyan-500/40 relative">
                  {/* Forensic Crosshairs */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                    <div className="w-full h-full border border-dashed border-emerald-500/30 flex items-center justify-center">
                      <div className="w-4 h-4 border border-emerald-400" />
                    </div>
                  </div>

                  {doodle.thumbnailDataUrl ? (
                    <img
                      src={doodle.thumbnailDataUrl}
                      alt={doodle.title || 'Doodle'}
                      className="max-h-full max-w-full object-contain p-2"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Pen className="w-8 h-8 text-emerald-900" />
                  )}

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#020408]/90 border border-cyan-500/40 p-1 rounded text-cyan-300">
                    <Maximize2 className="w-3 h-3" />
                  </div>

                  <div className="absolute bottom-1.5 left-2 text-[8px] font-mono text-emerald-600 bg-[#020408]/80 px-1 rounded border border-emerald-950">
                    512x512 RES // {byteSize}
                  </div>
                </div>

                {/* Title & Forensic Metadata Bottom Row */}
                <div className="space-y-1 pt-1 border-t border-emerald-950/80">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">
                      {doodle.title || 'UNTITLED_DRAWING'}
                    </h4>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleExportRaw(doodle)}
                        className="p-1 rounded bg-[#020408] text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-emerald-950 transition-colors"
                        title="Export raw image artifact"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(doodle)}
                        disabled={deletingId === doodle.id}
                        className="p-1 rounded bg-[#020408] text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-emerald-950 transition-colors"
                        title="Purge evidence artifact"
                      >
                        {deletingId === doodle.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-emerald-600" />
                      {new Date(doodle.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-cyan-400 font-semibold">
                      {doodle.strokes?.length || 0} STROKES
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Forensic Inspection Modal */}
      {selectedDoodle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-fade-in font-mono"
          onClick={() => setSelectedDoodle(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#050811] border border-cyan-500/40 rounded-xl overflow-hidden shadow-2xl space-y-3.5 p-5 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-emerald-950 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-300">
                    /forensics/inspect/item#{selectedDoodle.id.substring(0, 8)}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      selectedDoodle.section === 'what-am-i-to-you'
                        ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                        : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {selectedDoodle.section === 'what-am-i-to-you' ? 'WHAT_AM_I_TO_YOU' : 'YOUR_REFLECTIONS'}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-emerald-200">
                  {selectedDoodle.title || 'UNTITLED_EVIDENCE_ITEM'}
                </h3>
              </div>

              <button
                onClick={() => setSelectedDoodle(null)}
                className="p-1 rounded bg-[#020408] text-slate-400 hover:text-emerald-300 border border-emerald-950 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Author Profile Telemetry */}
            <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div>
                <p className="font-semibold text-emerald-300">
                  OPERATOR: {selectedDoodle.userDisplayName || 'ANONYMOUS_AUTHOR'}
                </p>
                <p className="text-slate-400 font-mono text-[10px] select-all">
                  UID: {selectedDoodle.userId}
                </p>
              </div>

              <div className="text-left sm:text-right font-mono text-[10px] text-slate-400">
                <p>{new Date(selectedDoodle.createdAt).toLocaleString()}</p>
                <p className="text-cyan-400 font-bold">
                  {selectedDoodle.strokes?.length || 0} VECTORS // {calculateByteWeight(selectedDoodle.thumbnailDataUrl)}
                </p>
              </div>
            </div>

            {/* Controls Bar for Forensic Canvas */}
            <div className="flex items-center justify-between text-[10px] text-emerald-500/80 px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGridOverlay(!showGridOverlay)}
                  className={`px-2 py-0.5 rounded border text-[10px] transition-colors ${
                    showGridOverlay
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#020408] text-slate-400 border-emerald-950'
                  }`}
                >
                  [GRID_RETICLE: {showGridOverlay ? 'ON' : 'OFF'}]
                </button>
                <button
                  type="button"
                  onClick={() => setHighContrastMode(!highContrastMode)}
                  className={`px-2 py-0.5 rounded border text-[10px] transition-colors ${
                    highContrastMode
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                      : 'bg-[#020408] text-slate-400 border-emerald-950'
                  }`}
                >
                  [CONTRAST: {highContrastMode ? 'INVERT' : 'NORMAL'}]
                </button>
              </div>

              <span className="text-slate-400 font-mono">OPTICAL_ZOOM: 100%</span>
            </div>

            {/* Drawing Preview Area (High-Contrast Forensic Terminal Frame) */}
            <div
              className={`w-full h-72 rounded-lg border border-emerald-500/30 flex items-center justify-center overflow-hidden relative ${
                highContrastMode ? 'bg-white invert' : 'bg-[#020408]'
              }`}
            >
              {/* Optional reticle overlay */}
              {showGridOverlay && (
                <div className="absolute inset-0 pointer-events-none border border-emerald-500/20">
                  <div className="w-full h-1/2 border-b border-dashed border-emerald-500/20" />
                  <div className="h-full w-1/2 border-r border-dashed border-emerald-500/20 absolute top-0 left-0" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-emerald-400/40 rounded-full" />
                </div>
              )}

              {selectedDoodle.thumbnailDataUrl ? (
                <img
                  src={selectedDoodle.thumbnailDataUrl}
                  alt={selectedDoodle.title || 'Doodle'}
                  className="max-h-full max-w-full object-contain p-4 relative z-10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Pen className="w-12 h-12 text-emerald-800" />
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-emerald-950">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportRaw(selectedDoodle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>[EXPORT_PNG]</span>
                </button>

                <button
                  onClick={() => handleDelete(selectedDoodle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-rose-950/40 text-rose-300 border border-rose-500/40 text-xs font-mono transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>[PURGE_EVIDENCE]</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedDoodle(null)}
                className="px-4 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-colors"
              >
                [DISMISS]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
