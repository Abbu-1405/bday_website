import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Sparkles,
  ExternalLink,
  Volume2,
  VolumeX,
  Play,
  Pause,
  FileText,
  Code2,
  Layers,
  Info,
} from 'lucide-react';
import { BtsItem } from '../../types';
import { useTheme, useAuth } from '../../hooks';
import {
  recordBtsItemOpen,
  recordBtsVideoPlay,
  recordBtsAudioPlay,
  recordBtsHtmlOpenExternal,
} from '../../services';
import { cn } from '../../utils';
import { CrossFadeImage } from '../CrossFadeImage';

interface BtsViewerModalProps {
  item: BtsItem | null;
  itemsList: BtsItem[];
  onClose: () => void;
  onSelect: (item: BtsItem) => void;
}

export const BtsViewerModal: React.FC<BtsViewerModalProps> = ({
  item,
  itemsList,
  onClose,
  onSelect,
}) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

  const modalRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Track item open event
  useEffect(() => {
    if (item && currentUser) {
      recordBtsItemOpen(item);
    }
  }, [item?.id, currentUser]);

  // Find index in current itemsList
  const currentIndex = item ? itemsList.findIndex((i) => i.id === item.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < itemsList.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      onSelect(itemsList[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onSelect(itemsList[currentIndex + 1]);
    }
  };

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    if (!item) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && hasNext) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item, hasPrev, hasNext, currentIndex]);

  // Reset audio/video state when item changes
  useEffect(() => {
    setIsPlayingAudio(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
  }, [item?.id]);

  if (!item) return null;

  // Format custom date
  const formattedDate = (() => {
    try {
      const parts = item.date.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
      return item.date;
    } catch {
      return item.date;
    }
  })();

  const handleDownload = () => {
    if (item.type === 'html' && item.htmlContent) {
      const blob = new Blob([item.htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (item.path && item.path !== '#') {
      const a = document.createElement('a');
      a.href = item.path;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = item.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleOpenNewWindow = () => {
    if (item.type === 'html' && item.htmlContent) {
      if (currentUser) recordBtsHtmlOpenExternal(item);
      const blob = new Blob([item.htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (item.path && item.path !== '#') {
      window.open(item.path, '_blank', 'noopener,noreferrer');
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      if (currentUser && item) recordBtsAudioPlay(item);
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAudioCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200',
          isLetterArchive
            ? 'bg-[#FAF6F0] border-[#8A6E59]/30 text-[#2C221E] shadow-[0_24px_50px_rgba(60,42,33,0.25)]'
            : isScrapbook
            ? 'bg-[rgba(16,30,20,0.96)] border-[#D8B86A]/30 text-[#F7F1DF] shadow-[0_24px_50px_rgba(0,0,0,0.8)]'
            : 'bg-[rgba(13,23,40,0.96)] border-[#C99B58]/30 text-[#F2E4CF] shadow-[0_24px_50px_rgba(0,0,0,0.85)]'
        )}
      >
        {/* Header Bar */}
        <header className="p-4 sm:p-5 border-b border-current/10 flex items-center justify-between gap-3 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-serif opacity-75">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{formattedDate}</span>
              <span className="opacity-50">•</span>
              <span className="uppercase tracking-wider font-sans font-semibold text-[10px] opacity-90">
                {item.type}
              </span>
              {currentIndex >= 0 && (
                <>
                  <span className="opacity-50">•</span>
                  <span className="font-sans text-[10px] opacity-80">
                    {currentIndex + 1} of {itemsList.length}
                  </span>
                </>
              )}
            </div>
            <h2
              id="bts-modal-title"
              className="text-base sm:text-xl font-serif font-bold tracking-tight truncate"
            >
              {item.title}
            </h2>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {item.downloadable && (
              <button
                type="button"
                onClick={handleDownload}
                title="Download asset"
                aria-label={`Download ${item.title}`}
                className={cn(
                  'p-2 rounded-full border transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-105',
                  isLetterArchive
                    ? 'border-[#8A6E59]/30 text-[#7A2E3B] hover:bg-[#EDE4DC]'
                    : isScrapbook
                    ? 'border-[#D8B86A]/30 text-[#D8B86A] hover:bg-[rgba(216,184,106,0.15)]'
                    : 'border-[#C99B58]/30 text-[#C99B58] hover:bg-[rgba(201,155,88,0.15)]'
                )}
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              title="Close modal (Esc)"
              aria-label="Close Behind The Scenes viewer"
              className={cn(
                'p-2 rounded-full border transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-105',
                isLetterArchive
                  ? 'border-[#8A6E59]/30 text-[#5C4A42] hover:bg-[#EDE4DC]'
                  : isScrapbook
                  ? 'border-[#D8B86A]/30 text-[#F7F1DF] hover:bg-[rgba(216,184,106,0.15)]'
                  : 'border-[#C99B58]/30 text-[#F2E4CF] hover:bg-[rgba(201,155,88,0.15)]'
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Modal Body: Media Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. IMAGE VIEWER */}
          {item.type === 'image' && (
            <div className="relative rounded-xl overflow-hidden bg-black/10 flex items-center justify-center max-h-[55vh] border border-current/10">
              <CrossFadeImage
                src={item.path}
                alt={item.title}
                className="max-h-[55vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          )}

          {/* 2. VIDEO PLAYER */}
          {item.type === 'video' && (
            <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[55vh] border border-current/10">
              <video
                ref={videoRef}
                controls
                playsInline
                preload="metadata"
                poster={item.thumbnail}
                src={item.path}
                onPlay={() => {
                  if (item && currentUser) recordBtsVideoPlay(item);
                }}
                className="max-h-[55vh] w-full object-contain rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* 3. AUDIO PLAYER */}
          {item.type === 'audio' && (
            <div
              className={cn(
                'rounded-2xl p-6 sm:p-8 border space-y-6 flex flex-col items-center justify-center text-center',
                isLetterArchive
                  ? 'bg-[#EDE4DC]/80 border-[#8A6E59]/30'
                  : isScrapbook
                  ? 'bg-[rgba(20,38,25,0.7)] border-[#D8B86A]/30'
                  : 'bg-[rgba(15,26,46,0.7)] border-[#C99B58]/30'
              )}
            >
              <audio
                ref={audioRef}
                src={item.path}
                preload="metadata"
                onTimeUpdate={() => {
                  if (audioRef.current) setAudioCurrentTime(audioRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                  if (audioRef.current) setAudioDuration(audioRef.current.duration);
                }}
                onEnded={() => setIsPlayingAudio(false)}
              />

              {/* Album art / wave icon */}
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-current/20">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  aria-label={isPlayingAudio ? 'Pause audio' : 'Play audio'}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity hover:bg-black/30 cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 ml-1 fill-current" />
                  )}
                </button>
              </div>

              {/* Progress Slider & Time */}
              <div className="w-full max-w-md space-y-2">
                <input
                  type="range"
                  min={0}
                  max={audioDuration || 100}
                  step={0.1}
                  value={audioCurrentTime}
                  onChange={handleAudioSeek}
                  aria-label="Audio progress slider"
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-current"
                />
                <div className="flex justify-between text-xs font-mono opacity-70">
                  <span>{formatTime(audioCurrentTime)}</span>
                  <span>{formatTime(audioDuration)}</span>
                </div>
              </div>

              {/* Mute Button */}
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-serif opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>
            </div>
          )}

          {/* 4. PDF VIEWER */}
          {item.type === 'pdf' && (
            <div
              className={cn(
                'rounded-2xl p-6 border space-y-4 text-center',
                isLetterArchive
                  ? 'bg-[#EDE4DC]/80 border-[#8A6E59]/30'
                  : isScrapbook
                  ? 'bg-[rgba(20,38,25,0.7)] border-[#D8B86A]/30'
                  : 'bg-[rgba(15,26,46,0.7)] border-[#C99B58]/30'
              )}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-current/10 border border-current/20 flex items-center justify-center">
                <FileText className="w-8 h-8 opacity-90" />
              </div>

              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-serif font-bold text-lg">{item.title}</h3>
                <p className="text-xs opacity-75">
                  PDF Design Document & Spec Sheet • {item.fileSize || '1.4 MB'}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenNewWindow}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-serif font-semibold transition-all shadow-sm cursor-pointer',
                    isLetterArchive
                      ? 'bg-[#7A2E3B] text-[#FFF9F0] hover:bg-[#63242F]'
                      : isScrapbook
                      ? 'bg-[#D8B86A] text-[#0A160D] hover:bg-[#C9A859]'
                      : 'bg-[#C99B58] text-[#070E1A] hover:bg-[#B58A47]'
                  )}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Full PDF Document
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-serif border transition-all cursor-pointer opacity-85 hover:opacity-100',
                    isLetterArchive
                      ? 'border-[#8A6E59]/40 text-[#5C4A42] hover:bg-[#FAF6F0]'
                      : isScrapbook
                      ? 'border-[#D8B86A]/40 text-[#D8B86A] hover:bg-[#D8B86A]/10'
                      : 'border-[#C99B58]/40 text-[#C99B58] hover:bg-[#C99B58]/10'
                  )}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
            </div>
          )}

          {/* 5. HTML SANDBOX VIEWER (Strictly sandboxed for security) */}
          {item.type === 'html' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono opacity-80">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Isolated Sandbox Preview (Restricted iframe)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenNewWindow}
                    className="inline-flex items-center gap-1 text-xs font-serif underline opacity-80 hover:opacity-100 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open standalone
                  </button>
                </div>
              </div>

              {/* Sandboxed iframe */}
              <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-current/20 shadow-inner bg-white">
                <iframe
                  title={`Sandbox preview for ${item.title}`}
                  sandbox="allow-scripts"
                  srcDoc={item.htmlContent || '<html><body><p>Preview not available</p></body></html>'}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* Caption & Author Notes */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <h4 className="text-xs font-serif font-semibold tracking-wider uppercase opacity-75">
                Story / Caption
              </h4>
              <p className="text-sm font-serif leading-relaxed opacity-90">{item.caption}</p>
            </div>

            {item.authorNote && (
              <div
                className={cn(
                  'p-3 sm:p-4 rounded-xl border flex items-start gap-2.5 text-xs font-serif leading-relaxed',
                  isLetterArchive
                    ? 'bg-[#EDE4DC]/70 border-[#8A6E59]/25 text-[#5C4A42]'
                    : isScrapbook
                    ? 'bg-[rgba(20,38,25,0.6)] border-[#D8B86A]/25 text-[#D8B86A]'
                    : 'bg-[rgba(15,26,46,0.6)] border-[#C99B58]/25 text-[#C99B58]'
                )}
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Behind The Scenes Note</span>
                  <span className="opacity-90">{item.authorNote}</span>
                </div>
              </div>
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-sans opacity-75',
                      isLetterArchive
                        ? 'bg-[#EDE4DC] text-[#5C4A42]'
                        : isScrapbook
                        ? 'bg-[rgba(27,47,33,0.8)] text-[#B8C0AE]'
                        : 'bg-[rgba(19,34,58,0.8)] text-[#C2AF99]'
                    )}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation Bar: Previous / Next */}
        <footer className="p-3 sm:p-4 border-t border-current/10 flex items-center justify-between gap-3 shrink-0 bg-current/5">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={handlePrev}
            aria-label="Previous BTS item"
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-serif font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
              isLetterArchive
                ? 'hover:bg-[#EDE4DC] text-[#2C221E]'
                : isScrapbook
                ? 'hover:bg-[rgba(79,107,72,0.3)] text-[#F7F1DF]'
                : 'hover:bg-[rgba(201,155,88,0.2)] text-[#F2E4CF]'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-serif opacity-60">
            {currentIndex + 1} / {itemsList.length}
          </span>

          <button
            type="button"
            disabled={!hasNext}
            onClick={handleNext}
            aria-label="Next BTS item"
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-serif font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
              isLetterArchive
                ? 'hover:bg-[#EDE4DC] text-[#2C221E]'
                : isScrapbook
                ? 'hover:bg-[rgba(79,107,72,0.3)] text-[#F7F1DF]'
                : 'hover:bg-[rgba(201,155,88,0.2)] text-[#F2E4CF]'
            )}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </div>
    </div>
  );
};
