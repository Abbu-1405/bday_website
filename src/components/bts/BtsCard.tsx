import React from 'react';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  FileText,
  Code2,
  Download,
  Play,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { BtsItem } from '../../types';
import { useTheme } from '../../hooks';
import { cn } from '../../utils';

interface BtsCardProps {
  item: BtsItem;
  onOpen: (item: BtsItem) => void;
  index: number;
}

export const BtsCard: React.FC<BtsCardProps> = ({ item, onOpen, index }) => {
  const { theme } = useTheme();
  const isLetterArchive = theme === 'letter-archive';
  const isScrapbook = theme === 'whimsical-scrapbook';

  const getTypeIcon = () => {
    switch (item.type) {
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5" />;
      case 'video':
        return <VideoIcon className="w-3.5 h-3.5" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5" />;
      case 'pdf':
        return <FileText className="w-3.5 h-3.5" />;
      case 'html':
        return <Code2 className="w-3.5 h-3.5" />;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'image':
        return 'Photo';
      case 'video':
        return 'Video Outtake';
      case 'audio':
        return 'Audio Memo';
      case 'pdf':
        return 'Design Doc';
      case 'html':
        return 'HTML Prototype';
    }
  };

  // Format custom date
  const formattedDate = (() => {
    try {
      const parts = item.date.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return item.date;
    } catch {
      return item.date;
    }
  })();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    } else {
      onOpen(item);
    }
  };

  return (
    <article
      onClick={() => onOpen(item)}
      tabIndex={0}
      role="button"
      aria-label={`View BTS item: ${item.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(item);
        }
      }}
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2',
        isLetterArchive
          ? 'bg-[#FAF6F0] border-[#8A6E59]/25 hover:border-[#7A2E3B]/40 hover:shadow-[0_12px_28px_-6px_rgba(60,42,33,0.16)] text-[#2C221E]'
          : isScrapbook
          ? 'bg-[rgba(16,30,20,0.85)] border-[#D8B86A]/25 hover:border-[#D8B86A]/50 hover:shadow-[0_12px_28px_rgba(0,0,0,0.6)] text-[#F7F1DF]'
          : 'bg-[rgba(13,23,40,0.85)] border-[#C99B58]/25 hover:border-[#C99B58]/50 hover:shadow-[0_12px_28px_rgba(0,0,0,0.7)] text-[#F2E4CF]'
      )}
    >
      {/* Decorative "BTS Tape" subtle accent in top right */}
      <div
        className={cn(
          'absolute top-2 right-2 z-10 px-2 py-0.5 rounded text-[10px] font-sans font-bold tracking-wider uppercase backdrop-blur-xs border shadow-2xs transition-transform group-hover:scale-105',
          isLetterArchive
            ? 'bg-[#EDE4DC]/90 text-[#7A2E3B] border-[#8A6E59]/30'
            : isScrapbook
            ? 'bg-[rgba(27,47,33,0.9)] text-[#D8B86A] border-[#D8B86A]/30'
            : 'bg-[rgba(19,34,58,0.9)] text-[#C99B58] border-[#C99B58]/30'
        )}
      >
        BTS
      </div>

      {/* Visual Thumbnail Frame */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-black/10">
        <img
          src={item.thumbnail}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Video Play Overlay */}
        {item.type === 'video' && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-3xs group-hover:bg-black/20 transition-colors">
            <div className="w-11 h-11 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            </div>
            {item.duration && (
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                {item.duration}
              </span>
            )}
          </div>
        )}

        {/* Audio Overlay Badge */}
        {item.type === 'audio' && (
          <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center text-white/90 gap-1.5 backdrop-blur-3xs group-hover:bg-black/25 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center backdrop-blur-sm shadow-md group-hover:scale-105 transition-transform">
              <Music className="w-5 h-5" />
            </div>
            {item.duration && (
              <span className="px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-mono tracking-wider">
                VOICE MEMO • {item.duration}
              </span>
            )}
          </div>
        )}

        {/* PDF Overlay Badge */}
        {item.type === 'pdf' && (
          <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center text-white/90 gap-1 backdrop-blur-3xs group-hover:bg-black/25 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center backdrop-blur-sm shadow-md group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-sans tracking-wide">
              DOCUMENT • PDF
            </span>
          </div>
        )}

        {/* HTML Prototype Badge */}
        {item.type === 'html' && (
          <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center text-white/90 gap-1 backdrop-blur-3xs group-hover:bg-black/25 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center backdrop-blur-sm shadow-md group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-mono tracking-wide">
              HTML LAB SANDBOX
            </span>
          </div>
        )}

        {/* Type pill in bottom left of image */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-serif font-medium bg-black/60 text-white backdrop-blur-xs">
          {getTypeIcon()}
          <span>{getTypeLabel()}</span>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Custom Date Stamp */}
          <div className="flex items-center gap-1.5 text-[11px] font-serif opacity-75">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
            {item.fileSize && (
              <>
                <span>•</span>
                <span className="font-sans text-[10px] opacity-80">{item.fileSize}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif font-semibold text-sm sm:text-base leading-snug line-clamp-1 group-hover:underline underline-offset-2">
            {item.title}
          </h3>

          {/* Caption */}
          <p className="text-xs font-serif opacity-80 line-clamp-2 leading-relaxed">
            {item.caption}
          </p>
        </div>

        {/* Tags & Action Row */}
        <div className="pt-2 border-t border-current/10 flex items-center justify-between gap-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-1 items-center overflow-hidden">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-sans font-medium opacity-70',
                  isLetterArchive
                    ? 'bg-[#EDE4DC] text-[#5C4A42]'
                    : isScrapbook
                    ? 'bg-[rgba(27,47,33,0.7)] text-[#B8C0AE]'
                    : 'bg-[rgba(19,34,58,0.7)] text-[#C2AF99]'
                )}
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-[10px] opacity-60 font-sans">+{item.tags.length - 2}</span>
            )}
          </div>

          {/* Download button */}
          {item.downloadable && (
            <button
              type="button"
              onClick={handleDownload}
              title="Download asset"
              aria-label={`Download ${item.title}`}
              className={cn(
                'p-1.5 rounded-full opacity-70 hover:opacity-100 transition-all hover:scale-110 cursor-pointer',
                isLetterArchive
                  ? 'hover:bg-[#EDE4DC] text-[#7A2E3B]'
                  : isScrapbook
                  ? 'hover:bg-[rgba(216,184,106,0.2)] text-[#D8B86A]'
                  : 'hover:bg-[rgba(201,155,88,0.2)] text-[#C99B58]'
              )}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
