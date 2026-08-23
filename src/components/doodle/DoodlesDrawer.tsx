import React, { useState, useEffect } from 'react';
import {
  Pen,
  X,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { DoodleItem, DoodleSection } from '../../types/doodle';
import { fetchUserDoodles, deleteUserDoodle } from '../../services/doodleService';
import { useAuth, useTheme } from '../../hooks';

interface DoodlesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  section: DoodleSection;
  onSelectDoodle: (doodle: DoodleItem) => void;
  onNewDoodle: () => void;
}

export const DoodlesDrawer: React.FC<DoodlesDrawerProps> = ({
  isOpen,
  onClose,
  section,
  onSelectDoodle,
  onNewDoodle,
}) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [doodles, setDoodles] = useState<DoodleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDoodles = async () => {
    setLoading(true);
    try {
      const items = await fetchUserDoodles(currentUser?.uid, section);
      setDoodles(items);
    } catch (err) {
      console.warn('Failed to load user doodles in drawer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDoodles();
    }
  }, [isOpen, currentUser?.uid, section]);

  const handleDelete = async (e: React.MouseEvent, doodleId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this doodle?')) return;

    setDeletingId(doodleId);
    try {
      await deleteUserDoodle(doodleId, currentUser?.uid);
      setDoodles((prev) => prev.filter((d) => d.id !== doodleId));
    } catch (err) {
      console.warn('Failed to delete doodle:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doodles-drawer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden animate-fadeIn"
        style={{
          backgroundColor: '#172033',
          borderColor: 'rgba(197, 154, 82, 0.3)',
          boxShadow: '0 20px 50px -10px rgba(13, 20, 34, 0.9), 0 0 30px rgba(197, 154, 82, 0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header
          className="flex items-center justify-between px-5 sm:px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'rgba(197, 154, 82, 0.2)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs"
              style={{
                backgroundColor: 'rgba(197, 154, 82, 0.12)',
                borderColor: 'rgba(197, 154, 82, 0.4)',
                color: '#C59A52',
              }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="doodles-drawer-title"
                className="text-base sm:text-lg font-serif font-medium tracking-tight"
                style={{ color: '#F2E8D2' }}
              >
                Your Saved Doodles
              </h2>
              <p className="text-[11px] font-serif italic" style={{ color: '#9F927F' }}>
                {section === 'what-am-i-to-you' ? 'What Am I To You' : 'Your Reflections'} • {doodles.length} saved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNewDoodle}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif shadow-xs transition-all cursor-pointer hover:brightness-110"
              style={{
                backgroundColor: '#6E3E42',
                color: '#F2E8D2',
                border: '1px solid #9F7A3D',
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Doodle</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#9F927F] hover:text-[#F2E8D2] transition-colors cursor-pointer"
              aria-label="Close doodle gallery"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="text-center py-16 space-y-3">
              <Loader2 className="h-6 w-6 text-[#C59A52] animate-spin mx-auto" />
              <p className="text-xs font-serif italic text-[#CDBFA8]">
                Gathering your drawings...
              </p>
            </div>
          ) : doodles.length === 0 ? (
            <div
              className="text-center py-12 px-6 rounded-2xl border space-y-3"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderColor: 'rgba(197, 154, 82, 0.15)',
              }}
            >
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center border"
                style={{
                  backgroundColor: 'rgba(197, 154, 82, 0.1)',
                  borderColor: '#C59A52',
                }}
              >
                <Pen className="h-5 w-5 text-[#C59A52]" />
              </div>
              <p className="text-sm font-serif font-medium" style={{ color: '#F2E8D2' }}>
                No doodles saved for this section yet.
              </p>
              <p className="text-xs font-serif italic max-w-sm mx-auto" style={{ color: '#9F927F' }}>
                Open the drawing desk anytime to leave hand-drawn feelings and quiet sketches.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNewDoodle}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-serif font-medium shadow-md transition-all cursor-pointer hover:brightness-110"
                  style={{
                    backgroundColor: '#6E3E42',
                    color: '#F2E8D2',
                    border: '1px solid #9F7A3D',
                  }}
                >
                  <Pen className="w-3.5 h-3.5" />
                  <span>Start a Doodle</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doodles.map((doodle) => (
                <div
                  key={doodle.id}
                  onClick={() => onSelectDoodle(doodle)}
                  className="group relative rounded-2xl border p-3.5 space-y-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-[#C59A52] shadow-sm"
                  style={{
                    backgroundColor: '#151c2e',
                    borderColor: 'rgba(197, 154, 82, 0.25)',
                  }}
                >
                  {/* Thumbnail Container */}
                  <div
                    className="w-full h-32 rounded-xl overflow-hidden flex items-center justify-center border relative"
                    style={{
                      backgroundColor:
                        theme === 'midnight-journal'
                          ? '#0a0e1a'
                          : theme === 'whimsical-scrapbook'
                          ? '#06130b'
                          : '#F6EFE3',
                      borderColor: 'rgba(197, 154, 82, 0.15)',
                    }}
                  >
                    {doodle.thumbnailDataUrl ? (
                      <img
                        src={doodle.thumbnailDataUrl}
                        alt={doodle.title || 'Doodle preview'}
                        className="max-h-full max-w-full object-contain p-1"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Pen className="w-8 h-8 text-[#9F927F] opacity-40" />
                    )}

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs p-1 rounded-md text-[#F2E8D2]">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className="text-xs sm:text-sm font-serif font-medium truncate"
                        style={{ color: '#F2E8D2' }}
                      >
                        {doodle.title || 'Untitled Doodle'}
                      </h3>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, doodle.id)}
                        disabled={deletingId === doodle.id}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                        title="Delete doodle"
                        aria-label="Delete doodle"
                      >
                        {deletingId === doodle.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-serif" style={{ color: '#9F927F' }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#C59A52]" />
                        {new Date(doodle.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="italic">
                        {doodle.strokes?.length || 0} strokes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
