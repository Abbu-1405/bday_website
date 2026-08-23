import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  FileText,
  ExternalLink,
  FileCheck,
  Download,
  Eye,
  Loader2,
  Check,
} from 'lucide-react';
import { NoteMediaItem } from '../../types';
import { cn } from '../../utils';
import { Button } from '../Button';
import { useAudio } from '../../contexts';

export interface NoteMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  media?: NoteMediaItem; // Legacy single item prop
  item?: NoteMediaItem; // Single item prop
  items?: NoteMediaItem[]; // Multiple items array
  noteDate?: string; // ISO date YYYY-MM-DD
}

export interface DownloadMediaOptions {
  src: string;
  filename: string;
  mediaType: string;
}

/**
 * Isolated media downloader utility.
 * Triggers safe browser downloads with fallback handling.
 */
export async function downloadMediaFile(
  options: DownloadMediaOptions
): Promise<boolean> {
  const { src, filename, mediaType } = options;

  if (!src || src === '#') {
    // For local mock placeholder files, generate a downloadable text/data blob
    const placeholderBlob = new Blob(
      [`Starlit Letters Note Attachment (${mediaType.toUpperCase()}):\nFilename: ${filename}\nNote Date: ${filename.split('-')[2] || 'Archive'}`],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(placeholderBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.includes('.') ? filename : `${filename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  try {
    const response = await fetch(src);
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    // Fallback if CORS or network blocks blob fetching
    const link = document.createElement('a');
    link.href = src;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
}

function getFilenameForMedia(
  item: NoteMediaItem,
  noteDate?: string,
  index = 0
): string {
  const datePrefix = noteDate
    ? `starlit-letters-${noteDate}`
    : 'starlit-letters-note';
  const defaultExtMap: Record<string, string> = {
    image: '.jpg',
    video: '.mp4',
    audio: '.mp3',
    document: '.pdf',
  };

  let ext = defaultExtMap[item.type] || '';
  const src = item.src || item.url || '';

  if (src && !src.startsWith('data:') && src !== '#') {
    const cleanSrc = src.split('?')[0].split('#')[0];
    const match = cleanSrc.match(
      /\.(jpg|jpeg|png|webp|gif|mp4|webm|mp3|wav|ogg|pdf|doc|docx)$/i
    );
    if (match) {
      ext = match[0].toLowerCase();
    }
  }

  const titleSlug = item.title
    ? item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 30)
    : '';

  const indexSuffix = index > 0 ? `-item-${index + 1}` : '';
  const namePart = titleSlug
    ? `-${titleSlug}`
    : `-${item.type}${indexSuffix}`;

  return `${datePrefix}${namePart}${ext}`;
}

const DownloadButton: React.FC<{
  src?: string;
  filename: string;
  mediaType: string;
  label?: string;
}> = ({ src, filename, mediaType, label = 'Download' }) => {
  const [status, setStatus] = useState<'idle' | 'downloading' | 'completed'>(
    'idle'
  );

  const handleDownload = async () => {
    if (status === 'downloading') return;
    setStatus('downloading');

    try {
      await downloadMediaFile({ src: src || '#', filename, mediaType });
      setStatus('completed');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('idle');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={status === 'downloading'}
      leftIcon={
        status === 'downloading' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-primary)]" />
        ) : status === 'completed' ? (
          <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )
      }
      className="text-xs shrink-0"
      aria-label={`${label} ${filename}`}
    >
      {status === 'downloading'
        ? 'Downloading...'
        : status === 'completed'
        ? 'Downloaded'
        : label}
    </Button>
  );
};

export const NoteMedia: React.FC<NoteMediaProps> = ({
  className,
  media,
  item,
  items,
  noteDate,
  ...props
}) => {
  const { duckAudio, unduckAudio } = useAudio();

  // Collect all media items to render
  const mediaList: NoteMediaItem[] = [];

  if (items && items.length > 0) {
    mediaList.push(...items.filter((i) => i.type !== 'none'));
  } else {
    const single = item || media;
    if (single && single.type !== 'none') {
      mediaList.push(single);
    }
  }

  if (mediaList.length === 0) {
    return null;
  }

  const renderImage = (mediaItem: NoteMediaItem, index: number) => {
    const imageSrc = mediaItem.src || mediaItem.url;
    const title = mediaItem.title || mediaItem.caption;
    const altText = title || mediaItem.description || 'Note image attachment';
    const filename = getFilenameForMedia(mediaItem, noteDate, index);

    return (
      <div className="space-y-2">
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-[var(--color-surface-secondary)]">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={altText}
              loading="lazy"
              className="w-full h-auto max-h-[480px] object-cover rounded-[var(--radius-md)] transition-transform hover:scale-[1.01]"
            />
          ) : (
            <div className="p-8 text-center text-xs text-[var(--color-muted)] flex flex-col items-center gap-2">
              <ImageIcon className="h-8 w-8 text-[var(--color-primary)] opacity-70" />
              <span>Image attachment unavailable</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          {title || mediaItem.description ? (
            <div className="space-y-0.5 min-w-0 flex-1">
              {title && (
                <p className="text-xs font-semibold text-[var(--color-text)] truncate">
                  {title}
                </p>
              )}
              {mediaItem.description && (
                <p className="text-xs text-[var(--color-text-secondary)] italic truncate">
                  {mediaItem.description}
                </p>
              )}
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 shrink-0">
            {imageSrc && imageSrc !== '#' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open(imageSrc, '_blank', 'noopener,noreferrer')
                }
                leftIcon={<Eye className="h-3.5 w-3.5" />}
                className="text-xs"
                aria-label="View Image in full size"
              >
                View Image
              </Button>
            )}

            <DownloadButton
              src={imageSrc}
              filename={filename}
              mediaType="image"
              label="Download"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderVideo = (mediaItem: NoteMediaItem, index: number) => {
    const videoSrc = mediaItem.src || mediaItem.url;
    const title = mediaItem.title || mediaItem.caption;
    const filename = getFilenameForMedia(mediaItem, noteDate, index);

    return (
      <div className="space-y-2">
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-black">
          {videoSrc ? (
            <video
              controls
              playsInline
              preload="metadata"
              poster={mediaItem.thumbnail}
              onPlay={duckAudio}
              onPause={unduckAudio}
              onEnded={unduckAudio}
              className="w-full max-h-[460px] aspect-video object-contain rounded-[var(--radius-md)]"
            >
              <source src={videoSrc} />
              Your browser does not support HTML5 video playback.
            </video>
          ) : (
            <div className="p-8 text-center text-xs text-[var(--color-muted)] flex flex-col items-center gap-2 bg-[var(--color-surface-secondary)]">
              <VideoIcon className="h-8 w-8 text-[var(--color-secondary)] opacity-70" />
              <span>Video attachment unavailable</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          {title || mediaItem.description ? (
            <div className="space-y-0.5 min-w-0 flex-1">
              {title && (
                <p className="text-xs font-semibold text-[var(--color-text)] truncate">
                  {title}
                </p>
              )}
              {mediaItem.description && (
                <p className="text-xs text-[var(--color-text-secondary)] italic truncate">
                  {mediaItem.description}
                </p>
              )}
            </div>
          ) : (
            <div />
          )}

          <DownloadButton
            src={videoSrc}
            filename={filename}
            mediaType="video"
            label="Download Video"
          />
        </div>
      </div>
    );
  };

  const renderAudio = (mediaItem: NoteMediaItem, index: number) => {
    const audioSrc = mediaItem.src || mediaItem.url;
    const title = mediaItem.title || mediaItem.caption || 'Audio Note';
    const filename = getFilenameForMedia(mediaItem, noteDate, index);

    return (
      <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] shrink-0 text-[var(--color-accent)]">
              <MusicIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                Audio Recording
              </h4>
              <p className="text-sm font-medium text-[var(--color-text)] truncate">
                {title}
              </p>
              {mediaItem.description && (
                <p className="text-xs text-[var(--color-text-secondary)] italic truncate">
                  {mediaItem.description}
                </p>
              )}
            </div>
          </div>

          <DownloadButton
            src={audioSrc}
            filename={filename}
            mediaType="audio"
            label="Download Audio"
          />
        </div>

        {audioSrc ? (
          <audio
            controls
            preload="metadata"
            onPlay={duckAudio}
            onPause={unduckAudio}
            onEnded={unduckAudio}
            className="w-full h-10 accent-[var(--color-primary)] focus:outline-none"
          >
            <source src={audioSrc} />
            Your browser does not support audio playback.
          </audio>
        ) : (
          <p className="text-xs text-[var(--color-muted)] italic">
            Audio file unavailable.
          </p>
        )}
      </div>
    );
  };

  const DocumentCard: React.FC<{
    mediaItem: NoteMediaItem;
    index: number;
  }> = ({ mediaItem, index }) => {
    const docSrc = mediaItem.src || mediaItem.url;
    const title =
      mediaItem.title || mediaItem.caption || 'Attached Document';
    const description = mediaItem.description || 'Document File';
    const filename = getFilenameForMedia(mediaItem, noteDate, index);
    const [docOpened, setDocOpened] = useState(false);

    const handleOpenDoc = () => {
      setDocOpened(true);
      if (docSrc && docSrc !== '#') {
        window.open(docSrc, '_blank', 'noopener,noreferrer');
      }
      setTimeout(() => setDocOpened(false), 3000);
    };

    return (
      <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between flex-wrap gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2.5 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] shrink-0 text-[var(--color-warning)]">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Document
            </h4>
            <p className="text-sm font-medium text-[var(--color-text)] truncate">
              {title}
            </p>
            {description && (
              <p className="text-xs text-[var(--color-text-secondary)] truncate">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenDoc}
            leftIcon={
              docOpened ? (
                <FileCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5" />
              )
            }
            className="text-xs"
          >
            {docOpened ? 'Opened' : 'View Document'}
          </Button>

          <DownloadButton
            src={docSrc}
            filename={filename}
            mediaType="document"
            label="Download"
          />
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-4 my-4', className)} {...props}>
      {mediaList.map((mediaItem, index) => {
        const key =
          mediaItem.id || `media-${mediaItem.type}-${index}`;
        switch (mediaItem.type) {
          case 'image':
            return (
              <React.Fragment key={key}>
                {renderImage(mediaItem, index)}
              </React.Fragment>
            );
          case 'video':
            return (
              <React.Fragment key={key}>
                {renderVideo(mediaItem, index)}
              </React.Fragment>
            );
          case 'audio':
            return (
              <React.Fragment key={key}>
                {renderAudio(mediaItem, index)}
              </React.Fragment>
            );
          case 'document':
            return (
              <DocumentCard key={key} mediaItem={mediaItem} index={index} />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

