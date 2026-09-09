import React, { useState, useEffect } from 'react';
import { Download, X, FileText, CheckCircle2, ShieldCheck, Filter } from 'lucide-react';
import { TrackedUserOverview } from '../../../types/tracking';
import { exportUsersToCsv } from '../../../utils/csvExport';

interface ExportUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: TrackedUserOverview[];
  filteredUsers: TrackedUserOverview[];
  filterActive: boolean;
  onExportSuccess?: (filename: string, count: number) => void;
}

export const ExportUsersModal: React.FC<ExportUsersModalProps> = ({
  isOpen,
  onClose,
  allUsers,
  filteredUsers,
  filterActive,
  onExportSuccess,
}) => {
  const [exportScope, setExportScope] = useState<'filtered' | 'all'>(
    filterActive ? 'filtered' : 'all'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Sync default selection when filter state changes
  useEffect(() => {
    if (filterActive) {
      setExportScope('filtered');
    } else {
      setExportScope('all');
    }
    setExportComplete(false);
  }, [filterActive, isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetUsers = exportScope === 'filtered' ? filteredUsers : allUsers;

  const handleExport = () => {
    setIsExporting(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const scopeSuffix = exportScope === 'filtered' ? 'filtered' : 'all';
      const filename = `starlit-letters-users-${scopeSuffix}-${dateStr}.csv`;

      const result = exportUsersToCsv(targetUsers, { filename });
      setIsExporting(false);
      setExportComplete(true);

      if (onExportSuccess) {
        onExportSuccess(result.filename, result.count);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('CSV Export error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono"
    >
      <div className="bg-[#0a0d12] border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/90 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 id="export-modal-title" className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                EXPORT PLATFORM USER REGISTRY
              </h3>
              <p className="text-[11px] text-zinc-400">
                Compliance &amp; manual reporting CSV generator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
            aria-label="Close export dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Scope Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              1. Select Export Scope
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option: All Users */}
              <button
                type="button"
                onClick={() => setExportScope('all')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  exportScope === 'all'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_-2px_rgba(16,185,129,0.2)]'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-zinc-200">ALL USERS</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                    {allUsers.length} NODES
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Export complete historical directory of all platform users.
                </p>
              </button>

              {/* Option: Filtered Users */}
              <button
                type="button"
                disabled={!filterActive || filteredUsers.length === 0}
                onClick={() => setExportScope('filtered')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  !filterActive || filteredUsers.length === 0
                    ? 'opacity-40 cursor-not-allowed bg-zinc-950/30 border-zinc-900 text-zinc-600'
                    : exportScope === 'filtered'
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_-2px_rgba(6,182,212,0.2)]'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-zinc-200">FILTERED VIEW</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                    {filteredUsers.length} NODES
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  {filterActive
                    ? 'Export only users matching current search/filter.'
                    : 'Apply a search or filter to enable.'}
                </p>
              </button>
            </div>
          </div>

          {/* Compliance & Security Details */}
          <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-300 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>COMPLIANCE &amp; EXPORT STANDARDS</span>
            </div>
            <ul className="text-[10px] text-zinc-400 space-y-1 pl-1 list-disc list-inside">
              <li>RFC 4180 CSV compliant with UTF-8 Byte Order Mark (BOM).</li>
              <li>Formula injection sanitization active for spreadsheet safety.</li>
              <li>Includes 24 audit fields: UID, roles, timestamps, device category, browser, OS, and content counters.</li>
            </ul>
          </div>

          {/* Summary Readout */}
          <div className="flex items-center justify-between text-[11px] px-1 pt-1 text-zinc-400">
            <span>READY TO EXPORT:</span>
            <span className="text-emerald-400 font-bold">
              {targetUsers.length} RECORD{targetUsers.length === 1 ? '' : 'S'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-zinc-800/90 bg-zinc-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
          >
            [ CANCEL ]
          </button>
          <button
            type="button"
            id="btn-confirm-export-csv"
            disabled={targetUsers.length === 0 || isExporting}
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs transition-all disabled:opacity-50 active:scale-95 shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]"
          >
            {exportComplete ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>DOWNLOADED!</span>
              </>
            ) : isExporting ? (
              <>
                <FileText className="w-3.5 h-3.5 animate-pulse" />
                <span>EXPORTING...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>GENERATE CSV</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
